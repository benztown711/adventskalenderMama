const { test, expect } = require("@playwright/test");
const { openAt, door, openDoor } = require("./helpers");

// Spec: specs/000-basis.md

test("AK1: 24 Türchen mit vollständigen Inhalten", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await expect(page.locator(".win")).toHaveCount(24);
  const nums = await page.locator(".win").evaluateAll(els => els.map(e => +e.dataset.n));
  expect([...nums].sort((a, b) => a - b)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
  const days = await page.evaluate(() => DAYS);
  for (let n = 1; n <= 24; n++) {
    const entry = days[n];
    expect(entry, `Inhalt für Tag ${n}`).toBeTruthy();
    expect(String(entry.title).trim(), `Titel Tag ${n}`).not.toBe("");
    expect(String(entry.text).trim(), `Text Tag ${n}`).not.toBe("");
  }
  await expect(door(page, 1).locator(".pup")).toHaveCount(1);   // hinter jedem Türchen sitzt ein Welpe
});

test("AK2: vor dem 1. Dezember alles zu, Hinweis statt Inhalt", async ({ page }) => {
  await openAt(page, "2026-11-28T12:00:00");
  await expect(page.locator(".win.locked")).toHaveCount(24);
  await door(page, 1).click();
  await expect(page.locator("#toast")).toContainText("Noch nicht schummeln");
  await expect(page.locator("#overlay")).toBeHidden();
});

test("AK3: am 5. Dezember sind 1 bis 5 frei, Rest gesperrt, 5 ist heute", async ({ page }) => {
  await openAt(page, "2026-12-05T08:00:00");
  for (let n = 1; n <= 24; n++) {
    if (n <= 5) await expect(door(page, n)).not.toHaveClass(/locked/);
    else await expect(door(page, n)).toHaveClass(/locked/);
  }
  await expect(door(page, 5)).toHaveClass(/today/);
});

test("AK4: Türchen öffnen zeigt Inhalt, Schließen blendet aus", async ({ page }) => {
  await openAt(page, "2026-12-05T08:00:00");
  const { title, text } = await page.evaluate(() => DAYS[3]);
  await openDoor(page, 3);
  await expect(page.locator("#overlay")).toBeVisible();
  await expect(page.locator("#cardDay")).toHaveText("3. Dezember");
  await expect(page.locator("#cardTitle")).toHaveText(title);
  await expect(page.locator("#cardText")).toHaveText(text);
  await page.locator("#close").click();
  await expect(page.locator("#overlay")).toBeHidden();
});

test("AK5: geöffnete Türchen bleiben nach Neuladen offen", async ({ page }) => {
  await openAt(page, "2026-12-05T08:00:00");
  await openDoor(page, 2);
  await expect(door(page, 2)).toHaveClass(/open/);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(door(page, 2)).toHaveClass(/open/);
  await expect(door(page, 4)).not.toHaveClass(/open/);
});

test("AK6: Statuszeile Countdown und Heiligabend", async ({ page }) => {
  await openAt(page, "2026-11-28T12:00:00");
  await expect(page.locator("#status")).toContainText("Noch 3 Tage");
  await openAt(page, "2026-12-24T09:00:00");
  await expect(page.locator("#status")).toHaveText("Heute ist Heiligabend!");
});

test("AK7: Vorschau-Regler nur mit ?demo", async ({ page }) => {
  await openAt(page, "2026-12-05T08:00:00");
  await expect(page.locator("#demo")).toBeHidden();
  await openAt(page, "2026-11-18T08:00:00", "?demo");
  await expect(page.locator("#demo")).toBeVisible();
  await expect(door(page, 10)).not.toHaveClass(/locked/); // Regler startet beim 10. Dezember
});

test("AK8: Handybreite ohne Querscrollen und ohne JS-Fehler", async ({ page }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await openAt(page, "2026-12-05T08:00:00");
  await openDoor(page, 1);
  await expect(page.locator("#overlay")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});
