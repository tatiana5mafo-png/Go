import { Coordinate } from '../types';

export type BallType = 'poke' | 'great' | 'ultra';
export type ThrowQuality = 'nice' | 'great' | 'excellent' | 'miss';

export interface SpawnDTO {
  id: string;
  dexNumber: number;
  coordinate: Coordinate;
  expiresAt: string; // ISO UTC
}

export interface CatchResultDTO {
  caught: boolean;
}

/** Contrato entre la app y el backend. La app solo depende de esto. */
export interface GameApi {
  getNearbySpawns(position: Coordinate): Promise<SpawnDTO[]>;
  attemptCatch(
    spawnId: string,
    ball: BallType,
    quality: ThrowQuality,
  ): Promise<CatchResultDTO>;
}

/** Implementación temporal. Se reemplaza por Supabase en la Fase 3. */
export const mockGameApi: GameApi = {
  async getNearbySpawns() {
    return [];
  },
  async attemptCatch() {
    return { caught: false };
  },
};

export const gameApi: GameApi = mockGameApi;