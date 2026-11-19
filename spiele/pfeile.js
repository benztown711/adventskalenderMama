(() => {
  // Pfeile: Lebkuchen-Plätzchen mit Zuckerguss-Pfeil. Frei, wenn der Weg bis zum Rand leer ist.
  const css = `
.pf-wrap { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.pf-top { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0 4px; }
.pf-hearts { display: flex; gap: 6px; }
.pf-heart { width: 30px; height: 28px; color: var(--red, #c0392b); transition: color .25s; }
.pf-heart.lost { color: #d8cfc0; }
.pf-heart.lost.pop { animation: pf-lose .45s cubic-bezier(.3,1.6,.5,1); }
.pf-count { font: 20px/1 var(--font-hand, cursive); color: var(--ginger-dark, #7f4519); }
.pf-board {
  --n: 4; --gap: 4px; position: relative; width: 100%; aspect-ratio: 1; box-sizing: border-box; overflow: hidden;
  display: grid; grid-template-columns: repeat(var(--n), 1fr); grid-template-rows: repeat(var(--n), 1fr); gap: var(--gap);
  padding: 6px; border-radius: 22px; background: #ece4d6; box-shadow: inset 0 3px 10px rgba(127,69,25,.18), 0 0 0 3px #e0d4c0;
}
.pf-hole { position: relative; z-index: 1; border-radius: 50%; background: radial-gradient(circle, rgba(127,69,25,.16) 0 9%, transparent 11%); }
.pf-cell {
  position: relative; z-index: 2; padding: 0; margin: 0; border: 0; background: transparent; cursor: pointer; min-width: 0; min-height: 0;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation; display: block;
}
.pf-cell svg { display: block; width: 100%; height: 100%; overflow: visible; }
.pf-cell:focus-visible { outline: 3px solid var(--gold, #d9a52e); outline-offset: 1px; border-radius: 16px; }
.pf-cell:active:not(.pf-gone) svg { filter: brightness(1.12); }
.pf-cell.pf-out { pointer-events: none; z-index: 4; }
.pf-cell.pf-out svg { animation: pf-slide .5s cubic-bezier(.5,0,.9,.6) forwards; }
.pf-cell.pf-bump svg { animation: pf-bump .34s ease-out; }
.pf-cell.pf-hit svg { animation: pf-hit .4s ease-out .05s; }
.pf-cell.pf-flash svg { filter: drop-shadow(0 0 5px var(--red, #c0392b)); }
.pf-pup { position: absolute; z-index: 0; left: 50%; top: 50%; width: 36%; transform: translate(-50%, -50%); opacity: .18; pointer-events: none; transition: opacity .5s; }
.pf-pup .pup { width: 100%; height: auto; display: block; }
.pf-board.pf-clear .pf-pup { opacity: 1; animation: pf-hop .6s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes pf-slide { to { transform: translate(calc(var(--dx) * (100% + var(--gap))), calc(var(--dy) * (100% + var(--gap)))); opacity: .2; } }
@keyframes pf-bump { 35% { transform: translate(calc(var(--bx) * 12px), calc(var(--by) * 12px)); } 70% { transform: translate(calc(var(--bx) * -3px), calc(var(--by) * -3px)); } }
@keyframes pf-hit { 25% { transform: translate(-3px, 0) rotate(-4deg); } 50% { transform: translate(3px, 0) rotate(4deg); } 75% { transform: translate(-2px, 0) rotate(-2deg); } }
@keyframes pf-lose { 40% { transform: scale(1.5); } }
@keyframes pf-hop { 0% { transform: translate(-50%, -30%) scale(.6); } 100% { transform: translate(-50%, -50%); } }
@media (prefers-reduced-motion: reduce) {
  .pf-cell.pf-out svg, .pf-cell.pf-bump svg, .pf-cell.pf-hit svg, .pf-heart.lost.pop, .pf-board.pf-clear .pf-pup { animation: none; }
  .pf-cell.pf-out { display: none; }
}`;
  if (!document.getElementById("pf-style")) {
    const st = document.createElement("style"); st.id = "pf-style"; st.textContent = css; document.head.appendChild(st);
  }

  const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];            // oben, rechts, unten, links
  const NAMES = ["oben", "rechts", "unten", "links"];
  const ANGLE = [270, 0, 90, 180];                             // Zeichnung zeigt nach rechts
  const BODY = ["#a8642c", "#b5733a", "#9a5a26"];
  const HEART = `<svg class="pf-heart" viewBox="0 0 32 30" role="img" aria-hidden="true"><path d="M16 28C5 20 2 14 2 9a7 7 0 0 1 14-3 7 7 0 0 1 14 3c0 5-3 11-14 19Z" fill="currentColor"/></svg>`;

  function size(level) { return level < .2 ? 4 : level < .45 ? 5 : level < .8 ? 6 : 7; }

  // Level erzeugen: Pfeile nacheinander setzen, jeder nur mit freiem Weg zum Rand bezüglich der schon gesetzten.
  // Entfernt man sie rückwärts, geht es immer. Spannend wird es, weil neue Pfeile oft vor alte gesetzt werden.
  function generate(N, level, rng) {
    let best = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const occ = Array(N * N).fill(-1), pieces = [];
      const target = Math.round(N * N * (0.62 + 0.2 * level));
      let filled = 0;
      const inb = (r, c) => r >= 0 && c >= 0 && r < N && c < N;
      const ray = (r, c, d) => { const out = []; r += DIRS[d][0]; c += DIRS[d][1]; while (inb(r, c)) { out.push(r * N + c); r += DIRS[d][0]; c += DIRS[d][1]; } return out; };
      while (filled < target) {
        const p2 = level < .15 ? 0 : .18 + .3 * level, p3 = level < .35 ? 0 : .2 * level, x = rng();
        let want = x < p3 ? 3 : x < p3 + p2 ? 2 : 1, cands = [];
        for (; want >= 1 && !cands.length; want--) {
          for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (let d = 0; d < 4; d++) {
            const cells = [];
            for (let k = want - 1; k >= 0; k--) { const rr = r - k * DIRS[d][0], cc = c - k * DIRS[d][1]; if (!inb(rr, cc) || occ[rr * N + cc] >= 0) { cells.length = 0; break; } cells.push(rr * N + cc); }
            if (cells.length !== want) continue;
            const rc = ray(r, c, d);
            if (rc.some(i => occ[i] >= 0)) continue;
            const blocked = new Set();
            for (const p of pieces) if (p.ray.some(i => cells.includes(i))) blocked.add(p.id);
            cands.push({ cells, d, rc, score: blocked.size * 3 + rng() * 2.2 });
          }
        }
        if (!cands.length) break;
        cands.sort((a, b) => b.score - a.score);
        const k = cands[0], id = pieces.length;
        pieces.push({ id, cells: k.cells, d: k.d, ray: k.rc });
        k.cells.forEach(i => (occ[i] = id)); filled += k.cells.length;
      }
      const free = pieces.filter(p => p.ray.every(i => occ[i] < 0)).length;
      best = { N, pieces, occ };
      if (pieces.length >= 4 && free <= Math.ceil(pieces.length * 0.6)) break;
    }
    return best;
  }

  function cellSVG(piece, idx) {
    const len = piece.cells.length, head = idx === len - 1, tail = idx === 0, col = BODY[piece.id % 3];
    const ice = (d, w = 11) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const shadow = d => `<path d="${d}" transform="translate(0 3)" fill="none" stroke="#5a2f0e" stroke-opacity=".35" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`;
    let d;
    if (len === 1) d = "M24 50H74M54 28L76 50L54 72";
    else if (head) d = "M-4 50H76M54 28L76 50L54 72";
    else if (tail) d = "M24 50H104";
    else d = "M-4 50H104";
    let body = `<rect x="6" y="6" width="88" height="88" rx="24" fill="${col}"/>`;
    if (!tail) body += `<rect x="-4" y="6" width="54" height="88" fill="${col}"/>`;
    if (!head) body += `<rect x="50" y="6" width="54" height="88" fill="${col}"/>`;
    const sheen = len === 1 ? `<path d="M18 30a26 26 0 0 1 22-14" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="5" stroke-linecap="round"/>` : "";
    const dot = tail && len > 1 ? `<circle cx="24" cy="50" r="3.5" fill="${col}"/>` : "";
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(${ANGLE[piece.d]} 50 50)">${body}${shadow(d)}${ice(d)}${dot}</g>${sheen}</svg>`;
  }

  window.SPIELE = window.SPIELE || {};
  SPIELE.pfeile = {
    name: "Pfeile",
    goal: "Tippe die Plätzchen an: Ist der Weg in Pfeilrichtung frei, gleiten sie hinaus. Schaffst du alle?",
    create(el, day, api) {
      const lvl = generate(size(api.level), api.level, api.rng), N = lvl.N;
      const occ = lvl.occ.slice(), alive = new Set(lvl.pieces.map(p => p.id));
      let lives = 3, locked = false;
      const timers = [];
      const later = (fn, ms) => timers.push(setTimeout(fn, ms));

      const wrap = document.createElement("div"); wrap.className = "pf-wrap";
      wrap.innerHTML = `<div class="pf-top"><div class="pf-hearts" role="img" aria-label="3 Herzen übrig">${HEART.repeat(3)}</div><div class="pf-count" aria-live="polite"></div></div><div class="pf-board" style="--n:${N};--gap:${N > 5 ? 3 : 4}px"></div>`;
      el.appendChild(wrap);
      const board = wrap.querySelector(".pf-board"), hearts = wrap.querySelectorAll(".pf-heart"), count = wrap.querySelector(".pf-count");
      board.insertAdjacentHTML("beforeend", `<div class="pf-pup" aria-hidden="true">${api.pup(api.FURS[day % 4], { hat: true })}</div>`);

      const pieceAt = new Map();
      for (const p of lvl.pieces) p.cells.forEach(i => pieceAt.set(i, p.id));
      const btns = new Map(lvl.pieces.map(p => [p.id, []]));
      for (let i = 0; i < N * N; i++) {
        const pid = pieceAt.get(i);
        if (pid === undefined) { board.insertAdjacentHTML("beforeend", `<div class="pf-hole"></div>`); continue; }
        const p = lvl.pieces[pid], idx = p.cells.indexOf(i), b = document.createElement("button");
        b.type = "button"; b.className = "pf-cell"; b.dataset.arrow = pid;
        if (idx === p.cells.length - 1) b.dataset.head = "1";
        b.setAttribute("aria-label", `Pfeil nach ${NAMES[p.d]}, Reihe ${Math.floor(i / N) + 1}, Spalte ${i % N + 1}`);
        b.innerHTML = cellSVG(p, idx);
        b.addEventListener("click", () => tap(pid));
        board.appendChild(b); btns.get(pid).push(b);
      }

      const blocker = p => { for (const i of p.ray) if (occ[i] >= 0) return occ[i]; return -1; };
      const isFree = p => blocker(p) < 0;
      const upd = () => { count.textContent = alive.size ? `Noch ${alive.size}` : ""; };
      upd();
      const replay = (b, cls, ms) => { b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls); later(() => b.classList.remove(cls), ms); };

      function tap(pid) {
        if (locked || !alive.has(pid)) return;
        const p = lvl.pieces[pid], [dr, dc] = DIRS[p.d];
        if (isFree(p)) {
          alive.delete(pid); p.cells.forEach(i => (occ[i] = -1));
          const ahead = p.ray.length + p.cells.length;
          for (const b of btns.get(pid)) {
            b.disabled = true; b.removeAttribute("data-arrow"); b.removeAttribute("data-head"); b.classList.remove("g-hint");
            b.style.setProperty("--dx", dc * ahead); b.style.setProperty("--dy", dr * ahead);
            b.classList.add("pf-out");
            later(() => b.remove(), 650);
          }
          api.sound("ok"); upd();
          if (!alive.size) { board.classList.add("pf-clear"); locked = true; api.win(); }
        } else {
          const hit = blocker(p);
          for (const b of btns.get(pid)) { b.style.setProperty("--bx", dc); b.style.setProperty("--by", dr); replay(b, "pf-bump", 400); }
          for (const b of btns.get(hit)) { replay(b, "pf-hit", 500); replay(b, "pf-flash", 500); }
          for (const b of btns.get(pid)) replay(b, "pf-flash", 500);
          api.sound("bad"); lives--;
          const h = hearts[lives]; h.classList.add("lost", "pop");
          wrap.querySelector(".pf-hearts").setAttribute("aria-label", `${lives} Herzen übrig`);
          api.mistake("Da ist was im Weg!");
          if (lives <= 0) { locked = true; api.fail("Keine Herzen mehr. Nochmal!"); }
        }
      }

      return {
        nextMove() {
          if (!alive.size) return [];
          if (lives <= 0) return ["#gameRestart"];
          for (const id of alive) if (isFree(lvl.pieces[id])) return [`#gameStage button[data-arrow="${id}"][data-head]`];
          return ["#gameRestart"];
        },
        destroy() { timers.forEach(clearTimeout); },
      };
    },
  };
})();
