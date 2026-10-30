// Guild review desk: staff check each application, then approve, ask for changes or reject.
(function () {
  const PASS_KEY = "pawcare-admin-pass";
  async function hash(t) {
    try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("pawcare:" + t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
    catch (e) { return btoa(unescape(encodeURIComponent("pawcare:" + t))); }
  }
  const first = !localStorage.getItem(PASS_KEY);
  if (first) { $("#gateTitle").textContent = "Set a staff passcode"; $("#passLabel").textContent = "Choose a passcode (6+ characters)"; $("#gateBtn").textContent = "Save and open"; $("#gateNote").textContent = "First visit in this browser: the passcode you choose now will be required next time."; }
  $("#gateForm").addEventListener("submit", async e => {
    e.preventDefault();
    const h = await hash($("#pass").value);
    if (first) localStorage.setItem(PASS_KEY, h);
    else if (localStorage.getItem(PASS_KEY) !== h) return alert("Wrong passcode.");
    $("#gate").hidden = true; $("#desk").hidden = false; render();
  });

  let filter = "pending";
  const LABEL = {pending:"New", in_review:"In review", changes:"Changes requested", approved:"Approved", rejected:"Rejected"};

  function render() {
    const db = Store.load();
    const apps = db.applications.filter(a => !a.demo);
    const counts = s => apps.filter(a => a.status === s).length;
    $("#deskFilters").innerHTML = Object.keys(LABEL).map(s => `<button class="filter ${filter===s?"active":""}" data-f="${s}">${LABEL[s]} (${counts(s)})</button>`).join("");
    const list = apps.filter(a => a.status === filter).sort((a,b) => a.createdAt.localeCompare(b.createdAt));
    $("#deskList").innerHTML = list.length ? list.map(card).join("") : `<div class="empty">No applications with status “${LABEL[filter]}”.</div>`;
  }

  function card(a) {
    const done = CHECKS.filter(([k]) => a.checks[k]).length;
    return `<article class="care-form desk-card" data-id="${esc(a.id)}">
      <div class="desk-top"><div><h3>${esc(a.fullName)} <span class="muted small">shown as ${esc(a.displayName)}</span></h3><p class="muted">${esc(a.city)}, ${esc(a.state)} · ${esc(a.years)} yrs · ref ${esc(a.id)} · applied ${new Date(a.createdAt).toLocaleDateString()}</p></div><span class="pill ${esc(a.status)}">${esc(LABEL[a.status])}</span></div>
      <div class="desk-grid">
        <div><h4>Contact (private)</h4><p>${esc(a.email)}<br>${esc(a.phone)}</p>
          <h4>References</h4><p>${(a.refs||[]).map(r=>`${esc(r.name)} — ${esc(r.contact)}`).join("<br>")}</p>
          <h4>Qualifications</h4><p>${esc(a.qualifications||"None given")}<br><b>Insurance:</b> ${a.insured?"says yes — request proof":"no"}</p></div>
        <div><h4>Offers</h4><div class="animal-tags">${a.services.map(s=>`<span>${esc(s)}</span>`).join("")}</div>
          <h4>Animals</h4><div class="animal-tags">${a.animals.map(s=>`<span>${esc(s)}</span>`).join("")}</div>
          <h4>Public bio</h4><p>${esc(a.bio)}</p></div>
      </div>
      <h4>Checks (${done}/4)</h4>
      <div class="chk-row">${CHECKS.map(([k,l])=>`<label class="chk"><input type="checkbox" data-check="${k}" ${a.checks[k]?"checked":""}> ${esc(l)}</label>`).join("")}</div>
      <div class="care-field"><label>Reviewer notes (shown to the applicant if you request changes or reject)</label><textarea rows="2" data-notes>${esc(a.notes||"")}</textarea></div>
      <div class="cg-actions">
        <button class="soft-btn small-btn" data-act="save">Save progress</button>
        <button class="primary-small" data-act="approve" ${done===4?"":"disabled title='Tick all four checks first'"}>Approve and list</button>
        <button class="soft-btn small-btn" data-act="changes">Request changes</button>
        <button class="soft-btn small-btn danger" data-act="reject">${a.status==="approved"?"Remove from Guild":"Reject"}</button>
      </div></article>`;
  }

  document.addEventListener("change", e => {
    const c = e.target.closest("[data-check]"); if (!c) return;
    const art = c.closest(".desk-card"), n = art.querySelectorAll("[data-check]:checked").length;
    art.querySelector("[data-act=approve]").disabled = n !== 4;
  });
  document.addEventListener("click", e => {
    const f = e.target.closest("[data-f]"); if (f) { filter = f.dataset.f; render(); return; }
    const b = e.target.closest("[data-act]"); if (!b) return;
    const art = b.closest(".desk-card"), db = Store.load(), a = db.applications.find(x => x.id === art.dataset.id); if (!a) return;
    art.querySelectorAll("[data-check]").forEach(c => a.checks[c.dataset.check] = c.checked);
    a.notes = art.querySelector("[data-notes]").value.trim();
    const act = b.dataset.act, n = Object.values(a.checks).filter(Boolean).length;
    if (act === "save") a.status = a.status === "approved" ? "approved" : (n ? "in_review" : a.status);
    if (act === "approve") { if (n !== 4) return alert("Tick all four checks first."); a.status = "approved"; a.approvedAt = new Date().toISOString(); }
    if (act === "changes") { if (!a.notes) return alert("Add a note saying what the applicant needs to fix."); a.status = "changes"; }
    if (act === "reject") { if (!a.notes) return alert("Add a short reason in the notes first."); if (!confirm("Reject / remove this caregiver?")) return; a.status = "rejected"; }
    Store.save(db); render();
  });
})();
