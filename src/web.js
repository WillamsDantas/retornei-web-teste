// Retornei web: instala como app (PWA) e funciona sem internet depois de aberto uma vez.
'use strict';
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  // Atualiza sozinho: confere ao abrir e ao voltar para o app (no máximo a cada 15 min; só baixa um arquivo pequeno).
  // Quando há versão nova, recarrega uma vez — mas nunca com uma janela aberta, para não perder o que está sendo digitado.
  const tinhaVersao = !!navigator.serviceWorker.controller;
  let pendente = false;
  let ultima = Date.now();
  const recarregar = () => {
    if (document.querySelector('.overlay')) {
      // janela aberta: espera ela fechar e então recarrega
      if (!pendente) {
        pendente = true;
        const obs = new MutationObserver(() => { if (!document.querySelector('.overlay')) { obs.disconnect(); recarregar(); } });
        obs.observe(document.body, { childList: true, subtree: true });
      }
      return;
    }
    pendente = false;
    location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (tinhaVersao) recarregar(); });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      const conferir = () => {
        if (document.visibilityState !== 'visible') return;
        if (Date.now() - ultima < 15 * 60 * 1000) return;
        ultima = Date.now();
        reg.update().catch(() => {});
      };
      document.addEventListener('visibilitychange', conferir);
      setInterval(conferir, 15 * 60 * 1000);
    }).catch(() => {});
  });
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
