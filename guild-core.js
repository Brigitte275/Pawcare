// PawCare Care Guild — caregiver applications, review, booking requests and ratings.
// STORAGE NOTE: everything is saved in this browser (localStorage) so the full workflow works
// without a server. To go live, replace Store.load/Store.save below with calls to your own backend
// (database + authentication + email). The rest of the code can stay the same.
const SERVICES = ["Pet sitting","Dog walking","Home visits","Boarding at sitter's home","Grooming","Farm & stable care","Volunteer help"];
const ANIMALS = ["Dogs","Cats","Small pets","Birds","Horses & farm","Reptiles & aquatic"];
const CHECKS = [["id","Government ID checked"],["references","References contacted"],["qualifications","Qualifications / insurance seen"],["background","Background check cleared"]];

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = p => p + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const Store = {
  key: "pawcare-guild",
  load() {
    try { const d = JSON.parse(localStorage.getItem(this.key)); if (d && d.applications) return d; } catch (e) {}
    const d = seed(); this.save(d); return d;
  },
  save(d) { try { localStorage.setItem(this.key, JSON.stringify(d)); } catch (e) { alert("Could not save in this browser."); } }
};

function seed() {
  const all = {id:true,references:true,qualifications:true,background:true};
  const mk = (id, displayName, city, state, services, animals, years, bio) => ({id, demo:true, status:"approved", checks:all, displayName, fullName:displayName, email:id.toLowerCase()+"@demo.invalid", phone:"", city, state, services, animals, years, bio, insured:true, createdAt:"2026-09-01T10:00:00Z"});
  return {
    applications: [
      mk("DEMO-1","Dana R.","Newark","NJ",["Pet sitting","Dog walking"],["Dogs","Cats"],5,"Daily walks and drop-in visits. Comfortable with senior pets and basic medication routines."),
      mk("DEMO-2","Marco L.","Miami","FL",["Dog walking","Home visits"],["Dogs","Birds"],3,"Early-morning walks and feeding visits. Experience with parrots and parakeets."),
      mk("DEMO-3","Priya S.","New York","NY",["Pet sitting","Boarding at sitter's home"],["Cats","Small pets"],6,"Quiet home for cats and rabbits. Former vet-clinic assistant."),
      mk("DEMO-4","Cole T.","Denver","CO",["Farm & stable care"],["Horses & farm"],9,"Stable checks, feeding and turnout for horses, ponies and goats.")
    ],
    requests: [],
    reviews: [
      {id:"RV-DEMO1",caregiverId:"DEMO-1",requestId:"",ownerName:"Sample owner",rating:5,comment:"Reliable and kind with our nervous dog.",createdAt:"2026-09-10T10:00:00Z",demo:true},
      {id:"RV-DEMO2",caregiverId:"DEMO-1",requestId:"",ownerName:"Sample owner",rating:4,comment:"Great updates and photos during the visits.",createdAt:"2026-09-18T10:00:00Z",demo:true},
      {id:"RV-DEMO3",caregiverId:"DEMO-3",requestId:"",ownerName:"Sample owner",rating:5,comment:"Our cat was relaxed and well looked after.",createdAt:"2026-09-22T10:00:00Z",demo:true}
    ]
  };
}

// ---------- theme (shared with the rest of PawCare) ----------
(function theme() {
  const t = $("#themeToggle"); if (!t) return;
  function apply(v) {
    document.documentElement.dataset.theme = v;
    t.innerHTML = v === "dark" ? "☀️ <span>Light mode</span>" : "🌙 <span>Dark mode</span>";
  }
  apply(localStorage.getItem("pawcare-theme") || "light");
  t.addEventListener("click", () => { const n = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; localStorage.setItem("pawcare-theme", n); apply(n); });
})();

const stars = n => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
const locLabel = l => `${l.city}, ${l.state}`;
function fillStates(sel, selected) { sel.innerHTML = Object.keys(US_STATES).map(st => `<option value="${st}">${esc(US_STATES[st])}</option>`).join(""); sel.value = selected; }
function fillCities(sel, state, selected) { let cs = US_CITIES[state] || []; if (selected && !cs.includes(selected)) cs = [selected, ...cs]; sel.innerHTML = cs.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(""); sel.value = cs.includes(selected) ? selected : (cs[0] || ""); }
function savedLocation() { try { return JSON.parse(localStorage.getItem("pawcare-location") || "null"); } catch (e) { return null; } }
function ratingOf(db, id) { const r = db.reviews.filter(x => x.caregiverId === id); return {n:r.length, avg:r.length ? r.reduce((a,b)=>a+b.rating,0)/r.length : 0}; }
function checkboxes(name, list) { return list.map(x=>`<label class="chk"><input type="checkbox" name="${name}" value="${esc(x)}"> ${esc(x)}</label>`).join(""); }
function openModal(id){ $("#"+id).hidden = false; }
function closeModal(id){ $("#"+id).hidden = true; }
document.addEventListener("click", e => {
  const c = e.target.closest("[data-close]"); if (c) closeModal(c.dataset.close);
  if (e.target.classList && e.target.classList.contains("modal-backdrop")) e.target.hidden = true;
});

