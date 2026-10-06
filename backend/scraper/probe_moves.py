import requests
from bs4 import BeautifulSoup

URL = "https://pokemondb.net/pokedex/bulbasaur/moves/1"  # movimientos de la Gen 1
HEADERS = {"User-Agent": "UniSabana-Student-Project/1.0 (academic use)"}

html = requests.get(URL, headers=HEADERS, timeout=15).text
soup = BeautifulSoup(html, "lxml")

tables = soup.select("table.data-table")
print("Tablas encontradas:", len(tables))

for table in tables:
    heading = table.find_previous(["h2", "h3"])
    print("\n===", heading.get_text(strip=True) if heading else "sin título", "===")
    headers = [th.get_text(strip=True) for th in table.select("thead th")]
    print("Columnas:", headers)
    for tr in table.select("tbody tr")[:3]:
        print([td.get_text(" ", strip=True) for td in tr.find_all("td")])