import { initComponents } from './components.js';

const POSTS_PER_PAGE = 10;

let allPosts = [];
let currentPage = 1;
let searchQuery = '';

async function loadPosts() {
  const res = await fetch("/data/posts.json");
  if (!res.ok) throw new Error("Não consegui carregar data/posts.json");
  return await res.json();
}

function postCard(post) {
  const file = ('/' + (post.file || '').replace(/^\/+/, ''));
  return `
    <div class="card">
      <a href="${file}"><strong>${post.title}</strong></a>
      <div class="meta">
        <span>${formatDateDMY(post.date)}</span>
        <span class="badge">${post.category}</span>
      </div>
      <p style="margin:10px 0 0; color:var(--muted);">${post.excerpt}</p>
    </div>
  `;
}

function getFilteredPosts() {
  if (!searchQuery) return allPosts;
  const q = searchQuery.toLowerCase();
  return allPosts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.excerpt.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
}

function renderPagination(totalPages) {
  let paginationEl = document.getElementById("pagination");
  if (!paginationEl) {
    paginationEl = document.createElement("div");
    paginationEl.id = "pagination";
    paginationEl.className = "pagination";
    document.getElementById("postList").insertAdjacentElement("afterend", paginationEl);
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
      renderPosts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function renderPosts() {
  const listEl = document.getElementById("postList");
  const filtered = getFilteredPosts();
  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));

  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const pagePosts = filtered.slice(start, start + POSTS_PER_PAGE);

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="card">Nenhum artigo encontrado.</div>';
  } else {
    listEl.innerHTML = pagePosts.map(postCard).join("");
  }

  renderPagination(totalPages);
}

async function main() {
  await initComponents();

  allPosts = await loadPosts();
  allPosts.sort((a, b) => (a.date < b.date ? 1 : -1));

  const mainEl = document.querySelector('main');
  mainEl.insertAdjacentHTML('afterbegin', `
    <div class="search-bar">
      <input type="search" id="searchInput" placeholder="Buscar artigos por título, categoria ou descrição…" autocomplete="off" />
    </div>
  `);

  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    currentPage = 1;
    renderPosts();
  });

  renderPosts();
}

main().catch(err => {
  console.error(err);
  const listEl = document.getElementById("postList");
  if (listEl) listEl.innerHTML = `<div class="card">Erro: ${err.message}</div>`;
});

function formatDateDMY(iso) {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[3]}-${m[2]}-${m[1]}`;
}
