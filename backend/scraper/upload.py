import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv

HERE = Path(__file__).parent
DATA = HERE / "data"
load_dotenv(HERE / ".env")

URL = os.environ["SUPABASE_URL"].rstrip("/") + "/rest/v1"
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal",
}
BATCH = 500


def upsert(table: str, rows: list[dict], conflict: str) -> None:
    """Inserta o actualiza por llave: se puede correr varias veces sin duplicar."""
    for i in range(0, len(rows), BATCH):
        chunk = rows[i:i + BATCH]
        r = requests.post(f"{URL}/{table}", params={"on_conflict": conflict},
                          headers=HEADERS, json=chunk, timeout=60)
        if not r.ok:
            raise RuntimeError(f"{table}: {r.status_code} {r.text}")
    print(f"  {table}: {len(rows)} filas")


def fetch_ids(table: str) -> dict[str, int]:
    r = requests.get(f"{URL}/{table}", params={"select": "id,name"}, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return {row["name"]: row["id"] for row in r.json()}


def count(table: str) -> int:
    r = requests.get(f"{URL}/{table}", params={"select": "*"},
                     headers={**HEADERS, "Prefer": "count=exact", "Range": "0-0"}, timeout=30)
    return int(r.headers["Content-Range"].split("/")[1])


def main() -> None:
    pokemon = json.loads((DATA / "pokemon.json").read_text(encoding="utf-8"))
    types_data = json.loads((DATA / "types.json").read_text(encoding="utf-8"))
    assert len(pokemon) == 151

    print("Tipos y efectividad")
    upsert("types", [{"name": n} for n in types_data["types"]], "name")
    type_id = fetch_ids("types")
    assert len(type_id) == 18

    upsert("type_effectiveness", [
        {"attacker_type_id": type_id[e["attacker"]],
         "defender_type_id": type_id[e["defender"]],
         "multiplier": e["multiplier"]}
        for e in types_data["effectiveness"]
    ], "attacker_type_id,defender_type_id")

    print("Pokémon")
    upsert("pokemon_base", [
        {"dex_number": p["dex_number"], "name": p["name"], "base_hp": p["base_hp"],
         "base_attack": p["base_attack"], "base_defense": p["base_defense"],
         "base_catch_rate": p["base_catch_rate"], "sprite_url": p["sprite_url"]}
        for p in pokemon
    ], "dex_number")

    upsert("pokemon_types", [
        {"dex_number": p["dex_number"], "type_id": type_id[t], "slot": slot}
        for p in pokemon for slot, t in enumerate(p["types"], start=1)
    ], "dex_number,slot")

    print("Movimientos")
    moves: dict[str, dict] = {}
    for p in pokemon:
        for m in p["moves"]:
            row = {"name": m["name"], "type_id": type_id[m["type"]],
                   "kind": m["kind"], "power": m["power"]}
            if m["name"] in moves and moves[m["name"]] != row:
                raise ValueError(f"Movimiento con datos distintos entre Pokémon: {m['name']}")
            moves[m["name"]] = row
    upsert("moves", list(moves.values()), "name")
    move_id = fetch_ids("moves")

    upsert("pokemon_moves", [
        {"dex_number": p["dex_number"], "move_id": move_id[m["name"]]}
        for p in pokemon for m in p["moves"]
    ], "dex_number,move_id")

    print("\nVerificación en la base:")
    for t in ["types", "type_effectiveness", "pokemon_base", "pokemon_types", "moves", "pokemon_moves"]:
        print(f"  {t}: {count(t)}")


if __name__ == "__main__":
    main()