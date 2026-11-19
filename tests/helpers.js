const path = require("path");
const { pathToFileURL } = require("url");
const { expect } = require("@playwright/test");

const APP = pathToFileURL(path.join(__dirname, "..", "index.html")).href;

/** Öffnet den Kalender mit festem Datum (Ortszeit). query z. B. "?demo" */
async function openAt(page, isoDate, query = "") {
  await page.clock.setFixedTime(new Date(isoDate));
  await page.goto(APP + query, { waitUntil: "domcontentloaded" });
}

// Alle Türchen (Fenster, Haustür, Giebel) haben die Klasse .win
const door = (page, n) => page.locator(`.win[data-n="${n}"]`);

/** Löst das offene Spiel mit echten Klicks: das Spiel nennt den nächsten richtigen Zug, der Test klickt ihn. */
async function solveGame(page) {
  for (let i = 0; i < 300; i++) {
    const moves = await page.evaluate(() => (GAME.done || !GAME.cur ? null : GAME.cur.nextMove()));
    if (!moves) return;
    for (const sel of moves) await page.locator(sel).click();
  }
  throw new Error("Spiel nach 300 Zügen nicht gelöst");
}

/** Erstes Öffnen eines Türchens: Spiel des Tages lösen, dann ist das Pop-up da (Spec 003). */
async function openDoor(page, n) {
  await door(page, n).click();
  await expect(page.locator("#game")).toBeVisible();
  await solveGame(page);
  await expect(page.locator("#overlay")).toBeVisible({ timeout: 8000 });
}

module.exports = { APP, openAt, door, solveGame, openDoor };
