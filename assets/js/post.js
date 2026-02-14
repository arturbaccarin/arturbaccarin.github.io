function getId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadPosts() {
    const res = await fetch("data/posts.json");
    if (!res.ok) throw new Error("Não consegui carregar data/posts.json");
    return await res.json();
}

async function loadPostHtml(file) {
    const res = await fetch(file);
    if (!res.ok) throw new Error("Não consegui carregar o arquivo do post: " + file);
    return await res.text();
}

async function main() {
    document.getElementById("year").textContent = new Date().getFullYear();

    const id = getId();
    if (!id) throw new Error("Faltou o parâmetro ?id=... na URL");

    const posts = await loadPosts();
    const post = posts.find(p => p.id === id);
    if (!post) throw new Error("Post não encontrado: " + id);

    document.title = post.title;
    document.getElementById("title").textContent = post.title;
    document.getElementById("meta").innerHTML = `
    <span>${post.date}</span>
    <span class="badge">${post.category}</span>
  `;

    const html = await loadPostHtml(post.file);
    document.getElementById("content").innerHTML = html;
}

main().catch(err => {
    console.error(err);
    document.getElementById("content").innerHTML = `<div class="card">Erro: ${err.message}</div>`;
});
