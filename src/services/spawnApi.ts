import { Coordinate } from '../types';
import { supabase } from './supabase';

export interface Spawn {
  id: string;
  dexNumber: number;
  name: string;
  spriteUrl: string | null;
  coordinate: Coordinate;
  expiresAt: number; // milisegundos desde epoch
}

/** Spawns vigentes. El RLS ya filtra los vencidos en el servidor. */
export async function fetchActiveSpawns(): Promise<Spawn[]> {
  const { data, error } = await supabase
    .from('spawns')
    .select('id, dex_number, latitude, longitude, expires_at, pokemon_base(name, sprite_url)');

  if (error) throw error;

  return (data ?? []).map((r: any) => {
    const b = Array.isArray(r.pokemon_base) ? r.pokemon_base[0] : r.pokemon_base;
    return {
      id: r.id,
      dexNumber: r.dex_number,
      name: b?.name ?? `#${r.dex_number}`,
      spriteUrl: b?.sprite_url ?? null,
      coordinate: { latitude: r.latitude, longitude: r.longitude },
      expiresAt: new Date(r.expires_at).getTime(),
    };
  });
}