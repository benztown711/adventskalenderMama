const { test, expect } = require("@playwright/test");
const { openAt, door } = require("./helpers");

// Spec: specs/001-puzzle-finale-musik.md

/** Öffnet ein Türchen, wartet aufs Pop-up und schließt es wieder */
async function openAndClose(page, n) {
  await door(page, n).click();
  await expect(page.locator("#overlay")).toBeVisible();
  await page.locator("#close").click();
  await expect(page.locator("#overlay")).toBeHidden();
}

test("AK1: Lebkuchenhaus mit Haustür, Giebel und Welpen", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await expect(page.locator(".house")).toBeVisible();
  await expect(page.locator(".win.door")).toHaveCount(1);
  await expect(page.locator(".win.gable")).toHaveAttribute("data-n", "24");
  await expect(page.locator("#yard .head-l")).toBeVisible();
});

test("AK2: Puzzle und Satz zeigen nur Geöffnetes", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await expect(page.locator("#board .pc")).toHaveCount(24);
  await expect(page.locator("#board .pc.got")).toHaveCount(0);
  const letters = await page.evaluate(() => LETTERS.length);
  await expect(page.locator("#secret .ch")).toHaveCount(letters);
  await expect(page.locator("#count")).toHaveText("0 von 24 Teilen gefunden");
  await openAndClose(page, 3);
  await expect(page.locator("#board .pc.got")).toHaveCount(1);
  await expect(page.locator('#board .pc[data-n="3"]')).toHaveClass(/got/);
  const expected = await page.evaluate(() => LETTERS_OF[3].map(i => LETTERS[i]).join(""));
  const shown = await page.locator("#secret .ch.got").allTextContents();
  expect(shown.join("")).toBe(expected);
  await expect(page.locator("#count")).toHaveText("1 von 24 Teilen gefunden");
});

test("AK3: Teile und Buchstaben sind vollständig verteilt", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  const r = await page.evaluate(() => ({
    pieces: PIECE_OF.slice(1),
    letters: LETTERS_OF.slice(1).flat(),
    n: LETTERS.length,
    day24: LETTERS_OF[24].length,
  }));
  expect([...r.pieces].sort((a, b) => a - b)).toEqual(Array.from({ length: 24 }, (_, i) => i));
  expect([...r.letters].sort((a, b) => a - b)).toEqual(Array.from({ length: r.n }, (_, i) => i));
  expect(r.day24).toBeGreaterThanOrEqual(1);
});

test("AK4: Pop-up zeigt Puzzleteil und Buchstaben", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await door(page, 7).click();
  await expect(page.locator("#overlay .gain .thumb")).toBeVisible();
  const expected = await page.evaluate(() => LETTERS_OF[7].map(i => LETTERS[i]));
  await expect(page.locator("#overlay .gain .letter")).toHaveText(expected);
});

test("AK5: letztes Türchen startet das Finale", async ({ page }) => {
  await openAt(page, "2026-12-24T09:00:00");
  await page.evaluate(() => { for (let n = 1; n <= 23; n++) opened.add(n); refresh(); });
  await door(page, 24).click();
  await expect(page.locator("#close")).toHaveText("Zu deiner Überraschung");
  await page.locator("#close").click();
  await expect(page.locator("#finale")).toBeVisible();
  const secret = await page.evaluate(() => SECRET.replace(/\s+/g, ""));
  await expect.poll(async () => (await page.locator("#finSecret .ch").allTextContents()).join("")).toBe(secret);
  await expect(page.locator("#finBoard .pc.got")).toHaveCount(24);
  await page.locator("#finClose").click();
  await expect(page.locator("#finale")).toBeHidden();
  await expect(page.locator("#replay")).toBeVisible();
  await page.locator("#replay").click();
  await expect(page.locator("#finale")).toBeVisible();
});

test("AK6: kein Finale, solange Türchen fehlen; Tag 24 verrät nichts", async ({ page }) => {
  await openAt(page, "2026-12-24T09:00:00");
  await openAndClose(page, 24);
  await expect(page.locator("#finale")).toBeHidden();
  await expect(page.locator("#toast")).toContainText("Noch 23 Türchen zu");
  await expect(page.locator("#replay")).toBeHidden();
  const { text, secret } = await page.evaluate(() => ({ text: DAYS[24].text, secret: SECRET }));
  expect(text.toUpperCase()).not.toContain(secret.toUpperCase());
});

test("AK7: Musik-Schalter, aus als Standard, bleibt gespeichert", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  const sound = page.locator("#sound");
  await expect(sound).toBeVisible();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
});

test("AK8: fehlende Medien ohne sichtbare Fehler", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  // Platzhalterbild fürs Puzzle ist gesetzt
  await expect(page.locator("#board image.photo")).toHaveAttribute("href", /^data:image\/svg\+xml/);
  // Ein Video-Türchen mit fehlender Datei zeigt trotzdem den Text, ohne kaputtes Video
  await page.evaluate(() => { DAYS[5] = { type: "video", src: "assets/gibtsnicht.mp4", title: "Test", text: "Nur Text" }; });
  await door(page, 5).click();
  await expect(page.locator("#cardText")).toHaveText("Nur Text");
  await expect(page.locator("#overlay video")).toHaveCount(0);
});

test("AK9: Handybreite und Finale ohne Querscrollen und JS-Fehler", async ({ page }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await openAt(page, "2026-12-24T09:00:00");
  await page.evaluate(() => finale());
  await expect(page.locator("#finale")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});
