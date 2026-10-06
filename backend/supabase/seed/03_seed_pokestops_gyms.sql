-- Seed de Poképaradas y Gimnasios oficiales del Campus UniSabana
-- Coordenadas reales exactas dentro del polígono del campus en Chía

-- Insertar Tipos de Pokémon Base en la tabla de tipos
INSERT INTO public.types (name) VALUES
  ('Grass'), ('Poison'), ('Fire'), ('Flying'), ('Water'),
  ('Bug'), ('Normal'), ('Electric'), ('Ground'), ('Fairy'),
  ('Fighting'), ('Psychic'), ('Rock'), ('Steel'), ('Ice'),
  ('Ghost'), ('Dragon')
ON CONFLICT (name) DO NOTHING;

-- 1. Insertar Poképaradas requeridas (Requisito 17)
INSERT INTO public.pokestops (id, name, latitude, longitude, category, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Biblioteca Octavio Arizmendi Posada', 4.860479, -74.033279, 'Biblioteca', true),
  ('22222222-2222-2222-2222-222222222222', 'Edificio Ad Portas', 4.862400, -74.032500, 'Academico', true),
  ('33333333-3333-3333-3333-333333333333', 'Edificio O', 4.861200, -74.034500, 'Academico', true),
  ('44444444-4444-4444-4444-444444444444', 'Plazoleta Central y Kioskos', 4.860800, -74.033500, 'Recreativo', true),
  ('55555555-5555-5555-5555-555555555555', 'Complejo Deportivo y Canchas Sintéticas', 4.859200, -74.032800, 'Deporte', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- 2. Insertar Gimnasios del Campus (Requisito 30)
INSERT INTO public.gymnasiums (id, name, latitude, longitude, controlling_team, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Gimnasio Ad Portas', 4.862600, -74.032900, 'Valor', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gimnasio Lago UniSabana', 4.861600, -74.032000, 'Mystic', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Gimnasio Puente del Común', 4.858600, -74.033800, 'Instinct', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;
