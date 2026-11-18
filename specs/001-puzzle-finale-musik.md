# 001 Lebkuchenhaus, Weihnachtspuzzle mit geheimem Satz, Finale und Musik

Status: entwurf

## Ziel
Mama sammelt jeden Tag ein Puzzleteil eines Familienfotos und einen Buchstaben von Lennys geheimer Botschaft. Am Heiligabend fügt sich alles zu einem großen Finale zusammen. Dazu leise Spieluhr-Musik auf Wunsch.

## Akzeptanzkriterien
- [ ] AK1: Lebkuchenhaus-Look: 24 Türchen als Fenster, Haustür und Giebel (24), mit Welpen.
- [ ] AK2: Unter dem Haus ein Puzzle mit 24 Teilen (6 x 4) und Platzhaltern für den geheimen Satz `SECRET`. Nur Teile und Buchstaben geöffneter Türchen sind sichtbar, Zähler "X von 24".
- [ ] AK3: Jeder Tag hat genau ein eigenes Puzzleteil; die Buchstaben von `SECRET` sind vollständig auf die Tage verteilt, Tag 24 bekommt mindestens einen.
- [ ] AK4: Das Pop-up eines Türchens zeigt das neue Puzzleteil und den Buchstaben des Tages.
- [ ] AK5: Wird das letzte fehlende Türchen geöffnet und geschlossen, startet das Finale: komplettes Bild, ganzer Satz, Abschlussvideo (falls vorhanden). Danach Knopf "Überraschung nochmal ansehen".
- [ ] AK6: Vor Vollständigkeit kein Finale; Tag 24 verrät den Satz nicht im Text.
- [ ] AK7: Musik-Schalter oben rechts, standardmäßig aus, Einstellung bleibt nach Neuladen erhalten. Eingebaute Spieluhr, optional eigene Datei.
- [ ] AK8: Fehlende Mediendateien (Foto, Video, Finale) erzeugen keine sichtbaren Fehler: Platzhalterbild bzw. nur Text.
- [ ] AK9: Auf Handybreite kein Querscrollen, keine JavaScript-Fehler, auch im Finale.

## Tests
- Alle in `tests/001-puzzle-finale-musik.spec.js`, je AK ein Test mit dem AK-Kürzel im Namen.
- `tests/000-basis.spec.js` auf die neue Oberfläche angepasst (Selektor `.win`, `DAYS` als Objekt).

## Abhängigkeiten / Risiken
- Speicherung nur im Browser: Puzzle-Fortschritt gilt pro Gerät.
- Große Videos verlangsamen das Laden: pro Clip unter 10 MB halten.

## Offene Inhalte (liefert Atti/Lenny)
- Geheimer Satz (ideal 24 Buchstaben)
- `assets/puzzle.jpg` (Querformat 3:2)
- `assets/finale.mp4` und Clips laut `DREHBUCH.md`
