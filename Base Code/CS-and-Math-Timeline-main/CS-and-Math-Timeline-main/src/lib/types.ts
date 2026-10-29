export interface RoadmapNode {
  id: string;
  track: 'cs' | 'math';
  time_block: TimeBlock;
  parent_id: string | null;
  title: string;
  resource_link: string | null;
  how_to_learn: string | null;
  notes: string;
  is_completed: boolean;
  sort_order: number;
}

export type TimeBlock =
  | 'summer-before-11'
  | 'grade-11'
  | 'summer-before-12'
  | 'grade-12'
  | 'summer-after-12';

export const TIME_BLOCKS: { key: TimeBlock; label: string; icon: string }[] = [
  { key: 'summer-before-11', label: 'Summer before Grade 11', icon: '☀️' },
  { key: 'grade-11', label: 'Grade 11 School Year', icon: '📚' },
  { key: 'summer-before-12', label: 'Summer before Grade 12', icon: '☀️' },
  { key: 'grade-12', label: 'Grade 12 School Year', icon: '📚' },
  { key: 'summer-after-12', label: 'Summer after Grade 12', icon: '☀️' },
];

export interface TrackInfo {
  key: 'cs' | 'math';
  title: string;
  subtitle: string;
  accentClass: string;
  gradientFrom: string;
  gradientTo: string;
}

export const TRACKS: TrackInfo[] = [
  {
    key: 'cs',
    title: 'Coding & Software Engineering',
    subtitle: 'Backend + ML/AI Engineering',
    accentClass: 'text-cyan-400',
    gradientFrom: 'from-cyan-500/20',
    gradientTo: 'to-blue-600/20',
  },
  {
    key: 'math',
    title: 'Mathematics for ML & CS',
    subtitle: 'Canadian Curriculum + ML/CS Math',
    accentClass: 'text-violet-400',
    gradientFrom: 'from-violet-500/20',
    gradientTo: 'to-purple-600/20',
  },
];
