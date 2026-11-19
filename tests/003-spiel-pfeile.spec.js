const { test, expect } = require("@playwright/test");
const { openAt, door, solveGame } = require("./helpers");

// Spec: specs/003-tuerchen-freispielen.md (Spiel Pfeile, Tage 1, 4, 7, ..., 22)
const DAYS_PFEILE = [1, 4, 7, 10, 13, 16, 19, 22];

// Liest das Raster aus dem DOM: je Pfeil Kopfzelle, Richtung und ob der Weg frei ist
const readBoard = () => {
  const cells = [...document.querySelectorAll("#gameStage .pf-cell[data-arrow]")].map(b => {
    const m = b.getAttribute("aria-label").match(/nach (\w+), Reihe (\d+), Spalte (\d+)/);
    return { id: b.dataset.arrow, head: "head" in b.dataset, dir: m[1], r: +m[2] - 1, c: +m[3] - 1 };
  });
  const N = +getComputedStyle(document.querySelector("#gameStage .pf-board")).getPropertyValue("--n");
  const occ = new Set(cells.map(x => x.r * N + x.c));
  const D = { oben: [-1, 0], rechts: [0, 1], unten: [1, 0], links: [0, -1] };
  return cells.filter(x => x.head).map(h => {
    let r = h.r + D[h.dir][0], c = h.c + D[h.dir][1], free = true;
    while (r >= 0 && c >= 0 && r < N && c < N) { if (occ.has(r * N + c)) free = false; r += D[h.dir][0]; c += D[h.dir][1]; }
    return { id: h.id, free };
  });
};
const heartsLeft = page => page.locator("#gameStage .pf-heart:not(.lost)").count();

test("AK3 pfeile: Raster, Herzen und Plätzchen sichtbar, Felder groß genug", async ({ page }) => {
  await openAt(page, "2026-12-01T09:00:00");
  await door(page, 1).click();
  await expect(page.locator("#gameTitle")).toHaveText("Pfeile");
  await expect(page.locator("#gameStage .pf-heart")).toHaveCount(3);
  const n = await page.locator("#gameStage .pf-cell").count();
  expect(n).toBeGreaterThanOrEqual(8);
  const boxes = await page.locator("#gameStage .pf-cell").evaluateAll(l => l.map(e => e.getBoundingClientRect().width));
  for (const w of boxes) expect(w).toBeGreaterThanOrEqual(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("AK3 pfeile: freier Pfeil gleitet hinaus und ist sofort aus dem Zustand", async ({ page }) => {
  await openAt(page, "2026-12-01T09:00:00");
  await door(page, 1).click();
  const before = await page.locator("#gameStage .pf-cell[data-arrow]").count();
  const free = (await page.evaluate(readBoard)).find(p => p.free);
  await page.locator(`#gameStage button[data-arrow="${free.id}"][data-head]`).click();
  expect(await page.locator("#gameStage .pf-cell[data-arrow]").count()).toBeLessThan(before);
  expect(await page.locator(`#gameStage [data-arrow="${free.id}"]`).count()).toBe(0);
  expect(await heartsLeft(page)).toBe(3);
});

test("AK3 pfeile: blockierter Pfeil stößt an, kostet ein Herz, bleibt liegen", async ({ page }) => {
  await openAt(page, "2026-12-01T09:00:00");
  await door(page, 1).click();
  const blocked = (await page.evaluate(readBoard)).find(p => !p.free);
  expect(blocked).toBeTruthy();
  const before = await page.locator("#gameStage .pf-cell[data-arrow]").count();
  await page.locator(`#gameStage button[data-arrow="${blocked.id}"][data-head]`).click();
  expect(await heartsLeft(page)).toBe(2);
  await expect(page.locator("#gameMsg")).toHaveText("Da ist was im Weg!");
  expect(await page.locator("#gameStage .pf-cell[data-arrow]").count()).toBe(before);
  expect(await page.evaluate(() => GAME.mistakes)).toBe(1);
});

test("AK3 pfeile: nach 3 Fehlversuchen Neustart des Levels mit vollen Herzen", async ({ page }) => {
  await openAt(page, "2026-12-01T09:00:00");
  await door(page, 1).click();
  const first = await page.locator("#gameStage").innerHTML();
  const blocked = (await page.evaluate(readBoard)).find(p => !p.free);
  const sel = `#gameStage button[data-arrow="${blocked.id}"][data-head]`;
  for (let i = 0; i < 3; i++) await page.locator(sel).click();
  await expect(page.locator("#gameMsg")).toHaveText("Keine Herzen mehr. Nochmal!");
  await expect.poll(() => page.evaluate(() => GAME.fails)).toBe(1);
  await expect.poll(() => heartsLeft(page), { timeout: 4000 }).toBe(3);
  expect(await page.locator("#gameStage").innerHTML()).toBe(first);
});

test("AK3 pfeile: Level ist fest und nach Neuladen gleich", async ({ page }) => {
  const html = [];
  for (let i = 0; i < 2; i++) {
    await openAt(page, "2026-12-22T09:00:00");
    html.push(await page.evaluate(() => { startGame(22); return document.getElementById("gameStage").innerHTML; }));
  }
  expect(html[0]).toBe(html[1]);
  expect(html[0].length).toBeGreaterThan(500);
});

test("AK2 pfeile: alle Level lösbar", async ({ page }) => {
  await openAt(page, "2026-12-24T09:00:00");
  const res = await page.evaluate(days => {
    const out = [];
    for (const n of days) {
      closeGame(); startGame(n);
      let moves = 0, restart = false;
      while (!GAME.done && moves < 400) {
        const sels = GAME.cur.nextMove();
        if (sels.includes("#gameRestart")) { restart = true; break; }
        for (const s of sels) document.querySelector(s).click();
        moves++;
      }
      out.push({ n, done: GAME.done, restart, moves, mistakes: GAME.mistakes });
    }
    return out;
  }, DAYS_PFEILE);
  for (const r of res) {
    expect(r.done, `Tag ${r.n}`).toBe(true);
    expect(r.restart).toBe(false);
    expect(r.mistakes).toBe(0);
  }
  // Schwierigkeit steigt: spätere Level haben mehr Züge
  expect(res[res.length - 1].moves).toBeGreaterThan(res[0].moves);
});

test("AK3 pfeile: solveGame löst per Klicks, danach geht das Pop-up auf", async ({ page }) => {
  await openAt(page, "2026-12-24T09:00:00");
  await door(page, 22).click();
  await expect(page.locator("#game")).toBeVisible();
  await solveGame(page);
  await expect(page.locator("#overlay")).toBeVisible({ timeout: 8000 });
});

test("AK3 pfeile: Tipp markiert einen Pfeil, Welpe erscheint beim Sieg", async ({ page }) => {
  await openAt(page, "2026-12-01T09:00:00");
  await door(page, 1).click();
  await page.locator("#gameHint").click();
  await expect(page.locator("#gameStage .g-hint")).toHaveCount(1);
  await page.evaluate(() => { let g = 0; while (!GAME.done && g++ < 100) document.querySelector(GAME.cur.nextMove()[0]).click(); });
  await expect(page.locator("#gameStage .pf-board.pf-clear")).toHaveCount(1);
});
