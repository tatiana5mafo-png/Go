import { ThrowQuality } from '../types';

export interface ThrowMetrics {
  velocityX: number;
  velocityY: number;
  speed: number;
  angle: number;
  quality: ThrowQuality;
}

/**
 * Procesa el gesto de swipe del usuario para calcular velocidad, ángulo y precisión.
 * Requisitos 24, 25, 26 del parcial.
 */
export function calculateThrow(
  startX: number,
  startY: number,
  endY: number,
  endX: number,
  durationMs: number,
  targetX: number,
  targetY: number,
  targetRadius: number,
): ThrowMetrics {
  const dt = Math.max(durationMs / 1000, 0.05); // evitar división por cero

  const dx = endX - startX;
  const dy = startY - endY; // Invertido porque en pantalla Y crece hacia abajo

  const velocityX = dx / dt;
  const velocityY = dy / dt;
  const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
  const angle = Math.atan2(dy, dx);

  // Distancia del impacto al centro de la hitbox del Pokémon
  const distanceToTarget = Math.sqrt(
    Math.pow(endX - targetX, 2) + Math.pow(endY - targetY, 2),
  );

  let quality: ThrowQuality = 'miss';
  if (distanceToTarget <= targetRadius * 0.25) {
    quality = 'excellent';
  } else if (distanceToTarget <= targetRadius * 0.6) {
    quality = 'great';
  } else if (distanceToTarget <= targetRadius * 1.0) {
    quality = 'nice';
  }

  return {
    velocityX,
    velocityY,
    speed,
    angle,
    quality,
  };
}

/**
 * Calcula la posición (x, y) en el tiempo t para una trayectoria parabólica de la Pokéball.
 * x(t) = x0 + vx * t
 * y(t) = y0 - (vy * t - 0.5 * g * t^2)
 */
export function getParabolicPosition(
  x0: number,
  y0: number,
  vx: number,
  vy: number,
  t: number,
  gravity: number = 980,
) {
  const x = x0 + vx * t * 0.3;
  const y = y0 - (vy * t * 0.4 - 0.5 * gravity * t * t);
  return { x, y };
}
