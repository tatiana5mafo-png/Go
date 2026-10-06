-- Migration 02: Row Level Security (RLS) Policies
-- Garantiza que un usuario NO pueda leer/modificar inventarios, Pokémon o cooldowns ajenos.

-- Habilitar RLS en todas las tablas
ALTER TABLE public.pokemon_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokemon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokemon_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captured_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokestops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokestop_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gymnasiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_spawns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_events ENABLE ROW LEVEL SECURITY;

-- 1. Tablas de datos públicos del juego (Lectura abierta a usuarios autenticados y anon)
CREATE POLICY "Lectura pública de pokemon_base" ON public.pokemon_base FOR SELECT USING (true);
CREATE POLICY "Lectura pública de types" ON public.types FOR SELECT USING (true);
CREATE POLICY "Lectura pública de pokemon_types" ON public.pokemon_types FOR SELECT USING (true);
CREATE POLICY "Lectura pública de moves" ON public.moves FOR SELECT USING (true);
CREATE POLICY "Lectura pública de pokemon_moves" ON public.pokemon_moves FOR SELECT USING (true);
CREATE POLICY "Lectura pública de pokestops" ON public.pokestops FOR SELECT USING (true);
CREATE POLICY "Lectura pública de gimnasios" ON public.gymnasiums FOR SELECT USING (true);
CREATE POLICY "Lectura pública de spawns activos" ON public.active_spawns FOR SELECT USING (expires_at > NOW());

-- 2. Profiles (Lectura de perfiles pública, pero edición restrictiva por auth.uid())
CREATE POLICY "Lectura de perfiles de usuario" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Inserción de propio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Actualización de propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. User Inventory (Estricta restricción por auth.uid())
CREATE POLICY "Ver propio inventario" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insertar en propio inventario" ON public.user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Actualizar propio inventario" ON public.user_inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Eliminar del propio inventario" ON public.user_inventory FOR DELETE USING (auth.uid() = user_id);

-- 4. Captured Instances (Estricta restricción por auth.uid())
CREATE POLICY "Ver propios Pokémon capturados" ON public.captured_instances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insertar propio Pokémon capturado" ON public.captured_instances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Actualizar propio Pokémon capturado" ON public.captured_instances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Eliminar propio Pokémon capturado" ON public.captured_instances FOR DELETE USING (auth.uid() = user_id);

-- 5. Pokéstop Cooldowns (Restricción por auth.uid())
CREATE POLICY "Ver propios cooldowns" ON public.pokestop_cooldowns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insertar propio cooldown" ON public.pokestop_cooldowns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Actualizar propio cooldown" ON public.pokestop_cooldowns FOR UPDATE USING (auth.uid() = user_id);

-- 6. Battles & Battle Events (Participantes autenticados)
CREATE POLICY "Ver batallas donde participa" ON public.battles FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id OR player2_id IS NULL);
CREATE POLICY "Crear o unirse a batalla" ON public.battles FOR INSERT WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "Actualizar estado de batalla" ON public.battles FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Ver eventos de batalla" ON public.battle_events FOR SELECT USING (true);
CREATE POLICY "Insertar evento de batalla propia" ON public.battle_events FOR INSERT WITH CHECK (auth.uid() = sender_id);
