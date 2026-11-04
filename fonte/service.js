/**
 * Operações do Retornei sobre os dados locais. Cada operação valida, altera,
 * grava e devolve o estado inteiro (o volume de uma loja cabe com folga).
 */
'use strict';
const Sync = require('./sync');

class AppError extends Error {
  constructor(message, fields) {
    super(message);
    this.fields = fields || null;
  }
}

function makeService(store, R, clock) {
  const now = () => (clock ? clock() : new Date());
  const today = () => R.todayISO(now());
  const stamp = () => now().toISOString();
  const D = () => store.data;

  const commit = () => {
    store.save();
    return D();
  };

  /** Venda ativa: não excluída e de um cliente que não foi excluído. */
  const vendaAtiva = (v) => !v.excluida && D().clientes.some((c) => c.id === v.clienteId && !c.excluido);

  const findOrFail = (list, id, what) => {
    const item = D()[list].find((x) => x.id === id);
    if (!item) throw new AppError(`${what} não encontrado.`);
    return item;
  };

  function vendedorAtivo(id) {
    const v = D().vendedores.find((x) => x.id === id);
    if (!v) throw new AppError('Vendedor não encontrado.', { vendedorId: 'Escolha o vendedor.' });
    if (!v.ativo) throw new AppError('Esse vendedor está desativado.', { vendedorId: 'Escolha outro vendedor.' });
    return v;
  }

  function addVendedorInterno(nome) {
    const n = R.clean(nome, 40);
    if (n.length < 2) throw new AppError('Informe o nome do vendedor.', { nome: 'Informe o nome.' });
    const dup = D().vendedores.find((v) => R.keyOf(v.nome) === R.keyOf(n));
    if (dup) {
      if (!dup.ativo || dup.excluido) {
        dup.ativo = true;
        dup.excluido = false;
        return dup;
      }
      throw new AppError('Já existe um vendedor com esse nome.', { nome: 'Esse nome já existe.' });
    }
    const v = { id: R.newId('vnd'), nome: n, ativo: true, criadoEm: stamp() };
    D().vendedores.push(v);
    return v;
  }

  /** Acha o cliente pelo celular; cria ou atualiza com o que veio no cadastro. */
  function upsertCliente(value) {
    let c = D().clientes.find((x) => !x.excluido && x.celular === value.celular);
    if (!c) {
      c = { id: R.newId('cli'), criadoEm: stamp(), excluido: false };
      D().clientes.push(c);
    }
    c.tipo = value.tipo;
    c.celular = value.celular;
    c.nome = value.nome;
    c.empresa = value.empresa || '';
    c.fantasia = value.fantasia || '';
    c.cnpj = value.cnpj || '';
    c.docTipo = value.docTipo || 'cnpj';
    return c;
  }

  const JANELA_RETORNO = 30;
  const RESULTADOS = ['nao_comprou', 'sem_resposta'];
  const DIAS_TENTATIVA = 3;
  /** Cancela a 2ª tentativa criada por um "Não respondeu", se ela ainda não foi feita. */
  function tirarTentativa(l) {
    if (!l.retentativaId) return;
    const t = D().lembretes.find((x) => x.id === l.retentativaId);
    if (t && t.status === 'pendente') t.status = 'cancelado';
    delete l.retentativaId;
  }

  function contatoDoRetorno(clienteId, dataVenda, pedido) {
    const usados = new Set(D().vendas.filter((v) => v.retornoDe && !v.excluida).map((v) => v.retornoDe));
    const ok = (l) => l.clienteId === clienteId && l.status === 'contatado' && l.contatadoEm && !usados.has(l.id)
      && R.localDay(l.contatadoEm) <= dataVenda && R.diffDays(R.localDay(l.contatadoEm), dataVenda) <= JANELA_RETORNO;
    if (pedido) {
      const l = D().lembretes.find((x) => x.id === pedido);
      return l && ok(l) ? l.id : null;
    }
    const cand = D().lembretes.filter(ok).sort((a, b) => (a.contatadoEm < b.contatadoEm ? 1 : -1));
    return cand.length ? cand[0].id : null;
  }

  const api = {
    estado: () => D(),

    configurar({ lojaNome, vendedores, whatsapp }) {
      const nome = R.clean(lojaNome, 60);
      const errors = {};
      if (nome.length < 2) errors.lojaNome = 'Informe o nome da loja.';
      const zap = R.normalizePhone(whatsapp);
      if (zap && !R.isValidPhone(zap)) errors.whatsapp = 'Use DDD + número, ex.: (82) 99999-9999.';
      const nomes = (vendedores || []).map((n) => R.clean(n, 40)).filter((n) => n.length >= 2);
      if (!nomes.length && !D().vendedores.length) errors.vendedores = 'Cadastre pelo menos um vendedor.';
      if (Object.keys(errors).length) throw new AppError('Confira os campos.', errors);
      D().loja.nome = nome;
      if (zap) D().loja.whatsapp = zap;
      for (const n of nomes) {
        if (!D().vendedores.some((v) => R.keyOf(v.nome) === R.keyOf(n))) addVendedorInterno(n);
      }
      return commit();
    },

    salvarLoja({ nome, whatsapp }) {
      if (nome !== undefined) {
        const n = R.clean(nome, 60);
        if (n.length < 2) throw new AppError('Informe o nome da loja.', { nome: 'Informe o nome da loja.' });
        D().loja.nome = n;
      }
      if (whatsapp !== undefined) {
        const zap = R.normalizePhone(whatsapp);
        if (zap && !R.isValidPhone(zap)) throw new AppError('Use DDD + número, ex.: (82) 99999-9999.', { whatsapp: 'Use DDD + número, ex.: (82) 99999-9999.' });
        D().loja.whatsapp = zap;
      }
      return commit();
    },

    /** Clientes e vendas vindos de uma planilha. Quem já existe (mesmo celular) só ganha o que faltava. */
    importarClientes({ linhas, vendedorPadrao, incluirPassados }) {
      if (!Array.isArray(linhas) || !linhas.length) throw new AppError('A planilha não tem linhas para importar.');
      if (linhas.length > 5000) throw new AppError('Importe no máximo 5.000 linhas por vez.');
      const plano = R.planoImport(linhas, D(), today(), { vendedorPadrao, incluirPassados });
      if (!plano.clientes.length) throw new AppError('Nenhuma linha tinha celular e nome válidos.');
      const porCel = new Map();
      for (const val of plano.clientes) {
        let c = D().clientes.find((x) => !x.excluido && x.celular === val.celular);
        if (c) {
          for (const k of ['nome', 'empresa', 'fantasia', 'cnpj']) if (!c[k] && val[k]) c[k] = val[k];
          if (val.cnpj && !c.docTipo) c.docTipo = val.docTipo;
          if (val.tipo === 'atacado' && c.tipo !== 'atacado' && (val.empresa || val.cnpj)) c.tipo = 'atacado';
        } else {
          c = { id: R.newId('cli'), criadoEm: stamp(), excluido: false, origem: 'planilha', tipo: val.tipo, celular: val.celular, nome: val.nome, empresa: val.empresa, fantasia: val.fantasia, cnpj: val.cnpj, docTipo: val.docTipo };
          D().clientes.push(c);
        }
        if (val.ultimaCompra && (!c.ultimaCompra || val.ultimaCompra > c.ultimaCompra)) c.ultimaCompra = val.ultimaCompra;
        porCel.set(val.celular, c);
      }
      for (const vd of plano.vendas) {
        const cli = porCel.get(vd.celular);
        const venda = { id: R.newId('vda'), clienteId: cli.id, cupom: vd.cupom, valor: vd.valor, data: vd.data, vendedorId: vd.vendedorId, obs: '', origem: 'planilha', criadoEm: stamp(), excluida: false };
        if (vd.modelo && cli.tipo === 'atacado') venda.modelo = vd.modelo;
        D().vendas.push(venda);
        for (const dias of vd.dias) {
          D().lembretes.push({ id: R.newId('lem'), vendaId: venda.id, clienteId: cli.id, dias, data: R.addDays(vd.data, dias), status: 'pendente', contatadoEm: null });
        }
      }
      commit();
      return { estado: D(), novos: plano.novos, atualizados: plano.existentes, vendas: plano.vendas.length, retornos: plano.retornos, ignorados: plano.problemas.length };
    },


    addVendedor({ nome }) {
      addVendedorInterno(nome);
      return commit();
    },

    renomearVendedor({ id, nome }) {
      const v = findOrFail('vendedores', id, 'Vendedor');
      const n = R.clean(nome, 40);
      if (n.length < 2) throw new AppError('Informe o nome do vendedor.', { nome: 'Informe o nome.' });
      if (D().vendedores.some((x) => x.id !== id && R.keyOf(x.nome) === R.keyOf(n))) {
        throw new AppError('Já existe um vendedor com esse nome.', { nome: 'Esse nome já existe.' });
      }
      v.nome = n;
      return commit();
    },

    ativarVendedor({ id, ativo }) {
      const v = findOrFail('vendedores', id, 'Vendedor');
      if (!ativo && D().vendedores.filter((x) => x.ativo && !x.excluido).length <= 1) {
        throw new AppError('A loja precisa de pelo menos um vendedor ativo.');
      }
      v.ativo = !!ativo;
      return commit();
    },

    /** Tira o vendedor da equipe. As vendas dele continuam nos relatórios com o nome. */
    excluirVendedor({ id }) {
      const v = findOrFail('vendedores', id, 'Vendedor');
      if (v.ativo && D().vendedores.filter((x) => x.ativo && !x.excluido).length <= 1) {
        throw new AppError('A loja precisa de pelo menos um vendedor ativo.');
      }
      v.excluido = true;
      v.ativo = false;
      v.excluidoEm = stamp();
      return commit();
    },

    /** Nomes que aparecem no "Entrar como administrador". As contas em si ficam no Firebase. */
    salvarAdmins({ admins }) {
      const vistos = new Set();
      const lista = [];
      for (const a of Array.isArray(admins) ? admins : []) {
        const email = String((a && a.email) || '').trim().toLowerCase().slice(0, 120);
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || vistos.has(email)) continue;
        vistos.add(email);
        lista.push({ email, nome: R.clean(a.nome || email.split('@')[0], 40), funcao: R.clean(a.funcao || 'Administrador', 40) });
      }
      D().loja.admins = lista;
      return commit();
    },

    // ---------------------------------------------------------- nuvem

    /** Liga este computador à loja. Começa do zero: o que estava aqui fica num backup. */
    nuvemConectar({ uid, nome, admin }) {
      const n = R.clean(nome, 40);
      if (!uid) throw new AppError('Não consegui identificar este computador.');
      if (n.length < 2) throw new AppError('Dê um nome para este computador.', { pcNome: 'Ex.: Balcão 01' });
      store.backupComo('antes-de-conectar');
      const cfg = D().config;
      const novo = require('./store').emptyData(R);
      for (const k of ['tema', 'visaoHoje', 'whatsappModo', 'avisoAtivo', 'avisoHora', 'abrirComWindows']) novo.config[k] = cfg[k];
      novo.nuvem = { pc: { uid: String(uid), nome: n }, cursor: 0, enviados: {} };
      if (admin && admin.email) novo.nuvem.ultimoAdmin = String(admin.email).toLowerCase();
      store.data = novo;
      return commit();
    },

    /** Junta o que veio da nuvem. */
    nuvemRemoto({ docs, cursor }) {
      const n = D().nuvem;
      if (!n) return D();
      const pares = Sync.aplicar(D(), docs);
      for (const [k, r] of pares) n.enviados[k] = r;
      if (Number(cursor) > n.cursor) n.cursor = Number(cursor);
      return commit();
    },

    /**
     * Restaura uma cópia da nuvem: os registros ficam como na cópia. Não marca como enviado,
     * então a diferença sobe sozinha para a nuvem e chega aos outros computadores.
     */
    restaurarCopia({ copia }) {
      if (!D().nuvem) throw new AppError('Este computador não está ligado à loja.');
      if (!Array.isArray(copia) || !copia.length) throw new AppError('Essa cópia está vazia.');
      store.backupComo('antes-de-restaurar');
      Sync.aplicar(D(), Sync.opsDaCopia(copia, D()));
      return commit();
    },

    /** Marca o que já chegou na nuvem. */
    nuvemEnviados({ pares }) {
      const n = D().nuvem;
      if (!n) return D();
      for (const [k, r] of Array.isArray(pares) ? pares : []) n.enviados[k] = r;
      return commit();
    },

    nuvemDesconectar() {
      store.backupComo('antes-de-desconectar');
      const cfg = D().config;
      const novo = require('./store').emptyData(R);
      for (const k of ['tema', 'visaoHoje', 'whatsappModo', 'avisoAtivo', 'avisoHora', 'abrirComWindows']) novo.config[k] = cfg[k];
      store.data = novo;
      return commit();
    },

    salvarConfig(partial) {
      const c = D().config;
      const p = partial || {};
      if (p.diasVarejo !== undefined) {
        const d = R.normalizeDias(p.diasVarejo);
        if (!d.length) throw new AppError('Deixe pelo menos um prazo para varejo.');
        c.diasVarejo = d;
      }
      if (p.diasAtacado !== undefined) {
        const d = R.normalizeDias(p.diasAtacado);
        if (!d.length) throw new AppError('Deixe pelo menos um prazo para atacado.');
        c.diasAtacado = d;
      }
      for (const k of ['mensagemVarejo', 'mensagemAtacado', 'mensagemEncomenda']) {
        if (p[k] !== undefined) {
          const t = String(p[k] || '').trim().slice(0, 1000);
          if (t.length < 5) throw new AppError('A mensagem está muito curta.');
          c[k] = t;
        }
      }
      if (p.tema !== undefined && ['sistema', 'claro', 'escuro'].includes(p.tema)) c.tema = p.tema;
      if (p.whatsappModo !== undefined && ['auto', 'app', 'web'].includes(p.whatsappModo)) c.whatsappModo = p.whatsappModo;
      if (p.avisoAtivo !== undefined) c.avisoAtivo = !!p.avisoAtivo;
      if (p.abrirComWindows !== undefined) c.abrirComWindows = !!p.abrirComWindows;
      if (p.avisoHora !== undefined) {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(p.avisoHora))) throw new AppError('Horário inválido.');
        c.avisoHora = p.avisoHora;
      }
      if (p.visaoHoje !== undefined && ['fila', 'quadro', 'agenda'].includes(p.visaoHoje)) c.visaoHoje = p.visaoHoje;
      return commit();
    },

    /**
     * A venda é um retorno quando o cliente foi chamado antes dela: o contato indicado
     * (botão Comprou) ou, sem indicação, o último contato feito até 30 dias antes da compra
     * que ainda não tem venda ligada.
     */
    registrarVenda(input) {
      const v = R.validateVenda(input || {}, today());
      if (!v.ok) throw new AppError('Confira os campos destacados.', v.errors);
      vendedorAtivo(v.value.vendedorId);
      const val = v.value;
      const dup = D().vendas.find(
        (x) => vendaAtiva(x) && R.keyOf(x.cupom) === R.keyOf(val.cupom) && x.data === val.data
      );
      if (dup) throw new AppError('Esse cupom já foi registrado nessa data.', { cupom: 'Cupom já registrado.' });
      const cli = upsertCliente(val);
      const venda = {
        id: R.newId('vda'),
        clienteId: cli.id,
        cupom: val.cupom,
        valor: val.valor,
        data: val.data,
        vendedorId: val.vendedorId,
        obs: val.obs,
        criadoEm: stamp(),
        excluida: false,
      };
      if (cli.tipo === 'atacado' && val.modelo) venda.modelo = val.modelo;
      const ret = contatoDoRetorno(cli.id, val.data, input && input.retornoDe);
      if (ret) {
        venda.retornoDe = ret;
        // comprou: a resposta do contato deixa de valer e a 2ª tentativa não precisa mais
        const lr = D().lembretes.find((x) => x.id === ret);
        if (lr) { tirarTentativa(lr); delete lr.resultado; }
      }
      D().vendas.push(venda);
      if (ret) {
        // voltou a comprar: os retornos que faltavam das compras antigas deixam de valer (voltam se a venda for excluída)
        for (const l of D().lembretes) {
          if (l.clienteId === cli.id && l.status === 'pendente') { l.status = 'cancelado'; l.canceladoPorVenda = venda.id; }
        }
      }
      for (const dias of val.dias) {
        D().lembretes.push({
          id: R.newId('lem'),
          vendaId: venda.id,
          clienteId: cli.id,
          dias,
          data: R.addDays(val.data, dias),
          status: 'pendente',
          contatadoEm: null,
        });
      }
      commit();
      return { estado: D(), vendaId: venda.id, clienteId: cli.id };
    },

    /** Troca o catálogo de produtos pela planilha: atualiza pelo código, sem duplicar. */
    importarProdutos({ linhas }) {
      const antes = new Map((D().produtos || []).map((p) => [p.id, p]));
      const novos = new Map();
      for (const l of linhas || []) {
        const codigo = R.clean(l && l.codigo, 30);
        const nome = R.clean(l && l.nome, 120);
        if (!codigo || nome.length < 2) continue;
        const id = `p_${codigo.replace(/[^\w\-.]/g, '_')}`;
        const velho = antes.get(id);
        novos.set(id, velho && velho.codigo === codigo && velho.nome === nome ? velho : { id, codigo, nome });
      }
      if (!novos.size) throw new AppError('Não encontrei produtos com código e descrição nessa planilha.');
      D().produtos = [...novos.values()];
      D().loja.produtosEm = stamp();
      commit();
      return { estado: D(), total: novos.size };
    },

    registrarEncomenda(input) {
      const v = R.validateEncomenda(input || {});
      if (!v.ok) throw new AppError('Confira os campos destacados.', v.errors);
      vendedorAtivo(v.value.vendedorId);
      const val = v.value;
      const cli = upsertCliente(val);
      const aberta = D().encomendas.find(
        (e) => e.clienteId === cli.id && R.keyOf(e.produto) === R.keyOf(val.produto) && ['esperando', 'chegou', 'avisado'].includes(e.status)
      );
      if (aberta) {
        throw new AppError('Esse cliente já está esperando esse produto.', { produto: 'Pedido já existe.' });
      }
      const enc = {
        id: R.newId('enc'),
        clienteId: cli.id,
        produto: val.produto,
        ...(val.codigo ? { codigo: val.codigo } : {}),
        quantidade: val.quantidade,
        obs: val.obs,
        vendedorId: val.vendedorId,
        status: 'esperando',
        criadoEm: stamp(),
        chegouEm: null,
        avisadoEm: null,
        encerradoEm: null,
      };
      D().encomendas.push(enc);
      commit();
      return { estado: D(), encomendaId: enc.id, clienteId: cli.id };
    },

    marcarContatado({ id }) {
      const l = findOrFail('lembretes', id, 'Lembrete');
      if (l.status === 'cancelado') throw new AppError('Esse lembrete foi cancelado.');
      l.status = 'contatado';
      l.contatadoEm = stamp();
      return commit();
    },

    desfazerContato({ id }) {
      const l = findOrFail('lembretes', id, 'Lembrete');
      tirarTentativa(l);
      delete l.resultado;
      l.status = 'pendente';
      l.contatadoEm = null;
      for (const v of D().vendas) if (v.retornoDe === l.id) delete v.retornoDe;
      return commit();
    },

    /**
     * "Como foi?" depois do contato: nao_comprou, sem_resposta ou null (limpa).
     * Sem resposta cria uma 2ª tentativa daqui a DIAS_TENTATIVA dias (só uma).
     */
    resultadoContato({ id, resultado }) {
      const l = findOrFail('lembretes', id, 'Lembrete');
      if (l.status !== 'contatado') throw new AppError('Marque o contato como feito antes.');
      const r = resultado || null;
      if (r && !RESULTADOS.includes(r)) throw new AppError('Resultado inválido.');
      tirarTentativa(l);
      if (!r) delete l.resultado;
      else l.resultado = r;
      if (r === 'sem_resposta' && !l.tentativa) {
        const n = {
          id: R.newId('lem'),
          vendaId: l.vendaId,
          clienteId: l.clienteId,
          dias: l.dias,
          data: R.addDays(today(), DIAS_TENTATIVA),
          status: 'pendente',
          contatadoEm: null,
          tentativa: 2,
        };
        D().lembretes.push(n);
        l.retentativaId = n.id;
      }
      return commit();
    },

    adiarLembrete({ id, data }) {
      const l = findOrFail('lembretes', id, 'Lembrete');
      if (!R.parseISO(data)) throw new AppError('Data inválida.');
      if (R.diffDays(today(), data) < 0) throw new AppError('Escolha hoje ou uma data futura.');
      l.data = data;
      l.status = 'pendente';
      l.contatadoEm = null;
      return commit();
    },

    cancelarLembrete({ id }) {
      const l = findOrFail('lembretes', id, 'Lembrete');
      l.status = 'cancelado';
      return commit();
    },

    /** Muda cupom (e o modelo da nota no atacado), valor, data, vendedor e prazos. Retornos já feitos não mudam. */
    editarVenda({ id, cupom, valor, data, vendedorId, dias, modelo }) {
      const venda = findOrFail('vendas', id, 'Venda');
      if (venda.excluida) throw new AppError('Essa venda foi excluída.');
      const cli = findOrFail('clientes', venda.clienteId, 'Cliente');
      const v = R.validateVenda({ ...cli, cnpj: cli.cnpj, docTipo: cli.docTipo, cupom, valor, data, vendedorId, dias }, today());
      const erros = {};
      for (const k of ['cupom', 'valor', 'data', 'vendedorId', 'dias']) if (v.errors[k]) erros[k] = v.errors[k];
      if (Object.keys(erros).length) throw new AppError('Confira os campos destacados.', erros);
      const vend = D().vendedores.find((x) => x.id === vendedorId);
      if (!vend) throw new AppError('Vendedor não encontrado.', { vendedorId: 'Escolha o vendedor.' });
      const val = v.value;
      const dup = D().vendas.find((x) => x.id !== id && vendaAtiva(x) && R.keyOf(x.cupom) === R.keyOf(val.cupom) && x.data === val.data);
      if (dup) throw new AppError('Esse cupom já foi registrado nessa data.', { cupom: 'Cupom já registrado.' });
      venda.cupom = val.cupom;
      if (cli.tipo === 'atacado' && R.modeloDe(modelo)) venda.modelo = R.modeloDe(modelo);
      venda.valor = val.valor;
      venda.data = val.data;
      venda.vendedorId = vendedorId;
      venda.editadoEm = stamp();
      const desta = D().lembretes.filter((l) => l.vendaId === id && !l.tentativa);
      for (const d of val.dias) {
        const l = desta.find((x) => x.dias === d);
        if (!l) {
          D().lembretes.push({ id: R.newId('lem'), vendaId: id, clienteId: venda.clienteId, dias: d, data: R.addDays(val.data, d), status: 'pendente', contatadoEm: null });
        } else if (l.status === 'pendente') l.data = R.addDays(val.data, d);
      }
      // prazos desmarcados: some o retorno que ainda não foi feito
      D().lembretes = D().lembretes.filter((l) => !(l.vendaId === id && l.status === 'pendente' && !val.dias.includes(l.dias)));
      return commit();
    },

    excluirVenda({ id }) {
      const v = findOrFail('vendas', id, 'Venda');
      v.excluida = true;
      for (const l of D().lembretes) {
        if (l.vendaId === id && l.status === 'pendente') l.status = 'cancelado';
        if (l.canceladoPorVenda === id && l.status === 'cancelado') { l.status = 'pendente'; delete l.canceladoPorVenda; }
      }
      return commit();
    },

    editarCliente({ id, ...fields }) {
      const c = findOrFail('clientes', id, 'Cliente');
      const r = R.validateCliente({ ...c, ...fields });
      if (Object.keys(r.errors).length) throw new AppError('Confira os campos destacados.', r.errors);
      const outro = D().clientes.find((x) => x.id !== id && !x.excluido && x.celular === r.value.celular);
      if (outro) throw new AppError('Já existe outro cliente com esse celular.', { celular: 'Celular já cadastrado.' });
      Object.assign(c, r.value);
      return commit();
    },

    excluirCliente({ id }) {
      const c = findOrFail('clientes', id, 'Cliente');
      c.excluido = true;
      for (const l of D().lembretes) {
        if (l.clienteId === id && l.status === 'pendente') l.status = 'cancelado';
      }
      for (const e of D().encomendas) {
        if (e.clienteId === id && !e.encerradoEm) {
          e.status = 'desistiu';
          e.encerradoEm = stamp();
        }
      }
      return commit();
    },

    /** Exclui vários clientes de uma vez. Guarda o lote para dar para desfazer. */
    excluirClientes({ ids }) {
      const lista = (Array.isArray(ids) ? ids : []).map((id) => D().clientes.find((c) => c.id === id && !c.excluido)).filter(Boolean);
      if (!lista.length) throw new AppError('Nenhum cliente selecionado.');
      const lote = R.newId('lote');
      const set = new Set(lista.map((c) => c.id));
      for (const c of lista) { c.excluido = true; c.excluidoLote = lote; c.excluidoEm = stamp(); }
      let retornos = 0;
      for (const l of D().lembretes) {
        if (set.has(l.clienteId) && l.status === 'pendente') { l.status = 'cancelado'; l.canceladoLote = lote; retornos++; }
      }
      for (const e of D().encomendas) {
        if (set.has(e.clienteId) && !e.encerradoEm) { e.antesLote = { status: e.status }; e.status = 'desistiu'; e.encerradoEm = stamp(); e.canceladoLote = lote; }
      }
      const vendas = D().vendas.filter((v) => set.has(v.clienteId) && !v.excluida).length;
      commit();
      return { estado: D(), lote, clientes: lista.length, vendas, retornos };
    },

    /** Desfaz uma exclusão em lote. */
    restaurarLote({ lote }) {
      if (!lote) throw new AppError('Nada para desfazer.');
      for (const c of D().clientes) if (c.excluidoLote === lote) { c.excluido = false; delete c.excluidoLote; delete c.excluidoEm; }
      for (const l of D().lembretes) if (l.canceladoLote === lote) { l.status = 'pendente'; delete l.canceladoLote; }
      for (const e of D().encomendas) {
        if (e.canceladoLote === lote) { e.status = (e.antesLote && e.antesLote.status) || 'esperando'; e.encerradoEm = null; delete e.antesLote; delete e.canceladoLote; }
      }
      return commit();
    },

    /** Chegou o produto: todos que esperam por ele passam a "chegou". */
    produtoChegou({ produto }) {
      const k = R.keyOf(produto);
      let n = 0;
      for (const e of D().encomendas) {
        if (e.status === 'esperando' && R.keyOf(e.produto) === k) {
          e.status = 'chegou';
          e.chegouEm = stamp();
          n++;
        }
      }
      if (!n) throw new AppError('Ninguém está esperando esse produto.');
      return commit();
    },

    encomendaAvisada({ id }) {
      const e = findOrFail('encomendas', id, 'Pedido');
      if (!e.chegouEm) e.chegouEm = stamp();
      e.status = 'avisado';
      e.avisadoEm = stamp();
      return commit();
    },

    encerrarEncomenda({ id, resultado }) {
      const e = findOrFail('encomendas', id, 'Pedido');
      if (!['comprou', 'desistiu'].includes(resultado)) throw new AppError('Resultado inválido.');
      e.status = resultado;
      e.encerradoEm = stamp();
      return commit();
    },

    reabrirEncomenda({ id }) {
      const e = findOrFail('encomendas', id, 'Pedido');
      e.status = e.avisadoEm ? 'avisado' : e.chegouEm ? 'chegou' : 'esperando';
      e.encerradoEm = null;
      return commit();
    },
  };

  return api;
}

const ACOES = [
  'configurar', 'salvarLoja', 'addVendedor', 'renomearVendedor', 'ativarVendedor', 'salvarConfig',
  'registrarVenda', 'registrarEncomenda', 'marcarContatado', 'desfazerContato', 'adiarLembrete',
  'cancelarLembrete', 'excluirVenda', 'editarCliente', 'excluirCliente', 'produtoChegou',
  'encomendaAvisada', 'encerrarEncomenda', 'reabrirEncomenda', 'importarClientes', 'excluirClientes', 'restaurarLote', 'editarVenda',
  'excluirVendedor', 'salvarAdmins', 'importarProdutos', 'nuvemConectar', 'nuvemRemoto', 'nuvemEnviados', 'nuvemDesconectar', 'restaurarCopia',
  'resultadoContato',
];

module.exports = { makeService, AppError, ACOES };
