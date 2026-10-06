import requests
from bs4 import BeautifulSoup

URL = "https://pokemondb.net/pokedex/bulbasaur"
HEADERS = {"User-Agent": "UniSabana-Student-Project/1.0 (academic use)"}

html = requests.get(URL, headers=HEADERS, timeout=15).text
soup = BeautifulSoup(html, "lxml")

for th in soup.find_all("th"):
    label = th.get_text(strip=True)
    if label in ("Catch rate", "Base Exp.", "Growth Rate"):
        td = th.find_next_sibling("td")
        print(label, "->", td.get_text(" ", strip=True) if td else "sin celda")