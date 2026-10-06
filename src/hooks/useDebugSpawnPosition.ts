import { useEffect, useRef, useState } from 'react';
import { fetchActiveSpawns } from '../services/spawnApi';
import { Coordinate } from '../types';

const POLL_MS = 10_000;
const MIN_LIFE_MS = 20_000; // no elegir uno que está por vencer

/**
 * SOLO PARA DESARROLLO. Devuelve la coordenada de un spawn vigente.
 * Se queda con el mismo spawn hasta que desaparece (capturado o vencido).
 */
export function useDebugSpawnPosition(enabled: boolean): Coordinate | null {
  const [pos, setPos] = useState<Coordinate | null>(null);
  const currentId = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      try {
        const alive = (await fetchActiveSpawns()).filter(
          (s) => s.expiresAt > Date.now() + MIN_LIFE_MS,
        );
        if (cancelled) return;
        if (alive.some((s) => s.id === currentId.current)) return; // el actual sigue vivo

        const best = [...alive].sort((a, b) => b.expiresAt - a.expiresAt)[0];
        currentId.current = best?.id ?? null;
        setPos(best ? best.coordinate : null);
      } catch (e) {
        console.warn('[debug-spawn] error:', e); // p. ej. la sesión aún no está lista; reintenta
      }
    };

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id); // cleanup: detiene el sondeo
    };
  }, [enabled]);

  return enabled ? pos : null;
}