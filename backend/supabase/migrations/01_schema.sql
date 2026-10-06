-- Migration 01: Core Schema 3FN para Pokémon GO — UniSabana Campus Edition
-- Habilitar extensión pgcrypto para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. pokemon_base
CREATE TABLE IF NOT EXISTS public.pokemon_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pokedex_number INT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    base_hp INT NOT NULL,
    base_attack INT NOT NULL,
    base_defense INT NOT NULL,
    base_catch_rate FLOAT NOT NULL DEFAULT 0.40,
    front_sprite_url TEXT NOT NULL,
    animated_sprite_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. types & pokemon_types (Normalización N:M)
CREATE TABLE IF NOT EXISTS public.types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pokemon_types (
    pokemon_id UUID REFERENCES public.pokemon_base(id) ON DELETE CASCADE,
    type_id UUID REFERENCES public.types(id) ON DELETE CASCADE,
    PRIMARY KEY (pokemon_id, type_id)
);

-- 3. moves & pokemon_moves
CREATE TABLE IF NOT EXISTS public.moves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type_id UUID REFERENCES public.types(id) ON DELETE CASCADE,
    power INT NOT NULL DEFAULT 10,
    energy INT NOT NULL DEFAULT 5,
    is_fast BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.pokemon_moves (
    pokemon_id UUID REFERENCES public.pokemon_base(id) ON DELETE CASCADE,
    move_id UUID REFERENCES public.moves(id) ON DELETE CASCADE,
    PRIMARY KEY (pokemon_id, move_id)
);

-- 4. profiles (Asociado a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    team TEXT CHECK (team IN ('Valor', 'Mystic', 'Instinct', 'SinEquipo')) DEFAULT 'SinEquipo',
    level INT NOT NULL DEFAULT 1,
    stardust INT NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. user_inventory
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('poke_ball', 'great_ball', 'ultra_ball', 'potion', 'super_potion', 'revive')),
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, item_type)
);

-- 6. captured_instances
CREATE TABLE IF NOT EXISTS public.captured_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    pokemon_id UUID REFERENCES public.pokemon_base(id) ON DELETE CASCADE NOT NULL,
    nickname TEXT,
    level INT NOT NULL DEFAULT 1,
    iv_hp INT NOT NULL CHECK (iv_hp >= 0 AND iv_hp <= 15),
    iv_attack INT NOT NULL CHECK (iv_attack >= 0 AND iv_attack <= 15),
    iv_defense INT NOT NULL CHECK (iv_defense >= 0 AND iv_defense <= 15),
    cp INT NOT NULL CHECK (cp >= 10),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. pokestops
CREATE TABLE IF NOT EXISTS public.pokestops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    category TEXT NOT NULL DEFAULT 'academico',
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 8. pokestop_cooldowns
CREATE TABLE IF NOT EXISTS public.pokestop_cooldowns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    pokestop_id UUID REFERENCES public.pokestops(id) ON DELETE CASCADE NOT NULL,
    last_spun_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cooldown_until TIMESTAMPTZ NOT NULL,
    UNIQUE (user_id, pokestop_id)
);

-- 9. gimnasios
CREATE TABLE IF NOT EXISTS public.gymnasiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    controlling_team TEXT CHECK (controlling_team IN ('Valor', 'Mystic', 'Instinct', 'Neutral')) DEFAULT 'Neutral',
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 10. active_spawns
CREATE TABLE IF NOT EXISTS public.active_spawns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pokemon_id UUID REFERENCES public.pokemon_base(id) ON DELETE CASCADE NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    spawned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_captured BOOLEAN NOT NULL DEFAULT false
);

-- 11. battles
CREATE TABLE IF NOT EXISTS public.battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gymnasiums(id) ON DELETE CASCADE NOT NULL,
    player1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    player2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'finished')) DEFAULT 'waiting',
    winner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. battle_events
CREATE TABLE IF NOT EXISTS public.battle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_id UUID REFERENCES public.battles(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('attack', 'dodge', 'damage', 'health_update', 'battle_start', 'battle_end')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para acelerar consultas geoespaciales y de usuario
CREATE INDEX IF NOT EXISTS idx_active_spawns_expires ON public.active_spawns(expires_at);
CREATE INDEX IF NOT EXISTS idx_captured_instances_user ON public.captured_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_pokestop_cooldowns_user_stop ON public.pokestop_cooldowns(user_id, pokestop_id);
