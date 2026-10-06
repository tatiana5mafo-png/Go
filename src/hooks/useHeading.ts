import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

/** Rumbo del teléfono en grados (0 = norte). Solo escucha el sensor mientras enabled sea true. */
export function useHeading(enabled: boolean): number | null {
  const [heading, setHeading] = useState<number | null>(null);
  const smooth = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      smooth.current = null;
      setHeading(null);
      return;
    }

    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      try {
        const s = await Location.watchHeadingAsync((h) => {
          const raw = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          const prev = smooth.current;
          if (prev === null) {
            smooth.current = raw;
            setHeading(Math.round(raw));
            return;
          }
          // Diferencia más corta entre dos ángulos (maneja el salto 359 -> 0)
          const delta = ((raw - prev + 540) % 360) - 180;
          if (Math.abs(delta) < 2) return; // ignora el temblor pequeño
          const next = (prev + delta * 0.3 + 360) % 360; // filtro paso bajo: movimiento suave
          smooth.current = next;
          setHeading(Math.round(next));
        });
        if (cancelled) s.remove();
        else sub = s;
      } catch {
        // sin permiso o sin sensor: la brújula simplemente no se activa
      }
    })();

    // Cleanup: se deja de escuchar el sensor al apagar la brújula o salir de la pantalla
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled]);

  return heading;
}