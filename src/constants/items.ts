export type ItemId = 'pokeball' | 'greatball' | 'ultraball' | 'potion' | 'revive' | 'berry';
export type ItemCategory = 'balls' | 'healing';

export interface ItemDef {
  id: ItemId;
  name: string;
  desc: string;
  emoji: string;
  category: ItemCategory;
  tint: string; // color de fondo del icono
}

/** Catálogo local. En la Fase 4 viene de Supabase. */
export const ITEM_CATALOG: readonly ItemDef[] = [
  { id: 'pokeball', name: 'Poké Ball', desc: 'Básica para atrapar Pokémon.', emoji: '⚪', category: 'balls', tint: '#fee2e2' },
  { id: 'greatball', name: 'Super Ball', desc: 'Mejor ratio de captura.', emoji: '🔵', category: 'balls', tint: '#dbeafe' },
  { id: 'ultraball', name: 'Ultra Ball', desc: 'Alto rendimiento. Élite.', emoji: '🟡', category: 'balls', tint: '#fef9c3' },
  { id: 'potion', name: 'Poción', desc: 'Restaura salud.', emoji: '🧪', category: 'healing', tint: '#dbeafe' },
  { id: 'revive', name: 'Revivir', desc: 'Revive a un Pokémon.', emoji: '💖', category: 'healing', tint: '#fef3c7' },
  { id: 'berry', name: 'Baya Frambu', desc: 'Mejora la captura.', emoji: '🍓', category: 'healing', tint: '#fee2e2' },
];

export const ITEM_BY_ID = Object.fromEntries(
  ITEM_CATALOG.map((i) => [i.id, i]),
) as Record<ItemId, ItemDef>;