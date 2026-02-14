/* post loader: suporta carregar Markdown + metadata via /data/posts.json */

function slugFromPath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (!parts.length) return null;
    const last = parts[parts.length - 1];
    // accept both /posts/slug and /posts/slug.html
    if (last.endsWith('.html')) return last.replace(/\.html$/, '');
    if (!last.includes('.')) return last;
    return null;
}

function getId() {
    // prioridade: /posts/<slug>.html (path) -> ?id= fallback
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

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function mdToHtml(md) {
    if (!md) return '';

    // preserve fenced code blocks first (robust: accepts optional lang, trailing spaces and CRLF)
    const codeBlocks = [];
    md = md.replace(/```[ \t]*([^\n`]*)\r?\n([\s\S]*?)```/g, function (_, lang, code) {
        const idx = codeBlocks.push({ lang: (lang || '').trim(), code }) - 1;
        return `\u0000CODEBLOCK_${idx}\u0000`;
    });

    // escape the rest
    md = escapeHtml(md);

    // headings
    md = md.replace(/^######\s*(.*)$/gm, '<h6>$1</h6>');
    md = md.replace(/^#####\s*(.*)$/gm, '<h5>$1</h5>');
    md = md.replace(/^####\s*(.*)$/gm, '<h4>$1</h4>');
    md = md.replace(/^###\s*(.*)$/gm, '<h3>$1</h3>');
    md = md.replace(/^##\s*(.*)$/gm, '<h2>$1</h2>');
    md = md.replace(/^#\s*(.*)$/gm, '<h1>$1</h1>');

    // horizontal rule
    md = md.replace(/^---$/gm, '<hr>');

    // lists (simple unordered)
    md = md.replace(/(^|\n)([ \t]*[-\*+]\s+[^\n]+(\n[ \t]*[-\*+]\s+[^\n]+)*)/g, function (_, lead, listText) {
        const items = listText.trim().split(/\n/).map(l => l.replace(/^[ \t]*[-\*+]\s+/, '').trim());
        return '\n<ul>' + items.map(i => '<li>' + i + '</li>').join('') + '</ul>';
    });

    // paragraphs: split by blank lines, but avoid wrapping existing block tags
    const blocks = md.split(/\n\s*\n/);
    md = blocks.map(b => {
        b = b.trim();
        if (!b) return '';
        if (/^<h\d|^<ul|^<pre|^<blockquote|^<hr/.test(b)) return b;
        return '<p>' + b.replace(/\n/g, '<br>') + '</p>';
    }).join('\n');

    // inline: images, links, bold, italic, inline code
    md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    // only treat as link when the parentheses part has no spaces (avoids matching code like: [T any](s []T, f func(T) T))
    md = md.replace(/\[([^\]]+)\]\((\S+?)\)/g, '<a href="$2">$1</a>');
    md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    md = md.replace(/`([^`]+)`/g, '<code>$1</code>');

    // restore code blocks
    md = md.replace(/\u0000CODEBLOCK_(\d+)\u0000/g, function (_, idx) {
        const cb = codeBlocks[Number(idx)];
        const langClass = cb.lang ? ' class="language-' + cb.lang + '"' : '';
        return `<pre><code${langClass}>${escapeHtml(cb.code)}</code></pre>`;
    });

    return md;
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
    document.getElementById('meta').innerHTML = `\n    Escrito por ${escapeHtml(post.author || 'Autor desconhecido')} em <span>${post.date}</span>\n    <span class="badge">${post.category}</span>\n  `;

    // determine markdown source: explicit `md` in posts.json -> derived /posts/<id>.md -> fallback replace .html
    let mdPath = post.md || `/posts/${id}.md`;
    if (!mdPath.startsWith('/')) mdPath = '/' + mdPath.replace(/^\/+/, '');

    const md = await loadText(mdPath);
    const contentEl = document.getElementById('content');
    contentEl.innerHTML = mdToHtml(md);

    // trigger Prism highlighting if available (scoped to the post content)
    if (window.Prism) {
        if (typeof window.Prism.highlightAllUnder === 'function') {
            window.Prism.highlightAllUnder(contentEl);
        } else if (typeof window.Prism.highlightAll === 'function') {
            window.Prism.highlightAll();
        }
    }
    if (window.Prism) Prism.highlightAll();
}

main().catch(err => {
    console.error(err);
    const content = document.getElementById('content');
    if (content) content.innerHTML = `<div class="card">Erro: ${err.message}</div>`;
    if (window.Prism) Prism.highlightAll();
});
