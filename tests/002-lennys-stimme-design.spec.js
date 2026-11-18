const { test, expect } = require("@playwright/test");
const { openAt, door } = require("./helpers");

// Spec: specs/002-lennys-stimme-design.md

test("AK1: Texte in Lennys Stimme, P.S. nach der Unterschrift", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await expect(page.locator("header .dedication")).toHaveText("von Lenny, für dich, Mama");
  await expect(page.locator(".eyebrow")).toHaveCount(0);
  await expect(page.locator("#prizeTitle")).toHaveText("Mein Puzzle für dich");
  await door(page, 4).click();
  await expect(page.locator("#cardGain p")).toContainText("P.S.");
  const order = await page.evaluate(() => {
    const sig = document.querySelector(".card .sig"), gain = document.getElementById("cardGain");
    return sig.compareDocumentPosition(gain) & Node.DOCUMENT_POSITION_FOLLOWING;
  });
  expect(order).toBeTruthy();
  await page.locator("#close").click();
  await page.evaluate(() => finale());
  await expect(page.locator("#finale .note .lead")).toHaveText("Mein geheimer Satz für dich:");
});

test("AK2: Tag-24-Text hängt davon ab, ob alle Türchen offen sind", async ({ page }) => {
  await openAt(page, "2026-12-24T09:00:00");
  const { text, early } = await page.evaluate(() => ({ text: DAYS[24].text, early: DAYS[24].textEarly }));
  await door(page, 24).click();
  await expect(page.locator("#cardText")).toHaveText(early);
  await page.locator("#close").click();
  await page.evaluate(() => { for (let n = 1; n <= 23; n++) opened.add(n); refresh(); });
  await door(page, 24).click();
  await expect(page.locator("#cardText")).toHaveText(text);
});

test("AK3: echte Puzzleteile, die zusammenpassen", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  const covers = page.locator("#board .pc .cover");
  await expect(covers).toHaveCount(24);
  const r = await page.evaluate(() => {
    const curved = PIECE_D.filter(d => d.includes("C")).length;
    // Jede Innenkante: Nase nach außen auf der einen Seite = Nase nach innen auf der anderen,
    // geprüft über die gemeinsamen Punkte der Pfade
    const pts = d => new Set(d.match(/-?\d+(\.\d+)?\s-?\d+(\.\d+)?/g));
    let shared = 0;
    for (let p = 0; p < 24; p++) {
      if (p % 6 < 5) { const a = pts(PIECE_D[p]), b = pts(PIECE_D[p + 1]); shared += [...a].filter(x => b.has(x)).length >= 10 ? 1 : 0; }
      if (p < 18) { const a = pts(PIECE_D[p]), b = pts(PIECE_D[p + 6]); shared += [...a].filter(x => b.has(x)).length >= 10 ? 1 : 0; }
    }
    return { curved, shared };
  });
  expect(r.curved).toBe(24);
  expect(r.shared).toBe(5 * 4 + 6 * 3);   // alle 38 Innenkanten passen
  const g = page.locator('#board .pc[data-n="7"]');
  await expect(g.locator("text")).toHaveText("7");
  const colors = await page.evaluate(() => {
    const g = document.querySelector('#board .pc[data-n="7"]');
    const win = document.querySelector('.win[data-n="7"]');
    return [g.style.getPropertyValue("--c"), win.style.getPropertyValue("--c")];
  });
  expect(colors[0]).toBe(colors[1]);
});

test("AK4: Pop-up zeigt das Teil in Puzzleform", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await door(page, 9).click();
  const thumb = page.locator("#cardGain svg.thumb");
  await expect(thumb).toBeVisible();
  const d = await page.evaluate(() => PIECE_D[PIECE_OF[9]]);
  await expect(thumb.locator("clipPath path")).toHaveAttribute("d", d);
});

test("AK5: Finale mit Welpen, Notizzettel und Handschrift", async ({ page }) => {
  await openAt(page, "2026-12-24T09:00:00");
  await page.evaluate(() => finale());
  await expect(page.locator("#finPups .pup")).toHaveCount(3);
  await expect(page.locator("#finale .note #finSecret")).toBeVisible();
  await expect(page.locator("#finale .note .sig")).toHaveText("Dein Lenny");
  // Ohne Bilder: Handschrift-Schrift
  await expect(page.locator("#finSecret .ch.hw")).toHaveCount(0);
  const font = await page.locator("#finSecret .ch").first().evaluate(e => getComputedStyle(e).fontFamily);
  expect(font).toContain("Gochi Hand");
  // Mit Bild für den ersten Buchstaben: Lennys Handschrift ersetzt die Schrift
  await page.evaluate(() => loadHandwriting("tests/fixtures/schrift/"));
  await expect(page.locator('#finSecret .ch[data-li="0"]')).toHaveClass(/hw/);
  await expect(page.locator('#finSecret .ch[data-li="0"]')).toHaveCSS("background-image", /schrift\/01\.png/);
  await expect(page.locator("#finSecret .ch.hw")).toHaveCount(1);
});

test("AK6: Neuladen startet oben", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await page.locator("#board").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(200);
  await page.reload({ waitUntil: "load" });
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test("AK7: Dialoge sperren den Hintergrund, Fokus kehrt zurück", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await door(page, 3).click();
  await expect(page.locator("#overlay")).toBeVisible();
  expect(await page.evaluate(() => document.querySelector(".wrap").inert && document.getElementById("prize").inert)).toBe(true);
  await page.locator("#close").click();
  await expect(page.locator("#overlay")).toBeHidden();
  expect(await page.evaluate(() => document.querySelector(".wrap").inert)).toBe(false);
  await expect.poll(() => page.evaluate(() => document.activeElement && document.activeElement.dataset.n)).toBe("3");
  await page.evaluate(() => finale());
  expect(await page.evaluate(() => document.querySelector(".wrap").inert)).toBe(true);
  await page.locator("#finClose").click();
  expect(await page.evaluate(() => document.querySelector(".wrap").inert)).toBe(false);
});

test("AK8: festes Label am Musik-Schalter, gezeichnete Funken", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  const sound = page.locator("#sound");
  await expect(sound).toHaveAttribute("aria-label", "Weihnachtsmusik");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await expect(sound).toHaveAttribute("aria-label", "Weihnachtsmusik");
  await page.evaluate(() => sparkle(document.querySelector('.win[data-n="2"]')));
  const sparks = page.locator(".spark");
  expect(await sparks.count()).toBeGreaterThan(0);
  expect(await sparks.evaluateAll(els => els.every(e => e.querySelector("svg") && e.textContent.trim() === ""))).toBe(true);
});
