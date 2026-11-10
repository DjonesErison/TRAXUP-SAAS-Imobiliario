#!/usr/bin/env node
// Cria um usuário Administrador ou redefine a senha de um usuário existente, direto na base do servidor.
// Uso (no VPS):
//   sudo systemctl stop traxup-imob
//   sudo -u traxup node scripts/usuario.mjs --login admin --senha 'NovaSenha123' [--nome 'Djones Erison']
//   sudo systemctl start traxup-imob
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2); const opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
const login = (opt('--login') || '').trim(), senha = opt('--senha') || '', nome = opt('--nome');
if (!login || senha.length < 6) { console.error("Uso: node scripts/usuario.mjs --login admin --senha 'minimo6' [--nome 'Seu Nome']"); process.exit(1); }
let dataDir = 'data'; try { const m = fs.readFileSync(path.join(root, '.env'), 'utf8').match(/^DATA_DIR=([^\s#]+)/m); if (m) dataDir = m[1].replace(/^["']|["']$/g, ''); } catch { }
const file = path.resolve(root, dataDir, 'db.json'); fs.mkdirSync(path.dirname(file), { recursive: true });
const db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}; db.usuarios ||= {}; db.filiais ||= {};
const salt = crypto.randomBytes(16).toString('hex'); const hash = crypto.pbkdf2Sync(senha, Buffer.from(salt, 'hex'), 120000, 32, 'sha256').toString('hex');
let u = Object.values(db.usuarios).find(x => (x.login || '').toLowerCase() === login.toLowerCase());
if (u) { Object.assign(u, { salt, hash, ativo: true, ...(nome ? { nome } : {}) }); console.log(`Senha redefinida para "${u.login}" (${u.perfil}).`); }
else {
  if (!Object.keys(db.filiais).length) { const id = crypto.randomUUID(); db.filiais[id] = { id, nome: 'Matriz', razao: 'Matriz', multa: 2, jurosMes: 1, bb: { carteira: '17', variacao: '35' } }; }
  const id = crypto.randomUUID(); u = db.usuarios[id] = { id, nome: nome || login, login, perfil: 'Administrador', filiais: ['*'], ativo: true, salt, hash, criadoEm: new Date().toISOString() };
  console.log(`Administrador "${login}" criado.`);
}
if (fs.existsSync(file)) fs.copyFileSync(file, file + '.antes-usuario-' + Date.now());
fs.writeFileSync(file, JSON.stringify(db)); try { fs.unlinkSync(path.join(path.dirname(file), 'sessions.json')); } catch { }
console.log('Base:', file, '· inicie o serviço: sudo systemctl start traxup-imob');
