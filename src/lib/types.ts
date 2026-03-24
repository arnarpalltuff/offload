export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  created_at: string;
  is_premium: boolean;
  streak: number;
}

export interface OrganizedDump {
  must_do: PlanItem[];
  can_wait: PlanItem[];
  ideas: PlanItem[];
  worries: PlanItem[];
  summary: string;
}

export interface BrainDump {
  id: string;
  user_id: string;
  raw_text: string;
  organized: OrganizedDump;
  created_at: string;
  date: string;
}

export interface PlanItem {
  id: string;
  text: string;
  category: ItemCategory;
  priority: number;
  completed: boolean;
  notes: string;
  created_at: string;
}

export interface QuickCapture {
  id: string;
  text: string;
  category: ItemCategory;
  created_at: string;
}

export interface Reflection {
  id: string;
  mood_score: number;
  text: string;
  ai_insight: string;
  created_at: string;
  date: string;
}

export type ItemCategory = 'must_do' | 'can_wait' | 'ideas' | 'worries';

export const MOOD_EMOJIS: Record<number, string> = { 1: '😔', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };

export const MOOD_COLORS: Record<number, string> = { 1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#22C55E', 5: '#00FF88' };

export const CATEGORY_CONFIG: Record<
  ItemCategory,
  { label: string; icon: string; color: string; bg: string }
> = {
  must_do: {
    label: 'Must Do Today',
    icon: '🔥',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.08)',
  },
  can_wait: {
    label: 'Can Wait',
    icon: '⏳',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
  },
  ideas: {
    label: 'Ideas',
    icon: '💡',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)',
  },
  worries: {
    label: 'On My Mind',
    icon: '☁️',
    color: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.08)',
  },
};
