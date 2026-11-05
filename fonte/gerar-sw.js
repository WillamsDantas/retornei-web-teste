// Gera src/sw.js com a lista de arquivos e uma versão nova.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const raiz = path.join(__dirname, '..', 'src');
const lista = [];
(function andar(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) andar(p); else if (!/sw\.js$|LICENSE/.test(f)) lista.push('./' + path.relative(raiz, p).split(path.sep).join('/')); } })(raiz);
lista.push('./');
// nome = versão do package.json (Beta 0.0.x) + um resumo do conteúdo, para o aparelho sempre perceber uma publicação nova
const h = crypto.createHash('sha1');
for (const f of lista) if (f !== './') h.update(fs.readFileSync(path.join(raiz, f)));
const versao = 'retornei-teste-' + require('../package.json').version + '-' + h.digest('hex').slice(0, 8);
fs.writeFileSync(path.join(raiz, 'sw.js'), fs.readFileSync(path.join(__dirname, 'sw-modelo.js'), 'utf8').replace('__VERSAO__', versao).replace('__ARQUIVOS__', JSON.stringify(lista, null, 0)));
console.log(versao, lista.length, 'arquivos');
