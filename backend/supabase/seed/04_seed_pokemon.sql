-- Seed generado automáticamente desde scraping/scraper.py
-- Inserta los 151 Pokémon base de Kanto con sus estadísticas 3FN

INSERT INTO public.pokemon_base (pokedex_number, name, base_hp, base_attack, base_defense, base_catch_rate, front_sprite_url, animated_sprite_url)
VALUES
  (1, 'Bulbasaur', 45, 49, 49, 0.4, 'https://img.pokemondb.net/sprites/home/normal/bulbasaur.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/bulbasaur.gif'),
  (2, 'Ivysaur', 60, 62, 63, 0.2, 'https://img.pokemondb.net/sprites/home/normal/ivysaur.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/ivysaur.gif'),
  (3, 'Venusaur', 80, 82, 83, 0.08, 'https://img.pokemondb.net/sprites/home/normal/venusaur.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/venusaur.gif'),
  (4, 'Charmander', 39, 52, 43, 0.4, 'https://img.pokemondb.net/sprites/home/normal/charmander.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/charmander.gif'),
  (5, 'Charmeleon', 58, 64, 58, 0.2, 'https://img.pokemondb.net/sprites/home/normal/charmeleon.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/charmeleon.gif'),
  (6, 'Charizard', 78, 84, 78, 0.08, 'https://img.pokemondb.net/sprites/home/normal/charizard.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/charizard.gif'),
  (7, 'Squirtle', 44, 48, 65, 0.4, 'https://img.pokemondb.net/sprites/home/normal/squirtle.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/squirtle.gif'),
  (8, 'Wartortle', 59, 63, 80, 0.2, 'https://img.pokemondb.net/sprites/home/normal/wartortle.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/wartortle.gif'),
  (9, 'Blastoise', 79, 83, 100, 0.08, 'https://img.pokemondb.net/sprites/home/normal/blastoise.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/blastoise.gif'),
  (10, 'Caterpie', 45, 30, 35, 0.5, 'https://img.pokemondb.net/sprites/home/normal/caterpie.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/caterpie.gif'),
  (11, 'Metapod', 50, 20, 55, 0.4, 'https://img.pokemondb.net/sprites/home/normal/metapod.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/metapod.gif'),
  (12, 'Butterfree', 60, 45, 50, 0.4, 'https://img.pokemondb.net/sprites/home/normal/butterfree.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/butterfree.gif'),
  (13, 'Weedle', 40, 35, 30, 0.5, 'https://img.pokemondb.net/sprites/home/normal/weedle.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/weedle.gif'),
  (14, 'Kakuna', 45, 25, 50, 0.4, 'https://img.pokemondb.net/sprites/home/normal/kakuna.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/kakuna.gif'),
  (15, 'Beedrill', 65, 90, 40, 0.4, 'https://img.pokemondb.net/sprites/home/normal/beedrill.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/beedrill.gif'),
  (16, 'Pidgey', 40, 45, 40, 0.5, 'https://img.pokemondb.net/sprites/home/normal/pidgey.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/pidgey.gif'),
  (17, 'Pidgeotto', 63, 60, 55, 0.2, 'https://img.pokemondb.net/sprites/home/normal/pidgeotto.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/pidgeotto.gif'),
  (18, 'Pidgeot', 83, 80, 75, 0.4, 'https://img.pokemondb.net/sprites/home/normal/pidgeot.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/pidgeot.gif'),
  (19, 'Rattata', 30, 56, 35, 0.5, 'https://img.pokemondb.net/sprites/home/normal/rattata.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/rattata.gif'),
  (20, 'Raticate', 55, 81, 60, 0.4, 'https://img.pokemondb.net/sprites/home/normal/raticate.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/raticate.gif'),
  (21, 'Spearow', 40, 60, 30, 0.5, 'https://img.pokemondb.net/sprites/home/normal/spearow.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/spearow.gif'),
  (22, 'Fearow', 65, 90, 65, 0.4, 'https://img.pokemondb.net/sprites/home/normal/fearow.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/fearow.gif'),
  (23, 'Ekans', 35, 60, 44, 0.4, 'https://img.pokemondb.net/sprites/home/normal/ekans.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/ekans.gif'),
  (24, 'Arbok', 60, 95, 69, 0.4, 'https://img.pokemondb.net/sprites/home/normal/arbok.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/arbok.gif'),
  (25, 'Pikachu', 35, 55, 40, 0.2, 'https://img.pokemondb.net/sprites/home/normal/pikachu.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/pikachu.gif'),
  (26, 'Raichu', 60, 90, 55, 0.4, 'https://img.pokemondb.net/sprites/home/normal/raichu.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/raichu.gif'),
  (27, 'Sandshrew', 50, 75, 85, 0.4, 'https://img.pokemondb.net/sprites/home/normal/sandshrew.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/sandshrew.gif'),
  (28, 'Sandslash', 75, 100, 110, 0.4, 'https://img.pokemondb.net/sprites/home/normal/sandslash.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/sandslash.gif'),
  (29, 'Nidoran♀', 55, 47, 52, 0.4, 'https://img.pokemondb.net/sprites/home/normal/nidoran-f.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/nidoran-f.gif'),
  (30, 'Nidorina', 70, 62, 67, 0.4, 'https://img.pokemondb.net/sprites/home/normal/nidorina.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/nidorina.gif'),
  (31, 'Nidoqueen', 90, 92, 87, 0.4, 'https://img.pokemondb.net/sprites/home/normal/nidoqueen.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/nidoqueen.gif'),
  (32, 'Nidoran♂', 46, 57, 40, 0.4, 'https://img.pokemondb.net/sprites/home/normal/nidoran-m.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/nidoran-m.gif'),
  (33, 'Nidorino', 61, 72, 57, 0.4, 'https://img.pokemondb.net/sprites/home/normal/nidorino.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/nidorino.gif'),
  (34, 'Nidoking', 81, 102, 77, 0.4, 'https://img.pokemondb.net/sprites/home/normal/nidoking.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/nidoking.gif'),
  (35, 'Clefairy', 70, 45, 48, 0.4, 'https://img.pokemondb.net/sprites/home/normal/clefairy.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/clefairy.gif'),
  (36, 'Clefable', 95, 70, 73, 0.4, 'https://img.pokemondb.net/sprites/home/normal/clefable.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/clefable.gif'),
  (37, 'Vulpix', 38, 41, 40, 0.4, 'https://img.pokemondb.net/sprites/home/normal/vulpix.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/vulpix.gif'),
  (38, 'Ninetales', 73, 76, 75, 0.4, 'https://img.pokemondb.net/sprites/home/normal/ninetales.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/ninetales.gif'),
  (39, 'Jigglypuff', 115, 45, 20, 0.4, 'https://img.pokemondb.net/sprites/home/normal/jigglypuff.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/jigglypuff.gif'),
  (40, 'Wigglytuff', 140, 70, 45, 0.4, 'https://img.pokemondb.net/sprites/home/normal/wigglytuff.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/wigglytuff.gif'),
  (41, 'Zubat', 40, 45, 35, 0.4, 'https://img.pokemondb.net/sprites/home/normal/zubat.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/zubat.gif'),
  (42, 'Golbat', 75, 80, 70, 0.4, 'https://img.pokemondb.net/sprites/home/normal/golbat.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/golbat.gif'),
  (43, 'Oddish', 45, 50, 55, 0.4, 'https://img.pokemondb.net/sprites/home/normal/oddish.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/oddish.gif'),
  (44, 'Gloom', 60, 65, 70, 0.4, 'https://img.pokemondb.net/sprites/home/normal/gloom.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/gloom.gif'),
  (45, 'Vileplume', 75, 80, 85, 0.4, 'https://img.pokemondb.net/sprites/home/normal/vileplume.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/vileplume.gif'),
  (46, 'Paras', 35, 70, 55, 0.4, 'https://img.pokemondb.net/sprites/home/normal/paras.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/paras.gif'),
  (47, 'Parasect', 60, 95, 80, 0.4, 'https://img.pokemondb.net/sprites/home/normal/parasect.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/parasect.gif'),
  (48, 'Venonat', 60, 55, 50, 0.4, 'https://img.pokemondb.net/sprites/home/normal/venonat.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/venonat.gif'),
  (49, 'Venomoth', 70, 65, 60, 0.4, 'https://img.pokemondb.net/sprites/home/normal/venomoth.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/venomoth.gif'),
  (50, 'Diglett', 10, 55, 25, 0.4, 'https://img.pokemondb.net/sprites/home/normal/diglett.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/diglett.gif'),
  (51, 'Dugtrio', 35, 100, 50, 0.4, 'https://img.pokemondb.net/sprites/home/normal/dugtrio.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/dugtrio.gif'),
  (52, 'Meowth', 40, 45, 35, 0.4, 'https://img.pokemondb.net/sprites/home/normal/meowth.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/meowth.gif'),
  (53, 'Persian', 65, 70, 60, 0.4, 'https://img.pokemondb.net/sprites/home/normal/persian.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/persian.gif'),
  (54, 'Psyduck', 50, 52, 48, 0.4, 'https://img.pokemondb.net/sprites/home/normal/psyduck.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/psyduck.gif'),
  (55, 'Golduck', 80, 82, 78, 0.4, 'https://img.pokemondb.net/sprites/home/normal/golduck.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/golduck.gif'),
  (56, 'Mankey', 40, 80, 35, 0.4, 'https://img.pokemondb.net/sprites/home/normal/mankey.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/mankey.gif'),
  (57, 'Primeape', 65, 105, 60, 0.4, 'https://img.pokemondb.net/sprites/home/normal/primeape.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/primeape.gif'),
  (58, 'Growlithe', 55, 70, 45, 0.4, 'https://img.pokemondb.net/sprites/home/normal/growlithe.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/growlithe.gif'),
  (59, 'Arcanine', 90, 110, 80, 0.4, 'https://img.pokemondb.net/sprites/home/normal/arcanine.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/arcanine.gif'),
  (60, 'Poliwag', 40, 50, 40, 0.4, 'https://img.pokemondb.net/sprites/home/normal/poliwag.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/poliwag.gif'),
  (61, 'Poliwhirl', 65, 65, 65, 0.4, 'https://img.pokemondb.net/sprites/home/normal/poliwhirl.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/poliwhirl.gif'),
  (62, 'Poliwrath', 90, 95, 95, 0.4, 'https://img.pokemondb.net/sprites/home/normal/poliwrath.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/poliwrath.gif'),
  (63, 'Abra', 25, 20, 15, 0.4, 'https://img.pokemondb.net/sprites/home/normal/abra.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/abra.gif'),
  (64, 'Kadabra', 40, 35, 30, 0.4, 'https://img.pokemondb.net/sprites/home/normal/kadabra.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/kadabra.gif'),
  (65, 'Alakazam', 55, 50, 45, 0.08, 'https://img.pokemondb.net/sprites/home/normal/alakazam.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/alakazam.gif'),
  (66, 'Machop', 70, 80, 50, 0.4, 'https://img.pokemondb.net/sprites/home/normal/machop.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/machop.gif'),
  (67, 'Machoke', 80, 100, 70, 0.4, 'https://img.pokemondb.net/sprites/home/normal/machoke.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/machoke.gif'),
  (68, 'Machamp', 90, 130, 80, 0.08, 'https://img.pokemondb.net/sprites/home/normal/machamp.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/machamp.gif'),
  (69, 'Bellsprout', 50, 75, 35, 0.4, 'https://img.pokemondb.net/sprites/home/normal/bellsprout.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/bellsprout.gif'),
  (70, 'Weepinbell', 65, 90, 50, 0.4, 'https://img.pokemondb.net/sprites/home/normal/weepinbell.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/weepinbell.gif'),
  (71, 'Victreebel', 80, 105, 65, 0.4, 'https://img.pokemondb.net/sprites/home/normal/victreebel.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/victreebel.gif'),
  (72, 'Tentacool', 40, 40, 35, 0.4, 'https://img.pokemondb.net/sprites/home/normal/tentacool.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/tentacool.gif'),
  (73, 'Tentacruel', 80, 70, 65, 0.4, 'https://img.pokemondb.net/sprites/home/normal/tentacruel.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/tentacruel.gif'),
  (74, 'Geodude', 40, 80, 100, 0.4, 'https://img.pokemondb.net/sprites/home/normal/geodude.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/geodude.gif'),
  (75, 'Graveler', 55, 95, 115, 0.4, 'https://img.pokemondb.net/sprites/home/normal/graveler.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/graveler.gif'),
  (76, 'Golem', 80, 120, 130, 0.4, 'https://img.pokemondb.net/sprites/home/normal/golem.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/golem.gif'),
  (77, 'Ponyta', 50, 85, 55, 0.4, 'https://img.pokemondb.net/sprites/home/normal/ponyta.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/ponyta.gif'),
  (78, 'Rapidash', 65, 100, 70, 0.4, 'https://img.pokemondb.net/sprites/home/normal/rapidash.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/rapidash.gif'),
  (79, 'Slowpoke', 90, 65, 65, 0.4, 'https://img.pokemondb.net/sprites/home/normal/slowpoke.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/slowpoke.gif'),
  (80, 'Slowbro', 95, 75, 110, 0.4, 'https://img.pokemondb.net/sprites/home/normal/slowbro.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/slowbro.gif'),
  (81, 'Magnemite', 25, 35, 70, 0.4, 'https://img.pokemondb.net/sprites/home/normal/magnemite.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/magnemite.gif'),
  (82, 'Magneton', 50, 60, 95, 0.4, 'https://img.pokemondb.net/sprites/home/normal/magneton.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/magneton.gif'),
  (83, 'Farfetch''d', 52, 90, 55, 0.4, 'https://img.pokemondb.net/sprites/home/normal/farfetchd.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/farfetchd.gif'),
  (84, 'Doduo', 35, 85, 45, 0.4, 'https://img.pokemondb.net/sprites/home/normal/doduo.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/doduo.gif'),
  (85, 'Dodrio', 60, 110, 70, 0.4, 'https://img.pokemondb.net/sprites/home/normal/dodrio.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/dodrio.gif'),
  (86, 'Seel', 65, 45, 55, 0.4, 'https://img.pokemondb.net/sprites/home/normal/seel.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/seel.gif'),
  (87, 'Dewgong', 90, 70, 80, 0.4, 'https://img.pokemondb.net/sprites/home/normal/dewgong.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/dewgong.gif'),
  (88, 'Grimer', 80, 80, 50, 0.4, 'https://img.pokemondb.net/sprites/home/normal/grimer.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/grimer.gif'),
  (89, 'Muk', 105, 105, 75, 0.4, 'https://img.pokemondb.net/sprites/home/normal/muk.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/muk.gif'),
  (90, 'Shellder', 30, 65, 100, 0.4, 'https://img.pokemondb.net/sprites/home/normal/shellder.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/shellder.gif'),
  (91, 'Cloyster', 50, 95, 180, 0.4, 'https://img.pokemondb.net/sprites/home/normal/cloyster.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/cloyster.gif'),
  (92, 'Gastly', 30, 35, 30, 0.4, 'https://img.pokemondb.net/sprites/home/normal/gastly.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/gastly.gif'),
  (93, 'Haunter', 45, 50, 45, 0.4, 'https://img.pokemondb.net/sprites/home/normal/haunter.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/haunter.gif'),
  (94, 'Gengar', 60, 65, 60, 0.08, 'https://img.pokemondb.net/sprites/home/normal/gengar.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/gengar.gif'),
  (95, 'Onix', 35, 45, 160, 0.4, 'https://img.pokemondb.net/sprites/home/normal/onix.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/onix.gif'),
  (96, 'Drowzee', 60, 48, 45, 0.4, 'https://img.pokemondb.net/sprites/home/normal/drowzee.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/drowzee.gif'),
  (97, 'Hypno', 85, 73, 70, 0.4, 'https://img.pokemondb.net/sprites/home/normal/hypno.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/hypno.gif'),
  (98, 'Krabby', 30, 105, 90, 0.4, 'https://img.pokemondb.net/sprites/home/normal/krabby.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/krabby.gif'),
  (99, 'Kingler', 55, 130, 115, 0.4, 'https://img.pokemondb.net/sprites/home/normal/kingler.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/kingler.gif'),
  (100, 'Voltorb', 40, 30, 50, 0.4, 'https://img.pokemondb.net/sprites/home/normal/voltorb.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/voltorb.gif'),
  (101, 'Electrode', 60, 50, 70, 0.4, 'https://img.pokemondb.net/sprites/home/normal/electrode.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/electrode.gif'),
  (102, 'Exeggcute', 60, 40, 80, 0.4, 'https://img.pokemondb.net/sprites/home/normal/exeggcute.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/exeggcute.gif'),
  (103, 'Exeggutor', 95, 95, 85, 0.4, 'https://img.pokemondb.net/sprites/home/normal/exeggutor.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/exeggutor.gif'),
  (104, 'Cubone', 50, 50, 95, 0.4, 'https://img.pokemondb.net/sprites/home/normal/cubone.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/cubone.gif'),
  (105, 'Marowak', 60, 80, 110, 0.4, 'https://img.pokemondb.net/sprites/home/normal/marowak.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/marowak.gif'),
  (106, 'Hitmonlee', 50, 120, 53, 0.4, 'https://img.pokemondb.net/sprites/home/normal/hitmonlee.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/hitmonlee.gif'),
  (107, 'Hitmonchan', 50, 105, 79, 0.4, 'https://img.pokemondb.net/sprites/home/normal/hitmonchan.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/hitmonchan.gif'),
  (108, 'Lickitung', 90, 55, 75, 0.4, 'https://img.pokemondb.net/sprites/home/normal/lickitung.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/lickitung.gif'),
  (109, 'Koffing', 40, 65, 95, 0.4, 'https://img.pokemondb.net/sprites/home/normal/koffing.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/koffing.gif'),
  (110, 'Weezing', 65, 90, 120, 0.4, 'https://img.pokemondb.net/sprites/home/normal/weezing.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/weezing.gif'),
  (111, 'Rhyhorn', 80, 85, 95, 0.4, 'https://img.pokemondb.net/sprites/home/normal/rhyhorn.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/rhyhorn.gif'),
  (112, 'Rhydon', 105, 130, 120, 0.4, 'https://img.pokemondb.net/sprites/home/normal/rhydon.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/rhydon.gif'),
  (113, 'Chansey', 250, 5, 5, 0.4, 'https://img.pokemondb.net/sprites/home/normal/chansey.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/chansey.gif'),
  (114, 'Tangela', 65, 55, 115, 0.4, 'https://img.pokemondb.net/sprites/home/normal/tangela.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/tangela.gif'),
  (115, 'Kangaskhan', 105, 95, 80, 0.4, 'https://img.pokemondb.net/sprites/home/normal/kangaskhan.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/kangaskhan.gif'),
  (116, 'Horsea', 30, 40, 70, 0.4, 'https://img.pokemondb.net/sprites/home/normal/horsea.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/horsea.gif'),
  (117, 'Seadra', 55, 65, 95, 0.4, 'https://img.pokemondb.net/sprites/home/normal/seadra.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/seadra.gif'),
  (118, 'Goldeen', 45, 67, 60, 0.4, 'https://img.pokemondb.net/sprites/home/normal/goldeen.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/goldeen.gif'),
  (119, 'Seaking', 80, 92, 65, 0.4, 'https://img.pokemondb.net/sprites/home/normal/seaking.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/seaking.gif'),
  (120, 'Staryu', 30, 45, 55, 0.4, 'https://img.pokemondb.net/sprites/home/normal/staryu.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/staryu.gif'),
  (121, 'Starmie', 60, 75, 85, 0.4, 'https://img.pokemondb.net/sprites/home/normal/starmie.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/starmie.gif'),
  (122, 'Mr. Mime', 40, 45, 65, 0.4, 'https://img.pokemondb.net/sprites/home/normal/mr-mime.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/mr-mime.gif'),
  (123, 'Scyther', 70, 110, 80, 0.4, 'https://img.pokemondb.net/sprites/home/normal/scyther.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/scyther.gif'),
  (124, 'Jynx', 65, 50, 35, 0.4, 'https://img.pokemondb.net/sprites/home/normal/jynx.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/jynx.gif'),
  (125, 'Electabuzz', 65, 83, 57, 0.4, 'https://img.pokemondb.net/sprites/home/normal/electabuzz.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/electabuzz.gif'),
  (126, 'Magmar', 65, 95, 57, 0.4, 'https://img.pokemondb.net/sprites/home/normal/magmar.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/magmar.gif'),
  (127, 'Pinsir', 65, 125, 100, 0.4, 'https://img.pokemondb.net/sprites/home/normal/pinsir.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/pinsir.gif'),
  (128, 'Tauros', 75, 100, 95, 0.4, 'https://img.pokemondb.net/sprites/home/normal/tauros.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/tauros.gif'),
  (129, 'Magikarp', 20, 10, 55, 0.4, 'https://img.pokemondb.net/sprites/home/normal/magikarp.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/magikarp.gif'),
  (130, 'Gyarados', 95, 125, 79, 0.08, 'https://img.pokemondb.net/sprites/home/normal/gyarados.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/gyarados.gif'),
  (131, 'Lapras', 130, 85, 80, 0.4, 'https://img.pokemondb.net/sprites/home/normal/lapras.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/lapras.gif'),
  (132, 'Ditto', 48, 48, 48, 0.4, 'https://img.pokemondb.net/sprites/home/normal/ditto.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/ditto.gif'),
  (133, 'Eevee', 55, 55, 50, 0.2, 'https://img.pokemondb.net/sprites/home/normal/eevee.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/eevee.gif'),
  (134, 'Vaporeon', 130, 65, 60, 0.4, 'https://img.pokemondb.net/sprites/home/normal/vaporeon.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/vaporeon.gif'),
  (135, 'Jolteon', 65, 65, 60, 0.4, 'https://img.pokemondb.net/sprites/home/normal/jolteon.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/jolteon.gif'),
  (136, 'Flareon', 65, 130, 60, 0.4, 'https://img.pokemondb.net/sprites/home/normal/flareon.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/flareon.gif'),
  (137, 'Porygon', 65, 60, 70, 0.4, 'https://img.pokemondb.net/sprites/home/normal/porygon.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/porygon.gif'),
  (138, 'Omanyte', 35, 40, 100, 0.4, 'https://img.pokemondb.net/sprites/home/normal/omanyte.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/omanyte.gif'),
  (139, 'Omastar', 70, 60, 125, 0.4, 'https://img.pokemondb.net/sprites/home/normal/omastar.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/omastar.gif'),
  (140, 'Kabuto', 30, 80, 90, 0.4, 'https://img.pokemondb.net/sprites/home/normal/kabuto.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/kabuto.gif'),
  (141, 'Kabutops', 60, 115, 105, 0.4, 'https://img.pokemondb.net/sprites/home/normal/kabutops.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/kabutops.gif'),
  (142, 'Aerodactyl', 80, 105, 65, 0.4, 'https://img.pokemondb.net/sprites/home/normal/aerodactyl.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/aerodactyl.gif'),
  (143, 'Snorlax', 160, 110, 65, 0.08, 'https://img.pokemondb.net/sprites/home/normal/snorlax.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/snorlax.gif'),
  (144, 'Articuno', 90, 85, 100, 0.03, 'https://img.pokemondb.net/sprites/home/normal/articuno.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/articuno.gif'),
  (145, 'Zapdos', 90, 90, 85, 0.03, 'https://img.pokemondb.net/sprites/home/normal/zapdos.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/zapdos.gif'),
  (146, 'Moltres', 90, 100, 90, 0.03, 'https://img.pokemondb.net/sprites/home/normal/moltres.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/moltres.gif'),
  (147, 'Dratini', 41, 64, 45, 0.4, 'https://img.pokemondb.net/sprites/home/normal/dratini.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/dratini.gif'),
  (148, 'Dragonair', 61, 84, 65, 0.4, 'https://img.pokemondb.net/sprites/home/normal/dragonair.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/dragonair.gif'),
  (149, 'Dragonite', 91, 134, 95, 0.08, 'https://img.pokemondb.net/sprites/home/normal/dragonite.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/dragonite.gif'),
  (150, 'Mewtwo', 106, 110, 90, 0.02, 'https://img.pokemondb.net/sprites/home/normal/mewtwo.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/mewtwo.gif'),
  (151, 'Mew', 100, 100, 100, 0.02, 'https://img.pokemondb.net/sprites/home/normal/mew.png', 'https://img.pokemondb.net/sprites/black-white/anim/normal/mew.gif')
ON CONFLICT (pokedex_number) DO UPDATE SET
  name = EXCLUDED.name,
  base_hp = EXCLUDED.base_hp,
  base_attack = EXCLUDED.base_attack,
  base_defense = EXCLUDED.base_defense,
  base_catch_rate = EXCLUDED.base_catch_rate,
  front_sprite_url = EXCLUDED.front_sprite_url,
  animated_sprite_url = EXCLUDED.animated_sprite_url;

-- Asignación de relaciones de tipos N:M (pokemon_types)
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 1 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 1 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 2 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 2 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 3 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 3 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 4 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 5 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 6 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 6 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 7 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 8 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 9 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 10 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 11 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 12 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 12 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 13 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 13 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 14 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 14 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 15 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 15 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 16 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 16 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 17 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 17 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 18 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 18 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 19 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 20 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 21 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 21 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 22 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 22 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 23 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 24 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 25 AND t.name = 'Electric'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 26 AND t.name = 'Electric'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 27 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 28 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 29 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 30 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 31 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 31 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 32 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 33 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 34 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 34 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 35 AND t.name = 'Fairy'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 36 AND t.name = 'Fairy'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 37 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 38 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 39 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 39 AND t.name = 'Fairy'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 40 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 40 AND t.name = 'Fairy'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 41 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 41 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 42 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 42 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 43 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 43 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 44 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 44 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 45 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 45 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 46 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 46 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 47 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 47 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 48 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 48 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 49 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 49 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 50 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 51 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 52 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 53 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 54 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 55 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 56 AND t.name = 'Fighting'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 57 AND t.name = 'Fighting'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 58 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 59 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 60 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 61 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 62 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 62 AND t.name = 'Fighting'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 63 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 64 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 65 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 66 AND t.name = 'Fighting'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 67 AND t.name = 'Fighting'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 68 AND t.name = 'Fighting'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 69 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 69 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 70 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 70 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 71 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 71 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 72 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 72 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 73 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 73 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 74 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 74 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 75 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 75 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 76 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 76 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 77 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 78 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 79 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 79 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 80 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 80 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 81 AND t.name = 'Electric'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 81 AND t.name = 'Steel'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 82 AND t.name = 'Electric'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 82 AND t.name = 'Steel'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 83 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 83 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 84 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 84 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 85 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 85 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 86 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 87 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 87 AND t.name = 'Ice'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 88 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 89 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 90 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 91 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 91 AND t.name = 'Ice'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 92 AND t.name = 'Ghost'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 92 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 93 AND t.name = 'Ghost'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 93 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 94 AND t.name = 'Ghost'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 94 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 95 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 95 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 96 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 97 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 98 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 99 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 100 AND t.name = 'Electric'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 101 AND t.name = 'Electric'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 102 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 102 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 103 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 103 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 104 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 105 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 106 AND t.name = 'Fighting'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 107 AND t.name = 'Fighting'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 108 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 109 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 110 AND t.name = 'Poison'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 111 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 111 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 112 AND t.name = 'Ground'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 112 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 113 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 114 AND t.name = 'Grass'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 115 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 116 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 117 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 118 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 119 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 120 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 121 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 121 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 122 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 122 AND t.name = 'Fairy'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 123 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 123 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 124 AND t.name = 'Ice'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 124 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 125 AND t.name = 'Electric'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 126 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 127 AND t.name = 'Bug'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 128 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 129 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 130 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 130 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 131 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 131 AND t.name = 'Ice'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 132 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 133 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 134 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 135 AND t.name = 'Electric'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 136 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 137 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 138 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 138 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 139 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 139 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 140 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 140 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 141 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 141 AND t.name = 'Water'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 142 AND t.name = 'Rock'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 142 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 143 AND t.name = 'Normal'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 144 AND t.name = 'Ice'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 144 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 145 AND t.name = 'Electric'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 145 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 146 AND t.name = 'Fire'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 146 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 147 AND t.name = 'Dragon'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 148 AND t.name = 'Dragon'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 149 AND t.name = 'Dragon'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 149 AND t.name = 'Flying'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 150 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
INSERT INTO public.pokemon_types (pokemon_id, type_id)
SELECT pb.id, t.id FROM public.pokemon_base pb, public.types t
WHERE pb.pokedex_number = 151 AND t.name = 'Psychic'
ON CONFLICT DO NOTHING;
