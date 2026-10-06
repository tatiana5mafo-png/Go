import { CAMPUS_POLYGON } from '../constants/campus';
import { supabase } from '../services/supabase';
import { ActiveSpawn, Coordinate, PokemonBase } from '../types';
import { isPointInPolygon } from '../utils/geofence';
import { haversineMeters } from '../utils/haversine';

/** Genera un offset aleatorio en metros (aprox 1 grado lat = 111,000m) */
function getRandomOffsetInMeters(radiusMeters: number): { latOffset: number; lonOffset: number } {
  const r = radiusMeters / 111000;
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const latOffset = w * Math.cos(t);
  const lonOffset = (w * Math.sin(t)) / Math.cos(4.86 * (Math.PI / 180));
  return { latOffset, lonOffset };
}

/**
 * Motor de Spawning de Pokémon dentro del perímetro del Campus.
 * Requisito 20 del parcial.
 */
export class SpawnEngine {
  /**
   * Genera y retorna Pokémon activos dentro del campus y a <= 30 metros del usuario.
   */
  static async getNearbySpawns(userPos: Coordinate): Promise<ActiveSpawn[]> {
    // 1. Obtener lista de pokemon base
    const { data: allPokemon } = await supabase
      .from('pokemon_base')
      .select('*');

    if (!allPokemon || allPokemon.length === 0) {
      // Fallback local si la BD aún no está conectada
      return this.generateFallbackSpawns(userPos);
    }

    // 2. Consultar spawns activos en Supabase
    const { data: dbSpawns } = await supabase
      .from('active_spawns')
      .select('*, pokemon_base(*)')
      .gt('expires_at', new Date().toISOString())
      .eq('is_captured', false);

    let activeSpawns: ActiveSpawn[] = (dbSpawns as ActiveSpawn[]) || [];

    // 3. Si hay menos de 4 spawns en el campus, generar nuevos dentro del polígono
    if (activeSpawns.length < 4) {
      const newSpawns = await this.spawnNewPokemon(userPos, allPokemon as PokemonBase[], 4 - activeSpawns.length);
      activeSpawns = [...activeSpawns, ...newSpawns];
    }

    // 4. Filtrar únicamente los Pokémon dentro del radio de 30 metros del usuario (Requisito 20)
    return activeSpawns.filter((spawn) => {
      const dist = haversineMeters(userPos, { latitude: spawn.latitude, longitude: spawn.longitude });
      return dist <= 30; // Max 30m
    });
  }

  /**
   * Genera coordenadas candidatas dentro del polígono y guarda los spawns en Supabase.
   */
  private static async spawnNewPokemon(
    center: Coordinate,
    pokemonList: PokemonBase[],
    count: number,
  ): Promise<ActiveSpawn[]> {
    const created: ActiveSpawn[] = [];

    for (let i = 0; i < count; i++) {
      let candidatePos: Coordinate | null = null;
      let attempts = 0;

      // Buscar una coordenada válida dentro del polígono Ray-Casting
      while (!candidatePos && attempts < 20) {
        attempts++;
        const { latOffset, lonOffset } = getRandomOffsetInMeters(25);
        const testPos = {
          latitude: center.latitude + latOffset,
          longitude: center.longitude + lonOffset,
        };

        if (isPointInPolygon(testPos, CAMPUS_POLYGON)) {
          candidatePos = testPos;
        }
      }

      if (!candidatePos) candidatePos = center;

      // Seleccionar Pokémon aleatorio de la lista
      const selectedPkmn = pokemonList[Math.floor(Math.random() * pokemonList.length)];
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // TTL 15 minutos

      const newRecord = {
        pokemon_id: selectedPkmn.id,
        latitude: candidatePos.latitude,
        longitude: candidatePos.longitude,
        spawned_at: new Date().toISOString(),
        expires_at: expiresAt,
        is_captured: false,
      };

      const { data } = await supabase
        .from('active_spawns')
        .insert([newRecord])
        .select('*, pokemon_base(*)')
        .single();

      if (data) {
        created.push(data as ActiveSpawn);
      }
    }

    return created;
  }

  private static generateFallbackSpawns(userPos: Coordinate): ActiveSpawn[] {
    const dummyPokemon: PokemonBase[] = [
      {
        id: 'pkmn-1',
        pokedex_number: 25,
        name: 'Pikachu',
        base_hp: 35,
        base_attack: 55,
        base_defense: 40,
        base_catch_rate: 0.4,
        front_sprite_url: 'https://img.pokemondb.net/sprites/home/normal/pikachu.png',
        animated_sprite_url: 'https://img.pokemondb.net/sprites/black-white/anim/normal/pikachu.gif',
      },
      {
        id: 'pkmn-2',
        pokedex_number: 1,
        name: 'Bulbasaur',
        base_hp: 45,
        base_attack: 49,
        base_defense: 49,
        base_catch_rate: 0.45,
        front_sprite_url: 'https://img.pokemondb.net/sprites/home/normal/bulbasaur.png',
        animated_sprite_url: 'https://img.pokemondb.net/sprites/black-white/anim/normal/bulbasaur.gif',
      },
    ];

    return dummyPokemon.map((pkmn, idx) => ({
      id: `spawn-fallback-${idx}`,
      pokemon_id: pkmn.id,
      latitude: userPos.latitude + (idx === 0 ? 0.0001 : -0.0001),
      longitude: userPos.longitude + (idx === 0 ? 0.0001 : -0.0001),
      spawned_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      is_captured: false,
      pokemon_base: pkmn,
    }));
  }
}
