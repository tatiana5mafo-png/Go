import { supabase } from './supabase';

export interface PokedexEntry {
  dexNumber: number;
  name: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseCatchRate: number;
  spriteUrl: string | null;
  types: string[];
  captured: boolean;
}

export interface CapturedInstance {
  id: string;
  dexNumber: number;
  ivHp: number;
  ivAttack: number;
  ivDefense: number;
  capturedAt: string;
}

export interface PokemonMove {
  id: number;
  name: string;
  kind: string;
  power: number | null;
  type: string | null;
}

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('No hay sesión activa');
  return data.user.id;
}

/** Los 151 con sus tipos, marcando cuáles tiene capturados el usuario. */
export async function fetchPokedex(): Promise<PokedexEntry[]> {
  const userId = await getUserId();

  const [base, mine] = await Promise.all([
    supabase
      .from('pokemon_base')
      .select(
        'dex_number, name, base_hp, base_attack, base_defense, base_catch_rate, sprite_url, pokemon_types(slot, types(name))'
      )
      .order('dex_number', { ascending: true }),
    supabase.from('captured_instances').select('dex_number').eq('user_id', userId),
  ]);

  if (base.error) throw base.error;
  if (mine.error) throw mine.error;

  const capturedSet = new Set<number>((mine.data ?? []).map((r: any) => r.dex_number));

  return (base.data ?? []).map((p: any) => ({
    dexNumber: p.dex_number,
    name: p.name,
    baseHp: p.base_hp,
    baseAttack: p.base_attack,
    baseDefense: p.base_defense,
    baseCatchRate: Number(p.base_catch_rate),
    spriteUrl: p.sprite_url,
    types: [...(p.pokemon_types ?? [])]
      .sort((a: any, b: any) => a.slot - b.slot)
      .map((pt: any) => pt.types?.name)
      .filter(Boolean),
    captured: capturedSet.has(p.dex_number),
  }));
}

/** Instancias capturadas de un Pokémon por el usuario actual. */
export async function fetchInstances(dexNumber: number): Promise<CapturedInstance[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('captured_instances')
    .select('id, dex_number, iv_hp, iv_attack, iv_defense, captured_at')
    .eq('user_id', userId)
    .eq('dex_number', dexNumber)
    .order('captured_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    dexNumber: r.dex_number,
    ivHp: r.iv_hp,
    ivAttack: r.iv_attack,
    ivDefense: r.iv_defense,
    capturedAt: r.captured_at,
  }));
}

/** Movimientos disponibles de un Pokémon (se pide solo al abrir el detalle). */
export async function fetchMoves(dexNumber: number): Promise<PokemonMove[]> {
  const { data, error } = await supabase
    .from('pokemon_moves')
    .select('moves(id, name, kind, power, types(name))')
    .eq('dex_number', dexNumber);

  if (error) throw error;
  return (data ?? [])
    .map((r: any) => r.moves)
    .filter(Boolean)
    .map((m: any) => ({
      id: m.id,
      name: m.name,
      kind: m.kind,
      power: m.power,
      type: m.types?.name ?? null,
    }));
}
export interface MyPokemon {
  id: string;
  dexNumber: number;
  name: string;
  spriteUrl: string | null;
  types: string[];
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  ivHp: number;
  ivAttack: number;
  ivDefense: number;
  capturedAt: string;
}

/** Todas las capturas del usuario con los datos base de cada especie. */
export async function fetchMyPokemon(): Promise<MyPokemon[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('captured_instances')
    .select(
      'id, dex_number, iv_hp, iv_attack, iv_defense, captured_at, pokemon_base(name, base_hp, base_attack, base_defense, sprite_url, pokemon_types(slot, types(name)))'
    )
    .eq('user_id', userId)
    .order('captured_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r: any) => {
    const b = Array.isArray(r.pokemon_base) ? r.pokemon_base[0] : r.pokemon_base;
    return {
      id: r.id,
      dexNumber: r.dex_number,
      name: b?.name ?? `#${r.dex_number}`,
      spriteUrl: b?.sprite_url ?? null,
      types: [...(b?.pokemon_types ?? [])]
        .sort((x: any, y: any) => x.slot - y.slot)
        .map((pt: any) => pt.types?.name)
        .filter(Boolean),
      baseHp: b?.base_hp ?? 0,
      baseAttack: b?.base_attack ?? 0,
      baseDefense: b?.base_defense ?? 0,
      ivHp: r.iv_hp,
      ivAttack: r.iv_attack,
      ivDefense: r.iv_defense,
      capturedAt: r.captured_at,
    };
  });
}

/** Total de especies en la base (para "X de 151 registradas"). */
export async function fetchSpeciesTotal(): Promise<number> {
  const { count, error } = await supabase
    .from('pokemon_base')
    .select('dex_number', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}