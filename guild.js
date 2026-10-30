// ---------- tabs ----------
const TABS = ["find","apply","activity"];
function showTab(name) {
  if (!TABS.includes(name)) name = "find";
  TABS.forEach(t => { $("#tab-"+t).hidden = t !== name; $("[data-tab='"+t+"']").classList.toggle("active", t === name); });
  if (location.hash !== "#"+name) history.replaceState(null, "", "#"+name);
}
$$("[data-tab]").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));

// ---------- FIND caregivers ----------
const sv = savedLocation();
const startLoc = (sv && US_CITIES[sv.state] && typeof sv.city === "string" && sv.city.trim()) ? sv : {city:"Newark", state:"NJ"};
fillStates($("#fState"), startLoc.state); fillCities($("#fCity"), startLoc.state, startLoc.city);
$("#fService").innerHTML = `<option value="">Any service</option>` + SERVICES.map(s=>`<option>${esc(s)}</option>`).join("");
$("#fAnimal").innerHTML = `<option value="">Any animal</option>` + ANIMALS.map(s=>`<option>${esc(s)}</option>`).join("");
CitySearch.attach($("#fType"), $("#fSuggest"), e => { $("#fState").value = e.state; fillCities($("#fCity"), e.state, e.city); renderFind(); }, () => $("#fState").value);
$("#fState").addEventListener("change", () => { fillCities($("#fCity"), $("#fState").value, ""); renderFind(); });
["fCity","fService","fAnimal"].forEach(id => $("#"+id).addEventListener("change", renderFind));

function renderFind() {
  const db = Store.load();
  const loc = {city:$("#fCity").value, state:$("#fState").value};
  const svc = $("#fService").value, an = $("#fAnimal").value;
  const list = db.applications.filter(a => a.status === "approved" && a.city === loc.city && a.state === loc.state && (!svc || a.services.includes(svc)) && (!an || a.animals.includes(an)));
  $("#findCount").textContent = `${list.length} approved caregiver${list.length===1?"":"s"} in ${locLabel(loc)}`;
  if (!list.length) {
    $("#caregiverGrid").innerHTML = `<div class="empty">No approved caregivers in ${esc(locLabel(loc))} yet${svc||an?" for these filters":""}. <br><button class="text-btn" data-tab-go="apply">Be the first — apply to join the Guild</button></div>`;
    return;
  }
  $("#caregiverGrid").innerHTML = list.map(a => {
    const r = ratingOf(db, a.id);
    const badges = CHECKS.filter(([k]) => a.checks && a.checks[k]).map(([,l]) => `<span class="ok">✓ ${esc(l)}</span>`).join("");
    return `<article class="listing cg-card">
      <div class="listing-content">
        <div class="cg-head"><div class="cg-avatar">${esc(a.displayName.charAt(0))}</div><div><h3>${esc(a.displayName)}</h3><p class="cg-sub">${esc(a.city)}, ${esc(a.state)} · ${esc(a.years)} yr${Number(a.years)===1?"":"s"} experience</p></div></div>
        <div class="cg-rating">${r.n ? `<b>${stars(r.avg)}</b> ${r.avg.toFixed(1)} (${r.n} review${r.n===1?"":"s"})` : "<span class='muted'>No reviews yet</span>"}</div>
        <p>${esc(a.bio)}</p>
        <div class="animal-tags">${a.services.map(s=>`<span>${esc(s)}</span>`).join("")}</div>
        <div class="animal-tags cg-animals">${a.animals.map(s=>`<span>🐾 ${esc(s)}</span>`).join("")}</div>
        <div class="cg-badges">${badges}</div>
        ${a.demo ? `<p class="muted small">Sample caregiver for demonstration.</p>` : ""}
        <div class="cg-actions"><button class="primary-small" data-book="${esc(a.id)}">Request booking</button><button class="soft-btn small-btn" data-reviews="${esc(a.id)}">Reviews (${r.n})</button></div>
      </div></article>`;
  }).join("");
}
document.addEventListener("click", e => {
  const g = e.target.closest("[data-tab-go]"); if (g) showTab(g.dataset.tabGo);
  const b = e.target.closest("[data-book]"); if (b) openBooking(b.dataset.book);
  const r = e.target.closest("[data-reviews]"); if (r) openReviews(r.dataset.reviews);
});

// ---------- booking request ----------
function openBooking(id) {
  const a = Store.load().applications.find(x => x.id === id); if (!a) return;
  $("#bookTitle").textContent = `Request ${a.displayName}`;
  $("#bookForm").dataset.cg = id;
  $("#bkAnimal").innerHTML = a.animals.map(x=>`<option>${esc(x)}</option>`).join("");
  $("#bkService").innerHTML = a.services.map(x=>`<option>${esc(x)}</option>`).join("");
  $("#bookDone").hidden = true; $("#bookForm").hidden = false; $("#bookForm").reset();
  openModal("bookModal");
}
$("#bookForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, db = Store.load();
  const start = $("#bkStart").value, end = $("#bkEnd").value;
  if (end && end < start) return alert("The end date must be on or after the start date.");
  const req = {id:uid("REQ"), caregiverId:f.dataset.cg, ownerName:$("#bkName").value.trim(), ownerEmail:$("#bkEmail").value.trim().toLowerCase(), ownerPhone:$("#bkPhone").value.trim(), service:$("#bkService").value, animal:$("#bkAnimal").value, animalName:$("#bkPet").value.trim(), start, end, message:$("#bkMsg").value.trim(), status:"pending", reply:"", createdAt:new Date().toISOString()};
  db.requests.push(req); Store.save(db);
  f.hidden = true; $("#bookDone").hidden = false;
  $("#bookRef").textContent = req.id;
  renderFind();
});

// ---------- reviews view ----------
function openReviews(id) {
  const db = Store.load(), a = db.applications.find(x => x.id === id);
  const rs = db.reviews.filter(r => r.caregiverId === id).sort((x,y)=>y.createdAt.localeCompare(x.createdAt));
  $("#reviewsTitle").textContent = `Reviews for ${a.displayName}`;
  $("#reviewsList").innerHTML = rs.length ? rs.map(r=>`<div class="rv"><b>${stars(r.rating)}</b> <span class="muted small">${esc(r.ownerName)} · ${new Date(r.createdAt).toLocaleDateString()}</span><p>${esc(r.comment)}</p></div>`).join("") : `<p class="muted">No reviews yet. Owners can review after a caregiver accepts a booking request.</p>`;
  openModal("reviewsModal");
}

// ---------- APPLY ----------
fillStates($("#aState"), startLoc.state); fillCities($("#aCity"), startLoc.state, startLoc.city);
CitySearch.attach($("#aType"), $("#aSuggest"), e => { $("#aState").value = e.state; fillCities($("#aCity"), e.state, e.city); }, () => $("#aState").value);
$("#aState").addEventListener("change", () => fillCities($("#aCity"), $("#aState").value, ""));
$("#aServices").innerHTML = checkboxes("services", SERVICES);
$("#aAnimals").innerHTML = checkboxes("animals", ANIMALS);
$("#applyForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const services = f.getAll("services"), animals = f.getAll("animals");
  if (!services.length) return alert("Choose at least one service.");
  if (!animals.length) return alert("Choose at least one type of animal you are experienced with.");
  const loc = {city:String(f.get("city")), state:String(f.get("state"))};
  const db = Store.load();
  const email = String(f.get("email")).trim().toLowerCase();
  if (db.applications.some(a => a.email === email && ["pending","in_review","approved"].includes(a.status))) return alert("An application with this email already exists. Use the 'My activity' tab to see its status.");
  db.applications = db.applications.filter(a => !(a.email === email && a.status === "changes")); // resubmission after requested changes replaces the old one
  const app = {id:uid("CG"), status:"pending", checks:{id:false,references:false,qualifications:false,background:false}, notes:"", fullName:String(f.get("fullName")).trim(), displayName:String(f.get("displayName")).trim(), email, phone:String(f.get("phone")).trim(), city:loc.city, state:loc.state, services, animals, years:Number(f.get("years")||0), bio:String(f.get("bio")).trim(), qualifications:String(f.get("qualifications")).trim(), insured:f.get("insured")==="Yes", refs:[{name:String(f.get("r1n")).trim(),contact:String(f.get("r1c")).trim()},{name:String(f.get("r2n")).trim(),contact:String(f.get("r2c")).trim()}], consentBg:true, createdAt:new Date().toISOString()};
  db.applications.push(app); Store.save(db);
  e.target.hidden = true; $("#applyDone").hidden = false; $("#applyRef").textContent = app.id; $("#applyEmail").textContent = email;
});

// ---------- MY ACTIVITY (lookup by email) ----------
$("#actForm").addEventListener("submit", e => { e.preventDefault(); renderActivity($("#actEmail").value.trim().toLowerCase()); });
const STATUS_TEXT = {pending:"Received — waiting for review", in_review:"Under review", changes:"Changes requested", approved:"Approved and listed", rejected:"Not approved"};
function renderActivity(email) {
  const db = Store.load();
  const mine = db.applications.filter(a => a.email === email);
  const sent = db.requests.filter(r => r.ownerEmail === email);
  const cgIds = mine.map(a => a.id);
  const received = db.requests.filter(r => cgIds.includes(r.caregiverId));
  let h = "";
  if (mine.length) h += `<h3>Your caregiver application</h3>` + mine.map(a=>`<div class="act-card"><b>${esc(a.displayName)}</b> · ${esc(a.city)}, ${esc(a.state)}<br><span class="pill ${esc(a.status)}">${esc(STATUS_TEXT[a.status]||a.status)}</span>${a.status==="changes"&&a.notes?`<p class="muted">Reviewer note: ${esc(a.notes)}</p>`:""}${a.status==="rejected"&&a.notes?`<p class="muted">${esc(a.notes)}</p>`:""}<div class="cg-badges">${CHECKS.filter(([k])=>a.checks[k]).map(([,l])=>`<span class="ok">✓ ${esc(l)}</span>`).join("")}</div></div>`).join("");
  if (received.length) h += `<h3>Booking requests you received</h3>` + received.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(r=>`<div class="act-card"><b>${esc(r.ownerName)}</b> — ${esc(r.service)} for ${esc(r.animal)}${r.animalName?` (${esc(r.animalName)})`:""}<br><span class="muted">${esc(r.start)}${r.end?" → "+esc(r.end):""} · ref ${esc(r.id)}</span><p>${esc(r.message)}</p><p class="muted small">Owner contact: ${esc(r.ownerEmail)}${r.ownerPhone?" · "+esc(r.ownerPhone):""}</p>${r.status==="pending"?`<div class="cg-actions"><button class="primary-small" data-respond="${esc(r.id)}|accepted">Accept</button><button class="soft-btn small-btn" data-respond="${esc(r.id)}|declined">Decline</button></div>`:`<span class="pill ${esc(r.status)}">${esc(r.status)}</span>`}</div>`).join("");
  if (sent.length) h += `<h3>Requests you sent</h3>` + sent.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(r=>{
    const cg = db.applications.find(a=>a.id===r.caregiverId); const rev = db.reviews.find(x=>x.requestId===r.id);
    return `<div class="act-card"><b>${esc(cg?cg.displayName:"Caregiver")}</b> — ${esc(r.service)} for ${esc(r.animal)}<br><span class="muted">${esc(r.start)}${r.end?" → "+esc(r.end):""} · ref ${esc(r.id)}</span><br><span class="pill ${esc(r.status)}">${esc(r.status)}</span>${r.status==="accepted"?(rev?`<p class="muted">You rated this ${stars(rev.rating)}</p>`:`<div class="cg-actions"><button class="primary-small" data-rate="${esc(r.id)}">Leave a review</button></div>`):""}</div>`;
  }).join("");
  if (!h) h = `<div class="empty">Nothing found for ${esc(email)}. Check the spelling, or use the same email you used on the application or booking request.</div>`;
  $("#actResults").innerHTML = h; $("#actResults").dataset.email = email;
}
document.addEventListener("click", e => {
  const rs = e.target.closest("[data-respond]");
  if (rs) {
    const [id, status] = rs.dataset.respond.split("|");
    const reply = status === "accepted" ? "" : (prompt("Optional message to the owner:") || "");
    const db = Store.load(); const r = db.requests.find(x=>x.id===id); if (!r) return;
    r.status = status; r.reply = reply; r.respondedAt = new Date().toISOString(); Store.save(db);
    renderActivity($("#actResults").dataset.email);
  }
  const rt = e.target.closest("[data-rate]"); if (rt) { $("#rateForm").dataset.req = rt.dataset.rate; $("#rateForm").reset(); openModal("rateModal"); }
});
$("#rateForm").addEventListener("submit", e => {
  e.preventDefault();
  const db = Store.load(); const req = db.requests.find(r=>r.id===e.target.dataset.req);
  if (!req || req.status !== "accepted") return alert("Only accepted bookings can be reviewed.");
  if (db.reviews.some(r=>r.requestId===req.id)) return alert("This booking already has a review.");
  const rating = Number(new FormData(e.target).get("rating")); if (!rating) return alert("Please choose a star rating.");
  db.reviews.push({id:uid("RV"), caregiverId:req.caregiverId, requestId:req.id, ownerName:req.ownerName.split(" ")[0], rating, comment:$("#rvText").value.trim(), createdAt:new Date().toISOString()});
  Store.save(db); closeModal("rateModal"); renderActivity($("#actResults").dataset.email); renderFind();
});

renderFind();
showTab((location.hash || "#find").slice(1));
