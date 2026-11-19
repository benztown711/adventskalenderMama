# 003 Türchen freispielen (Gamification)

Status: umgesetzt

## Ziel
Mama spielt jedes Türchen erst frei, mit kurzen Rätseln im Stil ihrer Handyspiele (Arrows, Block Blast, Miao Doku), im Lebkuchen- und Welpen-Look. Dazu Sterne sammeln. Lennys Inhalte hinter den Türchen bleiben unverändert.

## Spiele (reihum, jeder Tag hat ein festes, garantiert lösbares Level)
- **Pfeile** (Arrows-Prinzip): Lebkuchen-Pfeile auf einem Raster. Antippen lässt einen Pfeil in seine Richtung hinausgleiten, wenn der Weg frei ist. Stößt er an, prallt er zurück und kostet ein Herz (3 Herzen, dann Neustart). Alle Pfeile raus = Türchen frei.
- **Blöcke** (Block-Blast-Prinzip): Plätzchenblech 6 x 6, drei Plätzchen-Blöcke, einer davon golden mit der Tageszahl. Blöcke aufs Blech ziehen (oder antippen und Feld antippen). Volle Reihen und Spalten verschwinden. Ziel: die markierten Reihen abräumen.
- **Wau-Doku** (Miao-Doku-Prinzip): Sudoku mit Welpen statt Katzen. 4 x 4 mit 4 Welpen, ab dem 13.12. 6 x 6 mit 6 Welpen. Feld antippen, Welpe wählen.
- Schwierigkeit steigt über den Dezember (Woche 1 unter 1 Minute, später 1 bis 2 Minuten).

## Akzeptanzkriterien
- [x] AK1: Ein freigegebenes, noch zu Türchen startet zuerst das Spiel des Tages (Dialog `#game`), nicht das Pop-up. Gesperrte Türchen zeigen weiter den Hinweis, schon geöffnete gehen direkt auf.
- [x] AK2: Die Spielart wechselt reihum (Pfeile, Blöcke, Wau-Doku). Jedes der 24 Level ist fest (gleich nach Neuladen) und lösbar (eingebauter Löser prüft alle).
- [x] AK3: Pfeile: freier Pfeil gleitet hinaus, blockierter prallt ab und kostet ein Herz; alle raus = gelöst.
- [x] AK4: Blöcke: Block setzen nur auf freie Felder; volle Reihe oder Spalte verschwindet; Ziel erreicht = gelöst.
- [x] AK5: Wau-Doku: falscher Welpe wird markiert und zählt als Fehler; alles richtig = gelöst.
- [x] AK6: Nach dem Lösen: Sterne-Jubel, das Türchen geht auf, danach das bekannte Pop-up mit Puzzleteil. Finale und alle bisherigen Abläufe bleiben gleich.
- [x] AK7: Sterne: 3 ohne Fehler und Tipp, 2 bei wenigen, sonst 1. Summe oben sichtbar, bleibt nach Neuladen, im Finale "X von 72 Sternen".
- [x] AK8: Nie festhängen: Knopf "Tipp" (zeigt einen richtigen Zug), "Neu starten", und nach 3 Fehlversuchen oder 2 Minuten "Welpe hilft" (öffnet direkt, 1 Stern). Schließen ohne Lösen lässt das Türchen zu.
- [x] AK9: Auf Handybreite (390 px) kein Querscrollen, keine JS-Fehler, alles per Antippen spielbar, Felder mindestens 40 px.
- [x] AK10: Alle bisherigen Tests laufen weiter; sie öffnen Türchen über einen Helfer, der das Level mit echten Klicks löst.

## Tests
- AK1, AK2 (Reihenfolge, festes Level), AK6 bis AK10: `tests/003-tuerchen-freispielen.spec.js`.
- AK2 (alle Level lösbar) und AK3, AK4, AK5: je Spiel `tests/003-spiel-pfeile.spec.js`, `tests/003-spiel-bloecke.spec.js`, `tests/003-spiel-waudoku.spec.js`.
- Bisherige Tests: erstes Öffnen eines Türchens über Helfer `openDoor(page, n)` (Spiel mit echten Klicks lösen, dann gleiche Prüfungen wie vorher).

## Technik
- Spiele als eigene Dateien `spiele/pfeile.js`, `spiele/bloecke.js`, `spiele/waudoku.js` mit gleicher Schnittstelle (`create(el, day, api)`, `nextMove()`), Rahmen in `index.html`.
- Deploy kopiert zusätzlich `spiele/`.
- Level per Zufallsgenerator mit festem Seed pro Tag, Lösbarkeit durch Konstruktion.

## Abhängigkeiten / Risiken
- Spielstand pro Gerät (wie bisher).
- Kein Vibrieren auf dem iPhone (Browser erlaubt es nicht); auf Android kurzes Feedback.

## Offene Inhalte (liefert Atti/Lenny)
- Nichts zwingend. Optional: ein Satz von Lenny für den Sterne-Jubel.
