import { Coordinate } from '../types';
import { supabase } from './supabase';

export const COOLDOWN_MS = 5 * 60 * 1000;

export interface Reward {
  item: 'pokeball' | 'greatball' | 'potion';
  amount: number;
}

export type SpinResult =
  | { ok: true; rewards: Reward[]; cooldownUntil: string }
  | { ok: false; reason: 'too_far' | 'cooldown' | 'not_found' | 'error'; cooldownUntil?: string };

export const pokestopApi = {
  async spin(poiId: string, position: Coordinate): Promise<SpinResult> {
    const { data, error } = await supabase.functions.invoke('spin-pokestop', {
      body: { pokestopId: poiId, position },
    });
    if (error || !data) return { ok: false, reason: 'error' };
    return data as SpinResult;
  },
};