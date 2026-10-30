const REGIONS = {
  Northeast:["CT","ME","MA","NH","RI","VT","NJ","NY","PA"],
  Midwest:["IL","IN","IA","KS","MI","MN","MO","NE","ND","OH","SD","WI"],
  West:["AK","AZ","CA","CO","HI","ID","MT","NV","NM","OR","UT","WA","WY"]
};
const regionOf = st => Object.keys(REGIONS).find(r => REGIONS[r].includes(st)) || "South";
const cleanCity = c => String(c).replace(/[^\p{L} .'\-()]/gu, "").replace(/\s+/g, " ").trim().slice(0, 60);
const makeLoc = (city, state) => ({city: cleanCity(city), state, region: regionOf(state)});

// Demonstration directory data.
const providers = [
  {name:"Happy Tails Multi-Animal Rescue",type:"Shelter",group:"Dogs",animals:["Dogs","Cats","Rabbits"],city:"New York",state:"NY",desc:"Rescue intake, temporary care and adoption support for companion animals.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1548199973-03cace0a7f3e?w=900&auto=format&fit=crop&q=85",services:["Rescue intake and welfare assessment","Foster placement and adoption matching","Basic care and vaccination referrals","New-owner transition support"]},
  {name:"Whiskers & Wings Rescue",type:"Shelter",group:"Cats",animals:["Cats","Kittens","Rabbits"],city:"Los Angeles",state:"CA",desc:"A sample rescue listing for cats, kittens and selected small companion animals.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900&auto=format&fit=crop&q=85",services:["Cat and kitten rescue","Foster care coordination","Adoption counselling","Basic health-check referrals"]},
  {name:"Feathered Friends Sanctuary",type:"Shelter",group:"Birds",animals:["Parrots","Parakeets","Cockatiels","Other companion birds"],city:"Chicago",state:"IL",desc:"A sample bird-rescue profile for rehoming and specialist bird-care support.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=900&auto=format&fit=crop&q=85",services:["Bird intake and safe housing","Species-aware rehoming","Diet and enrichment guidance","Avian-vet referral information"]},
  {name:"Little Paws Small Animal Haven",type:"Shelter",group:"Small pets",animals:["Rabbits","Guinea pigs","Hamsters","Rats","Mice"],city:"Houston",state:"TX",desc:"A sample small-animal rescue listing for rabbits and pocket pets.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=900&auto=format&fit=crop&q=85",services:["Small-pet rescue and temporary housing","Species-matched foster placement","Adoption education","Small-animal veterinary referrals"]},
  {name:"Hoofprints Equine Rescue",type:"Shelter",group:"Horses & farm",animals:["Horses","Ponies","Donkeys"],city:"Denver",state:"CO",desc:"A sample equine rescue profile for horse, pony and donkey welfare.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=900&auto=format&fit=crop&q=85",services:["Equine rescue and rehabilitation","Adoption and sanctuary placements","Farrier and veterinary coordination","Experienced adopter screening"]},
  {name:"Scales & Shells Reptile Rescue",type:"Shelter",group:"Reptiles & aquatic",animals:["Turtles","Tortoises","Lizards","Snakes"],city:"Phoenix",state:"AZ",desc:"A sample specialist rescue profile for reptiles and turtles; intake depends on species and capacity.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=900&auto=format&fit=crop&q=85",services:["Species identification and intake screening","Habitat and temperature guidance","Responsible rehoming","Exotic-animal veterinary referrals"]},
  {name:"Paws, Feathers & Co. Grooming",type:"Groomer",group:"Dogs",animals:["Dogs","Some cat breeds by appointment"],city:"Seattle",state:"WA",desc:"A sample grooming profile with coat-care services for companion animals.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=900&auto=format&fit=crop&q=85",services:["Bathing and drying","Brushing and de-shedding","Nail and paw care","Breed-appropriate coat trims"]},
  {name:"The Bunny Brush Studio",type:"Groomer",group:"Small pets",animals:["Rabbits"],city:"Boston",state:"MA",desc:"A sample rabbit-focused grooming profile. Handling and services should be confirmed before booking.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=900&auto=format&fit=crop&q=85",services:["Gentle coat brushing","Safe mat assessment","Nail-care appointments","Rabbit handling guidance"]},
  {name:"FeatherCare Avian Grooming",type:"Groomer",group:"Birds",animals:["Parrots","Parakeets","Cockatiels"],city:"Miami",state:"FL",desc:"A sample avian-care listing for bird owners seeking experienced, species-aware help.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=900&auto=format&fit=crop&q=85",services:["Beak, nail and feather-condition assessment","Species-appropriate bathing guidance","Low-stress handling","Avian-veterinarian referrals"]},
  {name:"Equine Coat & Care",type:"Groomer",group:"Horses & farm",animals:["Horses","Ponies"],city:"Dallas",state:"TX",desc:"A sample equine grooming profile for routine coat, mane, tail and hoof-area care.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=900&auto=format&fit=crop&q=85",services:["Coat brushing and bathing","Mane and tail care","Show preparation","Basic grooming education"]},
  {name:"All Creatures Companion Care",type:"Care Guild",group:"All animals",animals:["Dogs","Cats","Rabbits","Birds","Small mammals"],city:"Philadelphia",state:"PA",desc:"A sample caregiver network listing. Individual caregivers should state their trained species and limits.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&auto=format&fit=crop&q=85",services:["Pet sitting and home visits","Feeding and daily routine support","Medication only where trained and authorised","Species-specific caregiver matching"]},
  {name:"Stable Hands Care Network",type:"Care Guild",group:"Horses & farm",animals:["Horses","Ponies","Donkeys","Goats"],city:"Atlanta",state:"GA",desc:"A sample farm and equine care network for experienced animal handlers.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900&auto=format&fit=crop&q=85",services:["Stable and paddock checks","Feeding and water routines","Grooming assistance","Experienced farm-sitter matching"]},
  {name:"Milo",type:"Adoption",group:"Dogs",animals:["Dog"],city:"New York",state:"NY",desc:"Friendly adult dog looking for an active home.",meta:"Sample adoption profile",photo:"https://images.unsplash.com/photo-1552053831-71594a27632d?w=900&auto=format&fit=crop&q=85",petDetails:"2 years · Male · Friendly · Enjoys walks and play.",services:["Meet-and-greet","Adoption application","Home suitability discussion","Transition and care guidance"]},
  {name:"Luna",type:"Adoption",group:"Cats",animals:["Cat"],city:"Los Angeles",state:"CA",desc:"Curious young cat looking for a loving indoor home.",meta:"Sample adoption profile",photo:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900&auto=format&fit=crop&q=85",petDetails:"8 months · Female · Playful and curious.",services:["Meet-and-greet","Adoption application","Home suitability discussion","Transition and care guidance"]},
  {name:"Clover",type:"Adoption",group:"Small pets",animals:["Rabbit"],city:"Chicago",state:"IL",desc:"Gentle rabbit who needs a safe indoor setup and patient handling.",meta:"Sample adoption profile",photo:"https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=900&auto=format&fit=crop&q=85",petDetails:"1 year · Female · Gentle; needs rabbit-safe housing.",services:["Meet-and-greet","Rabbit housing checklist","Adoption application","Care and diet guidance"]},
  {name:"Rio",type:"Adoption",group:"Birds",animals:["Parakeet"],city:"Miami",state:"FL",desc:"A sociable parakeet seeking a home prepared for daily interaction and enrichment.",meta:"Sample adoption profile",photo:"https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=900&auto=format&fit=crop&q=85",petDetails:"Approx. 1 year · Sex not confirmed · Active and vocal.",services:["Bird-experienced adopter matching","Cage and enrichment checklist","Adoption application","Avian-vet guidance"]},
  {name:"Maple",type:"Adoption",group:"Horses & farm",animals:["Pony"],city:"Denver",state:"CO",desc:"A calm pony profile for an experienced equine home with suitable facilities.",meta:"Sample adoption profile",photo:"https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=900&auto=format&fit=crop&q=85",petDetails:"Adult pony · Temperament and health records must be confirmed.",services:["Experienced adopter screening","Facility suitability review","Meet-and-greet","Equine care transition plan"]},
  {name:"Shelly",type:"Adoption",group:"Reptiles & aquatic",animals:["Tortoise"],city:"Phoenix",state:"AZ",desc:"A tortoise rehoming example requiring a species-appropriate habitat and experienced keeper.",meta:"Sample adoption profile",photo:"https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=900&auto=format&fit=crop&q=85",petDetails:"Species, age and legal rehoming requirements must be confirmed.",services:["Species and legal-status verification","Habitat assessment","Experienced keeper matching","Exotic-vet care guidance"]},
  {name:"Wildlife Rescue & Rehabilitation Centre",type:"Shelter",group:"Wildlife",animals:["Native wildlife","Small mammals","Birds of prey (licensed specialist care)"],city:"Minneapolis",state:"MN",desc:"A sample wildlife rehabilitation listing. Wild animals are assessed by trained, licensed rehabilitators rather than offered as household pets.",meta:"Sample wildlife-care listing",photo:"https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=900&auto=format&fit=crop&q=85",services:["Wildlife rescue advice and safe referrals","Species identification and triage","Rehabilitation by qualified personnel","Release planning where appropriate"]},
  {name:"Aquatic Life Rehoming Network",type:"Shelter",group:"Reptiles & aquatic",animals:["Freshwater fish","Aquatic invertebrates"],city:"San Diego",state:"CA",desc:"A sample aquatic-animal rehoming profile focused on responsible aquarium transfers.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=900&auto=format&fit=crop&q=85",services:["Aquarium animal rehoming advice","Species and tank compatibility checks","Responsible surrender referrals","Water-quality education"]},
  {name:"Exotic Animal Care Guild",type:"Care Guild",group:"Reptiles & aquatic",animals:["Reptiles","Turtles","Tortoises","Aquarium fish"],city:"San Antonio",state:"TX",desc:"A sample specialist-care network. Only caregivers with verified species-specific experience should accept these animals.",meta:"Sample directory listing",photo:"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=900&auto=format&fit=crop&q=85",services:["Habitat checks and maintenance","Feeding support based on written care plans","Aquarium maintenance","Exotic-veterinarian coordination"]}
];


// Sample listings for every selectable location, so each city/state shows its own shelters,
// groomers, caregivers, vets and adoptable animals (demonstration data, not verified providers).
const regionCareTips = {
  Northeast:["Cold winters: limit time outdoors in freezing weather and wipe paws after walks on salted roads.","Check pets for ticks after outdoor time, especially in spring and autumn.","Keep an emergency vet number handy for winter storms and power cuts."],
  South:["Hot, humid summers: never leave animals in parked vehicles and always provide shade and fresh water.","Ask your vet about year-round flea, tick and heartworm prevention.","Walk dogs early morning or evening and check pavement heat before walks."],
  Midwest:["Large seasonal swings: keep pets warm and dry in winter and cool in summer heatwaves.","Check for ticks and fleas after outdoor time in grass and wooded areas.","Prepare a pet emergency kit for storm and tornado season."],
  West:["Dry and hot areas: carry water on walks and avoid hot pavement and midday heat.","Watch for wildfire smoke days and keep animals indoors when air quality is poor.","Be alert to foxtails (grass seeds) and rattlesnakes in outdoor areas."]
};
const dogPhoto="https://images.unsplash.com/photo-1552053831-71594a27632d?w=900&auto=format&fit=crop&q=85";
const catPhoto="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900&auto=format&fit=crop&q=85";
const groomPhoto="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=900&auto=format&fit=crop&q=85";
const shelterPhoto="https://images.unsplash.com/photo-1548199973-03cace0a7f3e?w=900&auto=format&fit=crop&q=85";
const guildPhoto="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&auto=format&fit=crop&q=85";
const vetPhoto="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&auto=format&fit=crop&q=85";
const adoptNames = ["Biscuit","Pepper","Willow","Ziggy","Hazel","Scout","Poppy","Rocky","Daisy","Oscar"];
const hashStr = str => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
function makeLocalListings(loc) {
  const h = hashStr(loc.city + "|" + loc.state);
  const base = {city:loc.city, state:loc.state, meta:"Sample directory listing"};
  const isCat = h % 2 === 1;
  return [
    {...base,name:`${loc.city} Animal Rescue Society`,type:"Shelter",group:"Dogs",animals:["Dogs","Cats","Rabbits"],desc:`A sample rescue and shelter listing serving ${loc.city}, ${loc.state}, with foster and adoption support.`,photo:shelterPhoto,services:["Rescue intake and welfare assessment","Foster placement and adoption matching","Basic care and vaccination referrals","New-owner transition support"]},
    {...base,name:`${loc.city} Paws & Coats Grooming`,type:"Groomer",group:"Dogs",animals:["Dogs","Cats by appointment"],desc:`A sample grooming listing in ${loc.city}, ${loc.state}, with coat care and wellness services.`,photo:groomPhoto,services:["Bathing and drying","Brushing and de-shedding","Nail and paw care","Breed-appropriate coat trims"]},
    {...base,name:`${loc.city} Neighborhood Care Guild`,type:"Care Guild",group:"All animals",animals:["Dogs","Cats","Rabbits","Birds","Small mammals"],desc:`A sample caregiver network in ${loc.city}, ${loc.state}. Individual caregivers should state their trained species and limits.`,photo:guildPhoto,services:["Pet sitting and home visits","Dog walking and daily routine support","Medication only where trained and authorised","Species-specific caregiver matching"]},
    {...base,name:`${loc.city} Community Veterinary Clinic`,type:"Veterinarian",group:"Dogs",animals:["Dogs","Cats","Rabbits","Small mammals"],desc:`A sample veterinary listing in ${loc.city}, ${loc.state}, for routine and urgent-care referrals.`,photo:vetPhoto,services:["Wellness exams and vaccinations","Parasite prevention advice","Spay, neuter and dental referrals","Emergency and after-hours guidance"]},
    {...base,name:adoptNames[h % adoptNames.length],type:"Adoption",group:isCat?"Cats":"Dogs",animals:[isCat?"Cat":"Dog"],desc:`${isCat?"Gentle cat":"Friendly dog"} looking for a loving home in ${loc.city}, ${loc.state}.`,meta:"Sample adoption profile",photo:isCat?catPhoto:dogPhoto,petDetails:isCat?"2 years · Calm and affectionate.":"3 years · Friendly and enjoys walks.",services:["Meet-and-greet","Adoption application","Home suitability discussion","Transition and care guidance"]}
  ];
}
// Listings are created on demand for the selected city (there are ~30,000 US cities and towns).
const generatedFor = new Set();
function ensureLocal(loc) {
  const k = loc.city + "|" + loc.state;
  if (generatedFor.has(k)) return;
  generatedFor.add(k);
  providers.push(...makeLocalListings(loc));
}
const keyOf = item => `${item.name}|${item.city}|${item.state}`;

let currentFilter = "All";
let currentAnimalFilter = "All animals";
let currentLocation = (() => {
  try { const l = JSON.parse(localStorage.getItem("pawcare-location") || "null"); if (l && US_CITIES[l.state] && typeof l.city === "string" && l.city.trim() && l.city.length <= 60) return makeLoc(l.city, l.state); } catch (e) {}
  return makeLoc("New York", "NY");
})();
let user = JSON.parse(localStorage.getItem("pawcare-user") || "null");
let favorites = JSON.parse(localStorage.getItem("pawcare-favorites") || "[]");
let signUpMode = false;
let selectedRole = "Pet Owner";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function locationName() {
  return `${currentLocation.city}, ${currentLocation.state}`;
}

function saveLocation() {
  localStorage.setItem("pawcare-location", JSON.stringify(currentLocation));
}

function renderLocalGuide() {
  const el = $("#localGuide"); if (!el) return;
  const tips = (regionCareTips[currentLocation.region] || []).map(t => `<li>${t}</li>`).join("");
  const q = encodeURIComponent(locationName());
  el.innerHTML = `<h3>Care guide for ${locationName()}</h3><ul>${tips}</ul><a href="care-guide.html?loc=${q}">Build a pet care plan for ${currentLocation.city} →</a>`;
}

function updateLocationUI() {
  const name = locationName();
  renderLocalGuide();
  $("#locationLabel").textContent = name;
  $("#statusText").textContent = `Virtual location active · ${name}`;
  $("#heroLocationText").textContent = name;
  $("#bannerLocation").textContent = name;
}

function fillCityOptions(state, selected) {
  const cities = US_CITIES[state] || [];
  const list = selected && !cities.includes(selected) ? [selected, ...cities] : cities; // keep a typed city that is not in the list
  $("#citySelect").innerHTML = list.map(c => `<option value="${c.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}">${c.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</option>`).join("");
  $("#citySelect").value = list.includes(selected) ? selected : (list[0] || "");
}
function populateLocations() {
  $("#cityType").value = "";
  $("#stateSelect").innerHTML = Object.keys(US_STATES).map(st => `<option value="${st}">${US_STATES[st]}</option>`).join("");
  $("#stateSelect").value = currentLocation.state;
  fillCityOptions(currentLocation.state, currentLocation.city);
}

function openModal(id){ $( "#" + id).hidden = false; }
function closeModal(id){ $( "#" + id).hidden = true; }

function renderListings() {
  const q = $("#searchInput").value.trim().toLowerCase();
  const loc = currentLocation;
  ensureLocal(loc);
  const results = providers.filter(item => {
    const inLocation = item.city === loc.city && item.state === loc.state;
    if (!inLocation) return false;
    const matchesFilter = currentFilter === "All" || item.type === currentFilter;
    const animalsText = (item.animals || []).join(" ").toLowerCase();
    const matchesAnimal = currentAnimalFilter === "All animals" ||
      (currentAnimalFilter === "Small pets" && /rabbit|guinea pig|hamster|rat|mouse|ferret/i.test(animalsText)) ||
      (currentAnimalFilter === "Birds" && /bird|parrot|parakeet|cockatiel/i.test(animalsText)) ||
      (currentAnimalFilter === "Horses & farm" && /horse|pony|donkey|goat|sheep|cow|pig|chicken/i.test(animalsText)) ||
      (currentAnimalFilter === "Reptiles & aquatic" && /turtle|tortoise|lizard|snake|fish|aquatic/i.test(animalsText)) ||
      (currentAnimalFilter === "Wildlife" && /wildlife|wild animal|hedgehog|fox|deer/i.test(animalsText)) ||
      (currentAnimalFilter === "Dogs" && /dog/i.test(animalsText)) ||
      (currentAnimalFilter === "Cats" && /cat/i.test(animalsText));
    const matchesSearch = !q || [item.name,item.type,item.group,item.city,item.state,item.desc,animalsText,...(item.services||[])].join(" ").toLowerCase().includes(q);
    return matchesFilter && matchesAnimal && matchesSearch;
  }).sort((a,b) => {
    const al = a.city === loc.city && a.state === loc.state ? 0 : 1;
    const bl = b.city === loc.city && b.state === loc.state ? 0 : 1;
    return al-bl;
  });
  if (!results.length) {
    $("#listingGrid").innerHTML = `<div class="empty">No sample listings match in ${locationName()}. Try another animal category, clear your filters, or choose a different location.</div>`;
    return;
  }
  $("#listingGrid").innerHTML = results.map(item => {
    const key = keyOf(item);
    const saved = favorites.includes(key);
    const isLocal = item.city === loc.city && item.state === loc.state;
    return `<article class="listing listing-clickable" data-details="${encodeURIComponent(key)}" tabindex="0" role="button" aria-label="View details for ${item.name}">
      <div class="listing-photo-wrap"><img class="listing-photo" src="${item.photo}" alt="${(item.animals||[]).join(", ")}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&auto=format&fit=crop&q=80'"><span class="type listing-type">${item.type}</span></div>
      <div class="listing-content"><div class="animal-tags">${(item.animals||[]).slice(0,3).map(a=>`<span>${a}</span>`).join("")}</div>
      <h3>${item.name}</h3><p>${item.desc}</p>
      <div class="listing-meta"><span>${isLocal ? "● Selected city · " : ""}${item.city}, ${item.state}<br>${item.meta}</span><button class="heart-btn ${saved ? "saved" : ""}" data-fav="${encodeURIComponent(key)}" aria-label="Favorite" type="button">${saved ? "♥" : "♡"}</button></div>
      <button class="listing-details-btn" type="button" data-details="${encodeURIComponent(key)}">View details & directions <span>→</span></button></div>
    </article>`;
  }).join("");
  $$("[data-fav]").forEach(btn => btn.addEventListener("click", event => {
    event.stopPropagation(); const key = decodeURIComponent(btn.dataset.fav);
    favorites = favorites.includes(key) ? favorites.filter(x => x !== key) : [...favorites, key];
    localStorage.setItem("pawcare-favorites", JSON.stringify(favorites)); renderListings();
  }));
  $$("[data-details]").forEach(el => el.addEventListener("click", event => { event.stopPropagation(); showProviderDetails(decodeURIComponent(el.dataset.details)); }));
  $$(".listing-clickable").forEach(card => card.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button")) { event.preventDefault(); showProviderDetails(decodeURIComponent(card.dataset.details)); }
  }));
}

function showProviderDetails(key) {
  const item = providers.find(p => keyOf(p) === key); if (!item) return;
  const destination = `${item.name}, ${item.city}, ${item.state}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
  const services = (item.services||[]).map(x=>`<li>${x}</li>`).join("");
  $("#providerDetailsContent").innerHTML = `<img class="provider-hero-photo" src="${item.photo}" alt="${(item.animals||[]).join(", ")}" onerror="this.style.display='none'"><span class="type">${item.type}</span><h2 id="providerModalTitle">${item.name}</h2><p class="provider-detail-desc">${item.desc}</p>
    ${item.petDetails ? `<div class="detail-block"><h3>Animal profile</h3><p>${item.petDetails}</p></div>` : ""}
    <div class="detail-block"><h3>Animals supported / available</h3><div class="detail-chips">${(item.animals||[]).map(a=>`<span>${a}</span>`).join("")}</div></div>
    <div class="detail-block"><h3>${item.type === "Adoption" ? "Adoption information" : "Services offered"}</h3><ul>${services}</ul></div>
    <div class="detail-block"><h3>Location</h3><p>${item.city}, ${item.state}</p><p class="detail-caveat">This sample profile does not include a verified street address. Check the map result and contact the provider to confirm the exact address before travelling.</p><div class="care-result-actions"><a href="${directions}" target="_blank" rel="noopener">Get directions ↗</a><a href="${map}" target="_blank" rel="noopener">View on Google Maps ↗</a></div></div>
    <p class="detail-demo-note">${item.meta}. Sample demonstration listing only — provider details, animal availability, opening hours and services must be verified before visiting.</p>`;
  openModal("providerDetailsModal");
}

function setFilter(filter) {
  currentFilter = filter;
  $$("#filterRow .filter").forEach(b => b.classList.toggle("active", b.dataset.filter === filter));
  renderListings();
}

function updateAuthButton() {
  $("#accountButton").textContent = user ? `Hi, ${user.name || "there"}` : "Sign in";
}

function setAuthMode(signup) {
  signUpMode = signup;
  $("#authTitle").textContent = signup ? "Join PawCare." : "Welcome back.";
  $("#authSubtitle").textContent = signup
    ? "Create your local PawCare profile and keep your favorites."
    : "Sign in to keep your favorites and profile on this device.";
  $("#nameField").hidden = !signup;
  $("#roleRow").hidden = !signup;
  $("#authSubmit").textContent = signup ? "Create account" : "Sign in";
  $("#switchAuth").textContent = signup ? "Already have an account? Sign in" : "Need an account? Create one";
  if (!signup) $("#nameInput").value = "";
}

$("#searchInput").addEventListener("input", renderListings);

$("#filterRow").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (btn) setFilter(btn.dataset.filter);
});

$("#animalFilterRow").addEventListener("click", e => {
  const btn = e.target.closest("[data-animal-filter]");
  if (!btn) return;
  currentAnimalFilter = btn.dataset.animalFilter;
  $$("[data-animal-filter]").forEach(b => b.classList.toggle("active", b === btn));
  renderListings();
});

$$(".quick-card").forEach(btn => btn.addEventListener("click", () => {
  setFilter(btn.dataset.filter);
  location.hash = "discover";
}));

$("#clearFilters").addEventListener("click", () => {
  $("#searchInput").value = "";
  setFilter("All");
  currentAnimalFilter = "All animals";
  $$("[data-animal-filter]").forEach(b => b.classList.toggle("active", b.dataset.animalFilter === currentAnimalFilter));
  renderListings();
});

$("#locationButton").addEventListener("click", () => {
  populateLocations();
  openModal("locationModal");
});
$("#vpnButton").addEventListener("click", () => {
  populateLocations();
  openModal("locationModal");
});
$("#changeLocation").addEventListener("click", () => {
  populateLocations();
  openModal("locationModal");
});

CitySearch.attach($("#cityType"), $("#citySuggest"), e => {
  currentLocation = makeLoc(e.city, e.state);
  saveLocation(); updateLocationUI(); renderListings(); closeModal("locationModal");
}, () => $("#stateSelect").value);

$("#stateSelect").addEventListener("change", () => fillCityOptions($("#stateSelect").value, ""));

$("#applyLocation").addEventListener("click", () => {
  currentLocation = makeLoc($("#citySelect").value, $("#stateSelect").value);
  saveLocation();
  updateLocationUI();
  renderListings();
  closeModal("locationModal");
});

$$("[data-close]").forEach(btn => btn.addEventListener("click", () => closeModal(btn.dataset.close)));
$$(".modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", e => {
  if (e.target === backdrop) backdrop.hidden = true;
}));

$("#accountButton").addEventListener("click", () => {
  if (user) {
    const logout = confirm(`Signed in as ${user.email}. Sign out?`);
    if (logout) {
      user = null;
      localStorage.removeItem("pawcare-user");
      updateAuthButton();
    }
    return;
  }
  setAuthMode(false);
  openModal("authModal");
});

$("#switchAuth").addEventListener("click", () => setAuthMode(!signUpMode));

$$(".role").forEach(btn => btn.addEventListener("click", () => {
  selectedRole = btn.dataset.role;
  $$(".role").forEach(x => x.classList.toggle("active", x === btn));
}));

$("#authForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#emailInput").value.trim();
  const password = $("#passwordInput").value;
  if (password.length < 6) return alert("Please use at least 6 characters for the password.");

  if (signUpMode) {
    user = {
      name: $("#nameInput").value.trim() || "PawCare member",
      email,
      role: selectedRole
    };
  } else {
    user = {name: email.split("@")[0], email, role:"Pet Owner"};
  }
  localStorage.setItem("pawcare-user", JSON.stringify(user));
  updateAuthButton();
  closeModal("authModal");
  alert(`You're signed in as ${user.name}. Your session will stay on this browser until you sign out.`);
});


document.querySelector("[data-adopt-filter]").addEventListener("click", () => {
  setFilter("Adoption");
});

updateLocationUI();
updateAuthButton();
populateLocations();
renderListings();

// Accessible theme preference, saved on this device.
const themeToggle = document.querySelector('#themeToggle');
function applyTheme(theme){
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeToggle.innerHTML = dark ? '☀️ <span>Light mode</span>' : '🌙 <span>Dark mode</span>';
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#17131e' : '#9b5de5');
}
applyTheme(localStorage.getItem('pawcare-theme') || 'light');
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('pawcare-theme', next);
  applyTheme(next);
});

