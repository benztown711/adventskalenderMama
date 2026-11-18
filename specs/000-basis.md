# 000 Basis-Kalender

Status: umgesetzt

## Ziel
Mama öffnet auf dem Handy einen Link und kann ab dem 1. Dezember jeden Tag ein Türchen mit einer Botschaft von Lenny öffnen.

## Akzeptanzkriterien
- [x] AK1: 24 Türchen, jede Zahl 1 bis 24 genau einmal, jedes mit Emoji, Titel und Text.
- [x] AK2: Vor dem 1. Dezember sind alle Türchen zu; Antippen zeigt einen Hinweis statt des Inhalts.
- [x] AK3: Am Tag X sind die Türchen 1 bis X offenbar, X+1 bis 24 gesperrt; Türchen X ist als "heute" markiert.
- [x] AK4: Ein freigegebenes Türchen zeigt Datum, Titel und Text; Schließen blendet das wieder aus.
- [x] AK5: Geöffnete Türchen bleiben nach Neuladen offen (Speicherung im Browser).
- [x] AK6: Statuszeile zeigt Countdown vor Dezember und "Heute ist Heiligabend!" am 24.12.
- [x] AK7: Vorschau-Modus mit Datumsregler nur mit `?demo` im Link.
- [x] AK8: Auf Handybreite (390 px) kein horizontales Scrollen, keine JavaScript-Fehler.

## Tests
Alle in `tests/000-basis.spec.js`, je AK ein Test mit dem AK-Kürzel im Namen.

## Abhängigkeiten / Risiken
- Speicherung nur im jeweiligen Browser: auf anderem Gerät sind Türchen wieder zu (aber freigegebene lassen sich öffnen).
