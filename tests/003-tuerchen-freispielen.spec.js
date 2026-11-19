const { test, expect } = require("@playwright/test");
const { APP, openAt, door, solveGame, openDoor } = require("./helpers");

// Spec: specs/003-tuerchen-freispielen.md
// Die Spielregeln selbst (AK3 Pfeile, AK4 Blöcke, AK5 Wau-Doku) und die Lösbarkeit aller Level (AK2)
// stehen in tests/003-spiel-pfeile.spec.js, tests/003-spiel-bloecke.spec.js, tests/003-spiel-waudoku.spec.js.

test("AK1: erst spielen, dann öffnen; gesperrte und geöffnete Türchen wie bisher", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await door(page, 12).click();
  await expect(page.locator("#toast")).toContainText("Noch nicht schummeln");
  await expect(page.locator("#game")).toBeHidden();

  await door(page, 4).click();
  await expect(page.locator("#game")).toBeVisible();
  await expect(page.locator("#overlay")).toBeHidden();
  await expect(door(page, 4)).not.toHaveClass(/open/);
  // Schließen ohne Lösen: Türchen bleibt zu
  await page.locator("#gameClose").click();
  await expect(page.locator("#game")).toBeHidden();
  await expect(door(page, 4)).not.toHaveClass(/open/);
  expect(await page.evaluate(() => document.querySelector(".wrap").inert)).toBe(false);

  await openDoor(page, 4);
  await expect(door(page, 4)).toHaveClass(/open/);
  await page.locator("#close").click();
  await expect(page.locator("#overlay")).toBeHidden();
  // Schon offen: direkt das Pop-up, kein Spiel
  await door(page, 4).click();
  await expect(page.locator("#overlay")).toBeVisible();
  await expect(page.locator("#game")).toBeHidden();
});

test("AK2: Spielart reihum, Level fest nach Neuladen", async ({ page }) => {
  await openAt(page, "2026-12-24T09:00:00");
  const names = { 1: "Pfeile", 2: "Blöcke", 3: "Wau-Doku", 22: "Pfeile", 23: "Blöcke", 24: "Wau-Doku" };
  for (const [n, name] of Object.entries(names)) {
    await door(page, +n).click();
    await expect(page.locator("#gameTitle")).toHaveText(name);
    await expect(page.locator("#gameDay")).toHaveText(`Türchen ${n}`);
    await page.locator("#gameClose").click();
  }
  const snap = async () => { await door(page, 7).click(); const h = await page.locator("#gameStage").innerHTML(); await page.locator("#gameClose").click(); return h; };
  const first = await snap();
  await page.reload({ waitUntil: "domcontentloaded" });
  expect(await snap()).toBe(first);
});

test("AK6: nach dem Lösen Sterne-Jubel, Türchen offen, Pop-up mit Puzzleteil", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await door(page, 2).click();
  await solveGame(page);
  await expect(page.locator("#gameWin")).toBeVisible();
  await expect(page.locator("#gameWin h3")).toHaveText("Geschafft!");
  await expect(page.locator("#gameWin svg.on")).toHaveCount(3);
  await expect(page.locator("#overlay")).toBeVisible({ timeout: 8000 });
  await expect(page.locator("#game")).toBeHidden();
  await expect(door(page, 2)).toHaveClass(/open/);
  await expect(page.locator("#cardTitle")).toHaveText(await page.evaluate(() => DAYS[2].title));
  await expect(page.locator("#cardGain .thumb")).toBeVisible();
  await page.locator("#close").click();
  await expect(page.locator('#board .pc[data-n="2"]')).toHaveClass(/got/);
});

test("AK7: Sterne je nach Fehlern und Tipps, Summe bleibt, Finale zählt mit", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await expect(page.locator("#starsCount")).toHaveText("0");
  await openDoor(page, 1);                              // fehlerfrei: 3 Sterne
  await page.locator("#close").click();
  await expect(page.locator("#starsCount")).toHaveText("3");
  await door(page, 3).click();                          // ein Tipp: 2 Sterne
  await page.locator("#gameHint").click();
  await expect(page.locator("#gameStage .g-hint")).toHaveCount(1);
  await solveGame(page);
  await expect(page.locator("#gameWin svg.on")).toHaveCount(2);
  await expect(page.locator("#overlay")).toBeVisible({ timeout: 8000 });
  await page.locator("#close").click();
  await expect(page.locator("#starsCount")).toHaveText("5");
  await expect(page.locator("#starsHud")).toHaveAttribute("aria-label", "5 von 72 Sternen");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#starsCount")).toHaveText("5");
  await page.evaluate(() => finale());
  await expect(page.locator("#finStars")).toHaveText("Du hast 5 von 72 Sternen gesammelt.");
});

test("AK8: Tipp, Neu starten und Welpe hilft", async ({ page }) => {
  await openAt(page, "2026-12-10T12:00:00");
  await door(page, 5).click();
  await expect(page.locator("#gameHelp")).toBeHidden();
  await page.locator("#gameHint").click();
  await expect(page.locator("#gameStage .g-hint")).toHaveCount(1);
  for (let i = 0; i < 3; i++) await page.locator("#gameRestart").click();   // 3 Fehlversuche
  await expect(page.locator("#game")).toBeVisible();
  await expect(page.locator("#gameHelp")).toBeVisible();
  await page.locator("#gameHelp").click();
  await expect(page.locator("#gameWin h3")).toHaveText("Wuff!");
  await expect(page.locator("#gameWin svg.on")).toHaveCount(1);
  await expect(page.locator("#overlay")).toBeVisible({ timeout: 8000 });
  await expect(door(page, 5)).toHaveClass(/open/);
  await page.locator("#close").click();
  await expect(page.locator("#starsCount")).toHaveText("1");
});

test("AK8: nach 2 Minuten hilft der Welpe", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-12-10T12:00:00") });
  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await door(page, 6).click();
  await expect(page.locator("#gameHelp")).toBeHidden();
  await page.clock.runFor(119000);
  await expect(page.locator("#gameHelp")).toBeHidden();
  await page.clock.runFor(2000);
  await expect(page.locator("#gameHelp")).toBeVisible();
});

test("AK9: Handybreite, große Tippflächen, keine JS-Fehler", async ({ page }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await openAt(page, "2026-12-24T09:00:00");
  for (const n of [1, 2, 3, 22, 23, 24]) {
    await door(page, n).click();
    await expect(page.locator("#game")).toBeVisible();
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      stage: document.getElementById("gameStage").scrollWidth - document.getElementById("gameStage").clientWidth,
      small: [...document.querySelectorAll("#gameStage button")].map(b => b.getBoundingClientRect())
        .filter(b => b.width > 0 && (b.width < 40 || b.height < 40)).length,
    }));
    expect(r.overflow, `Querscrollen an Tag ${n}`).toBeLessThanOrEqual(0);
    expect(r.stage, `Bühne zu breit an Tag ${n}`).toBeLessThanOrEqual(0);
    expect(r.small, `zu kleine Tippflächen an Tag ${n}`).toBe(0);
    await page.locator("#gameClose").click();
  }
  await openDoor(page, 22);
  expect(errors).toEqual([]);
});

test("AK10: Helfer spielt mit echten Klicks fehlerfrei", async ({ page }) => {
  await openAt(page, "2026-12-24T09:00:00");
  for (const n of [1, 2, 3]) {
    await door(page, n).click();
    await solveGame(page);
    expect(await page.evaluate(() => ({ m: GAME.mistakes, h: GAME.hints, f: GAME.fails }))).toEqual({ m: 0, h: 0, f: 0 });
    await expect(page.locator("#overlay")).toBeVisible({ timeout: 8000 });
    await page.locator("#close").click();
    await expect(page.locator("#overlay")).toBeHidden();
  }
});
