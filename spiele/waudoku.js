(() => {
  const CSS = `
.wd { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.wd-board { display: grid; gap: 5px; padding: 6px; border-radius: 16px; width: 100%; max-width: 335px;
  background: linear-gradient(160deg, var(--ginger), var(--ginger-dark)); box-shadow: 0 6px 14px rgba(127,69,25,.28), inset 0 1px 0 rgba(255,255,255,.25); }
.wd-box { display: grid; gap: 2px; }
.wd-cell { position: relative; aspect-ratio: 1; padding: 0; border: 0; border-radius: 8px; cursor: pointer; display: grid; place-items: center;
  background: #fffaf0; color: inherit; font: inherit; -webkit-tap-highlight-color: transparent; transition: background .15s, box-shadow .15s; }
.wd-cell svg { width: 90%; height: 90%; display: block; pointer-events: none; overflow: visible; }
.wd-cell.wd-given { background: #ecd3ab; box-shadow: inset 0 0 0 2px rgba(127,69,25,.35), inset 0 -3px 0 rgba(127,69,25,.18); cursor: default; }
.wd-cell.wd-given svg { width: 82%; height: 82%; }
.wd-cell.wd-mine { background: #fff; cursor: default; }
.wd-cell.wd-rel { background: #fff0d0; }
.wd-cell.wd-sel { background: #ffe3a0; box-shadow: 0 0 0 3px var(--gold), 0 0 12px var(--glow); z-index: 2; }
.wd-cell:focus-visible, .wd-pick:focus-visible { outline: 3px solid var(--blue); outline-offset: 1px; z-index: 3; }
.wd-cell.wd-empty::after { content: ""; width: 22%; height: 22%; border-radius: 50%; background: rgba(168,100,44,.22); }
.wd-cell.wd-sel.wd-empty::after { background: var(--gold); }
.wd-cell.wd-wrong { background: #ffd3cc; box-shadow: 0 0 0 3px var(--red); animation: wdShake .42s; }
.wd-cell.wd-wrong svg { opacity: .8; }
.wd-cell.wd-wrong::after { display: none; }
.wd-cell.wd-hop svg { animation: wdHop .5s cubic-bezier(.3,1.6,.5,1); }
.wd-cell.wd-shine { animation: wdShine .8s ease-out; }
@keyframes wdShake { 0%,100% { transform: none; } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
@keyframes wdHop { 0% { transform: translateY(-26px) scale(.6); opacity: 0; } 55% { transform: translateY(2px) scale(1.12); opacity: 1; } 100% { transform: none; } }
@keyframes wdShine { 0% { box-shadow: 0 0 0 0 rgba(255,217,138,0); } 35% { box-shadow: 0 0 0 4px var(--glow), 0 0 18px 4px var(--glow); background: #fff3c4; } 100% { box-shadow: none; } }
.wd-bar { display: flex; justify-content: center; gap: 6px; width: 100%; max-width: 335px; padding: 8px 6px; border-radius: 16px;
  background: var(--paper); box-shadow: inset 0 0 0 2px #e4d6bb; }
.wd-pick { flex: 1 1 0; min-width: 40px; max-width: 76px; aspect-ratio: 1; padding: 2px; border: 0; border-radius: 12px; background: #fff; cursor: pointer;
  box-shadow: 0 2px 0 #d9c7a4; display: grid; place-items: center; -webkit-tap-highlight-color: transparent; transition: transform .12s, opacity .2s; }
.wd-pick svg { width: 100%; height: 100%; display: block; pointer-events: none; }
.wd-pick:active { transform: translateY(2px); box-shadow: none; }
.wd-pick.wd-used { opacity: .35; cursor: default; box-shadow: none; }
@media (prefers-reduced-motion: reduce) { .wd-cell.wd-wrong, .wd-cell.wd-hop svg, .wd-cell.wd-shine { animation: none; } .wd-pick, .wd-cell { transition: none; } }
`;
  const COLLARS = ["#d63a2f", "#2f6cb0", "#2e9d5b", "#f2c230", "#8e4fc4", "#f07fa8"];
  const COLLAR_NAMES = ["roten", "blauen", "grünen", "gelben", "lila", "rosa"];
  const EXTRA_FURS = [
    { fur: "#38383e", ear: "#25252a", face: "#9a9aa3" },   // schwarz
    { fur: "#d5dae0", ear: "#8f97a1", face: "#f6f8fa" },   // grau-weiß
  ];

  function solveCount(n, bh, bw, grid, limit) {
    const g = grid.slice(), full = (1 << n) - 1;
    const rowM = Array(n).fill(0), colM = Array(n).fill(0), boxM = Array(n).fill(0);
    const bx = i => Math.floor(Math.floor(i / n) / bh) * (n / bw) + Math.floor((i % n) / bw);
    g.forEach((v, i) => { if (v >= 0) { const b = 1 << v; rowM[Math.floor(i / n)] |= b; colM[i % n] |= b; boxM[bx(i)] |= b; } });
    let count = 0;
    (function rec() {
      if (count >= limit) return;
      let best = -1, bestM = 0, bestN = 99;
      for (let i = 0; i < g.length; i++) if (g[i] < 0) {
        const m = full & ~(rowM[Math.floor(i / n)] | colM[i % n] | boxM[bx(i)]);
        let k = 0; for (let t = m; t; t &= t - 1) k++;
        if (k < bestN) { best = i; bestM = m; bestN = k; if (k <= 1) break; }
      }
      if (best < 0) { count++; return; }
      const r = Math.floor(best / n), c = best % n, b = bx(best);
      for (let v = 0; v < n; v++) if (bestM & (1 << v)) {
        const bit = 1 << v;
        g[best] = v; rowM[r] |= bit; colM[c] |= bit; boxM[b] |= bit;
        rec();
        g[best] = -1; rowM[r] &= ~bit; colM[c] &= ~bit; boxM[b] &= ~bit;
        if (count >= limit) return;
      }
    })();
    return count;
  }

  function shuffled(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Lösung aus Grundmuster, dann vertauschen; Vorgaben entfernen, solange die Lösung eindeutig bleibt
  function makePuzzle(n, bh, bw, holes, rng) {
    const sym = shuffled([...Array(n).keys()], rng);
    const bands = n / bh, stacks = n / bw;
    const order = (groups, size) => shuffled([...Array(groups).keys()], rng)
      .flatMap(g => shuffled([...Array(size).keys()], rng).map(k => g * size + k));
    const rows = order(bands, bh), cols = order(stacks, bw);
    const sol = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const rr = rows[r], cc = cols[c];
      sol.push(sym[(bw * (rr % bh) + Math.floor(rr / bh) + cc) % n]);
    }
    const grid = sol.slice();
    let removed = 0;
    for (const i of shuffled([...Array(n * n).keys()], rng)) {
      if (removed >= holes) break;
      const keep = grid[i]; grid[i] = -1;
      if (solveCount(n, bh, bw, grid, 2) === 1) removed++; else grid[i] = keep;
    }
    return { sol, grid };
  }

  function dogSVG(api, k) {
    const furs = api.FURS.concat(EXTRA_FURS);
    const col = COLLARS[k];
    const svg = api.pup(furs[k]);
    const collar = `<path d="M-15 14 Q0 26 15 14" fill="none" stroke="#fff" stroke-width="7.5" stroke-linecap="round"/>` +
      `<path d="M-15 14 Q0 26 15 14" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round"/>` +
      `<circle cx="0" cy="20.2" r="3.2" fill="#ffd24a" stroke="#fff" stroke-width="1.2"/>`;
    const i = svg.lastIndexOf("</g></svg>");
    return svg.slice(0, i) + collar + svg.slice(i);
  }

  const ensureCss = () => {
    if (document.getElementById("wd-css")) return;
    const s = document.createElement("style"); s.id = "wd-css"; s.textContent = CSS; document.head.appendChild(s);
  };

  window.SPIELE = window.SPIELE || {};
  SPIELE.waudoku = {
    name: "Wau-Doku",
    goal: "Jeder Welpe kommt genau einmal in jede Reihe, jede Spalte und jedes Kästchen. Tippe ein leeres Feld an und dann den passenden Welpen.",
    create(el, day, api) {
      ensureCss();
      const big = day >= 13;
      const n = big ? 6 : 4, bh = 2, bw = big ? 3 : 2;
      const t = big ? Math.min(1, Math.max(0, (api.level - 12 / 23) / (11 / 23))) : Math.min(1, Math.max(0, api.level / (11 / 23)));
      const holes = big ? 14 + Math.round(8 * t) : 6 + Math.round(4 * t);
      const { sol, grid } = makePuzzle(n, bh, bw, holes, api.rng);
      const vals = grid.slice();
      const given = grid.map(v => v >= 0);
      let sel = -1;
      const timers = [];
      const boxOf = i => Math.floor(Math.floor(i / n) / bh) * (n / bw) + Math.floor((i % n) / bw);
      const dogs = [...Array(n).keys()].map(k => dogSVG(api, k));
      const dogName = k => `Welpe mit ${COLLAR_NAMES[k]} Halsband`;

      el.innerHTML = "";
      const root = document.createElement("div"); root.className = "wd";
      const board = document.createElement("div"); board.className = "wd-board";
      board.style.gridTemplateColumns = `repeat(${n / bw}, 1fr)`;
      const cells = new Array(n * n);
      for (let b = 0; b < n; b++) {
        const box = document.createElement("div"); box.className = "wd-box";
        box.style.gridTemplateColumns = `repeat(${bw}, 1fr)`;
        const br = Math.floor(b / (n / bw)), bc = b % (n / bw);
        for (let r = 0; r < bh; r++) for (let c = 0; c < bw; c++) {
          const i = (br * bh + r) * n + bc * bw + c;
          const btn = document.createElement("button"); btn.type = "button";
          btn.dataset.wdCell = i;
          btn.addEventListener("click", () => clickCell(i));
          cells[i] = btn; box.appendChild(btn);
        }
        board.appendChild(box);
      }
      const bar = document.createElement("div"); bar.className = "wd-bar";
      const picks = [...Array(n).keys()].map(k => {
        const btn = document.createElement("button"); btn.type = "button"; btn.className = "wd-pick";
        btn.dataset.wdPup = k; btn.setAttribute("aria-label", dogName(k) + " einsetzen");
        btn.innerHTML = dogs[k];
        btn.addEventListener("click", () => place(k));
        bar.appendChild(btn); return btn;
      });
      root.append(board, bar); el.appendChild(root);

      const placed = k => vals.filter(v => v === k).length;
      function paintCell(i) {
        const b = cells[i], v = vals[i];
        b.className = "wd-cell";
        if (given[i]) b.classList.add("wd-given");
        else if (v >= 0) b.classList.add("wd-mine"); else b.classList.add("wd-empty");
        if (!given[i] && v < 0) {
          if (i === sel) b.classList.add("wd-sel");
          else if (sel >= 0 && (Math.floor(i / n) === Math.floor(sel / n) || i % n === sel % n || boxOf(i) === boxOf(sel))) b.classList.add("wd-rel");
        } else if (sel >= 0 && (Math.floor(i / n) === Math.floor(sel / n) || i % n === sel % n || boxOf(i) === boxOf(sel))) b.classList.add("wd-rel");
        b.innerHTML = v >= 0 ? dogs[v] : "";
        const r = Math.floor(i / n) + 1, c = (i % n) + 1;
        b.disabled = v >= 0;
        b.setAttribute("aria-label", v >= 0 ? `Reihe ${r}, Spalte ${c}: ${dogName(v)}${given[i] ? ", vorgegeben" : ""}` : `Reihe ${r}, Spalte ${c}: leer${i === sel ? ", ausgewählt" : ""}`);
        b.setAttribute("aria-pressed", i === sel ? "true" : "false");
      }
      function paintAll() {
        for (let i = 0; i < n * n; i++) paintCell(i);
        picks.forEach((p, k) => { const used = placed(k) >= n; p.classList.toggle("wd-used", used); p.disabled = used; });
      }
      function clickCell(i) {
        if (vals[i] >= 0) return;
        sel = i; api.sound("tap"); paintAll();
      }
      function complete(cellsIdx) { return cellsIdx.every(j => vals[j] >= 0); }
      function place(k) {
        if (sel < 0) { api.message("Tippe zuerst ein leeres Feld an."); return; }
        const i = sel;
        if (vals[i] >= 0 || placed(k) >= n) return;
        if (sol[i] !== k) {
          paintAll();
          const b = cells[i];
          b.classList.add("wd-wrong"); b.innerHTML = dogs[k];
          api.sound("bad"); api.mistake("Der Welpe passt da nicht.");
          timers.push(setTimeout(() => { paintCell(i); }, 520));
          return;
        }
        vals[i] = k; sel = -1; paintAll();
        cells[i].classList.add("wd-hop");
        const r = Math.floor(i / n), c = i % n, bx = boxOf(i);
        const all = [...Array(n * n).keys()];
        const units = [all.filter(j => Math.floor(j / n) === r), all.filter(j => j % n === c), all.filter(j => boxOf(j) === bx)].filter(complete);
        if (units.length) {
          api.sound("clear");
          const set = new Set(units.flat());
          set.forEach(j => cells[j].classList.add("wd-shine"));
          timers.push(setTimeout(() => set.forEach(j => cells[j].classList.remove("wd-shine")), 900));
        } else api.sound("ok");
        if (vals.every(v => v >= 0)) api.win();
      }
      paintAll();

      return {
        nextMove() {
          const i = vals.findIndex(v => v < 0);
          if (i < 0) return [];
          return [`#gameStage [data-wd-cell="${i}"]`, `#gameStage [data-wd-pup="${sol[i]}"]`];
        },
        destroy() { timers.forEach(clearTimeout); },
      };
    },
  };
})();
