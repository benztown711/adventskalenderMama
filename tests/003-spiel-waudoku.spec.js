const { test, expect } = require("@playwright/test");
const { openAt, door, solveGame } = require("./helpers");

// Spec: specs/003-tuerchen-freispielen.md (Wau-Doku, Tage 3, 6, ..., 24)
const EARLY = "2026-12-12T09:00:00", LATE = "2026-12-24T09:00:00";

const openGame = async (page, iso, n) => {
  await openAt(page, iso);
  await door(page, n).click();
  await expect(page.locator("#game")).toBeVisible();
  await expect(page.locator("#gameTitle")).toHaveText("Wau-Doku");
};
const cell = (page, i) => page.locator(`#gameStage [data-wd-cell="${i}"]`);
const pick = (page, k) => page.locator(`#gameStage [data-wd-pup="${k}"]`);
/** Lösung eines leeren Feldes aus nextMove: [Feld, Welpe] */
const target = page => page.evaluate(() => {
  const m = GAME.cur.nextMove();
  return { cell: +m[0].match(/"(\d+)"/)[1], pup: +m[1].match(/"(\d+)"/)[1] };
});

test("AK5 waudoku: vor dem 13.12. 4 x 4 mit 4 Welpen, danach 6 x 6 mit 6", async ({ page }) => {
  await openGame(page, EARLY, 12);
  await expect(page.locator("#gameStage [data-wd-cell]")).toHaveCount(16);
  await expect(page.locator("#gameStage [data-wd-pup]")).toHaveCount(4);
  const holes = await page.locator("#gameStage .wd-empty").count();
  expect(holes).toBeGreaterThanOrEqual(6); expect(holes).toBeLessThanOrEqual(10);
  await page.evaluate(() => closeGame());
  await openGame(page, LATE, 24);
  await expect(page.locator("#gameStage [data-wd-cell]")).toHaveCount(36);
  await expect(page.locator("#gameStage [data-wd-pup]")).toHaveCount(6);
  const h2 = await page.locator("#gameStage .wd-empty").count();
  expect(h2).toBeGreaterThanOrEqual(14); expect(h2).toBeLessThanOrEqual(22);
});

test("AK5 waudoku: Welpen unterscheiden sich in Fell und Halsband", async ({ page }) => {
  await openGame(page, LATE, 24);
  const info = await page.locator("#gameStage .wd-pick").evaluateAll(els => els.map(e => ({
    collar: [...e.querySelectorAll("path[stroke]:not([stroke='#fff'])")].map(p => p.getAttribute("stroke")).join(),
    fur: e.querySelector("g[fill]").getAttribute("fill"),
    w: e.getBoundingClientRect().width,
  })));
  expect(new Set(info.map(i => i.collar)).size).toBe(6);
  expect(new Set(info.map(i => i.fur)).size).toBe(6);
  for (const i of info) expect(i.w).toBeGreaterThanOrEqual(40);
});

test("AK5 waudoku: Vorgaben sind nicht anklickbar, Auswahl markiert Reihe, Spalte, Kästchen", async ({ page }) => {
  await openGame(page, EARLY, 12);
  await expect(page.locator("#gameStage .wd-given").first()).toBeDisabled();
  const t = await target(page);
  await cell(page, t.cell).click();
  await expect(cell(page, t.cell)).toHaveClass(/wd-sel/);
  expect(await page.locator("#gameStage .wd-rel").count()).toBeGreaterThanOrEqual(5);
  await cell(page, t.cell).click();      // erneutes Antippen wählt nicht ab
  await expect(cell(page, t.cell)).toHaveClass(/wd-sel/);
  const other = await page.evaluate(c => [...document.querySelectorAll("#gameStage .wd-empty")].map(e => +e.dataset.wdCell).find(i => i !== c), t.cell);
  await cell(page, other).click();       // anderes Feld wechselt die Auswahl
  await expect(cell(page, other)).toHaveClass(/wd-sel/);
  await expect(cell(page, t.cell)).not.toHaveClass(/wd-sel/);
});

test("AK5 waudoku: richtiger Welpe bleibt, falscher wackelt und verschwindet, zählt als Fehler", async ({ page }) => {
  await openGame(page, EARLY, 12);
  const t = await target(page);
  const wrong = [0, 1, 2, 3].find(k => k !== t.pup);
  await cell(page, t.cell).click();
  await pick(page, wrong).click();
  await expect(cell(page, t.cell)).toHaveClass(/wd-wrong/);
  await expect(page.locator("#gameMsg")).toContainText("Der Welpe passt da nicht.");
  expect(await page.evaluate(() => GAME.mistakes)).toBe(1);
  await expect(cell(page, t.cell)).toHaveClass(/wd-empty/);
  await expect(cell(page, t.cell).locator("svg")).toHaveCount(0);
  await pick(page, t.pup).click();       // Auswahl blieb stehen
  await expect(cell(page, t.cell)).toHaveClass(/wd-mine/);
  await expect(cell(page, t.cell).locator("svg")).toHaveCount(1);
  expect(await page.evaluate(() => GAME.mistakes)).toBe(1);
});

test("AK5 waudoku: Welpe ohne Feld gibt Hinweis, keinen Fehler", async ({ page }) => {
  await openGame(page, EARLY, 12);
  await pick(page, 0).click();
  await expect(page.locator("#gameMsg")).toContainText("leeres Feld");
  expect(await page.evaluate(() => GAME.mistakes)).toBe(0);
});

test("AK5 waudoku: Tipp funktioniert auch bei schon gewähltem Feld", async ({ page }) => {
  await openGame(page, EARLY, 12);
  const other = await page.evaluate(() => +[...document.querySelectorAll("#gameStage .wd-empty")].pop().dataset.wdCell);
  await cell(page, other).click();
  const m = await page.evaluate(() => GAME.cur.nextMove());
  for (const s of m) await page.locator(s).click();
  expect(await page.evaluate(() => GAME.mistakes)).toBe(0);
  expect(await page.locator("#gameStage .wd-mine").count()).toBe(1);
});

test("AK5 waudoku: Level ist nach Neuladen identisch", async ({ page }) => {
  await openGame(page, LATE, 18);
  const a = await page.locator("#gameStage").innerHTML();
  await page.reload({ waitUntil: "domcontentloaded" });
  await door(page, 18).click();
  await expect(page.locator("#gameStage .wd-board")).toBeVisible();
  expect(await page.locator("#gameStage").innerHTML()).toBe(a);
});

test("AK2 waudoku: alle Level lösbar", async ({ page }) => {
  await openAt(page, LATE);
  for (const n of [3, 6, 9, 12, 15, 18, 21, 24]) {
    const r = await page.evaluate(day => {
      closeGame(); startGame(day);
      let moves = 0;
      while (!GAME.done && moves++ < 400) {
        const m = GAME.cur.nextMove();
        if (m.length === 1 && m[0] === "#gameRestart") return { restart: true };
        for (const s of m) document.querySelector(s).click();
      }
      return { done: GAME.done, mistakes: GAME.mistakes, restart: false };
    }, n);
    expect(r, `Tag ${n}`).toEqual({ done: true, mistakes: 0, restart: false });
  }
});

test("AK5 waudoku: Lösen mit echten Klicks zeigt das Pop-up", async ({ page }) => {
  await openGame(page, EARLY, 12);
  await solveGame(page);
  await expect(page.locator("#overlay")).toBeVisible({ timeout: 8000 });
});

test("AK9 waudoku: 390 px ohne Querscrollen, Felder mindestens 40 px, keine JS-Fehler", async ({ page }) => {
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await openGame(page, LATE, 24);
  const sizes = await page.locator("#gameStage .wd-cell, #gameStage .wd-pick").evaluateAll(els => els.map(e => Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height)));
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => document.getElementById("gameStage").scrollWidth <= document.getElementById("gameStage").clientWidth)).toBe(true);
  await solveGame(page);
  expect(errors).toEqual([]);
});
