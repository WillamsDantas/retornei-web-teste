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

// botão voltar do celular: fecha a janela aberta (Nova venda, ficha, confirmação…) em vez de sair do app
(function () {
  let abertas = 0;
  const contar = () => document.querySelectorAll('.overlay').length;
  new MutationObserver(() => {
    const n = contar();
    if (n > abertas) { for (let i = abertas; i < n; i++) history.pushState({ janela: 1 }, ''); }
    else if (n < abertas && !window.__fechandoPeloVoltar) {
      // fechou pelo X, Cancelar ou Salvar: tira do histórico a entrada que ficou sobrando
      for (let i = n; i < abertas; i++) { window.__ignorarVoltar = true; history.back(); }
    }
    window.__fechandoPeloVoltar = false;
    abertas = n;
  }).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('popstate', () => {
    if (!contar()) return;
    window.__fechandoPeloVoltar = true;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    // janela que não fecha com Esc: tenta o botão de fechar dela
    setTimeout(() => {
      if (contar() >= abertas && abertas) {
        const b = [...document.querySelectorAll('.overlay')].pop().querySelector('[data-act$="fechar"], [data-act="fechar"], [aria-label="Fechar"], [data-cf="0"]');
        if (b) b.click(); else history.pushState({ janela: 1 }, '');
      }
    }, 60);
  });
})();
