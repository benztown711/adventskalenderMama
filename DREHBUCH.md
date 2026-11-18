# Drehbuch für Lenny

Ziel: Bis **Do, 26.11.** alle Aufnahmen im Kasten. Ein Nachmittag reicht, wenn alles vorbereitet ist.

## Vorher entscheiden (mit Lenny)

**1. Der geheime Satz.** Am besten genau 24 Buchstaben, dann gibt es jeden Tag einen. Vorschläge:

| Satz | Buchstaben |
|---|---|
| ICH HAB DICH SO DOLL LIEB MAMA | 24 |
| DU BIST MEINE LIEBLINGSMAMA | 24 |
| ICH HAB DICH LIEB BIS ZUM MOND | 24 |

Oder Lenny erfindet einen eigenen. Eintragen in `index.html` bei `SECRET`.

**2. Lennys Handschrift.** Lenny schreibt den Satz auf weißes Papier: dicker schwarzer Filzstift, jeder Buchstabe groß in ein eigenes Kästchen (ca. 3 × 3 cm), mit Abstand. Doppelte Buchstaben jedes Mal neu schreiben. Bei Tageslicht von oben ohne Schatten fotografieren und an Claude schicken; die Buchstaben werden ausgeschnitten und als `assets/schrift/01.png`, `02.png` ... abgelegt.

**3. Das Puzzlefoto.** Ein Lieblingsfoto von Lenny und Mama, **Querformat**, Gesichter eher mittig. Als `assets/puzzle.jpg` speichern (ca. 1500 × 1000 Pixel reichen).

## Tipps für die Aufnahmen

- **Querformat**, Handy auf Augenhöhe, Fenster vor Lenny (nicht hinter ihm).
- Leiser Raum, Handy nah dran. Kurz: 10 bis 30 Sekunden pro Clip.
- Nicht auswendig lernen lassen. Lieber Stichworte, Lenny erzählt frei. Versprecher sind gold wert (Tag 23!).
- Alle Pannen aufheben.
- Speichern als MP4, Audio als M4A oder MP3. Pro Clip möglichst unter 10 MB.

## Die 24 Türchen

| Tag | Format | Idee | Datei |
|---|---|---|---|
| 1 | Video | Begrüßung: „Hallo Mama, ab heute…“ und erklären, dass jeden Tag ein Puzzleteil kommt | `tag01.mp4` |
| 2 | Audio | Gutschein Kaffee ans Bett, von Lenny vorgelesen | `tag02.m4a` |
| 3 | Video | Witz des Tages, selbst erzählt (und selbst darüber lachen) | `tag03.mp4` |
| 4 | Video | Was ich an dir mag, Teil 1 | `tag04.mp4` |
| 5 | Foto | Babyfoto von Lenny mit Mama: „Weißt du noch?“ | `tag05.jpg` |
| 6 | Hinweis | Nikolaus: echtes Geschenk im Stiefel | (analog) |
| 7 | Audio | Lenny singt ein Weihnachtslied (oder spielt es auf einem Instrument) | `tag07.m4a` |
| 8 | Foto | Lieblingsurlaub, dazu ein Satz von Lenny | `tag08.jpg` |
| 9 | Video | Rätsel stellen, Auflösung kommt morgen | `tag09.mp4` |
| 10 | Video | Rätsel-Auflösung plus Plätzchen-Gutschein | `tag10.mp4` |
| 11 | Audio | „10 Dinge, die nur Mama kann“, schnell aufgezählt | `tag11.m4a` |
| 12 | Foto | Ein Bild, das Lenny von Mama gemalt hat | `tag12.jpg` |
| 13 | Video | Quiz: Lenny rät Mamas Lieblingsessen, -farbe, -lied. Mama prüft, ob er recht hat | `tag13.mp4` |
| 14 | Text | Gutschein Spieleabend | |
| 15 | Video | Lenny zeigt seinen Lieblingsort draußen | `tag15.mp4` |
| 16 | Audio | Welpen-Witz | `tag16.m4a` |
| 17 | Hinweis | Süßes in der Küchenschublade | (analog) |
| 18 | Video | Was ich an dir mag, Teil 2 | `tag18.mp4` |
| 19 | Text | Filmabend-Gutschein (Lenny macht Popcorn) | |
| 20 | Text | Gutschein „Eine Stunde Ruhe“ | |
| 21 | Audio | Längste Nacht des Jahres: Lenny erzählt **Mama** eine Gute-Nacht-Geschichte (Rollentausch!) | `tag21.m4a` |
| 22 | Hinweis | Handgeschriebener Brief unterm Kopfkissen | (analog) |
| 23 | Video | Pannen und Versprecher vom Dreh | `tag23.mp4` |
| 24 | Text | Teaser, dann startet das Finale | |
| Finale | Video | Das große Abschlussvideo, ca. 1 Minute, von Herzen. Läuft nach dem fertigen Puzzle | `finale.mp4` |

Alle Dateien kommen in den Ordner `assets/`. In `index.html` beim jeweiligen Tag `type` und `src` eintragen, zum Beispiel:

```js
3: { type: "video", src: "assets/tag03.mp4", title: "Witz des Tages", text: "Hast du gelacht?" },
```

Fehlt eine Datei noch, zeigt der Kalender einfach nur den Text. Nichts geht kaputt.

## Analoges vorbereiten

- [ ] Tag 6: Nikolausgeschenk im Stiefel
- [ ] Tag 17: Süßes in der Küchenschublade
- [ ] Tag 22: Brief von Lenny unterm Kopfkissen
