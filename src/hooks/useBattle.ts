import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActResult, BattleRow, battleApi } from '../services/battleApi';
import { supabase } from '../services/supabase';

/** Evento cosmético que un celular le avisa al otro. No afecta la vida. */
export interface BattleFx {
  from: string;                    // user id de quien actuó
  kind: 'attack' | 'dodge';
  damage?: number;
  multiplier?: number;
  move?: string;
  at: number;                      // para que dos eventos iguales seguidos se noten
}

export function useBattle(battleId: string | null) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [battle, setBattle] = useState<BattleRow | null>(null);
  const [fx, setFx] = useState<BattleFx | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!battleId) { setBattle(null); setFx(null); return; }
    let cancelled = false;

    const channel = supabase
      .channel(`battle:${battleId}`, { config: { broadcast: { self: false } } })
      // Fuente de verdad: cada UPDATE de la fila llega a ambos jugadores
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${battleId}` },
        (payload) => { if (!cancelled) setBattle(payload.new as BattleRow); },
      )
      // Solo animación
      .on('broadcast', { event: 'fx' }, ({ payload }) => {
        if (!cancelled) setFx(payload as BattleFx);
      })
      .subscribe(async (status) => {
        // Al quedar suscrito, leemos el estado actual por si algo cambió antes
        if (status === 'SUBSCRIBED') {
          const row = await battleApi.fetch(battleId);
          if (!cancelled && row) setBattle(row);
        }
      });

    channelRef.current = channel;

    // Cleanup: cierra el WebSocket del canal al salir de la pantalla
    return () => {
      cancelled = true;
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [battleId]);

  /** Pide la acción al servidor y avisa al rival para que anime. */
  const act = useCallback(
    async (action: 'attack' | 'dodge'): Promise<ActResult> => {
      if (!battleId || !userId) return { ok: false, reason: 'error' };
      const res = await battleApi.act(battleId, action);
      if (res.ok) {
        const payload: BattleFx =
          res.action === 'attack'
            ? { from: userId, kind: 'attack', damage: res.damage, multiplier: res.multiplier, move: res.move, at: Date.now() }
            : { from: userId, kind: 'dodge', at: Date.now() };
        channelRef.current?.send({ type: 'broadcast', event: 'fx', payload });
      }
      return res;
    },
    [battleId, userId],
  );

  const isP1 = !!battle && battle.player1_id === userId;
  const view = battle && {
    status: battle.status,
    won: battle.winner_id === userId,
    winnerId: battle.winner_id,                       // NUEVO
    hadOpponent: battle.player2_id !== null,          // NUEVO
    createdAt: new Date(battle.created_at).getTime(), // NUEVO
    myHp: isP1 ? battle.p1_hp : battle.p2_hp ?? 0,
    myMax: isP1 ? battle.p1_max_hp : battle.p2_max_hp ?? 1,
    oppHp: isP1 ? battle.p2_hp ?? 0 : battle.p1_hp,
    oppMax: isP1 ? battle.p2_max_hp ?? 1 : battle.p1_max_hp,
    myPokemonId: isP1 ? battle.p1_pokemon_id : battle.p2_pokemon_id,
    oppPokemonId: isP1 ? battle.p2_pokemon_id : battle.p1_pokemon_id,
  };

  return { battle, view, fx, act, userId };
}