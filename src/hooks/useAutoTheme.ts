import { useEffect, useState } from 'react';
import type { MapTheme } from '../components/GameMap';

const NIGHT_START_HOUR = 18; // desde las 6 p. m.
const NIGHT_END_HOUR = 6;    // hasta las 6 a. m.

const themeFor = (d: Date): MapTheme => {
  const h = d.getHours();
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR ? 'night' : 'day';
};

/** Tema del mapa según la hora local; se revisa cada minuto. */
export function useAutoTheme(): MapTheme {
  const [theme, setTheme] = useState<MapTheme>(() => themeFor(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTheme(themeFor(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  return theme;
}