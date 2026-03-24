'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { computeWeather, type ThoughtWeather } from '@/lib/weather';
import { getTimeOfDay } from '@/lib/utils';

const WEATHER_STORAGE_KEY = 'offload_weather';
const WEATHER_INPUTS_KEY = 'offload_weather_inputs';

interface WeatherContextType {
  weather: ThoughtWeather;
  setWeatherInputs: (inputs: {
    mood?: number | null;
    worryCount?: number;
    ideaCount?: number;
    completionRate?: number;
  }) => void;
}

const WeatherContext = createContext<WeatherContextType>({
  weather: 'clear',
  setWeatherInputs: () => {},
});

function getStoredWeather(): ThoughtWeather {
  if (typeof window === 'undefined') return 'clear';
  return (localStorage.getItem(WEATHER_STORAGE_KEY) as ThoughtWeather) || 'clear';
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<ThoughtWeather>('clear');

  // Restore persisted weather on mount
  useEffect(() => {
    setWeather(getStoredWeather());
  }, []);

  const setWeatherInputs = useCallback(
    (inputs: {
      mood?: number | null;
      worryCount?: number;
      ideaCount?: number;
      completionRate?: number;
    }) => {
      const w = computeWeather(
        inputs.mood ?? null,
        inputs.worryCount ?? 0,
        inputs.ideaCount ?? 0,
        inputs.completionRate ?? 0,
        getTimeOfDay()
      );
      setWeather(w);
      if (typeof window !== 'undefined') {
        localStorage.setItem(WEATHER_STORAGE_KEY, w);
        localStorage.setItem(WEATHER_INPUTS_KEY, JSON.stringify(inputs));
      }
    },
    []
  );

  return (
    <WeatherContext.Provider value={{ weather, setWeatherInputs }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  return useContext(WeatherContext);
}
