# Svenjas Adventskalender

Ein digitaler Adventskalender von Lenny für Mama, fürs Handy.

- Live: https://benztown711.github.io/adventskalenderMama/
- Vorschau mit Datumsregler: https://benztown711.github.io/adventskalenderMama/?demo
- `index.html` ist die komplette App (eine Datei, kein Build nötig). Inhalte stehen im Script im Objekt `DAYS`.
- Türchen öffnen sich erst ab dem jeweiligen Dezembertag, geöffnete bleiben offen (gespeichert im Browser).
- Bilder und Fotos kommen nach `assets/`.

## Arbeitsweise

Mini-Spec-Ablauf, siehe `CLAUDE.md`: Anforderung einkippen, kurze Rückfragen, Spec in `specs/`, eine Freigabe, danach Umsetzung, Tests, PR und Merge nach `main` automatisch. Jeder Merge auf `main` wird nach grünen Tests auf GitHub Pages veröffentlicht.

Tests lokal: `npm install && npm test`
