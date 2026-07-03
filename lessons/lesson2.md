# Lesson 2 — The Pokédex, the old way (HTML/CSS/JS + jQuery)

> **Goal:** Build a complete, genuinely working two-page Pokédex using only HTML, CSS, and
> jQuery. It should look decent and feel real. We are *not* trying to write bad code — we're
> writing the code a competent developer would have written in 2014. The pain we care about
> shows up in Lesson 3, and it only lands if this version is honestly good.
>
> **Format:** live build. ~60–90 minutes. He types along.
>
> **What we build:**
> - **List page** (`index.html`): a searchable grid of Pokémon cards with "Load more".
> - **Detail page** (`detail.html`): picture, types, height/weight, and base-stat bars.

---

## 2.0 The API we'll use (PokéAPI)

Free, no API key, no sign-up: `https://pokeapi.co/api/v2/`. Two endpoints:

**List** — `GET /pokemon?limit=20&offset=0`

```json
{
  "count": 1351,
  "next": "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
  "results": [
    { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" },
    { "name": "ivysaur",   "url": "https://pokeapi.co/api/v2/pokemon/2/" }
  ]
}
```

Notice the list **doesn't** give you images or even the ID directly — but the ID is the
number at the end of `url` (`.../pokemon/1/` → ID `1`). We'll extract it. Sprites are
predictable URLs based on that ID.

**Detail** — `GET /pokemon/1` (by id *or* name)

```json
{
  "id": 1,
  "name": "bulbasaur",
  "height": 7,             // decimetres  -> divide by 10 for metres
  "weight": 69,            // hectograms  -> divide by 10 for kilograms
  "types":  [{ "type": { "name": "grass" } }, { "type": { "name": "poison" } }],
  "stats":  [{ "base_stat": 45, "stat": { "name": "hp" } }, ...],
  "sprites": {
    "other": { "official-artwork": { "front_default": "https://.../1.png" } }
  }
}
```

Teaching aside: open the Network tab and hit
`https://pokeapi.co/api/v2/pokemon/1` in the browser address bar so he *sees* the JSON.
"This is what an API is: you ask a URL, you get data back."

---

## 2.1 Project setup

Create the folder structure:

```
vanilla-pokedex/
├── index.html
├── detail.html
├── css/
│   └── styles.css
└── js/
    ├── list.js
    └── detail.js
```

> **Why not just double-click `index.html`?** Opening via `file://` works here because the
> PokéAPI allows cross-origin requests, but get him in the habit of serving files properly —
> some browsers block `fetch`/AJAX from `file://`. Two easy options:
>
> - **VS Code Live Server** extension → right-click `index.html` → "Open with Live Server".
> - Or in a terminal, from inside `vanilla-pokedex/`: `npx serve` (Node is installed) and
>   open the printed URL.

---

## 2.2 The list page markup — `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pokédex — jQuery edition</title>
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>
  <header class="topbar">
    <h1 class="topbar__title">Pokédex</h1>
    <p class="topbar__subtitle">Built with HTML, CSS &amp; jQuery</p>
  </header>

  <main class="container">
    <div class="toolbar">
      <input
        type="search"
        id="search"
        class="search"
        placeholder="Search the loaded Pokémon…"
        autocomplete="off"
      />
      <span id="count" class="count">0 shown</span>
    </div>

    <!-- jQuery will inject cards in here -->
    <section id="grid" class="grid" aria-live="polite"></section>

    <div id="status" class="status"></div>

    <div class="center">
      <button id="load-more" class="btn">Load more</button>
    </div>
  </main>

  <!-- jQuery from a CDN, then our code -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="js/list.js"></script>
</body>
</html>
```

Point out: the `<section id="grid">` is **empty**. There is no Pokémon in the HTML. The
HTML is a *shell*; JavaScript fills it in at runtime. This is already the norm for
data-driven pages.

---

## 2.3 The detail page markup — `detail.html`

The detail page is reached as `detail.html?id=25` (Pikachu). It reads that `id` from the
URL, fetches, and renders. Its body is mostly an empty shell too.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pokémon detail — jQuery edition</title>
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>
  <header class="topbar">
    <a href="index.html" class="back-link">&larr; Back to list</a>
    <h1 class="topbar__title" id="title">Loading…</h1>
  </header>

  <main class="container">
    <div id="detail" class="detail"></div>
    <div id="status" class="status"></div>
  </main>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="js/detail.js"></script>
</body>
</html>
```

---

## 2.4 The styles — `css/styles.css`

Nothing here is jQuery-specific; it just makes the app look like a real thing. Paste it and
move on — the interesting teaching is in the JS.

```css
:root {
  --bg: #0f172a;
  --surface: #1e293b;
  --surface-2: #334155;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --accent: #ef4444;
  --radius: 14px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
}

.topbar {
  padding: 20px 24px;
  background: linear-gradient(120deg, #b91c1c, #ef4444);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.topbar__title { margin: 0; font-size: 1.6rem; }
.topbar__subtitle { margin: 0; opacity: 0.9; font-size: 0.9rem; }
.back-link { color: white; text-decoration: none; font-size: 0.9rem; opacity: 0.9; }
.back-link:hover { opacity: 1; }

.container { max-width: 960px; margin: 0 auto; padding: 24px; }

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.search {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--surface-2);
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
}
.count { color: var(--muted); font-size: 0.9rem; white-space: nowrap; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--surface-2);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.12s ease;
  text-decoration: none;
  color: inherit;
  display: block;
}
.card:hover { transform: translateY(-4px); border-color: var(--accent); }
.card__img { width: 96px; height: 96px; object-fit: contain; }
.card__id { color: var(--muted); font-size: 0.8rem; }
.card__name { margin: 4px 0 0; text-transform: capitalize; font-size: 1rem; }

.center { text-align: center; margin: 28px 0; }
.btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: var(--radius);
  font-size: 1rem;
  cursor: pointer;
}
.btn:disabled { opacity: 0.5; cursor: default; }

.status { text-align: center; color: var(--muted); padding: 12px; min-height: 24px; }

/* ---- detail page ---- */
.detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  background: var(--surface);
  border: 1px solid var(--surface-2);
  border-radius: var(--radius);
  padding: 28px;
}
@media (max-width: 640px) { .detail { grid-template-columns: 1fr; } }
.detail__img { width: 100%; max-width: 320px; margin: 0 auto; display: block; }
.detail__name { text-transform: capitalize; margin: 0 0 8px; font-size: 2rem; }
.detail__meta { color: var(--muted); margin-bottom: 16px; }

.types { display: flex; gap: 8px; margin-bottom: 20px; }
.type-badge {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  text-transform: capitalize;
  background: var(--surface-2);
}

.stat { margin-bottom: 10px; }
.stat__row { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; }
.stat__label { text-transform: capitalize; color: var(--muted); }
.stat__bar { height: 8px; background: var(--surface-2); border-radius: 999px; overflow: hidden; }
.stat__fill { height: 100%; background: var(--accent); border-radius: 999px; }
```

---

## 2.5 The list logic — `js/list.js`

This is the heart of the lesson. Read it top to bottom with him. I've kept it clean and
idiomatic — this is *good* jQuery, which is exactly the point.

```js
// ------------------------------------------------------------------
// Pokédex list page — jQuery edition
// ------------------------------------------------------------------

// --- "State" lives in plain variables at the top of the file. ---
// This is COPY #1 (the data). The DOM is COPY #2. We keep them in
// sync by hand. Remember this — it's the whole story of Lesson 3.
var PAGE_SIZE = 20;
var offset = 0;                 // how far into the list we've paged
var allLoaded = [];             // every Pokémon we've fetched so far
var currentFilter = '';         // the search box text

var API = 'https://pokeapi.co/api/v2';

// Extract the numeric id from a PokéAPI url like ".../pokemon/25/"
function idFromUrl(url) {
  var parts = url.split('/').filter(Boolean); // drop empty trailing segment
  return parts[parts.length - 1];
}

// Official-artwork sprite URL is predictable from the id.
function spriteUrl(id) {
  return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/' +
         'sprites/pokemon/other/official-artwork/' + id + '.png';
}

// Build the HTML for one card as a string. (Very jQuery-era: HTML in strings.)
function cardHtml(pokemon) {
  return (
    '<a class="card" href="detail.html?id=' + pokemon.id + '">' +
      '<img class="card__img" src="' + spriteUrl(pokemon.id) + '" alt="' + pokemon.name + '" loading="lazy" />' +
      '<div class="card__id">#' + String(pokemon.id).padStart(3, '0') + '</div>' +
      '<h3 class="card__name">' + pokemon.name + '</h3>' +
    '</a>'
  );
}

// Re-draw the WHOLE grid from `allLoaded` + `currentFilter`.
// Notice: this throws away the DOM and rebuilds it every time.
function renderGrid() {
  var filtered = allLoaded.filter(function (p) {
    return p.name.indexOf(currentFilter.toLowerCase()) !== -1;
  });

  var html = filtered.map(cardHtml).join('');
  $('#grid').html(html);

  // ...and now the SECOND thing we must remember to update: the count.
  $('#count').text(filtered.length + ' shown');
}

// Fetch one page of Pokémon and append to `allLoaded`.
function loadPage() {
  $('#load-more').prop('disabled', true);
  $('#status').text('Loading…');

  $.getJSON(API + '/pokemon?limit=' + PAGE_SIZE + '&offset=' + offset)
    .done(function (data) {
      var page = data.results.map(function (r) {
        var id = idFromUrl(r.url);
        return { id: Number(id), name: r.name };
      });

      allLoaded = allLoaded.concat(page);
      offset += PAGE_SIZE;

      renderGrid();                 // remember to re-render
      $('#status').text('');
      $('#load-more').prop('disabled', false);

      // Hide "Load more" once we've reached the end.
      if (!data.next) {
        $('#load-more').hide();
      }
    })
    .fail(function () {
      $('#status').text('Something went wrong. Check your connection and try again.');
      $('#load-more').prop('disabled', false);
    });
}

// --- Wire up events (this is where the "remember to sync" tax shows) ---

$('#load-more').on('click', function () {
  loadPage();
});

$('#search').on('input', function () {
  currentFilter = $(this).val();
  renderGrid();                     // change data -> remember to re-render
});

// Kick things off.
loadPage();
```

Walk through the three "remember to re-sync" spots (`renderGrid()` after loading, after
searching; `$('#count').text(...)` inside render). Say out loud: *"Every one of these is a
promise I made to myself and could break. The language won't stop me."* Don't over-editorialize
yet — Lesson 3 is where we make it hurt.

---

## 2.6 The detail logic — `js/detail.js`

```js
// ------------------------------------------------------------------
// Pokémon detail page — jQuery edition
// ------------------------------------------------------------------

var API = 'https://pokeapi.co/api/v2';

// Read ?id=NN from the current URL.
function getIdFromQuery() {
  var params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function officialArt(pokemon) {
  return pokemon.sprites.other['official-artwork'].front_default;
}

// Base stats top out around 255; scale the bar width to that.
function statBarHtml(stat) {
  var pct = Math.min(100, Math.round((stat.base_stat / 255) * 100));
  return (
    '<div class="stat">' +
      '<div class="stat__row">' +
        '<span class="stat__label">' + stat.stat.name + '</span>' +
        '<span>' + stat.base_stat + '</span>' +
      '</div>' +
      '<div class="stat__bar"><div class="stat__fill" style="width:' + pct + '%"></div></div>' +
    '</div>'
  );
}

function renderDetail(p) {
  document.title = 'Pokédex — ' + p.name;
  $('#title').text('#' + String(p.id).padStart(3, '0'));

  var typesHtml = p.types.map(function (t) {
    return '<span class="type-badge">' + t.type.name + '</span>';
  }).join('');

  var statsHtml = p.stats.map(statBarHtml).join('');

  var html =
    '<div class="detail__left">' +
      '<img class="detail__img" src="' + officialArt(p) + '" alt="' + p.name + '" />' +
    '</div>' +
    '<div class="detail__right">' +
      '<h2 class="detail__name">' + p.name + '</h2>' +
      '<p class="detail__meta">Height: ' + (p.height / 10) + ' m &nbsp;•&nbsp; ' +
        'Weight: ' + (p.weight / 10) + ' kg</p>' +
      '<div class="types">' + typesHtml + '</div>' +
      '<div class="stats">' + statsHtml + '</div>' +
    '</div>';

  $('#detail').html(html);
}

function loadDetail() {
  var id = getIdFromQuery();
  if (!id) {
    $('#status').text('No Pokémon selected.');
    return;
  }

  $('#status').text('Loading…');

  $.getJSON(API + '/pokemon/' + id)
    .done(function (data) {
      renderDetail(data);
      $('#status').text('');
    })
    .fail(function () {
      $('#status').text('Could not load that Pokémon.');
      $('#title').text('Error');
    });
}

loadDetail();
```

---

## 2.7 Run it and click around

1. Serve `vanilla-pokedex/` (Live Server or `npx serve`).
2. On the list page: it loads 20 cards. Click **Load more** → 20 more. Type in the search
   box → the grid filters and the "N shown" count updates.
3. Click any card → the detail page opens with `?id=…` in the URL, shows the artwork, types,
   height/weight, and stat bars.
4. Show him the **Network tab**: each "Load more" fires one request to `/pokemon?...`; each
   detail page fires one request to `/pokemon/ID`. This is the app talking to the API.

It genuinely works, and it's not bad code. Sit with that — the next lesson is where we add
*one more feature* and watch this same clean code start to fight us.

---

## What hurt / what we learned

- **Learned:** How a data-driven page really works — an HTML shell plus JS that fetches
  data and injects DOM. This is universal; React does the same thing underneath.
- **Noticed (foreshadowing):** Our "state" is loose variables (`allLoaded`, `offset`,
  `currentFilter`), and *we* call `renderGrid()` / `$('#count').text()` by hand after every
  change. It's fine here. Keep an eye on it.

**Next lesson:** we add a **Favorites** feature — the kind of thing every real app needs —
and the hand-syncing quietly turns into a mess. → **[Lesson 3](lesson3.md)**
