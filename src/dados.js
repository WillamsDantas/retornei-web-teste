"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // fonte/rules.js
  var require_rules = __commonJS({
    "fonte/rules.js"(exports, module) {
      (function(root, factory) {
        if (typeof module === "object" && module.exports) module.exports = factory();
        else root.PrazzoRules = factory();
      })(typeof globalThis !== "undefined" ? globalThis : exports, function() {
        "use strict";
        const DIAS_VAREJO = [15, 30];
        const DIAS_ATACADO = [15, 30];
        const MAX_DIAS = 365;
        const MSG_VAREJO = "Ol\xE1, {primeiro_nome}! Aqui \xE9 {vendedor}, da {loja}. Passando para saber como est\xE1 sua compra. Posso ajudar em algo?";
        const MSG_ATACADO = "Ol\xE1, {primeiro_nome}! Aqui \xE9 {vendedor}, da {loja}. Chegou reposi\xE7\xE3o dos produtos que a {empresa} costuma levar. Quer que eu separe seu pedido?";
        const MSG_ENCOMENDA = "Ol\xE1, {primeiro_nome}! Aqui \xE9 {vendedor}, da {loja}. Chegou o {produto} que voc\xEA pediu. Quer que eu separe para voc\xEA?";
        const pad = (n) => String(n).padStart(2, "0");
        const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const todayISO = (now) => toISO(now || /* @__PURE__ */ new Date());
        function parseISO(iso) {
          const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
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
          return Math.round((y - x) / 864e5);
        }
        function localDay(isoDateTime) {
          const d = new Date(isoDateTime);
          return Number.isNaN(d.getTime()) ? "" : toISO(d);
        }
        const MESES = ["janeiro", "fevereiro", "mar\xE7o", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
        const SEMANA = ["domingo", "segunda", "ter\xE7a", "quarta", "quinta", "sexta", "s\xE1bado"];
        const SEMANA_CURTA = ["dom", "seg", "ter", "qua", "qui", "sex", "s\xE1b"];
        function formatDate(iso, style) {
          const d = parseISO(iso);
          if (!d) return "";
          if (style === "curta") return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
          if (style === "longa") return `${SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
          return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        }
        function relativeDay(iso, today) {
          const n = diffDays(today, iso);
          if (!Number.isFinite(n)) return "";
          if (n === 0) return "hoje";
          if (n === 1) return "amanh\xE3";
          if (n === -1) return "ontem";
          return n > 0 ? `em ${n} dias` : `h\xE1 ${-n} dias`;
        }
        function normalizeDias(list) {
          const out = /* @__PURE__ */ new Set();
          for (const v of list || []) {
            const n = Math.round(Number(v));
            if (Number.isFinite(n) && n >= 1 && n <= MAX_DIAS) out.add(n);
          }
          return [...out].sort((a, b) => a - b);
        }
        function lembreteStatus(l, today) {
          if (l.status === "contatado" || l.status === "cancelado") return l.status;
          const n = diffDays(today, l.data);
          if (n < 0) return "atrasado";
          if (n === 0) return "hoje";
          return "agendado";
        }
        function normalizePhone(v) {
          let d = String(v || "").replace(/\D/g, "");
          if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
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
          const d = String(v || "").replace(/\D/g, "").slice(0, 11);
          if (d.length <= 2) return d.length ? `(${d}` : "";
          if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
          if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
          return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
        }
        function parseMoney(v) {
          if (typeof v === "number") return v;
          let s = String(v || "").replace(/[^\d,.-]/g, "");
          if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
          const n = Number(s);
          return Number.isFinite(n) && s !== "" ? Math.round(n * 100) / 100 : NaN;
        }
        const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
        const formatMoney = (n) => Number.isFinite(Number(n)) ? brl.format(Number(n)) : "";
        function maskMoney(v) {
          const d = String(v || "").replace(/\D/g, "").replace(/^0+/, "").slice(0, 10);
          if (!d) return "";
          const c = d.padStart(3, "0");
          return `${c.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${c.slice(-2)}`;
        }
        function formatCnpj(v) {
          const d = String(v || "").replace(/\D/g, "");
          if (d.length !== 14) return d;
          return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
        }
        function maskCnpj(v) {
          const d = String(v || "").replace(/\D/g, "").slice(0, 14);
          let o = d.slice(0, 2);
          if (d.length > 2) o += `.${d.slice(2, 5)}`;
          if (d.length > 5) o += `.${d.slice(5, 8)}`;
          if (d.length > 8) o += `/${d.slice(8, 12)}`;
          if (d.length > 12) o += `-${d.slice(12)}`;
          return o;
        }
        function maskCpf(v) {
          const d = String(v || "").replace(/\D/g, "").slice(0, 11);
          let o = d.slice(0, 3);
          if (d.length > 3) o += `.${d.slice(3, 6)}`;
          if (d.length > 6) o += `.${d.slice(6, 9)}`;
          if (d.length > 9) o += `-${d.slice(9)}`;
          return o;
        }
        function isValidCpf(v) {
          const d = String(v || "").replace(/\D/g, "");
          if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
          const dig = (n) => {
            let s = 0;
            for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i);
            const r = s * 10 % 11;
            return r === 10 ? 0 : r;
          };
          return dig(9) === Number(d[9]) && dig(10) === Number(d[10]);
        }
        function isValidCnpj(v) {
          const d = String(v || "").replace(/\D/g, "");
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
        const docTipoDe = (t) => t === "cpf" ? "cpf" : "cnpj";
        const maskDoc = (v, t) => docTipoDe(t) === "cpf" ? maskCpf(v) : maskCnpj(v);
        const formatDoc = (v, t) => maskDoc(v, t);
        function docSituacao(v, t) {
          const d = String(v || "").replace(/\D/g, "");
          const n = docTipoDe(t) === "cpf" ? 11 : 14;
          if (d.length < n) return "";
          return (docTipoDe(t) === "cpf" ? isValidCpf(d) : isValidCnpj(d)) ? "ok" : "erro";
        }
        const clean = (s, max) => String(s || "").trim().replace(/\s+/g, " ").slice(0, max || 200);
        const firstName = (n) => clean(n).split(" ")[0] || "";
        const keyOf = (s) => clean(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
        function initials(nome) {
          const p = clean(nome).split(" ").filter(Boolean);
          if (!p.length) return "?";
          return ((p[0][0] || "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
        }
        function renderTemplate(tpl, vars) {
          return String(tpl || "").replace(/\{(\w+)\}/g, (_m, k) => vars[k] !== void 0 && vars[k] !== null ? String(vars[k]) : "").replace(/[ \t]{2,}/g, " ").trim();
        }
        function whatsappUrl(phone, text) {
          return `https://wa.me/55${normalizePhone(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
        }
        function newId(prefix) {
          const r = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "").slice(0, 12) : Math.random().toString(36).slice(2, 14);
          return `${prefix}_${r}`;
        }
        const nomeCliente = (c) => c.tipo === "atacado" ? c.fantasia || c.empresa || c.nome : c.nome;
        function filaDoDia(data, today) {
          const cli = new Map(data.clientes.map((c) => [c.id, c]));
          const venda = new Map(data.vendas.map((v) => [v.id, v]));
          const atrasados = [];
          const hoje = [];
          const vistos = /* @__PURE__ */ new Set();
          const ls = data.lembretes.slice().sort((a, b) => a.data < b.data ? -1 : a.data > b.data ? 1 : 0);
          for (const l of ls) {
            const c = cli.get(l.clienteId);
            const v = venda.get(l.vendaId);
            if (!c || c.excluido || !v || v.excluida) continue;
            const st = lembreteStatus(l, today);
            if (st !== "atrasado" && st !== "hoje" || vistos.has(c.id)) continue;
            vistos.add(c.id);
            (st === "atrasado" ? atrasados : hoje).push(nomeCliente(c));
          }
          const chegou = data.encomendas.filter((e) => e.status === "chegou" && cli.get(e.clienteId) && !cli.get(e.clienteId).excluido).length;
          return { atrasados, hoje, chegou };
        }
        const CAMPOS_IMPORT = [
          ["nome", "Nome"],
          ["celular", "Celular"],
          ["empresa", "Raz\xE3o social"],
          ["fantasia", "Nome fantasia"],
          ["documento", "CNPJ ou CPF"],
          ["tipo", "Tipo (varejo ou atacado)"],
          ["cupom", "N\xBA do cupom"],
          ["modelo", "Modelo da nota (55 ou 65)"],
          ["ultimaCompra", "Data da compra"],
          ["valor", "Valor da compra"],
          ["vendedor", "Vendedor"],
          ["", "N\xE3o importar"]
        ];
        function adivinharCampo(titulo) {
          const k = keyOf(titulo);
          if (!k) return "";
          if (/vendedor|atendente|vendedora/.test(k)) return "vendedor";
          if (/modelo/.test(k)) return "modelo";
          if (/cupom|nota fiscal|^nf|numero da venda|n da venda/.test(k)) return "cupom";
          if (/valor|total|preco|r\$/.test(k)) return "valor";
          if (/fantasia/.test(k)) return "fantasia";
          if (/razao|social|empresa/.test(k)) return "empresa";
          if (/cnpj|cpf|documento/.test(k)) return "documento";
          if (/cel|fone|telefone|whats|zap/.test(k)) return "celular";
          if (/^tipo|categoria|varejo|atacado/.test(k)) return "tipo";
          if (/data|ultima|compra/.test(k)) return "ultimaCompra";
          if (/nome|cliente|contato/.test(k)) return "nome";
          return "";
        }
        function parseDataBR(v) {
          const s = clean(v, 30);
          let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
          if (m) return parseISO(`${m[1]}-${m[2]}-${m[3]}`) ? `${m[1]}-${m[2]}-${m[3]}` : "";
          m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(s);
          if (!m) return "";
          const y = m[3].length === 2 ? `20${m[3]}` : m[3];
          const iso = `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
          return parseISO(iso) ? iso : "";
        }
        function linhaImport(o, today) {
          const celular = normalizePhone(o.celular);
          if (!celular) return { ok: false, erro: "Sem celular" };
          if (!isValidPhone(celular)) return { ok: false, erro: "Celular inv\xE1lido" };
          let doc = String(o.documento || "").replace(/\D/g, "");
          if (doc.length === 10) doc = `0${doc}`;
          if (doc.length === 13) doc = `0${doc}`;
          const docTipo = doc.length === 11 ? "cpf" : "cnpj";
          const docOk = !!doc && (docTipo === "cpf" ? isValidCpf(doc) : isValidCnpj(doc));
          const empresa = clean(o.empresa, 120);
          const fantasia = clean(o.fantasia, 80);
          const nome = clean(o.nome, 80);
          const tk = keyOf(o.tipo);
          const tipo = /atac/.test(tk) ? "atacado" : /varej/.test(tk) ? "varejo" : empresa || fantasia || docOk && docTipo === "cnpj" ? "atacado" : "varejo";
          if (tipo === "varejo" && nome.length < 2) return { ok: false, erro: "Sem nome" };
          if (tipo === "atacado" && (empresa || fantasia || nome).length < 2) return { ok: false, erro: "Sem nome da empresa" };
          let ultimaCompra = parseDataBR(o.ultimaCompra);
          if (ultimaCompra && today && ultimaCompra > today) ultimaCompra = "";
          const at = tipo === "atacado";
          return {
            ok: true,
            value: {
              tipo,
              celular,
              nome: nome || fantasia || empresa,
              empresa: at ? empresa || fantasia || nome : "",
              fantasia: at ? fantasia : "",
              cnpj: at && docOk ? doc : "",
              docTipo: at && docOk ? docTipo : "cnpj",
              ultimaCompra
            }
          };
        }
        function planoImport(linhas, data, today, opts) {
          const o = opts || {};
          const existentes = new Set(data.clientes.filter((c) => !c.excluido).map((c) => c.celular));
          const cliOk = new Set(data.clientes.filter((c) => !c.excluido).map((c) => c.id));
          const vendasJa = new Set(data.vendas.filter((v) => !v.excluida && cliOk.has(v.clienteId)).map((v) => `${keyOf(v.cupom)}|${v.data}`));
          const porNome = new Map(data.vendedores.map((v) => [keyOf(v.nome), v]));
          const padrao = data.vendedores.find((v) => v.id === o.vendedorPadrao && v.ativo) || null;
          const clientes = /* @__PURE__ */ new Map();
          const vendas = [];
          const problemas = [];
          let semVendedor = 0;
          (linhas || []).forEach((raw, i) => {
            const n = raw.__linha || i + 2;
            const quem = clean(raw.nome || raw.fantasia || raw.empresa || "", 40) || "(sem nome)";
            const r = linhaImport(raw, today);
            if (!r.ok) {
              problemas.push({ n, quem, erro: r.erro });
              return;
            }
            const v = r.value;
            const prev = clientes.get(v.celular);
            if (!prev) clientes.set(v.celular, { ...v });
            else {
              for (const k of ["nome", "empresa", "fantasia", "cnpj"]) if (!prev[k] && v[k]) prev[k] = v[k];
              if (v.cnpj && prev.cnpj === v.cnpj) prev.docTipo = v.docTipo;
              if (v.tipo === "atacado" && prev.tipo !== "atacado") {
                prev.tipo = "atacado";
                prev.empresa = prev.empresa || v.empresa;
              }
              if (v.ultimaCompra && (!prev.ultimaCompra || v.ultimaCompra > prev.ultimaCompra)) prev.ultimaCompra = v.ultimaCompra;
            }
            const cupom = clean(raw.cupom, 40);
            if (!cupom) return;
            if (!v.ultimaCompra) {
              problemas.push({ n, quem, erro: parseDataBR(raw.ultimaCompra) ? "Data da compra no futuro" : "Venda sem data da compra" });
              return;
            }
            const valor = parseMoney(raw.valor);
            if (!Number.isFinite(valor) || valor <= 0) {
              problemas.push({ n, quem, erro: "Venda sem valor" });
              return;
            }
            const chave = `${keyOf(cupom)}|${v.ultimaCompra}`;
            if (vendasJa.has(chave)) {
              problemas.push({ n, quem, erro: `Cupom ${cupom} j\xE1 registrado nessa data` });
              return;
            }
            let vend = raw.vendedor ? porNome.get(keyOf(raw.vendedor)) : null;
            if (!vend) {
              vend = padrao;
              if (vend) semVendedor++;
            }
            if (!vend) {
              problemas.push({ n, quem, erro: raw.vendedor ? `Vendedor "${clean(raw.vendedor, 30)}" n\xE3o est\xE1 na Equipe` : "Venda sem vendedor" });
              return;
            }
            vendasJa.add(chave);
            vendas.push({ celular: v.celular, cupom, valor, data: v.ultimaCompra, vendedorId: vend.id, modelo: v.tipo === "atacado" ? modeloDe(raw.modelo) : "" });
          });
          let retornos = 0;
          let primeiro = "";
          for (const vd of vendas) {
            const tipo = clientes.get(vd.celular).tipo;
            const dias = data.config[tipo === "atacado" ? "diasAtacado" : "diasVarejo"] || [];
            vd.dias = dias.filter((d) => o.incluirPassados || addDays(vd.data, d) >= today);
            retornos += vd.dias.length;
            for (const d of vd.dias) {
              const dt = addDays(vd.data, d);
              if (!primeiro || dt < primeiro) primeiro = dt;
            }
          }
          const lista = [...clientes.values()];
          const novos = lista.filter((c) => !existentes.has(c.celular)).length;
          return { clientes: lista, novos, existentes: lista.length - novos, vendas, retornos, primeiro, semVendedor, problemas };
        }
        function validateCliente(input) {
          const errors = {};
          const tipo = input.tipo === "atacado" ? "atacado" : "varejo";
          const celular = normalizePhone(input.celular);
          const nome = clean(input.nome, 80);
          const empresa = tipo === "atacado" ? clean(input.empresa, 120) : "";
          const fantasia = tipo === "atacado" ? clean(input.fantasia, 80) : "";
          const docTipo = docTipoDe(input.docTipo);
          const cnpj2 = tipo === "atacado" ? String(input.cnpj || "").replace(/\D/g, "").slice(0, docTipo === "cpf" ? 11 : 14) : "";
          if (!celular) errors.celular = "Informe o celular.";
          else if (!isValidPhone(celular)) errors.celular = "Use DDD + n\xFAmero, ex.: (82) 99999-9999.";
          if (tipo === "atacado") {
            if (empresa.length < 2) errors.empresa = docTipo === "cpf" ? "Informe o nome completo." : "Informe a raz\xE3o social.";
          } else if (nome.length < 2) errors.nome = "Informe o nome do cliente.";
          if (cnpj2) {
            const nome2 = docTipo === "cpf" ? "CPF" : "CNPJ";
            const n = docTipo === "cpf" ? 11 : 14;
            if (cnpj2.length !== n) errors.cnpj = `O ${nome2} tem ${n} n\xFAmeros.`;
            else if (!(docTipo === "cpf" ? isValidCpf(cnpj2) : isValidCnpj(cnpj2))) errors.cnpj = `${nome2} inv\xE1lido. Confira os n\xFAmeros.`;
          }
          return { errors, value: { tipo, celular, nome: nome || fantasia || empresa, empresa, fantasia, cnpj: cnpj2, docTipo: tipo === "atacado" ? docTipo : "cnpj" } };
        }
        function modeloDe(x) {
          const k = keyOf(x).replace(/[^a-z0-9]/g, "");
          if (!k) return "";
          if (/65|nfce|cupom|consumidor/.test(k)) return "65";
          if (/55|nfe|nota/.test(k)) return "55";
          return "";
        }
        function validateVenda(input, today) {
          const c = validateCliente(input);
          const errors = { ...c.errors };
          const cupom = clean(input.cupom, 40);
          const valor = parseMoney(input.valor);
          const data = String(input.data || "").trim();
          const dias = normalizeDias(input.dias);
          if (!cupom) errors.cupom = "Informe o n\xFAmero do cupom.";
          if (!Number.isFinite(valor) || valor <= 0) errors.valor = "Informe o valor.";
          if (!parseISO(data)) errors.data = "Informe a data.";
          else if (today && diffDays(today, data) > 0) errors.data = "A data n\xE3o pode ser no futuro.";
          if (!input.vendedorId) errors.vendedorId = "Escolha o vendedor.";
          if (!dias.length) errors.dias = "Escolha pelo menos um prazo.";
          return {
            ok: Object.keys(errors).length === 0,
            errors,
            value: { ...c.value, cupom, valor, data, dias, vendedorId: input.vendedorId, obs: clean(input.obs, 500), modelo: modeloDe(input.modelo) }
          };
        }
        function validateEncomenda(input) {
          const c = validateCliente(input);
          const errors = { ...c.errors };
          const produto = clean(input.produto, 80);
          const quantidade = Math.max(1, Math.round(Number(input.quantidade) || 1));
          if (produto.length < 2) errors.produto = "Informe o produto.";
          if (!input.vendedorId) errors.vendedorId = "Escolha o vendedor.";
          return {
            ok: Object.keys(errors).length === 0,
            errors,
            value: { ...c.value, produto, codigo: clean(input.codigo, 30), quantidade, vendedorId: input.vendedorId, obs: clean(input.obs, 300) }
          };
        }
        return {
          DIAS_VAREJO,
          DIAS_ATACADO,
          MAX_DIAS,
          MSG_VAREJO,
          MSG_ATACADO,
          MSG_ENCOMENDA,
          MESES,
          SEMANA,
          SEMANA_CURTA,
          todayISO,
          parseISO,
          addDays,
          diffDays,
          localDay,
          formatDate,
          relativeDay,
          normalizeDias,
          lembreteStatus,
          modeloDe,
          normalizePhone,
          isValidPhone,
          formatPhone,
          maskPhone,
          parseMoney,
          formatMoney,
          maskMoney,
          formatCnpj,
          maskCnpj,
          maskCpf,
          isValidCpf,
          isValidCnpj,
          docTipoDe,
          maskDoc,
          formatDoc,
          docSituacao,
          clean,
          firstName,
          keyOf,
          initials,
          renderTemplate,
          whatsappUrl,
          newId,
          validateCliente,
          validateVenda,
          validateEncomenda,
          nomeCliente,
          filaDoDia,
          CAMPOS_IMPORT,
          adivinharCampo,
          parseDataBR,
          linhaImport,
          planoImport
        };
      });
    }
  });

  // fonte/vazio.js
  var require_vazio = __commonJS({
    "fonte/vazio.js"(exports, module) {
      module.exports = {};
    }
  });

  // fonte/store.js
  var require_store = __commonJS({
    "fonte/store.js"(exports, module) {
      "use strict";
      var fs = require_vazio();
      var path = require_vazio();
      var VERSAO = 1;
      function emptyData2(R2) {
        return {
          versao: VERSAO,
          loja: { nome: "", whatsapp: "" },
          config: {
            diasVarejo: R2.DIAS_VAREJO.slice(),
            diasAtacado: R2.DIAS_ATACADO.slice(),
            mensagemVarejo: R2.MSG_VAREJO,
            mensagemAtacado: R2.MSG_ATACADO,
            mensagemEncomenda: R2.MSG_ENCOMENDA,
            tema: "sistema",
            visaoHoje: "fila",
            whatsappModo: "auto",
            avisoAtivo: true,
            avisoHora: "08:30",
            avisoUltimo: "",
            abrirComWindows: true,
            prazos1122: true
          },
          vendedores: [],
          clientes: [],
          vendas: [],
          lembretes: [],
          encomendas: [],
          produtos: [],
          // catálogo da loja: { id, codigo, nome }
          nuvem: null
          // { pc: { uid, nome }, cursor, enviados: { chave: resumo } } quando ligado à loja
        };
      }
      function normalize2(raw, R2) {
        const base = emptyData2(R2);
        if (!raw || typeof raw !== "object") return base;
        const out = { ...base, ...raw };
        out.versao = VERSAO;
        out.loja = { ...base.loja, ...raw.loja || {} };
        out.config = { ...base.config, ...raw.config || {} };
        if (!(raw.config && raw.config.prazos1122)) {
          if (JSON.stringify(out.config.diasAtacado) === "[7,30,60]") out.config.diasAtacado = R2.DIAS_ATACADO.slice();
          out.config.prazos1122 = true;
        }
        for (const k of ["vendedores", "clientes", "vendas", "lembretes", "encomendas", "produtos"]) {
          out[k] = Array.isArray(raw[k]) ? raw[k] : [];
        }
        const n = raw.nuvem;
        out.nuvem = n && typeof n === "object" && n.pc && n.pc.uid ? { pc: { uid: String(n.pc.uid), nome: String(n.pc.nome || "") }, cursor: Number(n.cursor) || 0, enviados: n.enviados && typeof n.enviados === "object" ? n.enviados : {} } : null;
        return out;
      }
      var Store = class {
        /** cripto (opcional): { encrypt(texto) → Buffer, decrypt(Buffer) → texto } */
        constructor(dir, R2, cripto) {
          this.dir = dir;
          this.R = R2;
          this.cripto = cripto || null;
          this.file = path.join(dir, "prazzo-dados.json");
          this.backupDir = path.join(dir, "backups");
          fs.mkdirSync(this.backupDir, { recursive: true });
          this.aberto = false;
          this.data = this.load();
          if (this.cripto && this.aberto) this.protegerTudo();
        }
        /** Lê um arquivo do Retornei, criptografado ou não. */
        ler(file) {
          const raw = JSON.parse(fs.readFileSync(file, "utf8"));
          if (raw && raw.retorneiCripto === 1 && typeof raw.dados === "string") {
            if (!this.cripto) throw new Error("Arquivo criptografado sem a chave deste computador.");
            return JSON.parse(this.cripto.decrypt(Buffer.from(raw.dados, "base64")));
          }
          return raw;
        }
        /** Texto gravado no disco: criptografado quando há cripto. */
        texto(data) {
          const t = JSON.stringify(data, null, 1);
          return this.cripto ? JSON.stringify({ retorneiCripto: 1, dados: this.cripto.encrypt(t).toString("base64") }) : t;
        }
        /** Primeira abertura com criptografia: regrava o arquivo e as cópias antigas, que estavam abertas. */
        protegerTudo() {
          try {
            this.save();
          } catch (_) {
          }
          let nomes = [];
          try {
            nomes = fs.readdirSync(this.backupDir).filter((f) => /\.json$/.test(f));
          } catch (_) {
          }
          for (const f of nomes) {
            const arq = path.join(this.backupDir, f);
            try {
              const raw = JSON.parse(fs.readFileSync(arq, "utf8"));
              if (raw && raw.retorneiCripto === 1) continue;
              const tmp = `${arq}.tmp`;
              fs.writeFileSync(tmp, this.texto(raw), "utf8");
              fs.renameSync(tmp, arq);
            } catch (_) {
            }
          }
        }
        load() {
          try {
            const raw = JSON.parse(fs.readFileSync(this.file, "utf8"));
            if (!(raw && raw.retorneiCripto === 1)) this.aberto = true;
            return normalize2(this.ler(this.file), this.R);
          } catch (e) {
            if (e.code === "ENOENT") return emptyData2(this.R);
            try {
              fs.copyFileSync(this.file, `${this.file}.corrompido-${Date.now()}`);
            } catch (_) {
            }
            const last = this.listBackups()[0];
            if (last) {
              try {
                return normalize2(this.ler(path.join(this.backupDir, last)), this.R);
              } catch (_) {
              }
            }
            return emptyData2(this.R);
          }
        }
        save() {
          const tmp = `${this.file}.tmp`;
          fs.writeFileSync(tmp, this.texto(this.data), "utf8");
          fs.renameSync(tmp, this.file);
          this.dailyBackup();
        }
        listBackups() {
          try {
            return fs.readdirSync(this.backupDir).filter((f) => /^prazzo-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse();
          } catch (_) {
            return [];
          }
        }
        dailyBackup() {
          const name = `prazzo-${this.R.todayISO()}.json`;
          const target = path.join(this.backupDir, name);
          try {
            fs.copyFileSync(this.file, target);
            for (const old of this.listBackups().slice(30)) fs.unlinkSync(path.join(this.backupDir, old));
          } catch (_) {
          }
        }
        exportTo(file) {
          fs.writeFileSync(file, JSON.stringify(this.data, null, 1), "utf8");
        }
        importFrom(file) {
          let raw;
          try {
            raw = this.ler(file);
          } catch (_) {
            raw = null;
          }
          if (!raw || typeof raw !== "object" || !Array.isArray(raw.clientes)) {
            throw new Error("Esse arquivo n\xE3o \xE9 um backup do Retornei.");
          }
          try {
            fs.copyFileSync(this.file, path.join(this.backupDir, `antes-de-importar-${Date.now()}.json`));
          } catch (_) {
          }
          const nuvem = this.data.nuvem;
          this.data = normalize2(raw, this.R);
          this.data.nuvem = nuvem;
          this.save();
        }
        /** Guarda uma cópia do arquivo atual com um nome que explica o motivo. */
        backupComo(motivo) {
          try {
            fs.copyFileSync(this.file, path.join(this.backupDir, `${motivo}-${Date.now()}.json`));
          } catch (_) {
          }
        }
      };
      module.exports = { Store, emptyData: emptyData2, normalize: normalize2 };
    }
  });

  // fonte/sync.js
  var require_sync = __commonJS({
    "fonte/sync.js"(exports, module) {
      (function(root, factory) {
        if (typeof module === "object" && module.exports) module.exports = factory();
        else root.Sync = factory();
      })(typeof self !== "undefined" ? self : exports, function() {
        "use strict";
        const COLECOES = ["vendedores", "clientes", "vendas", "lembretes", "encomendas", "produtos"];
        const CONFIG_LOJA = ["diasVarejo", "diasAtacado", "mensagemVarejo", "mensagemAtacado", "mensagemEncomenda"];
        const SEP = "~";
        function resumo(obj) {
          const s = JSON.stringify(obj);
          let h = 2166136261;
          for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
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
          for (const k of CONFIG_LOJA) if (config && config[k] !== void 0) out[k] = config[k];
          return out;
        }
        function docsLocais(data) {
          const m = /* @__PURE__ */ new Map();
          for (const col of COLECOES) for (const r of data[col] || []) if (r && r.id) m.set(chave(col, r.id), r);
          m.set(chave("meta", "loja"), data.loja || {});
          m.set(chave("meta", "config"), configLoja(data.config));
          return m;
        }
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
        function aplicar(data, docs) {
          const pares = [];
          for (const d of docs || []) {
            const p = separar(d.chave);
            if (!p) continue;
            if (p.col === "meta") {
              if (d.dados && p.id === "loja") data.loja = { ...data.loja, ...d.dados };
              else if (d.dados && p.id === "config") data.config = { ...data.config, ...configLoja(d.dados) };
              if (d.dados) pares.push([d.chave, resumo(p.id === "loja" ? data.loja : configLoja(data.config))]);
              continue;
            }
            if (!COLECOES.includes(p.col)) continue;
            const lista = Array.isArray(data[p.col]) ? data[p.col] : data[p.col] = [];
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
        function opsDaCopia(copia, data) {
          const naCopia = new Set(copia.map((d) => d[0]));
          const ops = copia.map(([k, dados]) => ({ chave: k, dados }));
          for (const k of docsLocais(data).keys()) if (!naCopia.has(k) && !k.startsWith(`meta${SEP}`)) ops.push({ chave: k, dados: null });
          return ops;
        }
        function lotes(lista, n) {
          const out = [];
          for (let i = 0; i < lista.length; i += n) out.push(lista.slice(i, i + n));
          return out;
        }
        return { COLECOES, CONFIG_LOJA, resumo, chave, separar, docsLocais, mudancas, aplicar, opsDaCopia, lotes, configLoja };
      });
    }
  });

  // fonte/service.js
  var require_service = __commonJS({
    "fonte/service.js"(exports, module) {
      "use strict";
      var Sync = require_sync();
      var AppError2 = class extends Error {
        constructor(message, fields) {
          super(message);
          this.fields = fields || null;
        }
      };
      function makeService2(store2, R2, clock) {
        const now = () => clock ? clock() : /* @__PURE__ */ new Date();
        const today = () => R2.todayISO(now());
        const stamp = () => now().toISOString();
        const D = () => store2.data;
        const commit = () => {
          store2.save();
          return D();
        };
        const vendaAtiva = (v) => !v.excluida && D().clientes.some((c) => c.id === v.clienteId && !c.excluido);
        const findOrFail = (list, id, what) => {
          const item = D()[list].find((x) => x.id === id);
          if (!item) throw new AppError2(`${what} n\xE3o encontrado.`);
          return item;
        };
        function vendedorAtivo(id) {
          const v = D().vendedores.find((x) => x.id === id);
          if (!v) throw new AppError2("Vendedor n\xE3o encontrado.", { vendedorId: "Escolha o vendedor." });
          if (!v.ativo) throw new AppError2("Esse vendedor est\xE1 desativado.", { vendedorId: "Escolha outro vendedor." });
          return v;
        }
        function addVendedorInterno(nome) {
          const n = R2.clean(nome, 40);
          if (n.length < 2) throw new AppError2("Informe o nome do vendedor.", { nome: "Informe o nome." });
          const dup = D().vendedores.find((v2) => R2.keyOf(v2.nome) === R2.keyOf(n));
          if (dup) {
            if (!dup.ativo || dup.excluido) {
              dup.ativo = true;
              dup.excluido = false;
              return dup;
            }
            throw new AppError2("J\xE1 existe um vendedor com esse nome.", { nome: "Esse nome j\xE1 existe." });
          }
          const v = { id: R2.newId("vnd"), nome: n, ativo: true, criadoEm: stamp() };
          D().vendedores.push(v);
          return v;
        }
        function upsertCliente(value) {
          let c = D().clientes.find((x) => !x.excluido && x.celular === value.celular);
          if (!c) {
            c = { id: R2.newId("cli"), criadoEm: stamp(), excluido: false };
            D().clientes.push(c);
          }
          c.tipo = value.tipo;
          c.celular = value.celular;
          c.nome = value.nome;
          c.empresa = value.empresa || "";
          c.fantasia = value.fantasia || "";
          c.cnpj = value.cnpj || "";
          c.docTipo = value.docTipo || "cnpj";
          return c;
        }
        const JANELA_RETORNO = 30;
        const RESULTADOS = ["nao_comprou", "sem_resposta"];
        const DIAS_TENTATIVA = 3;
        function tirarTentativa(l) {
          if (!l.retentativaId) return;
          const t = D().lembretes.find((x) => x.id === l.retentativaId);
          if (t && t.status === "pendente") t.status = "cancelado";
          delete l.retentativaId;
        }
        function contatoDoRetorno(clienteId, dataVenda, pedido) {
          const usados = new Set(D().vendas.filter((v) => v.retornoDe && !v.excluida).map((v) => v.retornoDe));
          const ok2 = (l) => l.clienteId === clienteId && l.status === "contatado" && l.contatadoEm && !usados.has(l.id) && R2.localDay(l.contatadoEm) <= dataVenda && R2.diffDays(R2.localDay(l.contatadoEm), dataVenda) <= JANELA_RETORNO;
          if (pedido) {
            const l = D().lembretes.find((x) => x.id === pedido);
            return l && ok2(l) ? l.id : null;
          }
          const cand = D().lembretes.filter(ok2).sort((a, b) => a.contatadoEm < b.contatadoEm ? 1 : -1);
          return cand.length ? cand[0].id : null;
        }
        const api = {
          estado: () => D(),
          configurar({ lojaNome, vendedores, whatsapp }) {
            const nome = R2.clean(lojaNome, 60);
            const errors = {};
            if (nome.length < 2) errors.lojaNome = "Informe o nome da loja.";
            const zap = R2.normalizePhone(whatsapp);
            if (zap && !R2.isValidPhone(zap)) errors.whatsapp = "Use DDD + n\xFAmero, ex.: (82) 99999-9999.";
            const nomes = (vendedores || []).map((n) => R2.clean(n, 40)).filter((n) => n.length >= 2);
            if (!nomes.length && !D().vendedores.length) errors.vendedores = "Cadastre pelo menos um vendedor.";
            if (Object.keys(errors).length) throw new AppError2("Confira os campos.", errors);
            D().loja.nome = nome;
            if (zap) D().loja.whatsapp = zap;
            for (const n of nomes) {
              if (!D().vendedores.some((v) => R2.keyOf(v.nome) === R2.keyOf(n))) addVendedorInterno(n);
            }
            return commit();
          },
          salvarLoja({ nome, whatsapp }) {
            if (nome !== void 0) {
              const n = R2.clean(nome, 60);
              if (n.length < 2) throw new AppError2("Informe o nome da loja.", { nome: "Informe o nome da loja." });
              D().loja.nome = n;
            }
            if (whatsapp !== void 0) {
              const zap = R2.normalizePhone(whatsapp);
              if (zap && !R2.isValidPhone(zap)) throw new AppError2("Use DDD + n\xFAmero, ex.: (82) 99999-9999.", { whatsapp: "Use DDD + n\xFAmero, ex.: (82) 99999-9999." });
              D().loja.whatsapp = zap;
            }
            return commit();
          },
          /** Clientes e vendas vindos de uma planilha. Quem já existe (mesmo celular) só ganha o que faltava. */
          importarClientes({ linhas, vendedorPadrao, incluirPassados }) {
            if (!Array.isArray(linhas) || !linhas.length) throw new AppError2("A planilha n\xE3o tem linhas para importar.");
            if (linhas.length > 5e3) throw new AppError2("Importe no m\xE1ximo 5.000 linhas por vez.");
            const plano = R2.planoImport(linhas, D(), today(), { vendedorPadrao, incluirPassados });
            if (!plano.clientes.length) throw new AppError2("Nenhuma linha tinha celular e nome v\xE1lidos.");
            const porCel = /* @__PURE__ */ new Map();
            for (const val of plano.clientes) {
              let c = D().clientes.find((x) => !x.excluido && x.celular === val.celular);
              if (c) {
                for (const k of ["nome", "empresa", "fantasia", "cnpj"]) if (!c[k] && val[k]) c[k] = val[k];
                if (val.cnpj && !c.docTipo) c.docTipo = val.docTipo;
                if (val.tipo === "atacado" && c.tipo !== "atacado" && (val.empresa || val.cnpj)) c.tipo = "atacado";
              } else {
                c = { id: R2.newId("cli"), criadoEm: stamp(), excluido: false, origem: "planilha", tipo: val.tipo, celular: val.celular, nome: val.nome, empresa: val.empresa, fantasia: val.fantasia, cnpj: val.cnpj, docTipo: val.docTipo };
                D().clientes.push(c);
              }
              if (val.ultimaCompra && (!c.ultimaCompra || val.ultimaCompra > c.ultimaCompra)) c.ultimaCompra = val.ultimaCompra;
              porCel.set(val.celular, c);
            }
            for (const vd of plano.vendas) {
              const cli = porCel.get(vd.celular);
              const venda = { id: R2.newId("vda"), clienteId: cli.id, cupom: vd.cupom, valor: vd.valor, data: vd.data, vendedorId: vd.vendedorId, obs: "", origem: "planilha", criadoEm: stamp(), excluida: false };
              if (vd.modelo && cli.tipo === "atacado") venda.modelo = vd.modelo;
              D().vendas.push(venda);
              for (const dias of vd.dias) {
                D().lembretes.push({ id: R2.newId("lem"), vendaId: venda.id, clienteId: cli.id, dias, data: R2.addDays(vd.data, dias), status: "pendente", contatadoEm: null });
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
            const v = findOrFail("vendedores", id, "Vendedor");
            const n = R2.clean(nome, 40);
            if (n.length < 2) throw new AppError2("Informe o nome do vendedor.", { nome: "Informe o nome." });
            if (D().vendedores.some((x) => x.id !== id && R2.keyOf(x.nome) === R2.keyOf(n))) {
              throw new AppError2("J\xE1 existe um vendedor com esse nome.", { nome: "Esse nome j\xE1 existe." });
            }
            v.nome = n;
            return commit();
          },
          ativarVendedor({ id, ativo }) {
            const v = findOrFail("vendedores", id, "Vendedor");
            if (!ativo && D().vendedores.filter((x) => x.ativo && !x.excluido).length <= 1) {
              throw new AppError2("A loja precisa de pelo menos um vendedor ativo.");
            }
            v.ativo = !!ativo;
            return commit();
          },
          /** Tira o vendedor da equipe. As vendas dele continuam nos relatórios com o nome. */
          excluirVendedor({ id }) {
            const v = findOrFail("vendedores", id, "Vendedor");
            if (v.ativo && D().vendedores.filter((x) => x.ativo && !x.excluido).length <= 1) {
              throw new AppError2("A loja precisa de pelo menos um vendedor ativo.");
            }
            v.excluido = true;
            v.ativo = false;
            v.excluidoEm = stamp();
            return commit();
          },
          /** Nomes que aparecem no "Entrar como administrador". As contas em si ficam no Firebase. */
          salvarAdmins({ admins }) {
            const vistos = /* @__PURE__ */ new Set();
            const lista = [];
            for (const a of Array.isArray(admins) ? admins : []) {
              const email = String(a && a.email || "").trim().toLowerCase().slice(0, 120);
              if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || vistos.has(email)) continue;
              vistos.add(email);
              lista.push({ email, nome: R2.clean(a.nome || email.split("@")[0], 40), funcao: R2.clean(a.funcao || "Administrador", 40) });
            }
            D().loja.admins = lista;
            return commit();
          },
          // ---------------------------------------------------------- nuvem
          /** Liga este computador à loja. Começa do zero: o que estava aqui fica num backup. */
          nuvemConectar({ uid, nome, admin }) {
            const n = R2.clean(nome, 40);
            if (!uid) throw new AppError2("N\xE3o consegui identificar este computador.");
            if (n.length < 2) throw new AppError2("D\xEA um nome para este computador.", { pcNome: "Ex.: Balc\xE3o 01" });
            store2.backupComo("antes-de-conectar");
            const cfg = D().config;
            const novo = require_store().emptyData(R2);
            for (const k of ["tema", "visaoHoje", "whatsappModo", "avisoAtivo", "avisoHora", "abrirComWindows"]) novo.config[k] = cfg[k];
            novo.nuvem = { pc: { uid: String(uid), nome: n }, cursor: 0, enviados: {} };
            if (admin && admin.email) novo.nuvem.ultimoAdmin = String(admin.email).toLowerCase();
            store2.data = novo;
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
            if (!D().nuvem) throw new AppError2("Este computador n\xE3o est\xE1 ligado \xE0 loja.");
            if (!Array.isArray(copia) || !copia.length) throw new AppError2("Essa c\xF3pia est\xE1 vazia.");
            store2.backupComo("antes-de-restaurar");
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
            store2.backupComo("antes-de-desconectar");
            const cfg = D().config;
            const novo = require_store().emptyData(R2);
            for (const k of ["tema", "visaoHoje", "whatsappModo", "avisoAtivo", "avisoHora", "abrirComWindows"]) novo.config[k] = cfg[k];
            store2.data = novo;
            return commit();
          },
          salvarConfig(partial) {
            const c = D().config;
            const p = partial || {};
            if (p.diasVarejo !== void 0) {
              const d = R2.normalizeDias(p.diasVarejo);
              if (!d.length) throw new AppError2("Deixe pelo menos um prazo para varejo.");
              c.diasVarejo = d;
            }
            if (p.diasAtacado !== void 0) {
              const d = R2.normalizeDias(p.diasAtacado);
              if (!d.length) throw new AppError2("Deixe pelo menos um prazo para atacado.");
              c.diasAtacado = d;
            }
            for (const k of ["mensagemVarejo", "mensagemAtacado", "mensagemEncomenda"]) {
              if (p[k] !== void 0) {
                const t = String(p[k] || "").trim().slice(0, 1e3);
                if (t.length < 5) throw new AppError2("A mensagem est\xE1 muito curta.");
                c[k] = t;
              }
            }
            if (p.tema !== void 0 && ["sistema", "claro", "escuro"].includes(p.tema)) c.tema = p.tema;
            if (p.whatsappModo !== void 0 && ["auto", "app", "web"].includes(p.whatsappModo)) c.whatsappModo = p.whatsappModo;
            if (p.avisoAtivo !== void 0) c.avisoAtivo = !!p.avisoAtivo;
            if (p.abrirComWindows !== void 0) c.abrirComWindows = !!p.abrirComWindows;
            if (p.avisoHora !== void 0) {
              if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(p.avisoHora))) throw new AppError2("Hor\xE1rio inv\xE1lido.");
              c.avisoHora = p.avisoHora;
            }
            if (p.visaoHoje !== void 0 && ["fila", "quadro", "agenda"].includes(p.visaoHoje)) c.visaoHoje = p.visaoHoje;
            return commit();
          },
          /**
           * A venda é um retorno quando o cliente foi chamado antes dela: o contato indicado
           * (botão Comprou) ou, sem indicação, o último contato feito até 30 dias antes da compra
           * que ainda não tem venda ligada.
           */
          registrarVenda(input) {
            const v = R2.validateVenda(input || {}, today());
            if (!v.ok) throw new AppError2("Confira os campos destacados.", v.errors);
            vendedorAtivo(v.value.vendedorId);
            const val = v.value;
            const dup = D().vendas.find(
              (x) => vendaAtiva(x) && R2.keyOf(x.cupom) === R2.keyOf(val.cupom) && x.data === val.data
            );
            if (dup) throw new AppError2("Esse cupom j\xE1 foi registrado nessa data.", { cupom: "Cupom j\xE1 registrado." });
            const cli = upsertCliente(val);
            const venda = {
              id: R2.newId("vda"),
              clienteId: cli.id,
              cupom: val.cupom,
              valor: val.valor,
              data: val.data,
              vendedorId: val.vendedorId,
              obs: val.obs,
              criadoEm: stamp(),
              excluida: false
            };
            if (cli.tipo === "atacado" && val.modelo) venda.modelo = val.modelo;
            const ret = contatoDoRetorno(cli.id, val.data, input && input.retornoDe);
            if (ret) {
              venda.retornoDe = ret;
              const lr = D().lembretes.find((x) => x.id === ret);
              if (lr) {
                tirarTentativa(lr);
                delete lr.resultado;
              }
            }
            D().vendas.push(venda);
            if (ret) {
              for (const l of D().lembretes) {
                if (l.clienteId === cli.id && l.status === "pendente") {
                  l.status = "cancelado";
                  l.canceladoPorVenda = venda.id;
                }
              }
            }
            for (const dias of val.dias) {
              D().lembretes.push({
                id: R2.newId("lem"),
                vendaId: venda.id,
                clienteId: cli.id,
                dias,
                data: R2.addDays(val.data, dias),
                status: "pendente",
                contatadoEm: null
              });
            }
            commit();
            return { estado: D(), vendaId: venda.id, clienteId: cli.id };
          },
          /** Troca o catálogo de produtos pela planilha: atualiza pelo código, sem duplicar. */
          importarProdutos({ linhas }) {
            const antes = new Map((D().produtos || []).map((p) => [p.id, p]));
            const novos = /* @__PURE__ */ new Map();
            for (const l of linhas || []) {
              const codigo = R2.clean(l && l.codigo, 30);
              const nome = R2.clean(l && l.nome, 120);
              if (!codigo || nome.length < 2) continue;
              const id = `p_${codigo.replace(/[^\w\-.]/g, "_")}`;
              const velho = antes.get(id);
              novos.set(id, velho && velho.codigo === codigo && velho.nome === nome ? velho : { id, codigo, nome });
            }
            if (!novos.size) throw new AppError2("N\xE3o encontrei produtos com c\xF3digo e descri\xE7\xE3o nessa planilha.");
            D().produtos = [...novos.values()];
            D().loja.produtosEm = stamp();
            commit();
            return { estado: D(), total: novos.size };
          },
          registrarEncomenda(input) {
            const v = R2.validateEncomenda(input || {});
            if (!v.ok) throw new AppError2("Confira os campos destacados.", v.errors);
            vendedorAtivo(v.value.vendedorId);
            const val = v.value;
            const cli = upsertCliente(val);
            const aberta = D().encomendas.find(
              (e) => e.clienteId === cli.id && R2.keyOf(e.produto) === R2.keyOf(val.produto) && ["esperando", "chegou", "avisado"].includes(e.status)
            );
            if (aberta) {
              throw new AppError2("Esse cliente j\xE1 est\xE1 esperando esse produto.", { produto: "Pedido j\xE1 existe." });
            }
            const enc = {
              id: R2.newId("enc"),
              clienteId: cli.id,
              produto: val.produto,
              ...val.codigo ? { codigo: val.codigo } : {},
              quantidade: val.quantidade,
              obs: val.obs,
              vendedorId: val.vendedorId,
              status: "esperando",
              criadoEm: stamp(),
              chegouEm: null,
              avisadoEm: null,
              encerradoEm: null
            };
            D().encomendas.push(enc);
            commit();
            return { estado: D(), encomendaId: enc.id, clienteId: cli.id };
          },
          marcarContatado({ id }) {
            const l = findOrFail("lembretes", id, "Lembrete");
            if (l.status === "cancelado") throw new AppError2("Esse lembrete foi cancelado.");
            l.status = "contatado";
            l.contatadoEm = stamp();
            return commit();
          },
          desfazerContato({ id }) {
            const l = findOrFail("lembretes", id, "Lembrete");
            tirarTentativa(l);
            delete l.resultado;
            l.status = "pendente";
            l.contatadoEm = null;
            for (const v of D().vendas) if (v.retornoDe === l.id) delete v.retornoDe;
            return commit();
          },
          /**
           * "Como foi?" depois do contato: nao_comprou, sem_resposta ou null (limpa).
           * Sem resposta cria uma 2ª tentativa daqui a DIAS_TENTATIVA dias (só uma).
           */
          resultadoContato({ id, resultado }) {
            const l = findOrFail("lembretes", id, "Lembrete");
            if (l.status !== "contatado") throw new AppError2("Marque o contato como feito antes.");
            const r = resultado || null;
            if (r && !RESULTADOS.includes(r)) throw new AppError2("Resultado inv\xE1lido.");
            tirarTentativa(l);
            if (!r) delete l.resultado;
            else l.resultado = r;
            if (r === "sem_resposta" && !l.tentativa) {
              const n = {
                id: R2.newId("lem"),
                vendaId: l.vendaId,
                clienteId: l.clienteId,
                dias: l.dias,
                data: R2.addDays(today(), DIAS_TENTATIVA),
                status: "pendente",
                contatadoEm: null,
                tentativa: 2
              };
              D().lembretes.push(n);
              l.retentativaId = n.id;
            }
            return commit();
          },
          adiarLembrete({ id, data }) {
            const l = findOrFail("lembretes", id, "Lembrete");
            if (!R2.parseISO(data)) throw new AppError2("Data inv\xE1lida.");
            if (R2.diffDays(today(), data) < 0) throw new AppError2("Escolha hoje ou uma data futura.");
            l.data = data;
            l.status = "pendente";
            l.contatadoEm = null;
            return commit();
          },
          cancelarLembrete({ id }) {
            const l = findOrFail("lembretes", id, "Lembrete");
            l.status = "cancelado";
            return commit();
          },
          /** Muda cupom (e o modelo da nota no atacado), valor, data, vendedor e prazos. Retornos já feitos não mudam. */
          editarVenda({ id, cupom, valor, data, vendedorId, dias, modelo }) {
            const venda = findOrFail("vendas", id, "Venda");
            if (venda.excluida) throw new AppError2("Essa venda foi exclu\xEDda.");
            const cli = findOrFail("clientes", venda.clienteId, "Cliente");
            const v = R2.validateVenda({ ...cli, cnpj: cli.cnpj, docTipo: cli.docTipo, cupom, valor, data, vendedorId, dias }, today());
            const erros = {};
            for (const k of ["cupom", "valor", "data", "vendedorId", "dias"]) if (v.errors[k]) erros[k] = v.errors[k];
            if (Object.keys(erros).length) throw new AppError2("Confira os campos destacados.", erros);
            const vend = D().vendedores.find((x) => x.id === vendedorId);
            if (!vend) throw new AppError2("Vendedor n\xE3o encontrado.", { vendedorId: "Escolha o vendedor." });
            const val = v.value;
            const dup = D().vendas.find((x) => x.id !== id && vendaAtiva(x) && R2.keyOf(x.cupom) === R2.keyOf(val.cupom) && x.data === val.data);
            if (dup) throw new AppError2("Esse cupom j\xE1 foi registrado nessa data.", { cupom: "Cupom j\xE1 registrado." });
            venda.cupom = val.cupom;
            if (cli.tipo === "atacado" && R2.modeloDe(modelo)) venda.modelo = R2.modeloDe(modelo);
            venda.valor = val.valor;
            venda.data = val.data;
            venda.vendedorId = vendedorId;
            venda.editadoEm = stamp();
            const desta = D().lembretes.filter((l) => l.vendaId === id && !l.tentativa);
            for (const d of val.dias) {
              const l = desta.find((x) => x.dias === d);
              if (!l) {
                D().lembretes.push({ id: R2.newId("lem"), vendaId: id, clienteId: venda.clienteId, dias: d, data: R2.addDays(val.data, d), status: "pendente", contatadoEm: null });
              } else if (l.status === "pendente") l.data = R2.addDays(val.data, d);
            }
            D().lembretes = D().lembretes.filter((l) => !(l.vendaId === id && l.status === "pendente" && !val.dias.includes(l.dias)));
            return commit();
          },
          excluirVenda({ id }) {
            const v = findOrFail("vendas", id, "Venda");
            v.excluida = true;
            for (const l of D().lembretes) {
              if (l.vendaId === id && l.status === "pendente") l.status = "cancelado";
              if (l.canceladoPorVenda === id && l.status === "cancelado") {
                l.status = "pendente";
                delete l.canceladoPorVenda;
              }
            }
            return commit();
          },
          editarCliente({ id, ...fields }) {
            const c = findOrFail("clientes", id, "Cliente");
            const r = R2.validateCliente({ ...c, ...fields });
            if (Object.keys(r.errors).length) throw new AppError2("Confira os campos destacados.", r.errors);
            const outro = D().clientes.find((x) => x.id !== id && !x.excluido && x.celular === r.value.celular);
            if (outro) throw new AppError2("J\xE1 existe outro cliente com esse celular.", { celular: "Celular j\xE1 cadastrado." });
            Object.assign(c, r.value);
            return commit();
          },
          excluirCliente({ id }) {
            const c = findOrFail("clientes", id, "Cliente");
            c.excluido = true;
            for (const l of D().lembretes) {
              if (l.clienteId === id && l.status === "pendente") l.status = "cancelado";
            }
            for (const e of D().encomendas) {
              if (e.clienteId === id && !e.encerradoEm) {
                e.status = "desistiu";
                e.encerradoEm = stamp();
              }
            }
            return commit();
          },
          /** Exclui vários clientes de uma vez. Guarda o lote para dar para desfazer. */
          excluirClientes({ ids }) {
            const lista = (Array.isArray(ids) ? ids : []).map((id) => D().clientes.find((c) => c.id === id && !c.excluido)).filter(Boolean);
            if (!lista.length) throw new AppError2("Nenhum cliente selecionado.");
            const lote = R2.newId("lote");
            const set = new Set(lista.map((c) => c.id));
            for (const c of lista) {
              c.excluido = true;
              c.excluidoLote = lote;
              c.excluidoEm = stamp();
            }
            let retornos = 0;
            for (const l of D().lembretes) {
              if (set.has(l.clienteId) && l.status === "pendente") {
                l.status = "cancelado";
                l.canceladoLote = lote;
                retornos++;
              }
            }
            for (const e of D().encomendas) {
              if (set.has(e.clienteId) && !e.encerradoEm) {
                e.antesLote = { status: e.status };
                e.status = "desistiu";
                e.encerradoEm = stamp();
                e.canceladoLote = lote;
              }
            }
            const vendas = D().vendas.filter((v) => set.has(v.clienteId) && !v.excluida).length;
            commit();
            return { estado: D(), lote, clientes: lista.length, vendas, retornos };
          },
          /** Desfaz uma exclusão em lote. */
          restaurarLote({ lote }) {
            if (!lote) throw new AppError2("Nada para desfazer.");
            for (const c of D().clientes) if (c.excluidoLote === lote) {
              c.excluido = false;
              delete c.excluidoLote;
              delete c.excluidoEm;
            }
            for (const l of D().lembretes) if (l.canceladoLote === lote) {
              l.status = "pendente";
              delete l.canceladoLote;
            }
            for (const e of D().encomendas) {
              if (e.canceladoLote === lote) {
                e.status = e.antesLote && e.antesLote.status || "esperando";
                e.encerradoEm = null;
                delete e.antesLote;
                delete e.canceladoLote;
              }
            }
            return commit();
          },
          /** Chegou o produto: todos que esperam por ele passam a "chegou". */
          produtoChegou({ produto }) {
            const k = R2.keyOf(produto);
            let n = 0;
            for (const e of D().encomendas) {
              if (e.status === "esperando" && R2.keyOf(e.produto) === k) {
                e.status = "chegou";
                e.chegouEm = stamp();
                n++;
              }
            }
            if (!n) throw new AppError2("Ningu\xE9m est\xE1 esperando esse produto.");
            return commit();
          },
          encomendaAvisada({ id }) {
            const e = findOrFail("encomendas", id, "Pedido");
            if (!e.chegouEm) e.chegouEm = stamp();
            e.status = "avisado";
            e.avisadoEm = stamp();
            return commit();
          },
          encerrarEncomenda({ id, resultado }) {
            const e = findOrFail("encomendas", id, "Pedido");
            if (!["comprou", "desistiu"].includes(resultado)) throw new AppError2("Resultado inv\xE1lido.");
            e.status = resultado;
            e.encerradoEm = stamp();
            return commit();
          },
          reabrirEncomenda({ id }) {
            const e = findOrFail("encomendas", id, "Pedido");
            e.status = e.avisadoEm ? "avisado" : e.chegouEm ? "chegou" : "esperando";
            e.encerradoEm = null;
            return commit();
          }
        };
        return api;
      }
      var ACOES2 = [
        "configurar",
        "salvarLoja",
        "addVendedor",
        "renomearVendedor",
        "ativarVendedor",
        "salvarConfig",
        "registrarVenda",
        "registrarEncomenda",
        "marcarContatado",
        "desfazerContato",
        "adiarLembrete",
        "cancelarLembrete",
        "excluirVenda",
        "editarCliente",
        "excluirCliente",
        "produtoChegou",
        "encomendaAvisada",
        "encerrarEncomenda",
        "reabrirEncomenda",
        "importarClientes",
        "excluirClientes",
        "restaurarLote",
        "editarVenda",
        "excluirVendedor",
        "salvarAdmins",
        "importarProdutos",
        "nuvemConectar",
        "nuvemRemoto",
        "nuvemEnviados",
        "nuvemDesconectar",
        "restaurarCopia",
        "resultadoContato"
      ];
      module.exports = { makeService: makeService2, AppError: AppError2, ACOES: ACOES2 };
    }
  });

  // fonte/entrada.js
  var R = require_rules();
  var { emptyData, normalize } = require_store();
  var { makeService, AppError, ACOES } = require_service();
  var CHAVE = "retornei-teste.dados";
  var StoreWeb = class {
    constructor() {
      this.dir = "Este aparelho";
      let raw = null;
      try {
        raw = JSON.parse(localStorage.getItem(CHAVE) || "null");
      } catch (_) {
        raw = null;
      }
      this.data = raw ? normalize(raw, R) : emptyData(R);
      this.novo = !raw;
    }
    save() {
      try {
        localStorage.setItem(CHAVE, JSON.stringify(this.data));
      } catch (_) {
      }
    }
    backupComo() {
    }
    listBackups() {
      return [];
    }
  };
  function cnpj(base) {
    const d = base.split("").map(Number);
    const dv = (n) => {
      const p = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const s = p.reduce((a, x, i) => a + x * d[i], 0) % 11;
      return s < 2 ? 0 : 11 - s;
    };
    d.push(dv(12));
    d.push(dv(13));
    return d.join("");
  }
  function semear(svc2, store2) {
    svc2.configurar({ lojaNome: "Viva Nature", vendedores: ["Michele Ferreira", "Ana Paula", "Bruna Alves"] });
    const vend = store2.data.vendedores.map((v) => v.id);
    const hoje = R.todayISO();
    let cupom = 4600;
    const vendas = [
      ["Marcos Vin\xEDcius Dias", "82985072243", 15, "133,15", [15, 30], 0],
      ["Dona L\xFAcia", "82988033147", 15, "4153,72", [15, 30], 1, { empresa: "Restaurante Sabor da Terra LTDA", fantasia: "Sabor da Terra", cnpj: cnpj("046693440001"), modelo: "55" }],
      ["Ana Clara Moura", "82984702130", 17, "89,90", [15, 30], 2],
      ["Jo\xE3o Pedro Lins", "82985812469", 15, "212,40", [15], 0],
      ["Rita Fernandes", "82982481452", 30, "56,00", [30], 1],
      ["Seu Raimundo", "82991230987", 15, "1870,00", [15, 30], 2, { empresa: "Emp\xF3rio Natural Ponta Verde LTDA", fantasia: "Emp\xF3rio Natural Ponta Verde", cnpj: cnpj("237845120001"), modelo: "65" }],
      ["Larissa Moura", "82987714520", 16, "291,54", [15, 30], 0],
      ["Juliana Prado", "82996632210", 15, "178,30", [15, 30], 1],
      ["Ot\xE1vio Pereira", "82981156734", 12, "104,24", [15, 30], 2],
      ["Eduarda Nunes", "82998741236", 10, "234,89", [15, 30], 0],
      ["Carla Souza", "82993325478", 5, "67,50", [15, 30], 1],
      ["Pedro Henrique Costa", "82986654123", 2, "412,00", [15, 30], 2],
      ["Fernanda Lopes", "82984459871", 20, "145,70", [30], 0],
      ["Bruno Alves", "82999871254", 1, "98,40", [15, 30], 1],
      ["Dona Socorro", "82988541237", 8, "2340,15", [15, 30], 0, { empresa: "Mercearia Bom Sabor ME", fantasia: "Mercearia Bom Sabor", cnpj: cnpj("118765430001"), modelo: "55" }],
      ["Tiago Santana", "82983214785", 25, "59,90", [30], 2]
    ];
    for (const [nome, celular, atras, valor, dias, vi, at] of vendas) {
      const ent = { nome, celular, valor, dias, data: R.addDays(hoje, -atras), cupom: String(++cupom).padStart(6, "0"), vendedorId: vend[vi], tipo: at ? "atacado" : "varejo" };
      if (at) Object.assign(ent, { empresa: at.empresa, fantasia: at.fantasia, cnpj: at.cnpj, docTipo: "cnpj", modelo: at.modelo });
      try {
        svc2.registrarVenda(ent);
      } catch (e) {
        console.warn("semente", nome, e.message, e.fields);
      }
    }
    const ju = store2.data.clientes.find((c) => c.nome === "Juliana Prado");
    const lj = ju && store2.data.lembretes.find((l) => l.clienteId === ju.id && l.data === hoje);
    if (lj) svc2.marcarContatado({ id: lj.id });
    const pedidos = [
      ["Col\xE1geno hidrolisado 300g", "Carla Souza", "82993325478", 1],
      ["Chia em gr\xE3os 500g", "Rita Fernandes", "82982481452", 0],
      ["\xD3leo de coco extravirgem 500ml", "Bianca Rocha", "82997412365", 2]
    ];
    for (const [produto, nome, celular, vi] of pedidos) {
      try {
        svc2.registrarEncomenda({ produto, nome, celular, quantidade: 1, vendedorId: vend[vi], tipo: "varejo" });
      } catch (e) {
        console.warn("pedido", e.message, e.fields);
      }
    }
    try {
      svc2.produtoChegou({ produto: "Chia em gr\xE3os 500g" });
    } catch (e) {
      console.warn(e.message);
    }
  }
  var store = new StoreWeb();
  var svc = makeService(store, R);
  if (store.novo || !store.data.vendedores.length) {
    store.data = emptyData(R);
    semear(svc, store);
  }
  var ok = (data) => ({ ok: true, data });
  var fail = (e) => ({ ok: false, error: e instanceof AppError ? e.message : "Algo deu errado. Tente de novo.", fields: e && e.fields });
  window.api = {
    web: true,
    estado: async () => ok(svc.estado ? svc.estado() : store.data),
    acao: async (nome, args) => {
      try {
        if (!ACOES.includes(nome)) throw new AppError("A\xE7\xE3o desconhecida.");
        return ok(svc[nome](args || {}));
      } catch (e) {
        if (!(e instanceof AppError)) console.error(e);
        return fail(e);
      }
    },
    // protótipo: abre o WhatsApp com a mensagem pronta, mas sem o número do cliente (os números são de teste)
    whatsapp: async (url) => {
      const m = /^https:\/\/wa\.me\/\d+(\?text=.*)?$/.exec(String(url || ""));
      if (!m) return { ok: false, error: "N\xFAmero de WhatsApp inv\xE1lido." };
      window.open(`https://wa.me/${m[1] || ""}`, "_blank", "noopener");
      return ok(true);
    },
    info: async () => ok({ versao: await versaoAtual(), pasta: "Este aparelho", backups: 0, ultimaCopia: 0 }),
    // atualização: mesma tela do Windows ("Atualização disponível" · Atualizar / Depois)
    updEstado: async () => ok({ estado: UPD.estado, versao: UPD.versao }),
    aoUpd: (fn) => {
      UPD.ouvintes.push(fn);
    },
    updInstalar: async () => {
      const w = UPD.reg && UPD.reg.waiting;
      UPD.pedido = true;
      if (w) w.postMessage("ativar");
      else location.reload();
      return ok(true);
    },
    tema: async () => ok(true),
    imprimir: async () => {
      window.print();
      return ok(true);
    },
    // PDF: a impressão do navegador tem "Salvar como PDF"; o nome sugerido vem do título da página
    pdf: (nome) => new Promise((fim) => {
      const titulo = document.title;
      document.title = String(nome || "retornei");
      let feito = false;
      const pronto = () => {
        if (feito) return;
        feito = true;
        window.removeEventListener("afterprint", pronto);
        document.title = titulo;
        fim(ok(null));
      };
      window.addEventListener("afterprint", pronto);
      setTimeout(() => {
        window.print();
        setTimeout(pronto, 1500);
      }, 50);
    })
  };
  var UPD = { estado: "nenhum", versao: "", ouvintes: [], reg: null, pedido: false };
  var numero = (k) => {
    const m = /-(\d+)\.(\d+)\.(\d+)-/.exec(k);
    return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  };
  function rotulo(nome) {
    const m = /^retornei-(teste|web)-(\d+\.\d+\.\d+)-/.exec(nome || "");
    return m ? (m[1] === "teste" ? "Beta " : "") + m[2] : "";
  }
  async function versoes() {
    try {
      const ks = (await caches.keys()).filter((k) => /^retornei-/.test(k));
      return ks.sort((a, b) => {
        const x = numero(a), y = numero(b);
        return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
      });
    } catch (_) {
      return [];
    }
  }
  async function versaoAtual() {
    const v = await versoes();
    return rotulo(v[0]) || "Beta";
  }
  async function avisarNova() {
    if (UPD.estado === "pronto") return;
    const v = await versoes();
    UPD.estado = "pronto";
    UPD.versao = rotulo(v[v.length - 1]) || "nova";
    const mostrar = () => UPD.ouvintes.forEach((fn) => fn({ estado: UPD.estado, versao: UPD.versao }));
    if (!document.querySelector(".overlay")) return mostrar();
    const obs = new MutationObserver(() => {
      if (!document.querySelector(".overlay")) {
        obs.disconnect();
        mostrar();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (UPD.pedido) location.reload();
    });
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then((reg) => {
        UPD.reg = reg;
        const esperando = () => {
          if (reg.waiting && navigator.serviceWorker.controller) avisarNova();
        };
        esperando();
        reg.addEventListener("updatefound", () => {
          const w = reg.installing;
          if (w) w.addEventListener("statechange", () => {
            if (w.state === "installed") esperando();
          });
        });
        let ultima = Date.now();
        const conferir = () => {
          if (document.visibilityState !== "visible" || Date.now() - ultima < 15 * 60 * 1e3) return;
          ultima = Date.now();
          reg.update().catch(() => {
          });
        };
        document.addEventListener("visibilitychange", conferir);
        setInterval(conferir, 15 * 60 * 1e3);
      }).catch(() => {
      });
    });
  }
  window.RetorneiTeste = {
    recomecar() {
      try {
        localStorage.removeItem(CHAVE);
      } catch (_) {
      }
      location.reload();
    }
  };
})();
