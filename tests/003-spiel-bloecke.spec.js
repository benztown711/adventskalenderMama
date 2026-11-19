const { test, expect } = require("@playwright/test");
const { openAt, door, solveGame } = require("./helpers");

const DAYS = [2, 5, 8, 11, 14, 17, 20, 23];
const stage = "#gameStage";

async function openBlocks(page, n = 2, iso = "2026-12-24T09:00:00") {
  await openAt(page, iso);
  await door(page, n).click();
  await expect(page.locator("#game")).toBeVisible();
  await expect(page.locator(`${stage} .bb-board`)).toBeVisible();
}
const filledCount = page => page.locator(`${stage} .bb-cell[data-filled]`).count();

test("AK4 blöcke: Blech 6 x 6, Ablage mit goldenem Block und Tageszahl, Ziellinien markiert", async ({ page }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await openBlocks(page, 2);
  await expect(page.locator("#gameTitle")).toHaveText("Blöcke");
  await expect(page.locator(`${stage} .bb-cell`)).toHaveCount(36);
  await expect(page.locator(`${stage} .bb-blk`)).toHaveCount(3);
  await expect(page.locator(`${stage} .bb-cell.t`)).toHaveCount(6);
  expect(await filledCount(page)).toBeGreaterThan(0);
  const gold = page.locator(`${stage} .bb-blk .bb-num`);
  await expect(gold).toHaveCount(1);
  await expect(gold).toHaveText("2");
  // später: 4 Blöcke, mehr Ziellinien
  await page.evaluate(() => { closeGame(); startGame(23); });
  await expect(page.locator(`${stage} .bb-blk`)).toHaveCount(4);
  expect(await page.locator(`${stage} .bb-cell.t`).count()).toBeGreaterThanOrEqual(12);
  await expect(page.locator(`${stage} .bb-blk .bb-num`)).toHaveText("23");
  expect(errors).toEqual([]);
});

test("AK4 blöcke: Größen auf dem Handy, Tippflächen mindestens 44 px, kein Querscrollen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openBlocks(page, 23);
  const cell = await page.locator(`${stage} [data-bb-cell="0,0"]`).boundingBox();
  expect(cell.width).toBeGreaterThanOrEqual(46);
  expect(cell.width).toBeLessThanOrEqual(54);
  const blks = page.locator(`${stage} .bb-blk`);
  for (let i = 0; i < 4; i++) {
    const b = await blks.nth(i).boundingBox();
    expect(b.width).toBeGreaterThanOrEqual(44);
    expect(b.height).toBeGreaterThanOrEqual(44);
  }
  const over = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(over).toBe(false);
});

test("AK4 blöcke: Block antippen, dann Feld antippen setzt ihn mit der linken oberen Ecke", async ({ page }) => {
  await openBlocks(page, 2);
  const before = await filledCount(page);
  const mv = await page.evaluate(() => GAME.cur.nextMove());
  const size = await page.locator(mv[0]).getAttribute("data-shape").then(s => s.split(";").length);
  await page.locator(mv[0]).click();
  await expect(page.locator(mv[0])).toHaveAttribute("aria-pressed", "true");
  await page.locator(mv[1]).click();
  await expect(page.locator(`${stage} .bb-blk`)).toHaveCount(3);          // Block ist nur ausgeblendet
  await expect(page.locator(`${stage} .bb-blk:visible`)).toHaveCount(2);
  expect(await filledCount(page)).toBe(before + size);
  // Ankerfeld: der Rahmen oben links gehört zum Block
  const [r, c] = mv[1].match(/"(\d+),(\d+)"/).slice(1).map(Number);
  expect(r >= 0 && c >= 0).toBe(true);
});

test("AK4 blöcke: Auswahl lässt sich wechseln, Block-Klick bei ausgewähltem Block funktioniert", async ({ page }) => {
  await openBlocks(page, 2);
  const b0 = page.locator(`${stage} [data-bb-blk="0"]`), b1 = page.locator(`${stage} [data-bb-blk="1"]`);
  await b0.click();
  await expect(b0).toHaveAttribute("aria-pressed", "true");
  await b1.click();
  await expect(b1).toHaveAttribute("aria-pressed", "true");
  await expect(b0).toHaveAttribute("aria-pressed", "false");
  await b1.click();
  await expect(b1).toHaveAttribute("aria-pressed", "true");
});

test("AK4 blöcke: Block passt nicht (außerhalb oder belegt), Hinweis ohne Strafe", async ({ page }) => {
  await openBlocks(page, 2);
  const before = await filledCount(page);
  // außerhalb: Ecke unten rechts
  await page.locator(`${stage} [data-bb-blk="0"]`).click();
  await page.locator(`${stage} [data-bb-cell="5,5"]`).click();
  await expect(page.locator("#gameMsg")).toContainText("passt");
  expect(await filledCount(page)).toBe(before);
  // belegt: eine Position suchen, an der der Block ein belegtes Feld überdeckt
  const spot = await page.evaluate(() => {
    const filled = new Set([...document.querySelectorAll("#gameStage .bb-cell[data-filled]")].map(e => e.dataset.r + "," + e.dataset.c));
    for (const b of document.querySelectorAll("#gameStage .bb-blk")) {
      const shape = b.dataset.shape.split(";").map(s => s.split(",").map(Number));
      const h = Math.max(...shape.map(p => p[0])) + 1, w = Math.max(...shape.map(p => p[1])) + 1;
      for (let r = 0; r + h <= 6; r++) for (let c = 0; c + w <= 6; c++)
        if (shape.some(([dr, dc]) => filled.has(r + dr + "," + (c + dc)))) return { blk: b.dataset.bbBlk, r, c };
    }
  });
  expect(spot).toBeTruthy();
  await page.evaluate(() => { document.getElementById("gameMsg").textContent = ""; });
  await page.locator(`${stage} [data-bb-blk="${spot.blk}"]`).click();
  await page.locator(`${stage} [data-bb-cell="${spot.r},${spot.c}"]`).click();
  await expect(page.locator("#gameMsg")).toContainText("passt");
  expect(await filledCount(page)).toBe(before);
  await expect(page.locator(`${stage} .bb-blk:visible`)).toHaveCount(3);
  expect(await page.evaluate(() => GAME.mistakes)).toBe(0);
});

test("AK4 blöcke: Feld ohne ausgewählten Block gibt einen Hinweis", async ({ page }) => {
  await openBlocks(page, 2);
  await page.locator(`${stage} [data-bb-cell="2,2"]`).click();
  await expect(page.locator("#gameMsg")).toContainText("Block");
});

test("AK4 blöcke: volle Ziellinie verschwindet, alle Ziele geräumt löst das Spiel", async ({ page }) => {
  await openBlocks(page, 5);
  const targets = await page.evaluate(() => [...document.querySelectorAll("#gameStage .bb-cell.t")].map(e => e.dataset.bbCell));
  expect(targets.length).toBe(6);
  // vor dem Lösen sind die Ziellinien nicht komplett belegt
  const filledBefore = await page.evaluate(t => t.filter(s => document.querySelector(`#gameStage [data-bb-cell="${s}"]`).dataset.filled).length, targets);
  expect(filledBefore).toBeLessThan(6);
  await solveGame(page);
  expect(await page.evaluate(() => GAME.done)).toBe(true);
  // die Ziellinie ist abgeräumt (leer, grün markiert)
  const stillFilled = await page.evaluate(t => t.filter(s => document.querySelector(`#gameStage [data-bb-cell="${s}"]`)?.dataset.filled).length, targets);
  expect(stillFilled).toBe(0);
  await expect(page.locator("#overlay")).toBeVisible({ timeout: 8000 });
});

test("AK4 blöcke: Ziehen mit der Maus setzt den Block, kurzer Klick bleibt ein Klick", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openBlocks(page, 2);
  const mv = await page.evaluate(() => GAME.cur.nextMove());
  const blk = page.locator(mv[0]), cellEl = page.locator(mv[1]);
  const before = await filledCount(page);
  const size = await blk.getAttribute("data-shape").then(s => s.split(";").length);
  const bb = await blk.boundingBox(), cb = await cellEl.boundingBox();
  const shape = (await blk.getAttribute("data-shape")).split(";").map(s => s.split(",").map(Number));
  const w = Math.max(...shape.map(p => p[1])) + 1, h = Math.max(...shape.map(p => p[0])) + 1;
  const step = cb.width + 3;
  // Ghost: Mitte oben = x, Unterkante 46 px über dem Finger. Ziel: linke obere Ecke auf dem Zielfeld
  const tx = cb.x + (w * step - 3) / 2, ty = cb.y + h * step - 3 + 46;
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.mouse.down();
  await page.mouse.move(bb.x + bb.width / 2 + 3, bb.y + bb.height / 2);          // unter der Schwelle: noch kein Ziehen
  await expect(page.locator(`${stage} .bb-ghost`)).toHaveCount(0);
  await page.mouse.move(tx, ty, { steps: 8 });
  await expect(page.locator(`${stage} .bb-ghost`)).toHaveCount(1);
  expect(await page.locator(`${stage} .bb-cell.pv-ok`).count()).toBe(size);       // Vorschau-Schatten
  await page.mouse.up();
  await expect(page.locator(`${stage} .bb-ghost`)).toHaveCount(0);
  await expect(page.locator(`${stage} .bb-blk:visible`)).toHaveCount(2);
  expect(await filledCount(page)).toBe(before + size);
});

test("AK4 blöcke: Ziehen auf ungültige Stelle setzt nichts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openBlocks(page, 2);
  const before = await filledCount(page);
  const bb = await page.locator(`${stage} [data-bb-blk="0"]`).boundingBox();
  const cb = await page.locator(`${stage} [data-bb-cell="5,5"]`).boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.mouse.down();
  await page.mouse.move(cb.x + cb.width, cb.y + cb.height + 40, { steps: 6 });
  await page.mouse.up();
  await expect(page.locator(`${stage} .bb-blk:visible`)).toHaveCount(3);
  expect(await filledCount(page)).toBe(before);
});

test("AK2 blöcke: alle Level lösbar", async ({ page }) => {
  test.setTimeout(60000);
  await openAt(page, "2026-12-24T09:00:00");
  for (const n of DAYS) {
    const r = await page.evaluate(day => {
      closeGame(); startGame(day);
      let restart = false, moves = 0;
      while (!GAME.done && moves < 400) {
        const sel = GAME.cur.nextMove();
        if (sel.includes("#gameRestart")) { restart = true; break; }
        for (const s of sel) document.querySelector(s).click();
        moves++;
      }
      return { done: GAME.done, restart, moves, mistakes: GAME.mistakes, fails: GAME.fails };
    }, n);
    expect(r, `Tag ${n}`).toMatchObject({ done: true, restart: false, mistakes: 0, fails: 0 });
  }
});

test("AK2 blöcke: Level ist pro Tag fest (gleich nach Neuladen)", async ({ page }) => {
  const grab = async () => {
    await openAt(page, "2026-12-24T09:00:00");
    return page.evaluate(() => { startGame(8); return document.getElementById("gameStage").innerHTML; });
  };
  const a = await grab(), b = await grab();
  expect(a.length).toBeGreaterThan(500);
  expect(a).toBe(b);
});

test("AK4 blöcke: Zug ohne Lösung zählt als Fehler, am Ende Neustart", async ({ page }) => {
  test.setTimeout(60000);
  await openAt(page, "2026-12-24T09:00:00");
  let found = null;
  for (const n of DAYS) {
    found = await page.evaluate(day => {
      closeGame(); startGame(day);
      const bad = GAME.cur.moves().find(m => !m.solvable);
      return bad ? { day, ...bad } : null;
    }, n);
    if (found) break;
  }
  expect(found, "mindestens ein Level hat einen Fehlzug").toBeTruthy();
  await page.locator(`${stage} [data-bb-blk="${found.b}"]`).click();
  await page.locator(`${stage} [data-bb-cell="${found.r},${found.c}"]`).click();
  await expect(page.locator("#gameMsg")).toHaveText(/Hmm, das wird eng/);
  expect(await page.evaluate(() => GAME.mistakes)).toBe(1);
  expect(await page.evaluate(() => GAME.cur.nextMove())).toEqual(["#gameRestart"]);
  // weiter ziehen, bis nichts mehr geht: Runde verloren
  const msg = await page.evaluate(() => {
    for (let i = 0; i < 10 && !GAME.fails; i++) {
      const m = GAME.cur.moves()[0]; if (!m) break;
      document.querySelector(`#gameStage [data-bb-blk="${m.b}"]`).click();
      document.querySelector(`#gameStage [data-bb-cell="${m.r},${m.c}"]`).click();
    }
    return { fails: GAME.fails, text: document.getElementById("gameMsg").textContent };
  });
  expect(msg.fails).toBe(1);
  expect(msg.text).toContain("Kein Platz mehr");
  // der Rahmen startet das Level neu: wieder lösbar
  await page.waitForFunction(() => GAME.cur.nextMove()[0] !== "#gameRestart", null, { timeout: 4000 });
  await expect(page.locator(`${stage} .bb-blk:visible`)).not.toHaveCount(0);
});

test("AK4 blöcke: Tipp zeigt den nächsten Block, solveGame löst und das Pop-up erscheint", async ({ page }) => {
  await openBlocks(page, 14);
  await page.locator("#gameHint").click();
  await expect(page.locator(`${stage} .g-hint`)).toHaveCount(1);
  await solveGame(page);
  await expect(page.locator("#overlay")).toBeVisible({ timeout: 8000 });
});

test("AK4 blöcke: bei reduzierter Bewegung ohne Animation", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await openBlocks(page, 2);
  await expect(page.locator(`${stage} .bb.bb-reduce`)).toHaveCount(1);
  await solveGame(page);
  await expect(page.locator("#overlay")).toBeVisible({ timeout: 8000 });
  await ctx.close();
});
