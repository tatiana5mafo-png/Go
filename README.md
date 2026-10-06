# Pokémon GO — UniSabana Campus Edition 📱⚡

Aplicación móvil funcional desarrollada para la **Evaluación Parcial de Desarrollo Móvil de la Universidad de La Sabana**.

---

## 1. Descripción
**Pokémon GO — UniSabana Campus Edition** es una aplicación móvil inspirada en Pokémon GO, delimitada geográficamente al campus de la Universidad de La Sabana en Chía, Colombia. La aplicación permite a los usuarios registrarse, autenticarse, recorrer el campus validado por GPS, girar Poképaradas a menos de 20 metros, capturar Pokémon salvajes mediante la cámara del celular con lanzamiento de Pokéballs por gestos y competir en batallas 1v1 en tiempo real dentro de los Gimnasios del campus.

---

## 2. Arquitectura del Proyecto
```text
/
├── App.tsx                    # Punto de entrada y navegador principal
├── app.json                   # Configuración de Expo SDK 57
├── package.json               # Dependencias y scripts
├── .env.example               # Plantilla de variables de entorno
├── src/
│   ├── components/            # Componentes reutilizables (OutOfBoundsModal)
│   ├── constants/             # Polígono del campus, POIs y constantes debug
│   ├── context/               # AuthContext para sesión con Supabase Auth
│   ├── hooks/                 # useLocation (GPS optimizado a 3s)
│   ├── screens/               # LoginScreen, RegisterScreen, MapScreen, CatchScreen, PokedexScreen, InventoryScreen, BattleScreen
│   ├── services/              # supabase.ts, spawnEngine.ts, pokestopService.ts, battleService.ts
│   ├── types/                 # Definición de interfaces TypeScript
│   └── utils/                 # geofence.ts, haversine.ts, cpCalculator.ts, catchProbability.ts, throwPhysics.ts, ivGenerator.ts
├── supabase/
│   ├── migrations/            # Migraciones SQL 3FN (01_schema.sql, 02_rls.sql)
│   └── seed/                  # Datos iniciales (03_seed_pokestops_gyms.sql, 04_seed_pokemon.sql)
├── scraping/
│   ├── scraper.py             # Web Scraper en Python para 151 Pokémon sin PokéAPI
│   ├── requirements.txt
│   └── README.md
├── tests/                     # Suite de pruebas unitarias Jest (gameLogic.test.ts)
└── docs/
    └── SUSTENTACION.md        # Guía técnica completa para la defensa oral del parcial
```

---

## 3. Tecnologías Principales
- **Frontend / Móvil:** React Native, Expo SDK 57, TypeScript.
- **Geolocalización & Sensores:** `expo-location`, `expo-sensors`, `react-native-maps`.
- **Cámara & Gestos:** `expo-camera`, Animated API / PanResponder.
- **Backend & BD:** Supabase (PostgreSQL 3FN, Supabase Auth, Row Level Security, Supabase Realtime WebSockets).
- **Web Scraping:** Python 3, BeautifulSoup, Requests (Sin PokéAPI).
- **Testing:** Jest, ts-jest.

---

## 4. Instalación y Configuración

### Prerrequisitos
- Node.js (v18+)
- Python 3.10+
- Expo Go en dispositivo móvil o simulador Android / iOS.

```bash
# 1. Clonar el repositorio e instalar dependencias JavaScript
npm install

# 2. Configurar variables de entorno
cp .env.example .env
```

---

## 5. Variables de Entorno (`.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

---

## 6. Ejecución de la Aplicación

```bash
# Iniciar servidor de desarrollo de Expo
npx expo start
```

---

## 7. Módulo de Scraping y Seed
```bash
# Ejecutar script de extracción en Python para obtener los 151 Pokémon
cd scraping
pip install -r requirements.txt
python scraper.py
```
Salidas generadas:
- `scraping/pokemon_scraped.json`
- `supabase/seed/04_seed_pokemon.sql`

---

## 8. Supabase, Migraciones SQL y RLS
Ejecuta las migraciones en el SQL Editor de tu proyecto en Supabase en este orden:
1. `supabase/migrations/01_schema.sql` (Creación de tablas 3FN)
2. `supabase/migrations/02_rls.sql` (Políticas de seguridad a nivel de fila `auth.uid()`)
3. `supabase/seed/03_seed_pokestops_gyms.sql` (Poképaradas y Gimnasios)
4. `supabase/seed/04_seed_pokemon.sql` (Los 151 Pokémon de Kanto)

---

## 9. Geofencing (Ray Casting) y GPS
- **Algoritmo:** Ray-Casting implementado en `src/utils/geofence.ts`.
- **Límites:** Polígono de 21 coordenadas en `src/constants/campus.ts`.
- **Comportamiento:** Si el usuario está fuera del perímetro, la app se congela y muestra `OutOfBoundsModal`.
- **Modo Debug:** Para probar sin estar en Chía, modifica `DEBUG_FAKE_POSITION` en `src/constants/debug.ts`.

---

## 10. Motor de Spawning y Poképaradas
- **Visibilidad Pokémon:** Filtrados a `<= 30 metros` del usuario con fórmula Haversine.
- **Poképaradas:** Interactuables únicamente a `<= 20 metros`. Entregan Pokéballs/Pociones e inician un cooldown de 5 minutos persistido en Supabase.

---

## 11. Captura con Cámara Real, Balística y CP
- **Cámara AR:** Activación nativa con `expo-camera` y superposición de sprites 2D.
- **Lanzamiento:** Captura de gestos swipe midiendo velocidad, ángulo e impacto en la Hitbox (`Nice`, `Great`, `Excellent`).
- **IVs & CP:** Asignación aleatoria de IVs (0–15) y cálculo de Combat Power mediante la fórmula de `src/utils/cpCalculator.ts`.

---

## 12. Batallas Realtime
Sincronización en vivo mediante WebSockets Broadcast de Supabase Realtime (`supabase.channel`) transmitiendo eventos de ataque, daño y salud de luchadores.

---

## 13. Pruebas Unitarias (Testing)
```bash
# Ejecutar suite de pruebas Jest
npx jest
```
Pruebas validadas:
- Ray-Casting dentro/fuera del campus.
- Distancias Haversine (0m, <20m, >20m, <30m, >30m).
- Valores de CP e IVs en rangos válidos (0-15).
- Probabilidades de captura (0.05 a 0.95).

---

## 14. Documentación para la Sustentación Oral
Para preparar la defensa oral ante el jurado evaluador, consulta el archivo:
📄 [`docs/SUSTENTACION.md`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/docs/SUSTENTACION.md)
Contiene explicaciones detalladas y **5 preguntas difíciles por módulo** con sus respuestas técnicas.
