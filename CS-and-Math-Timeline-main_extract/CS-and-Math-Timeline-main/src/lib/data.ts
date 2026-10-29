import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import type { RoadmapNode } from './types';
import { seedData } from './seed-data';

// Convert seed data to RoadmapNode format for local fallback
function seedToNodes(): RoadmapNode[] {
  return seedData.map((s) => ({
    id: s.id,
    track: s.track,
    time_block: s.time_block as RoadmapNode['time_block'],
    parent_id: s.parent_id,
    title: s.title,
    resource_link: s.resource_link,
    how_to_learn: s.how_to_learn,
    notes: '',
    is_completed: false,
    sort_order: s.sort_order,
  }));
}

// Sync database with seed data if there is a mismatch, preserving notes/completion
async function syncDatabaseWithSeed(dbNodes: RoadmapNode[]): Promise<RoadmapNode[]> {
  if (!supabase) return dbNodes;

  const seedNodes = seedToNodes();

  // Check if there is a mismatch
  const dbMap = new Map(dbNodes.map((n) => [n.id, n]));
  const seedMap = new Map(seedNodes.map((n) => [n.id, n]));

  let needsSync = false;

  // 1. Check if any node in seed data is missing or has different metadata
  for (const seedNode of seedNodes) {
    const dbNode = dbMap.get(seedNode.id);
    if (!dbNode) {
      needsSync = true;
      break;
    }
    if (
      dbNode.title !== seedNode.title ||
      dbNode.track !== seedNode.track ||
      dbNode.time_block !== seedNode.time_block ||
      dbNode.parent_id !== seedNode.parent_id ||
      dbNode.resource_link !== seedNode.resource_link ||
      dbNode.how_to_learn !== seedNode.how_to_learn ||
      dbNode.sort_order !== seedNode.sort_order
    ) {
      needsSync = true;
      break;
    }
  }

  // 2. Check if there are any obsolete nodes in the database
  if (!needsSync) {
    for (const dbNode of dbNodes) {
      if (!seedMap.has(dbNode.id)) {
        needsSync = true;
        break;
      }
    }
  }

  if (!needsSync) {
    return dbNodes;
  }

  console.log('Database out of sync with seed data. Syncing...');

  // Prepare nodes to upsert, preserving completion and notes
  const toUpsert: RoadmapNode[] = seedNodes.map((seedNode) => {
    const dbNode = dbMap.get(seedNode.id);
    return {
      ...seedNode,
      is_completed: dbNode ? dbNode.is_completed : false,
      notes: dbNode ? dbNode.notes : '',
    };
  });

  // Identify nodes to delete
  const toDeleteIds = dbNodes
    .filter((dbNode) => !seedMap.has(dbNode.id))
    .map((dbNode) => dbNode.id);

  try {
    // 1. Delete obsolete nodes first
    if (toDeleteIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('roadmap_nodes')
        .delete()
        .in('id', toDeleteIds);
      if (deleteError) throw deleteError;
    }

    // 2. Upsert parents first, then children to satisfy foreign key constraints
    const parents = toUpsert.filter((n) => !n.parent_id);
    const children = toUpsert.filter((n) => n.parent_id);

    const batchSize = 50;

    // Upsert parents in batches
    for (let i = 0; i < parents.length; i += batchSize) {
      const batch = parents.slice(i, i + batchSize);
      const { error: upsertError } = await supabase.from('roadmap_nodes').upsert(batch);
      if (upsertError) throw upsertError;
    }

    // Upsert children in batches
    for (let i = 0; i < children.length; i += batchSize) {
      const batch = children.slice(i, i + batchSize);
      const { error: upsertError } = await supabase.from('roadmap_nodes').upsert(batch);
      if (upsertError) throw upsertError;
    }

    // Fetch the updated nodes from the database
    const { data: updatedData, error: fetchError } = await supabase
      .from('roadmap_nodes')
      .select('*')
      .order('sort_order', { ascending: true });

    if (fetchError) throw fetchError;
    console.log('Database synced successfully with seed data!');
    return (updatedData as RoadmapNode[]) || toUpsert;
  } catch (e) {
    console.error('Sync failed:', e);
    return toUpsert;
  }
}

export function useRoadmapData() {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(!!supabase);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Seed the database with initial data
  const seedDatabase = async () => {
    if (!supabase) return;
    const syncedData = await syncDatabaseWithSeed([]);
    setNodes(syncedData);
  };

  // Fetch all nodes from Supabase (or use local seed data)
  const fetchNodes = useCallback(async () => {
    setLoading(true);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('roadmap_nodes')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const syncedData = await syncDatabaseWithSeed(data as RoadmapNode[]);
          setNodes(syncedData);
          setIsOnline(true);
        } else {
          // Table exists but is empty — seed it
          await seedDatabase();
        }
      } catch {
        console.warn('Supabase unavailable, using local data');
        setNodes(seedToNodes());
        setIsOnline(false);
      }
    } else {
      setNodes(seedToNodes());
      setIsOnline(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNodes();
  }, [fetchNodes]);

  // Update a single node's completion status
  const updateNodeCompletion = useCallback(
    async (nodeId: string, isCompleted: boolean) => {
      // Optimistic update
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, is_completed: isCompleted } : n))
      );

      // Persist to Supabase
      if (supabase && isOnline) {
        const { error } = await supabase
          .from('roadmap_nodes')
          .update({ is_completed: isCompleted })
          .eq('id', nodeId);
        if (error) console.error('Update error:', error);
      }
    },
    [isOnline]
  );

  // Batch update multiple nodes' completion status
  const batchUpdateCompletion = useCallback(
    async (updates: { id: string; is_completed: boolean }[]) => {
      // Optimistic update
      setNodes((prev) => {
        const updateMap = new Map(updates.map((u) => [u.id, u.is_completed]));
        return prev.map((n) =>
          updateMap.has(n.id) ? { ...n, is_completed: updateMap.get(n.id)! } : n
        );
      });

      // Single upsert for all updates instead of N sequential calls
      if (supabase && isOnline) {
        const rows = updates.map(({ id, is_completed }) => ({ id, is_completed }));
        const { error } = await supabase.from('roadmap_nodes').upsert(rows, { onConflict: 'id' });
        if (error) console.error('Batch update error:', error);
      }
    },
    [isOnline]
  );

  // Toggle a parent node (top-down cascade)
  const toggleParentNode = useCallback(
    async (parentId: string, newState: boolean) => {
      const children = nodes.filter((n) => n.parent_id === parentId);
      const updates = [
        { id: parentId, is_completed: newState },
        ...children.map((c) => ({ id: c.id, is_completed: newState })),
      ];
      await batchUpdateCompletion(updates);
    },
    [nodes, batchUpdateCompletion]
  );

  // Toggle a child node (bottom-up auto-check parent)
  const toggleChildNode = useCallback(
    async (childId: string, newState: boolean) => {
      const child = nodes.find((n) => n.id === childId);
      if (!child || !child.parent_id) {
        await updateNodeCompletion(childId, newState);
        return;
      }

      const parentId = child.parent_id;
      const siblings = nodes.filter((n) => n.parent_id === parentId && n.id !== childId);
      const allSiblingsComplete = siblings.every((s) => s.is_completed);

      // Update child
      await updateNodeCompletion(childId, newState);

      // If all children are now complete, check parent
      if (newState && allSiblingsComplete) {
        await updateNodeCompletion(parentId, true);
      } else if (!newState) {
        // If unchecking a child, uncheck parent
        await updateNodeCompletion(parentId, false);
      }
    },
    [nodes, updateNodeCompletion]
  );

  // Update notes for a node (debounced)
  const updateNotes = useCallback(
    (nodeId: string, notes: string) => {
      // Optimistic update
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, notes } : n))
      );

      // Debounce the Supabase write
      const existing = debounceTimers.current.get(nodeId);
      if (existing) clearTimeout(existing);

      debounceTimers.current.set(
        nodeId,
        setTimeout(async () => {
          if (supabase && isOnline) {
            const { error } = await supabase
              .from('roadmap_nodes')
              .update({ notes })
              .eq('id', nodeId);
            if (error) console.error('Notes update error:', error);
          }
          debounceTimers.current.delete(nodeId);
        }, 500)
      );
    },
    [isOnline]
  );

  // Helper: get children of a parent
  const getChildren = useCallback(
    (parentId: string) =>
      nodes
        .filter((n) => n.parent_id === parentId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [nodes]
  );

  // Helper: get parent nodes for a track and time block
  const getParentNodes = useCallback(
    (track: 'cs' | 'math', timeBlock: string) =>
      nodes
        .filter((n) => n.track === track && n.time_block === timeBlock && !n.parent_id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [nodes]
  );

  return {
    nodes,
    loading,
    isOnline,
    toggleParentNode,
    toggleChildNode,
    updateNotes,
    getChildren,
    getParentNodes,
  };
}
