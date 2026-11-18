# Arbeitsweise in diesem Projekt (Mini-Spec, vollautomatisch)

Projekt: digitaler Adventskalender von Lenny für Mama (Svenja), fürs Handy. Statische Seite, kein Build.
Ansprechpartner: Atti. Antworten kurz, Kurzfassung zuerst, keine langen Gedankenstriche.

## Ablauf für jede neue Anforderung

1. **Einkippen**: Atti beschreibt die Anforderung im Chat (oder sie steht in `IDEEN.md`).
2. **Rückfragen**: höchstens 3 kurze Fragen, nur wenn sonst unklar. Sinnvolle Defaults selbst wählen und nennen.
3. **Mini-Spec**: neue Datei `specs/NNN-kurzname.md` nach `specs/_vorlage.md` (Ziel, Akzeptanzkriterien, Tests, Abhängigkeiten). Kurz halten.
4. **Eine Freigabe**: Spec im Chat zusammenfassen, Atti sagt "ok". Danach keine weiteren Rückfragen mehr nötig.
5. **Vollautomatisch**:
   - Umsetzung auf dem Claude-Arbeitszweig, ausgehend vom aktuellen `main`.
   - Für jedes Akzeptanzkriterium mindestens ein Playwright-Test in `tests/`.
   - Lokal `npm test` grün, dann Commit, Push, PR gegen `main`.
   - PR beobachten; sobald CI grün ist: PR selbst nach `main` mergen (squash). Bei rotem CI selbst fixen.
   - Nach dem Merge deployt GitHub Pages automatisch.
   - Spec-Status auf `umgesetzt` setzen (im selben PR).
6. **Rückmeldung**: 2 bis 3 Zeilen: was ist live, Link, was Atti inhaltlich noch liefern kann.

Reine Inhaltsänderungen (Texte in `DAYS`, Fotos) brauchen keine eigene Spec, nur einen Eintrag im PR. Die Freigabe bleibt trotzdem: Änderung kurz zeigen, dann umsetzen.

## Technik

- `index.html`: komplette App. Inhalte im Objekt `DAYS`, Raster in `LAYOUT`.
- Vorschau-Modus mit Datumsregler: Seite mit `?demo` öffnen. Ohne Parameter gilt das echte Datum.
- Tests: `npm install && npm test` (Playwright, Chromium). Datum wird in Tests per `page.clock` gesetzt.
- CI: `.github/workflows/ci.yml` (Tests bei PR und auf `main`, Deploy nach Pages nur von `main`).
- Ideen-Backlog: `IDEEN.md`. Specs: `specs/`.

## Regeln

- Keine Tests abschwächen oder überspringen, um grün zu werden.
- Bestehende Specs bleiben gültig (Regressionstests in `tests/` laufen immer mit).
- Kein Build-Tool, keine Frameworks, alles bleibt in einfachen Dateien.
