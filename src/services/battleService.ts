import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export interface BattlePayload {
  battleId: string;
  senderId: string;
  eventType: 'attack' | 'dodge' | 'damage' | 'health_update' | 'battle_end';
  damageAmount?: number;
  remainingHp?: number;
}

export class BattleService {
  private channel: RealtimeChannel | null = null;

  /**
   * Suscribe al cliente a una sala de combate en tiempo real vía Supabase Realtime WebSockets.
   * Requisitos 31 y 32 del parcial.
   */
  subscribeToBattle(
    battleId: string,
    onEvent: (payload: BattlePayload) => void,
  ): RealtimeChannel {
    this.channel = supabase.channel(`battle_${battleId}`, {
      config: {
        broadcast: { self: true },
      },
    });

    this.channel
      .on('broadcast', { event: 'battle_event' }, ({ payload }) => {
        onEvent(payload as BattlePayload);
      })
      .subscribe((status) => {
        console.log(`Estado de canal de batalla ${battleId}:`, status);
      });

    return this.channel;
  }

  /**
   * Transmite un evento de ataque/daño en tiempo real a todos los clientes suscritos.
   */
  async sendBattleEvent(payload: BattlePayload): Promise<void> {
    if (!this.channel) return;

    // 1. Transmitir por WebSocket WebSockets Broadcast
    await this.channel.send({
      type: 'broadcast',
      event: 'battle_event',
      payload,
    });

    // 2. Persistir evento en la tabla battle_events
    await supabase.from('battle_events').insert([
      {
        battle_id: payload.battleId,
        sender_id: payload.senderId,
        event_type: payload.eventType,
        payload: {
          damageAmount: payload.damageAmount || 0,
          remainingHp: payload.remainingHp || 0,
        },
      },
    ]);
  }

  /**
   * Cancela la suscripción y libera los recursos del canal WebSocket.
   */
  unsubscribe(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
