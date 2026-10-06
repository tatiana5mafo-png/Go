import { supabase } from '../services/supabase';
import { Coordinate, ItemType, PokeStop } from '../types';
import { haversineMeters } from '../utils/haversine';

export interface SpinResult {
  success: boolean;
  message: string;
  itemsReceived?: { itemType: ItemType; quantity: number }[];
  cooldownUntil?: string;
}

export class PokestopService {
  /**
   * Obtiene la lista de Poképaradas registradas en la base de datos de Supabase.
   */
  static async getPokestops(): Promise<PokeStop[]> {
    const { data } = await supabase.from('pokestops').select('*').eq('is_active', true);
    if (!data || data.length === 0) {
      return [
        { id: '11111111-1111-1111-1111-111111111111', name: 'Biblioteca Octavio Arizmendi Posada', latitude: 4.860479, longitude: -74.033279, category: 'Biblioteca', is_active: true },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Edificio Ad Portas', latitude: 4.862400, longitude: -74.032500, category: 'Academico', is_active: true },
        { id: '33333333-3333-3333-3333-333333333333', name: 'Edificio O', latitude: 4.861200, longitude: -74.034500, category: 'Academico', is_active: true },
        { id: '44444444-4444-4444-4444-444444444444', name: 'Plazoleta Central y Kioskos', latitude: 4.860800, longitude: -74.033500, category: 'Recreativo', is_active: true },
        { id: '55555555-5555-5555-5555-555555555555', name: 'Complejo Deportivo y Canchas Sintéticas', latitude: 4.859200, longitude: -74.032800, category: 'Deporte', is_active: true },
      ];
    }
    return data as PokeStop[];
  }

  /**
   * Gira una Poképarada si el usuario está a <= 20 metros y no tiene cooldown activo.
   * Requisitos 18 y 19 del parcial.
   */
  static async spinPokestop(
    pokestop: PokeStop,
    userPos: Coordinate,
    userId: string,
  ): Promise<SpinResult> {
    // 1. Validar radio de interacción (<= 20 metros con Haversine)
    const distance = haversineMeters(userPos, {
      latitude: pokestop.latitude,
      longitude: pokestop.longitude,
    });

    if (distance > 20) {
      return {
        success: false,
        message: `Estás demasiado lejos (${Math.round(distance)} m). Acércate a menos de 20 metros.`,
      };
    }

    // 2. Comprobar cooldown persistido en Supabase
    const { data: cooldownData } = await supabase
      .from('pokestop_cooldowns')
      .select('cooldown_until')
      .eq('user_id', userId)
      .eq('pokestop_id', pokestop.id)
      .maybeSingle();

    if (cooldownData) {
      const cooldownUntil = new Date(cooldownData.cooldown_until);
      const now = new Date();
      if (now < cooldownUntil) {
        const remainingMinutes = Math.ceil((cooldownUntil.getTime() - now.getTime()) / 60000);
        return {
          success: false,
          message: `Esta Poképarada se está recargando. Vuelve en ${remainingMinutes} min.`,
          cooldownUntil: cooldownData.cooldown_until,
        };
      }
    }

    // 3. Generar recompensa aleatoria de consumibles
    const itemsReceived: { itemType: ItemType; quantity: number }[] = [
      { itemType: 'poke_ball', quantity: Math.floor(Math.random() * 3) + 2 }, // 2 a 4 Pokéballs
      { itemType: 'potion', quantity: Math.floor(Math.random() * 2) + 1 },    // 1 a 2 Pociones
    ];

    if (Math.random() > 0.5) {
      itemsReceived.push({ itemType: 'great_ball', quantity: 1 });
    }

    // 4. Actualizar inventario en Supabase
    for (const item of itemsReceived) {
      const { data: currentInv } = await supabase
        .from('user_inventory')
        .select('quantity')
        .eq('user_id', userId)
        .eq('item_type', item.itemType)
        .maybeSingle();

      const newQty = (currentInv?.quantity || 0) + item.quantity;

      await supabase.from('user_inventory').upsert({
        user_id: userId,
        item_type: item.itemType,
        quantity: newQty,
        updated_at: new Date().toISOString(),
      });
    }

    // 5. Iniciar cooldown de 5 minutos persistido en Supabase
    const newCooldownUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await supabase.from('pokestop_cooldowns').upsert({
      user_id: userId,
      pokestop_id: pokestop.id,
      last_spun_at: new Date().toISOString(),
      cooldown_until: newCooldownUntil,
    });

    return {
      success: true,
      message: '¡Poképarada girada con éxito!',
      itemsReceived,
      cooldownUntil: newCooldownUntil,
    };
  }
}
