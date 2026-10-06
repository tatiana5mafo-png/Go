/**
 * Módulo de Cálculo de Combat Power (CP)
 * Requisito 8 del parcial.
 *
 * Fórmula Académica Explicada:
 * CP = max(10, floor( (AtkTotal * sqrt(DefTotal) * sqrt(HPTotal) * CPMultiplier) / 10 ))
 *
 * Variables:
 * - AtkTotal = baseAttack + ivAttack
 * - DefTotal = baseDefense + ivDefense
 * - HPTotal  = baseHp + ivHp
 * - CPMultiplier = Coeficiente de escalamiento según el nivel del Pokémon (Nivel 1 a 40)
 */

export function calculateCP(
  baseAttack: number,
  baseDefense: number,
  baseHp: number,
  ivAttack: number,
  ivDefense: number,
  ivHp: number,
  level: number = 1,
): number {
  // Coeficiente de nivel (CP Multiplier simplificado)
  const cpMultiplier = 0.094 * Math.sqrt(Math.min(Math.max(level, 1), 40));

  const totalAtk = baseAttack + ivAttack;
  const totalDef = baseDefense + ivDefense;
  const totalHp = baseHp + ivHp;

  const rawCP = (totalAtk * Math.sqrt(totalDef) * Math.sqrt(totalHp) * Math.pow(cpMultiplier, 2)) / 10;

  return Math.max(10, Math.floor(rawCP));
}
