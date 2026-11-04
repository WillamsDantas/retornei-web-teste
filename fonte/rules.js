/**
 * Regras do Retornei: datas, lembretes, validação, máscaras e mensagens.
 * Funções puras, sem disco e sem rede. Roda no processo principal (require)
 * e na interface (window.PrazzoRules).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PrazzoRules = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DIAS_VAREJO = [15, 30];
  const DIAS_ATACADO = [15, 30];
  const MAX_DIAS = 365;

  const MSG_VAREJO =
    'Olá, {primeiro_nome}! Aqui é {vendedor}, da {loja}. Passando para saber como está sua compra. Posso ajudar em algo?';
  const MSG_ATACADO =
    'Olá, {primeiro_nome}! Aqui é {vendedor}, da {loja}. Chegou reposição dos produtos que a {empresa} costuma levar. Quer que eu separe seu pedido?';
  const MSG_ENCOMENDA =
    'Olá, {primeiro_nome}! Aqui é {vendedor}, da {loja}. Chegou o {produto} que você pediu. Quer que eu separe para você?';

  // ---------------------------------------------------------------- datas

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayISO = (now) => toISO(now || new Date());

  function parseISO(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.getMonth() === Number(m[2]) - 1 ? d : null;
  }

  function addDays(iso, n) {
    const d = parseISO(iso);
    if (!d) return null;
    d.setDate(d.getDate() + Number(n));
    return toISO(d);
  }

  function diffDays(a, b) {
    const x = parseISO(a);
    const y = parseISO(b);
    if (!x || !y) return NaN;
    return Math.round((y - x) / 86400000);
  }

  /** Dia local (AAAA-MM-DD) de um horário ISO. */
  function localDay(isoDateTime) {
    const d = new Date(isoDateTime);
    return Number.isNaN(d.getTime()) ? '' : toISO(d);
  }

  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const SEMANA_CURTA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  function formatDate(iso, style) {
    const d = parseISO(iso);
    if (!d) return '';
    if (style === 'curta') return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    if (style === 'longa') return `${SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  function relativeDay(iso, today) {
    const n = diffDays(today, iso);
    if (!Number.isFinite(n)) return '';
    if (n === 0) return 'hoje';
    if (n === 1) return 'amanhã';
    if (n === -1) return 'ontem';
    return n > 0 ? `em ${n} dias` : `há ${-n} dias`;
  }

  // ---------------------------------------------------------------- lembretes

  function normalizeDias(list) {
    const out = new Set();
    for (const v of list || []) {
      const n = Math.round(Number(v));
      if (Number.isFinite(n) && n >= 1 && n <= MAX_DIAS) out.add(n);
    }
    return [...out].sort((a, b) => a - b);
  }

  /** pendente → atrasado | hoje | agendado; contatado e cancelado ficam como estão. */
  function lembreteStatus(l, today) {
    if (l.status === 'contatado' || l.status === 'cancelado') return l.status;
    const n = diffDays(today, l.data);
    if (n < 0) return 'atrasado';
    if (n === 0) return 'hoje';
    return 'agendado';
  }

  // ---------------------------------------------------------------- telefone

  function normalizePhone(v) {
    let d = String(v || '').replace(/\D/g, '');
    if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
    return d;
  }
  const isValidPhone = (d) => /^[1-9]{2}9?\d{8}$/.test(d);

  function formatPhone(v) {
    const d = normalizePhone(v);
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return d;
  }

  function maskPhone(v) {
    const d = String(v || '').replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  // ---------------------------------------------------------------- dinheiro

  function parseMoney(v) {
    if (typeof v === 'number') return v;
    let s = String(v || '').replace(/[^\d,.-]/g, '');
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) && s !== '' ? Math.round(n * 100) / 100 : NaN;
  }
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatMoney = (n) => (Number.isFinite(Number(n)) ? brl.format(Number(n)) : '');

  function maskMoney(v) {
    const d = String(v || '').replace(/\D/g, '').replace(/^0+/, '').slice(0, 10);
    if (!d) return '';
    const c = d.padStart(3, '0');
    return `${c.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${c.slice(-2)}`;
  }

  // ---------------------------------------------------------------- CNPJ

  function formatCnpj(v) {
    const d = String(v || '').replace(/\D/g, '');
    if (d.length !== 14) return d;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  }
  function maskCnpj(v) {
    const d = String(v || '').replace(/\D/g, '').slice(0, 14);
    let o = d.slice(0, 2);
    if (d.length > 2) o += `.${d.slice(2, 5)}`;
    if (d.length > 5) o += `.${d.slice(5, 8)}`;
    if (d.length > 8) o += `/${d.slice(8, 12)}`;
    if (d.length > 12) o += `-${d.slice(12)}`;
    return o;
  }

  // ---------------------------------------------------------------- CPF

  function maskCpf(v) {
    const d = String(v || '').replace(/\D/g, '').slice(0, 11);
    let o = d.slice(0, 3);
    if (d.length > 3) o += `.${d.slice(3, 6)}`;
    if (d.length > 6) o += `.${d.slice(6, 9)}`;
    if (d.length > 9) o += `-${d.slice(9)}`;
    return o;
  }

  function isValidCpf(v) {
    const d = String(v || '').replace(/\D/g, '');
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    const dig = (n) => {
      let s = 0;
      for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i);
      const r = (s * 10) % 11;
      return r === 10 ? 0 : r;
    };
    return dig(9) === Number(d[9]) && dig(10) === Number(d[10]);
  }

  function isValidCnpj(v) {
    const d = String(v || '').replace(/\D/g, '');
    if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
    const dig = (n) => {
      const w = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let s = 0;
      for (let i = 0; i < n; i++) s += Number(d[i]) * w[i];
      const r = s % 11;
      return r < 2 ? 0 : 11 - r;
    };
    return dig(12) === Number(d[12]) && dig(13) === Number(d[13]);
  }

  const docTipoDe = (t) => (t === 'cpf' ? 'cpf' : 'cnpj');
  const maskDoc = (v, t) => (docTipoDe(t) === 'cpf' ? maskCpf(v) : maskCnpj(v));
  const formatDoc = (v, t) => maskDoc(v, t);

  /** '' quando vazio ou incompleto, 'ok' quando confere, 'erro' quando os dígitos não batem. */
  function docSituacao(v, t) {
    const d = String(v || '').replace(/\D/g, '');
    const n = docTipoDe(t) === 'cpf' ? 11 : 14;
    if (d.length < n) return '';
    return (docTipoDe(t) === 'cpf' ? isValidCpf(d) : isValidCnpj(d)) ? 'ok' : 'erro';
  }

  // ---------------------------------------------------------------- texto

  const clean = (s, max) => String(s || '').trim().replace(/\s+/g, ' ').slice(0, max || 200);
  const firstName = (n) => clean(n).split(' ')[0] || '';
  /** Chave para comparar nomes de produto e de vendedor: sem acento, sem caixa. */
  const keyOf = (s) =>
    clean(s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();

  function initials(nome) {
    const p = clean(nome).split(' ').filter(Boolean);
    if (!p.length) return '?';
    return ((p[0][0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }

  function renderTemplate(tpl, vars) {
    return String(tpl || '')
      .replace(/\{(\w+)\}/g, (_m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : ''))
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  function whatsappUrl(phone, text) {
    return `https://wa.me/55${normalizePhone(phone)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  }

  function newId(prefix) {
    const r =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
        : Math.random().toString(36).slice(2, 14);
    return `${prefix}_${r}`;
  }


  // ---------------------------------------------------------------- fila do dia (aviso e resumo)

  const nomeCliente = (c) => (c.tipo === 'atacado' ? c.fantasia || c.empresa || c.nome : c.nome);

  /** Quem está atrasado, quem é para hoje e quantos produtos chegaram sem aviso. */
  function filaDoDia(data, today) {
    const cli = new Map(data.clientes.map((c) => [c.id, c]));
    const venda = new Map(data.vendas.map((v) => [v.id, v]));
    const atrasados = [];
    const hoje = [];
    const vistos = new Set();
    const ls = data.lembretes.slice().sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0));
    for (const l of ls) {
      const c = cli.get(l.clienteId);
      const v = venda.get(l.vendaId);
      if (!c || c.excluido || !v || v.excluida) continue;
      const st = lembreteStatus(l, today);
      if ((st !== 'atrasado' && st !== 'hoje') || vistos.has(c.id)) continue;
      vistos.add(c.id);
      (st === 'atrasado' ? atrasados : hoje).push(nomeCliente(c));
    }
    const chegou = data.encomendas.filter((e) => e.status === 'chegou' && cli.get(e.clienteId) && !cli.get(e.clienteId).excluido).length;
    return { atrasados, hoje, chegou };
  }

  // ---------------------------------------------------------------- importar planilha

  const CAMPOS_IMPORT = [
    ['nome', 'Nome'], ['celular', 'Celular'], ['empresa', 'Razão social'], ['fantasia', 'Nome fantasia'],
    ['documento', 'CNPJ ou CPF'], ['tipo', 'Tipo (varejo ou atacado)'], ['cupom', 'Nº do cupom'], ['modelo', 'Modelo da nota (55 ou 65)'], ['ultimaCompra', 'Data da compra'],
    ['valor', 'Valor da compra'], ['vendedor', 'Vendedor'], ['', 'Não importar'],
  ];

  /** Adivinha o campo do Retornei pelo título da coluna da planilha. */
  function adivinharCampo(titulo) {
    const k = keyOf(titulo);
    if (!k) return '';
    if (/vendedor|atendente|vendedora/.test(k)) return 'vendedor';
    if (/modelo/.test(k)) return 'modelo';
    if (/cupom|nota fiscal|^nf|numero da venda|n da venda/.test(k)) return 'cupom';
    if (/valor|total|preco|r\$/.test(k)) return 'valor';
    if (/fantasia/.test(k)) return 'fantasia';
    if (/razao|social|empresa/.test(k)) return 'empresa';
    if (/cnpj|cpf|documento/.test(k)) return 'documento';
    if (/cel|fone|telefone|whats|zap/.test(k)) return 'celular';
    if (/^tipo|categoria|varejo|atacado/.test(k)) return 'tipo';
    if (/data|ultima|compra/.test(k)) return 'ultimaCompra';
    if (/nome|cliente|contato/.test(k)) return 'nome';
    return '';
  }

  /** Aceita 2026-10-05, 05/10/2026, 05/10/26 e 05-10-2026. */
  function parseDataBR(v) {
    const s = clean(v, 30);
    let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return parseISO(`${m[1]}-${m[2]}-${m[3]}`) ? `${m[1]}-${m[2]}-${m[3]}` : '';
    m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(s);
    if (!m) return '';
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    const iso = `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return parseISO(iso) ? iso : '';
  }

  /** Confere uma linha já ligada aos campos. Linha sem celular válido ou sem nome fica de fora. */
  function linhaImport(o, today) {
    const celular = normalizePhone(o.celular);
    if (!celular) return { ok: false, erro: 'Sem celular' };
    if (!isValidPhone(celular)) return { ok: false, erro: 'Celular inválido' };
    let doc = String(o.documento || '').replace(/\D/g, '');
    if (doc.length === 10) doc = `0${doc}`;
    if (doc.length === 13) doc = `0${doc}`;
    const docTipo = doc.length === 11 ? 'cpf' : 'cnpj';
    const docOk = !!doc && (docTipo === 'cpf' ? isValidCpf(doc) : isValidCnpj(doc));
    const empresa = clean(o.empresa, 120);
    const fantasia = clean(o.fantasia, 80);
    const nome = clean(o.nome, 80);
    const tk = keyOf(o.tipo);
    const tipo = /atac/.test(tk) ? 'atacado' : /varej/.test(tk) ? 'varejo' : empresa || fantasia || (docOk && docTipo === 'cnpj') ? 'atacado' : 'varejo';
    if (tipo === 'varejo' && nome.length < 2) return { ok: false, erro: 'Sem nome' };
    if (tipo === 'atacado' && (empresa || fantasia || nome).length < 2) return { ok: false, erro: 'Sem nome da empresa' };
    let ultimaCompra = parseDataBR(o.ultimaCompra);
    if (ultimaCompra && today && ultimaCompra > today) ultimaCompra = '';
    const at = tipo === 'atacado';
    return {
      ok: true,
      value: {
        tipo, celular, nome: nome || fantasia || empresa,
        empresa: at ? empresa || fantasia || nome : '', fantasia: at ? fantasia : '',
        cnpj: at && docOk ? doc : '', docTipo: at && docOk ? docTipo : 'cnpj', ultimaCompra,
      },
    };
  }

  /**
   * Monta o plano da importação: clientes (um por celular), vendas (uma por linha com cupom)
   * e retornos. Usado na tela (para conferir) e no serviço (para gravar), então os números batem.
   * linhas: objetos já ligados aos campos, com __linha (número na planilha).
   * opts: { vendedorPadrao, incluirPassados }
   */
  function planoImport(linhas, data, today, opts) {
    const o = opts || {};
    const existentes = new Set(data.clientes.filter((c) => !c.excluido).map((c) => c.celular));
    // vendas de clientes excluídos não contam como repetidas
    const cliOk = new Set(data.clientes.filter((c) => !c.excluido).map((c) => c.id));
    const vendasJa = new Set(data.vendas.filter((v) => !v.excluida && cliOk.has(v.clienteId)).map((v) => `${keyOf(v.cupom)}|${v.data}`));
    const porNome = new Map(data.vendedores.map((v) => [keyOf(v.nome), v]));
    const padrao = data.vendedores.find((v) => v.id === o.vendedorPadrao && v.ativo) || null;
    const clientes = new Map();
    const vendas = [];
    const problemas = [];
    let semVendedor = 0;
    (linhas || []).forEach((raw, i) => {
      const n = raw.__linha || i + 2;
      const quem = clean(raw.nome || raw.fantasia || raw.empresa || '', 40) || '(sem nome)';
      const r = linhaImport(raw, today);
      if (!r.ok) { problemas.push({ n, quem, erro: r.erro }); return; }
      const v = r.value;
      const prev = clientes.get(v.celular);
      if (!prev) clientes.set(v.celular, { ...v });
      else {
        for (const k of ['nome', 'empresa', 'fantasia', 'cnpj']) if (!prev[k] && v[k]) prev[k] = v[k];
        if (v.cnpj && prev.cnpj === v.cnpj) prev.docTipo = v.docTipo;
        if (v.tipo === 'atacado' && prev.tipo !== 'atacado') { prev.tipo = 'atacado'; prev.empresa = prev.empresa || v.empresa; }
        if (v.ultimaCompra && (!prev.ultimaCompra || v.ultimaCompra > prev.ultimaCompra)) prev.ultimaCompra = v.ultimaCompra;
      }
      const cupom = clean(raw.cupom, 40);
      if (!cupom) return;
      if (!v.ultimaCompra) { problemas.push({ n, quem, erro: parseDataBR(raw.ultimaCompra) ? 'Data da compra no futuro' : 'Venda sem data da compra' }); return; }
      const valor = parseMoney(raw.valor);
      if (!Number.isFinite(valor) || valor <= 0) { problemas.push({ n, quem, erro: 'Venda sem valor' }); return; }
      const chave = `${keyOf(cupom)}|${v.ultimaCompra}`;
      if (vendasJa.has(chave)) { problemas.push({ n, quem, erro: `Cupom ${cupom} já registrado nessa data` }); return; }
      let vend = raw.vendedor ? porNome.get(keyOf(raw.vendedor)) : null;
      if (!vend) { vend = padrao; if (vend) semVendedor++; }
      if (!vend) { problemas.push({ n, quem, erro: raw.vendedor ? `Vendedor "${clean(raw.vendedor, 30)}" não está na Equipe` : 'Venda sem vendedor' }); return; }
      vendasJa.add(chave);
      vendas.push({ celular: v.celular, cupom, valor, data: v.ultimaCompra, vendedorId: vend.id, modelo: v.tipo === 'atacado' ? modeloDe(raw.modelo) : '' });
    });
    let retornos = 0;
    let primeiro = '';
    for (const vd of vendas) {
      const tipo = clientes.get(vd.celular).tipo;
      const dias = data.config[tipo === 'atacado' ? 'diasAtacado' : 'diasVarejo'] || [];
      vd.dias = dias.filter((d) => o.incluirPassados || addDays(vd.data, d) >= today);
      retornos += vd.dias.length;
      for (const d of vd.dias) { const dt = addDays(vd.data, d); if (!primeiro || dt < primeiro) primeiro = dt; }
    }
    const lista = [...clientes.values()];
    const novos = lista.filter((c) => !existentes.has(c.celular)).length;
    return { clientes: lista, novos, existentes: lista.length - novos, vendas, retornos, primeiro, semVendedor, problemas };
  }

  // ---------------------------------------------------------------- validação

  function validateCliente(input) {
    const errors = {};
    const tipo = input.tipo === 'atacado' ? 'atacado' : 'varejo';
    const celular = normalizePhone(input.celular);
    const nome = clean(input.nome, 80);
    const empresa = tipo === 'atacado' ? clean(input.empresa, 120) : '';
    const fantasia = tipo === 'atacado' ? clean(input.fantasia, 80) : '';
    const docTipo = docTipoDe(input.docTipo);
    const cnpj = tipo === 'atacado' ? String(input.cnpj || '').replace(/\D/g, '').slice(0, docTipo === 'cpf' ? 11 : 14) : '';
    if (!celular) errors.celular = 'Informe o celular.';
    else if (!isValidPhone(celular)) errors.celular = 'Use DDD + número, ex.: (82) 99999-9999.';
    if (tipo === 'atacado') {
      if (empresa.length < 2) errors.empresa = docTipo === 'cpf' ? 'Informe o nome completo.' : 'Informe a razão social.';
    } else if (nome.length < 2) errors.nome = 'Informe o nome do cliente.';
    if (cnpj) {
      const nome2 = docTipo === 'cpf' ? 'CPF' : 'CNPJ';
      const n = docTipo === 'cpf' ? 11 : 14;
      if (cnpj.length !== n) errors.cnpj = `O ${nome2} tem ${n} números.`;
      else if (!(docTipo === 'cpf' ? isValidCpf(cnpj) : isValidCnpj(cnpj))) errors.cnpj = `${nome2} inválido. Confira os números.`;
    }
    return { errors, value: { tipo, celular, nome: nome || fantasia || empresa, empresa, fantasia, cnpj, docTipo: tipo === 'atacado' ? docTipo : 'cnpj' } };
  }

  /** Modelo da nota no atacado: '55' (NF-e), '65' (NFC-e) ou '' quando não informado. */
  function modeloDe(x) {
    const k = keyOf(x).replace(/[^a-z0-9]/g, '');
    if (!k) return '';
    if (/65|nfce|cupom|consumidor/.test(k)) return '65';
    if (/55|nfe|nota/.test(k)) return '55';
    return '';
  }

  function validateVenda(input, today) {
    const c = validateCliente(input);
    const errors = { ...c.errors };
    const cupom = clean(input.cupom, 40);
    const valor = parseMoney(input.valor);
    const data = String(input.data || '').trim();
    const dias = normalizeDias(input.dias);
    if (!cupom) errors.cupom = 'Informe o número do cupom.';
    if (!Number.isFinite(valor) || valor <= 0) errors.valor = 'Informe o valor.';
    if (!parseISO(data)) errors.data = 'Informe a data.';
    else if (today && diffDays(today, data) > 0) errors.data = 'A data não pode ser no futuro.';
    if (!input.vendedorId) errors.vendedorId = 'Escolha o vendedor.';
    if (!dias.length) errors.dias = 'Escolha pelo menos um prazo.';
    return {
      ok: Object.keys(errors).length === 0,
      errors,
      value: { ...c.value, cupom, valor, data, dias, vendedorId: input.vendedorId, obs: clean(input.obs, 500), modelo: modeloDe(input.modelo) },
    };
  }

  function validateEncomenda(input) {
    const c = validateCliente(input);
    const errors = { ...c.errors };
    const produto = clean(input.produto, 80);
    const quantidade = Math.max(1, Math.round(Number(input.quantidade) || 1));
    if (produto.length < 2) errors.produto = 'Informe o produto.';
    if (!input.vendedorId) errors.vendedorId = 'Escolha o vendedor.';
    return {
      ok: Object.keys(errors).length === 0,
      errors,
      value: { ...c.value, produto, codigo: clean(input.codigo, 30), quantidade, vendedorId: input.vendedorId, obs: clean(input.obs, 300) },
    };
  }

  return {
    DIAS_VAREJO, DIAS_ATACADO, MAX_DIAS, MSG_VAREJO, MSG_ATACADO, MSG_ENCOMENDA,
    MESES, SEMANA, SEMANA_CURTA,
    todayISO, parseISO, addDays, diffDays, localDay, formatDate, relativeDay,
    normalizeDias, lembreteStatus, modeloDe,
    normalizePhone, isValidPhone, formatPhone, maskPhone,
    parseMoney, formatMoney, maskMoney,
    formatCnpj, maskCnpj, maskCpf, isValidCpf, isValidCnpj, docTipoDe, maskDoc, formatDoc, docSituacao,
    clean, firstName, keyOf, initials, renderTemplate, whatsappUrl, newId,
    validateCliente, validateVenda, validateEncomenda,
    nomeCliente, filaDoDia, CAMPOS_IMPORT, adivinharCampo, parseDataBR, linhaImport, planoImport,
  };
});
