/**
 * Armazenamento local do Retornei: um arquivo JSON na pasta de dados do usuário.
 * Gravação atômica (tmp + rename), cópia diária em /backups (guarda 30).
 * Com `cripto` (no app: proteção do Windows, presa ao usuário do computador), o arquivo e as cópias
 * ficam criptografados: { retorneiCripto: 1, dados: base64 }. O "Exportar" continua legível.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const VERSAO = 1;

function emptyData(R) {
  return {
    versao: VERSAO,
    loja: { nome: '', whatsapp: '' },
    config: {
      diasVarejo: R.DIAS_VAREJO.slice(),
      diasAtacado: R.DIAS_ATACADO.slice(),
      mensagemVarejo: R.MSG_VAREJO,
      mensagemAtacado: R.MSG_ATACADO,
      mensagemEncomenda: R.MSG_ENCOMENDA,
      tema: 'sistema',
      visaoHoje: 'fila',
      whatsappModo: 'auto',
      avisoAtivo: true,
      avisoHora: '08:30',
      avisoUltimo: '',
      abrirComWindows: true,
      prazos1122: true,
    },
    vendedores: [],
    clientes: [],
    vendas: [],
    lembretes: [],
    encomendas: [],
    produtos: [], // catálogo da loja: { id, codigo, nome }
    nuvem: null, // { pc: { uid, nome }, cursor, enviados: { chave: resumo } } quando ligado à loja
  };
}

function normalize(raw, R) {
  const base = emptyData(R);
  if (!raw || typeof raw !== 'object') return base;
  const out = { ...base, ...raw };
  out.versao = VERSAO;
  out.loja = { ...base.loja, ...(raw.loja || {}) };
  out.config = { ...base.config, ...(raw.config || {}) };
  // 1.1.22: o padrão do atacado deixou de ser 7, 30 e 60. Quem ainda estava nele passa para 15 e 30; quem mudou à mão continua.
  if (!(raw.config && raw.config.prazos1122)) {
    if (JSON.stringify(out.config.diasAtacado) === '[7,30,60]') out.config.diasAtacado = R.DIAS_ATACADO.slice();
    out.config.prazos1122 = true;
  }
  for (const k of ['vendedores', 'clientes', 'vendas', 'lembretes', 'encomendas', 'produtos']) {
    out[k] = Array.isArray(raw[k]) ? raw[k] : [];
  }
  const n = raw.nuvem;
  out.nuvem = n && typeof n === 'object' && n.pc && n.pc.uid
    ? { pc: { uid: String(n.pc.uid), nome: String(n.pc.nome || '') }, cursor: Number(n.cursor) || 0, enviados: n.enviados && typeof n.enviados === 'object' ? n.enviados : {} }
    : null;
  return out;
}

class Store {
  /** cripto (opcional): { encrypt(texto) → Buffer, decrypt(Buffer) → texto } */
  constructor(dir, R, cripto) {
    this.dir = dir;
    this.R = R;
    this.cripto = cripto || null;
    this.file = path.join(dir, 'prazzo-dados.json');
    this.backupDir = path.join(dir, 'backups');
    fs.mkdirSync(this.backupDir, { recursive: true });
    this.aberto = false; // achou arquivo sem criptografia (versões antigas)
    this.data = this.load();
    if (this.cripto && this.aberto) this.protegerTudo();
  }

  /** Lê um arquivo do Retornei, criptografado ou não. */
  ler(file) {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (raw && raw.retorneiCripto === 1 && typeof raw.dados === 'string') {
      if (!this.cripto) throw new Error('Arquivo criptografado sem a chave deste computador.');
      return JSON.parse(this.cripto.decrypt(Buffer.from(raw.dados, 'base64')));
    }
    return raw;
  }

  /** Texto gravado no disco: criptografado quando há cripto. */
  texto(data) {
    const t = JSON.stringify(data, null, 1);
    return this.cripto ? JSON.stringify({ retorneiCripto: 1, dados: this.cripto.encrypt(t).toString('base64') }) : t;
  }

  /** Primeira abertura com criptografia: regrava o arquivo e as cópias antigas, que estavam abertas. */
  protegerTudo() {
    try { this.save(); } catch (_) { /* tenta de novo na próxima gravação */ }
    let nomes = [];
    try { nomes = fs.readdirSync(this.backupDir).filter((f) => /\.json$/.test(f)); } catch (_) { /* nada */ }
    for (const f of nomes) {
      const arq = path.join(this.backupDir, f);
      try {
        const raw = JSON.parse(fs.readFileSync(arq, 'utf8'));
        if (raw && raw.retorneiCripto === 1) continue;
        const tmp = `${arq}.tmp`;
        fs.writeFileSync(tmp, this.texto(raw), 'utf8');
        fs.renameSync(tmp, arq);
      } catch (_) { /* cópia ilegível fica como está */ }
    }
  }

  load() {
    try {
      const raw = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      if (!(raw && raw.retorneiCripto === 1)) this.aberto = true;
      return normalize(this.ler(this.file), this.R);
    } catch (e) {
      if (e.code === 'ENOENT') return emptyData(this.R);
      // arquivo corrompido: guarda uma cópia e tenta o backup mais recente
      try {
        fs.copyFileSync(this.file, `${this.file}.corrompido-${Date.now()}`);
      } catch (_) { /* nada */ }
      const last = this.listBackups()[0];
      if (last) {
        try {
          return normalize(this.ler(path.join(this.backupDir, last)), this.R);
        } catch (_) { /* nada */ }
      }
      return emptyData(this.R);
    }
  }

  save() {
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, this.texto(this.data), 'utf8');
    fs.renameSync(tmp, this.file);
    this.dailyBackup();
  }

  listBackups() {
    try {
      return fs
        .readdirSync(this.backupDir)
        .filter((f) => /^prazzo-\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .sort()
        .reverse();
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
    } catch (_) { /* backup é melhor esforço */ }
  }

  exportTo(file) {
    fs.writeFileSync(file, JSON.stringify(this.data, null, 1), 'utf8');
  }

  importFrom(file) {
    let raw;
    try { raw = this.ler(file); } catch (_) { raw = null; }
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.clientes)) {
      throw new Error('Esse arquivo não é um backup do Retornei.');
    }
    // guarda o estado atual antes de substituir
    try {
      fs.copyFileSync(this.file, path.join(this.backupDir, `antes-de-importar-${Date.now()}.json`));
    } catch (_) { /* nada */ }
    // ligado à nuvem: o computador continua ligado; o que mudou sobe na próxima sincronização
    const nuvem = this.data.nuvem;
    this.data = normalize(raw, this.R);
    this.data.nuvem = nuvem;
    this.save();
  }

  /** Guarda uma cópia do arquivo atual com um nome que explica o motivo. */
  backupComo(motivo) {
    try {
      fs.copyFileSync(this.file, path.join(this.backupDir, `${motivo}-${Date.now()}.json`));
    } catch (_) { /* sem arquivo ainda */ }
  }
}

module.exports = { Store, emptyData, normalize };
