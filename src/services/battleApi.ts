import { Coordinate } from '../types';
import { supabase } from './supabase';

export interface BattleRow {
  id: string;
  gym_id: string;
  player1_id: string;
  player2_id: string | null;
  p1_pokemon_id: string;
  p2_pokemon_id: string | null;
  p1_hp: number;
  p2_hp: number | null;
  p1_max_hp: number;
  p2_max_hp: number | null;
  status: 'waiting' | 'active' | 'finished';
  winner_id: string | null;
  created_at: string;
}

export type JoinResult =
  | { ok: true; role: 'created' | 'joined'; battleId: string }
  | { ok: false; reason: 'gym_not_found' | 'too_far' | 'not_yours' | 'already_in_battle' | 'error'; battleId?: string };

export type ActResult =
  | {
      ok: true; action: 'attack'; damage: number; multiplier: number; move: string;
      stab: boolean; dodged: boolean; opponentHp: number; opponentMaxHp: number; finished: boolean;
    }
  | { ok: true; action: 'dodge' }
  | { ok: false; reason: 'cooldown' | 'finished' | 'not_active' | 'forbidden' | 'not_found' | 'error' };

export const battleApi = {
  async join(gymId: string, pokemonId: string, position: Coordinate): Promise<JoinResult> {
    const { data, error } = await supabase.functions.invoke('battle-join', {
      body: { gymId, pokemonId, position },
    });
    if (error || !data) return { ok: false, reason: 'error' };
    return data as JoinResult;
  },

  async act(battleId: string, action: 'attack' | 'dodge'): Promise<ActResult> {
    const { data, error } = await supabase.functions.invoke('battle-action', {
      body: { battleId, action },
    });
    if (error || !data) return { ok: false, reason: 'error' };
    return data as ActResult;
  },

  /** Lectura directa: el RLS solo deja ver combates en los que participas. */
  async fetch(battleId: string): Promise<BattleRow | null> {
    const { data } = await supabase.from('battles').select('*').eq('id', battleId).maybeSingle();
    return (data as BattleRow | null) ?? null;
  },
    /** Cierra un combate en espera. true = se canceló; false = alguien entró justo antes o falló la red. */
  async cancelWaiting(battleId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('cancel_waiting_battle', { p_battle: battleId });
    if (error) return false;
    return data === true;
  },
};