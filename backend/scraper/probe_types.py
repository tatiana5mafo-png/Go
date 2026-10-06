import requests
from bs4 import BeautifulSoup

URL = "https://pokemondb.net/type"
HEADERS = {"User-Agent": "UniSabana-Student-Project/1.0 (academic use)"}

soup = BeautifulSoup(requests.get(URL, headers=HEADERS, timeout=15).text, "lxml")

tables = soup.select("table")
print("Tablas:", len(tables), [t.get("class") for t in tables])

table = soup.select_one("table.type-table") or tables[0]
header_cells = table.select("thead th")
print("Columnas del encabezado:", len(header_cells))
print("Encabezado:", [c.get_text(strip=True) for c in header_cells])

for tr in table.select("tbody tr")[:3]:
    th = tr.find("th")
    cells = [td.get_text(strip=True) for td in tr.find_all("td")]
    print(th.get_text(strip=True) if th else "?", "->", cells)