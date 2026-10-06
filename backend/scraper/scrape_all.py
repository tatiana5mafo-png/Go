import json
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE = "https://pokemondb.net"
HEADERS = {"User-Agent": "UniSabana-Student-Project/1.0 (academic use)"}
MAX_DEX = 151
FAST_MAX_POWER = 50      # <= 50 rápido, > 50 cargado
PAUSE_S = 1.0            # pausa entre peticiones (scraping respetuoso)
OUT_FILE = Path(__file__).parent / "data" / "pokemon.json"

session = requests.Session()
session.headers.update(HEADERS)


def get_soup(url: str) -> BeautifulSoup:
    for attempt in range(3):
        try:
            r = session.get(url, timeout=20)
            r.raise_for_status()
            return BeautifulSoup(r.text, "lxml")
        except requests.RequestException as e:
            print(f"   reintento {attempt + 1} ({e})")
            time.sleep(2)
    raise RuntimeError(f"No se pudo leer {url}")


def scrape_list() -> list[dict]:
    """Una sola petición: número, nombre, slug, tipos y stats de los 151."""
    soup = get_soup(f"{BASE}/pokedex/all")
    result, seen = [], set()
    for tr in soup.select("table#pokedex tbody tr"):
        cells = tr.find_all("td")
        if len(cells) < 10:
            continue
        dex = int(cells[0].find("span", class_="infocard-cell-data").get_text(strip=True))
        if dex > MAX_DEX or dex in seen:
            continue  # formas alternas repiten el número; la base va primero
        seen.add(dex)
        link = cells[1].find("a", class_="ent-name")
        slug = link["href"].split("/")[-1]
        result.append({
            "dex_number": dex,
            "name": link.get_text(strip=True),
            "slug": slug,
            "types": [a.get_text(strip=True) for a in cells[2].find_all("a", class_="type-icon")],
            "base_hp": int(cells[4].get_text(strip=True)),
            "base_attack": int(cells[5].get_text(strip=True)),
            "base_defense": int(cells[6].get_text(strip=True)),
            "sprite_url": f"https://img.pokemondb.net/sprites/home/normal/{slug}.png",
        })
    result.sort(key=lambda p: p["dex_number"])
    return result


def scrape_catch_rate(slug: str) -> int:
    soup = get_soup(f"{BASE}/pokedex/{slug}")
    for th in soup.find_all("th"):
        if th.get_text(strip=True) == "Catch rate":
            td = th.find_next_sibling("td")
            return int(re.search(r"\d+", td.get_text()).group())
    raise ValueError(f"Sin catch rate para {slug}")


VALID_TYPES = {
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison",
    "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
    "Steel", "Fairy",
}


def scrape_moves(slug: str) -> list[dict]:
    """Movimientos con daño de la Gen 1 (nivel, MT, MO). Sin duplicados."""
    soup = get_soup(f"{BASE}/pokedex/{slug}/moves/1")
    seen_headings, moves = set(), {}
    for table in soup.select("table.data-table"):
        heading = table.find_previous(["h2", "h3"])
        title = heading.get_text(strip=True) if heading else ""
        if title in seen_headings:
            continue  # pestaña repetida de otra versión del juego
        seen_headings.add(title)

        headers = [th.get_text(strip=True) for th in table.select("thead th")]
        # Solo tablas con la forma [Lv./TM/HM, Move, Type, Cat., Power, Acc.].
        # Se descarta "Pre-evolution moves", que tiene otro orden de columnas.
        if len(headers) < 5 or headers[1] != "Move" or headers[2] != "Type":
            continue

        for tr in table.select("tbody tr"):
            cells = [td.get_text(" ", strip=True) for td in tr.find_all("td")]
            if len(cells) < 5:
                continue
            name, mtype, power = cells[1], cells[2], cells[4]
            if not power.isdigit():
                continue  # movimiento de estado: sin daño
            if mtype not in VALID_TYPES:
                raise ValueError(f"{slug}: tipo inválido '{mtype}' en el movimiento '{name}'")
            moves[name] = {
                "name": name,
                "type": mtype,
                "power": int(power),
                "kind": "fast" if int(power) <= FAST_MAX_POWER else "charged",
            }
    return list(moves.values())

def main() -> None:
    pokemon = scrape_list()
    assert len(pokemon) == MAX_DEX, f"Se esperaban {MAX_DEX}, llegaron {len(pokemon)}"
    print(f"Lista base OK: {len(pokemon)} Pokémon\n")

    for p in pokemon:
        raw = scrape_catch_rate(p["slug"])
        time.sleep(PAUSE_S)
        p["catch_rate_raw"] = raw
        p["base_catch_rate"] = round(raw / 255, 3)
        p["moves"] = scrape_moves(p["slug"])
        time.sleep(PAUSE_S)
        n_fast = sum(m["kind"] == "fast" for m in p["moves"])
        print(f"[{p['dex_number']:03d}] {p['name']:<12} catch={raw:<3} "
              f"rápidos={n_fast} cargados={len(p['moves']) - n_fast}")

    OUT_FILE.parent.mkdir(exist_ok=True)
    OUT_FILE.write_text(json.dumps(pokemon, indent=2, ensure_ascii=False), encoding="utf-8")

    sin_rapido = [p["name"] for p in pokemon if not any(m["kind"] == "fast" for m in p["moves"])]
    sin_cargado = [p["name"] for p in pokemon if not any(m["kind"] == "charged" for m in p["moves"])]
    print(f"\nGuardado en {OUT_FILE}")
    print("Sin movimiento rápido:", sin_rapido or "ninguno")
    print("Sin movimiento cargado:", sin_cargado or "ninguno")


if __name__ == "__main__":
    main()