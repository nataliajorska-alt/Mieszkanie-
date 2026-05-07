# Moje Mieszkanie 3D 🏠

Interaktywny wizualizator mieszkania w przeglądarce — projektuj salon w 3D, dodawaj meble z katalogu i wyszukuj inspiracje w polskich sklepach.

Domyślny układ odwzorowuje salon ze zdjęć referencyjnych: kanapa, fotel klasyczny, witryna szklana, telewizor na ścianie, model żaglowca, klimatyzator, podłoga w jodełkę.

## Uruchomienie

To czysty front-end (HTML + ES modules + Three.js z CDN), bez kroku build. Wystarczy serwer plików statycznych — przeglądarka nie zaimportuje modułów ES z `file://`.

```bash
# z katalogu projektu:
python3 -m http.server 8000
# i otwórz http://localhost:8000/
```

Albo dowolny inny serwer (`npx serve`, `php -S`, Live Server w VS Code itp.).

## Co potrafi

- **3D widok** salonu z prawdziwą ścianą okienną (sun-light wpada przez okno).
- **Widok z góry** (przełącznik na pasku górnym lub klawisz `2`).
- **Katalog mebli** podzielony na kategorie: siedziska, stoły, przechowywanie, oświetlenie, dekoracje, multimedia, tekstylia, sypialnia.
- **Edycja sceny**: kliknij mebel → przeciągnij po podłodze, zmień rozmiar, kolor, obrót.
- **Wyszukiwanie w sklepach** (IKEA, Allegro, Agata Meble, Black Red White, VOX, JYSK, Westwing, Leroy Merlin, Google Shopping, Pinterest) — kontekstowo dla zaznaczonego mebla lub ogólnie.
- **Konfiguracja pokoju**: szerokość, długość, wysokość, kolor ścian, styl podłogi (jodełka / deska / płytki / dywan).
- **Zapis / wczytanie** aranżacji w `localStorage` (dodatkowo automatyczny autosave po każdej zmianie).
- **Zrzut ekranu** sceny do PNG.
- **Zdjęcie referencyjne** — wgraj swoje zdjęcie pokoju do podglądu w drugim oknie.
- **Reset** — przywrócenie domyślnego układu salonu z fotografii.

## Skróty klawiszowe

| Klawisz | Akcja |
|---|---|
| LMB | Obrót kamery / zaznaczenie mebla |
| RMB / dwa palce | Przesuwanie kamery |
| Scroll / pinch | Zoom |
| Strzałki | Przesuń zaznaczony mebel (Shift = większy krok) |
| `R` / `Shift+R` | Obróć zaznaczony mebel o 15° |
| `Del` / `Backspace` | Usuń zaznaczony mebel |
| `Ctrl+D` | Duplikuj zaznaczony mebel |
| `1` / `2` | Widok 3D / z góry |

## Struktura

```
index.html         — strona, importmap z Three.js, layout
styles.css         — ciemny motyw UI
src/
  main.js          — App: spina scenę, UI i storage
  scene.js         — SceneApp: renderer, kamera, OrbitControls, raycast/drag
  room.js          — pomieszczenie: ściany, podłoga (jodełka itd.), okno, zasłony, słońce
  furniture.js     — katalog + proceduralne modele 3D (sofa, fotel, witryna, TV, …)
  preset.js        — domyślny układ odwzorowujący zdjęcia
  ui.js            — panel boczny, katalog, edycja zaznaczenia, dialog wyszukiwania
  search.js        — linki do polskich sklepów
  storage.js       — zapis/odczyt z localStorage
```

## Pomysły na dalszy rozwój

- Wiele pokoi (kuchnia, sypialnia, łazienka) — rzut całego mieszkania.
- Import obrazu rzutu i kalibracja wymiarów.
- Eksport listy zakupów z linkami.
- Pomiary (linia w widoku z góry).
- Tryb pierwszej osoby (WASD).
- Generowanie inspiracji obrazów (np. Stable Diffusion / API) na podstawie aranżacji.
