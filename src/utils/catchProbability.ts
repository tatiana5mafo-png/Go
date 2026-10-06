import { ItemType, ThrowQuality } from '../types';

/**
 * Calcula la probabilidad de captura basada en tasa base, calidad del lanzamiento y tipo de bola.
 * Requisito 27 del parcial.
 */
export function calculateCatchProbability(
  baseCatchRate: number,
  quality: ThrowQuality,
  ballType: ItemType = 'poke_ball',
): number {
  if (quality === 'miss') return 0;

  // Multiplicador por calidad del lanzamiento
  let qualityMultiplier = 1.0;
  if (quality === 'nice') qualityMultiplier = 1.15;
  if (quality === 'great') qualityMultiplier = 1.45;
  if (quality === 'excellent') qualityMultiplier = 1.85;

  // Multiplicador por tipo de Pokéball
  let ballMultiplier = 1.0;
  if (ballType === 'great_ball') ballMultiplier = 1.5;
  if (ballType === 'ultra_ball') ballMultiplier = 2.0;

  const rawProbability = baseCatchRate * qualityMultiplier * ballMultiplier;

  // Acotar probabilidad entre 5% y 95%
  return Math.min(0.95, Math.max(0.05, rawProbability));
}

/**
 * Evalúa el intento de captura comparando con un número aleatorio uniformemente distribuido.
 */
export function attemptCatchRoll(probability: number): boolean {
  if (probability <= 0) return false;
  return Math.random() < probability;
}
