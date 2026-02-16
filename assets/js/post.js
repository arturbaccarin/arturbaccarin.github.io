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

function mdToHtml(md) {
    if (!md) return '';

    // preserve fenced code blocks first
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

    // ✅ lists (nested: ul/ol based on indentation)
    function indentWidth(ws) {
        // tab conta como 4 espaços (ajuste se quiser)
        let n = 0;
        for (const ch of ws) n += (ch === '\t') ? 4 : 1;
        return n;
    }

    function closeAllLists(stack, out) {
        while (stack.length) {
            const top = stack[stack.length - 1];
            if (top.liOpen) out.push('</li>');
            out.push(`</${top.type}>`);
            stack.pop();
        }
    }

    function parseNestedLists(text) {
        const lines = text.replace(/\r\n/g, '\n').split('\n');
        const out = [];
        const stack = []; // { indent, type: 'ul'|'ol', liOpen: boolean }

        function closeToIndent(targetIndent) {
            while (stack.length && stack[stack.length - 1].indent > targetIndent) {
                const top = stack[stack.length - 1];
                if (top.liOpen) out.push('</li>');
                out.push(`</${top.type}>`);
                stack.pop();
            }
        }

        function ensureList(indent, type) {
            // se no mesmo nível mas tipo mudou, fecha e abre do novo tipo
            if (stack.length && stack[stack.length - 1].indent === indent && stack[stack.length - 1].type !== type) {
                const top = stack[stack.length - 1];
                if (top.liOpen) out.push('</li>');
                out.push(`</${top.type}>`);
                stack.pop();
            }
            if (!stack.length || indent > stack[stack.length - 1].indent) {
                out.push(`<${type}>`);
                stack.push({ indent, type, liOpen: false });
            } else if (indent < stack[stack.length - 1].indent) {
                closeToIndent(indent);
                if (!stack.length || stack[stack.length - 1].indent !== indent) {
                    out.push(`<${type}>`);
                    stack.push({ indent, type, liOpen: false });
                }
            }
        }

        function openLi(text) {
            const top = stack[stack.length - 1];
            if (top.liOpen) out.push('</li>');
            out.push(`<li>${text}`);
            top.liOpen = true;
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // ignora linhas vazias dentro do parsing (deixa pro parser de parágrafos depois)
            if (!line.trim()) {
                // fecha listas antes de uma linha realmente “em branco” (mantém comportamento previsível)
                closeAllLists(stack, out);
                out.push('');
                continue;
            }

            // Detecta item de lista:
            // - unordered: -, *, +
            // - ordered: 1. 2. 10.
            const m = line.match(/^([ \t]*)([-*+])\s+(.*)$/) || line.match(/^([ \t]*)(\d+\.)\s+(.*)$/);
            if (m) {
                const indent = indentWidth(m[1] || '');
                const marker = m[2];
                const content = (m[3] || '').trim();

                const type = marker.endsWith('.') ? 'ol' : 'ul';
                ensureList(indent, type);
                openLi(content);
                continue;
            }

            // Linha comum: fecha qualquer lista aberta antes de sair
            closeAllLists(stack, out);
            out.push(line);
        }

        closeAllLists(stack, out);
        return out.join('\n');
    }

    md = parseNestedLists(md);

    // paragraphs: split by blank lines, but avoid wrapping existing block tags
    const blocks = md.split(/\n\s*\n/);
    md = blocks.map(b => {
        b = b.trim();
        if (!b) return '';
        if (/^<h\d|^<ul|^<ol|^<pre|^<blockquote|^<hr/.test(b)) return b;
        return '<p>' + b.replace(/\n/g, '<br>') + '</p>';
    }).join('\n');

    // inline: images, links, bold, italic, inline code
    md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
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
    document.getElementById('meta').innerHTML = `\n    Escrito por ${escapeHtml(post.author || 'Autor desconhecido')} em ${formatDatePt(post.date)}\n    <span class="badge">${post.category}</span>\n  `;

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
