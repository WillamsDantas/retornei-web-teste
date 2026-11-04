/* Retornei: interface. Script clássico; dados vêm de window.api (preload). */
(function () {
  'use strict';
  const R = window.PrazzoRules;
  const api = window.api;
  if (api && api.electron) document.body.classList.add('com-barra');
  const morph = window.morphdom;

  // ============================================================ utilidades

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) =>
    String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(`prazzo.${k}`); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(`prazzo.${k}`, JSON.stringify(v)); } catch (_) { /* nada */ } },
  };

  // Ícones de traço fino, no estilo Feather.
  const ICON = {
    hoje: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>',
    pedidos: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    clientes: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    equipe: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    ajustes: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    chev: '<polyline points="6 9 12 15 18 9"/>',
    recolher: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><polyline points="16 15 13 12 16 9"/>',
    abrir: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><polyline points="13 9 16 12 13 15"/>',
    sacola: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    sino: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    pular: '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>',
    desfazer: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
    lixo: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    editar: '<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    alerta: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    baixar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    subir: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    pasta: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    sol: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    loja: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    relatorios: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    arquivo: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    seta: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    sobe: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    desce: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
    alertaC: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    atualizar: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    cadeado: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    escudo: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
    sair: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="4" y2="12"/>',
    pdf: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="12" y1="12" x2="12" y2="18"/><polyline points="9.5 15.5 12 18 14.5 15.5"/>',
    imprimir: '<polyline points="6 9 6 3 18 3 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/>',
    computador: '<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/>',
    luz: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    chevUp: '<polyline points="18 15 12 9 6 15"/>',
    troca: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    voltar: '<polyline points="15 18 9 12 15 6"/>',
    ajuda: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    play: '<polygon points="6 4 19 12 6 20 6 4"/>',
    feito: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  };
  /** ⓘ ao lado de um título: a explicação aparece ao passar o mouse (ou com o foco do teclado). */
  const info = (t) => `<span class="ib" tabindex="0" role="img" aria-label="${esc(t)}">${ic('info', 'ic-14')}<span class="tipb" role="tooltip">${esc(t)}</span></span>`;
  const ic = (n, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ''}</svg>`;
  const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';
  const WA = (lg) => `<svg class="wa-ic${lg ? ' lg' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${WA_PATH}"/></svg>`;
  // Símbolo do Retornei: balão de conversa com o check de "já retornei".
  const BOLHA = 'M30 12 H70 A20 20 0 0 1 90 32 V54 A20 20 0 0 1 70 74 H44 L25 89 L27 73 A20 20 0 0 1 10 54 V32 A20 20 0 0 1 30 12 Z';
  const CHECK = (c) => `<polyline points="33 43 45 55 67 33" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
  const LOGO_O = (_id, s, ck) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" role="img" aria-label="Retornei"><path d="${BOLHA}" fill="currentColor"/>${CHECK(ck || 'var(--surface)')}</svg>`;
  const LOGO_FULL = (_id, h, ck) => `<span class="logo-mark" style="display:inline-flex;align-items:center;gap:${Math.round(h * 0.22)}px" role="img" aria-label="Retornei"><svg width="${Math.round(h * 1.08)}" height="${Math.round(h * 1.08)}" viewBox="0 0 100 100" aria-hidden="true"><path d="${BOLHA}" fill="currentColor"/>${CHECK(ck || 'var(--surface)')}</svg><span style="font-weight:800;font-size:${h}px;line-height:1;letter-spacing:-0.045em;padding-bottom:${Math.round(h * 0.08)}px">retornei</span></span>`;

  // Atualiza o DOM só onde mudou (sem piscar, sem perder foco nem rolagem).
  function patch(el, html) {
    morph(el, `<div id="${el.id}">${html}</div>`, {
      childrenOnly: true,
      onBeforeElUpdated(from, to) {
        if (from.isEqualNode(to)) return false;
        if (from === document.activeElement && (from.tagName === 'INPUT' || from.tagName === 'TEXTAREA')) to.value = from.value;
        return true;
      },
    });
  }

  // ============================================================ estado

  const S = {
    data: null,
    today: R.todayISO(),
    view: 'hoje',
    menuMin: ls.get('menuMin', false),
    periodo: ls.get('periodo', 'hoje'),
    filtroVend: ls.get('filtroVend', ''),
    filtroTipo: ls.get('filtroTipo', ''),
    pulados: [],
    sel: null,
    msgEdit: {},
    encTab: 'abertas',
    busca: { hoje: '', encomendas: '', clientes: '' },
    buscaTipo: '',
    clienteId: null,
    cliEdit: null,
    drawerFx: false,
    ajustesSec: 'loja',
    equipeAba: 'vend',
    ajudaTopico: 'primeiros',
    ajudaBusca: '',
    ajudaManual: false,
    faqAberta: 0,
    renomear: null,
    info: null,
    setup: { etapa: 'entrar', loja: '', zap: '', nome: '', erro: {} },
    relPeriodo: ls.get('relPeriodo', 'mes'),
    relTodas: false,
    selCli: new Set(),
    upd: { estado: 'parado' },
    updDepois: false,
    origem: '',
    relVend: '',
  };
  // os dados passam por aqui: toda mudança vai também para a nuvem (quando o computador está ligado à loja)
  let dadosAtuais = null;
  Object.defineProperty(S, 'data', {
    enumerable: true,
    get: () => dadosAtuais,
    set: (v) => { dadosAtuais = v; if (window.Nuvem) window.Nuvem.mudou(v); },
  });
  S.adm = null; // { email, nome, ate } com o modo administrador ligado
  S.conectar = { email: '', senha: '', pc: '', erro: '', enviando: false };
  let AM = null; // modal "Entrar como administrador"

  // WEB: celular (< 700px) e tablet (< 1280px)
  const celular = () => window.innerWidth < 700;
  const estreito = () => window.innerWidth < 1280;
  const naNuvem = () => !!(window.Nuvem && window.Nuvem.ativa);
  const ehAdmin = () => !naNuvem() || !!(S.adm && S.adm.ate > Date.now());
  /** Ações que só um administrador faz (no modo só-local tudo fica liberado). */
  const ADM_ACTS = new Set(['prod-importar', 'cli-excluir', 'sel-excluir', 'venda-editar', 'venda-excluir', 'ev-excluir', 'importar-planilha', 'importar', 'exportar', 'abrir-pasta', 'ren', 'vend-ativo', 'vend-excluir', 'prazo-rm', 'msg-padrao', 'rel-pdf', 'rel-imprimir', 'pc-desconectar', 'adm-rm', 'adm-add']);
  const ADM_FORMS = new Set(['loja', 'mensagens', 'prazo', 'renomear', 'vendedor', 'admins']);

  let M = null;
  let RS = null; // modal do resumo do dia
  let I = null; // modal de importar planilha
  let EV = null; // modal de editar venda
  const alvoData = () => EV || M; // quem usa o calendário agora
  const renderAlvo = () => (EV ? renderEV() : renderModal());

  // ============================================================ dados

  let cacheRef = null;
  let cache = null;
  function maps() {
    if (cacheRef === S.data) return cache;
    const d = S.data;
    cache = {
      vend: new Map(d.vendedores.map((v) => [v.id, v])),
      cli: new Map(d.clientes.map((c) => [c.id, c])),
      venda: new Map(d.vendas.map((v) => [v.id, v])),
    };
    cacheRef = S.data;
    return cache;
  }
  const vendNome = (id) => (maps().vend.get(id) || {}).nome || '—';
  const vendAtivos = () => S.data.vendedores.filter((v) => v.ativo);
  const nomeCli = (c) => (c.tipo === 'atacado' ? c.fantasia || c.empresa || c.nome : c.nome);
  const contatoCli = (c) => (c.tipo === 'atacado' && c.nome && ![c.empresa, c.fantasia].some((x) => x && R.keyOf(x) === R.keyOf(c.nome)) ? c.nome : '');
  const subCli = (c) => (c.tipo === 'atacado' ? [c.fantasia ? c.empresa : '', contatoCli(c)].filter(Boolean).join(' · ') : '');
  const busca = (k) => R.keyOf(S.busca[k] || '');
  const casa = (q, txt, cel) => !q || R.keyOf(txt).includes(q) || (q.replace(/\D/g, '').length >= 3 && String(cel || '').includes(q.replace(/\D/g, '')));

  function varsMsg(c, vendedorId, extra) {
    return Object.assign(
      {
        primeiro_nome: c.tipo === 'atacado' && !contatoCli(c) ? nomeCli(c) : R.firstName(c.nome),
        nome: c.nome,
        vendedor: R.firstName(vendNome(vendedorId)),
        loja: S.data.loja.nome,
        empresa: c.fantasia || c.empresa || 'sua empresa',
      },
      extra || {}
    );
  }

  /** Cliente que ainda existe (excluído some de todas as contas e telas). */
  const cliOk = (id) => { const c = maps().cli.get(id); return !!c && !c.excluido; };

  function itens() {
    const { cli, venda } = maps();
    const out = [];
    for (const l of S.data.lembretes) {
      const c = cli.get(l.clienteId);
      const v = venda.get(l.vendaId);
      if (!c || c.excluido || !v || v.excluida) continue;
      out.push({ l, c, v, st: R.lembreteStatus(l, S.today) });
    }
    return out;
  }
  const passa = (x) => (!S.filtroVend || x.v.vendedorId === S.filtroVend) && (!S.filtroTipo || x.c.tipo === S.filtroTipo);
  const feitoHoje = (x) => x.st === 'contatado' && x.l.contatadoEm && R.localDay(x.l.contatadoEm) === S.today;
  const porData = (a, b) => (a.l.data < b.l.data ? -1 : a.l.data > b.l.data ? 1 : nomeCli(a.c).localeCompare(nomeCli(b.c)));

  function mensagemDe(x) {
    if (S.msgEdit[x.l.id] !== undefined) return S.msgEdit[x.l.id];
    const cfg = S.data.config;
    const tpl = x.c.tipo === 'atacado' ? cfg.mensagemAtacado : cfg.mensagemVarejo;
    return R.renderTemplate(tpl, varsMsg(x.c, x.v.vendedorId, { data_compra: R.formatDate(x.v.data, 'curta') }));
  }

  /** Venda de retorno ligada a este contato (botão Comprou ou venda registrada depois do contato). */
  const retornoDo = (lemId) => S.data.vendas.find((v) => v.retornoDe === lemId && !v.excluida);

  /** Depois do contato: Comprou (abre a Nova venda), Não comprou ou Não respondeu. */
  function comoFoi(sel) {
    const r = sel.l.resultado || '';
    let nota = '';
    if (r === 'sem_resposta') {
      const n = sel.l.retentativaId && S.data.lembretes.find((y) => y.id === sel.l.retentativaId && y.status === 'pendente');
      nota = n ? `Volta para a fila em ${esc(R.formatDate(n.data, 'curta').slice(0, 5))}.` : 'Fica para o próximo retorno.';
    }
    if (r === 'nao_comprou') {
      const prox = S.data.lembretes.filter((y) => y.clienteId === sel.c.id && y.status === 'pendente' && y.data > S.today).sort((a, b) => (a.data < b.data ? -1 : 1))[0];
      nota = prox ? `Próximo retorno em ${esc(R.formatDate(prox.data, 'curta').slice(0, 5))}.` : 'Sem outro retorno agendado.';
    }
    const op = (v, txt, icone) => `<button type="button" class="opt-b${r === v ? ' on' : ''}" data-act="res" data-id="${sel.l.id}" data-v="${v}" aria-pressed="${r === v}">${ic(icone, 'ic-16')}<span>${txt}</span>${r === v ? ic('check', 'ic-16') : ''}</button>`;
    return `<div class="res-box" role="group" aria-label="Como foi?"><span class="res-t">Como foi?</span><div class="opts">
        <button class="opt-b" type="button" data-act="comprou" data-id="${sel.l.id}">${ic('sacola', 'ic-16')}<span>Comprou</span><span class="opt-dica">Nova venda</span>${ic('chev', 'ic-16 opt-seta')}</button>
        ${op('nao_comprou', 'Não comprou', 'x')}${op('sem_resposta', 'Não respondeu', 'clock')}</div>
        ${nota ? `<p class="res-nota">${nota}</p>` : ''}</div>`;
  }
  /** Balão do Retornei: cheio com check quando a fila zerou, só o contorno quando não há ninguém. */
  function marcaVazia(cheio) {
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${cheio ? `<path d="${BOLHA}" fill="currentColor"/><polyline points="33 43 45 55 67 33" fill="none" stroke="var(--surface)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` : `<path d="${BOLHA}" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>`}</svg>`;
  }
  function stInfo(x, semRetorno) {
    if (x.st === 'atrasado') return { cor: 'red', txt: 'Atrasado', sub: plural(-R.diffDays(S.today, x.l.data), 'dia', 'dias') };
    if (x.st === 'hoje') return { cor: 'blue', txt: 'Para hoje', sub: '' };
    if (x.st === 'agendado') return { cor: '', txt: `Em ${R.formatDate(x.l.data, 'curta')}`, sub: R.relativeDay(x.l.data, S.today) };
    if (x.st === 'contatado' && !semRetorno && retornoDo(x.l.id)) return { cor: 'green', txt: 'Comprou', sub: R.formatMoney(retornoDo(x.l.id).valor) };
    if (x.st === 'contatado' && x.l.resultado === 'nao_comprou') return { cor: '', txt: 'Não comprou', sub: '' };
    if (x.st === 'contatado' && x.l.resultado === 'sem_resposta') return { cor: '', txt: 'Sem resposta', sub: '' };
    if (x.st === 'contatado') return { cor: '', txt: 'Feito', sub: x.l.contatadoEm ? new Date(x.l.contatadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '' };
    return { cor: '', txt: 'Cancelado', sub: '' };
  }
  const dotSt = (x, curto, semRetorno) => {
    const s = stInfo(x, semRetorno);
    if (curto && x.st === 'agendado') s.sub = '';
    return `<span class="dot-st"><span class="dot ${s.cor}"></span>${esc(s.txt)}${s.sub ? `<span class="s">· ${esc(s.sub)}</span>` : ''}</span>`;
  };

  // ============================================================ ações

  /** Botão Salvar: apagado sem mudanças, acende ao editar, mostra "Salvo" depois de salvar. */
  const SUJO = {};
  const SALVO = {};
  function botaoSalvar(k, txt) {
    if (SALVO[k]) return `<button class="btn primary salvar ok" type="submit" data-salvar="${k}" disabled>${ic('check', 'ic-16')}Salvo</button>`;
    return `<button class="btn primary salvar" type="submit" data-salvar="${k}" ${SUJO[k] ? '' : 'disabled'}>${txt}</button>`;
  }
  async function salvarForm(k, fn) {
    const r = await fn();
    if (r && r.ok) {
      SUJO[k] = false;
      SALVO[k] = true;
      render();
      setTimeout(() => { SALVO[k] = false; render(); }, 1600);
    }
    return r;
  }

  async function act(nome, args, opts) {
    const o = opts || {};
    const r = await api.acao(nome, args);
    if (!r.ok) {
      if (!o.silent) toast(r.error, { erro: true });
      return r;
    }
    S.data = r.data && r.data.estado ? r.data.estado : r.data;
    render();
    if (o.toast) toast(o.toast, o.undo ? { acao: 'Desfazer', fn: o.undo } : {});
    return r;
  }

  async function abrirWhats(celular, texto) {
    const r = await api.whatsapp(R.whatsappUrl(celular, texto));
    if (!r.ok) toast(r.error, { erro: true });
    return r.ok;
  }

  const acharItem = (id) => itens().find((x) => x.l.id === id);

  function proximoDe(id) {
    const lista = listaHoje().lista;
    const i = lista.findIndex((y) => y.l.id === id);
    const prox = lista[i + 1] || lista[i - 1];
    return prox ? prox.l.id : null;
  }

  // WEB: painel do contato por cima (celular e tablet em pé); o "voltar" do celular fecha o painel
  function abrirDet() {
    if (window.innerWidth >= 1024 || S.det) return;
    S.det = true;
    try { history.pushState({ det: 1 }, ''); } catch (_) { /* nada */ }
  }
  function fecharDet(semRender) {
    if (!S.det) return;
    S.det = false;
    if (history.state && history.state.det) { try { window.__ignorarVoltar = true; history.back(); } catch (_) { /* nada */ } }
    if (!semRender) render();
  }
  window.addEventListener('popstate', () => {
    if (window.__ignorarVoltar) { window.__ignorarVoltar = false; return; }
    if (document.querySelector('.overlay')) return;
    if (S.det) { S.det = false; render(); }
  });
  let tamanhoAntes = window.innerWidth;
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    if ([700, 1024, 1280].some((b) => (tamanhoAntes < b) !== (w < b))) { if (w >= 1024) S.det = false; render(); }
    tamanhoAntes = w;
  });

  async function marcarFeito(id, viaWhats) {
    const x = acharItem(id);
    if (!x) return;
    if (viaWhats && !(await abrirWhats(x.c.celular, mensagemDe(x)))) return;
    // depois do contato o cliente continua aberto no painel, com o botão Comprou
    S.sel = id;
    abrirDet(); // WEB
    delete S.msgEdit[id];
    S.pulados = S.pulados.filter((p) => p !== id);
    await act('marcarContatado', { id });
  }

  // ============================================================ toast e confirmação

  function toast(msg, o) {
    const opt = o || {};
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = `toast${opt.erro ? ' erro' : ''}${opt.acao ? ' com-acao' : ''}`;
    el.innerHTML = `<span class="t-ic">${opt.erro ? '<svg viewBox="0 0 24 24"><path d="M12 7v6M12 17h.01"/></svg>' : '<svg viewBox="0 0 24 24"><path class="ck" d="M5 12.5l4.5 4.5L19 7.5"/></svg>'}</span><span class="msg wrap">${esc(msg)}</span>${opt.acao ? `<button class="tb" type="button">${esc(opt.acao)}</button>` : ''}`;
    if (opt.acao) {
      el.querySelector('button').addEventListener('click', () => {
        el.remove();
        opt.fn();
      });
    }
    box.innerHTML = '';
    box.appendChild(el);
    setTimeout(() => el.remove(), opt.ms || (opt.acao ? 7000 : 4000));
  }

  function confirmar({ titulo, texto, ok, perigo, extra }) {
    return new Promise((resolve) => {
      const root = $('#confirm-root');
      root.innerHTML = `<div class="overlay fx" style="align-items:center"><section class="dialog sm" role="alertdialog" aria-modal="true" aria-labelledby="cf-t">
        <div class="body" style="padding-top: var(--sp-8)"><h2 id="cf-t" style="font-size: var(--fs-20);line-height: 28px;font-weight:500">${esc(titulo)}</h2>${texto ? `<p class="l2 wrap small">${esc(texto)}</p>` : ''}${extra || ''}</div>
        <footer><div class="right"><button class="btn" type="button" data-cf="0">Cancelar</button><button class="btn ${perigo ? 'danger-fill' : 'primary'}" type="button" data-cf="1">${esc(ok || 'Confirmar')}</button></div></footer></section></div>`;
      const done = (v) => {
        root.innerHTML = '';
        document.removeEventListener('keydown', onKey, true);
        resolve(v);
      };
      const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } };
      document.addEventListener('keydown', onKey, true);
      root.querySelectorAll('[data-cf]').forEach((b) => b.addEventListener('click', () => done(b.dataset.cf === '1')));
      root.querySelector('[data-cf="1"]').focus();
    });
  }

  // ============================================================ render geral

  function render() {
    const root = $('#root');
    if (!S.data) return;
    requestAnimationFrame(() => { const sd = document.querySelector('.side'); document.documentElement.style.setProperty('--sw', sd ? `${sd.offsetWidth}px` : '0px'); });
    if (naNuvem() && (!S.data.nuvem || window.Nuvem.st.status === 'bloqueado')) {
      patch(root, viewConectar());
      return;
    }
    // só espera a nuvem quando este computador ainda não tem nada da loja
    if (naNuvem() && !window.Nuvem.st.pronto && !S.data.loja.nome && !S.data.vendedores.length) {
      patch(root, viewCarregando());
      return;
    }
    // na nuvem, loja que já tem dados abre direto (o nome se acerta em Ajustes › Loja)
    if (naNuvem() ? !S.data.vendedores.length : (!S.data.loja.nome || !S.data.vendedores.length)) {
      if (naNuvem()) S.setup.etapa = 'loja';
      patch(root, viewSetup());
      return;
    }
    const views = { mais: viewMais, hoje: viewHoje, encomendas: viewEncomendas, clientes: viewClientes, relatorios: viewRelatorios, equipe: viewEquipe, ajustes: viewAjustes, ajuda: viewAjuda };
    const fab = celular() && ['hoje', 'encomendas', 'clientes'].includes(S.view) && !(S.view === 'hoje' && S.det); // WEB
    patch(root, `<div class="app${celular() ? ' cel' : ''}">${sidebar()}<main class="main${topbar() ? '' : ' sem-topo'}" id="main">${topbar()}${views[S.view]()}</main>${celular() ? navBaixo() : ''}${fab ? (S.view === 'encomendas' ? `<button class="fab" type="button" data-act="novo">${ic('sino')}Avisar cliente</button>` : `<button class="fab" type="button" data-act="novo">${ic('plus')}Nova venda</button>`) : ''}</div>`);
    renderDrawer();
  }
  let TOUR_ADIADO = false;

  // WEB: barra de baixo do celular
  function navBaixo() {
    const its = itens();
    const fila = its.filter((x) => x.st === 'atrasado' || x.st === 'hoje').length;
    const atras = its.some((x) => x.st === 'atrasado');
    const enc = S.data.encomendas.filter((e) => e.status === 'chegou' && cliOk(e.clienteId)).length;
    const mais = ['mais', 'relatorios', 'equipe', 'ajustes', 'ajuda'].includes(S.view);
    const it = (v, label, icone, n, red, on) => `<button type="button" class="bn-item" data-act="nav" data-v="${v}" ${on ? 'aria-current="page"' : ''}><span class="bn-pill">${icone}</span>${label}${n ? `<span class="bn-n${red ? ' red' : ''}">${n > 99 ? '99+' : n}</span>` : ''}</button>`;
    const tres = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/></svg>';
    return `<nav class="bnav" aria-label="Principal">${it('hoje', 'Hoje', ic('hoje'), fila, atras, S.view === 'hoje')}${it('encomendas', 'Pedidos', ic('pedidos'), enc, false, S.view === 'encomendas')}${it('clientes', 'Clientes', ic('clientes'), 0, false, S.view === 'clientes')}${it('mais', 'Mais', tres, 0, false, mais)}</nav>`;
  }

  // WEB: tela "Mais" do celular
  function viewMais() {
    const it = (v, label, icone) => `<button type="button" class="mais-it" data-act="nav" data-v="${v}">${ic(icone)}<span>${label}</span>${ic('chev', 'ic-16 mais-seta')}</button>`;
    return `<div class="page"><div class="page-head"><div class="t"><h1>Mais</h1></div></div>
      <div class="mais-loja"><span class="logo-full">${LOGO_FULL('lg-mais', 26)}</span><div class="loja"><span class="store-name ell">${esc(S.data.loja.nome)}</span><span class="xs muted ell">Versão de teste · dados só neste aparelho</span></div></div>
      <section class="card mais-lista">${it('relatorios', 'Relatórios', 'relatorios')}${it('equipe', 'Equipe', 'equipe')}${it('ajustes', 'Ajustes', 'ajustes')}${it('ajuda', 'Ajuda', 'ajuda')}</section>
      <section class="card mais-lista"><button type="button" class="mais-it" data-act="recomecar">${ic('atualizar')}<span>Recomeçar teste</span></button></section></div>`;
  }

  function sidebar() {
    const its = itens();
    const atras = its.filter((x) => x.st === 'atrasado').length;
    const fila = its.filter((x) => x.st === 'atrasado' || x.st === 'hoje').length;
    const enc = S.data.encomendas.filter((e) => e.status === 'chegou' && cliOk(e.clienteId)).length;
    const item = (v, label, icon, n, red) =>
      `<button type="button" class="nav-item" data-act="nav" data-v="${v}" ${S.view === v ? 'aria-current="page"' : ''} title="${label}">${ic(icon)}<span class="lbl">${label}</span>${n ? `<span class="count${red ? ' red' : ''}">${n > 99 ? '99+' : n}</span><span class="pip${red ? ' red' : ''}"></span>` : ''}</button>`;
    const min = S.menuMin || estreito(); // WEB
    return `<aside class="side${min ? ' min' : ''}">
      <div class="store">${min ? `<span class="mark" title="${esc(S.data.loja.nome)}">${LOGO_O('lg-side', 22)}</span>` : `<span class="logo-full">${LOGO_FULL('lg-side', 26)}</span><div class="loja"><span class="store-name ell">${esc(S.data.loja.nome)}</span><span class="xs muted ell" style="font-size: var(--fs-12);letter-spacing:-0.2px" title="retornei.vivanature@gmail.com">retornei.vivanature@gmail.com</span></div>`}</div>
      ${seloAdmin(min)}
      <nav aria-label="Principal">${item('hoje', 'Hoje', 'hoje', fila, atras > 0)}${item('encomendas', 'Pedidos', 'pedidos', enc)}${item('clientes', 'Clientes', 'clientes')}${item('relatorios', 'Relatórios', 'relatorios')}${item('equipe', 'Equipe', 'equipe')}${item('ajustes', 'Ajustes', 'ajustes')}${item('ajuda', 'Ajuda', 'ajuda')}</nav>
      <div class="spacer"></div>
      ${cartaoUpd(min)}
      ${botaoAdmin(min)}
      ${linhaNuvem(min)}
      <button type="button" class="nav-item" data-act="menu" title="${min ? 'Abrir menu' : 'Recolher menu'}" aria-label="${min ? 'Abrir menu' : 'Recolher menu'}">${ic(min ? 'abrir' : 'recolher')}<span class="lbl">Recolher menu</span></button>
    </aside>`;
  }

  function seloAdmin(min) {
    if (!naNuvem() || !ehAdmin()) return '';
    const nome = (S.adm.mestra ? 'Suporte' : nomeAdmin(S.adm.email) || S.adm.nome || '').split(' ')[0];
    return nome ? '' : '';
  }

  function botaoAdmin(min) {
    if (!naNuvem()) return '';
    if (ehAdmin()) {
      const nome = (S.adm.mestra ? 'Suporte' : nomeAdmin(S.adm.email) || S.adm.nome || '').split(' ')[0];
      if (min) return `<span class="div-min"></span><button type="button" class="adm-pe" data-act="adm-sair" data-dica="Administrador · ${esc(nome)} — clique para sair" aria-label="Sair do modo administrador">${ic('escudo', 'ic-22')}</button>`;
      return `<div class="adm-sel">${ic('escudo', 'ic-22')}<span class="t"><b>Administrador</b><span class="ell">${esc(nome)}</span></span><button type="button" data-act="adm-sair" title="Sair do modo administrador" aria-label="Sair do modo administrador">${ic('sair', 'ic-16')}</button></div>`;
    }
    if (min) return `<span class="div-min"></span><button type="button" class="nav-item" data-act="adm-entrar" data-dica="Entrar como administrador" aria-label="Entrar como administrador">${ic('cadeado')}</button>`;
    return `<button type="button" class="adm-btn" data-act="adm-entrar">${ic('cadeado', 'ic-16')}Administrador</button>`;
  }

  function linhaNuvem(min) {
    if (!naNuvem() || !S.data.nuvem) return min ? '' : '<span class="beta">Dados salvos neste aparelho</span>';
    const s = window.Nuvem.st;
    const pc = S.data.nuvem.pc.nome;
    let cor = 'ok';
    let txt = `Sincronizado · ${pc}`;
    if (s.status === 'erro') { cor = 'erro'; txt = 'Erro ao sincronizar'; }
    else if (s.offline || !navigator.onLine) { cor = 'aviso'; txt = 'Sem internet · salvo aqui'; }
    else if (s.pendentes || s.status === 'conectando') { cor = 'aviso'; txt = 'Sincronizando…'; }
    if (min) return `<span class="sync-min ${cor}" title="${esc(txt)}"><span class="d"></span></span>`;
    return `<span class="sync ${cor}" title="${esc(txt)}"><span class="d"></span><span class="ell">${esc(txt)}</span></span>`;
  }

  // ============================================================ conectar e modo administrador

  function viewConectar() {
    const c = S.conectar;
    const bloq = window.Nuvem.st.status === 'bloqueado';
    return `<div class="lig"><span class="lig-logo">${LOGO_FULL('lg-con', 34)}</span>
      <form class="lig-box" data-form="conectar" novalidate>
        <div style="display:flex;flex-direction:column;gap: var(--sp-1)"><h1>${c.mestra ? 'Acesso Suporte' : 'Conectar computador'}</h1><p class="l2 small">${c.mestra ? 'Digite a senha do suporte.' : bloq ? 'Este computador precisa ser conectado de novo. Entre com uma conta de administrador.' : 'Entre com uma conta de administrador.'}</p></div>
        ${c.mestra ? '' : `<div class="field"><label for="cn-email">E-mail</label><input class="input" id="cn-email" type="email" value="${esc(c.email)}" autocomplete="username" spellcheck="false"></div>`}
        <div class="field"><label for="cn-senha">Senha</label><input class="input" id="cn-senha" type="password" value="${esc(c.senha)}" autocomplete="current-password">
          ${c.mestra ? '' : c.enviado ? `<p class="small muted wrap" style="margin-top: var(--sp-1)">Enviamos um link para <b>${esc(c.enviado)}</b>. Abra o e-mail, crie a senha nova e entre aqui com ela.</p>` : '<div class="am-links"><button type="button" class="am-esq" data-act="cn-esqueci">Esqueci a senha</button></div>'}</div>
        <div class="field"><label for="cn-pc">Nome do computador</label><input class="input" id="cn-pc" value="${esc(c.pc)}" placeholder="Ex.: Balcão 01" autocomplete="off"></div>
        ${c.erro ? `<div class="alert" role="alert">${ic('alertaC', 'ic-16')}<span class="wrap">${esc(c.erro)}</span></div>` : ''}
        <button class="btn primary lg" type="submit" style="width:100%;justify-content:center" ${c.enviando ? 'disabled' : ''}>${c.enviando ? 'Conectando…' : 'Conectar'}</button>
      </form></div>`;
  }

  function viewCarregando() {
    const off = !navigator.onLine;
    return `<div class="lig"><span class="lig-logo">${LOGO_FULL('lg-car', 34)}</span>
      <div class="lig-espera">${off ? ic('alertaC', 'ic-20') : '<span class="spin" aria-hidden="true"></span>'}<span>${off ? 'Sem internet. Os dados da loja aparecem assim que a conexão voltar.' : 'Buscando os dados da loja…'}</span></div></div>`;
  }

  async function conectarSubmit() {
    const c = S.conectar;
    c.email = c.mestra ? MESTRA : $('#cn-email').value.trim();
    c.senha = $('#cn-senha').value;
    c.pc = R.clean($('#cn-pc').value, 40);
    if (!c.email || !c.senha) { c.erro = 'Informe o e-mail e a senha de um administrador.'; render(); return; }
    if (c.pc.length < 2) { c.erro = 'Dê um nome para este computador, ex.: Balcão 01.'; render(); focar('cn-pc'); return; }
    c.erro = '';
    c.enviando = true;
    render();
    const mestra = !!c.mestra;
    const r = await window.Nuvem.conectar(c.email, c.senha, c.pc, mestra);
    c.enviando = false;
    if (!r.ok) { c.erro = mestra && /incorretos/.test(r.error) ? 'Senha incorreta.' : r.error; c.senha = ''; render(); focar('cn-senha'); return; }
    if (!mestra) ls.set('ultimoAdmin', String(c.email).trim().toLowerCase());
    S.conectar = { email: '', senha: '', pc: '', erro: '', enviando: false };
    S.data = r.data;
    S.adm = mestra ? { email: MESTRA, nome: 'Suporte', ate: Infinity, mestra: true } : { email: String(r.data.nuvem.ultimoAdmin || ''), nome: nomeAdmin(r.data.nuvem.ultimoAdmin), ate: Infinity };
    render();
  }

  /** Animação de abertura (não aparece quando o app abre sozinho com o Windows; um clique pula). */
  function abertura() {
    if (!api || !(api.electron || api.web) || new URLSearchParams(location.search).get('min') === '1') return;
    const letras = 'retornei'.split('').map((l, i) => `<span class="lt" style="animation-delay:${(0.95 + i * 0.07).toFixed(2)}s">${l}</span>`).join('');
    document.body.insertAdjacentHTML('beforeend', `<div class="abertura" id="abertura"><span class="lk"><svg width="72" height="72" viewBox="0 0 100 100" aria-hidden="true"><path class="ol" d="${BOLHA}" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path class="fl" d="${BOLHA}" fill="currentColor"/><polyline class="ck" points="33 43 45 55 67 33" fill="none" stroke="var(--surface)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="wd" aria-label="retornei">${letras}</span></span></div>`);
    const el = document.getElementById('abertura');
    const fim = () => { if (!el.isConnected) return; el.classList.add('sai'); setTimeout(() => el.remove(), 380); };
    el.addEventListener('click', fim);
    setTimeout(fim, 2100);
  }

  // chave mestra: conta do suporte, que não aparece na lista nem fica registrada
  const MESTRA = 'willamsdanttas@gmail.com';
  const listaAdmins = () => (S.data && Array.isArray(S.data.loja.admins) ? S.data.loja.admins.filter((a) => a.email !== MESTRA) : []);
  let cliquesLogo = [];
  function abrirMestra() {
    if (naNuvem() && (!S.data.nuvem || window.Nuvem.st.status === 'bloqueado')) { S.conectar.mestra = !S.conectar.mestra; S.conectar.erro = ''; render(); focar('cn-senha'); return; }
    if (S.adm) return;
    AM = { mestra: true, senha: '', erro: '', enviando: false };
    renderAM();
    setTimeout(() => focar('am-senha'), 30);
  }
  function nomeAdmin(email) {
    const e = String(email || '').toLowerCase();
    const a = listaAdmins().find((x) => x.email === e);
    if (a) return a.nome;
    const base = e.split('@')[0].split(/[._-]/)[0] || 'Administrador';
    return cap(base);
  }

  /** Abre o "Entrar como administrador". */
  function pedirAdmin() {
    const ultimo = ls.get('ultimoAdmin', '') === MESTRA ? '' : ls.get('ultimoAdmin', '');
    AM = { escolhido: ultimo || '__outro', ultimo, email: '', senha: '', erro: '', enviando: false };
    renderAM();
    setTimeout(() => { if (AM) focar(AM.escolhido === '__outro' ? 'am-email' : 'am-senha'); }, 30);
  }

  // login de administrador/suporte: se a internet não responder em 15 s, para de esperar e avisa
  const SEM_REDE = 'Sem conexão com a internet. Confira a rede e tente de novo.';
  const comTempo = (p) => Promise.race([p, new Promise((r) => setTimeout(() => r({ ok: false, error: SEM_REDE, tempo: true }), 15000))]);

  // janela de carregamento do login: barra e porcentagem sobem até 90% enquanto confere e completam quando a senha confere
  function andarBarraAM() {
    const t0 = performance.now();
    const passo = (agora) => {
      if (!AM || !(AM.enviando || AM.ok)) return;
      AM.pr = AM.ok ? Math.min(100, AM.pr + 3) : Math.round(90 * (1 - Math.pow(1 - Math.min(1, (agora - t0) / 2600), 3)));
      const b = document.querySelector('.sup-barra i'); const pc = document.querySelector('.sup-pct');
      if (b) b.style.width = `${AM.pr}%`; if (pc) pc.textContent = `${AM.pr}%`;
      if (AM.pr < 100) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }
  const esperarBarraAM = () => new Promise((r) => { const ve = () => (AM && AM.pr < 100 ? requestAnimationFrame(ve) : setTimeout(r, 450)); ve(); });

  function renderAM() {
    const root = $('#admin-root');
    if (!AM) { root.innerHTML = ''; return; }
    const outro = AM.escolhido === '__outro';
    if (AM.enviando || AM.ok) {
      patch(root, `<div class="overlay sup-fundo" style="align-items:center"><section class="dialog sm sup-car${AM.ok ? ' ok' : ''}" role="status" aria-live="polite">
        <span class="sup-logo"><svg width="64" height="64" viewBox="0 0 100 100" aria-hidden="true"><path class="ol" d="${BOLHA}" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path class="fl" d="${BOLHA}" fill="currentColor"/><polyline class="ck" points="33 43 45 55 67 33" fill="none" stroke="var(--surface)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <span class="sup-tx">${AM.ok ? 'Acesso liberado' : AM.mestra ? 'Entrando como Suporte…' : 'Entrando como administrador…'}</span>
        <span class="sup-barra"><i style="width:${AM.pr || 0}%"></i></span><span class="sup-pct">${AM.pr || 0}%</span></section></div>`);
      return;
    }
    if (AM.mestra) {
      patch(root, `<div class="overlay fx" data-act="am-fora" style="align-items:center"><section class="dialog sm sup" role="dialog" aria-modal="true" aria-labelledby="am-t" aria-busy="${!!AM.enviando}">
      <header><div class="row" style="gap: var(--sp-3)"><span class="adm-ic">${ic('escudo', 'ic-20')}</span><h2 id="am-t">Acesso Suporte</h2></div></header>
      <form data-form="am" novalidate><div class="body">
        <div class="field"><label for="am-senha">Senha</label><input class="input" id="am-senha" type="password" autocomplete="off" value="${esc(AM.senha || '')}" ${AM.enviando || AM.ok ? 'disabled' : ''}></div>
        ${AM.erro ? `<div class="alert" role="alert">${ic('alertaC', 'ic-16')}<span class="wrap">${esc(AM.erro)}</span></div>` : ''}</div>
        <footer><div class="right"><button class="btn ghost" type="button" data-act="am-fechar">Cancelar</button><button class="btn primary" type="submit" ${AM.enviando || AM.ok ? 'disabled' : ''}>Entrar</button></div></footer>
      </form></section></div>`);
      return;
    }
    const html = `<div class="overlay fx" data-act="am-fora" style="align-items:center"><section class="dialog sm" role="dialog" aria-modal="true" aria-labelledby="am-t">
      <header><div class="row" style="gap: var(--sp-3)"><span class="adm-ic">${ic('escudo', 'ic-20')}</span><h2 id="am-t">Entrar como administrador</h2></div></header>
      <form data-form="am" novalidate><div class="body">
        ${outro ? `<div class="field"><label for="am-email">E-mail</label><input class="input" id="am-email" type="email" value="${esc(AM.email)}" placeholder="email@exemplo.com" autocomplete="username" spellcheck="false"></div>`
          : `<div class="am-eu"><span class="avatar" data-nome="${esc(nomeAdmin(AM.escolhido))}" data-tom="${tomDe(nomeAdmin(AM.escolhido))}">${esc(R.initials(nomeAdmin(AM.escolhido)))}</span><span style="display:flex;flex-direction:column;min-width:0"><b class="ell">${esc(nomeAdmin(AM.escolhido))}</b><span class="xs muted ell">${esc(AM.escolhido)}</span></span></div>`}
        <div class="field"><label for="am-senha">Senha</label><input class="input" id="am-senha" type="password" value="${esc(AM.senha)}" autocomplete="current-password"></div>
        ${AM.erro ? `<div class="alert" role="alert">${ic('alertaC', 'ic-16')}<span class="wrap">${esc(AM.erro)}</span></div>` : ''}
        ${AM.enviado ? `<p class="small muted wrap">Enviamos um link para <b>${esc(AM.enviado)}</b>. Abra o e-mail, crie a senha nova e entre aqui com ela.</p>` : ''}
        <div class="am-links">${outro ? (AM.ultimo ? `<button type="button" class="am-outro" data-act="am-pick" data-v="${esc(AM.ultimo)}">${ic('voltar', 'ic-14')}Voltar para ${esc(nomeAdmin(AM.ultimo))}</button>` : '') : '<button type="button" class="am-outro" data-act="am-pick" data-v="__outro">' + ic('troca', 'ic-14') + 'Entrar como outro administrador</button>'}${AM.enviado ? '' : `<button type="button" class="am-esq" data-act="am-esqueci" ${AM.enviandoLink ? 'disabled' : ''}>Esqueci a senha</button>`}</div></div>
        <footer><div class="right"><button class="btn ghost" type="button" data-act="am-fechar">Cancelar</button><button class="btn primary" type="submit" ${AM.enviando ? 'disabled' : ''}>${AM.enviando ? 'Conferindo…' : 'Entrar'}</button></div></footer>
      </form></section></div>`;
    patch(root, html);
    const ov = root.querySelector('.overlay');
    if (ov) setTimeout(() => ov.classList.remove('fx'), 200);
  }

  async function amSubmit() {
    if (!AM || AM.enviando) return;
    AM.senha = $('#am-senha').value;
    if (AM.mestra) {
      if (!AM.senha) return;
      AM.enviando = true; AM.erro = ''; AM.pr = 0; renderAM();
      andarBarraAM();
      const rm = await comTempo(window.Nuvem.verificarAdmin(MESTRA, AM.senha));
      if (!AM) return;
      AM.enviando = false;
      if (!rm.ok) { AM.erro = rm.tempo ? SEM_REDE : 'Senha incorreta.'; AM.senha = ''; renderAM(); focar('am-senha'); return; }
      AM.ok = true; renderAM();
      // espera a barra chegar a 100% e mostra "Acesso liberado" por um instante
      await esperarBarraAM();
      if (!AM) return;
      S.adm = { email: MESTRA, nome: 'Suporte', ate: Infinity, mestra: true };
      AM = null; renderAM(); render();
      toast('Você entrou como administrador.');
      return;
    }
    if (AM.escolhido === '__outro') AM.email = ($('#am-email') || {}).value || '';
    const email = (AM.escolhido === '__outro' ? AM.email : AM.escolhido).trim().toLowerCase();
    if (!email || !AM.senha) { AM.erro = 'Informe o e-mail e a senha.'; renderAM(); return; }
    AM.enviando = true;
    AM.erro = '';
    AM.pr = 0;
    renderAM();
    andarBarraAM();
    const r = await comTempo(window.Nuvem.verificarAdmin(email, AM.senha));
    if (!AM) return;
    AM.enviando = false;
    if (!r.ok) { AM.erro = r.error; AM.senha = ''; renderAM(); focar('am-senha'); return; }
    AM.ok = true; renderAM();
    await esperarBarraAM();
    if (!AM) return;
    ls.set('ultimoAdmin', email);
    S.adm = { email, nome: nomeAdmin(email), ate: Infinity };
    AM = null;
    renderAM();
    render();
    if (!listaAdmins().some((a) => a.email === email)) act('salvarAdmins', { admins: listaAdmins().concat({ email, nome: nomeAdmin(email), funcao: 'Administrador' }) }, { silent: true });
    toast('Você entrou como administrador.');
  }

  function sairAdmin(msg) {
    if (!S.adm) return;
    S.adm = null;
    render();
    toast(msg || 'Modo administrador desligado.');
  }

  // ============================================================ tour de boas-vindas e ajuda

  const MINI = {
    av: (t) => `<span class="av">${esc(t)}</span>`,
  };
  const TOUR = [
    { t: 'A fila do dia', h: 'Quem chamar hoje aparece sozinho', d: 'Cada venda vira um lembrete. No dia certo, o cliente entra na tela Hoje.',
      ilu: () => `<div class="mini">${[['BS', 'Bia Souza', 'Para hoje'], ['CL', 'Caio Lima', 'Para hoje'], ['DR', 'Duda Reis', 'Atrasado 2 dias']].map(([a, n, st]) => `<div class="mrow">${MINI.av(a)}${n}<span class="st"><i></i>${st}</span></div>`).join('')}</div>` },
    { t: 'No WhatsApp', h: 'A mensagem já vai escrita', d: 'Um clique abre a conversa com o texto pronto e o nome do vendedor no final. Depois é só enviar.',
      ilu: () => `<div class="mini balao">Olá, Bia! Aqui é a ${esc((vendAtivos()[0] || { nome: 'Ana' }).nome.split(' ')[0])}, da ${esc(S.data.loja.nome || 'loja')}. Como está a sua compra? Posso ajudar em algo?</div>` },
    { t: 'Cadastro no balcão', h: 'Registre a venda em segundos', d: 'Celular, nome, valor e quando chamar de novo. O resto o Retornei faz.',
      ilu: () => `<div class="mini" style="gap: var(--sp-3)"><span class="ml">Celular</span><span class="mi">(82) 99999-0001</span><span class="ml">Chamar de novo em</span><span class="row" style="gap: var(--sp-2)">${['15 dias', '30 dias'].map((x) => `<span class="mc on">${x}</span>`).join('')}</span><span class="mb">Salvar venda</span></div>` },
    { t: 'Produto em falta', h: 'Ninguém fica sem aviso', d: 'Anote o pedido do cliente. Quando o produto chegar, o Retornei lembra de avisar.',
      ilu: () => `<div class="mini">${[['Chá verde 100g', 'Chegou', 'g'], ['Whey 900g', 'Esperando', 'cz'], ['Colágeno', 'Esperando', 'cz']].map(([n, st, c]) => `<div class="mrow"><span class="av cinza">${ic('pedidos', 'ic-14')}</span>${n}<span class="st"><i class="${c}"></i>${st}</span></div>`).join('')}</div>` },
    { t: 'Resultados', h: 'Veja quem voltou a comprar', d: 'Contatos feitos, clientes que voltaram e vendas de retorno, por vendedor.',
      ilu: () => `<div class="mini barras">${[40, 62, 35, 80, 55, 92, 70].map((h, i) => `<span style="height:${h}%" class="${i === 5 ? 'on' : ''}"></span>`).join('')}</div>` },
  ];
  let TP = null; // passo do tour aberto

  function abrirTour() { TP = 0; renderTour(); }
  function fecharTour() { TP = null; ls.set('tourVisto', true); renderTour(); }
  function renderTour() {
    const root = $('#tour-root');
    if (!root) return;
    if (TP === null) { root.innerHTML = ''; return; }
    const s = TOUR[TP];
    const ult = TP === TOUR.length - 1;
    patch(root, `<div class="overlay" style="align-items:center"><section class="tour" role="dialog" aria-modal="true" aria-labelledby="tour-h"><div class="ilu">${s.ilu()}</div>
      <div class="tx"><b>${TP + 1} DE ${TOUR.length} · ${esc(s.t.toUpperCase())}</b><h2 id="tour-h">${esc(s.h)}</h2><p>${esc(s.d)}</p></div>
      <footer><div class="dots">${TOUR.map((_, i) => `<i class="${i === TP ? 'on' : ''}"></i>`).join('')}</div><span class="grow"></span>
      ${TP > 0 ? '<button class="btn ghost" type="button" data-act="tour-voltar">Voltar</button>' : '<button class="btn ghost" type="button" data-act="tour-fechar">Pular</button>'}
      <button class="btn primary" type="button" data-act="${ult ? 'tour-fechar' : 'tour-prox'}">${ult ? 'Começar' : 'Próximo'}</button></footer></section></div>`);
    const b = root.querySelector('.btn.primary');
    if (b) b.focus();
  }

  const AJ = () => window.AJUDA_CONTEUDO || { topicos: [], duvidas: [] };

  function quadro(pecas) {
    if (!pecas || !pecas.length) return '<div></div>';
    const p = pecas.map((x) => {
      if (x[0] === 'btn') return `<span class="q-btn">${esc(x[1])}</span>`;
      if (x[0] === 'in') return `<span class="q-l">${esc(x[1])}</span><span class="q-in">${esc(x[2])}</span>`;
      if (x[0] === 'chips') return `<span class="q-chips">${x[1].map((c, i) => `<span class="${x[2].includes(i) ? 'on' : ''}">${esc(c)}</span>`).join('')}</span>`;
      if (x[0] === 'zap') return `<span class="q-zap">${esc(x[1])}</span>`;
      if (x[0] === 'linha') return `<span class="q-linha"><span class="av">${esc(R.initials(x[1]))}</span>${esc(x[1])}<span class="st"><i></i>${esc(x[2])}</span></span>`;
      if (x[0] === 'acoes') return `<span class="q-chips">${x[1].map((c) => `<span>${esc(c)}</span>`).join('')}</span>`;
      return '';
    }).join('');
    return `<div class="quadro">${p}</div>`;
  }

  function artigo(t, i, todos) {
    const ant = todos[i - 1];
    const prox = todos[i + 1];
    const aula = t.video
      ? `<div class="no-print"><button class="aula" type="button" data-act="aula" data-v="${esc(t.video)}">${ic('play', 'ic-16')}Ver aula</button></div>`
      : '';
    return `<article class="card aj-art"><h2>${esc(t.titulo)}</h2>${aula}<p class="lead">${esc(t.lead)}</p>
      <div>${t.passos.map(([tt, d, q], n) => `<div class="passo"><span class="n">${n + 1}</span><div><b>${esc(tt)}</b><p>${esc(d)}</p></div>${quadro(q)}</div>`).join('')}</div>
      ${t.dica ? `<div class="dica">${ic('luz', 'ic-20')}<span><b>Dica:</b> ${esc(t.dica)}</span></div>` : ''}
      <div class="prox no-print">${ant ? `<button class="link" type="button" data-act="aj-topico" data-v="${ant.id}">← ${esc(ant.titulo)}</button>` : '<span></span>'}${prox ? `<button class="link blue" type="button" data-act="aj-topico" data-v="${prox.id}" style="font-weight:600">${esc(prox.titulo)} →</button>` : `<button class="link blue" type="button" data-act="aj-topico" data-v="duvidas" style="font-weight:600">Dúvidas frequentes →</button>`}</div></article>`;
  }

  function artigoDuvidas(todasAbertas) {
    return `<article class="card aj-art"><h2>Dúvidas frequentes</h2>
      <div>${AJ().duvidas.map(([q, r], i) => {
        const ab = todasAbertas || S.faqAberta === i;
        return `<div class="faq"><button type="button" class="q" data-act="aj-faq" data-v="${i}" aria-expanded="${ab}">${esc(q)}${ic(ab ? 'chevUp' : 'chev', 'ic-16')}</button>${ab ? `<div class="a">${esc(r)}</div>` : ''}</div>`;
      }).join('')}</div>
      <div class="dica">${ic('luz', 'ic-20')}<span><b>Não achou?</b> Fale com o suporte do sistema${suporteNome() ? `: ${esc(suporteNome())}` : ''}.</span></div></article>`;
  }

  function suporteNome() {
    const a = listaAdmins().find((x) => /suporte/i.test(x.funcao || ''));
    return a ? a.nome : '';
  }

  function viewAjuda() {
    const todos = AJ().topicos;
    if (S.ajudaManual) {
      return `<div class="page aj-manual"><p class="so-impressao small l2">${esc(S.data.loja.nome)} · Manual do Retornei</p><h1>Manual do Retornei</h1>${todos.map((t, i) => artigo(t, i, [])).join('')}${artigoDuvidas(true)}</div>`;
    }
    const q = R.keyOf(S.ajudaBusca || '');
    const casaT = (t) => !q || R.keyOf(`${t.titulo} ${t.lead} ${t.passos.map((p) => `${p[0]} ${p[1]}`).join(' ')} ${t.dica || ''}`).includes(q);
    const visiveis = todos.filter(casaT);
    const grupos = [...new Set(todos.map((t) => t.grupo))];
    const atual = S.ajudaTopico === 'duvidas' ? null : (todos.find((t) => t.id === S.ajudaTopico) || todos[0]);
    const link = (id, titulo) => `<button type="button" class="${(atual ? atual.id : 'duvidas') === id ? 'on' : ''}" data-act="aj-topico" data-v="${id}">${esc(titulo)}</button>`;
    const nav = `<nav class="card aj-nav" aria-label="Assuntos da ajuda">${grupos.map((g) => {
      const l = visiveis.filter((t) => t.grupo === g);
      return l.length ? `<span class="g">${esc(g)}</span><div class="grp">${l.map((t) => link(t.id, t.titulo)).join('')}</div>` : '';
    }).join('')}${!q || R.keyOf(AJ().duvidas.flat().join(' ')).includes(q) ? `<span style="height: 12px"></span>${link('duvidas', 'Dúvidas frequentes')}` : ''}
      ${q && !visiveis.length ? '<span class="xs muted" style="padding: var(--sp-3)">Nada encontrado.</span>' : ''}</nav>`;
    const i = atual ? todos.indexOf(atual) : -1;
    return `<div class="page" style="max-width:1180px"><div class="page-head"><div class="t"><h1>Ajuda</h1></div><div class="grow"></div>
      <label class="busca-aj">${ic('search', 'ic-16')}<input id="aj-busca" type="search" placeholder="Buscar na ajuda" value="${esc(S.ajudaBusca || '')}" autocomplete="off" aria-label="Buscar na ajuda"></label>
${api.pdf ? `<button class="btn primary" type="button" data-act="manual-pdf" style="height: 40px;border-radius: var(--r-full)">${ic('pdf', 'ic-16')}Manual em PDF</button>` : ''}</div>
      <div class="aj">${nav}${atual ? artigo(atual, i, todos) : artigoDuvidas(false)}</div></div>`;
  }

  // ============================================================ tela de atualização ao abrir o app
  // Se ao abrir já houver versão nova (baixando ou pronta), mostra a tela antes de usar. "Depois" segue como hoje
  // (o cartão do menu continua e a versão entra quando o Retornei fechar).
  const ABERTO_EM = Date.now();
  let UA = null; // { fase: 'pergunta' | 'baixando' | 'ok' | 'erro', versao, atual, pr }
  let uaVista = false;
  function uaAoAbrir(u) {
    if (uaVista || !u || !u.versao || Date.now() - ABERTO_EM > 8000) return;
    if (u.estado !== 'baixando' && u.estado !== 'pronto') return;
    uaVista = true;
    UA = { fase: 'pergunta', versao: u.versao, atual: '', pr: 0 };
    if (api.info) api.info().then((r) => { if (UA && r && r.ok) { UA.atual = r.data.versao || ''; renderUA(); } });
    renderUA();
  }
  function uaMudou(u) {
    if (!UA || UA.fase === 'pergunta') return;
    if (u.estado === 'baixando') { UA.pr = Math.min(99, u.pct || 0); renderUA(); }
    if (u.estado === 'pronto' && UA.fase === 'baixando') uaInstalar();
    if (u.estado === 'erro' && UA.fase === 'baixando') { UA.fase = 'erro'; renderUA(); }
  }
  async function uaInstalar() {
    UA.fase = 'ok'; UA.pr = 100; renderUA();
    await new Promise((ok) => setTimeout(ok, 900));
    await api.updInstalar();
  }
  function renderUA() {
    const root = $('#ua-root');
    if (!UA) { patch(root, ''); return; }
    const f = UA.fase;
    const corpo = f === 'pergunta'
      ? `<div class="ua-tt"><h1 id="ua-t">Atualização disponível</h1><p>Versão ${esc(UA.versao)}</p></div>
        <button class="btn primary lg ua-bt" type="button" id="ua-ok" data-act="ua-atualizar">Atualizar</button><button class="link ua-dp" type="button" data-act="ua-depois">Depois</button>`
      : f === 'erro'
        ? `<div class="ua-tt"><h1 id="ua-t">Não deu para atualizar agora</h1><p>Confira a internet. A versão nova entra quando o Retornei fechar.</p></div>
          <button class="btn primary lg ua-bt" type="button" data-act="ua-depois">Continuar</button>`
        : `<span class="sup-tx" id="ua-t">${f === 'ok' ? 'Atualizado' : 'Atualizando…'}</span><span class="sup-barra"><i style="width:${UA.pr}%"></i></span><span class="sup-pct">${UA.pr}%</span>`;
    patch(root, `<div class="ua-tela" role="dialog" aria-modal="true" aria-labelledby="ua-t"><section class="ua-caixa sup-car${f === 'ok' ? ' ok' : ''}${f === 'pergunta' || f === 'erro' ? ' parado' : ''}" ${f === 'baixando' || f === 'ok' ? 'role="status" aria-live="polite"' : ''}>
      <span class="sup-logo"><svg width="64" height="64" viewBox="0 0 100 100" aria-hidden="true"><path class="ol" d="${BOLHA}" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path class="fl" d="${BOLHA}" fill="currentColor"/><polyline class="ck" points="33 43 45 55 67 33" fill="none" stroke="var(--surface)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      ${corpo}</section>${UA.atual ? `<span class="ua-ver">Você está na versão ${esc(UA.atual)}</span>` : ''}</div>`);
  }

  function cartaoUpd(min) {
    if (S.upd.estado !== 'pronto' || S.updDepois) return '';
    if (min) return `<button type="button" class="nav-item upd-min" data-act="upd-reiniciar" title="Nova versão pronta: reiniciar agora" aria-label="Nova versão pronta: reiniciar agora">${ic('atualizar')}<span class="pip"></span></button>`;
    return `<div class="upd-card" role="status"><div class="r"><span class="t">${ic('atualizar', 'ic-16')}Nova versão disponível</span><button class="x" type="button" data-act="upd-depois" title="Depois" aria-label="Depois">${ic('x', 'ic-14')}</button></div>
      <button class="btn primary" type="button" data-act="upd-reiniciar">Atualizar</button></div>`;
  }

  function topbar() {
    if (!['hoje', 'encomendas', 'clientes'].includes(S.view)) return '';
    const ph = { hoje: 'Buscar cliente na fila', encomendas: 'Buscar produto ou cliente', clientes: 'Buscar por nome, celular ou nº da nota' }[S.view];
    return `<div class="topbar">${ph ? `<label class="search">${ic('search')}<input id="busca" type="search" placeholder="${ph}" value="${esc(S.busca[S.view])}" autocomplete="off" aria-label="${ph}"></label>` : ''}
      <div class="grow"></div><button class="btn primary" type="button" data-act="novo" title="Nova venda (Ctrl+N)">${ic('plus', 'ic-16')}Nova venda</button></div>`;
  }

  const pills = (items, cur, act, label) =>
    `<div class="pills" role="tablist" aria-label="${label}">${items.map(([v, l]) => `<button type="button" role="tab" aria-selected="${cur === v}" data-act="${act}" data-v="${v}">${l}</button>`).join('')}</div>`;
  const pillSelect = (id, label, opts, cur, w) =>
    `<label class="pill-select"><span style="position:absolute;width: 1.0px;height: 1.0px;overflow:hidden;clip:rect(0 0 0 0)">${label}</span><select id="${id}" style="width:${w}px">${opts.map(([v, l]) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>${ic('chev', 'ic-16')}</label>`;

  // ============================================================ listas e calendário no estilo do Retornei

  const DD = { open: null, idx: -1, mes: null };

  function ddDados(id) {
    if (id === 'm-vend') return { cur: M ? M.vendedorId : '', ph: 'Escolha o vendedor', opts: vendAtivos().map((v) => ({ v: v.id, l: v.nome, ini: R.initials(v.nome) })) };
    if (id === 'filtro-vend') return { cur: S.filtroVend, opts: [{ v: '', l: 'Todos os vendedores', icon: 'clientes' }].concat(S.data.vendedores.filter((v) => !v.excluido).map((v) => ({ v: v.id, l: v.nome + (v.ativo ? '' : ' (inativo)'), ini: R.initials(v.nome) }))) };
    if (id === 'm-doctipo' || id === 'ce-doctipo') {
      const cur = id === 'm-doctipo' ? (M ? R.docTipoDe(M.docTipo) : 'cnpj') : R.docTipoDe(S.cliEdit && S.cliEdit.docTipo);
      return { cur, opts: [{ v: 'cnpj', l: 'CNPJ', sub: 'Empresa · 14 números' }, { v: 'cpf', l: 'CPF', sub: 'Pessoa física · 11 números' }] };
    }
    if (id === 'm-modelo' || id === 'ev-modelo') {
      const cur = id === 'm-modelo' ? (M ? modeloM() : '55') : (EV ? EV.modelo : '');
      return { cur, opts: [{ v: '55', l: 'NF-e 55', sub: 'Nota fiscal eletrônica' }, { v: '65', l: 'NFC-e 65', sub: 'Cupom fiscal do consumidor' }] };
    }
    if (id === 'rel-vend') return { cur: S.relVend, opts: [{ v: '', l: 'Todos os vendedores', icon: 'clientes' }].concat(S.data.vendedores.filter((v) => !v.excluido).map((v) => ({ v: v.id, l: v.nome + (v.ativo ? '' : ' (inativo)'), ini: R.initials(v.nome) }))) };
    if (id === 'aviso-hora') {
      const hs = [];
      for (let h = 6; h <= 12; h++) for (const m of ['00', '30']) hs.push(`${String(h).padStart(2, '0')}:${m}`);
      const cur = S.data.config.avisoHora || '08:30';
      if (!hs.includes(cur)) hs.push(cur);
      return { cur, opts: hs.sort().map((h) => ({ v: h, l: h })) };
    }
    if (id === 'ev-vend' && EV) return { cur: EV.vendedorId, ph: 'Escolha o vendedor', opts: S.data.vendedores.filter((v) => v.ativo || v.id === EV.vendedorId).map((v) => ({ v: v.id, l: v.nome + (v.ativo ? '' : ' (inativo)'), ini: R.initials(v.nome) })) };
    if (id === 'imp-vend' && I) return { cur: I.vendPadrao, ph: 'Escolha o vendedor', opts: vendAtivos().map((v) => ({ v: v.id, l: v.nome, ini: R.initials(v.nome) })) };
    if (id.startsWith('imp-') && I) return { cur: I.mapa[Number(id.slice(4))] || '', opts: R.CAMPOS_IMPORT.map(([v, l]) => ({ v, l })) };
    if (id === 'cli-origem') return { cur: S.origem, opts: [{ v: '', l: 'Todas as origens' }, { v: 'balcao', l: 'Cadastrados no balcão' }, { v: 'planilha', l: 'Importados da planilha' }] };
    if (id === 'filtro-tipo') return { cur: S.filtroTipo, opts: [{ v: '', l: 'Todos os tipos', icon: 'clientes' }, { v: 'varejo', l: 'Varejo', icon: 'sacola' }, { v: 'atacado', l: 'Atacado', icon: 'equipe' }] };
    return { cur: '', opts: [] };
  }

  function dd(id, o) {
    const opt = o || {};
    const d = ddDados(id);
    const open = DD.open === id;
    const atual = d.opts.find((x) => x.v === d.cur);
    const marca = (x, hi) => (x.ini ? `<span class="dd-ini${hi ? ' hi' : ''}">${esc(x.ini)}</span>` : x.icon ? `<span class="dd-ico">${ic(x.icon, 'ic-16')}</span>` : '');
    const label = atual ? `<span class="dd-val">${opt.pill ? '' : marca(atual)}<span class="ell">${esc(atual.l)}</span></span>` : `<span class="dd-ph">${esc(d.ph || 'Escolha')}</span>`;
    const lista = open
      ? `<div class="dd-list${opt.right ? ' right' : ''}" role="listbox">${d.opts.map((x, i) => `<button type="button" role="option" class="dd-item${i === DD.idx ? ' hi' : ''}${x.v === d.cur ? ' on' : ''}" aria-selected="${x.v === d.cur}" data-act="dd-pick" data-dd="${id}" data-v="${esc(x.v)}">${marca(x, i === DD.idx)}<span class="grow" style="display:flex;flex-direction:column;min-width:0"><span class="ell">${esc(x.l)}</span>${x.sub ? `<span class="dd-sub">${esc(x.sub)}</span>` : ''}</span>${x.v === d.cur ? ic('check', 'ic-16') : ''}</button>`).join('')}
          <span class="dd-hint">↑ ↓ para escolher · Enter confirma</span></div>`
      : '';
    const limpar = opt.clear && atual && atual.v !== '' ? `<button type="button" class="dd-x" data-act="dd-clear" data-dd="${id}" title="Limpar (Delete)" aria-label="Limpar">${ic('x', 'ic-14')}</button>` : '';
    return `<div class="dd${opt.pill ? ' pill' : ''}${limpar ? ' has-x' : ''}" style="${opt.w ? `width:${opt.w}px` : ''}"><button type="button" class="dd-btn${open ? ' open' : ''}" id="${id}" data-act="dd" data-v="${id}" aria-haspopup="listbox" aria-expanded="${open}" ${opt.invalid ? 'aria-invalid="true"' : ''}>${label}${ic('chev', 'ic-16 dd-chev')}</button>${limpar}${lista}</div>`;
  }

  function ddEscolher(id, v) {
    DD.open = null;
    if (id === 'm-vend' && M) {
      M.vendedorId = v;
      if (!v) ls.set('ultimoVendedor', '');
      delete M.errors.vendedorId;
      ls.set('ultimoVendedor', v);
    }
    if (id === 'filtro-vend') { S.filtroVend = v; ls.set('filtroVend', v); }
    if (id === 'm-modelo' && M && v) { M.modelo = v; DD.open = null; redesenhar(); focar('m-cupom'); return; }
    if (id === 'ev-modelo' && EV && v) { EV.modelo = v; DD.open = null; renderEV(); focar('ev-cupom'); return; }
    if (id === 'm-doctipo' && M && v) {
      if (R.docTipoDe(M.docTipo) !== v) { M.docTipo = v; M.cnpj = ''; delete M.errors.cnpj; }
      DD.open = null;
      redesenhar();
      focar('m-cnpj');
      return;
    }
    if (id === 'ce-doctipo' && S.cliEdit && v) {
      if (R.docTipoDe(S.cliEdit.docTipo) !== v) { S.cliEdit.docTipo = v; S.cliEdit.cnpj = ''; delete S.cliEdit.erros.cnpj; }
      DD.open = null;
      redesenhar();
      focar('ce-cnpj');
      return;
    }
    if (id === 'filtro-tipo') { S.filtroTipo = v; ls.set('filtroTipo', v); }
    if (id === 'rel-vend') S.relVend = v;
    if (id === 'cli-origem') S.origem = v;
    if (id === 'aviso-hora' && v) { act('salvarConfig', { avisoHora: v }, { toast: `O aviso vai aparecer às ${v}.` }); }
    if (id === 'ev-vend' && EV) { if (v) { EV.vendedorId = v; delete EV.errors.vendedorId; } }
    else if (id === 'imp-vend' && I) { if (v) I.vendPadrao = v; I.conf = null; }
    else if (id.startsWith('imp-') && I) {
      const i = Number(id.slice(4));
      if (v) I.mapa = I.mapa.map((x, j) => (j !== i && x === v ? '' : x));
      I.mapa[i] = v;
      I.conf = null;
    }
    redesenhar();
    const b = document.getElementById(id);
    if (b) b.focus();
  }

  function redesenhar() {
    render();
    if (M) renderModal();
    renderResumo();
    renderImport();
    renderEV();
  }

  /** Campo de documento: tipo (CNPJ/CPF) colado no começo e conferência na hora. */
  function campoDoc(pref, tipoDoc, valor, erroTxt, dataAttr) {
    const t = R.docTipoDe(tipoDoc);
    const listaId = `${pref}-doctipo`;
    const open = DD.open === listaId;
    const sit = R.docSituacao(valor, t);
    const nome = t === 'cpf' ? 'CPF' : 'CNPJ';
    const msg = erroTxt
      ? `<span class="err">${esc(erroTxt)}</span>`
      : sit === 'ok' ? `<span class="doc-ok">${ic('check', 'ic-14')}${nome} válido</span>`
        : sit === 'erro' ? `<span class="err">${nome} inválido. Confira os números.</span>` : '';
    const d = ddDados(listaId);
    const lista = open
      ? `<div class="dd-list" role="listbox" style="width:240px">${d.opts.map((x, i) => `<button type="button" role="option" class="dd-item${i === DD.idx ? ' hi' : ''}${x.v === t ? ' on' : ''}" aria-selected="${x.v === t}" data-act="dd-pick" data-dd="${listaId}" data-v="${x.v}"><span class="grow" style="display:flex;flex-direction:column"><span>${x.l}</span><span class="dd-sub">${x.sub}</span></span>${x.v === t ? ic('check', 'ic-16') : ''}</button>`).join('')}</div>`
      : '';
    return `<div class="field"><label for="${pref}-cnpj">Documento (opcional)</label>
      <div class="doc${erroTxt || sit === 'erro' ? ' inv' : ''}${open ? ' open' : ''}"><div class="dd doc-dd"><button type="button" class="doc-tipo" id="${listaId}" data-act="dd" data-v="${listaId}" aria-haspopup="listbox" aria-expanded="${open}" aria-label="Tipo de documento: ${nome}">${nome}${ic('chev', 'ic-16')}</button>${lista}</div>
        <input id="${pref}-cnpj" ${dataAttr}="cnpj" value="${esc(R.maskDoc(valor, t))}" placeholder="${t === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}" inputmode="numeric" autocomplete="off" aria-label="${nome}"></div>${msg}</div>`;
  }

  const MODELO_NOME = { 55: 'NF-e 55', 65: 'NFC-e 65' };
  /** Texto da nota de uma venda: "NF-e 55 · nº 000777" no atacado, "cupom 004612" quando não tem modelo. */
  const notaTxt = (v) => (v.modelo ? `${MODELO_NOME[v.modelo]} · nº ${v.cupom}` : `cupom ${v.cupom}`);
  /** Modelo que já vem marcado: o último usado por esse cliente; sem histórico, CNPJ vai de 55 e CPF de 65. */
  function modeloPadrao(cliId, docTipo) {
    const ult = cliId ? S.data.vendas.filter((v) => v.clienteId === cliId && !v.excluida && v.modelo).sort((a, b) => (a.data < b.data ? 1 : -1))[0] : null;
    return ult ? ult.modelo : R.docTipoDe(docTipo) === 'cpf' ? '65' : '55';
  }
  const modeloM = () => (M ? M.modelo || modeloPadrao(M.knownId, M.docTipo) : '55');

  /** Campo da nota no atacado: modelo (55/65) colado no começo, igual ao CNPJ/CPF. */
  function campoNota(pref, modelo, valor, erroTxt, dataAttr) {
    const listaId = `${pref}-modelo`;
    const open = DD.open === listaId;
    const d = ddDados(listaId);
    const lista = open
      ? `<div class="dd-list" role="listbox" style="width:240px">${d.opts.map((x, i) => `<button type="button" role="option" class="dd-item${i === DD.idx ? ' hi' : ''}${x.v === modelo ? ' on' : ''}" aria-selected="${x.v === modelo}" data-act="dd-pick" data-dd="${listaId}" data-v="${x.v}"><span class="grow" style="display:flex;flex-direction:column"><span>${x.l}</span><span class="dd-sub">${x.sub}</span></span>${x.v === modelo ? ic('check', 'ic-16') : ''}</button>`).join('')}</div>`
      : '';
    return `<div class="field"><label for="${pref}-cupom">Nota fiscal</label>
      <div class="doc nota${erroTxt ? ' inv' : ''}${open ? ' open' : ''}"><div class="dd doc-dd"><button type="button" class="doc-tipo${modelo ? '' : ' vazio'}" id="${listaId}" data-act="dd" data-v="${listaId}" aria-haspopup="listbox" aria-expanded="${open}" aria-label="Modelo da nota: ${modelo ? MODELO_NOME[modelo] : 'não informado'}">${modelo ? MODELO_NOME[modelo] : 'Modelo'}${ic('chev', 'ic-16')}</button>${lista}</div>
        <input id="${pref}-cupom" ${dataAttr}="cupom" value="${esc(valor)}" placeholder="Nº da nota" inputmode="numeric" autocomplete="off" aria-label="Número da nota"></div><span class="err" id="err-cupom">${esc(erroTxt || '')}</span></div>`;
  }

  function dataRotulo(iso) {
    const n = R.diffDays(iso, S.today);
    const pre = n === 0 ? 'Hoje' : n === 1 ? 'Ontem' : n === 2 ? 'Anteontem' : cap(R.SEMANA_CURTA[R.parseISO(iso).getDay()]);
    return `${pre}, ${R.formatDate(iso)}`;
  }

  function calendario() {
    const [y, m] = DD.mes.split('-').map(Number);
    const primeiro = new Date(y, m - 1, 1);
    const total = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = 0; i < primeiro.getDay(); i++) cells.push('<span></span>');
    for (let d = 1; d <= total; d++) {
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const fut = iso > S.today;
      const cls = ['cal-d', iso === alvoData().data ? 'sel' : '', iso === S.today ? 'hoje' : ''].filter(Boolean).join(' ');
      cells.push(`<button type="button" class="${cls}" ${fut ? 'disabled' : `data-act="cal-pick" data-v="${iso}"`} aria-label="${esc(R.formatDate(iso, 'longa'))}">${d}</button>`);
    }
    const podeAvancar = DD.mes < S.today.slice(0, 7);
    return `<div class="cal" role="dialog" aria-label="Escolher data">
      <div class="cal-top"><button type="button" class="round" data-act="cal-nav" data-v="-1" aria-label="Mês anterior">${ic('chev', 'ic-16 rot90')}</button><span class="medium">${cap(R.MESES[m - 1])} de ${y}</span><button type="button" class="round" data-act="cal-nav" data-v="1" aria-label="Próximo mês" ${podeAvancar ? '' : 'disabled'}>${ic('chev', 'ic-16 rot-90')}</button></div>
      <div class="cal-grid">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => `<span class="cal-w">${d}</span>`).join('')}${cells.join('')}</div></div>`;
  }

  function campoData(invalid) {
    const open = DD.open === 'm-data';
    return `<div class="dd"><button type="button" class="dd-btn${open ? ' open' : ''}" id="m-data" data-act="cal" aria-haspopup="dialog" aria-expanded="${open}" ${invalid ? 'aria-invalid="true"' : ''}><span class="ell">${esc(EV ? R.formatDate(EV.data) : dataRotulo(M.data))}</span>${ic('hoje', 'ic-16 dd-chev')}</button>${open ? calendario() : ''}</div>`;
  }

  // ============================================================ primeira vez

  const G_LOGO = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style="flex: none"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

  /** Painel azul do primeiro acesso (marca e benefícios). */
  function painelBoasVindas() {
    const benef = (icone, t, d) => `<div class="wl-b"><span class="wl-i">${icone}</span><div><b>${t}</b><span>${d}</span></div></div>`;
    return `<section class="wl-panel" aria-hidden="true">
        <svg class="wl-water" viewBox="0 0 100 100"><path d="${BOLHA}" fill="#FFFFFF"/>${CHECK('#0057B2')}</svg>
        <span class="wl-logo">${LOGO_FULL('wl-l', 30, '#0057B2')}</span>
        <div class="wl-mid"><div style="display:flex;flex-direction:column;gap: var(--sp-3)"><h2>Seus clientes de volta, no dia certo.</h2><p>O Retornei organiza o pós-venda da loja para ninguém ser esquecido.</p></div>
          <div class="wl-list">${benef(ic('hoje', 'ic-20'), 'A fila do dia pronta', 'Quem comprou e precisa de um retorno aparece sozinho.')}${benef(WA(true), 'Mensagem pronta no WhatsApp', 'Um clique abre a conversa com o texto escrito.')}${benef(ic('sino', 'ic-20'), 'Aviso quando o produto chega', 'Quem pediu algo em falta é lembrado na hora.')}</div></div>
        <span class="wl-foot">Feito para o balcão da sua loja.</span>
      </section>`;
  }

  /** Primeiro acesso: tela Entrar (o login ainda não confere a conta) e depois Criar sua loja. */
  function viewSetup() {
    const su = S.setup;
    if (naNuvem()) {
      return `<div class="lig"><span class="lig-logo">${LOGO_FULL('lg-loja', 34)}</span>
      <form class="lig-box" data-form="setup" novalidate><h1>Cadastre sua loja</h1>
        <div class="field"><label for="su-loja">Nome da loja</label><input class="input" id="su-loja" data-su="loja" value="${esc(su.loja)}" placeholder="Ex.: Viva Nature" autocomplete="off" ${su.erro.lojaNome ? 'aria-invalid="true"' : ''}><span class="err">${esc(su.erro.lojaNome || '')}</span></div>
        <div class="field"><label for="su-zap">WhatsApp da loja</label><input class="input" id="su-zap" data-su="zap" value="${esc(su.zap || '')}" placeholder="(00) 00000-0000" inputmode="tel" autocomplete="off" ${su.erro.whatsapp ? 'aria-invalid="true"' : ''}><span class="err">${esc(su.erro.whatsapp || '')}</span></div>
        <div class="field"><label for="su-nome">Responsável</label><input class="input" id="su-nome" data-su="nome" value="${esc(su.nome)}" placeholder="Nome de quem cuida da loja" autocomplete="off" ${su.erro.vendedores ? 'aria-invalid="true"' : ''}><span class="err">${esc(su.erro.vendedores || '')}</span></div>
        <button class="btn primary lg" type="submit" style="width:100%;justify-content:center">Continuar</button>
      </form></div>`;
    }
    if (su.etapa === 'entrar') {
      return `<div class="welcome2">${painelBoasVindas()}
      <main class="wl-form"><div class="wl-box">
        <div style="display:flex;flex-direction:column;gap: var(--sp-2)"><h1>Entrar no Retornei</h1><p class="l2 wrap small">Entre com a sua conta Google. Se você criou uma senha no Retornei, também pode usar o e-mail.</p></div>
        <button type="button" class="btn-google" data-act="entrar-google">${G_LOGO}Entrar com o Google</button>
        <div class="wl-div"><span></span>ou com e-mail e senha<span></span></div>
        <div class="wl-off" aria-disabled="true">
          <div class="field"><label for="en-mail">E-mail</label><input class="input" id="en-mail" type="email" placeholder="voce@email.com" disabled></div>
          <div class="field"><div class="row" style="justify-content:space-between"><label for="en-senha" style="font-size: var(--fs-12);font-weight:500;color:var(--l2)">Senha</label><span class="xs muted">Esqueci a senha</span></div><input class="input" id="en-senha" type="password" placeholder="Sua senha" disabled></div>
          <button class="btn primary lg" type="button" disabled style="width:100%;justify-content:center">Entrar</button>
          <span class="xs muted" style="text-align:center">E-mail e senha ficam disponíveis na versão com Google.</span>
        </div>
        <p class="small l2" style="text-align:center">Ainda não tem conta? <button type="button" class="link blue" data-act="entrar-google" style="display:inline-flex;height:auto">Criar conta</button></p>
        <span class="wl-teste">${ic('info', 'ic-14')}Versão de teste: o login ainda não confere a conta.</span>
      </div></main></div>`;
    }
    return `<div class="welcome2">${painelBoasVindas()}
      <main class="wl-form"><form data-form="setup" novalidate>
        <span class="wl-step">PRIMEIRO ACESSO</span>
        <div style="display:flex;flex-direction:column;gap: var(--sp-2)"><h1>Criar sua loja</h1><p class="l2 wrap small">Você fica como responsável. Depois é só adicionar a equipe em Equipe.</p></div>
        <div class="field"><label for="su-loja">Nome da loja</label><input class="input" id="su-loja" data-su="loja" value="${esc(su.loja)}" placeholder="Ex.: Viva Nature" autocomplete="off" ${su.erro.lojaNome ? 'aria-invalid="true"' : ''}><span class="err">${esc(su.erro.lojaNome || '')}</span></div>
        <div class="field"><label for="su-zap">WhatsApp da loja</label><input class="input" id="su-zap" data-su="zap" value="${esc(su.zap || '')}" placeholder="(00) 00000-0000" inputmode="tel" autocomplete="off" ${su.erro.whatsapp ? 'aria-invalid="true"' : ''}><span class="err">${esc(su.erro.whatsapp || '')}</span><span class="xs muted">Usado para mandar o resumo do dia. Pode deixar para depois.</span></div>
        <div class="field"><label for="su-nome">Conta responsável pela loja</label>
          <div class="wl-resp"><span class="avatar" data-nome="${esc(su.nome || '?')}" data-tom="${tomDe(su.nome || '?')}">${esc(R.initials(su.nome || '?'))}</span><input class="input" id="su-nome" data-su="nome" value="${esc(su.nome)}" placeholder="Seu nome" autocomplete="off" ${su.erro.vendedores ? 'aria-invalid="true"' : ''}><span class="wl-tag">Responsável</span></div>
          <span class="err">${esc(su.erro.vendedores || '')}</span>
          <span class="xs muted wrap">Seu nome também entra como o primeiro vendedor. Os outros você adiciona em Equipe.</span></div>
        ${naNuvem() ? '' : `<div class="wl-nota">${ic('pasta', 'ic-16')}<span class="wrap">Nesta versão de teste, os dados ficam salvos neste computador. Na versão com Google, a loja fica na conta responsável e a equipe entra pelo e-mail.</span></div>`}
        <button class="btn primary lg" type="submit" style="width:100%;justify-content:center">Continuar</button>
      </form></main></div>`;
  }

  async function setupSubmit() {
    const su = S.setup;
    const nome = R.clean(su.nome, 40);
    if (nome.length < 2) { su.erro = { vendedores: 'Informe o seu nome.' }; render(); focar('su-nome'); return; }
    const r = await api.acao('configurar', { lojaNome: su.loja, vendedores: [nome], whatsapp: su.zap || '' });
    if (!r.ok) {
      su.erro = r.fields || {};
      render();
      if (!r.fields) toast(r.error, { erro: true });
      return;
    }
    S.data = r.data;
    if (naNuvem() && S.data.nuvem && S.data.nuvem.ultimoAdmin) {
      await act('salvarAdmins', { admins: [{ email: S.data.nuvem.ultimoAdmin, nome, funcao: 'Administrador' }] }, { silent: true });
      if (S.adm) S.adm.nome = nome;
    }
    render();
    toast('Tudo pronto. Registre a primeira venda em Nova venda.');
  }

  // ============================================================ HOJE

  function listaHoje() {
    const q = busca('hoje');
    const todos = itens().filter(passa).filter((x) => casa(q, `${nomeCli(x.c)} ${x.c.nome} ${x.c.empresa || ''}`, x.c.celular));
    const pend = todos.filter((x) => x.st === 'atrasado' || x.st === 'hoje').sort(porData);
    const normais = pend.filter((x) => !S.pulados.includes(x.l.id));
    const pulados = S.pulados.map((id) => pend.find((x) => x.l.id === id)).filter(Boolean);
    const lim = S.periodo === 'semana' ? 7 : S.periodo === 'mes' ? 31 : 0;
    const futuros = lim ? todos.filter((x) => x.st === 'agendado' && R.diffDays(S.today, x.l.data) <= lim).sort(porData) : [];
    return { todos, pend, lista: normais.concat(pulados, futuros), feitos: todos.filter(feitoHoje) };
  }

  function viewHoje() {
    const { todos, pend, lista, feitos } = listaHoje();
    const head = `<div class="page-head"><div class="t"><h1>Hoje</h1><span class="sub">${esc(cap(R.formatDate(S.today, 'longa')))} · ${pend.length} na fila</span></div><div class="grow"></div>
      <button class="btn pill-btn compacto" type="button" data-act="resumo" title="Resumo do dia para o WhatsApp da loja" aria-label="Resumo do dia">${WA()}<span class="lbl">Resumo</span></button>
      ${pills([['hoje', 'Hoje'], ['semana', 'Semana'], ['mes', 'Mês']], S.periodo, 'periodo', 'Período')}
      ${dd('filtro-tipo', { pill: true, w: 156, right: true, clear: true })}
      ${dd('filtro-vend', { pill: true, w: 210, right: true, clear: true })}</div>`;

    if (!S.data.vendas.some((v) => !v.excluida)) {
      return `<div class="page">${head}<div class="card empty"><div class="ico">${ic('sacola', 'ic-24')}</div><h3>Nenhuma venda registrada ainda</h3>
        <p class="wrap">Cadastre a venda no balcão com o celular do cliente. O Retornei agenda o retorno e coloca o cliente aqui no dia certo.</p>
        <button class="btn primary lg" type="button" data-act="novo">${ic('plus', 'ic-16')}Registrar primeira venda</button></div></div>`;
    }

    const selecionaveis = lista.concat(feitos);
    if (!selecionaveis.some((x) => x.l.id === S.sel)) S.sel = lista.length ? lista[0].l.id : null;
    const sel = selecionaveis.find((x) => x.l.id === S.sel);

    const tipoCol = (x) => `<span class="c tp">${x.c.tipo === 'atacado' ? 'Atacado' : 'Varejo'}</span>`;
    const sub2 = (x, extra) => { const t = [x.c.tipo === 'atacado' ? subCli(x.c) : '', extra].filter(Boolean).join(' · '); return t ? `<span>${esc(t)}</span>` : ''; };
    const av = (x) => `<span class="avatar web-av" data-nome="${esc(nomeCli(x.c))}" data-tom="${tomDe(nomeCli(x.c))}">${esc(R.initials(nomeCli(x.c)))}</span>`; // WEB
    const linha = (x) => `<div class="trow g-fila click${x.l.id === S.sel ? ' sel' : ''}" data-act="sel" data-id="${x.l.id}">${av(x)}
        <div class="name"><b>${esc(nomeCli(x.c))}</b>${sub2(x, S.pulados.includes(x.l.id) ? 'pulado' : '')}</div>${tipoCol(x)}
        <span class="c opt">${esc(R.formatPhone(x.c.celular))}</span>
        <span class="c">${esc(R.formatDate(x.v.data, 'curta'))} · ${x.l.tentativa ? '2ª tentativa' : `${x.l.dias} dias`}</span>
        <span class="c val">${esc(R.formatMoney(x.v.valor))}</span>
        <span class="c opt">${esc(vendNome(x.v.vendedorId))}</span>
        ${dotSt(x)}
        <button type="button" class="round wa" data-act="wa" data-id="${x.l.id}" title="Chamar no WhatsApp" aria-label="Chamar ${esc(nomeCli(x.c))} no WhatsApp">${WA()}</button></div>`;
    const feito = (x) => `<div class="trow g-fila done click${x.l.id === S.sel ? ' sel' : ''}" data-act="sel" data-id="${x.l.id}">${av(x)}
        <div class="name"><b>${esc(nomeCli(x.c))}</b>${sub2(x, '')}</div>${tipoCol(x)}
        <span class="c opt">${esc(R.formatPhone(x.c.celular))}</span><span class="c">${esc(R.formatDate(x.v.data, 'curta'))} · ${x.l.dias} dias</span><span class="c val">${esc(R.formatMoney(x.v.valor))}</span><span class="c opt">${esc(vendNome((retornoDo(x.l.id) || x.v).vendedorId))}</span>
        ${dotSt(x)}
        ${retornoDo(x.l.id) ? (ehAdmin() ? `<span class="acoes-v"><button type="button" class="round" data-act="venda-editar" data-id="${retornoDo(x.l.id).id}" title="Editar compra" aria-label="Editar compra">${ic('editar', 'ic-16')}</button><button type="button" class="round del" data-act="venda-excluir" data-id="${retornoDo(x.l.id).id}" title="Excluir compra" aria-label="Excluir compra">${ic('lixo', 'ic-16')}</button></span>` : '<span></span>') : '<span></span>'}</div>`;

    const thead = `<div class="thead g-fila"><span>Cliente</span><span class="tp">Tipo</span><span class="opt">Celular</span><span>Compra</span><span class="val">Valor</span><span class="opt">Vendedor</span><span>Situação</span><span></span></div>`;
    let corpo;
    if (lista.length) {
      corpo = `${thead}<section class="card" aria-label="Fila">${lista.map(linha).join('')}</section>`;
    } else {
      const prox = todos.filter((x) => x.st === 'agendado').sort(porData)[0];
      corpo = `<div class="card empty"><div class="ico marca">${marcaVazia(!!feitos.length)}</div><h3>${feitos.length ? 'Fila zerada!' : 'Ninguém para chamar hoje'}</h3>
        <p class="wrap">${feitos.length ? `Você falou com ${plural(feitos.length, 'cliente', 'clientes')} hoje. ` : ''}${prox ? `Próximo contato ${esc(R.relativeDay(prox.l.data, S.today))}, em ${esc(R.formatDate(prox.l.data, 'curta'))}.` : 'Não há contatos agendados.'}</p>
        ${prox && S.periodo === 'hoje' ? '<button class="btn" type="button" data-act="periodo" data-v="semana">Ver a semana</button>' : ''}</div>`;
    }
    const blocoFeitos = feitos.length ? `<span class="sec-title">Feitos hoje · ${feitos.length} de ${feitos.length + pend.length}</span><section class="card${ehAdmin() && feitos.some((x) => retornoDo(x.l.id)) ? ' com-acoes' : ''}" aria-label="Feitos hoje">${feitos.map(feito).join('')}</section>` : '';

    let detalhe = '';
    if (sel) {
      const s = stInfo(sel);
      if (sel.st === 'contatado' && !sel.l.resultado && !retornoDo(sel.l.id) && sel.l.contatadoEm && R.localDay(sel.l.contatadoEm) === S.today) { s.txt = `Feito hoje às ${s.sub}`; s.sub = ''; }
      const diasCompra = R.diffDays(sel.v.data, S.today);
      const sub = [R.formatPhone(sel.c.celular), subCli(sel.c)].filter(Boolean).join(' · ');
      const naFila = pend.some((x) => x.l.id === sel.l.id);
      detalhe = `<aside class="card detail" aria-label="Cliente selecionado">
        <div class="det-topo"><button type="button" class="round det-fechar" data-act="det-fechar" aria-label="Voltar">${ic('voltar')}</button><span>${esc(s.txt)}</span></div>
        <div class="who"><span class="avatar lg" data-nome="${esc(nomeCli(sel.c))}" data-tom="${tomDe(nomeCli(sel.c))}">${esc(R.initials(nomeCli(sel.c)))}</span>
          <div style="display:flex;flex-direction:column;gap: var(--sp-1);min-width:0;max-width:100%"><h2 class="ell">${esc(nomeCli(sel.c))}</h2><span class="small muted">${esc(sub)}</span><button class="link blue ver-ficha" type="button" data-act="cliente" data-id="${sel.c.id}">${ic('clientes', 'ic-16')}Histórico do cliente</button></div>
          <span class="dot-st"><span class="dot ${s.cor}"></span>${esc(s.txt)}${s.sub ? `<span class="s">· ${esc(s.sub)}</span>` : ''}${sel.st === 'contatado' && !retornoDo(sel.l.id) ? `<button class="link st-desf" type="button" data-act="desfazer" data-id="${sel.l.id}">${ic('desfazer', 'ic-14')}Desfazer</button>` : ''}</span></div>
        <dl class="facts"><div><dt>Comprou</dt><dd>${esc(R.formatMoney(sel.v.valor))}</dd></div><div><dt>Quando</dt><dd>${esc(R.formatDate(sel.v.data, 'curta'))} · há ${plural(diasCompra, 'dia', 'dias')}</dd></div><div><dt>Lembrete</dt><dd>${sel.l.dias} dias após</dd></div><div><dt>Vendedor</dt><dd>${esc(vendNome(sel.v.vendedorId))}</dd></div></dl>
        ${sel.st === 'contatado' ? (retornoDo(sel.l.id) ? '' : comoFoi(sel)) + '</aside>' : ''}${sel.st === 'contatado' ? '' : `<div class="field"><label for="fila-msg">Mensagem</label><textarea class="textarea" id="fila-msg" data-lid="${sel.l.id}" rows="5">${esc(mensagemDe(sel))}</textarea></div>
        <button class="btn wa lg" type="button" data-act="wa" data-id="${sel.l.id}">${WA(true)}Enviar no WhatsApp</button>
        <div class="detail-acts"><button class="link blue" type="button" data-act="feito" data-id="${sel.l.id}">${ic('check', 'ic-16')}Já falei</button>
          <button class="link" type="button" data-act="adiar" data-id="${sel.l.id}">${ic('clock', 'ic-16')}Amanhã</button>
          ${naFila ? `<button class="link" type="button" data-act="pular" data-id="${sel.l.id}" ${pend.length < 2 ? 'disabled' : ''}>${ic('pular', 'ic-16')}Pular</button>` : ''}</div>
        <p class="xs muted" style="text-align:center">Ao enviar, o contato fica marcado como feito. Dá para desfazer.</p></aside>`}`;
    }
    return `<div class="page">${head}<div class="hoje-grid${S.det && sel ? ' det' : ''}"><div class="list">${corpo}${blocoFeitos}</div>${S.det && sel ? '<div class="det-scrim" data-act="det-fechar"></div>' : ''}${detalhe}</div></div>`;
  }

  // ============================================================ PEDIDOS

  const ABERTAS = ['esperando', 'chegou', 'avisado'];

  function viewEncomendas() {
    const { cli } = maps();
    const q = busca('encomendas');
    const todas = S.data.encomendas.filter((e) => {
      const c = cli.get(e.clienteId);
      return c && !c.excluido && casa(q, `${e.produto} ${nomeCli(c)} ${c.nome} ${c.empresa || ''}`, c.celular);
    });
    const abertas = todas.filter((e) => ABERTAS.includes(e.status));
    const encerradas = todas.filter((e) => !ABERTAS.includes(e.status));
    const grupos = new Map();
    for (const e of abertas) {
      const k = R.keyOf(e.produto);
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(e);
    }
    const lista = [...grupos.values()].map((items) => {
      items.sort((a, b) => (a.criadoEm < b.criadoEm ? -1 : 1));
      return { produto: items[items.length - 1].produto, items, chegou: items.filter((e) => e.status !== 'esperando'), esperando: items.filter((e) => e.status === 'esperando') };
    });
    lista.sort((a, b) => (b.chegou.length > 0) - (a.chegou.length > 0) || b.items.length - a.items.length || a.produto.localeCompare(b.produto));
    const esperando = abertas.filter((e) => e.status === 'esperando');
    const velhos = esperando.filter((e) => R.diffDays(R.localDay(e.criadoEm), S.today) > 30).length;

    const head = `<div class="page-head"><div class="t"><h1>Pedidos</h1><span class="sub">${plural(new Set(esperando.map((e) => e.clienteId)).size, 'cliente esperando', 'clientes esperando')} · ${plural(lista.filter((g) => g.esperando.length).length, 'produto', 'produtos')}</span></div><div class="grow"></div>
      ${pills([['abertas', `Abertos · ${abertas.length}`], ['encerradas', `Encerrados · ${encerradas.length}`]], S.encTab, 'enc-tab', 'Situação')}
      <button class="btn" type="button" data-act="novo-aviso">${ic('sino', 'ic-16')}Avisar quando chegar</button></div>`;

    if (S.encTab === 'encerradas') {
      const rows = encerradas.sort((a, b) => (a.encerradoEm < b.encerradoEm ? 1 : -1)).slice(0, 300);
      return `<div class="page">${head}${rows.length ? `<section class="card">${rows.map((e) => {
        const c = cli.get(e.clienteId);
        return `<div class="erow"><div class="meta"><b>${esc(nomeCli(c))} · ${esc(e.produto)}</b><span>Pediu em ${esc(R.formatDate(R.localDay(e.criadoEm), 'curta'))} · encerrado em ${esc(R.formatDate(R.localDay(e.encerradoEm), 'curta'))} · ${esc(R.firstName(vendNome(e.vendedorId)))}</span></div>
          <span class="dot-st"><span class="dot ${e.status === 'comprou' ? 'green' : ''}"></span>${e.status === 'comprou' ? 'Comprou' : 'Desistiu'}</span><button class="link blue" type="button" data-act="enc-reabrir" data-id="${e.id}" style="margin-left: var(--sp-3)">Reabrir</button></div>`;
      }).join('')}</section>` : '<div class="card empty"><p>Nenhum pedido encerrado ainda.</p></div>'}</div>`;
    }

    if (!lista.length) {
      return `<div class="page">${head}<div class="card empty"><div class="ico">${ic('pedidos', 'ic-24')}</div><h3>${q ? 'Nada encontrado' : 'Nenhum cliente esperando produto'}</h3>
        <p class="wrap">Quando um cliente pedir algo que está em falta, cadastre em "Avisar quando chegar". Quando o produto chegar, você avisa todos de uma vez.</p>
        <button class="btn primary lg" type="button" data-act="novo-aviso">${ic('sino', 'ic-16')}Avisar quando chegar</button></div></div>`;
    }

    const grupo = (g) => {
      const qtd = g.items.reduce((s, e) => s + (e.quantidade || 1), 0);
      const avisados = g.items.filter((e) => e.status === 'avisado').length;
      const quando = g.chegou.length ? g.chegou.map((e) => e.chegouEm).sort()[0] : null;
      const right = g.esperando.length
        ? `<button class="btn ${g.chegou.length ? '' : 'primary'}" type="button" data-act="enc-chegou" data-produto="${esc(g.produto)}">${ic('check', 'ic-16')}Chegou</button>`
        : `<span class="dot-st"><span class="dot green"></span>Chegou<span class="s">· ${esc(R.relativeDay(R.localDay(quando), S.today))}</span></span>`;
      return `<section class="card"><div class="enc-head"><div style="display:flex;flex-direction:column;gap: var(--sp-1);min-width:0"><h2 class="ell">${esc(g.produto)}</h2>
        <span class="xs muted">${plural(g.items.length, 'cliente', 'clientes')} · ${qtd} un.${avisados ? ` · ${plural(avisados, 'avisado', 'avisados')}` : ''}</span></div>${right}</div>
        ${g.items.map((e) => erow(e, cli.get(e.clienteId))).join('')}</section>`;
    };
    return `<div class="page">${head}${velhos ? `<div class="alert">${ic('alerta', 'ic-16')}<span class="wrap">${plural(velhos, 'pedido espera', 'pedidos esperam')} há mais de 30 dias. Vale confirmar se o cliente ainda quer.</span></div>` : ''}
      <div class="enc-grid">${lista.map(grupo).join('')}</div></div>`;
  }

  function erow(e, c) {
    const dias = R.diffDays(R.localDay(e.criadoEm), S.today);
    const sub = `Pediu ${dias === 0 ? 'hoje' : `em ${R.formatDate(R.localDay(e.criadoEm), 'curta')}`} · ${R.firstName(vendNome(e.vendedorId))}${e.obs ? ` · ${e.obs}` : ''}`;
    let acts;
    if (e.status === 'esperando') {
      acts = `${dias > 30 ? `<span class="dot-st"><span class="dot red"></span>há ${dias} dias</span>` : '<span class="dot-st"><span class="dot"></span>Esperando</span>'}<button class="round" type="button" data-act="enc-desistiu" data-id="${e.id}" title="Cliente desistiu" aria-label="Cliente desistiu">${ic('x', 'ic-16')}</button>`;
    } else if (e.status === 'chegou') {
      acts = `<button class="round" type="button" data-act="enc-avisado" data-id="${e.id}" title="Já avisei" aria-label="Já avisei">${ic('check', 'ic-16')}</button><button class="btn wa" type="button" data-act="enc-wa" data-id="${e.id}">${WA()}Avisar</button>`;
    } else {
      acts = `<span class="dot-st"><span class="dot blue"></span>Avisado<span class="s">· ${esc(R.relativeDay(R.localDay(e.avisadoEm), S.today))}</span></span><button class="btn" type="button" data-act="enc-comprou" data-id="${e.id}">Comprou</button><button class="link" type="button" data-act="enc-desistiu" data-id="${e.id}">Desistiu</button>`;
    }
    return `<div class="erow"><div class="meta"><b>${esc(nomeCli(c))}${e.quantidade > 1 ? ` · ${e.quantidade} un.` : ''}</b><span>${esc(sub)}</span></div>${acts}</div>`;
  }

  // ============================================================ CLIENTES

  function resumoClientes() {
    const r = new Map();
    for (const c of S.data.clientes) if (!c.excluido) r.set(c.id, { c, n: 0, total: 0, ultima: '', prox: null, enc: 0, vend: '' });
    for (const v of S.data.vendas.slice().sort((a, b) => (a.data < b.data ? -1 : 1))) {
      const o = r.get(v.clienteId);
      if (!o || v.excluida) continue;
      o.n++;
      o.total += Number(v.valor) || 0;
      o.ultima = v.data;
      o.vend = v.vendedorId;
    }
    for (const o of r.values()) if (o.c.ultimaCompra && (!o.ultima || o.c.ultimaCompra > o.ultima)) o.ultima = o.c.ultimaCompra;
    for (const x of itens()) {
      const o = r.get(x.c.id);
      if (!o || !['atrasado', 'hoje', 'agendado'].includes(x.st)) continue;
      if (!o.prox || x.l.data < o.prox.l.data) o.prox = x;
    }
    for (const e of S.data.encomendas) {
      const o = r.get(e.clienteId);
      if (o && ABERTAS.includes(e.status)) {
        o.enc++;
        if (!o.vend) o.vend = e.vendedorId;
      }
    }
    return [...r.values()];
  }

  const CK = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  const CK_MEIO = '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="6" y1="12" x2="18" y2="12"/></svg>';

  function listaClientes() {
    const todos = resumoClientes();
    const q = busca('clientes');
    const lista = todos
      .filter((o) => !S.buscaTipo || o.c.tipo === S.buscaTipo)
      .filter((o) => !S.origem || (S.origem === 'planilha' ? o.c.origem === 'planilha' : o.c.origem !== 'planilha'))
      .filter((o) => {
        o.nota = null; o.notaPeso = 0;
        if (casa(q, `${o.c.nome} ${o.c.empresa || ''} ${o.c.fantasia || ''}`, o.c.celular)) return true;
        // nº da nota ou do cupom, a partir de 1 número (sem os zeros da frente): guarda a compra que bateu para mostrar
        // na linha — primeiro a nota exata, depois a que começa com o número, depois a que o contém; empate, a mais nova
        const qn = R.keyOf(q).replace(/^0+/, '');
        if (!qn) return false;
        const peso = (v) => { const k = R.keyOf(v.cupom).replace(/^0+/, ''); return k === qn ? 3 : k.startsWith(qn) ? 2 : k.includes(qn) ? 1 : 0; };
        o.nota = S.data.vendas.filter((v) => v.clienteId === o.c.id && !v.excluida && peso(v))
          .sort((a, b) => peso(b) - peso(a) || (a.data < b.data ? 1 : -1))[0] || null;
        o.notaPeso = o.nota ? peso(o.nota) : 0;
        return !!o.nota;
      })
      // nota exata primeiro; o resto em ordem de nome
      .sort((a, b) => (b.notaPeso || 0) - (a.notaPeso || 0) || nomeCli(a.c).localeCompare(nomeCli(b.c)));
    return { todos, lista };
  }

  function viewClientes() {
    const { todos, lista } = listaClientes();
    // a seleção vale só para quem está na lista (filtro e busca)
    const visiveis = new Set(lista.map((o) => o.c.id));
    for (const id of [...S.selCli]) if (!visiveis.has(id)) S.selCli.delete(id);
    const nSel = S.selCli.size;
    const todosSel = nSel > 0 && nSel === lista.length;
    const nAt = todos.filter((o) => o.c.tipo === 'atacado').length;
    const nImp = todos.filter((o) => o.c.origem === 'planilha').length;
    const caixa = (on, meio, act, id, label) => `<button type="button" class="ck${on || meio ? ' on' : ''}" data-act="${act}" ${id ? `data-id="${id}"` : ''} role="checkbox" aria-checked="${meio ? 'mixed' : on}" aria-label="${esc(label)}">${on ? CK : meio ? CK_MEIO : ''}</button>`;
    const rows = lista.slice(0, 400).map((o) => {
      const on = S.selCli.has(o.c.id);
      return `<div class="trow g-cli click${o.c.id === S.clienteId ? ' sel' : ''}${on ? ' marcado' : ''}" data-act="cliente" data-id="${o.c.id}">
      ${caixa(on, false, 'cli-ck', o.c.id, `Selecionar ${nomeCli(o.c)}`)}
      <div class="name"><b>${esc(nomeCli(o.c))}</b>${o.nota ? `<span class="nota-achada">${esc(notaTxt(o.nota).replace(/^cupom/, 'Cupom').replace(' · nº', ' nº'))} · ${esc(R.formatDate(o.nota.data, 'curta'))}</span>` : subCli(o.c) ? `<span>${esc(subCli(o.c))}</span>` : ''}</div>
      <span class="c">${esc(R.formatPhone(o.c.celular))}</span>
      <span class="c opt">${o.c.tipo === 'atacado' ? 'Atacado' : 'Varejo'}</span>
      <span class="c opt">${o.ultima ? esc(R.formatDate(o.ultima)) : '—'}</span>
      <span class="c">${o.n ? `${esc(R.formatMoney(o.total))}${o.n > 1 ? ` · ${o.n}x` : ''}` : '—'}</span>
      ${o.prox ? dotSt(o.prox, true) : o.enc ? `<span class="dot-st"><span class="dot"></span>${plural(o.enc, 'pedido aberto', 'pedidos abertos')}</span>` : '<span class="c">—</span>'}
      <span class="c opt">${o.vend ? esc(vendNome(o.vend)) : '—'}</span></div>`;
    }).join('');
    const sub = S.origem === 'planilha' ? `${nImp} importados da planilha · ${todos.length} no total` : `${todos.length} no total · ${todos.length - nAt} varejo · ${nAt} atacado`;
    const head = `<div class="page-head"><div class="t"><h1>Clientes</h1><span class="sub">${sub}</span></div><div class="grow"></div>
      <button class="btn pill-btn" type="button" data-act="importar-planilha">${ic('subir', 'ic-16')}Importar planilha</button>
      ${nImp ? dd('cli-origem', { pill: true, w: 220, right: true }) : ''}
      ${pills([['', 'Todos'], ['varejo', 'Varejo'], ['atacado', 'Atacado']], S.buscaTipo, 'cli-tipo', 'Tipo')}</div>`;
    const barra = nSel ? `<div class="selbar" role="toolbar" aria-label="Clientes selecionados">
      <button type="button" class="x" data-act="sel-limpar" title="Limpar seleção (Esc)" aria-label="Limpar seleção">${ic('x', 'ic-16')}</button>
      <b>${todosSel ? `Todos os ${lista.length} da lista selecionados` : plural(nSel, 'selecionado', 'selecionados')}</b><span class="sep"></span>
      ${todosSel ? '' : `<button type="button" class="lk" data-act="sel-todos">Selecionar os ${lista.length} da lista</button>`}
      <button type="button" class="lk fraco" data-act="sel-limpar">Limpar seleção</button>
      <button type="button" class="del" data-act="sel-excluir">${ic('lixo', 'ic-16')}${todosSel && nSel > 1 ? `Excluir todos os ${nSel}` : `Excluir ${plural(nSel, 'cliente', 'clientes')}`}</button></div>` : '';
    if (!lista.length) {
      return `<div class="page">${head}<div class="card empty"><div class="ico">${ic('clientes', 'ic-24')}</div><h3>${todos.length ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}</h3><p class="wrap">${todos.length ? 'Tente outro nome, parte do celular, o nº da nota ou outro filtro.' : 'Os clientes aparecem aqui quando você registra uma venda ou um pedido. Se a loja já tem uma lista, dá para trazer de uma planilha.'}</p>${todos.length ? '' : `<button class="btn" type="button" data-act="importar-planilha">${ic('subir', 'ic-16')}Importar planilha</button>`}</div></div>`;
    }
    return `<div class="page">${head}${barra}<div style="display:flex;flex-direction:column">
      <div class="thead g-cli">${caixa(todosSel, nSel > 0 && !todosSel, 'cli-ck-todos', '', todosSel ? 'Desmarcar todos' : 'Selecionar todos da lista')}<span>Cliente</span><span>Celular</span><span class="opt">Tipo</span><span class="opt">Última compra</span><span>Total</span><span>Próximo contato</span><span class="opt">Vendedor</span></div>
      <section class="card" aria-label="Lista de clientes">${rows}</section>
      ${lista.length > 400 ? '<span class="sec-title">Mostrando os 400 primeiros. Use a busca para achar os outros. "Selecionar os da lista" pega todos, inclusive os não mostrados.</span>' : ''}</div></div>`;
  }

  async function excluirSelecionados() {
    const ids = [...S.selCli];
    if (!ids.length) return;
    const set = new Set(ids);
    const vendas = S.data.vendas.filter((v) => set.has(v.clienteId) && !v.excluida).length;
    const retornos = S.data.lembretes.filter((l) => set.has(l.clienteId) && l.status === 'pendente').length;
    const n = ids.length;
    const titulo = n === 1 ? `Excluir ${nomeCli(maps().cli.get(ids[0]))}?` : `Excluir ${n} clientes?`;
    const ok = await confirmar({
      titulo, perigo: true, ok: 'Excluir',
      texto: vendas || retornos ? 'As vendas e os retornos agendados também saem.' : '',
    });
    if (!ok) return;
    const r = await api.acao('excluirClientes', { ids });
    if (!r.ok) { toast(r.error, { erro: true }); return; }
    S.selCli.clear();
    if (set.has(S.clienteId)) { S.clienteId = null; S.cliEdit = null; }
    S.data = r.data.estado;
    render();
    const lote = r.data.lote;
    toast(`${plural(r.data.clientes, 'cliente excluído', 'clientes excluídos')}.`, { acao: 'Desfazer', fn: () => act('restaurarLote', { lote }, { toast: 'Cliente restaurado.' }), ms: 10000 });
  }

  // ---------------------------------------------------------------- gaveta do cliente

  function abrirCliente(id) {
    S.clienteId = id;
    S.drawerFx = true;
    const c = maps().cli.get(id);
    S.cliEdit = c ? { tipo: c.tipo, nome: c.nome, celular: R.formatPhone(c.celular), empresa: c.empresa, fantasia: c.fantasia || '', cnpj: R.formatDoc(c.cnpj, c.docTipo), docTipo: R.docTipoDe(c.docTipo), erros: {} } : null;
    render();
  }
  function fecharCliente() {
    S.clienteId = null;
    S.cliEdit = null;
    render();
  }

  function renderDrawer() {
    const root = $('#drawer-root');
    const c = S.clienteId && maps().cli.get(S.clienteId);
    if (!c || c.excluido) {
      S.clienteId = null;
      patch(root, '');
      return;
    }
    const fx = S.drawerFx;
    S.drawerFx = false;
    const E = S.cliEdit;
    const vendas = S.data.vendas.filter((v) => v.clienteId === c.id && !v.excluida).sort((a, b) => (a.data < b.data ? 1 : -1));
    const lems = itens().filter((x) => x.c.id === c.id && x.st !== 'cancelado').sort(porData);
    const encs = S.data.encomendas.filter((e) => e.clienteId === c.id).sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
    const total = vendas.reduce((s, v) => s + (Number(v.valor) || 0), 0);
    const err = (k) => `<span class="err">${esc(E.erros[k] || '')}</span>`;
    const inv = (k) => (E.erros[k] ? 'aria-invalid="true"' : '');
    const encSt = { esperando: ['', 'Esperando'], chegou: ['blue', 'Chegou, falta avisar'], avisado: ['blue', 'Avisado'], comprou: ['green', 'Comprou'], desistiu: ['', 'Desistiu'] };
    patch(root, `<div class="overlay drawer-overlay${fx ? ' fx' : ''}" data-act="drawer-fora"><aside class="drawer${fx ? ' fx' : ''}" role="dialog" aria-modal="true" aria-labelledby="dr-t">
      <div class="dh"><span class="avatar lg" data-nome="${esc(nomeCli(c))}" data-tom="${tomDe(nomeCli(c))}">${esc(R.initials(nomeCli(c)))}</span><div style="flex:1;min-width:0;display:flex;flex-direction:column"><h2 id="dr-t" class="ell">${esc(nomeCli(c))}</h2><span class="small muted ell">${esc(R.formatPhone(c.celular))}${subCli(c) ? ` · ${esc(subCli(c))}` : ''} · ${c.tipo === 'atacado' ? 'Atacado' : 'Varejo'}</span></div>
        <button class="round" type="button" data-act="drawer-fechar" aria-label="Fechar" title="Fechar (Esc)">${ic('x', 'ic-20')}</button></div>
      <div class="db">
        <div class="ficha-acoes"><button class="btn wa" type="button" data-act="cli-wa">${WA()}Abrir conversa</button><button class="btn" type="button" data-act="cli-venda">${ic('sacola', 'ic-16')}Nova venda</button><button class="btn" type="button" data-act="cli-aviso">${ic('sino', 'ic-16')}Avisar quando chegar</button></div>
        <div class="kv"><div><span class="k">Compras</span><span class="v">${vendas.length}</span></div><div><span class="k">Total</span><span class="v">${esc(R.formatMoney(total))}</span></div><div><span class="k">Cliente desde</span><span class="v">${esc(R.formatDate(vendas.length ? vendas.reduce((m, v) => (v.data < m ? v.data : m), vendas[0].data) : R.localDay(c.criadoEm)))}</span></div></div>

        <section class="sec"><h3>Próximos contatos</h3>${lems.length ? `<div class="mini">${lems.map((x) => `<div class="li"><div class="meta"><b>${esc(R.formatDate(x.l.data))}</b><span>${x.l.tentativa ? `2ª tentativa · compra de ${esc(R.formatDate(x.v.data, 'curta'))}` : `${x.l.dias} dias após a compra de ${esc(R.formatDate(x.v.data, 'curta'))}`}</span></div>${dotSt(x, false)}
          ${x.st === 'contatado' ? `<button class="round" type="button" data-act="desfazer" data-id="${x.l.id}" title="Desfazer" aria-label="Desfazer">${ic('desfazer', 'ic-16')}</button>`
            : `<button class="round" type="button" data-act="feito" data-id="${x.l.id}" title="Já falei" aria-label="Já falei">${ic('check', 'ic-16')}</button><button class="round" type="button" data-act="lem-cancelar" data-id="${x.l.id}" title="Cancelar lembrete" aria-label="Cancelar lembrete">${ic('x', 'ic-16')}</button>`}</div>`).join('')}</div>` : '<span class="small muted">Nenhum contato marcado.</span>'}</section>

        <section class="sec"><h3>Compras</h3>${vendas.length ? `<div class="mini${vendas.some((v) => v.modelo) ? ' nf-lista' : ''}">${vendas.map((v) => `<div class="li">${v.modelo
          ? `<div class="meta nf-grid"><b>${esc(R.formatMoney(v.valor))}</b><span class="nf-l"><b class="nf-tag">${MODELO_NOME[v.modelo]}</b>nº ${esc(v.cupom)}</span><span>${esc(R.formatDate(v.data))}</span><span>${esc(vendNome(v.vendedorId))}${v.retornoDe ? ' · retorno' : ''}${v.obs ? ` · ${esc(v.obs)}` : ''}</span></div>`
          : `<div class="meta"><b>${esc(R.formatMoney(v.valor))} <span class="muted" style="font-size: var(--fs-12)">· cupom ${esc(v.cupom)}</span></b><span>${esc(R.formatDate(v.data))} · ${esc(vendNome(v.vendedorId))}${v.retornoDe ? ' · retorno' : ''}${v.obs ? ` · ${esc(v.obs)}` : ''}</span></div>`}${ehAdmin() ? `<button class="round" type="button" data-act="venda-editar" data-id="${v.id}" title="Editar venda" aria-label="Editar venda">${ic('editar', 'ic-16')}</button><button class="round" type="button" data-act="venda-excluir" data-id="${v.id}" title="Excluir venda" aria-label="Excluir venda">${ic('lixo', 'ic-16')}</button>` : ''}</div>`).join('')}</div>` : '<span class="small muted">Nenhuma compra registrada.</span>'}</section>

        ${encs.length ? `<section class="sec"><h3>Pedidos</h3><div class="mini">${encs.map((e) => `<div class="li"><div class="meta"><b class="ell">${esc(e.produto)}${e.quantidade > 1 ? ` · ${e.quantidade} un.` : ''}</b><span>Pediu em ${esc(R.formatDate(R.localDay(e.criadoEm), 'curta'))}</span></div><span class="dot-st"><span class="dot ${encSt[e.status][0]}"></span>${encSt[e.status][1]}</span></div>`).join('')}</div></section>` : ''}

        <form class="sec" data-form="cliente" novalidate><h3>Dados do cliente</h3>
          <div>${pills([['varejo', 'Varejo'], ['atacado', 'Atacado']], E.tipo, 'cli-edit-tipo', 'Tipo')}</div>
          ${E.tipo === 'atacado' ? `${campoDoc('ce', E.docTipo, E.cnpj, E.erros.cnpj, 'data-ce')}
            <div class="field"><label for="ce-empresa">${E.docTipo === 'cpf' ? 'Nome completo' : 'Razão social'}</label><input class="input" id="ce-empresa" data-ce="empresa" value="${esc(E.empresa)}" ${inv('empresa')}>${err('empresa')}</div>
            <div class="grid2"><div class="field"><label for="ce-fantasia">Nome fantasia (opcional)</label><input class="input" id="ce-fantasia" data-ce="fantasia" value="${esc(E.fantasia)}"></div><div class="field"><label for="ce-nome">Nome do contato</label><input class="input" id="ce-nome" data-ce="nome" value="${esc(E.nome)}"></div></div>`
            : `<div class="field"><label for="ce-nome">Nome</label><input class="input" id="ce-nome" data-ce="nome" value="${esc(E.nome)}" ${inv('nome')}>${err('nome')}</div>`}
          <div class="field"><label for="ce-cel">Celular</label><input class="input" id="ce-cel" data-ce="celular" value="${esc(E.celular)}" inputmode="tel" ${inv('celular')}>${err('celular')}</div>
          <div class="row" style="justify-content:space-between"><button class="btn ghost danger" type="button" data-act="cli-excluir">${ic('lixo', 'ic-16')}Excluir cliente</button><button class="btn primary" type="submit">Salvar alterações</button></div>
        </form></div></aside></div>`);
  }

  async function salvarCliente() {
    const E = S.cliEdit;
    const r = await api.acao('editarCliente', { id: S.clienteId, tipo: E.tipo, nome: E.nome, celular: E.celular, empresa: E.empresa, fantasia: E.fantasia, cnpj: E.cnpj, docTipo: E.docTipo });
    if (!r.ok) {
      E.erros = r.fields || {};
      renderDrawer();
      if (!r.fields) toast(r.error, { erro: true });
      return;
    }
    E.erros = {};
    S.data = r.data;
    render();
    toast('Dados do cliente salvos.');
  }

  // ============================================================ RELATÓRIOS

  const JANELA_RETORNO = 30; // dias depois do contato em que uma compra conta como retorno
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  function periodoRel() {
    const t = S.today;
    if (S.relPeriodo === 'semana') {
      const ini = R.addDays(t, -6);
      return { ini, fim: t, pIni: R.addDays(ini, -7), pFim: R.addDays(ini, -1), vs: 'vs. 7 dias antes', nome: 'Últimos 7 dias' };
    }
    if (S.relPeriodo === 'tri') {
      const ini = R.addDays(t, -89);
      return { ini, fim: t, pIni: R.addDays(ini, -90), pFim: R.addDays(ini, -1), vs: 'vs. 3 meses antes', nome: 'Últimos 3 meses' };
    }
    const ini = `${t.slice(0, 8)}01`;
    const d = R.parseISO(ini);
    const pd = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const pIni = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-01`;
    const ultimoDia = new Date(d.getFullYear(), d.getMonth(), 0).getDate();
    const n = Math.min(Number(t.slice(8)), ultimoDia);
    const pFim = `${pIni.slice(0, 8)}${String(n).padStart(2, '0')}`;
    return { ini, fim: t, pIni, pFim, vs: `vs. ${R.MESES[pd.getMonth()]} (mesmos dias)`, nome: `${cap(R.MESES[d.getMonth()])} de ${d.getFullYear()}` };
  }

  /** Contatos feitos entre ini e fim, e quem voltou a comprar depois de cada um. */
  function contatosEntre(ini, fim) {
    const vendasPorCli = new Map();
    for (const v of S.data.vendas) {
      if (v.excluida || !cliOk(v.clienteId)) continue;
      if (!vendasPorCli.has(v.clienteId)) vendasPorCli.set(v.clienteId, []);
      vendasPorCli.get(v.clienteId).push(v);
    }
    const usadas = new Set();
    const lista = [];
    const cs = itens()
      .filter((x) => x.st === 'contatado' && x.l.contatadoEm)
      .map((x) => ({ x, dia: R.localDay(x.l.contatadoEm) }))
      .filter((o) => o.dia >= ini && o.dia <= fim)
      .sort((a, b) => (a.x.l.contatadoEm < b.x.l.contatadoEm ? -1 : 1));
    for (const { x, dia } of cs) {
      const lim = R.addDays(dia, JANELA_RETORNO);
      const doCli = vendasPorCli.get(x.c.id) || [];
      const ligadas = doCli.filter((v) => v.retornoDe === x.l.id && !usadas.has(v.id));
      // vendas antigas, de antes do botão Comprou, contam pela janela de dias
      const antigas = doCli.filter((v) => !v.retornoDe && v.id !== x.v.id && !usadas.has(v.id) && v.data >= dia && v.data <= lim && v.criadoEm > x.l.contatadoEm);
      const volta = ligadas.length ? ligadas : antigas;
      volta.forEach((v) => usadas.add(v.id));
      lista.push({ x, dia, volta, conta: true, valor: volta.reduce((s, v) => s + (Number(v.valor) || 0), 0) });
    }
    if (!S.relVend) return lista;
    // filtro de vendedor: os contatos dos clientes dele e as vendas de retorno que ele fez
    return lista.map((o) => { const volta = o.volta.filter((v) => v.vendedorId === S.relVend); return { ...o, conta: o.x.v.vendedorId === S.relVend, volta, valor: volta.reduce((s, v) => s + (Number(v.valor) || 0), 0) }; })
      .filter((o) => o.conta || o.volta.length);
  }

  function somaRel(lista) {
    const voltaram = new Set(lista.filter((o) => o.volta.length).map((o) => o.x.c.id));
    // respondeu = comprou depois do contato ou marcou "Não comprou"
    const cont = lista.filter((o) => o.conta);
    const resp = cont.filter((o) => retornoDo(o.x.l.id) || o.x.l.resultado === 'nao_comprou').length;
    const comRes = cont.filter((o) => retornoDo(o.x.l.id) || o.x.l.resultado).length;
    return { resp, comRes, n: cont.length, clientes: new Set(cont.map((o) => o.x.c.id)).size, voltaram: voltaram.size, valor: lista.reduce((s, o) => s + o.valor, 0) };
  }

  function variacao(a, b) {
    if (!b) return '';
    const d = Math.round(((a - b) / b) * 100);
    return `<span class="delta ${d >= 0 ? 'up' : 'down'}">${ic(d >= 0 ? 'sobe' : 'desce', 'ic-14')}${d > 0 ? '+' : ''}${d}%</span>`;
  }

  function graficoRel(lista, p) {
    const semanal = S.relPeriodo === 'tri';
    const baldes = [];
    if (semanal) {
      for (let ini = p.ini; ini <= p.fim; ini = R.addDays(ini, 7)) baldes.push({ ini, fim: R.addDays(ini, 6), a: 0, r: 0 });
    } else {
      for (let d = p.ini; d <= p.fim; d = R.addDays(d, 1)) baldes.push({ ini: d, fim: d, a: 0, r: 0 });
    }
    for (const o of lista) {
      const b = baldes.find((x) => o.dia >= x.ini && o.dia <= x.fim);
      if (!b) continue;
      if (o.conta) b.a++;
      if (o.volta.length) b.r++;
    }
    for (const b of baldes) b.r = Math.min(b.r, b.a);
    {
    }
    const max = Math.max(4, ...baldes.map((b) => b.a));
    const passo = baldes.length > 20 ? 3 : baldes.length > 10 ? 2 : 1;
    const rot = (b) => (semanal ? R.formatDate(b.ini, 'curta').slice(0, 5) : String(Number(b.ini.slice(8))));
    const dica = (b) => `${semanal ? `Semana de ${R.formatDate(b.ini, 'curta')}` : cap(R.formatDate(b.ini, 'curta'))} · ${plural(b.a, 'contato', 'contatos')} · ${b.r} ${b.r === 1 ? 'voltou' : 'voltaram'}`;
    return `<section class="card rel-chart" aria-label="Contatos por ${semanal ? 'semana' : 'dia'}">
      <div class="rel-h"><h2>Contatos por ${semanal ? 'semana' : 'dia'}</h2><span class="legenda"><span><i class="sw a"></i>Contatos feitos</span><span><i class="sw r"></i>Voltaram a comprar</span></span></div>
      <div class="bars">${baldes.map((b) => `<div class="bar" tabindex="0" aria-label="${esc(dica(b))}"><div class="b a" style="height:${(b.a / max) * 100}%"><div class="b r" style="height:${b.a ? (b.r / b.a) * 100 : 0}%"></div></div><span class="tip">${esc(dica(b))}</span></div>`).join('')}</div>
      <div class="eixo">${baldes.map((b, i) => `<span>${i % passo === 0 ? esc(rot(b)) : ''}</span>`).join('')}</div></section>`;
  }

  function botoesRel() {
    if (!naNuvem() && !api.pdf) return '';
    if (!ehAdmin()) return `<button class="locked no-print" type="button" data-act="rel-pdf" title="Só administrador">${ic('cadeado', 'ic-16')}Exportar PDF</button>`;
    return `<span class="row no-print" style="gap: var(--sp-2)"><button class="btn" type="button" data-act="rel-imprimir" style="height: 40px;border-radius: var(--r-full)">${ic('imprimir', 'ic-16')}Imprimir</button><button class="btn primary" type="button" data-act="rel-pdf" style="height: 40px;border-radius: var(--r-full)">${ic('pdf', 'ic-16')}Exportar PDF</button></span>`;
  }

  function viewRelatorios() {
    const p = periodoRel();
    const lista = contatosEntre(p.ini, p.fim);
    const atual = somaRel(lista);
    const ant = somaRel(contatosEntre(p.pIni, p.pFim));
    const encs = S.data.encomendas.filter((e) => {
      if (!cliOk(e.clienteId)) return false;
      const d = R.localDay(e.criadoEm);
      return d >= p.ini && d <= p.fim && (!S.relVend || e.vendedorId === S.relVend);
    });
    const comprou = encs.filter((e) => e.status === 'comprou').length;
    const desistiu = encs.filter((e) => e.status === 'desistiu').length;
    const abertas = encs.length - comprou - desistiu;

    const head = `<p class="so-impressao small l2">${esc(S.data.loja.nome)} · relatório gerado em ${esc(S.today.split("-").reverse().join("/"))}${S.relVend && maps().vend.get(S.relVend) ? ` · vendedor: ${esc(maps().vend.get(S.relVend).nome)}` : ''}</p><div class="page-head"><div class="t"><h1>Relatórios</h1><span class="sub">${esc(p.nome)}</span></div><div class="grow"></div>
      ${pills([['semana', 'Esta semana'], ['mes', 'Este mês'], ['tri', '3 meses']], S.relPeriodo, 'rel-periodo', 'Período')}
      ${dd('rel-vend', { pill: true, w: 210, right: true, clear: true })}${botoesRel()}</div>`;

    const algumDado = itens().some((x) => x.l.contatadoEm) || S.data.encomendas.some((e) => cliOk(e.clienteId));
    if (!algumDado) {
      return `<div class="page">${head}<div class="card empty"><div class="ico">${ic('relatorios', 'ic-24')}</div><h3>Ainda não há o que mostrar</h3>
        <p class="wrap">Os relatórios começam a aparecer quando a equipe faz os primeiros contatos pela tela Hoje.</p></div></div>`;
    }

    const kpi = (label, valor, sub) => `<div class="card kpi"><span class="k">${label}</span><span class="v">${valor}</span><span class="s">${sub}</span></div>`;
    const kpis = `<div class="kpis">
      ${kpi('Contatos feitos', atual.n, atual.comRes ? `<span class="delta neutro">${pct(atual.resp, atual.comRes)}%</span>responderam` : `${variacao(atual.n, ant.n)}${esc(ant.n ? p.vs : `${plural(atual.clientes, 'cliente', 'clientes')}`)}`)}
      ${kpi('Voltaram a comprar', atual.voltaram, `<span class="delta neutro">${pct(atual.voltaram, atual.clientes)}%</span>dos clientes chamados`)}
      ${kpi('Vendas de retorno', esc(R.formatMoney(atual.valor)), `${variacao(atual.valor, ant.valor)}${esc(ant.valor ? p.vs : 'compras depois do contato')}`)}
      ${kpi('Pedidos que viraram venda', comprou, encs.length ? `<span class="delta neutro">${pct(comprou, encs.length)}%</span>de ${plural(encs.length, 'pedido', 'pedidos')}` : 'nenhum pedido no período')}</div>`;

    // por vendedor
    const porV = new Map();
    const linhaV = (id) => { if (!porV.has(id)) porV.set(id, { n: 0, cli: new Set(), valor: 0, resp: 0 }); return porV.get(id); };
    for (const o of lista) {
      if (o.conta) {
        const r = linhaV(o.x.v.vendedorId);
        r.n++;
        if (retornoDo(o.x.l.id) || o.x.l.resultado === 'nao_comprou') r.resp++;
      }
      // a venda de retorno conta para quem atendeu
      for (const v of o.volta) { const r = linhaV(v.vendedorId); r.cli.add(o.x.c.id); r.valor += Number(v.valor) || 0; }
    }
    const linhasV = [...porV.entries()].sort((a, b) => b[1].n - a[1].n).map(([id, r]) => `<div class="rel-vrow"><span class="nm"><span class="avatar sm" data-nome="${esc(vendNome(id))}" data-tom="${tomDe(vendNome(id))}">${esc(R.initials(vendNome(id)))}</span><span class="ell">${esc(vendNome(id))}</span></span><span class="n">${r.n ? `${r.resp} de ${r.n}` : '—'}</span><span class="n">${r.cli.size}</span><span class="n strong">${esc(R.formatMoney(r.valor))}</span></div>`).join('');
    const vend = `<section class="card rel-vend"><div class="rel-h col"><h2>Por vendedor</h2><span class="xs muted">Quem respondeu, clientes que voltaram e vendas de retorno</span></div>
      ${linhasV ? `<div class="rel-vrow th"><span>Vendedor</span><span class="n">Responderam</span><span class="n">Voltaram</span><span class="n">Vendas</span></div>${linhasV}` : '<p class="small muted" style="padding: 0 var(--sp-6) var(--sp-6)">Nenhum contato feito no período.</p>'}</section>`;

    const barra = (t, n, tot, cor) => `<div class="rel-prog"><div class="row"><span>${t}</span><span class="muted">${n}${tot && t === 'Viraram venda' ? ` de ${tot}` : ''}</span></div><div class="trilha"><div class="${cor}" style="width:${pct(n, tot)}%"></div></div></div>`;
    const pedidos = `<section class="card rel-box"><h2>Pedidos de produtos em falta</h2>${encs.length ? barra('Viraram venda', comprou, encs.length, 'green') + barra('Ainda esperando', abertas, encs.length, 'gray') + barra('Desistiram', desistiu, encs.length, 'red') : '<p class="small muted">Nenhum pedido registrado no período.</p>'}</section>`;

    // atenção
    const atencao = [];
    const muitoAtras = itens().filter((x) => x.st === 'atrasado' && R.diffDays(x.l.data, S.today) > 3 && (!S.relVend || x.v.vendedorId === S.relVend)).length;
    if (muitoAtras) atencao.push(['red', `<b>${plural(muitoAtras, 'contato atrasado', 'contatos atrasados')}</b> há mais de 3 dias.`]);
    const velhos = S.data.encomendas.filter((e) => e.status === 'esperando' && cliOk(e.clienteId) && R.diffDays(R.localDay(e.criadoEm), S.today) > 30 && (!S.relVend || e.vendedorId === S.relVend)).length;
    if (velhos) atencao.push(['red', `<b>${plural(velhos, 'pedido espera', 'pedidos esperam')}</b> há mais de 30 dias.`]);
    const chegou = S.data.encomendas.filter((e) => e.status === 'chegou' && cliOk(e.clienteId) && (!S.relVend || e.vendedorId === S.relVend)).length;
    if (chegou) atencao.push(['blue', `<b>${plural(chegou, 'produto chegou', 'produtos chegaram')}</b> e falta avisar o cliente.`]);
    if (!S.relVend) {
      const parados = vendAtivos().filter((v) => !(porV.get(v.id) || {}).n);
      if (parados.length && lista.length) atencao.push(['gray', `${esc(parados.map((v) => R.firstName(v.nome)).join(', '))} ${parados.length === 1 ? 'não fez' : 'não fizeram'} contatos no período.`]);
    }
    const boxAt = `<section class="card rel-box"><h2>Atenção</h2>${atencao.length ? atencao.map(([cor, t]) => `<div class="rel-at ${cor}">${ic('alertaC', 'ic-16')}<span class="wrap">${t}</span></div>`).join('') : `<div class="rel-at green">${ic('feito', 'ic-16')}<span>Tudo em dia. Nenhum atraso grande.</span></div>`}</section>`;

    const vendasRet = lista.flatMap((o) => o.volta.map((v) => ({ v, o }))).sort((a, b) => (a.v.data < b.v.data ? 1 : a.v.data > b.v.data ? -1 : 0));
    const vrLinha = ({ v, o }) => `<div class="vr-li" data-act="cliente" data-id="${o.x.c.id}"><div class="vr-tx"><b class="ell">${esc(nomeCli(o.x.c))}</b><span class="ell">Chamado ${esc(R.formatDate(o.dia, 'curta'))} · comprou ${R.diffDays(o.dia, v.data) <= 0 ? 'no mesmo dia' : `${plural(R.diffDays(o.dia, v.data), 'dia', 'dias')} depois`}</span></div><span class="vr-vend"><span class="avatar sm" data-nome="${esc(vendNome(v.vendedorId))}" data-tom="${tomDe(vendNome(v.vendedorId))}">${esc(R.initials(vendNome(v.vendedorId)))}</span><span class="ell">${esc(R.firstName(vendNome(v.vendedorId)))}</span></span><span class="vr-val">${esc(R.formatMoney(v.valor))}${v.cupom ? `<small>${esc(notaTxt(v))}</small>` : ''}</span></div>`;
    const mostra = S.relTodas ? vendasRet : vendasRet.slice(0, 5);
    const secRet = `<section class="card vr"><div class="vr-h"><div><h2>Quem voltou a comprar</h2><span class="xs muted">${plural(vendasRet.length, 'venda de retorno', 'vendas de retorno')} no período</span></div><span class="vr-tot">${esc(R.formatMoney(atual.valor))}</span></div>
      ${vendasRet.length ? `<div class="vr-lista">${mostra.map(vrLinha).join('')}</div>${vendasRet.length > 5 ? `<button type="button" class="vr-mais" data-act="rel-todas">${S.relTodas ? 'Mostrar menos' : `Ver todas as ${vendasRet.length}`}${ic('chev', `ic-16${S.relTodas ? ' rot180' : ''}`)}</button>` : ''}` : '<p class="small muted" style="padding: 0 var(--sp-6) var(--sp-6)">Ninguém voltou a comprar no período ainda.</p>'}</section>`;
    return `<div class="page">${head}${kpis}<div class="rel-grid">${graficoRel(lista, p)}${vend}</div>${secRet}<div class="rel-grid2">${pedidos}${boxAt}</div>
      <p class="xs muted wrap">"Voltou a comprar" = o cliente fez uma nova compra até ${JANELA_RETORNO} dias depois do contato. Os contatos contam para o vendedor do cliente; a venda de retorno, para quem atendeu.</p></div>`;
  }

  // ============================================================ RESUMO DO DIA

  function textoResumo() {
    const f = R.filaDoDia(S.data, S.today);
    const nomes = (l) => (l.length > 6 ? `${l.slice(0, 6).join(', ')} e mais ${l.length - 6}` : l.join(', '));
    const ontem = R.addDays(S.today, -1);
    const feitosOntem = itens().filter((x) => x.l.contatadoEm && R.localDay(x.l.contatadoEm) === ontem).length;
    const d = R.parseISO(S.today);
    const linhas = [`*Retornei · Resumo de ${R.SEMANA[d.getDay()]}, ${R.formatDate(S.today, 'curta').slice(0, 5)}*`, ''];
    if (f.atrasados.length) linhas.push(`🔴 ${f.atrasados.length} ${f.atrasados.length === 1 ? 'atrasado' : 'atrasados'}: ${nomes(f.atrasados)}`);
    if (f.hoje.length) linhas.push(`🔵 ${f.hoje.length} para hoje: ${nomes(f.hoje)}`);
    if (f.chegou) linhas.push(`📦 ${f.chegou} ${f.chegou === 1 ? 'pedido chegou' : 'pedidos chegaram'} e falta avisar`);
    if (!f.atrasados.length && !f.hoje.length && !f.chegou) linhas.push('✅ Ninguém para chamar hoje');
    if (feitosOntem) linhas.push(`✅ Ontem: ${plural(feitosOntem, 'contato feito', 'contatos feitos')}`);
    return linhas.join('\n');
  }

  function abrirResumo() {
    RS = { zap: R.formatPhone(S.data.loja.whatsapp || ''), editarZap: !S.data.loja.whatsapp, erro: '' };
    renderResumo();
    if (RS.editarZap) focar('rs-zap');
  }
  function fecharResumo() {
    RS = null;
    renderResumo();
  }

  function renderResumo() {
    const root = $('#resumo-root');
    if (!RS) { patch(root, ''); return; }
    const cfg = S.data.config;
    const txt = textoResumo();
    const negrito = (t) => esc(t).replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
    const destino = RS.editarZap
      ? `<div class="field"><label for="rs-zap">WhatsApp da loja</label><input class="input" id="rs-zap" data-rs="zap" value="${esc(RS.zap)}" placeholder="(00) 00000-0000" inputmode="tel" autocomplete="off" ${RS.erro ? 'aria-invalid="true"' : ''}><span class="err">${esc(RS.erro)}</span><span class="xs muted">O número fica salvo em Ajustes › Loja.</span></div>`
      : `<span class="small l2 wrap">Vai para o WhatsApp da loja <b class="strong">${esc(R.formatPhone(S.data.loja.whatsapp))}</b>. Você confere e aperta enviar. <button class="link blue" type="button" data-act="rs-trocar" style="display:inline-flex;height:auto">Trocar número</button></span>`;
    patch(root, `<div class="overlay" data-act="rs-fora"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="rs-t" style="width:560px">
      <header><h2 id="rs-t">Resumo do dia</h2><button type="button" class="round" data-act="rs-fechar" aria-label="Fechar" title="Fechar (Esc)">${ic('x', 'ic-20')}</button></header>
      <form data-form="resumo" novalidate><div class="body" style="gap: var(--sp-4)">${destino}
        <div class="preview wrap" style="white-space:pre-wrap">${negrito(txt)}</div>
        ${api.web ? '' : `<label class="check"><input type="checkbox" data-act="rs-aviso" ${cfg.avisoAtivo ? 'checked' : ''}>Avisar no Windows todo dia às ${esc(cfg.avisoHora || '08:30')}</label>`}</div>
      <footer><span></span><div class="right"><button type="button" class="btn ghost" data-act="rs-fechar">Fechar</button><button type="submit" class="btn primary lg">${WA(true)}Abrir no WhatsApp</button></div></footer></form>
    </section></div>`);
  }

  async function enviarResumo() {
    let zap = S.data.loja.whatsapp;
    if (RS.editarZap) {
      const r = await api.acao('salvarLoja', { whatsapp: RS.zap });
      if (!r.ok) { RS.erro = (r.fields && r.fields.whatsapp) || r.error; renderResumo(); focar('rs-zap'); return; }
      S.data = r.data;
      zap = S.data.loja.whatsapp;
      if (!zap) { RS.erro = 'Informe o WhatsApp da loja.'; renderResumo(); focar('rs-zap'); return; }
      render();
    }
    if (await abrirWhats(zap, textoResumo())) fecharResumo();
  }

  // ============================================================ IMPORTAR PLANILHA

  function abrirImport() {
    const ativos = vendAtivos();
    const ult = ls.get('ultimoVendedor', '');
    I = { passo: 1, arq: null, mapa: [], conf: null, erro: '', salvando: false, passados: false, vendPadrao: ativos.some((v) => v.id === ult) ? ult : (ativos[0] || {}).id || '' };
    renderImport();
  }
  function fecharImport() {
    I = null;
    if (DD.open && DD.open.startsWith('imp-')) DD.open = null;
    renderImport();
  }

  async function escolherPlanilha() {
    const r = await api.planilha();
    if (!r.ok) { I.erro = r.error; renderImport(); return; }
    if (!r.data) return;
    I.arq = r.data;
    I.mapa = r.data.colunas.map((c) => R.adivinharCampo(c));
    // o mesmo campo não pode vir de duas colunas: fica a primeira
    const usados = new Set();
    I.mapa = I.mapa.map((m) => (m && usados.has(m) ? '' : (usados.add(m), m)));
    I.passo = 2;
    I.erro = '';
    I.conf = null;
    renderImport();
  }

  /** Linhas da planilha já ligadas aos campos, com o número da linha. */
  function linhasImport() {
    return I.arq.linhas.map((row, n) => {
      const o = { __linha: n + 2 };
      I.mapa.forEach((campo, i) => { if (campo) o[campo] = row[i]; });
      return o;
    });
  }

  /** O mesmo plano que o serviço usa para gravar: clientes, vendas, retornos e problemas. */
  function conferirImport() {
    if (!I.conf) I.conf = R.planoImport(linhasImport(), S.data, S.today, { vendedorPadrao: I.vendPadrao, incluirPassados: I.passados });
    return I.conf;
  }

  function renderImport() {
    const root = $('#import-root');
    if (!I) { patch(root, ''); return; }
    const passo = (n, t) => {
      const st = I.passo > n ? 'feito' : I.passo === n ? 'on' : '';
      return `<span class="imp-passo ${st}"><span class="bola">${st === 'feito' ? ic('check', 'ic-14') : n}</span>${t}</span>`;
    };
    const steps = `<div class="imp-steps">${passo(1, 'Arquivo')}<span class="tr${I.passo > 1 ? ' on' : ''}"></span>${passo(2, 'Colunas')}<span class="tr${I.passo > 2 ? ' on' : ''}"></span>${passo(3, 'Conferir')}</div>`;
    let corpo = '';
    let rodape = '';
    if (I.passo === 1) {
      corpo = `<div class="imp-drop"><span class="ico">${ic('arquivo', 'ic-24')}</span><b>Escolha a planilha de clientes</b>
          <span class="small muted wrap">Excel (.xlsx) ou .csv, com os títulos na primeira linha. Cada cliente precisa de nome e celular. Para trazer as vendas, inclua nº do cupom, data, valor e vendedor: uma linha por compra.</span>
          <button class="btn primary" type="button" data-act="imp-escolher">${ic('subir', 'ic-16')}Escolher planilha</button></div>
        ${I.erro ? `<div class="alert">${ic('alerta', 'ic-16')}<span class="wrap">${esc(I.erro)}</span></div>` : ''}`;
      rodape = '<span class="xs muted">Cada venda agenda os retornos com os prazos de Ajustes.</span><div class="right"><button type="button" class="btn ghost" data-act="imp-fechar">Cancelar</button></div>';
    } else {
      const c = conferirImport();
      const temCel = I.mapa.includes('celular');
      const caixa = (n, t, ruim) => `<div class="${ruim && n ? 'ruim' : ''}"><b>${n}</b><span>${t}</span></div>`;
      const caixas = `<div class="imp-caixas quatro">${caixa(c.novos, c.novos === 1 ? 'cliente novo' : 'clientes novos')}${caixa(c.existentes, `já ${c.existentes === 1 ? 'cadastrado' : 'cadastrados'}`)}${caixa(c.vendas.length, c.vendas.length === 1 ? 'venda' : 'vendas')}${caixa(c.problemas.length, 'com problema', true)}</div>`;
      const arq = `<div class="imp-arq">${ic('arquivo', 'ic-16')}<span class="grow ell">${esc(I.arq.nome)} <span class="muted">· ${plural(I.arq.total, 'linha', 'linhas')}${I.arq.cortada ? ' (só as 5.000 primeiras)' : ''}</span></span><button class="link blue" type="button" data-act="imp-escolher">Trocar arquivo</button></div>`;
      if (I.passo === 2) {
        const exemplo = (i) => { const r = I.arq.linhas.find((l) => String(l[i] || '').trim()); return r ? r[i] : ''; };
        corpo = `${arq}<div style="display:flex;flex-direction:column;gap: var(--sp-1)"><b class="medium">Ligue as colunas da planilha aos campos do Retornei</b><span class="xs muted">O Retornei já adivinhou pelo título das colunas. Confira e mude se precisar.</span></div>
          <div class="imp-map"><div class="th"><span>Coluna da planilha</span><span></span><span>Campo no Retornei</span></div>
          ${I.arq.colunas.map((col, i) => `<div class="tr2"><div class="col"><span class="ell">${esc(col)}</span><span class="xs muted ell">${exemplo(i) ? `ex.: ${esc(exemplo(i))}` : 'coluna vazia'}</span></div><span class="muted" style="display:flex">${ic('seta', 'ic-16')}</span>${dd(`imp-${i}`, { invalid: false })}</div>`).join('')}</div>
          ${temCel ? caixas : '<div class="alert">' + ic('alerta', 'ic-16') + '<span>Escolha qual coluna tem o celular. Sem ele não dá para chamar no WhatsApp.</span></div>'}`;
        rodape = `<span class="xs muted wrap">${c.problemas.length ? 'As linhas com problema ficam de fora. Você vê a lista no próximo passo.' : ''}</span><div class="right"><button type="button" class="btn ghost" data-act="imp-voltar">Voltar</button><button type="button" class="btn primary lg" data-act="imp-conferir" ${temCel && c.clientes.length ? '' : 'disabled'}>Conferir</button></div>`;
      } else {
        const temVendas = I.mapa.includes('cupom');
        const opcoes = temVendas ? `<div class="imp-opc">
            <div class="field"><label for="imp-vend">Vendas sem vendedor, ou com um nome que não está na Equipe, ficam com:</label>${dd('imp-vend', { w: 280 })}${c.semVendedor ? `<span class="xs muted">${plural(c.semVendedor, 'venda vai', 'vendas vão')} para esse vendedor.</span>` : ''}</div>
            <label class="check"><input type="checkbox" data-act="imp-passados" ${I.passados ? 'checked' : ''}>Incluir retornos que já passaram (entram na fila como atrasados)</label>
            <div class="alert info">${ic('clock', 'ic-16')}<span class="wrap">${c.retornos ? `${plural(c.vendas.length, 'venda agenda', 'vendas agendam')} <b>${plural(c.retornos, 'retorno', 'retornos')}</b>. O primeiro é ${esc(R.relativeDay(c.primeiro, S.today))}, em ${esc(R.formatDate(c.primeiro, 'curta'))}.` : 'Nenhum retorno a agendar: as datas de retorno dessas vendas já passaram.'}</span></div></div>` : '';
        corpo = `${arq}${caixas}${opcoes}${c.problemas.length ? `<div style="display:flex;flex-direction:column;gap: var(--sp-2)"><b class="medium">Linhas que ficam de fora</b><div class="imp-prob">${c.problemas.slice(0, 50).map((p) => `<div><span class="muted">Linha ${p.n}</span><span class="ell">${esc(p.quem)}</span><span class="err-t">${esc(p.erro)}</span></div>`).join('')}${c.problemas.length > 50 ? `<div><span class="muted">… e mais ${c.problemas.length - 50}</span></div>` : ''}</div><span class="xs muted">Corrija na planilha e importe de novo se quiser. Quem já entrou não é duplicado.</span></div>` : '<div class="alert info">' + ic('check', 'ic-16') + '<span>Todas as linhas estão certas.</span></div>'}`;
        const n = c.clientes.length;
        const txt = c.vendas.length ? `Importar ${plural(n, 'cliente', 'clientes')} e ${plural(c.vendas.length, 'venda', 'vendas')}` : `Importar ${plural(n, 'cliente', 'clientes')}`;
        rodape = `<span></span><div class="right"><button type="button" class="btn ghost" data-act="imp-voltar">Voltar</button><button type="button" class="btn primary lg" data-act="imp-importar" ${I.salvando || !n ? 'disabled' : ''}>${txt}</button></div>`;
      }
    }
    patch(root, `<div class="overlay" data-act="imp-fora"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="imp-t" style="width:720px">
      <header style="flex-direction:column;align-items:stretch;gap: var(--sp-4)"><div class="row" style="justify-content:space-between"><h2 id="imp-t">Importar clientes</h2><button type="button" class="round" data-act="imp-fechar" aria-label="Fechar" title="Fechar (Esc)">${ic('x', 'ic-20')}</button></div>${steps}</header>
      <div class="body" style="gap: var(--sp-4)">${corpo}</div><footer>${rodape}</footer></section></div>`);
  }

  async function importar() {
    I.salvando = true;
    renderImport();
    const r = await api.acao('importarClientes', { linhas: linhasImport(), vendedorPadrao: I.vendPadrao, incluirPassados: I.passados });
    if (!I) return;
    I.salvando = false;
    if (!r.ok) { renderImport(); toast(r.error, { erro: true }); return; }
    S.data = r.data.estado;
    const { novos, atualizados, vendas, retornos } = r.data;
    fecharImport();
    S.view = vendas ? 'hoje' : 'clientes';
    if (vendas) S.periodo = 'semana';
    render();
    const partes = [plural(novos, 'cliente novo', 'clientes novos')];
    if (atualizados) partes.push(plural(atualizados, 'cliente completado', 'clientes completados'));
    if (vendas) partes.push(`${plural(vendas, 'venda', 'vendas')} e ${plural(retornos, 'retorno agendado', 'retornos agendados')}`);
    toast(`Importado: ${partes.join(', ')}.`, { ms: 7000 });
  }

  // ============================================================ EDITAR VENDA

  function abrirEV(id) {
    const v = S.data.vendas.find((x) => x.id === id);
    if (!v) return;
    const pend = S.data.lembretes.filter((l) => l.vendaId === id && l.status !== 'cancelado').map((l) => l.dias);
    EV = { id, clienteId: v.clienteId, cupom: v.cupom, modelo: v.modelo || '', valor: R.maskMoney(String(Math.round(v.valor * 100))), data: v.data, vendedorId: v.vendedorId, dias: R.normalizeDias(pend), errors: {}, salvando: false };
    renderEV();
    focar('ev-cupom');
  }
  function fecharEV() {
    EV = null;
    if (DD.open === 'ev-vend' || DD.open === 'ev-modelo' || DD.open === 'm-data') DD.open = null;
    renderEV();
  }

  function renderEV() {
    const root = $('#venda-root');
    if (!EV) { patch(root, ''); return; }
    const c = maps().cli.get(EV.clienteId) || {};
    const e = EV.errors;
    const err = (k) => `<span class="err">${esc(e[k] || '')}</span>`;
    const inv = (k) => (e[k] ? 'aria-invalid="true"' : '');
    const padrao = S.data.config[c.tipo === 'atacado' ? 'diasAtacado' : 'diasVarejo'];
    const todos = R.normalizeDias([].concat(padrao, EV.dias));
    const feitos = new Set(S.data.lembretes.filter((l) => l.vendaId === EV.id && l.status === 'contatado').map((l) => l.dias));
    const pend = R.normalizeDias(EV.dias).filter((d) => !feitos.has(d));
    const prev = R.parseISO(EV.data) && pend.length
      ? `${ic('clock', 'ic-16')}Os retornos que ainda não foram feitos ficam em ${(() => { const ds = pend.map((n) => R.formatDate(R.addDays(EV.data, n), 'curta')); return ds.length === 1 ? ds[0] : `${ds.slice(0, -1).join(', ')} e ${ds[ds.length - 1]}`; })()}.`
      : pend.length ? '' : `${ic('clock', 'ic-16')}Nenhum retorno novo para essa venda.`;
    patch(root, `<div class="overlay" data-act="ev-fora"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="ev-t" style="width:600px">
      <header><div style="display:flex;flex-direction:column;gap: var(--sp-1);min-width:0"><h2 id="ev-t">Editar venda</h2><span class="small muted ell">${esc(nomeCli(c))} · ${esc(R.formatPhone(c.celular))}</span></div><button type="button" class="round" data-act="ev-fechar" aria-label="Fechar" title="Fechar (Esc)">${ic('x', 'ic-20')}</button></header>
      <form data-form="venda-edit" novalidate><div class="body">
        <div class="grid3" style="grid-template-columns:${c.tipo === 'atacado' ? '1.7fr 1fr 1.2fr' : '1fr 1fr 1.2fr'}">
          ${c.tipo === 'atacado' ? campoNota('ev', EV.modelo, EV.cupom, e.cupom, 'data-ev') : `<div class="field"><label for="ev-cupom">Nº do cupom</label><input class="input" id="ev-cupom" data-ev="cupom" value="${esc(EV.cupom)}" inputmode="numeric" autocomplete="off" ${inv('cupom')}>${err('cupom')}</div>`}
          <div class="field"><label for="ev-valor">Valor</label><div class="prefix"><span>R$</span><input class="input" id="ev-valor" data-ev="valor" value="${esc(EV.valor)}" inputmode="numeric" autocomplete="off" ${inv('valor')}></div>${err('valor')}</div>
          <div class="field"><label for="m-data">Data da compra</label>${campoData(!!e.data)}${err('data')}</div></div>
        <div class="grid-vend"><div class="field"><label for="ev-vend">Vendedor</label>${dd('ev-vend', { invalid: !!e.vendedorId })}${err('vendedorId')}</div>
          <div class="field"><span class="legend">Chamar de novo em</span><div class="chips">${todos.map((d) => `<button type="button" class="chip" aria-pressed="${EV.dias.includes(d)}" data-act="ev-dia" data-v="${d}" ${feitos.has(d) ? 'title="Esse contato já foi feito"' : ''}>${d} dias${feitos.has(d) ? ` ${ic('check', 'ic-14')}` : ''}</button>`).join('')}</div>${err('dias')}</div></div>
        <p class="hint">${prev}</p>
        ${feitos.size ? `<div class="alert info">${ic('info', 'ic-16')}<span class="wrap">Contatos que já foram feitos continuam no histórico, sem mudar.</span></div>` : ''}
      </div>
      <footer><button type="button" class="btn ghost danger" data-act="ev-excluir">${ic('lixo', 'ic-16')}Excluir venda</button>
        <div class="right"><button type="button" class="btn ghost" data-act="ev-fechar">Cancelar</button><button type="submit" class="btn primary lg" ${EV.salvando ? 'disabled' : ''}>Salvar alterações</button></div></footer></form>
    </section></div>`);
  }

  async function salvarEV() {
    if (!EV || EV.salvando) return;
    EV.salvando = true;
    const r = await api.acao('editarVenda', { id: EV.id, cupom: EV.cupom, modelo: EV.modelo, valor: EV.valor, data: EV.data, vendedorId: EV.vendedorId, dias: EV.dias });
    if (!EV) return;
    EV.salvando = false;
    if (!r.ok) {
      EV.errors = r.fields || {};
      renderEV();
      if (!r.fields) toast(r.error, { erro: true });
      return;
    }
    S.data = r.data;
    fecharEV();
    render();
    toast('Venda atualizada.');
  }

  // ============================================================ EQUIPE

  function viewEquipe() {
    const mes = S.today.slice(0, 7);
    const stats = new Map(S.data.vendedores.map((v) => [v.id, { vendas: 0, mes: 0, contatos: 0 }]));
    for (const v of S.data.vendas) {
      if (v.excluida || !cliOk(v.clienteId) || !stats.has(v.vendedorId)) continue;
      const s = stats.get(v.vendedorId);
      s.vendas++;
      if (v.data.startsWith(mes)) s.mes++;
    }
    for (const x of itens()) {
      if (x.st === 'contatado' && x.l.contatadoEm && R.localDay(x.l.contatadoEm).startsWith(mes) && stats.has(x.v.vendedorId)) stats.get(x.v.vendedorId).contatos++;
    }
    const lista = S.data.vendedores.filter((v) => !v.excluido).sort((a, b) => (b.ativo - a.ativo) || a.nome.localeCompare(b.nome));
    const adm = ehAdmin();
    const abaAdm = adm && naNuvem() && S.equipeAba === 'admins';
    const abas = adm && naNuvem()
      ? `<div class="tabs" role="tablist" aria-label="Equipe"><button type="button" role="tab" aria-selected="${!abaAdm}" class="${abaAdm ? '' : 'on'}" data-act="equipe-aba" data-v="vend">Vendedores <span class="n">${vendAtivos().length}</span></button><button type="button" role="tab" aria-selected="${abaAdm}" class="${abaAdm ? 'on' : ''}" data-act="equipe-aba" data-v="admins">Administradores <span class="n">${listaAdmins().length}</span></button></div>`
      : `<span class="sub">${plural(vendAtivos().length, 'vendedor ativo', 'vendedores ativos')}</span>`;
    if (abaAdm) return `<div class="page" style="max-width:920px"><div class="page-head"><div class="t"><h1>Equipe</h1>${abas}</div></div>${cardAdmins()}</div>`;
    const aviso = adm
      ? `<form class="card" style="padding: var(--sp-4) var(--sp-6);display:flex;gap: var(--sp-3);align-items:center" data-form="vendedor" novalidate><input class="input grow" id="vend-novo" placeholder="Nome do novo vendedor" autocomplete="off" aria-label="Nome do novo vendedor"><button class="btn primary" type="submit" style="height: 40px;border-radius: var(--r-full)">${ic('plus', 'ic-16')}Adicionar</button></form>`
      : `<div class="alert info">${ic('cadeado', 'ic-16')}<span class="wrap grow">Só um administrador adiciona, desativa ou exclui vendedores.</span><button class="link blue" type="button" data-act="adm-entrar" style="height:auto;font-weight:600">Entrar como administrador</button></div>`;
    return `<div class="page" style="max-width:920px"><div class="page-head"><div class="t"><h1>Equipe</h1>${abas}</div></div>
      ${aviso}
      <section class="card">${lista.map((v) => {
        const s = stats.get(v.id);
        if (S.renomear === v.id && adm) {
          return `<form class="vend-row" data-form="renomear" data-id="${v.id}" novalidate><span class="avatar" data-nome="${esc(v.nome)}" data-tom="${tomDe(v.nome)}">${esc(R.initials(v.nome))}</span><input class="input grow" id="ren-${v.id}" value="${esc(v.nome)}" aria-label="Novo nome" style="height: 40px"><button class="btn primary" type="submit">Salvar</button><button class="btn ghost" type="button" data-act="ren-cancelar">Cancelar</button></form>`;
        }
        const botoes = adm
          ? `<button class="link" type="button" data-act="ren" data-id="${v.id}">${ic('editar', 'ic-14')}Renomear</button><button class="btn" type="button" data-act="vend-ativo" data-id="${v.id}" data-v="${v.ativo ? '0' : '1'}" style="margin-left: var(--sp-3)">${v.ativo ? 'Desativar' : 'Ativar'}</button>${naNuvem() ? `<button class="btn danger-ghost" type="button" data-act="vend-excluir" data-id="${v.id}" style="margin-left: var(--sp-2)">${ic('lixo', 'ic-14')}Excluir</button>` : ''}`
          : '';
        return `<div class="vend-row${v.ativo ? '' : ' off'}"><span class="avatar" data-nome="${esc(v.nome)}" data-tom="${tomDe(v.nome)}">${esc(R.initials(v.nome))}</span><div class="grow" style="display:flex;flex-direction:column;min-width:0"><span class="nm ell">${esc(v.nome)}</span><span class="xs muted ell">${v.ativo ? `${plural(s.mes, 'venda', 'vendas')} e ${plural(s.contatos, 'contato feito', 'contatos feitos')} este mês · ${s.vendas} no total` : 'Desativado. Não aparece nos cadastros novos.'}</span></div>${botoes}</div>`;
      }).join('')}</section></div>`;
  }

  function cardAdmins() {
    const lista = listaAdmins();
    const linha = (a, i) => `<div class="vend-row adm-linha"><span class="avatar" data-nome="${esc(a.nome)}" data-tom="${tomDe(a.nome)}">${esc(R.initials(a.nome))}</span>
      <input class="input" data-adm="${i}" data-campo="nome" value="${esc(a.nome)}" aria-label="Nome" style="height: 40px;width:200px">
      <input class="input" data-adm="${i}" data-campo="funcao" value="${esc(a.funcao)}" aria-label="Função" style="height: 40px;width:200px">
      <span class="xs muted ell grow" title="${esc(a.email)}">${esc(a.email)}</span>
      <button class="round" type="button" data-act="adm-rm" data-v="${i}" title="Tirar da lista" aria-label="Tirar ${esc(a.nome)} da lista">${ic('x', 'ic-16')}</button></div>`;
    return `<form class="card" data-form="admins" novalidate><div style="padding: var(--sp-6) var(--sp-6) var(--sp-3)"><h2 class="h-info" style="font-size: var(--fs-16);line-height: 24px;font-weight:600">Quem entra com senha${info('Nome e função que aparecem no "Entrar como administrador". Quem é adicionado recebe um e-mail para criar a senha.')}</h2></div>
      <div class="vend-row"><span class="avatar" style="background:var(--sel)">${ic('plus', 'ic-14')}</span><input class="input" id="adm-novo-email" type="email" placeholder="E-mail" style="height: 40px;width:200px" spellcheck="false"><input class="input" id="adm-novo-nome" placeholder="Nome" style="height: 40px;width:200px"><span class="grow"></span><button class="btn" type="button" data-act="adm-add">Adicionar</button></div>
      ${lista.map(linha).join('')}
      <div style="padding: var(--sp-3) var(--sp-6) var(--sp-6);display:flex;justify-content:flex-end">${botaoSalvar('admins', 'Salvar administradores')}</div></form>`;
  }

  // ============================================================ AJUSTES

  function viewAjustes() {
    const sec = S.ajustesSec;
    const nav = (v, l, i) => `<button type="button" data-act="aj-sec" data-v="${v}" aria-current="${sec === v}">${ic(i)}${l}</button>`;
    const panels = { loja: ajLoja, prazos: ajPrazos, mensagens: ajMensagens, aparencia: ajAparencia, produtos: ajProdutos, dados: ajDados };
    return `<div class="page"><div class="page-head"><div class="t"><h1>Ajustes</h1></div></div>
      <div class="settings"><nav class="snav" aria-label="Seções">${nav('loja', 'Loja', 'loja')}${nav('prazos', 'Prazos de retorno', 'clock')}${nav('mensagens', 'Mensagens', 'msg')}${nav('aparencia', 'Aparência e WhatsApp', 'sol')}${nav('produtos', 'Produtos', 'pedidos')}${nav('dados', 'Dados e backup', 'pasta')}</nav>
      <div>${panels[sec]()}</div></div></div>`;
  }

  function ajLoja() {
    const cfg = S.data.config;
    return `<form class="card panel" data-form="loja" novalidate><div><h2 class="h-info">Loja${info('O nome aparece no menu e nas mensagens como {loja}.')}</h2></div>
      <div class="field"><label for="aj-loja">Nome da loja</label><input class="input" id="aj-loja" value="${esc(S.data.loja.nome)}" autocomplete="off" style="max-width:420px"></div>
      <div class="field"><label for="aj-zap">WhatsApp da loja (opcional)</label><input class="input" id="aj-zap" data-mask="tel" value="${esc(R.formatPhone(S.data.loja.whatsapp || ''))}" placeholder="(00) 00000-0000" inputmode="tel" autocomplete="off" style="max-width:420px"></div>
      <div>${botaoSalvar('loja', 'Salvar')}</div>
      ${api.web ? '' : `<div class="divider"></div>
      <div><h2 class="h-info">Aviso da manhã${info('O Retornei mostra no canto da tela quantos clientes chamar e quantos produtos chegaram. Ele precisa estar aberto; se abrir depois do horário, avisa na hora.')}</h2></div>
      <div class="row" style="gap: var(--sp-3);flex-wrap:wrap">${pills([['1', 'Ligado'], ['0', 'Desligado']], cfg.avisoAtivo ? '1' : '0', 'aviso-ativo', 'Aviso da manhã')}
        ${cfg.avisoAtivo ? `<span class="small l2">às</span>${dd('aviso-hora', { pill: true, w: 120 })}` : ''}</div>
      <div class="divider"></div>
      <div><h2 class="h-info">Abrir junto com o Windows${info('O Retornei abre sozinho quando o computador liga, já minimizado na barra de tarefas. Assim o aviso da manhã aparece mesmo que ninguém abra o app.')}</h2></div>
      <div>${pills([['1', 'Abrir com o Windows'], ['0', 'Não abrir']], cfg.abrirComWindows === false ? '0' : '1', 'abrir-win', 'Abrir junto com o Windows')}</div>`}
      </form>`;
  }

  function chipsPrazo(tipo) {
    const k = tipo === 'atacado' ? 'diasAtacado' : 'diasVarejo';
    const dias = S.data.config[k];
    return `<div class="field"><span class="legend">${tipo === 'atacado' ? 'Atacado' : 'Varejo'}</span><div class="chips">${dias.map((d) => `<span class="chip" aria-pressed="true">${d} dias<button type="button" class="x" data-act="prazo-rm" data-tipo="${tipo}" data-v="${d}" aria-label="Remover ${d} dias" ${dias.length < 2 ? 'disabled' : ''}>${ic('x', 'ic-14')}</button></span>`).join('')}
      <form data-form="prazo" data-tipo="${tipo}" style="display:inline-flex;gap: var(--sp-2)" novalidate><input class="chip-input" id="prazo-${tipo}" type="number" min="1" max="365" placeholder="Dias" aria-label="Novo prazo em dias"><button class="chip" type="submit">${ic('plus', 'ic-14')}Adicionar</button></form></div></div>`;
  }

  function ajPrazos() {
    return `<section class="card panel"><div><h2 class="h-info">Prazos de retorno${info('Quantos dias depois da compra o cliente volta para a fila. Esses prazos já vêm marcados no cadastro; em cada venda dá para mudar.')}</h2></div>
      ${chipsPrazo('varejo')}<div class="divider"></div>${chipsPrazo('atacado')}</section>`;
  }

  const VARS = [['primeiro_nome', 'Primeiro nome'], ['nome', 'Nome completo'], ['vendedor', 'Vendedor'], ['loja', 'Loja'], ['data_compra', 'Data da compra'], ['empresa', 'Empresa'], ['produto', 'Produto']];
  function exemploVars(k) {
    return {
      primeiro_nome: k === 'mensagemAtacado' ? 'João' : 'Maria',
      nome: k === 'mensagemAtacado' ? 'João Lima' : 'Maria Souza',
      vendedor: R.firstName((vendAtivos()[0] || {}).nome || 'Ana'),
      loja: S.data.loja.nome,
      data_compra: R.formatDate(R.addDays(S.today, -15), 'curta'),
      empresa: 'Mercadinho Bom Preço',
      produto: 'Óleo de coco 500 ml',
    };
  }

  function ajMensagens() {
    const bloco = (k, titulo, desc, vars) => `<div class="field"><label for="msg-${k}" style="font-size: var(--fs-14);color:var(--label)">${titulo}</label><span class="xs muted wrap">${desc}</span>
      <div class="vars">${VARS.filter(([v]) => vars.includes(v)).map(([v, l]) => `<button type="button" class="var" data-act="msg-var" data-k="${k}" data-v="${v}" title="Inserir ${l}">{${v}}</button>`).join('')}</div>
      <textarea class="textarea" id="msg-${k}" data-msg="${k}" rows="4">${esc(S.data.config[k])}</textarea>
      <span class="xs muted">Prévia</span><div class="preview" id="prev-${k}">${esc(R.renderTemplate(S.data.config[k], exemploVars(k)))}</div></div>`;
    const base = ['primeiro_nome', 'nome', 'vendedor', 'loja'];
    return `<form class="card panel" data-form="mensagens" novalidate><div><h2 class="h-info">Mensagens do WhatsApp${info('O texto já vai pronto no WhatsApp. Antes de enviar, dá para mudar na própria tela.')}</h2></div>
      ${bloco('mensagemVarejo', 'Retorno de varejo', 'Para clientes que compraram no varejo.', base.concat('data_compra'))}<div class="divider"></div>
      ${bloco('mensagemAtacado', 'Retorno de atacado', 'Para empresas. {empresa} vira "sua empresa" quando não houver nome.', base.concat('data_compra', 'empresa'))}<div class="divider"></div>
      ${bloco('mensagemEncomenda', 'Produto chegou', 'Para avisar quem pediu um produto em falta.', base.concat('produto', 'empresa'))}
      <div class="row">${botaoSalvar('mensagens', 'Salvar mensagens')}<button class="link" type="button" data-act="msg-padrao">Voltar ao texto original</button></div></form>`;
  }

  function ajAparencia() {
    return `<section class="card panel"><div><h2>Aparência e WhatsApp</h2></div>
      <div class="field"><span class="legend">Tema</span><div>${pills([['sistema', api.web ? 'Igual ao aparelho' : 'Igual ao Windows'], ['claro', 'Claro'], ['escuro', 'Escuro']], S.data.config.tema, 'tema', 'Tema')}</div></div>
      ${api.web ? '' : `<div class="field"><span class="legend">Abrir o WhatsApp no</span><div>${pills([['auto', 'Automático'], ['app', 'Aplicativo do computador'], ['web', 'Navegador']], S.data.config.whatsappModo || 'auto', 'wa-modo', 'WhatsApp')}</div>
        <span class="xs muted wrap">${S.info && S.info.whatsappApp ? 'O WhatsApp está instalado neste computador. No automático, o Retornei abre direto nele.' : 'Não encontrei o WhatsApp instalado neste computador. No automático, o Retornei abre o WhatsApp Web no navegador.'}</span></div>
      <div class="field"><span class="legend">Menu lateral</span><div>${pills([['aberto', 'Aberto'], ['recolhido', 'Recolhido']], S.menuMin ? 'recolhido' : 'aberto', 'menu-modo', 'Menu')}</div></div>`}</section>`;
  }

  function estadoUpd() {
    const u = S.upd;
    const quando = u.ultima ? `procurou ${R.relativeDay(R.localDay(u.ultima), S.today)} às ${new Date(u.ultima).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : '';
    const versao = esc((S.info && S.info.versao) || '');
    const linha = (cls, icone, t, sub, botao) => `<div class="upd-box"><span class="upd-ic ${cls}">${ic(icone, 'ic-20')}</span><div class="grow" style="display:flex;flex-direction:column;gap: var(--sp-1);min-width:0"><span class="strong small">${t}</span><span class="xs muted wrap">${sub}</span></div>${botao || ''}</div>`;
    const procurar = `<button class="btn" type="button" data-act="upd-procurar">${ic('atualizar', 'ic-16')}Procurar atualização</button>`;
    if (!u.instalado) return linha('', 'info', 'Atualização automática', `Funciona no app instalado. Versão ${versao}.`);
    if (u.estado === 'procurando') return linha('', 'atualizar', 'Procurando atualização…', `Versão ${versao}`);
    if (u.estado === 'baixando') return linha('', 'baixar', `Baixando a versão ${esc(u.versao || '')} · ${u.pct || 0}%`, 'Pode continuar usando o app normalmente.');
    if (u.estado === 'pronto') return linha('ok', 'atualizar', `Versão ${esc(u.versao || '')} pronta`, 'Leva poucos segundos. Seus dados continuam iguais.', `<button class="btn primary" type="button" data-act="upd-reiniciar">Reiniciar agora</button>`);
    if (u.estado === 'erro') return linha('aviso', 'alertaC', 'Não deu para procurar atualização agora', `Versão ${versao}${quando ? ` · ${quando}` : ''}. Confira a internet e tente de novo.`, procurar);
    if (u.estado === 'atualizado') return linha('ok', 'check', 'Retornei está atualizado', `Versão ${versao}${quando ? ` · ${quando}` : ''}`, procurar);
    return linha('', 'atualizar', 'Atualização automática ligada', `Versão ${versao} · procura sozinho ao abrir e a cada 4 horas.`, procurar);
  }

  function linhaNuvemTexto() {
    const s = window.Nuvem.st;
    if (s.status === 'erro') return 'Erro ao sincronizar. O Retornei tenta de novo sozinho.';
    if (s.offline || !navigator.onLine) return 'Sem internet. O que for feito aqui sobe quando a conexão voltar.';
    if (s.pendentes) return 'Sincronizando…';
    return 'Ligado à loja e sincronizado.';
  }

  function ajProdutos() {
    const todos = S.data.produtos || [];
    const q = R.keyOf(S.prodBusca || '');
    const achados = q ? todos.filter((p) => R.keyOf(`${p.codigo} ${p.nome}`).includes(q)) : todos;
    const mostra = achados.slice(0, 300);
    const em = S.data.loja.produtosEm;
    const quando = em ? ` · atualizado em ${R.formatDate(R.localDay(em), 'curta').slice(0, 5)} às ${new Date(em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : '';
    const botao = ehAdmin()
      ? `<button class="btn primary" type="button" data-act="prod-importar" style="height: 40px;border-radius: var(--r-full)">${ic('subir', 'ic-16')}Importar planilha</button>`
      : `<button class="locked" type="button" data-act="prod-importar" title="Só administrador">${ic('cadeado', 'ic-16')}Importar planilha</button>`;
    const linhas = mostra.map((p) => `<div class="prod-l"><span class="pc">${esc(p.codigo)}</span><span class="pn">${esc(p.nome)}</span></div>`).join('');
    return `<section class="card panel"><div class="row" style="align-items:center;gap: var(--sp-4)"><div class="grow" style="display:flex;flex-direction:column;gap: var(--sp-1)"><h2 style="font-size: var(--fs-20)">Produtos</h2><span class="small muted">${todos.length ? `${todos.length.toLocaleString('pt-BR')} produtos${quando}` : 'Nenhum produto ainda. Importe a planilha de produtos do sistema da loja.'}</span></div>${botao}</div>
      ${todos.length ? `<input class="input" id="prod-busca" value="${esc(S.prodBusca || '')}" placeholder="Buscar por nome ou código" autocomplete="off" spellcheck="false">
      <div class="prod-t"><div class="prod-l th"><span class="pc">Código</span><span class="pn">Descrição do produto</span></div>${linhas || '<div class="prod-l"><span class="pn muted">Nenhum produto encontrado.</span></div>'}</div>
      <p class="xs muted">${achados.length > mostra.length ? `Mostrando ${mostra.length} de ${achados.length.toLocaleString('pt-BR')}` : `${achados.length.toLocaleString('pt-BR')} ${achados.length === 1 ? 'produto' : 'produtos'}`}</p>` : ''}</section>`;
  }

  async function importarProdutos() {
    const r = await api.planilha('Escolher planilha de produtos');
    if (!r.ok) { toast(r.error, { erro: true }); return; }
    if (!r.data) return;
    const cols = r.data.colunas.map((c) => R.keyOf(c));
    let ic1 = cols.findIndex((c) => /^cod|codigo|^cód|^ref|sku/.test(c));
    let ic2 = cols.findIndex((c, i) => i !== ic1 && /descri|produto|nome/.test(c));
    if (ic1 < 0) ic1 = 0;
    if (ic2 < 0) ic2 = ic1 === 0 ? 1 : 0;
    const linhas = r.data.linhas.map((l) => ({ codigo: String(l[ic1] == null ? '' : l[ic1]).trim(), nome: String(l[ic2] == null ? '' : l[ic2]).trim() })).filter((l) => l.codigo && l.nome);
    if (!linhas.length) { toast('Não encontrei produtos com código e descrição nessa planilha.', { erro: true }); return; }
    const atual = (S.data.produtos || []).length;
    const ok = await confirmar({ titulo: `Importar ${linhas.length.toLocaleString('pt-BR')} produtos?`, texto: atual ? `A lista atual (${atual.toLocaleString('pt-BR')} produtos) é trocada por esta. Os pedidos já feitos não mudam.` : 'A lista aparece em todos os computadores da loja.', ok: 'Importar' });
    if (!ok) return;
    const ri = await api.acao('importarProdutos', { linhas });
    if (!ri.ok) { toast(ri.error, { erro: true }); return; }
    S.data = ri.data.estado;
    S.prodBusca = '';
    render();
    toast(`${ri.data.total.toLocaleString('pt-BR')} produtos importados.`);
  }

  /** Cópias na nuvem (só administrador): uma por dia, as 30 últimas, com Restaurar. */
  function copiasNuvem() {
    const C = S.copias;
    if (!C) { carregarCopias(); }
    const quando = (c) => {
      const d = new Date(c.em || Date.now());
      const dia = R.localDay(d.toISOString());
      const h = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const n = R.diffDays(dia, S.today);
      return `${n === 0 ? 'Hoje' : n === 1 ? 'Ontem' : R.formatDate(dia, 'curta').slice(0, 5)} às ${h}`;
    };
    const cab = '<div class="cn-h"><span class="strong small">Cópias na nuvem</span><span class="xs muted">Uma por dia, guardada fora da loja. Ficam as 30 últimas.</span></div>';
    let corpo;
    if (!C || C.carregando) corpo = '<span class="xs muted">Carregando as cópias…</span>';
    else if (C.erro) corpo = `<span class="xs muted wrap">${esc(C.erro)} <button class="link blue" type="button" data-act="cn-recarregar" style="display:inline-flex;height:auto">Tentar de novo</button></span>`;
    else if (!C.lista.length) corpo = '<span class="xs muted wrap">A primeira cópia é feita hoje, poucos minutos depois de o app abrir com internet.</span>';
    else {
      const vis = C.todas ? C.lista : C.lista.slice(0, 5);
      corpo = `<div class="mini">${vis.map((c) => `<div class="li"><div class="meta"><b>${c.tipo === 'antes' ? `Antes de restaurar · ${quando(c)}` : quando(c)}</b><span>${Number(c.clientes || 0).toLocaleString('pt-BR')} clientes · ${Number(c.vendas || 0).toLocaleString('pt-BR')} vendas${c.pc ? ` · ${esc(c.pc)}` : ''}</span></div><button class="btn sm" type="button" data-act="cn-rest" data-id="${esc(c.id)}" data-q="${esc(quando(c))}" ${C.restaurando ? 'disabled' : ''}>${ic('desfazer', 'ic-16')}Restaurar</button></div>`).join('')}
        ${C.lista.length > 5 && !C.todas ? `<button class="vr-mais" type="button" data-act="cn-todas">Ver as ${C.lista.length} cópias${ic('chev', 'ic-14')}</button>` : ''}</div>`;
    }
    return `<div class="cn">${cab}${corpo}</div>`;
  }
  async function carregarCopias() {
    if (S.copias && S.copias.carregando) return;
    S.copias = { carregando: true, lista: [] };
    const r = await window.Nuvem.copias();
    S.copias = r.ok ? { lista: r.data.filter((c) => c.em), todas: false } : { lista: [], erro: r.error };
    if (S.view === 'ajustes') render();
  }
  async function restaurarCopia(id, q) {
    const ok = await confirmar({ titulo: `Restaurar a cópia de ${q.replace(/^Hoje/, 'hoje').replace(/^Ontem/, 'ontem')}?`, texto: 'Os dados da loja voltam a ficar como estavam nesse momento, em todos os computadores. O que foi feito depois disso some. Antes de restaurar, o app guarda uma cópia de agora, para dar para voltar atrás.', ok: 'Restaurar' });
    if (!ok) return;
    S.copias.restaurando = true;
    render();
    toast('Restaurando a cópia…');
    const r = await window.Nuvem.restaurar(id);
    if (!r || !r.ok) { S.copias.restaurando = false; render(); toast((r && r.error) || 'Não deu para restaurar agora.', { erro: true }); return; }
    S.data = r.data;
    S.copias = null;
    render();
    toast(`Pronto. Os dados voltaram para ${q.replace(/^Hoje/, 'hoje').replace(/^Ontem/, 'ontem')}.`);
  }

  function ajDados() {
    // WEB: no protótipo os dados ficam só neste aparelho
    if (api.web) return `<section class="card panel"><div><h2 class="h-info">Dados deste aparelho</h2><p class="small l2 wrap" style="margin-top: var(--sp-2)">Versão de teste. Nada aqui vai para a loja.</p></div><div><button class="btn" type="button" data-act="recomecar">${ic('atualizar', 'ic-16')}Recomeçar teste</button></div></section>`;
    const i = S.info || {};
    const nv = naNuvem() && S.data.nuvem;
    return `<section class="card panel">${estadoUpd()}<div><h2 class="h-info">Dados e backup${info(nv ? 'Os dados da loja ficam na nuvem e aparecem iguais em todos os computadores. Este computador também guarda uma cópia por dia (as 30 últimas).' : 'Tudo fica salvo neste computador, com uma cópia por dia (as 30 últimas). Para levar os dados para outro computador, use "Salvar cópia".')}</h2></div>
      ${nv ? `<div class="pc-box"><span class="upd-ic ok">${ic('computador', 'ic-20')}</span><div class="grow" style="display:flex;flex-direction:column;gap: var(--sp-1);min-width:0"><span class="strong small">${esc(S.data.nuvem.pc.nome)}</span><span class="xs muted">${esc(linhaNuvemTexto())}</span></div><button class="btn" type="button" data-act="pc-desconectar">Desconectar</button></div>${ehAdmin() ? copiasNuvem() : ''}` : `<div class="alert info">${ic('info', 'ic-16')}<span class="wrap">Cada computador tem seus próprios dados. Na versão com Google, todos os computadores da loja vão ver a mesma lista.</span></div>`}
      <div class="row" style="gap: var(--sp-2)"><button class="btn primary" type="button" data-act="exportar">${ic('baixar', 'ic-16')}Salvar cópia</button><button class="btn" type="button" data-act="importar">${ic('subir', 'ic-16')}Restaurar cópia</button><button class="link" type="button" data-act="abrir-pasta" style="margin-left: var(--sp-2)">${ic('pasta', 'ic-16')}Abrir pasta dos dados</button></div>
      ${i.ultimaCopia ? `<span class="xs muted" style="padding-top: var(--sp-4);border-top:1px solid var(--sep)">Última cópia: ${(() => { const d = new Date(i.ultimaCopia); const dia = R.localDay(d.toISOString()); const h = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); return dia === S.today ? `hoje às ${h}` : dia === R.addDays(S.today, -1) ? `ontem às ${h}` : `${R.formatDate(dia, 'curta').slice(0, 5)} às ${h}`; })()}</span>` : ''}</section>`;
  }

  // ============================================================ MODAL: nova venda

  function novoModal(opts) {
    const o = opts || {};
    const ultimo = ls.get('ultimoVendedor', '');
    const ativos = vendAtivos();
    const vend = ativos.some((v) => v.id === ultimo) ? ultimo : ativos.length === 1 ? ativos[0].id : '';
    const tipo = o.cliente ? o.cliente.tipo : 'varejo';
    M = {
      fx: true,
      modo: o.modo || 'venda',
      tipo,
      celular: o.cliente ? R.formatPhone(o.cliente.celular) : '',
      nome: o.cliente ? o.cliente.nome : '',
      empresa: o.cliente ? o.cliente.empresa : '',
      fantasia: o.cliente ? o.cliente.fantasia || '' : '',
      cnpj: o.cliente ? R.formatDoc(o.cliente.cnpj, o.cliente.docTipo) : '',
      docTipo: o.cliente ? R.docTipoDe(o.cliente.docTipo) : 'cnpj',
      knownId: o.cliente ? o.cliente.id : null,
      fixo: !!o.retornoDe, // Comprou: Nova venda só com cupom, valor, data, vendedor e dias
      retornoDe: o.retornoDe || null,
      cupom: '',
      modelo: '', // vazio: segue o padrão do cliente (modeloPadrao)
      valor: '',
      data: S.today,
      vendedorId: vend,
      dias: S.data.config[tipo === 'atacado' ? 'diasAtacado' : 'diasVarejo'].slice(),
      outro: false,
      obsAberta: false,
      obs: '',
      produto: '',
      quantidade: 1,
      focoProduto: false,
      errors: {},
      salvando: false,
    };
    renderModal();
    focar(o.cliente ? (M.modo === 'venda' ? 'm-cupom' : 'm-produto') : 'm-cel');
  }
  function fecharModal() {
    M = null;
    if (DD.open === 'm-vend' || DD.open === 'm-data') DD.open = null;
    patch($('#modal-root'), '');
  }
  function focar(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.focus();
    if (el.setSelectionRange && el.type !== 'date' && el.type !== 'number' && typeof el.value === 'string') {
      try { el.setSelectionRange(el.value.length, el.value.length); } catch (_) { /* nada */ }
    }
  }

  const clienteFixo = () => maps().cli.get(M.knownId) || { nome: M.nome, celular: M.celular };

  function preencherCliente(c) {
    M.knownId = c.id;
    M.celular = R.formatPhone(c.celular);
    M.nome = c.nome;
    M.empresa = c.empresa || '';
    M.fantasia = c.fantasia || '';
    M.docTipo = R.docTipoDe(c.docTipo);
    M.cnpj = R.formatDoc(c.cnpj, c.docTipo);
    M.sugCli = null; M.cnpjInfo = null;
    ['nome', 'empresa', 'cnpj', 'celular'].forEach((f) => delete M.errors[f]);
    if (M.tipo !== c.tipo) {
      M.tipo = c.tipo;
      M.dias = S.data.config[c.tipo === 'atacado' ? 'diasAtacado' : 'diasVarejo'].slice();
    }
  }
  /** Atacado: CNPJ de cliente salvo preenche tudo; CNPJ novo consulta a Receita (BrasilAPI). Sem internet, fica em silêncio. */
  async function buscarCnpj(doc) {
    const c = S.data.clientes.find((x) => !x.excluido && x.cnpj === doc);
    if (c) { preencherCliente(c); M.cnpjInfo = { fonte: 'loja' }; renderModal(); return; }
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${doc}`, { signal: AbortSignal.timeout(6000) });
      if (!r.ok || !M || String(M.cnpj).replace(/\D/g, '') !== doc) return;
      const j = await r.json();
      M.empresa = R.clean(j.razao_social || '', 120) || M.empresa;
      if (!M.fantasia && j.nome_fantasia) M.fantasia = R.clean(j.nome_fantasia, 80);
      delete M.errors.empresa;
      M.cnpjInfo = { fonte: 'receita', situacao: String(j.descricao_situacao_cadastral || '').toUpperCase() };
      renderModal();
    } catch (_) { /* sem internet: segue o preenchimento à mão */ }
  }

  function clienteConhecido() {
    const d = R.normalizePhone(M.celular);
    if (!R.isValidPhone(d)) return null;
    return S.data.clientes.find((c) => !c.excluido && c.celular === d) || null;
  }

  function knownHtml() {
    const d = R.normalizePhone(M.celular);
    const c = clienteConhecido();
    if (c) {
      const vs = S.data.vendas.filter((v) => v.clienteId === c.id && !v.excluida);
      const ult = vs.map((v) => v.data).sort().pop();
      return `<span class="known"><span class="dot green"></span>${esc(nomeCli(c))} já é cliente${vs.length ? ` · ${plural(vs.length, 'compra', 'compras')}, última em ${esc(R.formatDate(ult, 'curta'))}` : ''}</span>`;
    }
    if (d.length >= 10 && R.isValidPhone(d)) return `<span class="known"><span class="dot blue"></span>Cliente novo. Preencha ${M.tipo === 'atacado' ? 'os dados da empresa' : 'o nome'} abaixo.</span>`;
    return '';
  }

  function prevLembretes() {
    if (!R.parseISO(M.data) || !M.dias.length) return '';
    const ds = R.normalizeDias(M.dias).map((n) => R.formatDate(R.addDays(M.data, n), 'curta'));
    const txt = ds.length === 1 ? ds[0] : `${ds.slice(0, -1).join(', ')} e ${ds[ds.length - 1]}`;
    return `${ic('clock', 'ic-16')}${M.tipo === 'atacado' ? 'Chama de novo em' : 'O Retornei chama esse cliente em'} ${txt}.`;
  }

  function diasHtml() {
    const padrao = S.data.config[M.tipo === 'atacado' ? 'diasAtacado' : 'diasVarejo'];
    const todos = R.normalizeDias([].concat(padrao, M.dias));
    return `${todos.map((d) => `<button type="button" class="chip" aria-pressed="${M.dias.includes(d)}" data-act="m-dia" data-v="${d}">${d} dias</button>`).join('')}
      ${M.outro ? '<input class="chip-input" id="m-outro" type="number" min="1" max="365" placeholder="Dias" aria-label="Outro prazo em dias">' : `<button type="button" class="chip add" data-act="m-outro" aria-label="Outro prazo" title="Outro prazo">${ic('plus', 'ic-16')}</button>`}`;
  }

  function produtosSugeridos() {
    const q = R.keyOf(M.produto);
    const mapa = new Map();
    for (const e of S.data.encomendas) {
      const k = R.keyOf(e.produto);
      if (!mapa.has(k)) mapa.set(k, { produto: e.produto, n: 0 });
      if (e.status === 'esperando') mapa.get(k).n++;
    }
    return [...mapa.values()]
      .filter((p) => !q || (R.keyOf(p.produto).includes(q) && R.keyOf(p.produto) !== q))
      .sort((a, b) => b.n - a.n || a.produto.localeCompare(b.produto))
      .slice(0, 5);
  }
  function catalogoSugerido() {
    const q = R.keyOf(M.produto);
    if (!q) return [];
    const pal = q.split(' ').filter(Boolean);
    const out = [];
    for (const p of S.data.produtos || []) {
      const k = R.keyOf(`${p.codigo} ${p.nome}`);
      if (pal.every((w) => k.includes(w))) { out.push(p); if (out.length >= 30) break; }
    }
    return out;
  }
  function marcaBusca(txt) {
    const q = R.keyOf(M.produto).split(' ').filter(Boolean)[0];
    if (!q) return esc(txt);
    const i = R.keyOf(txt).indexOf(q);
    return i < 0 ? esc(txt) : `${esc(txt.slice(0, i))}<b>${esc(txt.slice(i, i + q.length))}</b>${esc(txt.slice(i + q.length))}`;
  }
  function sugsHtml() {
    if (!M.focoProduto) return '';
    if ((S.data.produtos || []).length) {
      const c = catalogoSugerido();
      if (!c.length || (M.codigo && c.length === 1 && c[0].codigo === M.codigo)) return '';
      return `<div class="sugs cat" role="listbox"><div class="sug-h"><span class="pc">Código</span><span class="pn">Descrição do produto</span></div>${c.map((p) => `<button type="button" class="sug" role="option" data-act="m-cat" data-v="${esc(p.id)}"><span class="pc">${esc(p.codigo)}</span><span class="pn"><span class="ell">${marcaBusca(p.nome)}</span></span></button>`).join('')}</div>`;
    }
    const s = produtosSugeridos();
    if (!s.length) return '';
    return `<div class="sugs" role="listbox">${s.map((p) => `<button type="button" class="sug" role="option" data-act="m-sug" data-v="${esc(p.produto)}"><span class="ell">${esc(p.produto)}</span><span class="dot-st xs">${p.n ? `<span class="dot blue"></span>${p.n} esperando` : 'já pedido antes'}</span></button>`).join('')}</div>`;
  }

  function renderModal() {
    const root = $('#modal-root');
    if (!M) { patch(root, ''); return; }
    const fx = M.fx;
    M.fx = false;
    const e = M.errors;
    const err = (k) => `<span class="err" id="err-${k}">${esc(e[k] || '')}</span>`;
    const inv = (k) => (e[k] ? 'aria-invalid="true"' : '');
    const venda = M.modo === 'venda';
    const at = M.tipo === 'atacado';
    const vendSel = `<div class="field"><label for="m-vend">Vendedor</label>${dd('m-vend', { invalid: !!e.vendedorId, clear: true })}${err('vendedorId')}</div>`;

    const sugsCli = (campo) => (M.sugCli && M.sugCli.length && M.sugCampo === campo ? `<div class="cli-sugs" role="listbox" aria-label="Clientes já salvos">${M.sugCli.map((c) => {
      const vs = S.data.vendas.filter((x) => x.clienteId === c.id && !x.excluida); const ult = vs.reduce((m, x) => (x.data > m ? x.data : m), '');
      const titulo = c.tipo === 'atacado' ? (c.fantasia || c.empresa || c.nome) : c.nome;
      const sub = c.tipo === 'atacado' ? [c.cnpj ? R.formatDoc(c.cnpj, c.docTipo) : '', c.nome].filter(Boolean).join(' · ') : R.formatPhone(c.celular);
      return `<button type="button" class="cli-sug" data-act="m-cli" data-id="${c.id}"><span class="avatar sm" data-nome="${esc(titulo)}" data-tom="${tomDe(titulo)}">${esc(R.initials(titulo))}</span><span class="t"><b>${esc(titulo)}</b><span>${esc(sub)}${ult ? ` · última compra ${esc(R.formatDate(ult, 'curta'))}` : ''}</span></span></button>`;
    }).join('')}</div>` : '');
    const blocoCliente = at
      ? `<fieldset class="box emp"><legend>Empresa</legend>
          <div class="grid2">${campoDoc('m', M.docTipo, M.cnpj, e.cnpj, 'data-m')}
          <div class="field"><label for="m-empresa">${M.docTipo === 'cpf' ? 'Nome completo' : 'Razão social'}</label><input class="input" id="m-empresa" data-m="empresa" value="${esc(M.empresa)}" placeholder="${M.docTipo === 'cpf' ? 'Como está no CPF' : 'Como está no CNPJ'}" autocomplete="off" ${inv('empresa')}>${err('empresa')}${sugsCli('empresa')}</div></div>
          <div class="grid2"><div class="field"><label for="m-fantasia">Nome fantasia (opcional)</label><input class="input" id="m-fantasia" data-m="fantasia" value="${esc(M.fantasia)}" placeholder="Nome da fachada" autocomplete="off">${sugsCli('fantasia')}</div>
          <div class="field"><label for="m-nome">Nome do contato</label><input class="input" id="m-nome" data-m="nome" value="${esc(M.nome)}" placeholder="Quem compra pela empresa" autocomplete="off"></div></div>${M.cnpjInfo ? (M.cnpjInfo.fonte === 'loja' ? `<span class="doc-ok">${ic('check', 'ic-14')}Empresa já é cliente da loja. Dados preenchidos.</span>` : M.cnpjInfo.situacao && M.cnpjInfo.situacao !== 'ATIVA' ? `<span class="err">Na Receita, essa empresa está ${esc(M.cnpjInfo.situacao.toLowerCase())}.</span>` : `<span class="doc-ok">${ic('check', 'ic-14')}Dados da Receita Federal preenchidos.</span>`) : ''}</fieldset>`
      : `<div class="field"><label for="m-nome">Nome do cliente</label><input class="input" id="m-nome" data-m="nome" value="${esc(M.nome)}" placeholder="Nome e sobrenome" autocomplete="off" ${inv('nome')}>${err('nome')}${sugsCli('nome')}</div>`;

    // atacado: nota fiscal e valor numa linha, data e vendedor na outra (a nota precisa de espaço para o modelo)
    const corpoVenda = `${at ? `<div class="grid2 at-linha">${campoNota('m', modeloM(), M.cupom, e.cupom, 'data-m')}
        <div class="field"><label for="m-valor">Valor</label><div class="prefix"><span>R$</span><input class="input" id="m-valor" data-m="valor" value="${esc(M.valor)}" placeholder="0,00" inputmode="numeric" autocomplete="off" ${inv('valor')}></div>${err('valor')}</div></div>
      <div class="grid2 at-linha"><div class="field"><label for="m-data">Data da compra</label>${campoData(!!e.data)}${err('data')}</div>${vendSel}</div>
      <div class="field"><span class="legend">Chamar de novo em</span><div class="dias-linha"><div class="chips" id="m-dias">${diasHtml()}</div><p class="hint" id="m-prev">${prevLembretes()}</p></div>${err('dias')}</div>` : `<div class="grid3">
        <div class="field"><label for="m-cupom">Nº do cupom</label><input class="input" id="m-cupom" data-m="cupom" value="${esc(M.cupom)}" placeholder="Ex.: 004612" inputmode="numeric" autocomplete="off" ${inv('cupom')}>${err('cupom')}</div>
        <div class="field"><label for="m-valor">Valor</label><div class="prefix"><span>R$</span><input class="input" id="m-valor" data-m="valor" value="${esc(M.valor)}" placeholder="0,00" inputmode="numeric" autocomplete="off" ${inv('valor')}></div>${err('valor')}</div>
        <div class="field"><label for="m-data">Data da compra</label>${campoData(!!e.data)}${err('data')}</div></div>
      <div class="grid-vend">${vendSel}
        <div class="field"><span class="legend">Chamar de novo em</span><div class="chips" id="m-dias">${diasHtml()}</div>${err('dias')}</div></div>`}
      ${at ? '' : `<p class="hint" id="m-prev">${prevLembretes()}</p>`}
      ${M.obsAberta ? `<div class="field"><label for="m-obs">Observação (opcional)</label><textarea class="textarea" id="m-obs" data-m="obs" rows="2" style="min-height: 64px" placeholder="Ex.: comprou para presente">${esc(M.obs)}</textarea></div>` : ''}`;

    const corpoAviso = `<div class="field"><label for="m-produto">Produto</label><input class="input" id="m-produto" data-m="produto" value="${esc(M.produto)}" placeholder="Ex.: Óleo de coco 500 ml" autocomplete="off" ${inv('produto')}>${err('produto')}<div id="m-sugs">${sugsHtml()}</div></div>
      <div class="grid3" style="grid-template-columns:120px 180px minmax(0,1fr);align-items:start"><div class="field"><span class="legend">Quantidade</span><div class="qty"><button type="button" data-act="m-qtd" data-v="-1" aria-label="Menos">−</button><input id="m-qtd" data-m="quantidade" value="${M.quantidade}" inputmode="numeric" aria-label="Quantidade"><button type="button" data-act="m-qtd" data-v="1" aria-label="Mais">+</button></div></div>
        ${vendSel}
        <div class="field"><label for="m-obs">Observação (opcional)</label><input class="input" id="m-obs" data-m="obs" value="${esc(M.obs)}" placeholder="Ex.: prefere a marca X" autocomplete="off"></div></div>`;

    const pb = (act, v, cur, label, icon) => `<button type="button" role="radio" aria-checked="${cur === v}" data-act="${act}" data-v="${v}">${icon ? ic(icon, 'ic-16') : ''}${label}</button>`;
    patch(root, `<div class="overlay${fx ? ' fx' : ''}" data-act="modal-fora"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="m-t">
      <header>${M.fixo ? `<div style="display:flex;align-items:baseline;gap: var(--sp-6);min-width:0;flex:1"><h2 id="m-t" style="flex:none">Nova venda</h2><span class="small muted ell">${esc([...new Set([nomeCli(clienteFixo()), clienteFixo().tipo === 'atacado' ? clienteFixo().empresa : R.formatPhone(clienteFixo().celular)].filter(Boolean))].join(' · '))}</span></div>` : '<h2 id="m-t">Nova venda</h2>'}<button type="button" class="round" data-act="modal-fechar" aria-label="Fechar" title="Fechar (Esc)">${ic('x', 'ic-20')}</button></header>
      ${M.fixo ? '' : '<div class="switches">'}${M.fixo ? '' : `<div class="pills" role="radiogroup" aria-label="O que aconteceu no balcão">${pb('m-modo', 'venda', M.modo, 'Registrar venda', 'sacola')}${pb('m-modo', 'aviso', M.modo, 'Avisar cliente', 'sino')}</div>
        <div class="pills" role="radiogroup" aria-label="Tipo de cliente">${pb('m-tipo', 'varejo', M.tipo, 'Varejo')}${pb('m-tipo', 'atacado', M.tipo, 'Atacado')}</div></div>`}
      <form data-form="modal" novalidate><div class="body">
        ${M.fixo ? '' : `<div class="field"><label for="m-cel">${at ? 'Celular do contato' : 'Celular do cliente'}</label><input class="input big" id="m-cel" data-m="celular" value="${esc(M.celular)}" placeholder="(00) 00000-0000" inputmode="tel" autocomplete="off" ${inv('celular')}>${err('celular')}<div id="m-known">${knownHtml()}</div></div>
        ${blocoCliente}`}
        ${venda ? corpoVenda : corpoAviso}
      </div>
      <footer>${venda && !M.obsAberta ? '<button type="button" class="link blue" data-act="m-obs">Adicionar observação</button>' : '<span></span>'}
        <div class="right"><button type="button" class="btn ghost" data-act="modal-fechar">Cancelar</button><button type="submit" class="btn primary lg" ${M.salvando ? 'disabled' : ''}>${venda ? 'Salvar venda' : 'Salvar pedido'}</button></div></footer></form>
    </section></div>`);
  }

  function modalInput(el) {
    const k = el.dataset.m;
    let v = el.value;
    if (k === 'celular') { v = R.maskPhone(v); el.value = v; }
    if (k === 'produto') M.codigo = '';
    if (k === 'valor') { v = R.maskMoney(v); el.value = v; }
    if (k === 'cnpj') { v = R.maskDoc(v, M.docTipo); el.value = v; }
    if (k === 'quantidade') v = Math.max(1, Math.min(999, parseInt(String(v).replace(/\D/g, ''), 10) || 1));
    M[k] = v;
    if (M.errors[k]) delete M.errors[k];
    if (k === 'celular') {
      const c = clienteConhecido();
      if (c && M.knownId !== c.id) preencherCliente(c);
      else if (!c) M.knownId = null;
    }
    // varejo: ao digitar o nome, mostra os clientes já salvos
    // atacado: ao digitar a razão social ou o nome fantasia, mostra as empresas já salvas
    const campoBusca = M.tipo === 'atacado' ? ['empresa', 'fantasia'] : ['nome'];
    if (campoBusca.includes(k) && !M.fixo) {
      const q = R.keyOf(v);
      const at = M.tipo === 'atacado';
      M.sugCampo = k;
      M.sugCli = q.length >= 2 && !M.knownId
        ? S.data.clientes.filter((c) => !c.excluido && (at ? c.tipo === 'atacado' && R.keyOf(`${c.empresa || ''} ${c.fantasia || ''} ${c.nome}`).includes(q) : c.tipo !== 'atacado' && R.keyOf(c.nome).includes(q))).slice(0, 6) : null;
    }
    if (k === 'cnpj') {
      M.cnpjInfo = null;
      const doc = String(v).replace(/\D/g, '');
      if (M.docTipo !== 'cpf' && doc.length === 14 && R.isValidCnpj(doc)) buscarCnpj(doc);
    }
    if (k === 'vendedorId') ls.set('ultimoVendedor', v);
    renderModal();
  }

  async function modalSubmit() {
    if (!M || M.salvando) return;
    const outro = $('#m-outro');
    if (outro && outro.value) addOutroDia(outro.value);
    M.salvando = true;
    const base = { tipo: M.tipo, celular: M.celular, nome: M.nome, empresa: M.empresa, fantasia: M.fantasia, cnpj: M.cnpj, docTipo: M.docTipo, vendedorId: M.vendedorId, obs: M.obs };
    const venda = M.modo === 'venda';
    const r = venda
      ? await api.acao('registrarVenda', Object.assign(base, { cupom: M.cupom, modelo: M.tipo === 'atacado' ? modeloM() : '', valor: M.valor, data: M.data, dias: M.dias, retornoDe: M.retornoDe }))
      : await api.acao('registrarEncomenda', Object.assign(base, { produto: M.produto, codigo: M.codigo || '', quantidade: M.quantidade }));
    M.salvando = false;
    if (!r.ok) {
      M.errors = r.fields || {};
      const ordem = ['celular', 'empresa', 'nome', 'cnpj', 'produto', 'cupom', 'valor', 'data', 'vendedorId', 'dias'];
      const ids = { celular: 'm-cel', empresa: 'm-empresa', nome: 'm-nome', cnpj: 'm-cnpj', produto: 'm-produto', cupom: 'm-cupom', valor: 'm-valor', data: 'm-data', vendedorId: 'm-vend', dias: 'm-cel' };
      const first = ordem.find((k) => M.errors[k]);
      renderModal();
      if (first) focar(ids[first]);
      if (!r.fields || !first) toast(r.error, { erro: true });
      return;
    }
    if (M.vendedorId) ls.set('ultimoVendedor', M.vendedorId);
    const nome = M.tipo === 'atacado' ? R.clean(M.fantasia || M.empresa || M.nome) : R.firstName(M.nome);
    const datas = R.normalizeDias(M.dias).map((n) => R.formatDate(R.addDays(M.data, n), 'curta'));
    const lista = datas.length > 1 ? `${datas.slice(0, -1).join(', ')} e ${datas[datas.length - 1]}` : datas[0];
    const produto = M.produto;
    const doRetorno = !!M.retornoDe;
    fecharModal();
    S.data = r.data.estado;
    render();
    if (doRetorno) { S.sel = null; render(); return; }
    if (venda) toast(`Venda salva. ${nome} entra na fila em ${lista}.`);
    else toast(`Pedido salvo. Quando ${R.clean(produto)} chegar, o Retornei lembra de avisar ${nome}.`);
  }

  function addOutroDia(v) {
    const n = Math.round(Number(v));
    if (!Number.isFinite(n) || n < 1 || n > 365) {
      toast('Use um prazo entre 1 e 365 dias.', { erro: true });
      return false;
    }
    if (!M.dias.includes(n)) M.dias.push(n);
    M.dias = R.normalizeDias(M.dias);
    M.outro = false;
    return true;
  }

  // ============================================================ eventos

  async function onClick(ev) {
    if (ev.target.closest && ev.target.closest('.logo-full, .lig-logo')) {
      const agora = Date.now();
      cliquesLogo = cliquesLogo.filter((t) => agora - t < 2000).concat(agora);
      if (cliquesLogo.length >= 5) { cliquesLogo = []; abrirMestra(); return; }
    }
    if (DD.open && !ev.target.closest('.dd')) {
      DD.open = null;
      redesenhar();
    }
    const t = ev.target.closest('[data-act]');
    if (M && M.focoProduto && !ev.target.closest('#m-produto') && !ev.target.closest('#m-sugs')) {
      M.focoProduto = false;
      renderModal();
    }
    if (!t) return;
    const a = t.dataset.act;
    const id = t.dataset.id;
    const v = t.dataset.v;
    if ((a === 'modal-fora' || a === 'drawer-fora' || a === 'rs-fora' || a === 'imp-fora' || a === 'ev-fora' || a === 'am-fora') && ev.target !== t) return;
    if (ADM_ACTS.has(a) && !ehAdmin()) { pedirAdmin(); return; }

    switch (a) {
      case 'adm-entrar': pedirAdmin(); break;
      case 'equipe-aba': S.equipeAba = v; render(); break;
      case 'tour-abrir': abrirTour(); break;
      case 'tour-prox': TP = Math.min(TOUR.length - 1, TP + 1); renderTour(); break;
      case 'tour-voltar': TP = Math.max(0, TP - 1); renderTour(); break;
      case 'tour-fechar': fecharTour(); break;
      case 'aj-topico': S.ajudaTopico = v; S.faqAberta = 0; render(); { const m = $('#main'); if (m) m.scrollTop = 0; } break;
      case 'aj-faq': S.faqAberta = S.faqAberta === Number(v) ? -1 : Number(v); render(); break;
      case 'manual-pdf': {
        S.ajudaManual = true;
        render();
        document.body.classList.add('imprimindo');
        const r = await api.pdf(`manual-retornei-${R.keyOf(S.data.loja.nome) || 'loja'}`);
        document.body.classList.remove('imprimindo');
        S.ajudaManual = false;
        render();
        if (r && r.ok && r.data) toast('Manual salvo em PDF.');
        else if (r && !r.ok) toast(r.error, { erro: true });
        break;
      }
      case 'adm-sair': sairAdmin(); break;
      case 'am-esqueci': {
        if (!AM || AM.enviandoLink) break;
        if (AM.escolhido === '__outro') AM.email = ($('#am-email') || {}).value || '';
        const em = (AM.escolhido === '__outro' ? AM.email : AM.escolhido).trim();
        if (!em) { AM.erro = 'Digite o e-mail primeiro.'; renderAM(); focar('am-email'); break; }
        AM.enviandoLink = true; AM.erro = ''; renderAM();
        const r = await window.Nuvem.esqueciSenha(em);
        if (!AM) break;
        AM.enviandoLink = false;
        if (r.ok) AM.enviado = em.toLowerCase(); else AM.erro = r.error;
        renderAM();
        break;
      }
      case 'cn-esqueci': {
        const c = S.conectar;
        c.email = ($('#cn-email') || {}).value || c.email;
        c.senha = ($('#cn-senha') || {}).value || '';
        c.pc = ($('#cn-pc') || {}).value || c.pc;
        if (!c.email.trim()) { c.erro = 'Digite o e-mail primeiro.'; render(); focar('cn-email'); break; }
        c.erro = '';
        const r = await window.Nuvem.esqueciSenha(c.email);
        if (r.ok) c.enviado = c.email.trim().toLowerCase(); else c.erro = r.error;
        render();
        break;
      }
      case 'am-pick': if (AM) { AM.escolhido = v; AM.erro = ''; AM.enviado = ''; renderAM(); focar(v === '__outro' ? 'am-email' : 'am-senha'); } break;
      case 'am-fechar': case 'am-fora': AM = null; renderAM(); break;
      case 'vend-excluir': {
        const vd = maps().vend.get(id);
        if (vd && await confirmar({ titulo: 'Excluir vendedor', texto: `${vd.nome} sai da equipe. As vendas dele continuam nos relatórios.`, ok: 'Excluir', perigo: true })) {
          await act('excluirVendedor', { id }, { toast: 'Vendedor excluído.' });
        }
        break;
      }
      case 'rel-pdf': {
        document.body.classList.add('imprimindo');
        const r = await api.pdf(`relatorio-${R.keyOf(S.data.loja.nome) || 'loja'}-${S.today}`);
        document.body.classList.remove('imprimindo');
        if (r && r.ok && r.data) toast('PDF salvo.');
        else if (r && !r.ok) toast(r.error, { erro: true });
        break;
      }
      case 'rel-imprimir':
        document.body.classList.add('imprimindo');
        await api.imprimir();
        document.body.classList.remove('imprimindo');
        break;
      case 'pc-desconectar':
        if (await confirmar({ titulo: 'Desconectar este computador?', texto: 'Os dados da loja continuam salvos.', ok: 'Desconectar', perigo: true })) {
          const r = await window.Nuvem.desconectar();
          if (r.ok) { S.data = r.data; S.adm = null; render(); }
        }
        break;
      case 'adm-add': {
        const email = $('#adm-novo-email').value.trim().toLowerCase();
        const nome = R.clean($('#adm-novo-nome').value, 40);
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast('Informe um e-mail válido.', { erro: true }); focar('adm-novo-email'); break; }
        if (listaAdmins().some((x) => x.email === email)) { toast('Esse e-mail já está na lista.', { erro: true }); break; }
        const rc = await window.Nuvem.criarAdmin(email);
        if (!rc.ok) { toast(rc.error, { erro: true }); break; }
        const nomeNovo = nome || nomeAdmin(email);
        const ra = await act('salvarAdmins', { admins: admsDaTela().concat({ email, nome: nomeNovo, funcao: 'Administrador' }) }, { silent: true });
        if (ra && ra.ok) {
          ['adm-novo-email', 'adm-novo-nome'].forEach((k) => { const el = $('#' + k); if (el) el.value = ''; });
          toast(rc.novo ? `Acesso criado para ${R.firstName(nomeNovo)}. Vai chegar um e-mail para criar a senha.` : 'Administrador cadastrado com sucesso.');
        }
        break;
      }
      case 'adm-rm': {
        const l = admsDaTela();
        const x = l[Number(v)];
        if (!x) break;
        if (S.adm && x.email === S.adm.email) { toast('Você não pode tirar a si mesmo da lista.', { erro: true }); break; }
        l.splice(Number(v), 1);
        await act('salvarAdmins', { admins: l }, { toast: 'Administrador removido.' });
        break;
      }
      case 'nav':
        if (S.det) fecharDet(true);
        S.view = v;
        if (v === 'ajustes') carregarInfo();
        render();
        $('#main').scrollTop = 0;
        break;
      case 'menu': S.menuMin = !S.menuMin; ls.set('menuMin', S.menuMin); render(); break;
      case 'menu-modo': S.menuMin = v === 'recolhido'; ls.set('menuMin', S.menuMin); render(); break;
      case 'comprou': {
        const x = acharItem(id);
        if (x) novoModal({ modo: 'venda', cliente: x.c, retornoDe: x.l.id });
        break;
      }
      case 'novo': novoModal(S.view === 'encomendas' ? { modo: 'aviso' } : undefined); break;
      case 'novo-aviso': novoModal({ modo: 'aviso' }); break;
      case 'modal-fechar': case 'modal-fora': fecharModal(); break;
      case 'drawer-fechar': case 'drawer-fora': fecharCliente(); break;

      case 'resumo': abrirResumo(); break;
      case 'rs-fechar': case 'rs-fora': fecharResumo(); break;
      case 'rs-trocar': RS.editarZap = true; renderResumo(); focar('rs-zap'); break;
      case 'rs-aviso': await act('salvarConfig', { avisoAtivo: t.checked }, { toast: t.checked ? `O Retornei vai avisar todo dia às ${S.data.config.avisoHora || '08:30'}.` : 'Aviso da manhã desligado.' }); renderResumo(); break;
      case 'aviso-ativo': await act('salvarConfig', { avisoAtivo: v === '1' }); break;
      case 'rel-periodo': S.relPeriodo = v; ls.set('relPeriodo', v); render(); break;
      case 'rel-todas': S.relTodas = !S.relTodas; render(); break;
      case 'importar-planilha': abrirImport(); break;
      case 'prod-importar': await importarProdutos(); break;
      case 'imp-fechar': case 'imp-fora': fecharImport(); break;
      case 'imp-escolher': await escolherPlanilha(); break;
      case 'imp-voltar': I.passo -= 1; renderImport(); break;
      case 'imp-conferir': I.passo = 3; renderImport(); break;
      case 'imp-importar': await importar(); break;
      case 'imp-passados': I.passados = t.checked; I.conf = null; renderImport(); break;

      case 'entrar-google': S.setup.etapa = 'loja'; render(); focar('su-loja'); break;

      case 'dd': {
        if (DD.open === v) DD.open = null;
        else {
          DD.open = v;
          const d = ddDados(v);
          DD.idx = Math.max(0, d.opts.findIndex((x) => x.v === d.cur));
        }
        redesenhar();
        break;
      }
      case 'dd-pick': ddEscolher(t.dataset.dd, v); break;
      case 'dd-clear': ddEscolher(t.dataset.dd, ''); break;
      case 'cal':
        if (DD.open === 'm-data') DD.open = null;
        else { DD.open = 'm-data'; DD.mes = alvoData().data.slice(0, 7); }
        renderAlvo();
        break;
      case 'cal-nav': {
        const [y, m] = DD.mes.split('-').map(Number);
        const d = new Date(y, m - 1 + Number(v), 1);
        DD.mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        renderAlvo();
        break;
      }
      case 'cal-pick':
        alvoData().data = v;
        delete alvoData().errors.data;
        DD.open = null;
        renderAlvo();
        focar('m-data');
        break;
      case 'periodo': S.periodo = v; ls.set('periodo', v); render(); break;
      case 'sel': S.sel = id; abrirDet(); render(); break;
      case 'det-fechar': fecharDet(); break; // WEB
      case 'recomecar': if (await confirmar({ titulo: 'Recomeçar o teste?', texto: 'Os dados deste aparelho voltam ao começo.', ok: 'Recomeçar', perigo: true })) window.RetorneiTeste.recomecar(); break;
      case 'wa': await marcarFeito(id, true); break;
      case 'feito': await marcarFeito(id, false); break;
      case 'desfazer': await act('desfazerContato', { id }); break;
      case 'res': {
        const l = S.data.lembretes.find((x) => x.id === id);
        await act('resultadoContato', { id, resultado: l && l.resultado === v ? null : v });
        break;
      }
      case 'pular': {
        const prox = proximoDe(id);
        S.pulados = S.pulados.filter((p) => p !== id).concat(id);
        const px = prox && acharItem(prox);
        if (px && px.st !== 'agendado') S.sel = prox;
        render();
        break;
      }
      case 'adiar': {
        const x = acharItem(id);
        S.sel = proximoDe(id);
        await act('adiarLembrete', { id, data: R.addDays(S.today, 1) }, {
          toast: `${x ? nomeCli(x.c) : 'Cliente'} volta para a fila amanhã.`,
          undo: x ? () => act('adiarLembrete', { id, data: x.l.data < S.today ? S.today : x.l.data }) : null,
        });
        break;
      }

      case 'enc-tab': S.encTab = v; render(); break;
      case 'enc-chegou': {
        const prod = t.dataset.produto;
        const n = S.data.encomendas.filter((e) => e.status === 'esperando' && cliOk(e.clienteId) && R.keyOf(e.produto) === R.keyOf(prod)).length;
        await act('produtoChegou', { produto: prod }, { toast: `${plural(n, 'cliente para avisar', 'clientes para avisar')}. Use o botão Avisar de cada um.` });
        break;
      }
      case 'enc-wa': {
        const e = S.data.encomendas.find((x) => x.id === id);
        const c = e && maps().cli.get(e.clienteId);
        if (!c) break;
        const txt = R.renderTemplate(S.data.config.mensagemEncomenda, varsMsg(c, e.vendedorId, { produto: e.produto }));
        if (await abrirWhats(c.celular, txt)) await act('encomendaAvisada', { id }, { toast: `${nomeCli(c)} avisado. Quando vier, marque Comprou ou Desistiu.` });
        break;
      }
      case 'enc-avisado': await act('encomendaAvisada', { id }); break;
      case 'enc-comprou': await act('encerrarEncomenda', { id, resultado: 'comprou' }, { toast: 'Pedido marcado como comprado.', undo: () => act('reabrirEncomenda', { id }) }); break;
      case 'enc-desistiu': await act('encerrarEncomenda', { id, resultado: 'desistiu' }, { toast: 'Pedido encerrado.', undo: () => act('reabrirEncomenda', { id }) }); break;
      case 'enc-reabrir': await act('reabrirEncomenda', { id }, { toast: 'Pedido reaberto.' }); break;

      case 'cli-tipo': S.buscaTipo = v; render(); break;
      case 'cli-ck': if (S.selCli.has(id)) S.selCli.delete(id); else S.selCli.add(id); render(); break;
      case 'cli-ck-todos': {
        const { lista } = listaClientes();
        if (S.selCli.size && S.selCli.size === lista.length) S.selCli.clear();
        else lista.forEach((o) => S.selCli.add(o.c.id));
        render();
        break;
      }
      case 'sel-todos': listaClientes().lista.forEach((o) => S.selCli.add(o.c.id)); render(); break;
      case 'sel-limpar': S.selCli.clear(); render(); break;
      case 'sel-excluir': await excluirSelecionados(); break;
      case 'cliente': abrirCliente(id); break;
      case 'cn-rest': if (ehAdmin()) restaurarCopia(t.dataset.id, t.dataset.q); break;
      case 'cn-todas': if (S.copias) { S.copias.todas = true; render(); } break;
      case 'cn-recarregar': S.copias = null; render(); break;
      case 'cli-wa': {
        const c = maps().cli.get(S.clienteId);
        if (c) abrirWhats(c.celular, '');
        break;
      }
      case 'cli-venda': case 'cli-aviso': {
        const c = maps().cli.get(S.clienteId);
        fecharCliente();
        novoModal({ modo: a === 'cli-venda' ? 'venda' : 'aviso', cliente: c });
        break;
      }
      case 'cli-edit-tipo': S.cliEdit.tipo = v; S.cliEdit.erros = {}; renderDrawer(); break;
      case 'lem-cancelar': await act('cancelarLembrete', { id }, { toast: 'Lembrete cancelado.', undo: () => act('desfazerContato', { id }) }); break;
      case 'venda-editar': abrirEV(id); break;
      case 'ev-fechar': case 'ev-fora': fecharEV(); break;
      case 'ev-dia': {
        const n = Number(v);
        EV.dias = EV.dias.includes(n) ? EV.dias.filter((d) => d !== n) : R.normalizeDias(EV.dias.concat(n));
        delete EV.errors.dias;
        renderEV();
        break;
      }
      case 'ev-excluir': {
        const ok = await confirmar({ titulo: 'Excluir esta venda?', texto: 'Os contatos que ainda não foram feitos para essa venda também saem da fila.', ok: 'Excluir venda', perigo: true });
        if (ok) { const vid = EV.id; fecharEV(); await act('excluirVenda', { id: vid }, { toast: 'Venda excluída.' }); }
        break;
      }
      case 'abrir-win': await act('salvarConfig', { abrirComWindows: v === '1' }, { toast: v === '1' ? 'O Retornei vai abrir junto com o Windows.' : 'O Retornei não vai mais abrir sozinho.' }); break;
      case 'venda-excluir': {
        const ok = await confirmar({ titulo: 'Excluir esta venda?', texto: 'Os contatos que ainda não foram feitos para essa venda também saem da fila.', ok: 'Excluir venda', perigo: true });
        if (ok) await act('excluirVenda', { id }, { toast: 'Venda excluída.' });
        break;
      }
      case 'cli-excluir': {
        const c = maps().cli.get(S.clienteId);
        const ok = await confirmar({ titulo: `Excluir ${nomeCli(c)}?`, texto: 'As vendas e os retornos agendados também saem.', ok: 'Excluir', perigo: true });
        if (ok) {
          const cid = S.clienteId;
          S.clienteId = null;
          await act('excluirCliente', { id: cid }, { toast: 'Cliente excluído.' });
        }
        break;
      }

      case 'ren': S.renomear = id; render(); { const el = document.getElementById(`ren-${id}`); if (el) { el.focus(); el.select(); } } break;
      case 'ren-cancelar': S.renomear = null; render(); break;
      case 'vend-ativo': await act('ativarVendedor', { id, ativo: v === '1' }); break;

      case 'aj-sec':
        S.ajustesSec = v;
        if (v === 'dados' || v === 'aparencia') carregarInfo();
        render();
        break;
      case 'prazo-rm': {
        const k = t.dataset.tipo === 'atacado' ? 'diasAtacado' : 'diasVarejo';
        await act('salvarConfig', { [k]: S.data.config[k].filter((d) => d !== Number(v)) });
        break;
      }
      case 'msg-var': {
        const ta = document.getElementById(`msg-${t.dataset.k}`);
        const ins = `{${v}}`;
        const s = ta.selectionStart || ta.value.length;
        const e2 = ta.selectionEnd || s;
        ta.value = ta.value.slice(0, s) + ins + ta.value.slice(e2);
        ta.focus();
        ta.setSelectionRange(s + ins.length, s + ins.length);
        msgPreview(ta);
        break;
      }
      case 'msg-padrao': {
        const ok = await confirmar({ titulo: 'Voltar ao texto original?', texto: 'As três mensagens voltam ao texto que veio com o Retornei.', ok: 'Voltar ao original' });
        if (ok) {
          await act('salvarConfig', { mensagemVarejo: R.MSG_VAREJO, mensagemAtacado: R.MSG_ATACADO, mensagemEncomenda: R.MSG_ENCOMENDA }, { toast: 'Mensagens restauradas.' });
          $$('[data-msg]').forEach((ta) => { ta.value = S.data.config[ta.dataset.msg]; msgPreview(ta); });
        }
        break;
      }
      case 'tema': await act('salvarConfig', { tema: v }); aplicarTema(); break;
      case 'wa-modo': await act('salvarConfig', { whatsappModo: v }, { toast: v === 'web' ? 'O WhatsApp vai abrir no navegador.' : v === 'app' ? 'O WhatsApp vai abrir no aplicativo do computador.' : 'O Retornei escolhe: aplicativo, se estiver instalado.' }); break;
      case 'exportar': {
        const r = await api.exportar();
        if (!r.ok) toast(r.error, { erro: true });
        else if (r.data) toast('Cópia salva.');
        break;
      }
      case 'importar': {
        const r = await api.importar();
        if (!r.ok) toast(r.error, { erro: true });
        else if (r.data) { S.data = r.data; aplicarTema(); render(); toast('Cópia restaurada.'); }
        break;
      }
      case 'abrir-pasta': api.abrirPasta(); break;
      case 'upd-reiniciar':
        if (api.updInstalar) {
          document.body.insertAdjacentHTML('beforeend', `<div class="upd-tela"><span class="upd-logo"><svg width="46" height="46" viewBox="0 0 100 100" aria-hidden="true"><g class="upd-bolha"><path d="${BOLHA}" fill="currentColor"/><polyline class="upd-ck" points="33 43 45 55 67 33" fill="none" stroke="var(--surface)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g></svg><span class="upd-nome">retornei</span></span><span class="upd-tx">Atualização em andamento<span class="upd-d"></span></span><span class="upd-barra"><i></i></span><span class="upd-pct">0%</span></div>`);
          const t0 = performance.now();
          await new Promise((fim) => {
            const passo = (agora) => {
              const dt = Math.max(0, agora - t0);
              const t = Math.min(1, dt / 2600);
              const pr = Math.round(100 * (1 - Math.pow(1 - t, 3)));
              const tela = document.querySelector('.upd-tela');
              if (tela) {
                tela.querySelector('.upd-barra i').style.width = `${pr}%`;
                tela.querySelector('.upd-pct').textContent = `${pr}%`;
                tela.querySelector('.upd-d').textContent = '.'.repeat(Math.floor(dt / 400) % 4);
              }
              if (t < 1) requestAnimationFrame(passo); else setTimeout(fim, 250);
            };
            requestAnimationFrame(passo);
          });
          await api.updInstalar();
        }
        break;
      case 'ua-atualizar':
        if (UA && api.updInstalar) {
          if (S.upd.estado === 'pronto') uaInstalar();
          else { UA.fase = 'baixando'; UA.pr = Math.min(99, S.upd.pct || 0); renderUA(); }
        }
        break;
      case 'ua-depois': UA = null; renderUA(); break;
      case 'upd-depois': S.updDepois = true; render(); toast('A atualização entra quando o Retornei fechar.'); break;
      case 'upd-procurar': if (api.updProcurar && S.upd.instalado) { S.upd = { ...S.upd, estado: 'procurando' }; render(); await api.updProcurar(); } break;

      case 'm-modo': M.modo = v; M.errors = {}; renderModal(); focar('m-cel'); break;
      case 'm-cli': { const c = maps().cli.get(id); if (c) { preencherCliente(c); renderModal(); focar(M.modo === 'venda' ? 'm-cupom' : 'm-produto'); } break; }
      case 'm-tipo':
        if (M.tipo !== v) {
          M.tipo = v;
          M.dias = S.data.config[v === 'atacado' ? 'diasAtacado' : 'diasVarejo'].slice();
          M.errors = {};
          renderModal();
          focar(v === 'atacado' ? 'm-empresa' : 'm-nome');
        }
        break;
      case 'm-dia': {
        const n = Number(v);
        M.dias = M.dias.includes(n) ? M.dias.filter((d) => d !== n) : R.normalizeDias(M.dias.concat(n));
        delete M.errors.dias;
        renderModal();
        break;
      }
      case 'm-outro': M.outro = true; renderModal(); focar('m-outro'); break;
      case 'm-obs': M.obsAberta = true; renderModal(); focar('m-obs'); break;
      case 'm-qtd': M.quantidade = Math.max(1, Math.min(999, (Number(M.quantidade) || 1) + Number(v))); renderModal(); break;
      case 'm-cat': {
        const pr = (S.data.produtos || []).find((x) => x.id === v);
        if (!pr) break;
        M.produto = pr.nome;
        M.codigo = pr.codigo;
        M.focoProduto = false;
        delete M.errors.produto;
        renderModal();
        focar('m-qtd');
        break;
      }
      case 'm-sug':
        M.produto = v;
        M.focoProduto = false;
        delete M.errors.produto;
        renderModal();
        $('#m-produto').value = v;
        focar('m-vend');
        break;
      default:
        break;
    }
  }

  function carregarInfo() {
    api.info().then((r) => { if (r.ok) { S.info = r.data; if (S.view === 'ajustes') render(); } });
  }

  function msgPreview(ta) {
    const p = document.getElementById(`prev-${ta.dataset.msg}`);
    if (p) p.textContent = R.renderTemplate(ta.value, exemploVars(ta.dataset.msg));
  }

  /** Lista de administradores como está na tela (com nomes e funções editados). */
  function admsDaTela() {
    return listaAdmins().map((a, i) => {
      const campo = (c) => { const el = document.querySelector(`[data-adm="${i}"][data-campo="${c}"]`); return el ? el.value : a[c]; };
      return { email: a.email, nome: R.clean(campo('nome'), 40) || a.nome, funcao: R.clean(campo('funcao'), 40) || a.funcao };
    });
  }

  function onInput(ev) {
    const el = ev.target;
    const fs = el.closest && el.closest('form[data-form]');
    if (fs && ['loja', 'mensagens', 'admins'].includes(fs.dataset.form) && el.id !== 'adm-novo-email' && el.id !== 'adm-novo-nome') {
      const k = fs.dataset.form;
      if (!SUJO[k]) { SUJO[k] = true; const b = fs.querySelector('[data-salvar]'); if (b) b.disabled = false; }
    }
    if (el.id === 'prod-busca') { S.prodBusca = el.value; render(); return; }
    if (el.id === 'aj-busca') {
      S.ajudaBusca = el.value;
      const q = R.keyOf(el.value);
      const t = (window.AJUDA_CONTEUDO || { topicos: [] }).topicos.find((x) => R.keyOf(`${x.titulo} ${x.lead} ${x.passos.map((p) => `${p[0]} ${p[1]}`).join(' ')} ${x.dica || ''}`).includes(q));
      if (q && t) S.ajudaTopico = t.id;
      render();
      return;
    }
    const cn = { 'cn-email': 'email', 'cn-senha': 'senha', 'cn-pc': 'pc' }[el.id];
    if (cn) { S.conectar[cn] = el.value; return; }
    if (AM && (el.id === 'am-senha' || el.id === 'am-email')) { AM[el.id === 'am-senha' ? 'senha' : 'email'] = el.value; return; }
    if (el.dataset.m && M) return modalInput(el);
    if (el.dataset.ev && EV) {
      let v = el.value;
      if (el.dataset.ev === 'valor') { v = R.maskMoney(v); el.value = v; }
      EV[el.dataset.ev] = v;
      if (EV.errors[el.dataset.ev]) { delete EV.errors[el.dataset.ev]; renderEV(); }
      return;
    }
    if (el.dataset.rs && RS) { el.value = R.maskPhone(el.value); RS.zap = el.value; RS.erro = ''; return; }
    if (el.dataset.mask === 'tel') { el.value = R.maskPhone(el.value); return; }
    if (el.dataset.su) {
      if (el.dataset.su === 'zap') el.value = R.maskPhone(el.value);
      S.setup[el.dataset.su] = el.value;
      const tinhaErro = Object.keys(S.setup.erro || {}).length > 0;
      if (tinhaErro) S.setup.erro = {};
      if (tinhaErro || el.dataset.su === 'nome') render();
      return;
    }
    if (el.dataset.ce && S.cliEdit) {
      let v = el.value;
      if (el.dataset.ce === 'celular') { v = R.maskPhone(v); el.value = v; }
      if (el.dataset.ce === 'cnpj') { v = R.maskDoc(v, S.cliEdit.docTipo); el.value = v; delete S.cliEdit.erros.cnpj; }
      S.cliEdit[el.dataset.ce] = v;
      if (el.dataset.ce === 'cnpj') renderDrawer();
      return;
    }
    if (el.id === 'fila-msg') { S.msgEdit[el.dataset.lid] = el.value; return; }
    if (el.id === 'busca') { S.busca[S.view] = el.value; render(); return; }
    if (el.dataset.msg) msgPreview(el);
  }

  function onChange(ev) {
    const el = ev.target;
    if (el.id === 'filtro-vend') { S.filtroVend = el.value; ls.set('filtroVend', el.value); render(); }
    if (el.id === 'filtro-tipo') { S.filtroTipo = el.value; ls.set('filtroTipo', el.value); render(); }
    if (el.dataset.m === 'vendedorId' && M) modalInput(el);
  }

  function onFocusIn(ev) {
    if (ev.target.id === 'm-produto' && M && !M.focoProduto) { M.focoProduto = true; renderModal(); }
  }

  async function onSubmit(ev) {
    const f = ev.target.closest('form[data-form]');
    if (!f) return;
    ev.preventDefault();
    const k = f.dataset.form;
    if (ADM_FORMS.has(k) && !ehAdmin()) { pedirAdmin(); return; }
    if (k === 'conectar') return conectarSubmit();
    if (k === 'am') return amSubmit();
    if (k === 'admins') return salvarForm(k, () => act('salvarAdmins', { admins: admsDaTela() }));
    if (k === 'modal') return modalSubmit();
    if (k === 'venda-edit') return salvarEV();
    if (k === 'setup') return setupSubmit();
    if (k === 'cliente') return salvarCliente();
    if (k === 'loja') return salvarForm(k, () => act('salvarLoja', { nome: $('#aj-loja').value, whatsapp: $('#aj-zap').value }));
    if (k === 'resumo') return enviarResumo();
    if (k === 'vendedor') {
      const r = await act('addVendedor', { nome: $('#vend-novo').value }, { toast: 'Vendedor adicionado.' });
      if (r.ok) { const n = $('#vend-novo'); n.value = ''; n.focus(); }
      return;
    }
    if (k === 'renomear') {
      const r = await act('renomearVendedor', { id: f.dataset.id, nome: $(`#ren-${f.dataset.id}`).value });
      if (r.ok) { S.renomear = null; render(); }
      return;
    }
    if (k === 'prazo') {
      const tipo = f.dataset.tipo;
      const ck = tipo === 'atacado' ? 'diasAtacado' : 'diasVarejo';
      const inp = $(`#prazo-${tipo}`);
      const n = Number(inp.value);
      if (!Number.isFinite(n) || n < 1 || n > 365) { toast('Use um prazo entre 1 e 365 dias.', { erro: true }); return; }
      const r = await act('salvarConfig', { [ck]: S.data.config[ck].concat(n) });
      if (r.ok) { inp.value = ''; inp.focus(); }
      return;
    }
    if (k === 'mensagens') {
      const p = {};
      $$('[data-msg]').forEach((ta) => { p[ta.dataset.msg] = ta.value; });
      return salvarForm(k, () => act('salvarConfig', p));
    }
  }

  function onKey(ev) {
    if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && (ev.key === 'M' || ev.key === 'm')) { ev.preventDefault(); abrirMestra(); return; }
    if (AM && ev.key === 'Escape') { AM = null; renderAM(); return; }
    if (TP !== null && ev.key === 'Escape') { fecharTour(); return; }
    if (TP !== null && ev.key === 'ArrowRight' && TP < TOUR.length - 1) { TP++; renderTour(); return; }
    if (TP !== null && ev.key === 'ArrowLeft' && TP > 0) { TP--; renderTour(); return; }
    // Delete ou Backspace num campo de lista apaga a escolha
    if ((ev.key === 'Delete' || ev.key === 'Backspace') && ev.target.classList && ev.target.classList.contains('dd-btn')) {
      ev.preventDefault();
      ddEscolher(ev.target.id, '');
      return;
    }
    if (DD.open) {
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); const id = DD.open; DD.open = null; redesenhar(); const b = document.getElementById(id); if (b) b.focus(); return; }
      if (DD.open !== 'm-data') {
        const d = ddDados(DD.open);
        if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
          ev.preventDefault();
          const n = d.opts.length;
          DD.idx = ((DD.idx < 0 ? 0 : DD.idx) + (ev.key === 'ArrowDown' ? 1 : -1) + n) % n;
          redesenhar();
          return;
        }
        if (ev.key === 'Enter') {
          ev.preventDefault();
          const x = d.opts[DD.idx];
          if (x) ddEscolher(DD.open, x.v);
          return;
        }
      }
    }
    if (ev.key === 'Escape') {
      if ($('#confirm-root').innerHTML) return;
      if (M) { ev.preventDefault(); fecharModal(); return; }
      if (EV) { ev.preventDefault(); fecharEV(); return; }
      if (RS) { ev.preventDefault(); fecharResumo(); return; }
      if (I) { ev.preventDefault(); fecharImport(); return; }
      if (S.clienteId) { ev.preventDefault(); fecharCliente(); return; }
      if (S.renomear) { S.renomear = null; render(); return; }
      if (S.view === 'clientes' && S.selCli.size) { S.selCli.clear(); render(); return; }
    }
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'n' || ev.key === 'N') && S.data && S.data.loja.nome) {
      ev.preventDefault();
      if (!M) novoModal(S.view === 'encomendas' ? { modo: 'aviso' } : undefined);
    }
    if (ev.key === 'Enter' && ev.target.id === 'm-outro') {
      ev.preventDefault();
      if (addOutroDia(ev.target.value)) renderModal();
    }
  }

  function aplicarTema() {
    const t = S.data && S.data.config.tema;
    const html = document.documentElement;
    if (t === 'claro' || t === 'escuro') html.setAttribute('data-theme', t);
    else html.removeAttribute('data-theme');
    if (api.tema) api.tema(t || 'sistema');
  }

  // ============================================================ início

  async function init() {
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocusIn);
    // dica flutuante (menu recolhido): fica por cima de tudo, sem ser cortada pelo menu
    document.addEventListener('mouseover', (ev) => {
      const el = ev.target.closest && ev.target.closest('[data-dica]');
      let d = document.getElementById('dica');
      if (!el) { if (d) d.remove(); return; }
      if (!d) { d = document.createElement('div'); d.id = 'dica'; d.className = 'tipfix'; document.body.appendChild(d); }
      d.textContent = el.dataset.dica;
      const r = el.getBoundingClientRect();
      d.style.left = `${r.right + 12}px`;
      d.style.top = `${r.top + r.height / 2 - 15}px`;
    });
    abertura();
    const r = await api.estado();
    if (!r.ok) {
      $('#root').innerHTML = `<div class="welcome"><div class="card"><h1>Não deu para abrir os dados</h1><p class="wrap">${esc(r.error)}</p></div></div>`;
      return;
    }
    S.data = r.data;
    if (window.Nuvem) {
      window.Nuvem.iniciar(api, S.data, (d) => {
        if (d) S.data = d;
        if (S.filtroVend && !S.data.vendedores.some((v) => v.id === S.filtroVend)) S.filtroVend = '';
        render();
        if (AM) renderAM();
      });
    }
    if (S.filtroVend && !S.data.vendedores.some((v) => v.id === S.filtroVend)) S.filtroVend = '';
    aplicarTema();
    if (document.fonts && document.fonts.load) {
      try { await Promise.race([document.fonts.load('400 14px Inter'), new Promise((ok) => setTimeout(ok, 800))]); } catch (_) { /* nada */ }
    }
    render();
    if (api.updEstado) {
      api.updEstado().then((r) => { if (r && r.ok) { S.upd = r.data; render(); uaAoAbrir(S.upd); } });
      if (api.aoUpd) api.aoUpd((u) => { S.upd = { ...S.upd, ...u }; render(); uaAoAbrir(S.upd); uaMudou(S.upd); });
    }
    if (api.aoIr) api.aoIr((view) => { if (S.data && S.data.loja.nome) { S.view = view; render(); } });
    if (!S.data.loja.nome) { const f = $('#su-loja'); if (f) f.focus(); }
    setInterval(() => {
      const t = R.todayISO();
      if (t !== S.today) {
        S.today = t;
        S.pulados = [];
        render();
      }
    }, 60000);
  }

  // lista ou calendário aberto no modal: a caixa cresce embaixo para caber (nada vaza) e a janela desce o necessário
  const caberNoModal = () => document.querySelectorAll('.dialog').forEach((d) => {
    const l = d.querySelector('.dd-list, .cal');
    const antes = d.style.paddingBottom;
    d.style.paddingBottom = '';
    if (!l) return;
    const falta = Math.ceil(l.getBoundingClientRect().bottom - d.getBoundingClientRect().bottom + 24);
    if (falta > 0) d.style.paddingBottom = `${falta}px`;
    if (!l.dataset.visto) { l.dataset.visto = '1'; l.scrollIntoView({ block: 'nearest' }); }
    else if (antes !== d.style.paddingBottom) l.scrollIntoView({ block: 'nearest' });
  });
  new MutationObserver(() => requestAnimationFrame(caberNoModal)).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', caberNoModal);
  // contorno de foco só para quem navega pelo teclado (clicar com o mouse não deixa contorno)
  document.addEventListener('mousedown', () => document.documentElement.classList.add('mouse'), true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.documentElement.classList.remove('mouse'); }, true);
  // cada pessoa sempre com o mesmo tom de avatar
  function tomDe(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return (h % 6) + 1; }
  const tomDeAntigo = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return (h % 6) + 1; };
  const pintarAvatares = () => document.querySelectorAll('.avatar').forEach((a) => {
    const k = a.dataset.nome || a.textContent.trim();
    const t = String(tomDe(k));
    if (a.dataset.tom !== t) a.dataset.tom = t;
  });
  new MutationObserver(() => requestAnimationFrame(pintarAvatares)).observe(document.body, { childList: true, subtree: true });
  // Tab não escapa do modal aberto para a tela de trás
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Tab') return;
    const ovs = [...document.querySelectorAll('.overlay, .ua-tela')].filter((o) => o.getClientRects().length);
    const top = ovs[ovs.length - 1];
    if (!top) return;
    const foc = [...top.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((e) => e.getClientRects().length);
    if (!foc.length) return;
    const first = foc[0], last = foc[foc.length - 1];
    if (!top.contains(document.activeElement)) { ev.preventDefault(); first.focus(); return; }
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });
  // com a tela de atualização aberta, atalhos do app não agem por trás; Esc = Depois
  document.addEventListener('keydown', (ev) => {
    if (!UA) return;
    if (ev.key === 'Escape' && UA.fase === 'pergunta') { UA = null; renderUA(); }
    // Enter sem nada focado = Atualizar (sem foco automático, para não acender o contorno de teclado na abertura)
    if (ev.key === 'Enter' && UA.fase === 'pergunta' && !$('#ua-root').contains(document.activeElement)) { ev.preventDefault(); $('#ua-ok').click(); }
    if (!['Tab', 'Enter', ' '].includes(ev.key)) ev.stopImmediatePropagation();
  }, true);
  window.__prazzo = { S, render };
  init();
})();
