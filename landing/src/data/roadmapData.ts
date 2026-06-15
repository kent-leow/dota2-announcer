export type RoadmapStatus = 'planned' | 'in-progress' | 'done';

export interface RoadmapItem {
  title: string;
  description: string;
  status: RoadmapStatus;
}

export const roadmapItems: RoadmapItem[] = [
  {
    title: 'Custom Voice Pack Support',
    description: 'Choose your announcer voice — swap between custom audio packs for game event alerts.',
    status: 'planned',
  },
  {
    title: 'Hero-Specific Reminders',
    description: 'Context-aware alerts tailored to your hero — Meepo net-worth timing, Chen creep respawn, and more.',
    status: 'planned',
  },
  {
    title: 'Configurable Alert Thresholds',
    description: 'Set custom countdown warnings at 30s, 15s, or 5s before game events fire.',
    status: 'planned',
  },
  {
    title: 'Multi-Monitor Overlay Mode',
    description: 'Transparent overlay display for dual-monitor setups — see timers without alt-tabbing.',
    status: 'planned',
  },
  {
    title: 'Roshan & Aegis Timer',
    description: 'Precision Roshan death timer with Aegis expiry countdown — never miss the re-fight window.',
    status: 'in-progress',
  },
  {
    title: 'Power Rune & Wisdom Rune Countdown',
    description: 'Audio alerts before power rune and wisdom rune spawns so you arrive first.',
    status: 'in-progress',
  },
  {
    title: 'Tormentor Respawn Alert',
    description: 'Tormentor kill tracking with respawn timer — secure Aghanim\'s Shard for your team.',
    status: 'in-progress',
  },
  {
    title: 'Stack & Pull Timing Alerts',
    description: 'Precise audio cues for jungle stacking and lane pulling at the correct game clock times.',
    status: 'done',
  },
  {
    title: 'Bounty Rune Spawn Reminders',
    description: 'Countdown alerts for bounty rune spawns — maximise team gold with timely pickups.',
    status: 'done',
  },
  {
    title: 'Glyph Cooldown Tracker',
    description: 'Track enemy glyph of fortification cooldown to time your pushes perfectly.',
    status: 'done',
  },
  {
    title: 'Buyback Status Monitoring',
    description: 'Real-time buyback availability tracking via Game State Integration.',
    status: 'done',
  },
];

export const statusConfig: Record<RoadmapStatus, { label: string; color: string }> = {
  planned: { label: 'Planned', color: 'text-blue-400' },
  'in-progress': { label: 'In Progress', color: 'text-dota-gold' },
  done: { label: 'Done', color: 'text-green-400' },
};
