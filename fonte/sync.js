/**
 * Sincronização do Retornei com a nuvem: regras puras, sem Firebase.
 * Cada registro vira um documento "colecao~id". O app compara o que tem com o
 * que já enviou (por um resumo curto de cada registro) e manda só o que mudou.
 * Serve tanto para o processo principal (Node) quanto para a tela (navegador).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Sync = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const COLECOES = ['vendedores', 'clientes', 'vendas', 'lembretes', 'encomendas', 'produtos'];
  /** Ajustes que valem para a loja toda. O resto (tema, aviso, WhatsApp) é de cada computador. */
  const CONFIG_LOJA = ['diasVarejo', 'diasAtacado', 'mensagemVarejo', 'mensagemAtacado', 'mensagemEncomenda'];
  const SEP = '~';

  /** Resumo curto (FNV-1a 32 bits) para saber se um registro mudou. */
  function resumo(obj) {
    const s = JSON.stringify(obj);
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(36) + s.length.toString(36);
  }

  const chave = (col, id) => `${col}${SEP}${id}`;
  function separar(k) {
    const i = k.indexOf(SEP);
    return i < 0 ? null : { col: k.slice(0, i), id: k.slice(i + 1) };
  }

  function configLoja(config) {
    const out = {};
    for (const k of CONFIG_LOJA) if (config && config[k] !== undefined) out[k] = config[k];
    return out;
  }

  /** Todos os documentos que este computador tem, por chave. */
  function docsLocais(data) {
    const m = new Map();
    for (const col of COLECOES) for (const r of data[col] || []) if (r && r.id) m.set(chave(col, r.id), r);
    m.set(chave('meta', 'loja'), data.loja || {});
    m.set(chave('meta', 'config'), configLoja(data.config));
    return m;
  }

  /**
   * O que precisa subir: registros novos ou alterados, e registros que sumiram
   * daqui depois de terem sido enviados (vão como apagados).
   * `enviados` é { chave: resumo }.
   */
  function mudancas(data, enviados) {
    const env = enviados || {};
    const out = [];
    const locais = docsLocais(data);
    for (const [k, dados] of locais) {
      const r = resumo(dados);
      if (env[k] !== r) out.push({ chave: k, dados, resumo: r });
    }
    for (const k of Object.keys(env)) {
      if (!locais.has(k) && env[k] !== null) out.push({ chave: k, dados: null, resumo: null });
    }
    return out;
  }

  /**
   * Junta no `data` os documentos que vieram da nuvem e devolve os pares
   * [chave, resumo] para marcar como já conhecidos (assim não voltam para a nuvem).
   */
  function aplicar(data, docs) {
    const pares = [];
    for (const d of docs || []) {
      const p = separar(d.chave);
      if (!p) continue;
      if (p.col === 'meta') {
        if (d.dados && p.id === 'loja') data.loja = { ...data.loja, ...d.dados };
        else if (d.dados && p.id === 'config') data.config = { ...data.config, ...configLoja(d.dados) };
        if (d.dados) pares.push([d.chave, resumo(p.id === 'loja' ? data.loja : configLoja(data.config))]);
        continue;
      }
      if (!COLECOES.includes(p.col)) continue;
      const lista = Array.isArray(data[p.col]) ? data[p.col] : (data[p.col] = []);
      const i = lista.findIndex((x) => x.id === p.id);
      if (!d.dados) {
        if (i >= 0) lista.splice(i, 1);
        pares.push([d.chave, null]);
      } else {
        const reg = { ...d.dados, id: p.id };
        if (i >= 0) lista[i] = reg;
        else lista.push(reg);
        pares.push([d.chave, resumo(reg)]);
      }
    }
    return pares;
  }

  /**
   * Para restaurar uma cópia: os registros voltam como estavam nela, e o que existe agora
   * e não estava na cópia é apagado (loja e ajustes só são substituídos).
   * copia: [[chave, dados], ...] (como saiu de docsLocais).
   */
  function opsDaCopia(copia, data) {
    const naCopia = new Set(copia.map((d) => d[0]));
    const ops = copia.map(([k, dados]) => ({ chave: k, dados }));
    for (const k of docsLocais(data).keys()) if (!naCopia.has(k) && !k.startsWith(`meta${SEP}`)) ops.push({ chave: k, dados: null });
    return ops;
  }
  /** Divide em lotes (o Firestore aceita até 500 gravações por vez). */
  function lotes(lista, n) {
    const out = [];
    for (let i = 0; i < lista.length; i += n) out.push(lista.slice(i, i + n));
    return out;
  }

  return { COLECOES, CONFIG_LOJA, resumo, chave, separar, docsLocais, mudancas, aplicar, opsDaCopia, lotes, configLoja };
});
