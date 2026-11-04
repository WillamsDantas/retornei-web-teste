// Retornei web: instala como app (PWA) e funciona sem internet depois de aberto uma vez.
'use strict';
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}

// listas e calendário abertos perto da borda: empurra para dentro da tela
(function () {
  const ajustar = () => document.querySelectorAll('.dd-list, .cal').forEach((el) => {
    el.style.translate = '';
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    let dx = 0;
    if (r.left < 12) dx = 12 - r.left;
    else if (r.right > vw - 12) dx = vw - 12 - r.right;
    if (dx) el.style.translate = `${Math.round(dx)}px 0`;
  });
  new MutationObserver(() => requestAnimationFrame(ajustar)).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', ajustar);
})();

// faixas que rolam para o lado (Ajustes, Ajuda): a opção escolhida fica sempre à vista
(function () {
  const mostrar = () => document.querySelectorAll('.snav [aria-current="true"], .aj-nav button.on').forEach((b) => {
    const f = b.parentElement.closest('.snav, .aj-nav');
    if (!f || f.scrollWidth <= f.clientWidth) return;
    const l = b.offsetLeft - f.offsetLeft, r = l + b.offsetWidth;
    if (l < f.scrollLeft) f.scrollLeft = l - 16;
    else if (r > f.scrollLeft + f.clientWidth) f.scrollLeft = r - f.clientWidth + 16;
  });
  new MutationObserver(() => requestAnimationFrame(mostrar)).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'class'] });
})();
