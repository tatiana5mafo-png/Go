# Guía Completa de Defensa Oral para la Evaluación Parcial
## Pokémon GO — UniSabana Campus Edition

Esta guía contiene la documentación técnica detallada para defender oralmente cada módulo de la aplicación ante el profesor o jurado evaluador.

---

## MÓDULO 1: GEOFENCING Y ALGORITMO RAY-CASTING

### 1.1 ¿Qué hace?
Determina geométricamente si la posición geográfica actual del usuario (Latitud, Longitud) se encuentra dentro o fuera del polígono delimitado del Campus de la Universidad de La Sabana.

### 1.2 ¿Dónde está?
- **Filtro y Algoritmo:** [`src/utils/geofence.ts`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/utils/geofence.ts) -> `isPointInPolygon()`.
- **Coordenadas del Polígono:** [`src/constants/campus.ts`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/constants/campus.ts) -> `CAMPUS_POLYGON`.
- **Integración UI:** [`src/screens/MapScreen.tsx`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/screens/MapScreen.tsx) y [`src/components/OutOfBoundsModal.tsx`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/components/OutOfBoundsModal.tsx).

### 1.3 ¿Cómo funciona?
Implementa el algoritmo matemático de **Ray Casting (Even-Odd Rule)**:
1. Traza un rayo semi-infinito horizontal hacia el este desde el punto del usuario `(x, y)`.
2. Itera sobre cada segmento del polígono `(j -> i)`.
3. Verifica si el rayo cruza el segmento mediante la ecuación de intersección de rectas.
4. Si el número total de cruces es **impar**, el punto está **DENTRO** del campus. Si es **par**, está **FUERA**.

### 1.4 ¿Por qué se implementó así?
Porque Ray-Casting es un algoritmo determinista eficiente sin dependencias de librerías nativas pesadas de GIS, garantizando ejecuciones rápidas directamente en JavaScript.

### 1.5 Complejidad
- **Temporal:** \(O(N)\) donde \(N\) es el número de vértices del polígono (\(N = 21\)).
- **Espacial:** \(O(1)\) memoria constante.

### 1.6 Preguntas de Defensa (5 Preguntas Difíciles)

#### Pregunta 1: ¿Por qué utilizaste Ray Casting en lugar de comparar distancias a un punto central?
**Respuesta:** Porque el campus de la Universidad de La Sabana no es un círculo perfecto. Tiene una forma irregular alargada con construcciones como Ad Portas y la cancha de fútbol. Un radio circular incluiría zonas fuera de los límites (como la autopista) o excluiría zonas oficiales. El polígono con Ray-Casting se ajusta exactamente al perímetro.

#### Pregunta 2: ¿Qué complejidad matemática tiene este algoritmo y por qué no afecta el rendimiento del hilo principal (UI)?
**Respuesta:** Tiene complejidad \(O(N)\), siendo \(N=21\) vértices. Para evitar recálculos innecesarios en la interfaz, envolvemos la llamada en `useMemo()` dentro de `MapScreen.tsx`, ejecutándolo únicamente cuando las coordenadas del GPS cambian significativamente.

#### Pregunta 3: ¿Qué sucede en los casos de borde (Boundary Cases), por ejemplo, si el usuario está exactamente sobre la línea del polígono?
**Respuesta:** En cálculo numérico de coma flotante (Float64), la probabilidad de que una coordenada GPS de 6 decimales coincida exactamente sobre una recta es casi nula. En caso de borde, la condición `>=` o `<=` del Ray-Casting evalúa de manera determinista hacia dentro o fuera sin romper la ejecución.

#### Pregunta 4: ¿Por qué se separaron las coordenadas del polígono en un archivo de constantes independiente?
**Respuesta:** Para cumplir con el principio de responsabilidad única y facilitar la mantenibilidad. Si la universidad amplía sus instalaciones, basta con editar `campus.ts` sin alterar la lógica de geofencing.

#### Pregunta 5: ¿Qué diferencia hay entre este cálculo en 2D euclidiano y un cálculo esférico sobre la Tierra?
**Respuesta:** En extensiones pequeñas (como un campus universitario de ~1 km²), la curvatura terrestre es despreciable. La proyección euclidiana 2D ofrece un error inferior a milímetros con un costo computacional mucho menor que la trigonometría esférica compleja.

---

## MÓDULO 2: GPS, BATERÍA Y OPTIMIZACIÓN DE LISTENERS

### 2.1 ¿Qué hace?
Gestión eficiente del hardware de GPS móvil mediante `expo-location`, controlando intervalos de tiempo, precisión y ciclo de vida de componentes.

### 2.2 ¿Dónde está?
[`src/hooks/useLocation.ts`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/hooks/useLocation.ts).

### 2.3 ¿Cómo funciona?
Utiliza `Location.watchPositionAsync()` configurado con:
- `timeInterval: 3000` (actualiza máximo cada 3 segundos, cumpliendo el Requisito 14).
- `distanceInterval: 2` (ignora movimientos insignificantes de menos de 2 metros).
- `accuracy: Location.Accuracy.Balanced`.

### 2.4 Preguntas de Defensa (5 Preguntas Difíciles)

#### Pregunta 1: ¿Cómo previenes fugas de memoria (memory leaks) con el sensor de GPS?
**Respuesta:** En la función de cleanup del `useEffect` en `useLocation.ts`, invocamos `subscription.remove()` y activamos un flag booleano `cancelled = true` para cancelar callbacks asíncronos si el componente se desmonta antes de recibir la respuesta de permisos.

#### Pregunta 2: ¿Por qué elegiste un intervalo de 3000 ms y no updates en tiempo real continuo (e.g. 100 ms)?
**Respuesta:** Para lograr un equilibrio óptimo entre precisión de juego y consumo de batería. Actualizar el GPS cada 100 ms mantendría el chip de GPS en máximo consumo térmico y agotaría la batería rápidamente. 3 segundos es la frecuencia ideal para caminata humana (~1.4 m/s).

#### Pregunta 3: ¿Cómo maneja la aplicación el caso de permisos denegados o GPS desactivado?
**Respuesta:** El hook retorna un estado `status: 'denied'`. Al detectarse, `MapScreen.tsx` activa el componente `OutOfBoundsModal` con la razón `'denied'`, bloqueando los gestos e interacciones hasta que el usuario conceda permisos en Ajustes.

#### Pregunta 4: ¿Qué técnica utilizaste para permitir pruebas de desarrollo sin tener que caminar físicamente por el campus?
**Respuesta:** Creamos una constante `DEBUG_FAKE_POSITION` en `src/constants/debug.ts`. Cuando contiene coordenadas, anula temporalmente la lectura del sensor real, permitiendo probar la app desde cualquier lugar.

#### Pregunta 5: ¿Qué diferencia existe entre `requestForegroundPermissionsAsync` y permisos en segundo plano?
**Respuesta:** `Foreground` sólo accede a la ubicación mientras la aplicación está abierta y visible en pantalla, protegiendo la privacidad del usuario y reduciendo drásticamente el consumo de batería en comparación con `Background`.

---

## MÓDULO 3: BASE DE DATOS SUPABASE, 3FN Y ROW LEVEL SECURITY (RLS)

### 3.1 ¿Qué hace?
Persistencia de datos en PostgreSQL 3FN respaldada por políticas de seguridad RLS a nivel de fila mediante `auth.uid()`.

### 3.2 ¿Dónde está?
- **Schema & Migraciones:** [`supabase/migrations/01_schema.sql`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/supabase/migrations/01_schema.sql).
- **Políticas RLS:** [`supabase/migrations/02_rls.sql`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/supabase/migrations/02_rls.sql).
- **Seed SQL:** [`supabase/seed/03_seed_pokestops_gyms.sql`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/supabase/seed/03_seed_pokestops_gyms.sql) y [`supabase/seed/04_seed_pokemon.sql`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/supabase/seed/04_seed_pokemon.sql).

### 3.3 Preguntas de Defensa (5 Preguntas Difíciles)

#### Pregunta 1: Explica la Tercera Forma Normal (3FN) aplicada al esquema de Pokémon y sus tipos.
**Respuesta:** La 3FN exige que todo atributo no clave dependa únicamente de la clave primaria. No almacenamos los tipos como cadenas de texto repetidas en `pokemon_base`. En su lugar, creamos la tabla `types` y una tabla intermedia de unión `pokemon_types` con llaves foráneas `(pokemon_id, type_id)`, eliminando la redundancia y permitiendo consultas normalizadas.

#### Pregunta 2: ¿Cómo funciona Row Level Security (RLS) en Supabase para proteger el inventario de un usuario?
**Respuesta:** Habilitamos `ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;` y definimos una política `FOR SELECT USING (auth.uid() = user_id);`. El motor de PostgreSQL evalúa la firma JWT del token de sesión enviado por el cliente; si el `user_id` de la fila no coincide con `auth.uid()`, la consulta devuelve 0 registros, impidiendo lecturas o manipulaciones ajenas a nivel de base de datos.

#### Pregunta 3: ¿Por qué se utiliza `TIMESTAMPTZ` (Timestamp with Time Zone) en lugar de cadenas simples?
**Respuesta:** Porque garantiza que los tiempos de expiración de spawns y cooldowns de Poképaradas se registren en UTC estándar. Esto evita vulnerabilidades donde el usuario cambie la hora local de su teléfono para engañar al cooldown de 5 minutos.

#### Pregunta 4: ¿Qué diferencia hay entre la clave anónima (`anon key`) y la clave de rol de servicio (`service role key`)?
**Respuesta:** La `anon key` es segura para incluirse en el código cliente de React Native porque respeta todas las reglas de RLS. La `service role key` omite completamente RLS y otorga privilegios de superusuario; **nunca** debe incluirse en la aplicación móvil.

#### Pregunta 5: ¿Cómo se maneja la relación entre la tabla `auth.users` de Supabase Auth y la tabla `profiles`?
**Respuesta:** La tabla `profiles` utiliza la misma clave primaria UUID `id` referenciando `auth.users(id) ON DELETE CASCADE`. Al registrarse un usuario en `AuthContext.tsx`, se inserta automáticamente su perfil correspondiente en `profiles`.

---

## MÓDULO 4: WEB SCRAPING EN PYTHON (NO POKÉAPI)

### 4.1 ¿Qué hace?
Script de automatización en Python que extrae directamente del HTML de PokémonDB los datos completos de los 151 Pokémon de Kanto sin consumir la PokéAPI, generando un JSON estructurado y el seed SQL.

### 4.2 ¿Dónde está?
[`scraping/scraper.py`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/scraping/scraper.py).

### 4.3 Preguntas de Defensa (5 Preguntas Difíciles)

#### Pregunta 1: ¿Por qué no se utilizó la PokéAPI?
**Respuesta:** Cumpliendo estrictamente con el **Requisito 5** del enunciado parcial, el cual prohíbe el uso de PokéAPI para evaluar la capacidad del estudiante de construir un canal de ingesta de datos mediante Web Scraping real utilizando BeautifulSoup y parsing del DOM HTML.

#### Pregunta 2: ¿Cómo maneja el scraper los nombres con caracteres especiales como Nidoran♀ y Nidoran♂?
**Respuesta:** Implementamos una función `clean_slug()` que convierte nombres a minusculas, elimina caracteres especiales y reemplaza `♂` por `-m` y `♀` por `-f` para generar URLs de imágenes válidas en el servidor CDN de PokémonDB, además de reconfigurar `sys.stdout` a codificación UTF-8.

#### Pregunta 3: ¿Cómo se evitan duplicados en la base de datos al ejecutar el scraper múltiples veces?
**Respuesta:** El script genera instrucciones SQL con la cláusula `ON CONFLICT (pokedex_number) DO UPDATE SET...`, lo cual garantiza idempotencia: la migración puede ejecutarse varias veces sin duplicar filas ni causar errores de llave primaria.

#### Pregunta 4: ¿Qué estrategia de Rate Limiting y User-Agent se implementó?
**Respuesta:** Enviamos encabezados HTTP simulando un navegador Chrome actualizado (`User-Agent`) y realizamos la extracción iterativa parseando la tabla maestra `#pokedex` de PokémonDB en una sola solicitud HTTP masiva para no saturar el servidor de origen.

#### Pregunta 5: ¿De dónde provienen los sprites animados e imágenes frontales?
**Respuesta:** De los servidores CDN estables de PokémonDB (`https://img.pokemondb.net/sprites/home/normal/` y `https://img.pokemondb.net/sprites/black-white/anim/normal/`).

---

## MÓDULO 5: CAPTURA, CÁMARA, GESTOS Y FÍSICA BALÍSTICA

### 5.1 ¿Qué hace?
Proporciona el modo de captura AR activando la cámara nativa con `expo-camera`, detectando el lanzamiento por gesto swipe, calculando la trayectoria parabólica, Hitbox, probabilidad de captura, IVs aleatorios (0-15) y fórmula de CP.

### 5.2 ¿Dónde está?
- **Pantalla Captura & Cámara:** [`src/screens/CatchScreen.tsx`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/screens/CatchScreen.tsx).
- **Física de Lanzamiento & Hitbox:** [`src/utils/throwPhysics.ts`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/utils/throwPhysics.ts).
- **Probabilidad de Captura:** [`src/utils/catchProbability.ts`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/utils/catchProbability.ts).
- **Cálculo de CP:** [`src/utils/cpCalculator.ts`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/utils/cpCalculator.ts).
- **Generador de IVs:** [`src/utils/ivGenerator.ts`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/utils/ivGenerator.ts).

### 5.3 Preguntas de Defensa (5 Preguntas Difíciles)

#### Pregunta 1: Explica la fórmula matemática de la trayectoria parabólica del lanzamiento.
**Respuesta:** La posición en el espacio 2D durante el tiempo \(t\) sigue las ecuaciones Cinemáticas de proyectiles:
\[
x(t) = x_0 + v_x \cdot t
\]
\[
y(t) = y_0 - (v_y \cdot t - \frac{1}{2} g t^2)
\]
donde \(v_x\) y \(v_y\) provienen de la velocidad del deslizamiento del usuario en pantalla y \(g\) representa la aceleración de gravedad virtual.

#### Pregunta 2: ¿Cómo se clasifican las categorías de Hitbox (Nice, Great, Excellent)?
**Respuesta:** Se calcula la distancia euclidiana entre el punto final del lanzamiento `(endX, endY)` y el centro del Pokémon `(targetX, targetY)`:
- Si `dist <= targetRadius * 0.25` -> **Excellent** (Multiplicador 1.85x).
- Si `dist <= targetRadius * 0.60` -> **Great** (Multiplicador 1.45x).
- Si `dist <= targetRadius * 1.00` -> **Nice** (Multiplicador 1.15x).
- Si es mayor -> **Miss** (Fallo).

#### Pregunta 3: Explica la diferencia entre Base Stats e Individual Values (IVs).
**Respuesta:** Las **Base Stats** (HP, Atk, Def) son idénticas para todos los miembros de la misma especie (e.g. todo Pikachu tiene 35 HP base). Los **IVs** son genéticos y aleatorios para cada individuo entre 0 y 15. El Combat Power (CP) final combina ambas variables.

#### Pregunta 4: ¿Por qué la cámara es un recurso costoso y cómo se realiza su cleanup?
**Respuesta:** La cámara mantiene activa la canalización de vídeo nativa del hardware y la GPU. Cuando la pantalla `CatchScreen.tsx` se desmonta o el usuario vuelve al mapa, se detiene la renderización y React Native destruye la instancia del componente `CameraView`, liberando los búferes de memoria de la GPU.

#### Pregunta 5: ¿Cómo se calcula la probabilidad final de captura y cómo se determina el éxito?
**Respuesta:** Se aplica:
\[
\text{Probabilidad} = \text{BaseCatchRate} \times \text{QualityMultiplier} \times \text{BallMultiplier}
\]
acotada entre 5% y 95%. Se genera un número aleatorio decimal `Math.random()`; si `random < probabilidad`, la captura es exitosa.

---

## MÓDULO 6: REALTIME WEBSOCKETS Y BATALLAS PVPS EN GIMNASIOS

### 6.1 ¿Qué hace?
Permite combates multijugador en tiempo real en los gimnasios del campus mediante canales WebSockets de Supabase Realtime.

### 6.2 ¿Dónde está?
- **Servicio Realtime:** [`src/services/battleService.ts`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/services/battleService.ts).
- **Pantalla de Batalla:** [`src/screens/BattleScreen.tsx`](file:///c:/Users/laura/Tatiana/Cuarto%20Semestre/Movil/PARCIAL/src/screens/BattleScreen.tsx).

### 6.3 Preguntas de Defensa (5 Preguntas Difíciles)

#### Pregunta 1: ¿Por qué se utilizó Supabase Realtime Channels en lugar de HTTP Polling cada segundo?
**Respuesta:** HTTP Polling genera una sobrecarga enorme de solicitudes (overhead de encabezados HTTP) y latencia impredecible (~1000 ms). Supabase Realtime utiliza WebSockets dúplex sobre una conexión TCP persistente, logrando una latencia de transmisión de eventos inferior a 50 ms.

#### Pregunta 2: ¿Cómo se maneja la concurrencia cuando ambos jugadores atacan al mismo tiempo?
**Respuesta:** Cada evento enviado contiene un payload determinista con el `senderId`, `damageAmount` y el nuevo `remainingHp`. Los clientes aplican actualizaciones de estado inmutables e independientes sobre sus barras de vida correspondientes al recibir el broadcast WebSocket.

#### Pregunta 3: ¿Cómo se limpia el canal WebSocket cuando finaliza la batalla?
**Respuesta:** En la función de limpieza de `useEffect` en `BattleScreen.tsx`, invocamos `battleService.unsubscribe()`, ejecutando `supabase.removeChannel(channel)` para cerrar la conexión de socket y no saturar el servidor.

#### Pregunta 4: ¿Qué sucede en caso de desconexión imprevista de uno de los jugadores?
**Respuesta:** El servidor de Supabase Realtime emite un evento de presencia o cierre de socket. La aplicación detecta la pérdida de señal del oponente e informa la victoria por abandono al usuario conectado.

#### Pregunta 5: ¿Cómo se garantiza la persistencia del resultado de la batalla?
**Respuesta:** Además de la transmisión instantánea en vivo por WebSocket Broadcast, cada evento de daño e impacto se registra asíncronamente en la tabla `battle_events` de PostgreSQL para auditoría y estadísticas.
