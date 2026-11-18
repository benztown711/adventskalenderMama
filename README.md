# Svenjas Adventskalender

Ein digitaler Adventskalender von Lenny für Mama, fürs Handy. Motiv: Lebkuchenhaus mit Welpen.

- `index.html` ist die komplette App (eine Datei, kein Build nötig).
- Türchen öffnen sich erst ab dem jeweiligen Dezembertag, geöffnete bleiben sichtbar offen (gespeichert im Browser).
- Inhalte stehen oben im Script im Objekt `DAYS` (Typen: text, hint, photo, video, audio). Fehlt eine Mediendatei, wird nur der Text gezeigt.
- **Puzzle und geheimer Satz:** Jedes Türchen schaltet ein Puzzleteil von `media/puzzle.jpg` und einen Buchstaben von `SECRET` frei. Wenn alle 24 offen sind, startet das Finale (komplettes Foto, Botschaft, Konfetti, `media/finale.mp4`).
- **Musik:** Schalter oben rechts, eingebaute Spieluhr („Stille Nacht“). Eigene Musik über `MUSIC_FILE`. Läuft ein Video von Lenny, pausiert die Musik.
- `DEMO = true` zeigt einen Datumsregler und Testknöpfe. Für die echte Version auf `false` setzen.
- Was Lenny aufnehmen soll: siehe [`DREHBUCH.md`](DREHBUCH.md).
