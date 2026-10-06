/** IV máximo por estadística (el enunciado define IVs de 0 a 15). */
export const IV_MAX = 15;

export interface BaseStats {
  baseAttack: number;
  baseDefense: number;
  baseHp: number;
}

export interface Ivs {
  ivAttack: number;
  ivDefense: number;
  ivHp: number;
}

/**
 * Puntos de Combate (versión simplificada, sin niveles):
 * CP = max(10, floor((ataque + ivAtaque) · √(defensa + ivDefensa) · √(ps + ivPs) / 10))
 */
export function computeCp(base: BaseStats, iv: Ivs): number {
  const attack = base.baseAttack + iv.ivAttack;
  const defense = base.baseDefense + iv.ivDefense;
  const hp = base.baseHp + iv.ivHp;
  return Math.max(10, Math.floor((attack * Math.sqrt(defense) * Math.sqrt(hp)) / 10));
}

/** Perfección de los IVs, de 0 a 100. */
export function ivPerfection(iv: Ivs): number {
  return Math.round(((iv.ivAttack + iv.ivDefense + iv.ivHp) / (IV_MAX * 3)) * 100);
}