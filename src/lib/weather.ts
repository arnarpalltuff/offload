export type ThoughtWeather = 'clear' | 'cloudy' | 'stormy' | 'misty' | 'aurora';

export interface WeatherConfig {
  gradient1: string;
  gradient2: string;
  particleColor: string;
  particleCount: number;
  particleSpeed: number;
  label: string;
  icon: string;
}

export function computeWeather(
  mood: number | null,
  worryCount: number,
  ideaCount: number,
  completionRate: number,
  timeOfDay: 'morning' | 'afternoon' | 'evening'
): ThoughtWeather {
  // Evening defaults to misty unless strong signals
  if (timeOfDay === 'evening' && (mood === null || mood === 3)) return 'misty';

  // High mood + high completion = aurora
  if (mood !== null && mood >= 4 && completionRate >= 60) return 'aurora';

  // Lots of worries, low mood = stormy
  if (worryCount >= 3 || (mood !== null && mood <= 2)) return 'stormy';

  // Mixed state = cloudy
  if (worryCount >= 2 || (mood !== null && mood === 3)) return 'cloudy';

  // Default = clear
  return 'clear';
}

export const WEATHER_CONFIGS: Record<ThoughtWeather, WeatherConfig> = {
  clear: {
    gradient1: 'rgba(0, 255, 136, 0.06)',
    gradient2: 'rgba(59, 130, 246, 0.04)',
    particleColor: 'rgba(0, 255, 136, 0.3)',
    particleCount: 12,
    particleSpeed: 40,
    label: 'Clear',
    icon: '☀️',
  },
  cloudy: {
    gradient1: 'rgba(100, 116, 139, 0.08)',
    gradient2: 'rgba(71, 85, 105, 0.06)',
    particleColor: 'rgba(148, 163, 184, 0.25)',
    particleCount: 18,
    particleSpeed: 30,
    label: 'Cloudy',
    icon: '☁️',
  },
  stormy: {
    gradient1: 'rgba(239, 68, 68, 0.07)',
    gradient2: 'rgba(124, 58, 237, 0.06)',
    particleColor: 'rgba(239, 68, 68, 0.2)',
    particleCount: 22,
    particleSpeed: 20,
    label: 'Stormy',
    icon: '⛈️',
  },
  misty: {
    gradient1: 'rgba(99, 102, 241, 0.06)',
    gradient2: 'rgba(124, 58, 237, 0.04)',
    particleColor: 'rgba(165, 180, 252, 0.2)',
    particleCount: 15,
    particleSpeed: 50,
    label: 'Misty',
    icon: '🌫️',
  },
  aurora: {
    gradient1: 'rgba(0, 255, 136, 0.1)',
    gradient2: 'rgba(124, 58, 237, 0.08)',
    particleColor: 'rgba(0, 255, 136, 0.35)',
    particleCount: 20,
    particleSpeed: 35,
    label: 'Aurora',
    icon: '🌌',
  },
};
