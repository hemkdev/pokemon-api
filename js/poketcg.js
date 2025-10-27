// Simple PokéTCG fetch + render example (vanilla JS)
// Place this file at js/poketcg.js and open public/poketcg.html via a local server

const TCG_API_BASE = 'https://api.pokemontcg.io/v2';
// If you have an API key for production/testing, set it here briefly for local testing.
// Do NOT commit secret keys to a public repository.
const TCG_API_KEY = '';

function tcgHeaders() {
  const h = { 'Accept': 'application/json' };
  if (TCG_API_KEY) h['X-Api-Key'] = TCG_API_KEY;
  return h;
}

async function searchCards(query) {
  const q = encodeURIComponent(`q=name:"${query}"`);
  const url = `${TCG_API_BASE}/cards?${q}&pageSize=18`;
  const res = await fetch(url, { headers: tcgHeaders() });
  if (!res.ok) throw new Error(`TCG API error ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

function renderCard(card) {
  const img = card.images?.small || card.images?.large || '';
  return `
    <div class="tcg-card" data-id="${card.id}">
      <img src="${img}" alt="${card.name}" loading="lazy" />
      <div class="tcg-card-name">${card.name}</div>
      <div class="tcg-card-set">${card.set?.name || ''}</div>
    </div>`;
}

async function handleSearch() {
  const q = document.getElementById('tcgQuery').value.trim();
  const msg = document.getElementById('tcgMessage');
  const results = document.getElementById('tcgResults');
  results.innerHTML = '';
  msg.textContent = '';
  if (!q) { msg.textContent = 'Type a card name to search.'; return; }

  msg.textContent = 'Searching...';
  try {
    const cards = await searchCards(q);
    if (!cards.length) {
      msg.textContent = 'No cards found.';
      return;
    }
    msg.textContent = '';
    results.innerHTML = cards.map(renderCard).join('');
  } catch (err) {
    console.error(err);
    msg.textContent = 'Error fetching cards. See console for details.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('tcgSearchBtn');
  const input = document.getElementById('tcgQuery');
  btn.addEventListener('click', handleSearch);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });
});
