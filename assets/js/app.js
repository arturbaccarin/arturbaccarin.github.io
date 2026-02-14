async function loadPosts() {
  const res = await fetch("data/posts.json");
  if (!res.ok) throw new Error("Não consegui carregar data/posts.json");
  return await res.json();
}

function postCard(post) {
  const file = ('/' + (post.file || '').replace(/^\/+/, ''));
  return `
    <div class="card">
      <a href="${file}"><strong>${post.title}</strong></a>
      <div class="meta">
        <span>${post.date}</span>
        <span class="badge">${post.category}</span>
      </div>
      <p style="margin:10px 0 0; color:var(--muted);">${post.excerpt}</p>
    </div>
  `;
}

async function main() {
  document.getElementById("year").textContent = new Date().getFullYear();

  const listEl = document.getElementById("postList");
  const posts = await loadPosts();

  // mais recentes primeiro
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  listEl.innerHTML = posts.map(postCard).join("");
}

main().catch(err => {
  console.error(err);
  const listEl = document.getElementById("postList");
  if (listEl) listEl.innerHTML = `<div class="card">Erro: ${err.message}</div>`;
});
