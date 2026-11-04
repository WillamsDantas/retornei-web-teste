// Gera src/sw.js com a lista de arquivos e uma versão nova.
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..', 'src');
const lista = [];
(function andar(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) andar(p); else if (!/sw\.js$|LICENSE/.test(f)) lista.push('./' + path.relative(raiz, p).split(path.sep).join('/')); } })(raiz);
lista.push('./');
const versao = 'retornei-teste-' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
fs.writeFileSync(path.join(raiz, 'sw.js'), fs.readFileSync(path.join(__dirname, 'sw-modelo.js'), 'utf8').replace('__VERSAO__', versao).replace('__ARQUIVOS__', JSON.stringify(lista, null, 0)));
console.log(versao, lista.length, 'arquivos');
