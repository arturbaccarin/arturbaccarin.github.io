async function loadPosts() {
  const res = await fetch('data/posts.json');
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

async function main() {
  document.getElementById('year').textContent = new Date().getFullYear();
  const listEl = document.getElementById('categoriesList');
  const posts = await loadPosts();

  // agrupa por categoria
  const map = posts.reduce((acc, p) => {
    (acc[p.category] || (acc[p.category] = [])).push(p);
    return acc;
  }, {});

  const cats = Object.keys(map).sort();
  if (cats.length === 0) {
    listEl.innerHTML = '<div class="card">Nenhuma categoria encontrada.</div>';
    return;
  }

  listEl.innerHTML = cats.map(cat => `
    <div class="card">
      <h2 style="margin:0 0 8px">${cat}</h2>
      <ul style="margin:0; padding:0; list-style:none">${map[cat].map(postItem).join('')}</ul>
    </div>
  `).join('');
}

main().catch(err => {
  console.error(err);
  const listEl = document.getElementById('categoriesList');
  if (listEl) listEl.innerHTML = `<div class="card">Erro: ${err.message}</div>`;
});

function formatDateDMY(iso) {
  // espera "YYYY-MM-DD"
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso; // fallback, caso venha diferente
  return `${m[3]}-${m[2]}-${m[1]}`; // DD-MM-YYYY
}