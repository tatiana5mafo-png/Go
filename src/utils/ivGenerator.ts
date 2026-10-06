/**
 * Genera Valores Individuales (IVs) aleatorios reproducibles entre 0 y 15.
 * Requisito 7 del parcial.
 */
export interface IVs {
  hp: number;
  attack: number;
  defense: number;
}

export function generateIVs(): IVs {
  return {
    hp: Math.floor(Math.random() * 16),      // 0 a 15
    attack: Math.floor(Math.random() * 16),  // 0 a 15
    defense: Math.floor(Math.random() * 16), // 0 a 15
  };
}
