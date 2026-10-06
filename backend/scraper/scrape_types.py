import json
from pathlib import Path

import requests
from bs4 import BeautifulSoup

URL = "https://pokemondb.net/type"
HEADERS = {"User-Agent": "UniSabana-Student-Project/1.0 (academic use)"}
DATA = Path(__file__).parent / "data"
OUT_FILE = DATA / "types.json"

# Celda de la tabla -> multiplicador. La celda vacía significa daño normal.
MULTIPLIER = {"": 1.0, "½": 0.5, "2": 2.0, "0": 0.0}


def main() -> None:
    html = requests.get(URL, headers=HEADERS, timeout=20).text
    soup = BeautifulSoup(html, "lxml")
    table = soup.select_one("table.type-table")

    # Los nombres completos salen de las filas (la tabla es cuadrada: mismo orden en columnas).
    rows = table.select("tbody tr")
    names = [tr.find("th").get_text(strip=True) for tr in rows]
    abbrs = [th.get_text(strip=True) for th in table.select("thead th")][1:]
    assert len(names) == len(abbrs) == 18, f"Se esperaban 18 tipos, hay {len(names)}"
    for full, abbr in zip(names, abbrs):
        assert full.lower().startswith(abbr.lower()), f"Orden distinto: {full} vs {abbr}"

    effectiveness = []
    for attacker, tr in zip(names, rows):
        cells = [td.get_text(strip=True) for td in tr.find_all("td")]
        assert len(cells) == 18, f"{attacker}: {len(cells)} celdas"
        for defender, cell in zip(names, cells):
            if cell not in MULTIPLIER:
                raise ValueError(f"Valor inesperado '{cell}' en {attacker} -> {defender}")
            effectiveness.append(
                {"attacker": attacker, "defender": defender, "multiplier": MULTIPLIER[cell]}
            )

    # Comprobaciones contra el conocimiento del juego
    lookup = {(e["attacker"], e["defender"]): e["multiplier"] for e in effectiveness}
    checks = [
        (("Normal", "Ghost"), 0.0), (("Fire", "Grass"), 2.0), (("Water", "Fire"), 2.0),
        (("Electric", "Ground"), 0.0), (("Ghost", "Normal"), 0.0), (("Grass", "Fire"), 0.5),
    ]
    for key, expected in checks:
        assert lookup[key] == expected, f"{key}: {lookup[key]} != {expected}"

    # Todos los tipos de los Pokémon scrapeados deben existir en la tabla
    pokemon_file = DATA / "pokemon.json"
    if pokemon_file.exists():
        used = {t for p in json.loads(pokemon_file.read_text(encoding="utf-8")) for t in p["types"]}
        missing = used - set(names)
        assert not missing, f"Tipos sin fila: {missing}"
        print("Tipos usados por los 151:", sorted(used))

    OUT_FILE.write_text(
        json.dumps({"types": names, "effectiveness": effectiveness}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"OK: {len(names)} tipos, {len(effectiveness)} multiplicadores -> {OUT_FILE}")


if __name__ == "__main__":
    main()