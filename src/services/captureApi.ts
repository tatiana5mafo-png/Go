import { Coordinate } from '../types';
import { supabase } from './supabase';

export type BallType = 'pokeball' | 'greatball' | 'ultraball';
export type Quality = 'nice' | 'great' | 'excellent' | 'miss';

export type CaptureResult =
  | { ok: true; caught: false; ballsLeft: number }
  | {
      ok: true; caught: true; ballsLeft: number; capturedId: string; dexNumber: number;
      iv_attack: number; iv_defense: number; iv_hp: number;
    }
  | { ok: false; reason: 'expired' | 'too_far' | 'no_balls' | 'error'; ballsLeft?: number };

export const captureApi = {
  async capture(
    spawnId: string,
    ball: BallType,
    quality: Quality,
    position: Coordinate,
  ): Promise<CaptureResult> {
    // supabase-js envía solo el token de la sesión; el servidor saca de ahí quién eres.
    const { data, error } = await supabase.functions.invoke('capture-pokemon', {
      body: { spawnId, ball, quality, position },
    });
    if (error || !data) return { ok: false, reason: 'error' };
    return data as CaptureResult;
  },
};