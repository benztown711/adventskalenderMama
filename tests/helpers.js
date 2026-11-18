const path = require("path");
const { pathToFileURL } = require("url");

const APP = pathToFileURL(path.join(__dirname, "..", "index.html")).href;

/** Öffnet den Kalender mit festem Datum (Ortszeit). query z. B. "?demo" */
async function openAt(page, isoDate, query = "") {
  await page.clock.setFixedTime(new Date(isoDate));
  await page.goto(APP + query, { waitUntil: "domcontentloaded" });
}

// Alle Türchen (Fenster, Haustür, Giebel) haben die Klasse .win
const door = (page, n) => page.locator(`.win[data-n="${n}"]`);

module.exports = { APP, openAt, door };
