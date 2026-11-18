# 002 Lennys Stimme, echtes Puzzle, persönliches Finale

Status: umgesetzt

## Ziel
Der Kalender klingt und sieht aus wie ein Brief von Lenny, nicht wie eine App: Texte in Ich-Form, ein Puzzle mit echten Puzzleteilen in den Farben der Fensterläden und ein Finale mit Welpen und Lennys Handschrift. Dazu die Lücken aus dem Design-Check (Scroll-Position, Fokus, Musik-Schalter).

## Akzeptanzkriterien
- [x] AK1: Lennys Stimme: Widmung "von Lenny, für dich, Mama" unter der Überschrift (keine Überzeile mehr), Puzzle-Überschrift "Mein Puzzle für dich", im Pop-up steht das Puzzleteil als "P.S." nach der Unterschrift, im Finale "Mein geheimer Satz für dich".
- [x] AK2: Tag 24 zeigt einen anderen Text, solange noch Türchen zu sind; sind alle offen, den Text mit dem Hinweis auf den Knopf.
- [x] AK3: Das Puzzle besteht aus 24 echten Puzzleteilen (mit Nasen); benachbarte Teile passen zusammen. Abdeckungen tragen die Fensterladenfarbe und die Tageszahl.
- [x] AK4: Das Pop-up zeigt das Puzzleteil des Tages in seiner Puzzleform.
- [x] AK5: Finale mit Welpen und einem Notizzettel für den geheimen Satz und die Unterschrift. Liegen Bilder von Lennys Handschrift in `assets/schrift/` (01.png, 02.png, ...), erscheinen sie statt der Schrift; sonst eine Handschrift-Schrift.
- [x] AK6: Beim Neuladen startet die Seite oben (nicht beim Puzzle).
- [x] AK7: Während Pop-up oder Finale offen sind, ist der Rest der Seite gesperrt (inert); nach dem Schließen kommt der Fokus aufs Türchen zurück.
- [x] AK8: Musik-Schalter hat ein festes Label "Weihnachtsmusik", der Zustand steckt nur in aria-pressed. Funken beim Öffnen sind gezeichnet (SVG), keine Schriftzeichen.

## Tests
- Alle in `tests/002-lennys-stimme-design.spec.js`, je AK ein Test mit dem AK-Kürzel im Namen.
- `tests/001` AK8 prüft das Platzhalterfoto jetzt am Puzzle-Bild statt an der alten CSS-Variable (gleich streng).
- Testbild für die Handschrift: `tests/fixtures/schrift/01.png`.

## Abhängigkeiten / Risiken
- Schrift "Gochi Hand" kommt von Google Fonts; ohne Netz greift eine Ersatzschrift.

## Offene Inhalte (liefert Atti/Lenny)
- Foto von Lennys handgeschriebenem Satz (ich schneide die Buchstaben aus).
