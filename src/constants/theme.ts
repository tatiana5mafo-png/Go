/**
 * Sistema de Diseño Visual — Pokémon GO: UniSabana Campus Edition
 * Paleta de colores oficial, colores de tipos elementales y estilos de juego.
 */

export const POKEMON_COLORS = {
  // Principales
  yellow: '#FFCB05',
  blue: '#2A75BB',
  darkBlue: '#173A73',
  pokeRed: '#EE1515',
  darkRed: '#CC0000',
  white: '#FFFFFF',
  darkCharcoal: '#0F172A',
  cardBg: '#1E293B',
  surfaceBorder: '#334155',

  // Tipos Elementales
  types: {
    Grass: '#49C16D',
    Poison: '#AA5599',
    Fire: '#FF8C32',
    Water: '#48B9ED',
    Bug: '#A8B820',
    Normal: '#A8A878',
    Flying: '#A890F0',
    Electric: '#FFCB05',
    Ground: '#D9B35A',
    Fairy: '#F58AC5',
    Fighting: '#C03028',
    Psychic: '#A16AE8',
    Rock: '#B8A038',
    Steel: '#B8B8D0',
    Ice: '#98D8D8',
    Ghost: '#705898',
    Dragon: '#7038F8',
    Dark: '#705848',
  } as Record<string, string>,

  // Equipos
  teams: {
    Valor: '#EE1515',
    Mystic: '#2A75BB',
    Instinct: '#FFCB05',
    SinEquipo: '#94A3B8',
  },
};

export const GAME_SHADOWS = {
  button3D: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  cardGlow: {
    shadowColor: '#2A75BB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
};
