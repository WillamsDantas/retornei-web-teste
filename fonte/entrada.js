// Retornei — protótipo web (PWA) de teste.
// Usa as regras reais do app (service.js, rules.js) rodando no navegador.
// Os dados ficam só neste aparelho (localStorage). Não há ligação com a nuvem da loja.
'use strict';
const R = require('./rules');
const { emptyData, normalize } = require('./store');
const { makeService, AppError, ACOES } = require('./service');

const CHAVE = 'retornei-teste.dados';

class StoreWeb {
  constructor() {
    this.dir = 'Este aparelho';
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (_) { raw = null; }
    this.data = raw ? normalize(raw, R) : emptyData(R);
    this.novo = !raw;
  }
  save() { try { localStorage.setItem(CHAVE, JSON.stringify(this.data)); } catch (_) { /* sem espaço: segue na memória */ } }
  backupComo() {}
  listBackups() { return []; }
}

// ---------------------------------------------------------------- dados de teste (datas contadas a partir de hoje)
function cnpj(base) {
  const d = base.split('').map(Number);
  const dv = (n) => { const p = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; const s = p.reduce((a, x, i) => a + x * d[i], 0) % 11; return s < 2 ? 0 : 11 - s; };
  d.push(dv(12)); d.push(dv(13));
  return d.join('');
}

function semear(svc, store) {
  svc.configurar({ lojaNome: 'Viva Nature', vendedores: ['Michele Ferreira', 'Ana Paula', 'Bruna Alves'] });
  const vend = store.data.vendedores.map((v) => v.id);
  const hoje = R.todayISO();
  let cupom = 4600;
  // [nome, celular, diasAtras, valor, prazos, vendedor, atacado?]
  const vendas = [
    ['Marcos Vinícius Dias', '82985072243', 15, '133,15', [15, 30], 0],
    ['Dona Lúcia', '82988033147', 15, '4153,72', [15, 30], 1, { empresa: 'Restaurante Sabor da Terra LTDA', fantasia: 'Sabor da Terra', cnpj: cnpj('046693440001'), modelo: '55' }],
    ['Ana Clara Moura', '82984702130', 17, '89,90', [15, 30], 2],
    ['João Pedro Lins', '82985812469', 15, '212,40', [15], 0],
    ['Rita Fernandes', '82982481452', 30, '56,00', [30], 1],
    ['Seu Raimundo', '82991230987', 15, '1870,00', [15, 30], 2, { empresa: 'Empório Natural Ponta Verde LTDA', fantasia: 'Empório Natural Ponta Verde', cnpj: cnpj('237845120001'), modelo: '65' }],
    ['Larissa Moura', '82987714520', 16, '291,54', [15, 30], 0],
    ['Juliana Prado', '82996632210', 15, '178,30', [15, 30], 1],
    ['Otávio Pereira', '82981156734', 12, '104,24', [15, 30], 2],
    ['Eduarda Nunes', '82998741236', 10, '234,89', [15, 30], 0],
    ['Carla Souza', '82993325478', 5, '67,50', [15, 30], 1],
    ['Pedro Henrique Costa', '82986654123', 2, '412,00', [15, 30], 2],
    ['Fernanda Lopes', '82984459871', 20, '145,70', [30], 0],
    ['Bruno Alves', '82999871254', 1, '98,40', [15, 30], 1],
    ['Dona Socorro', '82988541237', 8, '2340,15', [15, 30], 0, { empresa: 'Mercearia Bom Sabor ME', fantasia: 'Mercearia Bom Sabor', cnpj: cnpj('118765430001'), modelo: '55' }],
    ['Tiago Santana', '82983214785', 25, '59,90', [30], 2],
  ];
  for (const [nome, celular, atras, valor, dias, vi, at] of vendas) {
    const ent = { nome, celular, valor, dias, data: R.addDays(hoje, -atras), cupom: String(++cupom).padStart(6, '0'), vendedorId: vend[vi], tipo: at ? 'atacado' : 'varejo' };
    if (at) Object.assign(ent, { empresa: at.empresa, fantasia: at.fantasia, cnpj: at.cnpj, docTipo: 'cnpj', modelo: at.modelo });
    try { svc.registrarVenda(ent); } catch (e) { console.warn('semente', nome, e.message, e.fields); }
  }
  // um contato já feito hoje
  const ju = store.data.clientes.find((c) => c.nome === 'Juliana Prado');
  const lj = ju && store.data.lembretes.find((l) => l.clienteId === ju.id && l.data === hoje);
  if (lj) svc.marcarContatado({ id: lj.id });
  // pedidos de produtos em falta
  const pedidos = [
    ['Colágeno hidrolisado 300g', 'Carla Souza', '82993325478', 1],
    ['Chia em grãos 500g', 'Rita Fernandes', '82982481452', 0],
    ['Óleo de coco extravirgem 500ml', 'Bianca Rocha', '82997412365', 2],
  ];
  for (const [produto, nome, celular, vi] of pedidos) {
    try { svc.registrarEncomenda({ produto, nome, celular, quantidade: 1, vendedorId: vend[vi], tipo: 'varejo' }); } catch (e) { console.warn('pedido', e.message, e.fields); }
  }
  try { svc.produtoChegou({ produto: 'Chia em grãos 500g' }); } catch (e) { console.warn(e.message); }
}

// ---------------------------------------------------------------- window.api (mesmo formato do app do Windows)
const store = new StoreWeb();
const svc = makeService(store, R);
if (store.novo || !store.data.vendedores.length) { store.data = emptyData(R); semear(svc, store); }

const ok = (data) => ({ ok: true, data });
const fail = (e) => ({ ok: false, error: e instanceof AppError ? e.message : 'Algo deu errado. Tente de novo.', fields: e && e.fields });

window.api = {
  web: true,
  estado: async () => ok(svc.estado ? svc.estado() : store.data),
  acao: async (nome, args) => {
    try {
      if (!ACOES.includes(nome)) throw new AppError('Ação desconhecida.');
      return ok(svc[nome](args || {}));
    } catch (e) { if (!(e instanceof AppError)) console.error(e); return fail(e); }
  },
  // protótipo: abre o WhatsApp com a mensagem pronta, mas sem o número do cliente (os números são de teste)
  whatsapp: async (url) => {
    const m = /^https:\/\/wa\.me\/\d+(\?text=.*)?$/.exec(String(url || ''));
    if (!m) return { ok: false, error: 'Número de WhatsApp inválido.' };
    window.open(`https://wa.me/${m[1] || ''}`, '_blank', 'noopener');
    return ok(true);
  },
  info: async () => ok({ versao: await versaoAtual(), pasta: 'Este aparelho', backups: 0, ultimaCopia: 0 }),
  // atualização: mesma tela do Windows ("Atualização disponível" · Atualizar / Depois)
  updEstado: async () => ok({ estado: UPD.estado, versao: UPD.versao }),
  aoUpd: (fn) => { UPD.ouvintes.push(fn); },
  updInstalar: async () => {
    const w = UPD.reg && UPD.reg.waiting;
    UPD.pedido = true;
    if (w) w.postMessage('ativar'); else location.reload();
    return ok(true);
  },
  tema: async () => ok(true),
  imprimir: async () => { window.print(); return ok(true); },
  // PDF: a impressão do navegador tem "Salvar como PDF"; o nome sugerido vem do título da página
  pdf: (nome) => new Promise((fim) => {
    const titulo = document.title;
    document.title = String(nome || 'retornei');
    let feito = false;
    const pronto = () => { if (feito) return; feito = true; window.removeEventListener('afterprint', pronto); document.title = titulo; fim(ok(null)); };
    window.addEventListener('afterprint', pronto);
    setTimeout(() => { window.print(); setTimeout(pronto, 1500); }, 50);
  }),
};

// ---------------------------------------------------------------- atualização (PWA)
// A versão nova baixa sozinha por trás. O app mostra a tela "Atualização disponível" e só libera o uso
// depois de tocar em Atualizar (sem "Depois"). Se o app foi fechado de vez, já abre na versão nova.
const UPD = { estado: 'nenhum', versao: '', ouvintes: [], reg: null, pedido: false };
// nome da versão vem da publicação: retornei-teste-0.0.3-abc123 → "Beta 0.0.3"; retornei-web-1.2.0-abc123 → "1.2.0"
const numero = (k) => { const m = /-(\d+)\.(\d+)\.(\d+)-/.exec(k); return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0]; };
function rotulo(nome) {
  const m = /^retornei-(teste|web)-(\d+\.\d+\.\d+)-/.exec(nome || '');
  return m ? (m[1] === 'teste' ? 'Beta ' : '') + m[2] : '';
}
async function versoes() {
  try {
    const ks = (await caches.keys()).filter((k) => /^retornei-/.test(k));
    return ks.sort((a, b) => { const x = numero(a), y = numero(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
  } catch (_) { return []; }
}
async function versaoAtual() { const v = await versoes(); return rotulo(v[0]) || 'Beta'; }
async function avisarNova() {
  if (UPD.estado === 'pronto') return;
  const v = await versoes();
  UPD.estado = 'pronto';
  UPD.versao = rotulo(v[v.length - 1]) || 'nova';
  // com uma janela aberta (ex.: no meio de uma venda), espera ela fechar para não atrapalhar
  const mostrar = () => UPD.ouvintes.forEach((fn) => fn({ estado: UPD.estado, versao: UPD.versao }));
  if (!document.querySelector('.overlay')) return mostrar();
  const obs = new MutationObserver(() => { if (!document.querySelector('.overlay')) { obs.disconnect(); mostrar(); } });
  obs.observe(document.body, { childList: true, subtree: true });
}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (UPD.pedido) location.reload(); });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      UPD.reg = reg;
      const esperando = () => { if (reg.waiting && navigator.serviceWorker.controller) avisarNova(); };
      esperando();
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (w) w.addEventListener('statechange', () => { if (w.state === 'installed') esperando(); });
      });
      // confere ao abrir e sempre que a pessoa volta para o app (no máximo 1 vez por minuto; baixa só um arquivo pequeno)
      let ultima = 0;
      const conferir = () => {
        if (document.visibilityState !== 'visible' || Date.now() - ultima < 60 * 1000) return;
        ultima = Date.now();
        reg.update().catch(() => {});
      };
      conferir();
      document.addEventListener('visibilitychange', conferir);
      setInterval(conferir, 15 * 60 * 1000);
    }).catch(() => {});
  });
}

window.RetorneiTeste = {
  recomecar() { try { localStorage.removeItem(CHAVE); } catch (_) {} location.reload(); },
};
