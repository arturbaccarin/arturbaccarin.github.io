export async function initComponents() {
    const [headerHtml, footerHtml] = await Promise.all([
        fetch('/components/header.html').then(r => r.text()),
        fetch('/components/footer.html').then(r => r.text()),
    ]);

    document.querySelector('header').innerHTML = headerHtml;
    document.querySelector('footer').innerHTML = footerHtml;
    document.getElementById('year').textContent = new Date().getFullYear();
}
