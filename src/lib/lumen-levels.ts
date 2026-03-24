export interface LumenLevel {
  level: number;
  name: string;
  title: string;
  minDumps: number;
  coreColor: string;
  glowColor: string;
  orbitCount: number;  // number of orbiting dots
  personality: string; // how Lumen speaks at this level
  unlockMessage: string;
}

export const LUMEN_LEVELS: LumenLevel[] = [
  { level: 1, name: 'Spark', title: 'New Companion', minDumps: 0, coreColor: '#00FF88', glowColor: 'rgba(0,255,136,0.3)', orbitCount: 1, personality: 'curious and encouraging', unlockMessage: 'Lumen has awakened!' },
  { level: 2, name: 'Glow', title: 'Getting to Know You', minDumps: 3, coreColor: '#00FFaa', glowColor: 'rgba(0,255,170,0.35)', orbitCount: 2, personality: 'warmer and more observant', unlockMessage: 'Lumen is starting to understand your patterns.' },
  { level: 3, name: 'Pulse', title: 'Pattern Spotter', minDumps: 7, coreColor: '#44FFcc', glowColor: 'rgba(68,255,204,0.4)', orbitCount: 3, personality: 'insightful with gentle challenges', unlockMessage: 'Lumen can now spot recurring themes in your thoughts.' },
  { level: 4, name: 'Radiance', title: 'Thought Partner', minDumps: 14, coreColor: '#66FFdd', glowColor: 'rgba(102,255,221,0.45)', orbitCount: 4, personality: 'deeply perceptive and strategic', unlockMessage: 'Lumen has become a true thinking partner.' },
  { level: 5, name: 'Nova', title: 'Mind Architect', minDumps: 30, coreColor: '#88FFee', glowColor: 'rgba(136,255,238,0.5)', orbitCount: 5, personality: 'wise, concise, and transformative', unlockMessage: 'Lumen has reached its highest form. You\'ve built something special.' },
];

export function getLumenLevel(totalDumps: number): LumenLevel {
  // return the highest level the user qualifies for
  return [...LUMEN_LEVELS].reverse().find(l => totalDumps >= l.minDumps) || LUMEN_LEVELS[0];
}
