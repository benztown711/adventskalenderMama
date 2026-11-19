// Spiel "Blöcke" (Block-Blast-Prinzip): Plätzchenblech 6 x 6, Blöcke aus der Ablage setzen,
// volle Reihen und Spalten verschwinden. Ziel: alle goldenen Ziellinien abräumen.
(() => {
  const N = 6, FULL = 63, TRAY_CELL = 20, GAP = 3, STYLE_ID = "bb-style";

  const CSS = `
.bb { display: flex; flex-direction: column; gap: 12px; align-items: stretch; position: relative; }
.bb-stat { font: 800 14px var(--font-body, sans-serif); color: var(--ink-soft, #5b4a3a); min-height: 1.3em; }
.bb-board {
  position: relative; width: 100%; aspect-ratio: 1; box-sizing: border-box; padding: 14px; display: grid;
  grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(6, 1fr); gap: ${GAP}px; border-radius: 20px;
  background: linear-gradient(160deg, #d9d4ca, #b0aa9d);
  box-shadow: 0 0 0 2px #8c8578, 0 8px 16px rgba(60,40,10,.25), inset 0 2px 0 rgba(255,255,255,.55);
}
.bb-cell {
  position: relative; border: 0; padding: 0; min-width: 0; min-height: 0; border-radius: 10px; cursor: pointer;
  background: #f1eadb; box-shadow: inset 0 2px 4px rgba(80,60,30,.3); -webkit-tap-highlight-color: transparent;
}
.bb-cell.t {
  background: repeating-linear-gradient(135deg, #ffeaa8 0 6px, #ffdd7e 6px 12px);
  box-shadow: inset 0 0 0 2px var(--gold, #d9a52e), inset 0 2px 4px rgba(120,80,0,.25);
}
.bb-cell.t.done { background: #cfeedd; box-shadow: inset 0 0 0 2px var(--green, #2e7d5b), inset 0 2px 4px rgba(0,60,30,.2); }
.bb-cell:focus-visible, .bb-blk:focus-visible { outline: 3px solid var(--blue, #2f6cb0); outline-offset: 1px; z-index: 4; }
.bb-pv { position: absolute; inset: 0; border-radius: 10px; opacity: 0; pointer-events: none; }
.bb-cell.will .bb-pv { opacity: 1; background: rgba(255,217,138,.7); box-shadow: inset 0 0 0 3px var(--gold, #d9a52e); }
.bb-cell.pv-ok .bb-pv { opacity: 1; background: rgba(95,50,15,.42); box-shadow: none; }
.bb-cell.pv-bad .bb-pv { opacity: 1; background: rgba(192,57,43,.5); box-shadow: none; }

/* Plätzchen */
.bb-k { position: relative; border-radius: 28%; background: radial-gradient(circle at 32% 25%, var(--hi), var(--ck) 72%);
  box-shadow: inset 0 -3px 0 rgba(0,0,0,.2), inset 0 2px 0 rgba(255,255,255,.35), 0 1px 2px rgba(60,30,0,.35); }
.bb-k::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; }
.bb-k.v0::after { background: radial-gradient(circle at 30% 32%, rgba(255,255,255,.85) 0 7%, transparent 8%), radial-gradient(circle at 68% 38%, rgba(255,255,255,.85) 0 7%, transparent 8%), radial-gradient(circle at 46% 70%, rgba(255,255,255,.85) 0 7%, transparent 8%); }
.bb-k.v1::after { background: radial-gradient(circle at 66% 30%, rgba(255,255,255,.85) 0 7%, transparent 8%), radial-gradient(circle at 30% 52%, rgba(255,255,255,.85) 0 7%, transparent 8%), radial-gradient(circle at 62% 72%, rgba(255,255,255,.85) 0 7%, transparent 8%); }
.bb-k.v2::after { background: radial-gradient(circle at 28% 28%, rgba(255,255,255,.85) 0 7%, transparent 8%), radial-gradient(circle at 70% 55%, rgba(255,255,255,.85) 0 7%, transparent 8%), radial-gradient(circle at 36% 74%, rgba(255,255,255,.85) 0 7%, transparent 8%); }
.bb-k.cg::after { background: linear-gradient(135deg, rgba(255,255,255,.55), transparent 45%); }
.c0 { --ck: #c47d3c; --hi: #e0a063; } .c1 { --ck: #e88f8c; --hi: #f6b8b4; } .c2 { --ck: #6fb894; --hi: #a5dcc0; }
.c3 { --ck: #6f9fd6; --hi: #a9c8ee; } .c4 { --ck: #a98bd3; --hi: #cdb8ec; } .cg { --ck: #e0a81f; --hi: #ffe38f; }
.bb-ck { position: absolute; inset: 3px; }
.bb-ck.nw { animation: bb-pop .32s cubic-bezier(.3,1.7,.5,1); }
@keyframes bb-pop { 0% { transform: scale(.4); } 100% { transform: none; } }
.bb-num { position: relative; z-index: 1; display: grid; place-items: center; width: 100%; height: 100%; font-family: var(--font-display, serif); font-weight: 800; color: #5b3a02; text-shadow: 0 1px 0 rgba(255,255,255,.75); }
.bb-ck .bb-num { font-size: 20px; }

/* Abräumen */
.bb-gone { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
.bb-gone .bb-ck { animation: bb-gone .5s ease-in both; animation-delay: var(--dl, 0s); }
.bb-gone::after { content: ""; position: absolute; inset: 6px; border-radius: 50%; border: 3px solid var(--glow, #ffd98a); opacity: 0; animation: bb-ring .5s ease-out both; animation-delay: var(--dl, 0s); }
@keyframes bb-gone { 0% { transform: scale(1); } 35% { transform: scale(1.2) rotate(4deg); filter: brightness(1.25); } 100% { transform: scale(0) rotate(-12deg); opacity: 0; } }
@keyframes bb-ring { 0% { opacity: .9; transform: scale(.3); } 100% { opacity: 0; transform: scale(1.7); } }

/* Ziel-Markierungen am Rand */
.bb-mk { position: absolute; width: 14px; height: 14px; color: var(--gold, #d9a52e); pointer-events: none; transition: color .3s; }
.bb-mk svg { width: 100%; height: 100%; display: block; }
.bb-mk.done { color: var(--green, #2e7d5b); }
.bb-mk.done svg { animation: bb-pop .5s cubic-bezier(.3,1.7,.5,1); }
.bb-mk.r { top: calc(14px + var(--i) * ((100% - 43px) / 6 + ${GAP}px) + (100% - 43px) / 12 - 7px); }
.bb-mk.r.a { left: 0; } .bb-mk.r.b { right: 0; }
.bb-mk.c { left: calc(14px + var(--i) * ((100% - 43px) / 6 + ${GAP}px) + (100% - 43px) / 12 - 7px); }
.bb-mk.c.a { top: 0; } .bb-mk.c.b { bottom: 0; }

/* Ablage */
.bb-tray { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; min-height: 104px; padding: 8px; border-radius: 16px; background: rgba(168,100,44,.1); }
.bb-blk {
  touch-action: none; border: 0; background: #fff; border-radius: 14px; padding: 8px; min-width: 44px; min-height: 44px;
  display: grid; place-items: center; cursor: grab; -webkit-tap-highlight-color: transparent;
  box-shadow: 0 2px 0 rgba(127,69,25,.25), 0 0 0 2px rgba(168,100,44,.25);
}
.bb-blk[hidden] { display: none; }
.bb-blk[aria-pressed="true"] { background: #eef5ff; box-shadow: 0 0 0 3px var(--blue, #2f6cb0), 0 4px 10px rgba(47,108,176,.3); }
.bb-bg { display: grid; gap: 2px; grid-template-columns: repeat(var(--w), var(--s)); grid-template-rows: repeat(var(--h), var(--s)); --s: ${TRAY_CELL}px; pointer-events: none; }
.bb-bg .bb-num { font-size: calc(var(--s) * .58); }
.bb-ghost { position: fixed; z-index: 60; pointer-events: none; gap: ${GAP}px; filter: drop-shadow(0 8px 8px rgba(40,20,0,.35)); opacity: .94; }
.bb-ghost .bb-num { font-size: 20px; }
.bb-reduce *, .bb-reduce *::after { animation: none !important; transition: none !important; }
`;

  if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
    const s = document.createElement("style");
    s.id = STYLE_ID; s.textContent = CSS; document.head.appendChild(s);
  }

  // ---------- Logik (ohne DOM) ----------
  const popc = v => { let n = 0; while (v) { n += v & 1; v >>= 1; } return n; };
  const shapeKey = shape => shape.map(p => p.join(",")).join(";");
  const normalize = cells => {
    const mr = Math.min(...cells.map(p => p[0])), mc = Math.min(...cells.map(p => p[1]));
    return cells.map(([r, c]) => [r - mr, c - mc]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  };

  /** Alle Positionen (linke obere Ecke des Begrenzungsrahmens) mit Zeilenmasken. */
  function placementsOf(shape) {
    const h = Math.max(...shape.map(p => p[0])) + 1, w = Math.max(...shape.map(p => p[1])) + 1, out = [];
    for (let r0 = 0; r0 + h <= N; r0++) for (let c0 = 0; c0 + w <= N; c0++) {
      const m = Array(N).fill(0);
      shape.forEach(([dr, dc]) => { m[r0 + dr] |= 1 << (c0 + dc); });
      out.push({ r0, c0, m });
    }
    return out;
  }
  const fits = (rows, m) => { for (let i = 0; i < N; i++) if (m[i] & rows[i]) return false; return true; };

  /** Block setzen und volle Reihen/Spalten räumen. Liefert neue Zeilen, geräumte Linien, getroffene Ziele. */
  function applyMove(rows, m, targets) {
    const nr = rows.map((v, i) => v | m[i]);
    let ca = FULL; for (let i = 0; i < N; i++) ca &= nr[i];
    const fr = []; for (let i = 0; i < N; i++) if (nr[i] === FULL) fr.push(i);
    let tm = 0;
    targets.forEach((t, j) => { if (t.row ? nr[t.i] === FULL : (ca >> t.i) & 1) tm |= 1 << j; });
    return { rows: nr.map(v => (v === FULL ? 0 : v & ~ca)), tm, fr, ca };
  }

  /** Tiefensuche über die restlichen Blöcke (inkl. Abräumen). Liefert { found, plan, exceeded }. */
  function solve(rows0, used0, done0, blocks, targets, cap = 200000) {
    const memo = new Set(), allDone = (1 << targets.length) - 1, usedAll = (1 << blocks.length) - 1;
    let nodes = 0, exceeded = false;
    function dfs(rows, used, done) {
      if (done === allDone) return [];
      if (used === usedAll) return null;
      const key = rows.join() + "|" + used + "|" + done;
      if (memo.has(key)) return null;
      if (++nodes > cap) { exceeded = true; return null; }
      let rest = 0;
      blocks.forEach((b, i) => { if (!(used >> i & 1)) rest += b.shape.length; });
      let need = 0;
      targets.forEach((t, j) => {
        if (done >> j & 1) return;
        if (t.row) need += N - popc(rows[t.i]); else for (let r = 0; r < N; r++) if (!(rows[r] >> t.i & 1)) need++;
      });
      if (need > rest) { memo.add(key); return null; }
      const seen = new Set();
      for (let bi = 0; bi < blocks.length; bi++) {
        if (used >> bi & 1) continue;
        const b = blocks[bi];
        if (seen.has(b.key)) continue;
        seen.add(b.key);
        const cands = [];
        for (const p of b.pl) {
          if (!fits(rows, p.m)) continue;
          let sc = 0;
          targets.forEach((t, j) => {
            if (done >> j & 1) return;
            if (t.row) sc += popc(p.m[t.i]); else for (let r = 0; r < N; r++) if (p.m[r] >> t.i & 1) sc++;
          });
          cands.push([sc, p]);
        }
        cands.sort((a, b2) => b2[0] - a[0]);
        for (const [, p] of cands) {
          const res = applyMove(rows, p.m, targets);
          const sub = dfs(res.rows, used | 1 << bi, done | res.tm);
          if (sub) return [{ b: bi, r0: p.r0, c0: p.c0 }, ...sub];
          if (exceeded) return null;
        }
      }
      memo.add(key);
      return null;
    }
    const plan = dfs(rows0, used0, done0);
    return { found: !!plan, plan, exceeded };
  }

  /** Level aus api.rng: Ziellinien voll belegen, Rest zufällig, dann Blöcke herausschneiden (lösbar per Konstruktion). */
  function generate(api) {
    const rnd = api.rng, l = api.level, pick = n => Math.floor(rnd() * n);
    const nT = l < .3 ? 1 : l < .65 ? 2 : 3;
    const nB = l < .3 ? 3 : 4;
    const p = .3 + .12 * l;
    let last = null;
    for (let attempt = 0; attempt < 300; attempt++) {
      const rowsT = rnd() < .5;                       // Ziele sind alle Reihen oder alle Spalten (kreuzen sich nie)
      const idx = [0, 1, 2, 3, 4, 5], tl = [];
      for (let i = 0; i < nT; i++) tl.push(idx.splice(pick(idx.length), 1)[0]);
      const isT = (r, c) => tl.includes(rowsT ? r : c);
      const s0 = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => isT(r, c) || rnd() < p));
      // Keine Nicht-Ziellinie darf voll sein
      const lines = [];
      for (let i = 0; i < N; i++) {
        lines.push(Array.from({ length: N }, (_, c) => [i, c]));
        lines.push(Array.from({ length: N }, (_, r) => [r, i]));
      }
      lines.forEach(line => {
        if (!line.every(([r, c]) => s0[r][c])) return;
        if (line.every(([r, c]) => isT(r, c))) return;      // Ziellinie selbst
        const free = line.filter(([r, c]) => !isT(r, c));
        if (!free.length) return;
        const [r, c] = free[pick(free.length)]; s0[r][c] = false;
      });
      if (lines.some(line => line.every(([r, c]) => s0[r][c]) && !line.every(([r, c]) => isT(r, c)))) continue;
      // Blöcke herausschneiden
      const cut = Array.from({ length: N }, () => Array(N).fill(false)), pieces = [];
      let ok = true;
      for (let k = 0; k < nB && ok; k++) {
        const cand = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          if (!s0[r][c] || cut[r][c]) continue;
          if (k < nT && (rowsT ? r : c) !== tl[k]) continue;
          cand.push([r, c]);
        }
        if (!cand.length) { ok = false; break; }
        const seed = cand[pick(cand.length)], sz = [2, 3, 3, 4, 4, 5][pick(6)], piece = [seed];
        cut[seed[0]][seed[1]] = true;
        while (piece.length < sz) {
          const nb = [];
          piece.forEach(([r, c]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
            const rr = r + dr, cc = c + dc;
            if (rr < 0 || cc < 0 || rr >= N || cc >= N || !s0[rr][cc] || cut[rr][cc]) return;
            if (!nb.some(q => q[0] === rr && q[1] === cc)) nb.push([rr, cc]);
          }));
          if (!nb.length) break;
          const q = nb[pick(nb.length)]; cut[q[0]][q[1]] = true; piece.push(q);
        }
        if (piece.length < 2) ok = false; else pieces.push(piece);
      }
      if (!ok) continue;
      if (!tl.every(t => pieces.some(pc => pc.some(([r, c]) => (rowsT ? r : c) === t)))) continue;
      const rowsInit = Array.from({ length: N }, (_, r) => { let v = 0; for (let c = 0; c < N; c++) if (s0[r][c] && !cut[r][c]) v |= 1 << c; return v; });
      const targets = tl.slice().sort((a, b) => a - b).map(i => ({ row: rowsT, i }));
      // Reihenfolge in der Ablage mischen, Gold und Farben vergeben
      const order = pieces.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) { const j = pick(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
      const big = order.filter(i => pieces[i].length >= 3), goldI = big.length ? big[pick(big.length)] : order[0];
      const off = pick(4);
      const blocks = order.map((pi, bi) => {
        const cells = pieces[pi], shape = normalize(cells);
        const h = Math.max(...shape.map(q => q[0])) + 1, w = Math.max(...shape.map(q => q[1])) + 1;
        // Zahl auf das Feld nahe der Mitte
        let numAt = 0, best = 1e9;
        shape.forEach(([r, c], i) => { const d = Math.abs(r - (h - 1) / 2) + Math.abs(c - (w - 1) / 2); if (d < best) { best = d; numAt = i; } });
        return { shape, w, h, key: shapeKey(shape), gold: pi === goldI, col: 1 + ((bi + off) % 4), numAt, num: api.day, pl: placementsOf(shape), used: false };
      });
      const res = { rows: rowsInit, targets, blocks, rowsT };
      last = res;
      if (solve(rowsInit, 0, 0, blocks, targets, 300000).found) return res;
    }
    return last;
  }

  const STAR = `<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M0-11 3.2-3.6 11-3.4 4.9 1.6 7 9.4 0 5 -7 9.4-4.9 1.6-11-3.4-3.2-3.6Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

  window.SPIELE = window.SPIELE || {};
  window.SPIELE.bloecke = {
    name: "Blöcke",
    goal: "Setze die Blöcke aufs Blech, bis alle goldenen Linien voll sind und verschwinden.",
    _lab: { generate, solve, applyMove, N },
    create(el, day, api) {
      const L = generate(api);
      const { targets, blocks } = L;
      const rows = L.rows.slice();
      const tdone = targets.map(() => false);
      const grid = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (rows[r] >> c & 1) ? { col: 0, gold: false, num: 0 } : null));
      let sel = -1, locked = false, dead = false, suppress = false, drag = null;
      const timers = [];
      const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); };
      const reduced = !!(api.reduced && api.reduced());
      const isTargetCell = (r, c) => targets.some(t => (t.row ? t.i === r : t.i === c));

      // ---------- DOM ----------
      const cellsHTML = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        cellsHTML.push(`<button type="button" class="bb-cell${isTargetCell(r, c) ? " t" : ""}" data-bb-cell="${r},${c}" data-r="${r}" data-c="${c}" aria-label=""><b class="bb-pv"></b></button>`);
      }
      const marksHTML = targets.map((t, j) => ["a", "b"].map(s =>
        `<span class="bb-mk ${t.row ? "r" : "c"} ${s}" data-bb-mark="${j}" style="--i:${t.i}">${STAR}</span>`).join("")).join("");
      const blockHTML = (b, bi, ghost) => {
        const cells = b.shape.map(([r, c], i) => {
          const gold = b.gold, cls = gold ? "cg" : "c" + b.col, v = "v" + ((r + 2 * c + bi) % 3);
          return `<i class="bb-k ${cls} ${v}" style="grid-area:${r + 1}/${c + 1}">${gold && i === b.numAt ? `<span class="bb-num">${b.num}</span>` : ""}</i>`;
        }).join("");
        return `<span class="bb-bg${ghost ? " bb-ghost" : ""}" style="--w:${b.w};--h:${b.h}">${cells}</span>`;
      };
      el.innerHTML = `<div class="bb${reduced ? " bb-reduce" : ""}">
        <div class="bb-stat" data-bb="stat"></div>
        <div class="bb-board" data-bb="board">${cellsHTML.join("")}${marksHTML}</div>
        <div class="bb-tray" data-bb="tray">${blocks.map((b, bi) =>
          `<button type="button" class="bb-blk" data-bb-blk="${bi}" data-shape="${b.key}" aria-pressed="false" aria-label="Block aus ${b.shape.length} Plätzchen${b.gold ? `, golden mit der Zahl ${b.num}` : ""}">${blockHTML(b, bi, false)}</button>`).join("")}</div>
      </div>`;
      const root = el.firstElementChild;
      const board = root.querySelector('[data-bb="board"]'), tray = root.querySelector('[data-bb="tray"]'), stat = root.querySelector('[data-bb="stat"]');
      const cellEl = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => board.querySelector(`[data-bb-cell="${r},${c}"]`)));
      const blkEl = blocks.map((_, bi) => tray.querySelector(`[data-bb-blk="${bi}"]`));

      function paintCell(r, c, fresh) {
        const b = cellEl[r][c], g = grid[r][c], old = b.querySelector(".bb-ck");
        if (old) old.remove();
        b.dataset.filled = g ? "1" : "";
        if (!g) delete b.dataset.filled;
        b.setAttribute("aria-label", `Reihe ${r + 1}, Spalte ${c + 1}, ${g ? "belegt" : "frei"}${isTargetCell(r, c) ? ", goldene Linie" : ""}`);
        if (g) {
          const k = document.createElement("i");
          k.className = `bb-k bb-ck ${g.gold ? "cg" : "c" + g.col} v${(r + 2 * c) % 3}${fresh ? " nw" : ""}`;
          if (g.num) k.innerHTML = `<span class="bb-num">${g.num}</span>`;
          b.insertBefore(k, b.firstChild);
        }
      }
      function paintStat() {
        const left = tdone.filter(x => !x).length, row = L.rowsT;
        stat.textContent = left ? `Noch ${left} goldene ${row ? (left === 1 ? "Reihe" : "Reihen") : (left === 1 ? "Spalte" : "Spalten")}` : "Alle goldenen Linien geschafft!";
        targets.forEach((t, j) => {
          root.querySelectorAll(`[data-bb-mark="${j}"]`).forEach(m => m.classList.toggle("done", tdone[j]));
          for (let k = 0; k < N; k++) cellEl[t.row ? t.i : k][t.row ? k : t.i].classList.toggle("done", tdone[j]);
        });
      }
      function paintTray() {
        blocks.forEach((b, bi) => {
          blkEl[bi].hidden = b.used;
          blkEl[bi].setAttribute("aria-pressed", String(sel === bi && !b.used));
        });
      }
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) paintCell(r, c, false);
      paintStat(); paintTray();

      // ---------- Vorschau ----------
      let pvCells = [];
      function clearPreview() { pvCells.forEach(e => e.classList.remove("pv-ok", "pv-bad", "will")); pvCells = []; }
      function mark(e, cls) { e.classList.add(cls); pvCells.push(e); }
      function showPreview(bi, r0, c0) {
        clearPreview();
        const b = blocks[bi];
        const cells = b.shape.map(([dr, dc]) => [r0 + dr, c0 + dc]);
        const inB = cells.filter(([r, c]) => r >= 0 && c >= 0 && r < N && c < N);
        const pl = b.pl.find(p => p.r0 === r0 && p.c0 === c0);
        const ok = !!pl && fits(rows, pl.m) && inB.length === cells.length;
        if (ok) {
          const res = applyMove(rows, pl.m, targets);
          const lines = [];
          for (let i = 0; i < N; i++) {
            const m = pl.m.map((v, k) => v | rows[k]);
            if (m[i] === FULL) lines.push(Array.from({ length: N }, (_, c) => [i, c]));
            if (m.every(v => v >> i & 1)) lines.push(Array.from({ length: N }, (_, r) => [r, i]));
          }
          void res;
          lines.forEach(line => line.forEach(([r, c]) => mark(cellEl[r][c], "will")));
        }
        inB.forEach(([r, c]) => { cellEl[r][c].classList.remove("will"); mark(cellEl[r][c], ok ? "pv-ok" : "pv-bad"); });
      }
      function flashBad(bi, r0, c0) {
        showPreview(bi, r0, c0);
        later(clearPreview, 450);
      }

      // ---------- Zug ----------
      function usedMask() { return blocks.reduce((m, b, i) => m | (b.used ? 1 << i : 0), 0); }
      function doneMask() { return tdone.reduce((m, d, j) => m | (d ? 1 << j : 0), 0); }

      function tryPlace(bi, r0, c0) {
        const b = blocks[bi];
        if (locked || !b || b.used) return false;
        const pl = b.pl.find(p => p.r0 === r0 && p.c0 === c0);
        if (!pl || !fits(rows, pl.m)) {
          api.message("Da passt der Block nicht."); api.sound("bad");
          flashBad(bi, r0, c0);
          return false;
        }
        clearPreview();
        const res = applyMove(rows, pl.m, targets);
        // Block auf das Blech
        b.shape.forEach(([dr, dc], i) => {
          const r = r0 + dr, c = c0 + dc;
          grid[r][c] = { col: b.col, gold: b.gold, num: b.gold && i === b.numAt ? b.num : 0 };
          paintCell(r, c, true);
        });
        b.used = true; sel = -1;
        // Geräumte Linien
        const colsFull = []; for (let c = 0; c < N; c++) if (res.ca >> c & 1) colsFull.push(c);
        const gone = [];
        res.fr.forEach(r => { for (let c = 0; c < N; c++) gone.push([r, c, c]); });
        colsFull.forEach(c => { for (let r = 0; r < N; r++) if (!(res.fr.includes(r))) gone.push([r, c, r]); });
        gone.forEach(([r, c, k]) => {
          const g = grid[r][c]; if (!g) return;
          grid[r][c] = null;
          if (!reduced) {
            const s = document.createElement("span");
            s.className = "bb-gone"; s.style.setProperty("--dl", (k * 0.04).toFixed(2) + "s");
            s.innerHTML = `<i class="bb-k bb-ck ${g.gold ? "cg" : "c" + g.col} v${(r + 2 * c) % 3}">${g.num ? `<span class="bb-num">${g.num}</span>` : ""}</i>`;
            cellEl[r][c].appendChild(s);
            later(() => s.remove(), 900);
          }
          paintCell(r, c, false);
        });
        for (let i = 0; i < N; i++) rows[i] = res.rows[i];
        for (let j = 0; j < targets.length; j++) if (res.tm >> j & 1) tdone[j] = true;
        paintStat(); paintTray();
        api.message("");
        api.sound(gone.length ? "clear" : "ok");

        if (tdone.every(Boolean)) { locked = true; api.win(); return true; }
        const rem = blocks.filter(x => !x.used);
        if (!rem.length || !rem.some(x => x.pl.some(p => fits(rows, p.m)))) {
          locked = true; api.fail("Kein Platz mehr. Nochmal!"); return true;
        }
        if (!dead) {
          const s = solve(rows, usedMask(), doneMask(), blocks, targets, 150000);
          if (!s.found && !s.exceeded) { dead = true; api.mistake("Hmm, das wird eng."); }
        }
        return true;
      }

      function select(bi) {
        if (blocks[bi].used) return;
        sel = bi; paintTray();
      }

      // ---------- Klicks ----------
      tray.addEventListener("click", e => {
        const bt = e.target.closest(".bb-blk");
        if (!bt || locked || suppress) return;
        select(+bt.dataset.bbBlk);
        api.sound("tap"); api.message("Jetzt ein Feld antippen.");
      });
      board.addEventListener("click", e => {
        const bt = e.target.closest(".bb-cell");
        if (!bt || locked) return;
        if (sel < 0) { api.message("Tippe zuerst einen Block an."); return; }
        tryPlace(sel, +bt.dataset.r, +bt.dataset.c);
      });

      // ---------- Ziehen ----------
      let ghost = null, metrics = null;
      function startGhost(bi) {
        const r00 = cellEl[0][0].getBoundingClientRect(), r01 = cellEl[0][1].getBoundingClientRect();
        metrics = { x0: r00.left, y0: r00.top, cell: r00.width, step: r01.left - r00.left };
        const tmp = document.createElement("div");
        tmp.innerHTML = blockHTML(blocks[bi], bi, true);
        ghost = tmp.firstElementChild;
        ghost.style.setProperty("--s", metrics.cell + "px");
        root.appendChild(ghost);
        const b = blocks[bi];
        metrics.gw = b.w * metrics.step - GAP; metrics.gh = b.h * metrics.step - GAP;
      }
      function moveGhost(x, y) {
        const m = metrics, left = x - m.gw / 2, top = y - m.gh - 46;
        ghost.style.left = left + "px"; ghost.style.top = top + "px";
        const c = Math.round((left - m.x0) / m.step), r = Math.round((top - m.y0) / m.step);
        drag.anchor = { r, c };
        showPreview(drag.bi, r, c);
      }
      function stopGhost() { if (ghost) ghost.remove(); ghost = null; }
      tray.addEventListener("pointerdown", e => {
        const bt = e.target.closest(".bb-blk");
        if (!bt || locked || !e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
        suppress = false;
        drag = { id: e.pointerId, bi: +bt.dataset.bbBlk, x0: e.clientX, y0: e.clientY, on: false, anchor: null };
        try { bt.setPointerCapture(e.pointerId); } catch {}
      });
      tray.addEventListener("pointermove", e => {
        if (!drag || e.pointerId !== drag.id || locked) return;
        if (!drag.on) {
          if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
          drag.on = true; select(drag.bi); api.sound("tap"); startGhost(drag.bi);
        }
        moveGhost(e.clientX, e.clientY);
      });
      const endDrag = (e, ok) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag; drag = null;
        if (!d.on) return;
        suppress = true; later(() => { suppress = false; }, 300);
        stopGhost(); clearPreview();
        if (!ok || !d.anchor || locked) return;
        const b = blocks[d.bi];
        const any = b.shape.some(([dr, dc]) => { const r = d.anchor.r + dr, c = d.anchor.c + dc; return r >= 0 && c >= 0 && r < N && c < N; });
        if (any) tryPlace(d.bi, d.anchor.r, d.anchor.c);
      };
      tray.addEventListener("pointerup", e => endDrag(e, true));
      tray.addEventListener("pointercancel", e => endDrag(e, false));

      // ---------- Schnittstelle ----------
      return {
        nextMove() {
          if (tdone.every(Boolean)) return [];
          const s = solve(rows, usedMask(), doneMask(), blocks, targets, 1500000);
          if (!s.found) return ["#gameRestart"];
          const m = s.plan[0];
          return [`#gameStage [data-bb-blk="${m.b}"]`, `#gameStage [data-bb-cell="${m.r0},${m.c0}"]`];
        },
        // für Tests: alle erlaubten Züge des aktuellen Zustands und ob danach noch lösbar
        moves() {
          const out = [];
          blocks.forEach((b, bi) => { if (b.used) return; b.pl.forEach(p => {
            if (!fits(rows, p.m)) return;
            const res = applyMove(rows, p.m, targets);
            let d = doneMask(); for (let j = 0; j < targets.length; j++) if (res.tm >> j & 1) d |= 1 << j;
            const all = d === (1 << targets.length) - 1;
            const s = all ? { found: true } : solve(res.rows, usedMask() | 1 << bi, d, blocks, targets, 150000);
            out.push({ b: bi, r: p.r0, c: p.c0, solvable: s.found || !!s.exceeded });
          }); });
          return out;
        },
        destroy() { timers.forEach(clearTimeout); stopGhost(); drag = null; locked = true; },
      };
    },
  };
})();
