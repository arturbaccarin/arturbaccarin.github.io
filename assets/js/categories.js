import { initComponents } from './components.js';

const CATS_PER_PAGE = 5;

let categoryMap = {};
let allCats = [];
let currentPage = 1;
let searchQuery = '';

async function loadPosts() {
  const res = await fetch('/data/posts.json');
  if (!res.ok) throw new Error('Não consegui carregar data/posts.json');
  return await res.json();
}

function postItem(post) {
  const href = '/' + (post.file || '').replace(/^\/+/, '');
  return `
    <li>
      <a href="${href}">${post.title}</a>
      <div class="meta">${formatDateDMY(post.date)}</div>
    </li>
  `;
}

function getFilteredMap() {
  if (!searchQuery) return { map: categoryMap, cats: allCats };

  const q = searchQuery.toLowerCase();
  const map = {};

  for (const cat of allCats) {
    const filtered = categoryMap[cat].filter(p =>
      p.title.toLowerCase().includes(q) ||
      cat.toLowerCase().includes(q)
    );
    if (filtered.length > 0) map[cat] = filtered;
  }

  return { map, cats: Object.keys(map).sort() };
}

function renderPagination(totalPages) {
  let paginationEl = document.getElementById("pagination");
  if (!paginationEl) {
    paginationEl = document.createElement("div");
    paginationEl.id = "pagination";
    paginationEl.className = "pagination";
    document.getElementById("categoriesList").insertAdjacentElement("afterend", paginationEl);
  }

  if (totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }

  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">&#8592;</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="page-ellipsis">…</span>`;
    }
  }

  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">&#8594;</button>`;

  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page, 10);
      renderCategories();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function renderCategories() {
  const listEl = document.getElementById('categoriesList');
  const { map, cats } = getFilteredMap();

  if (cats.length === 0) {
    listEl.innerHTML = '<div class="card">Nenhuma categoria encontrada.</div>';
    renderPagination(1);
    return;
  }

  const totalPages = Math.max(1, Math.ceil(cats.length / CATS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * CATS_PER_PAGE;
  const pageCats = cats.slice(start, start + CATS_PER_PAGE);

  listEl.innerHTML = pageCats.map(cat => `
    <div class="card">
      <h2 style="margin:0 0 8px">${cat}</h2>
      <ul style="margin:0; padding:0; list-style:none">${map[cat].map(postItem).join('')}</ul>
    </div>
  `).join('');

  renderPagination(totalPages);
}

async function main() {
  await initComponents();

  const posts = await loadPosts();

  categoryMap = posts.reduce((acc, p) => {
    (acc[p.category] || (acc[p.category] = [])).push(p);
    return acc;
  }, {});
  allCats = Object.keys(categoryMap).sort();

  const mainEl = document.querySelector('main');
  mainEl.insertAdjacentHTML('afterbegin', `
    <div class="search-bar">
      <input type="search" id="searchInput" placeholder="Buscar por título ou categoria…" autocomplete="off" />
    </div>
  `);

  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    currentPage = 1;
    renderCategories();
  });

  renderCategories();
}

main().catch(err => {
  console.error(err);
  const listEl = document.getElementById('categoriesList');
  if (listEl) listEl.innerHTML = `<div class="card">Erro: ${err.message}</div>`;
});

function formatDateDMY(iso) {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[3]}-${m[2]}-${m[1]}`;
}
