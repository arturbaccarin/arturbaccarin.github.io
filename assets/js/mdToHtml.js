// assets/js/mdToHtml.js

export function escapeHtml(s) {
    return (s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Converte Markdown (subset) para HTML.
 * - preserva code fences antes do escape
 * - suporta headings, hr, listas aninhadas, blockquote, parágrafos, inline (img/link/bold/italic/code)
 */
export function mdToHtml(md) {
    if (!md) return '';

    const state = {
        codeBlocks: [],
        quoteBlocks: [],
    };

    md = normalizeNewlines(md);
    md = preserveCodeFences(md, state);
    md = preserveBlockquotes(md, state);

    md = escapeHtml(md);

    md = restoreBlockquotes(md, state); // blockquote vira <blockquote>...</blockquote> já em HTML
    md = applyHeadings(md);
    md = applyHorizontalRules(md);

    md = parseNestedLists(md);

    md = wrapParagraphs(md);

    md = applyInlineFormatting(md);

    md = restoreCodeFences(md, state);

    return md;
}

/* -------------------------- Pipeline steps -------------------------- */

function normalizeNewlines(md) {
    return md.replace(/\r\n/g, '\n');
}

function preserveCodeFences(md, state) {
    // ```lang\n...\n```
    return md.replace(/```[ \t]*([^\n`]*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const idx = state.codeBlocks.push({ lang: (lang || '').trim(), code }) - 1;
        return `\u0000CODEBLOCK_${idx}\u0000`;
    });
}

function restoreCodeFences(md, state) {
    return md.replace(/\u0000CODEBLOCK_(\d+)\u0000/g, (_, idx) => {
        const cb = state.codeBlocks[Number(idx)];
        const langClass = cb.lang ? ` class="language-${cb.lang}"` : '';
        return `<pre><code${langClass}>${escapeHtml(cb.code)}</code></pre>`;
    });
}

function preserveBlockquotes(md, state) {
    // captura blocos com linhas iniciando com ">"
    // importante: isso ocorre ANTES do escapeHtml porque ">" vira "&gt;"
    return md.replace(
        /(^|\n)([ \t]*>(?:[^\n]*)(?:\n[ \t]*>[^\n]*)*)/g,
        (_, lead, quoteBlock) => {
            const idx = state.quoteBlocks.push(quoteBlock) - 1;
            return `${lead}\u0000QUOTE_${idx}\u0000`;
        }
    );
}

function restoreBlockquotes(md, state) {
    return md.replace(/\u0000QUOTE_(\d+)\u0000/g, (_, idx) => {
        const raw = state.quoteBlocks[Number(idx)] || '';
        const lines = raw
            .split('\n')
            .map(l => l.replace(/^[ \t]*>\s?/, '')); // remove "> "

        // aqui o md já está escapado, então só convertemos quebras de linha para <br>
        // e escapamos de novo por segurança (não faz mal)
        const safe = lines.map(escapeHtml).join('<br>');
        return `<blockquote>${safe}</blockquote>`;
    });
}

function applyHeadings(md) {
    md = md.replace(/^######\s*(.*)$/gm, '<h6>$1</h6>');
    md = md.replace(/^#####\s*(.*)$/gm, '<h5>$1</h5>');
    md = md.replace(/^####\s*(.*)$/gm, '<h4>$1</h4>');
    md = md.replace(/^###\s*(.*)$/gm, '<h3>$1</h3>');
    md = md.replace(/^##\s*(.*)$/gm, '<h2>$1</h2>');
    md = md.replace(/^#\s*(.*)$/gm, '<h1>$1</h1>');
    return md;
}

function applyHorizontalRules(md) {
    return md.replace(/^---$/gm, '<hr>');
}

/* -------------------------- Lists (nested) -------------------------- */

function indentWidth(ws) {
    // tab conta como 4 espaços
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
    const lines = text.split('\n');
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
        if (
            stack.length &&
            stack[stack.length - 1].indent === indent &&
            stack[stack.length - 1].type !== type
        ) {
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

    function openLi(htmlText) {
        const top = stack[stack.length - 1];
        if (top.liOpen) out.push('</li>');
        out.push(`<li>${htmlText}`);
        top.liOpen = true;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!line.trim()) {
            closeAllLists(stack, out);
            out.push('');
            continue;
        }

        const m =
            line.match(/^([ \t]*)([-*+])\s+(.*)$/) ||
            line.match(/^([ \t]*)(\d+\.)\s+(.*)$/);

        if (m) {
            const indent = indentWidth(m[1] || '');
            const marker = m[2];
            const content = (m[3] || '').trim();
            const type = marker.endsWith('.') ? 'ol' : 'ul';

            ensureList(indent, type);
            openLi(content);
            continue;
        }

        closeAllLists(stack, out);
        out.push(line);
    }

    closeAllLists(stack, out);
    return out.join('\n');
}

/* -------------------------- Paragraphs -------------------------- */

function wrapParagraphs(md) {
    // separa por linhas em branco
    const blocks = md.split(/\n\s*\n/);

    return blocks
        .map(b => {
            b = b.trim();
            if (!b) return '';

            // não embrulhar blocos que já são tags de bloco
            if (/^<h\d|^<ul|^<ol|^<pre|^<blockquote|^<hr|^<table/.test(b)) return b;

            return '<p>' + b.replace(/\n/g, '<br>') + '</p>';
        })
        .join('\n');
}

/* -------------------------- Inline formatting -------------------------- */

function applyInlineFormatting(md) {
    // imagens
    md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="post-image">');

    // links
    md = md.replace(/\[([^\]]+)\]\((\S+?)\)/g, '<a href="$2">$1</a>');

    // negrito / itálico
    md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // inline code
    md = md.replace(/`([^`]+)`/g, '<code>$1</code>');

    return md;
}
