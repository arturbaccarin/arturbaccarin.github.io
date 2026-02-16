/* post loader: suporta carregar Markdown + metadata via /data/posts.json */

import { mdToHtml, escapeHtml } from './mdToHtml.js';

function slugFromPath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (!parts.length) return null;
    const last = parts[parts.length - 1];
    if (last.endsWith('.html')) return last.replace(/\.html$/, '');
    if (!last.includes('.')) return last;
    return null;
}

function getId() {
    return slugFromPath() || new URLSearchParams(window.location.search).get('id');
}

async function loadPosts() {
    const res = await fetch('/data/posts.json');
    if (!res.ok) throw new Error('Não consegui carregar /data/posts.json');
    return await res.json();
}

async function loadText(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Não consegui carregar: ' + path);
    return await res.text();
}

// parse DD-MM-YYYY, DD/MM/YYYY or YYYY-MM-DD (fallback to Date)
function parseDateString(s) {
    if (!s) return null;
    const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
    const dmyHyphen = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (dmyHyphen) return new Date(Number(dmyHyphen[3]), Number(dmyHyphen[2]) - 1, Number(dmyHyphen[1]));
    const dmySlash = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmySlash) return new Date(Number(dmySlash[3]), Number(dmySlash[2]) - 1, Number(dmySlash[1]));
    const d = new Date(s);
    return isNaN(d) ? null : d;
}

function formatDatePt(s) {
    const d = parseDateString(s);
    if (!d) return s || '';
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

async function main() {
    document.getElementById('year').textContent = new Date().getFullYear();

    const id = getId();
    if (!id) throw new Error('Faltou o parâmetro ?id=... na URL ou o arquivo não está em /posts/<slug>.html');

    const posts = await loadPosts();
    const post = posts.find(p => p.id === id);
    if (!post) throw new Error('Post não encontrado: ' + id);

    document.title = post.title;
    document.getElementById('title').textContent = post.title;
    document.getElementById('meta').innerHTML = `
    Escrito por ${escapeHtml(post.author || 'Autor desconhecido')} em ${formatDatePt(post.date)}
    <span class="badge">${post.category}</span>
  `;

    let mdPath = post.md || `/posts/${id}.md`;
    if (!mdPath.startsWith('/')) mdPath = '/' + mdPath.replace(/^\/+/, '');

    const md = await loadText(mdPath);
    const contentEl = document.getElementById('content');
    contentEl.innerHTML = mdToHtml(md);

    // Prism
    if (window.Prism) {
        if (typeof window.Prism.highlightAllUnder === 'function') {
            window.Prism.highlightAllUnder(contentEl);
        } else if (typeof window.Prism.highlightAll === 'function') {
            window.Prism.highlightAll();
        }
    }
}

main().catch(err => {
    console.error(err);
    const content = document.getElementById('content');
    if (content) content.innerHTML = `<div class="card">Erro: ${err.message}</div>`;
    if (window.Prism) Prism.highlightAll();
});
