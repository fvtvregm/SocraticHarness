# CortexOS / Engram Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified offline-first learning operating system that combines a Reor-based note vault, a LearnHarness knowledge graph, an Open Sunsama scheduling layer, and a custom desktop shell while honoring the architecture guide and expanding it with production-quality integrations, background workers, and secure multi-mode AI workflows.

**Architecture:** The system uses a monorepo with clear domain boundaries: Reor provides the local Markdown vault and semantic indexing; LearnHarness provides the education graph and tutoring logic; Open Sunsama provides scheduling and daily planning; the desktop shell provides a single navigation surface; and the bridge layer coordinates local file, graph, and calendar contexts through a custom `cortex://` protocol. The architecture expands beyond the original brief by adding strict privacy boundaries, background orchestration, secure demos, timeline parsing, and explicit mode switching between general retrieval and Socratic instruction.

**Tech Stack:** TypeScript, React, Next.js, Electron/Tauri-style shell patterns, Node.js services, Docker Compose for local infrastructure, SQLite/Postgres-compatible graph/state storage, Redis or equivalent job queue, vector search and embedding stack, Markdown frontmatter ingestion, Tailwind, and local-model compatibility via Ollama/OpenAI-compatible providers.

**Spec:** C:/Users/Evan/Downloads/System Architecture.md

## Global Constraints

- The project must use a monorepo with explicit per-domain directories: `vault/`, `graph_vault/`, `open-sunsama/`, `learnharness-core/`, `desktop-shell/`, and `bridge-service/`.
- Reor Markdown notes must remain in `vault/` and LearnHarness graph state must remain in `graph_vault/` with no cross-storage mixing.
- All cross-vault references must pass through the `cortex://` routing scheme.
- Only markdown files tagged with `source: learnharness` or `indexed: true` must enter vector ingestion; binary files must be ignored.
- The application must support both General Mode and Timeline Mode, with an explicit UI bot switch between general RAG and Socratic chat.
- The shell must present the primary views `Notes`, `Calendar`, and `Learning` in a persistent top nav.
- Theme, density, and typography settings must be centralized and synchronized across all views without full reload.
- Background daemons must run locally and respect user opt-in/opt-out for notifications.
- Visualization scripts must run in isolated headless environments and render into vault asset directories.
- Interactive demo blocks in markdown must be sandboxed behind iframe boundaries.
- Tasks, notes, and learning sessions must support contextual hand-off from one view to another without re-entry friction.
- The system should be offline-first, local-first, and privacy-preserving by default.

## Review Focus

- Input class: markdown notes with mixed file types and frontmatter values; expected behavior is selective indexing and binary exclusion without data loss.
- Input class: cross-vault note references from graph nodes; expected behavior is deterministic resolution via `cortex://` and no broken links.
- Input class: scheduler deadlines and study blocks; expected behavior is pre-generation before an event or session begins, without blocking the UI.
- Input class: connected LLM or model responses in General Mode vs Socratic Mode; expected behavior is explicit context switching and no silent contamination of the wrong memory source.
- Input class: untrusted demo code or visualization scripts; expected behavior is sandboxing and safe asset generation with no host escape.

---

### Task 1: Establish monorepo scaffold and shared contracts

**Files:**
- Create: `docs/superpowers/plans/2026-10-29-cortexos-engram-implementation-plan.md`
- Create: `package.json` at the monorepo root if absent
- Create: `tsconfig.base.json`, `turbo.json` or equivalent workspace config
- Create: `apps/desktop-shell/package.json`, `apps/bridge-service/package.json`, `packages/shared/package.json`
- Create: `packages/shared/src/contracts/*.ts`
- Create: `packages/shared/src/types/*.ts`
- Test: `packages/shared/test/contracts.test.ts`

**Interfaces:**
- Consumes: architecture constraints from the spec and repo-specific boundaries from Reor, LearnHarness, and Open Sunsama.
- Produces: global config, path conventions, shared data models, and integration interfaces used by all follow-on tasks.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { resolveVaultUri, isVaultNote, normalizeMode } from '../src/contracts/core';

describe('shared contracts', () => {
  it('resolves a valid cortex vault uri', () => {
    expect(resolveVaultUri('cortex://note/123')).toMatch(/^cortex:\/\//);
  });

  it('accepts only valid markdown note paths', () => {
    expect(isVaultNote('note.md')).toBe(true);
    expect(isVaultNote('file.pdf')).toBe(false);
  });

  it('normalizes assistant modes', () => {
    expect(normalizeMode('general')).toBe('general');
    expect(normalizeMode('socratic')).toBe('socratic');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/shared/test/contracts.test.ts`
Expected: FAIL with module or symbol not found.

- [ ] **Step 3: Implement shared contracts in `packages/shared/src/contracts/core.ts` and related files**

Create a shared set of types and helpers for directory boundaries, `cortex://` URI validation, note metadata shape, mode enum, task contexts, and session transitions. Keep the API deliberately small and serializable so it works across Electron, Node workers, and browser UI code.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/shared/test/contracts.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/shared src package.json
git commit -m "feat: add shared core contracts for cortex monorepo"
```

### Task 2: Scaffold desktop shell and central runtime

**Files:**
- Create: `apps/desktop-shell/src/app/App.tsx`
- Create: `apps/desktop-shell/src/state/theme-store.ts`
- Create: `apps/desktop-shell/src/navigation/TopNav.tsx`
- Create: `apps/desktop-shell/src/views/NotesView.tsx`
- Create: `apps/desktop-shell/src/views/CalendarView.tsx`
- Create: `apps/desktop-shell/src/views/LearningView.tsx`
- Create: `apps/desktop-shell/src/providers/RootProviders.tsx`
- Create: `apps/bridge-service/src/index.ts`
- Create: `apps/bridge-service/src/routes/*.ts`
- Test: `apps/desktop-shell/test/shell-layout.test.tsx`

**Interfaces:**
- Consumes: shared contracts and monorepo config from Task 1.
- Produces: app shell, navigation, and bridge endpoints for Notes, Calendar, and Learning views.

- [ ] **Step 1: Write the failing test**

```ts
import { render, screen } from '@testing-library/react';
import { AppShell } from '../src/app/AppShell';

describe('desktop shell', () => {
  it('renders notes, calendar, and learning nav items', () => {
    render(<AppShell />);
    expect(screen.getByRole('link', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /calendar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /learning/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run apps/desktop-shell/test/shell-layout.test.tsx`
Expected: FAIL with missing AppShell.

- [ ] **Step 3: Implement the shell**

Create the root providers with theme synchronization, top navigation, and a tab config that includes `Notes`, `Calendar`, and `Learning`. Keep the structure thin and mount app-specific feature panes behind the shell. Also create the lightweight bridge-service entrypoint that exposes environment-safe routes for local-file, graph, and schedule actions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run apps/desktop-shell/test/shell-layout.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/desktop-shell apps/bridge-service
git commit -m "feat: scaffold desktop shell and runtime bridge"
```

### Task 3: Build the dual-vault model and `cortex://` protocol

**Files:**
- Create: `packages/vault-core/src/index.ts`
- Create: `packages/vault-core/src/cortex-protocol.ts`
- Create: `packages/vault-core/src/metadata.ts`
- Create: `packages/graph-core/src/nodes.ts`
- Create: `packages/graph-core/src/links.ts`
- Test: `packages/vault-core/test/cortex-protocol.test.ts`

**Interfaces:**
- Consumes: shared contracts from Task 1.
- Produces: vault note type, graph node metadata type, and conversion helpers for `cortex://` references.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { encodeCortexUri, decodeCortexUri, buildNodePointer } from '../src/cortex-protocol';

describe('cortex protocol', () => {
  it('encodes and decodes a note pointer', () => {
    const uri = encodeCortexUri({ type: 'note', id: 'abc123', path: '/vault/notes/test.md' });
    expect(uri).toContain('cortex://');
    expect(decodeCortexUri(uri)?.path).toBe('/vault/notes/test.md');
  });

  it('builds graph metadata pointers', () => {
    const pointer = buildNodePointer('idea-1', '/vault/notes/idea.md');
    expect(pointer.referenceType).toBe('vault-note');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/vault-core/test/cortex-protocol.test.ts`
Expected: FAIL with unimplemented functions.

- [ ] **Step 3: Implement the protocol and node metadata**

Implement URI serialization, deterministic decode, pointer metadata shape, and a strict type boundary between markdown note storage and graph state. Ensure graph nodes hold lightweight metadata only and never the raw markdown itself.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/vault-core/test/cortex-protocol.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vault-core packages/graph-core
git commit -m "feat: implement cortex protocol and dual-vault metadata mapping"
```

### Task 4: Configure Reor ingestion, frontmatter filtering, and binary bypass

**Files:**
- Modify: `reor-main/reor-main/...` (watcher/indexer modules)
- Create: `packages/vault-ingest/src/index.ts`
- Create: `packages/vault-ingest/src/frontmatter.ts`
- Create: `packages/vault-ingest/src/binary-filter.ts`
- Test: `packages/vault-ingest/test/watcher-filter.test.ts`

**Interfaces:**
- Consumes: Reor note tree and metadata contract from Task 3.
- Produces: filtered markdown documents and vector-ready chunks for the graph and RAG pipeline.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { shouldIndexNote, shouldSkipBinary } from '../src/frontmatter';

describe('ingestion rules', () => {
  it('indexes markdown flagged for the learning vault', () => {
    expect(shouldIndexNote('# Title\nsource: learnharness\n')).toBe(true);
  });

  it('ignores non-markdown binary attachments', () => {
    expect(shouldSkipBinary('sample.pdf')).toBe(true);
    expect(shouldSkipBinary('note.md')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/vault-ingest/test/watcher-filter.test.ts`
Expected: FAIL with missing function implementations.

- [ ] **Step 3: Implement selective ingestion**

Create a frontmatter parser that looks for `source: learnharness` and `indexed: true`, a binary checklist for PDFs/images/audio, and a chunking pipeline that emits only allowed markdown documents. Preserve raw attachments but exclude them from vectorization.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/vault-ingest/test/watcher-filter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vault-ingest reor-main
git commit -m "feat: add selective vault ingestion and binary filtering"
```

### Task 5: Add graph storage, knowledge extraction, and session memory

**Files:**
- Create: `packages/graph-core/src/store.ts`
- Create: `packages/graph-core/src/session-memory.ts`
- Create: `packages/graph-core/src/proposition.ts`
- Create: `packages/graph-core/src/learning-graph.ts`
- Test: `packages/graph-core/test/learning-graph.test.ts`

**Interfaces:**
- Consumes: vault chunk data and note metadata from Task 4.
- Produces: knowledge graph nodes, proposition records, and session recovery state for tutoring tasks.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildKnowledgeGraph } from '../src/learning-graph';

describe('knowledge graph', () => {
  it('hydrates proposition nodes for a learning session', () => {
    const graph = buildKnowledgeGraph([
      { id: 'p1', text: 'Variables store state', prerequisites: [] },
      { id: 'p2', text: 'Functions use variables', prerequisites: ['p1'] }
    ]);

    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.some((edge) => edge.from === 'p1' && edge.to === 'p2')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/graph-core/test/learning-graph.test.ts`
Expected: FAIL with missing graph builder.

- [ ] **Step 3: Implement graph storage and proposition logic**

Build the node/edge store, session memory model, and proposition dependency graph. Include links back to source sessions and notes, and support persistence across sessions. This is the learning memory substrate that the teaching and practice agents use.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/graph-core/test/learning-graph.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/graph-core
git commit -m "feat: add learnharness graph and session memory model"
```

### Task 6: Create the general teaching and Socratic AI modes

**Files:**
- Create: `packages/ai-core/src/modes/general-mode.ts`
- Create: `packages/ai-core/src/modes/socratic-mode.ts`
- Create: `packages/ai-core/src/context/context-loader.ts`
- Create: `packages/ai-core/src/teacher/session-orchestrator.ts`
- Test: `packages/ai-core/test/modes.test.ts`

**Interfaces:**
- Consumes: graph state, user notes, and session memory from Tasks 4 and 5.
- Produces: mode-aware assistant behavior for open retrieval and guided teaching.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { chooseAssistantMode } from '../src/context/context-loader';

describe('assistant modes', () => {
  it('prefers Socratic mode when the user requests a lesson workflow', () => {
    expect(chooseAssistantMode('teach me from my notes')).toBe('socratic');
    expect(chooseAssistantMode('summarize my notes and web research')).toBe('general');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/ai-core/test/modes.test.ts`
Expected: FAIL with missing mode selector.

- [ ] **Step 3: Implement mode-specific orchestrators**

Implement `general` mode for open-ended, multi-source retrieval and `socratic` mode with guided questioning, dependency-aware lesson steps, and context switching through explicit UI controls. Both modes should share a common retrieval layer but differ in how they formulate prompts and how they route memory sources.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/ai-core/test/modes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ai-core
git commit -m "feat: add general and socratic teaching modes"
```

### Task 7: Integrate Open Sunsama calendars, tasks, and cron workers

**Files:**
- Create: `packages/schedule-core/src/index.ts`
- Create: `packages/schedule-core/src/calendar-sync.ts`
- Create: `packages/schedule-core/src/task-precache.ts`
- Create: `packages/schedule-core/src/cron-worker.ts`
- Test: `packages/schedule-core/test/task-precache.test.ts`

**Interfaces:**
- Consumes: user calendar state and task metadata from Open Sunsama.
- Produces: study blocks, task context, and scheduled pre-generation jobs.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { shouldPrecacheStudyBlock } from '../src/task-precache';

describe('study pre-generation', () => {
  it('triggers pre-generation before an upcoming study block', () => {
    expect(shouldPrecacheStudyBlock({ minutesUntilStart: 12, blockType: 'study' })).toBe(true);
    expect(shouldPrecacheStudyBlock({ minutesUntilStart: 120, blockType: 'meeting' })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/schedule-core/test/task-precache.test.ts`
Expected: FAIL with missing scheduler function.

- [ ] **Step 3: Implement scheduling and pre-generation**

Add calendar state normalization, time-block planning, and background worker logic that pre-generates quiz cards and summary content just before focus events. Include opt-in background daemon configuration and runtime shutdown behavior.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/schedule-core/test/task-precache.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/schedule-core open-sunsama
git commit -m "feat: add calendar sync and pre-generation workers"
```

### Task 8: Add timeline-driven course planning and syllabus parsing

**Files:**
- Create: `packages/timeline-core/src/parser.ts`
- Create: `packages/timeline-core/src/plan-builder.ts`
- Create: `packages/timeline-core/src/calendar-allocation.ts`
- Test: `packages/timeline-core/test/syllabus-parser.test.ts`

**Interfaces:**
- Consumes: uploaded syllabus or course outline and calendar availability.
- Produces: subtopic timelines, study-hour allocations, and lesson sequencing.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { parseSyllabusToTimeline } from '../src/parser';

describe('timeline mode', () => {
  it('extracts modules and subtopics from a syllabus', () => {
    const timeline = parseSyllabusToTimeline('Week 1: Arrays\nWeek 2: Sorting');
    expect(timeline.modules.length).toBe(2);
    expect(timeline.modules[0].title).toContain('Arrays');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/timeline-core/test/syllabus-parser.test.ts`
Expected: FAIL with missing parser.

- [ ] **Step 3: Implement syllabus parsing and allocation**

Parse uploaded course syllabi into modules, topics, and tasks; then convert those into a study timeline and calendar allocations. Keep the planner deterministic and explainable, and expose it as a distinct `Timeline Mode` workflow.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/timeline-core/test/syllabus-parser.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/timeline-core
git commit -m "feat: add timeline mode and syllabus parsing"
```

### Task 9: Build the headless visualization and sandboxed demo pipeline

**Files:**
- Create: `packages/render-core/src/headless-visualizer.ts`
- Create: `packages/render-core/src/demo-sandbox.ts`
- Create: `packages/render-core/src/markdown-interpreter.ts`
- Test: `packages/render-core/test/rendering.test.ts`

**Interfaces:**
- Consumes: markdown note content and generated visualization scripts.
- Produces: rendered assets stored in vault asset directories and sandboxed HTML blocks for notes.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { detectDemoBlock, renderSandboxHtml } from '../src/demo-sandbox';

describe('demo sandbox', () => {
  it('detects a demo block and wraps it in sandboxed html', () => {
    const html = renderSandboxHtml('```demo\nconsole.log(1)\n```');
    expect(html).toContain('sandbox');
    expect(html).toContain('iframe');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/render-core/test/rendering.test.ts`
Expected: FAIL with missing demo sandbox.

- [ ] **Step 3: Implement rendering and sandboxing**

Support headless script execution with Matplotlib/Seaborn or equivalent visual libraries in an isolated worker context, write images to the vault asset folder, and replace special markdown demo blocks with safe inline iframes or sandboxed webviews.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/render-core/test/rendering.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/render-core
git commit -m "feat: add headless visualization and sandboxed demo rendering"
```

### Task 10: Wire context handoff, modal flows, and explicit bot selection

**Files:**
- Modify: `apps/desktop-shell/src/views/*.tsx`
- Create: `apps/desktop-shell/src/context/handoff.ts`
- Create: `apps/desktop-shell/src/components/BotSwitch.tsx`
- Test: `apps/desktop-shell/test/handoff.test.tsx`

**Interfaces:**
- Consumes: note/task selection and active context from Notes, Calendar, and Learning views.
- Produces: handoff context state and bot selection data for the learning workspace.

- [ ] **Step 1: Write the failing test**

```ts
import { render, screen } from '@testing-library/react';
import { BotSwitch } from '../src/components/BotSwitch';

describe('bot switching', () => {
  it('shows general and socratic modes as separate available modes', () => {
    render(<BotSwitch activeMode="general" />);
    expect(screen.getByText(/general/i)).toBeInTheDocument();
    expect(screen.getByText(/socratic/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run apps/desktop-shell/test/handoff.test.tsx`
Expected: FAIL with missing BotSwitch.

- [ ] **Step 3: Implement the feature**

Add a single context state that carries a selected note, task, or syllabus; allow user-driven handoff from Notes or Calendar into Learning with that object preloaded; add an explicit bot toggle so the user can switch between `General` and `Socratic` modes without losing task context.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run apps/desktop-shell/test/handoff.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/desktop-shell
git commit -m "feat: add contextual handoff and bot toggle workflows"
```

### Task 11: Add local background services, privacy settings, and notification opt-out

**Files:**
- Create: `apps/desktop-shell/src/services/tray-daemon.ts`
- Create: `apps/bridge-service/src/notification-controller.ts`
- Create: `packages/security-core/src/privacy-config.ts`
- Test: `packages/security-core/test/privacy-config.test.ts`

**Interfaces:**
- Consumes: user notification settings and app lifecycle state.
- Produces: background service readiness, tray state, and local privacy controls.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { isBackgroundNotificationsEnabled } from '../src/privacy-config';

describe('privacy controls', () => {
  it('disables notifications when the user turns them off', () => {
    expect(isBackgroundNotificationsEnabled({ notifications: false })).toBe(false);
    expect(isBackgroundNotificationsEnabled({ notifications: true })).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/security-core/test/privacy-config.test.ts`
Expected: FAIL with missing implementation.

- [ ] **Step 3: Implement privacy and daemon settings**

Add background service lifecycle management, tray toggles, and settings that allow the daemon to run silently or stop entirely. Ensure all model and personal data handling is local-first and user-controlled with no forced cloud dependency.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/security-core/test/privacy-config.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/desktop-shell apps/bridge-service packages/security-core
git commit -m "feat: add privacy controls and background tray daemon"
```

### Task 12: Add end-to-end integration, observability, and quality gates

**Files:**
- Create: `apps/desktop-shell/e2e/learning-flow.spec.ts`
- Create: `apps/desktop-shell/e2e/calendar-flow.spec.ts`
- Create: `apps/bridge-service/src/telemetry.ts`
- Create: `scripts/validate-architecture.mjs`
- Test: `npm run test`, `npm run typecheck`, `npm run lint`

**Interfaces:**
- Consumes: all prior tasks and service boundaries.
- Produces: release readiness checks and end-to-end confidence in the integrated product.

- [ ] **Step 1: Write the failing e2e test**

```ts
import { test, expect } from '@playwright/test';

test('user can open notes and jump into learning with task context', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: /notes/i }).click();
  await page.getByText(/general/i).click();
  await expect(page.getByText(/learning/i)).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run e2e -- --grep "learning flow"`
Expected: FAIL due to missing app routes or interface state.

- [ ] **Step 3: Implement release validation**

Run the full validation suite: unit tests, type checks, lint, and integration tests for shell flow. Add a security/architecture smoke script that asserts the required directories, protocol references, and mode toggles exist in the final app.

- [ ] **Step 4: Run validation suite to verify pass**

Run: `npm run test && npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: complete cortexos integration and release validation"
```

## Implementation Notes

This plan is intentionally larger than the original architecture brief. It incorporates the minimum required features from [System Architecture.md](C:/Users/Evan/Downloads/System%20Architecture.md) and expands the product into a robust, production-oriented local operating system by adding:

- strict monorepo boundaries and shared contracts
- app shell + bridge routing + context state
- dual-vault metadata mapping and `cortex://` protocol
- selective markdown ingestion and binary filtering
- graph-backed learning memory and local session state
- dual AI modes with explicit switching
- calendar + task + pre-generation scheduling
- timeline parsing and course planning
- headless visualization and sandboxed note demos
- privacy controls and background daemons
- release validation and smoke checks

This plan is designed so each major task remains testable and reviewable in isolation while still building toward one integrated system.

---

## Final execution guidance

This plan should be reviewed by the human partner and then executed using either subagent-driven or native execution. The subagent-driven approach is preferable here because the build spans multiple loosely connected subsystems and has a high cost if the interfaces between them drift.
