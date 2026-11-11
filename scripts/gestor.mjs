#!/usr/bin/env node
// Cria um gestor do Painel Gerencial (/painelgerencial) ou redefine a senha de um existente.
// Uso (no VPS):
//   sudo systemctl stop traxup-imob
//   sudo -u traxup node scripts/gestor.mjs --login djones --senha 'SenhaForte123' [--nome 'Djones Erison']
//   sudo systemctl start traxup-imob
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2); const opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
const login = (opt('--login') || '').trim(), senha = opt('--senha') || '', nome = opt('--nome');
if (!login || senha.length < 8) { console.error("Uso: node scripts/gestor.mjs --login seu.login --senha 'minimo8' [--nome 'Seu Nome']"); process.exit(1); }
let dataDir = 'data'; try { const m = fs.readFileSync(path.join(root, '.env'), 'utf8').match(/^DATA_DIR=([^\s#]+)/m); if (m) dataDir = m[1].replace(/^["']|["']$/g, ''); } catch { }
const file = path.resolve(root, dataDir, 'controle.json'); fs.mkdirSync(path.dirname(file), { recursive: true });
const ctrl = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}; ctrl.gestores ||= {};
const salt = crypto.randomBytes(16).toString('hex'); const hash = crypto.pbkdf2Sync(senha, Buffer.from(salt, 'hex'), 120000, 32, 'sha256').toString('hex');
let g = Object.values(ctrl.gestores).find(x => (x.login || '').toLowerCase() === login.toLowerCase());
if (g) { Object.assign(g, { salt, hash, ativo: true, ...(nome ? { nome } : {}) }); console.log(`Senha do gestor "${g.login}" redefinida.`); }
else { const id = crypto.randomUUID(); g = ctrl.gestores[id] = { id, nome: nome || login, login, email: '', ativo: true, salt, hash, criadoEm: new Date().toISOString() }; console.log(`Gestor "${login}" criado.`); }
if (fs.existsSync(file)) fs.copyFileSync(file, file + '.antes-gestor-' + Date.now());
fs.writeFileSync(file, JSON.stringify(ctrl), { mode: 0o600 });
console.log('Arquivo:', file, '· inicie o serviço: sudo systemctl start traxup-imob · acesse /painelgerencial');
