// Standalone Pet Care Guide page: shares PawCare's saved theme preference.
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
  localStorage.setItem('pawcare-theme', next); applyTheme(next);
});

// Location helper for food-store and veterinary searches in the care guide.
const careLocation = document.querySelector('#careLocation');
(function prefillLocation(){
  let v = new URLSearchParams(location.search).get('loc');
  if (!v) { try { const l = JSON.parse(localStorage.getItem('pawcare-location') || 'null'); if (l) v = `${l.city}, ${l.state}`; } catch(e){} }
  if (v) careLocation.value = v;
})();
document.querySelector('#useCareLocation').addEventListener('click', () => {
  const status = document.querySelector('#careLocationStatus');
  if (!navigator.geolocation) { status.textContent = 'Location is not available in this browser. Please enter your city or ZIP.'; return; }
  status.textContent = 'Requesting your location permission…';
  navigator.geolocation.getCurrentPosition(pos => {
    careLocation.value = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
    status.textContent = 'Location added. Nearby search links will use this location.';
  }, () => { status.textContent = 'Could not access your location. Please enter your city or ZIP instead.'; }, {enableHighAccuracy:false,timeout:10000});
});

const feedingBasics = {
  Dog: {
    food:'A complete and balanced commercial dog food labelled for the dog’s life stage. Keep fresh water available. If the dog’s previous food is known, use it initially and change gradually over about 7 days.',
    avoid:'Avoid chocolate, grapes and raisins, onions, garlic, xylitol-sweetened products, alcohol, cooked bones and heavily seasoned or fatty scraps.',
    extra:'Puppies need puppy-formula food and more frequent meals; adults usually do well with measured meals. Large-breed puppies need an appropriately formulated large-breed puppy diet.'
  },
  Cat: {
    food:'A complete and balanced cat food labelled for the cat’s life stage. Cats need animal-based nutrition; do not use dog food as their regular diet. Keep fresh water available.',
    avoid:'Avoid onion and garlic, chocolate, alcohol, caffeine, grapes and raisins, raw dough, and bones. Never give cow’s milk as a treat; many cats cannot digest it well.',
    extra:'Kittens need kitten food and frequent small meals. Adult cats need adult cat food. Wet food can help increase water intake.'
  },
  Rabbit: {
    food:'For a healthy adult rabbit, provide unlimited good-quality grass hay (such as timothy hay), clean water, and a measured amount of plain rabbit pellets with suitable leafy greens introduced gradually.',
    avoid:'Do not feed meat, dairy, bread, sugary treats, muesli-style mixes or sudden large amounts of unfamiliar greens. Alfalfa is generally for growing rabbits, not routine adult feeding.',
    extra:'Young rabbits have different calcium and energy needs. A rabbit that stops eating or producing droppings needs urgent rabbit-savvy veterinary attention.'
  },
  'Guinea pig': {
    food:'Provide unlimited grass hay, fresh water, a measured guinea-pig pellet containing vitamin C, and daily suitable vegetables. Guinea pigs cannot make their own vitamin C.',
    avoid:'Do not use rabbit pellets as a substitute, and avoid onions, garlic, potato, chocolate, dairy and sugary treats. Vitamin C breaks down over time, so use fresh food and ask a vet about supplementation.',
    extra:'Young, pregnant or unwell guinea pigs may need an adjusted plan. Not eating is urgent in guinea pigs.'
  },
  Hamster: {
    food:'Offer a good-quality complete hamster food as the main diet, with clean water. Small amounts of safe fresh vegetables can be introduced gradually; remove uneaten fresh food before it spoils.',
    avoid:'Avoid chocolate, onion, garlic, alcohol, caffeine, sticky sweets and sudden large portions of fruit or vegetables. Do not assume every human food is safe.',
    extra:'Food type and portion depend on the hamster species and age. Dwarf hamsters may have different needs from Syrian hamsters.'
  },
  'Bird (parrot, parakeet)': {
    food:'Use a species-appropriate complete formulated bird pellet as the dietary base, with suitable fresh vegetables and clean water. Seed-only diets are often nutritionally unbalanced; make diet changes carefully.',
    avoid:'Never offer avocado, chocolate, caffeine, alcohol, or salty foods. Keep birds away from smoke and fumes from overheated non-stick cookware.',
    extra:'Parrots and parakeets vary greatly by species. Confirm the exact species with an avian veterinarian before choosing portions or changing the diet.'
  },
  Ferret: {
    food:'Ferrets are obligate carnivores and need a complete, high-protein, animal-based ferret diet with fresh water available at all times. Feed little and often.',
    avoid:'Avoid fruit, sugary foods, vegetables as a dietary base, dairy, chocolate and dog or cat food as a long-term substitute unless a veterinarian directs you.',
    extra:'Kits and adults have different needs. A ferret that is weak, vomiting, has diarrhoea or is not eating should be assessed promptly.'
  },
  Horse:{food:'Provide constant access to clean water and suitable forage such as grass or quality hay. Concentrates and supplements depend on workload, body condition, age and health; do not make sudden feed changes.',avoid:'Never feed mouldy hay, lawn clippings, unknown plants or large amounts of grain. Keep feed changes gradual and secure feed stores.',extra:'Horses need species-appropriate forage, dental and hoof care, turnout and routine veterinary and farrier attention.'},
  Pony:{food:'Base the diet on suitable forage and clean water. Ponies can be prone to weight gain, so grazing and concentrates should be planned with an equine professional.',avoid:'Avoid sudden diet changes, mouldy forage, lawn clippings and unrestricted access to rich pasture if the pony is at risk of laminitis.',extra:'Ask an equine veterinarian or nutritionist to assess body condition and grazing needs.'},
  Donkey:{food:'Donkeys generally need a high-fibre, lower-energy forage-based diet and constant clean water. Their needs differ from horses; use donkey-specific guidance.',avoid:'Avoid rich pasture, excessive concentrates, mouldy forage and sudden feed changes.',extra:'Donkeys need regular dental, hoof and parasite care from professionals familiar with donkeys.'},
  Goat:{food:'Goats need suitable browse, forage, clean water and a balanced goat-specific ration when required. Diet varies by age, pregnancy, lactation and purpose.',avoid:'Do not feed mouldy feed, unknown garden waste or sudden large amounts of grain. Keep feed and mineral supplements species-specific.',extra:'Goats are social browsers and need secure shelter, space and routine herd-health care.'},
  Sheep:{food:'Sheep need appropriate pasture or hay, clean water and a sheep-specific mineral plan. Nutritional needs vary by age, pregnancy and production stage.',avoid:'Do not use cattle or goat mineral mixes unless a veterinarian confirms they are safe; excess copper can be toxic to sheep.',extra:'Seek advice from a livestock veterinarian about parasite control, hoof care and flock nutrition.'},
  Cow:{food:'Cattle require a balanced ruminant diet based on suitable forage, clean water and stage-appropriate feed. Consult a livestock nutritionist or veterinarian for exact rations.',avoid:'Avoid mouldy feed, sudden grain increases, poisonous plants and inappropriate mineral supplements.',extra:'Calves, pregnant cows and lactating cows have different nutritional needs.'},
  Pig:{food:'Use a complete, age-appropriate pig feed and provide constant clean water. Pet pigs and farm pigs have different body-condition and feeding needs.',avoid:'Avoid mouldy food, salty scraps, chocolate, alcohol and unbalanced leftovers. Do not rely on kitchen waste as a complete diet.',extra:'Piglets, adults and breeding animals need different rations; monitor body condition and rooting enrichment.'},
  'Chicken or duck':{food:'Offer a complete feed formulated for the bird type and life stage, with clean water always available. Chick starter, grower and layer feeds are not interchangeable.',avoid:'Avoid mouldy feed, salty scraps, chocolate, avocado and foods that may be toxic to poultry. Do not rely on scratch grains alone.',extra:'Chickens and ducks have different needs; ducks need appropriate water access and niacin considerations. Ask a poultry veterinarian about specifics.'},
  'Turtle or tortoise':{food:'Diet depends strongly on the exact species. Identify the species first; aquatic turtles and land tortoises have very different diets. Do not guess or use a generic reptile diet.',avoid:'Avoid feeding human snacks, dairy or random wild plants. Do not give supplements without species-specific veterinary advice.',extra:'Temperature, UVB lighting, habitat and hydration are essential to appetite and digestion. Consult an exotic-animal veterinarian.'},
  'Snake or lizard':{food:'Feeding depends on the exact species, age and natural diet. Identify the species and seek an exotic-animal veterinarian or reputable specialist before feeding; prey type and size matter.',avoid:'Never offer wild-caught prey or food that is too large. Do not force-feed or handle a newly rescued reptile unnecessarily.',extra:'Correct temperatures, humidity, lighting and hiding places are critical; poor husbandry can cause feeding refusal.'},
  Fish:{food:'Food varies by species (herbivore, omnivore or carnivore), size and water conditions. Identify the fish and use an appropriate complete aquatic diet in small amounts.',avoid:'Avoid overfeeding, bread and random human foods. Remove uneaten food and never release aquarium animals into waterways.',extra:'Water quality, temperature, filtration and species compatibility are as important as food.'},
  'Wild animal / wildlife':{food:'Do not feed an unidentified wild animal. Incorrect food can cause serious harm and may make it dependent on people. Keep a safe distance and contact a licensed wildlife rehabilitator or local wildlife authority.',avoid:'Do not give milk, bread, meat or water by force. Avoid direct handling; wild animals may bite, scratch or carry disease.',extra:'Wild animals should be assessed and cared for by licensed wildlife professionals, with the aim of appropriate rehabilitation and release where possible.'},
  Gerbil:{food:'Offer a complete gerbil-specific food as the main diet, with fresh water always available. Small portions of suitable vegetables can be introduced gradually.',avoid:'Avoid sugary treats, chocolate, onion, garlic, caffeine, alcohol and sudden diet changes. Do not use food mixes that encourage selective feeding as the only diet.',extra:'Provide deep, safe digging substrate, a secure enclosure, chew-safe enrichment and social housing appropriate to the gerbil’s history.'},
  Rat:{food:'Use a nutritionally complete rat block or pellet as the dietary base, with measured portions of suitable vegetables and occasional safe treats.',avoid:'Avoid mouldy food, chocolate, alcohol, caffeine, sticky sweets and heavily salted or sugary foods.',extra:'Rats need daily social interaction, enrichment, safe exercise and a well-ventilated enclosure; keep compatible rats together where possible.'},
  Mouse:{food:'Use a complete mouse-specific pellet or block as the main diet, with clean water and small measured amounts of suitable fresh foods.',avoid:'Avoid chocolate, caffeine, alcohol, onion, garlic, mouldy food and sudden large portions of unfamiliar foods.',extra:'Provide secure housing, nesting material, enrichment and careful handling; housing arrangements depend on sex and compatibility.'},
  Chinchilla:{food:'Provide unlimited good-quality grass hay, a measured chinchilla-specific pellet and clean water. Introduce any suitable treats sparingly.',avoid:'Avoid sugary fruit, nuts, seeds, dairy, high-moisture foods and sudden diet changes. Never bathe in water; chinchillas need appropriate dust baths.',extra:'They need a cool, dry, well-ventilated environment, safe jumping space and exotic-vet care. Heat stress can be life-threatening.'},
  Hedgehog:{food:'Hedgehog diets vary by species and whether the animal is a domestic pet or wild. Confirm the species and use a veterinarian-approved complete hedgehog diet; do not improvise a wild hedgehog diet.',avoid:'Avoid milk, bread, raw meat, toxic insects, sugary foods and unapproved supplements. Do not feed an unidentified wild hedgehog.',extra:'Provide species-appropriate temperature, hiding places and exercise. Wild hedgehogs should be referred to a licensed wildlife rehabilitator.'},
  'Canary or finch':{food:'Use a complete species-appropriate formulated diet for the exact bird, with suitable fresh greens and clean water. Seed-only diets can be unbalanced; transition carefully.',avoid:'Never offer avocado, chocolate, caffeine, alcohol, salty foods or fumes from overheated non-stick cookware.',extra:'Provide suitable flight space, perches, enrichment and access to an avian veterinarian. Diet and housing differ between canaries and finch species.'},
  'Pigeon or dove':{food:'Use a balanced pigeon/dove pellet or species-appropriate seed-and-pellet ration, with clean water. The exact mix depends on species, age and activity.',avoid:'Avoid bread as a staple, salty snacks, chocolate, caffeine, alcohol and mouldy seed.',extra:'Provide safe flight or exercise space, clean loft/cage conditions and access to an avian veterinarian. Do not keep wild birds without checking local rules.'},
  'Goose or turkey':{food:'Use a complete feed formulated for the bird species and life stage. Waterfowl and turkeys have different nutrient requirements; confirm feed with a poultry veterinarian or extension specialist.',avoid:'Avoid mouldy feed, salty scraps, chocolate, avocado and relying on scratch grains or kitchen leftovers as a complete ration.',extra:'Provide suitable outdoor space, shelter, clean water and flock-health management. Duck/goose water access and turkey feed requirements are species-specific.'},
  'Alpaca or llama':{food:'Provide suitable grass hay or pasture, clean water and a camelid-specific mineral plan. Exact rations depend on body condition, age, pregnancy and local forage.',avoid:'Avoid mouldy forage, sudden feed changes, excessive grain and mineral supplements intended for other livestock unless a veterinarian approves.',extra:'Camelids need herd companionship, appropriate shelter, routine toenail and dental checks, parasite management and a veterinarian familiar with camelids.'},
  'Other livestock':{food:'Do not use a generic farm-animal ration. Identify the species, age and purpose, then use a complete species- and life-stage-appropriate feed with clean water.',avoid:'Avoid mouldy feed, unknown plants, sudden ration changes and mineral mixes intended for a different species.',extra:'Ask a livestock veterinarian or qualified nutritionist to assess housing, feeding, handling, vaccination and parasite-control needs.'},
  'Frog or toad':{food:'Diet depends on the exact amphibian species and life stage; many eat live invertebrate prey, but prey size, supplementation and feeding frequency vary. Identify the species and consult an amphibian-experienced veterinarian before feeding.',avoid:'Do not feed bread, milk, human foods, wild-caught insects or prey exposed to pesticides. Never force-feed.',extra:'Correct temperature, humidity, clean dechlorinated water and species-specific enclosure conditions are essential. Avoid handling delicate skin.'},
  'Salamander or newt':{food:'Food depends on species and life stage; many eat suitable small invertebrates. Identify the species and ask an amphibian specialist about prey, portion size and supplements.',avoid:'Avoid human foods, pesticide-exposed insects, oversized prey and handling after contact with soaps or lotions.',extra:'Aquatic, semi-aquatic and terrestrial species need very different habitats. Maintain clean, species-appropriate water and temperature.'},
  'Freshwater fish':{food:'Identify the fish species and whether it is herbivorous, omnivorous or carnivorous. Use a suitable complete freshwater food in small portions and adjust to the fish’s feeding zone.',avoid:'Avoid bread, overfeeding, untreated tap water and releasing aquarium animals into natural waterways.',extra:'Water quality, temperature, filtration, oxygenation and compatible tank mates are core parts of fish care.'},
  'Marine fish':{food:'Marine fish diets vary widely. Identify the exact species and use an appropriate marine formulated food; some species require specialist frozen or algae-based diets.',avoid:'Avoid freshwater-only assumptions, bread, overfeeding and unquarantined live foods from unsafe sources.',extra:'Stable salinity, temperature, filtration, water chemistry and quarantine are essential. Seek advice from an experienced marine aquarist or aquatic veterinarian.'},
  'Shrimp or crayfish':{food:'Identify the species and use an appropriate aquatic invertebrate food. Many graze on biofilm and algae but may need a balanced supplemental diet; do not overfeed.',avoid:'Avoid copper-containing treatments unless confirmed safe, excess food, sudden water changes and releasing captive animals outdoors.',extra:'Water parameters, hiding places, safe moulting conditions and compatible tank mates are essential.'},
  Crab:{food:'Crab diets differ by species and habitat. Identify whether it is freshwater, marine or terrestrial and use a species-specific diet with suitable plant and animal components.',avoid:'Do not feed salty or seasoned human leftovers, mouldy food or unverified wild foods. Never assume all crabs can live in freshwater.',extra:'Correct salinity, humidity, land/water access, temperature and secure escape-proof housing depend on the species.'},
  Snail:{food:'Food depends on whether the snail is aquatic or terrestrial and on its exact species. Use species-appropriate vegetables, algae or formulated food, and confirm calcium needs with a specialist.',avoid:'Avoid salted, seasoned or pesticide-treated foods and do not collect or release non-native snails.',extra:'Calcium, moisture, substrate and water quality are important; some species are invasive or legally restricted.'},
  'Insect or spider':{food:'Identify the exact species before feeding. Insects and spiders may require live prey, plant material or specialist diets; prey size and pesticide exposure matter.',avoid:'Do not feed random wild insects, pesticide-exposed prey or human food. Avoid handling potentially venomous or medically significant species.',extra:'Temperature, humidity, ventilation, substrate and enclosure security are species-specific. Seek an exotic-invertebrate specialist.'},
  'Other / not sure':{food:'Do not guess at food until the animal is identified. Provide a quiet, safe space and clean water only if it can drink safely; contact a veterinarian, species specialist or rescue for identification and feeding instructions.',avoid:'Avoid cow’s milk, human snacks, supplements and force-feeding. Different species have very different nutritional needs.',extra:'A clear photo and location can help a qualified professional identify the species. Arrange a health check promptly.'}
};
function careAgeText(age, unit){
  if (!age) return 'Age is unknown';
  return `${age} ${unit}${Number(age) === 1 ? '' : ''} old`;
}
function getHabitatAdvice(animal){
  if (animal === 'Wild animal / wildlife') return 'Do not attempt to house, tame or transport wildlife unless instructed by a licensed rehabilitator or wildlife authority. Keep people and pets away and minimise noise and handling.';
  if (['Dog','Cat','Ferret'].includes(animal)) return 'Provide a secure, clean resting area, fresh water, safe enrichment and daily interaction. Keep the animal separated from resident pets until a health check and parasite assessment.';
  if (['Rabbit','Guinea pig','Hamster','Gerbil','Rat','Mouse','Chinchilla','Hedgehog'].includes(animal)) return 'Use a secure, well-ventilated enclosure with species-appropriate floor space, bedding, hiding places and enrichment. Avoid wire flooring where it can injure feet; confirm social needs for the exact species.';
  if (['Bird (parrot, parakeet)','Canary or finch','Pigeon or dove','Chicken or duck','Goose or turkey'].includes(animal)) return 'Provide a secure enclosure with appropriate space, perches or ground area, clean water, ventilation, safe enrichment and protection from predators. Bird species differ greatly in social, flight and temperature needs.';
  if (['Horse','Pony','Donkey','Goat','Sheep','Cow','Pig','Alpaca or llama','Other livestock'].includes(animal)) return 'Provide secure species-appropriate shelter, dry resting space, clean water, suitable fencing, enough room and compatible social company. Ask a livestock or equine professional about stocking, pasture and handling.';
  if (['Turtle or tortoise','Snake or lizard','Frog or toad','Salamander or newt'].includes(animal)) return 'Set up the exact species’ temperature gradient, humidity, UVB or lighting, substrate, hides and water needs before feeding. Incorrect habitat conditions can cause serious illness.';
  if (['Freshwater fish','Marine fish','Shrimp or crayfish','Crab','Snail'].includes(animal)) return 'Use a cycled, species-appropriate aquatic system with stable temperature, filtration, oxygenation and water chemistry. Test water regularly and never add an animal to an unprepared tank.';
  if (animal === 'Insect or spider') return 'Use a secure enclosure with the correct ventilation, substrate, temperature, humidity and hiding places for the identified species. Avoid handling until its safety and needs are known.';
  return 'Confirm the exact species and provide its natural habitat needs, safe shelter, clean water, appropriate space and enrichment. Ask a qualified species specialist before mixing animals or changing its environment.';
}

function buildCarePlan(data){
  const animal = data.get('animal');
  const guide = feedingBasics[animal] || feedingBasics['Other / not sure'];
  const age = data.get('age');
  const unit = data.get('ageUnit');
  const ageNum = Number(age);
  const veryYoung = age !== '' && ((unit === 'weeks' && ageNum < 8) || (unit === 'months' && ageNum < 2));
  const unknownAge = !age;
  const sensitivity = data.get('sensitivity');
  const knownFood = data.get('currentFood').trim();
  let foodAdvice = guide.food;
  if (veryYoung) foodAdvice = `This animal may be too young for an adult feeding routine. Young animals have very different needs across species, and some require parental care or specialist formula while others must not be given milk. Contact a veterinarian or species-experienced rescue today to confirm the exact species, age, safe food, amount and feeding frequency. Do not force-feed or give cow’s milk.`;
  else if (unknownAge) foodAdvice += ' Because the age is unknown, start with small, calm feeding opportunities and arrange a veterinary check to estimate age and confirm portions.';
  if (knownFood && !/unknown|not sure|nothing/i.test(knownFood)) foodAdvice += ` You reported they currently eat: “${knownFood}”. If it is a suitable food for this species and they are well, avoid an abrupt switch; transition gradually and monitor their appetite and stool.`;
  else foodAdvice += ' Their previous diet is unknown, so do not make several food changes at once. Offer the correct species-specific food and monitor whether they eat and drink.';
  let sensitivityAdvice = 'No specific sensitivity was reported. Watch for changes relevant to the species, such as appetite, droppings, activity, breathing, skin or feather condition, and water balance in aquatic animals.';
  if (sensitivity === 'Sensitive stomach') sensitivityAdvice = 'Choose one complete, species-appropriate diet and avoid table scraps or frequent treats. Introduce any change slowly. Repeated vomiting, diarrhoea, blood in stool or poor appetite needs veterinary advice.';
  if (sensitivity === 'Food allergy or itchy skin') sensitivityAdvice = 'Do not guess at an allergy or start a restrictive diet yourself. A veterinarian can assess itchy skin and guide a properly controlled elimination diet; avoid adding multiple new treats meanwhile.';
  if (sensitivity === 'Kidney, liver or urinary issues') sensitivityAdvice = 'Please speak to a veterinarian before selecting food. Kidney, liver and urinary diets are condition-specific, and an unsuitable diet or supplement may cause harm.';
  if (sensitivity === 'Overweight') sensitivityAdvice = 'Do not sharply restrict food, especially while the animal’s age and health are unknown. Measure appropriate portions and ask a veterinarian for a safe target weight and feeding amount.';
  if (sensitivity === 'Not sure / unknown history') sensitivityAdvice = 'Treat medical and food history as unknown. Keep the diet simple and species-appropriate, avoid supplements or special therapeutic foods without veterinary advice, and arrange a check-up.';
  const place = data.get('location').trim();
  const locationQuery = place || 'near me';
  const wildlife = animal === 'Wild animal / wildlife';
  const foodSearch = wildlife ? `licensed wildlife rehabilitator ${locationQuery}` : ['Horse','Pony','Donkey','Goat','Sheep','Cow','Pig','Alpaca or llama','Other livestock','Chicken or duck','Goose or turkey'].includes(animal) ? `${animal} feed supplier ${locationQuery}` : ['Freshwater fish','Marine fish','Shrimp or crayfish','Crab','Snail'].includes(animal) ? `aquarium aquatic animal supplies ${locationQuery}` : `${animal} food specialist store ${locationQuery}`;
  const foodUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodSearch)}`;
  const vetUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`veterinarian animal rescue ${locationQuery}`)}`;
  const grooming = animal === 'Wild animal / wildlife' ? 'Do not attempt to groom, bathe or handle a wild animal. Contact a licensed wildlife rehabilitator.' : ['Horse','Pony','Donkey','Goat','Sheep','Cow','Pig','Alpaca or llama','Other livestock','Chicken or duck','Goose or turkey'].includes(animal) ? 'Use a handler experienced with this species. Grooming, hoof, feather, skin and parasite care must be species-appropriate; ask a livestock or equine professional if the animal is distressed or injured.' : ['Turtle or tortoise','Snake or lizard','Frog or toad','Salamander or newt','Freshwater fish','Marine fish','Shrimp or crayfish','Crab','Snail','Insect or spider'].includes(animal) ? 'Do not bathe, brush or apply grooming products. Focus on correct habitat, water quality, skin or shell observation and species-specific husbandry; consult an exotic-animal veterinarian or invertebrate specialist.' : ['Bird (parrot, parakeet)','Canary or finch','Pigeon or dove'].includes(animal) ? 'Provide suitable bathing opportunities only if appropriate for the species. Do not clip wings or trim nails, beaks or feathers without species-specific guidance from an avian veterinarian.' : ['Rabbit','Guinea pig','Hamster','Gerbil','Rat','Mouse','Chinchilla','Hedgehog'].includes(animal) ? 'Use gentle, species-appropriate handling. Avoid routine baths; ask an experienced small-animal groomer or veterinarian about coat mats, nails and species-specific care.' : 'Brush gently as the coat allows, check ears, eyes, paws and nails, and introduce handling in short positive sessions. If the animal is matted or distressed, ask a qualified groomer or veterinarian rather than cutting close to the skin.';
  const urgent = veryYoung ? '<p class="care-alert"><strong>Important:</strong> Very young animals can deteriorate quickly. Contact a veterinarian or rescue promptly for feeding instructions.</p>' : '<p class="care-alert"><strong>Stray-animal first steps:</strong> Keep the animal separate from resident pets until checked, provide a quiet warm place and clean water, and arrange a veterinary examination for parasites, injuries, vaccination needs and a microchip scan (where available).</p>';
  return `<span class="kicker">YOUR STARTER PLAN</span><h3>${animal} care guide</h3><p><strong>Profile:</strong> ${data.get('breed') || 'Breed unknown'} · ${data.get('sex')} · ${careAgeText(age,unit)} · ${data.get('size')}</p>${urgent}<h4>Feeding advice</h4><p>${foodAdvice}</p><h4>Foods and items to avoid</h4><p>${guide.avoid}</p><h4>Age and daily routine</h4><p>${guide.extra}</p><h4>Housing, habitat and enrichment</h4><p>${getHabitatAdvice(animal)}</p><h4>Food sensitivities and health</h4><p>${sensitivityAdvice}</p><h4>At-home grooming</h4><p>${grooming}</p><h4>Find food and veterinary help</h4><p>Use these map searches to check nearby options. Check ahead to confirm stock, opening hours and that the clinic treats this species.</p><div class="care-result-actions"><a href="${foodUrl}" target="_blank" rel="noopener">${wildlife ? 'Find licensed wildlife help' : 'Find food and supplies'} ↗</a><a href="${vetUrl}" target="_blank" rel="noopener">Find vets / rescues ↗</a></div><p><small>This is general educational guidance, not a diagnosis or a substitute for a veterinarian. If the animal is injured, very weak, cold, struggling to breathe, repeatedly vomiting, unable to stand, or refusing food, seek urgent veterinary help. Do not force food or water.</small></p>`;
}
document.querySelector('#careForm').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  if (!data.get('animal')) return;
  const results = document.querySelector('#careResults');
  results.innerHTML = buildCarePlan(data);
  results.hidden = false;
  results.scrollIntoView({behavior:'smooth',block:'start'});
});
