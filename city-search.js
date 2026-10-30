// Type-ahead for US cities: type "newa", "Miami", "Springfield, MO" or "Portland Maine" and pick a suggestion.
const CitySearch = (() => {
  let index = null, rank = null;
  const rankOf = e => { if (!rank) { rank = new Map(US_TOP.map((k, i) => [k, i])); } const r = rank.get(e.city + "|" + e.state); return r === undefined ? 1e9 : r; };
  const titleCase = t => t.trim().replace(/\s+/g, " ").toLowerCase().replace(/(^|[\s\-'.(])([a-z])/g, (m, a, b) => a + b.toUpperCase());
  function build() {
    if (index) return index;
    index = [];
    for (const st of Object.keys(US_CITIES)) for (const c of US_CITIES[st]) index.push({city:c, state:st, lc:c.toLowerCase()});
    return index;
  }
  function stateFrom(text) {
    const t = text.trim().toLowerCase().replace(/\./g, "");
    if (!t) return null;
    for (const [code, name] of Object.entries(US_STATES)) if (code.toLowerCase() === t || name.toLowerCase() === t) return code;
    return null;
  }
  function parse(raw) {
    let q = raw.trim().toLowerCase().replace(/\s+/g, " "), st = null;
    q = q.replace(/^st\.? /, "saint ").replace(/^ft\.? /, "fort ").replace(/^mt\.? /, "mount ");
    if (q.includes(",")) { const i = q.lastIndexOf(","); const s = stateFrom(q.slice(i + 1)); if (s) { st = s; q = q.slice(0, i).trim(); } else q = q.replace(/,/g, " ").trim(); }
    else {
      // "newark nj" or "portland maine" without a comma
      const words = q.split(" ");
      for (let n = Math.min(3, words.length - 1); n >= 1; n--) { const s = stateFrom(words.slice(-n).join(" ")); if (s) { st = s; q = words.slice(0, -n).join(" "); break; } }
    }
    return {q, st};
  }
  function search(raw, limit = 8) {
    const {q, st} = parse(raw);
    if (q.length < 1) return [];
    const exact = [], starts = [], has = [];
    for (const e of build()) {
      if (st && e.state !== st) continue;
      if (e.lc === q) exact.push(e); else if (e.lc.startsWith(q)) starts.push(e); else if (q.length >= 3 && e.lc.includes(q)) has.push(e);
      
    }
    const byName = (a, b) => (rankOf(a) - rankOf(b)) || a.city.localeCompare(b.city) || a.state.localeCompare(b.state);
    return [...exact.sort(byName), ...starts.sort(byName), ...has.sort(byName)].slice(0, limit);
  }
  // getState: optional function returning the state code currently chosen elsewhere on the page,
  // used so a city that is not in the list can still be typed and used.
  function attach(input, list, onPick, getState) {
    let items = [], active = -1;
    const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    input.setAttribute("role", "combobox"); input.setAttribute("aria-autocomplete", "list"); input.setAttribute("aria-expanded", "false"); input.autocomplete = "off";
    list.setAttribute("role", "listbox");
    function close() { list.hidden = true; input.setAttribute("aria-expanded", "false"); active = -1; }
    function render() {
      items = search(input.value);
      if (!input.value.trim()) { close(); return; }
      const p = parse(input.value), st = p.st || (getState ? getState() : null), typed = titleCase(input.value.replace(/,.*$/, "").replace(/[^\p{L} .'\-()]/gu, "").trim());
      if (st && typed.length >= 2 && !items.some(e => e.state === st && e.lc === typed.toLowerCase())) items.push({city:typed, state:st, custom:true});
      list.innerHTML = items.length
        ? items.map((e, i) => e.custom
            ? `<div role="option" class="cs-item cs-custom" data-i="${i}" id="${list.id}-${i}">Use “${esc(e.city)}” as my city<span>${esc(US_STATES[e.state])}</span></div>`
            : `<div role="option" class="cs-item" data-i="${i}" id="${list.id}-${i}">${esc(e.city)}<span>${esc(US_STATES[e.state])}</span></div>`).join("")
        : `<div class="cs-none">No match. Add a state, like “${esc(titleCase(input.value))}, TX”, to use a city that is not listed.</div>`;
      list.hidden = false; input.setAttribute("aria-expanded", "true"); active = -1;
    }
    function pick(i) { const e = items[i]; if (!e) return; input.value = `${e.city}, ${e.state}`; close(); onPick({city:e.city, state:e.state, custom:!!e.custom}); }
    function mark() { list.querySelectorAll(".cs-item").forEach((el, i) => el.classList.toggle("on", i === active)); if (active >= 0) input.setAttribute("aria-activedescendant", `${list.id}-${active}`); }
    input.addEventListener("input", render);
    input.addEventListener("focus", () => { if (input.value.trim()) render(); });
    input.addEventListener("keydown", ev => {
      if (ev.key === "ArrowDown") { ev.preventDefault(); if (list.hidden) render(); active = Math.min(items.length - 1, active + 1); mark(); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); active = Math.max(0, active - 1); mark(); }
      else if (ev.key === "Enter") { if (!list.hidden && items.length) { ev.preventDefault(); pick(active >= 0 ? active : 0); } }
      else if (ev.key === "Escape") close();
    });
    list.addEventListener("mousedown", ev => { const o = ev.target.closest(".cs-item"); if (o) { ev.preventDefault(); pick(Number(o.dataset.i)); } });
    document.addEventListener("click", ev => { if (ev.target !== input && !list.contains(ev.target)) close(); });
    close();
  }
  return {search, attach};
})();
