# Módulo de Web Scraping — Pokémon GO UniSabana Edition

## Descripción
Este módulo contiene el script de Python encargado de extraer los **151 Pokémon de la primera generación (Kanto)** desde **PokémonDB** sin hacer uso de la PokéAPI ni APIs preconstruidas, dando cumplimiento estricto al **Requisito 5** de la evaluación parcial.

## Datos Extraídos por Pokémon
1. Número de Pokédex (`pokedex_number`)
2. Nombre (`name`) y Slug limpiado
3. Tipos (`types` list: Grass, Poison, Fire, Water, etc.)
4. Estadísticas Base:
   - `base_hp`
   - `base_attack`
   - `base_defense`
5. Tasa de captura base (`base_catch_rate`) basada en rareza
6. URL de Sprite Frontal oficial (`front_sprite_url`)
7. URL de Sprite Animado (`animated_sprite_url`)
8. Asignación de Movimientos Rápidos y Cargados por tipo

## Fuentes Utilizadas
- **PokémonDB**: [https://pokemondb.net/pokedex/all](https://pokemondb.net/pokedex/all)
- **Imágenes oficiales**: Servidores CDN de PokémonDB (`img.pokemondb.net`)

## Ejecución
```bash
cd scraping
pip install -r requirements.txt
python scraper.py
```

## Salidas Generadas
1. `scraping/pokemon_scraped.json`: Estructura JSON con los 151 Pokémon.
2. `supabase/seed/04_seed_pokemon.sql`: Archivo de migración de datos listo para insertar en la base de datos PostgreSQL de Supabase.
