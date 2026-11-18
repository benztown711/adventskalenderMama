# Svenjas Adventskalender

Ein digitaler Adventskalender von Lenny für Mama, fürs Handy. Motiv: Lebkuchenhaus mit Welpen.

- Live: https://benztown711.github.io/adventskalenderMama/
- Vorschau mit Datumsregler: https://benztown711.github.io/adventskalenderMama/?demo
- `index.html` ist die komplette App (eine Datei, kein Build nötig).
- Türchen öffnen sich erst ab dem jeweiligen Dezembertag, geöffnete bleiben offen (gespeichert im Browser).
- Inhalte stehen im Script im Objekt `DAYS` (Typen: text, hint, photo, video, audio). Fehlt eine Mediendatei, wird nur der Text gezeigt.
- Fotos, Videos und Musik kommen nach `assets/`.
- **Puzzle und geheimer Satz:** Jedes Türchen schaltet ein Puzzleteil von `assets/puzzle.jpg` und einen Buchstaben von `SECRET` frei. Sind alle 24 offen, startet das Finale (komplettes Foto, Botschaft, Konfetti, `assets/finale.mp4`).
- **Musik:** Schalter oben rechts, eingebaute Spieluhr („Stille Nacht“). Eigene Musik über `MUSIC_FILE`. Läuft ein Video von Lenny, pausiert die Musik.
- Was Lenny aufnehmen soll: siehe [`DREHBUCH.md`](DREHBUCH.md).

## Arbeitsweise

Mini-Spec-Ablauf, siehe `CLAUDE.md`: Anforderung einkippen, kurze Rückfragen, Spec in `specs/`, eine Freigabe, danach Umsetzung, Tests, PR und Merge nach `main` automatisch. Jeder Merge auf `main` wird nach grünen Tests auf GitHub Pages veröffentlicht.

Tests lokal: `npm install && npm test`
