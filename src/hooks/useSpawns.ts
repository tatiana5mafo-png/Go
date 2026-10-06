import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchActiveSpawns, Spawn } from '../services/spawnApi';

const POLL_MS = 30_000; // el cron repone spawns cada minuto; con 30 s nunca vamos muy atrasados

/**
 * Descarga los spawns vigentes y los refresca cada 30 s.
 * Si `enabled` es false (fuera de límites o sin posición) no consulta nada y vacía la lista.
 * `reload` fuerza una consulta inmediata (por ejemplo, tras una captura).
 */
export function useSpawns(enabled: boolean) {
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const cancelled = useRef(false);

  const reload = useCallback(async () => {
    try {
      const data = await fetchActiveSpawns();
      if (!cancelled.current) setSpawns(data);
    } catch (e) {
      console.warn('[spawns] error al cargar:', e);
    }
  }, []);

  useEffect(() => {
    cancelled.current = false;
    if (!enabled) {
      setSpawns([]);
      return;
    }

    reload();
    const id = setInterval(reload, POLL_MS);

    // Cleanup: al salir de la pantalla o quedar fuera del campus se detiene el intervalo
    return () => {
      cancelled.current = true;
      clearInterval(id);
    };
  }, [enabled, reload]);

  return { spawns, reload };
}