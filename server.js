#!/usr/bin/env node
/*
 * TRAXUP Imobiliário — servidor (Node.js 18+, sem dependências).
 * Serve o sistema (public/index.html), guarda os dados em data/db.json,
 * autentica usuários, envia mensagens ao Discord e registra boletos na API de Cobrança do Banco do Brasil.
 *
 *   cp .env.example .env   (edite)   →   node server.js
 */
'use strict';
const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/* ---------- configuração (.env) ---------- */
const ROOT = __dirname;
(function loadEnv() { const f = path.join(ROOT, '.env'); if (!fs.existsSync(f)) return; for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (!m || m[1] in process.env) continue; let v = m[2].trim(); if (/^["']/.test(v)) v = v.replace(/^(["'])(.*?)\1.*$/, '$2'); else v = v.replace(/\s+#.*$/, '').trim(); process.env[m[1]] = v; } })();
const PORT = +process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.resolve(ROOT, process.env.DATA_DIR || 'data');
const SESSION_HOURS = +process.env.SESSION_HOURS || 12;
const BB = {
  ambiente: (process.env.BB_AMBIENTE || 'sandbox').toLowerCase(),
  clientId: process.env.BB_CLIENT_ID || '', clientSecret: process.env.BB_CLIENT_SECRET || '', appKey: process.env.BB_DEV_APP_KEY || '',
  pfx: process.env.BB_CERT_PFX || '', pfxPass: process.env.BB_CERT_PASS || ''
};
BB.oauth = BB.ambiente === 'producao' ? 'https://oauth.bb.com.br/oauth/token' : 'https://oauth.sandbox.bb.com.br/oauth/token';
BB.api = BB.ambiente === 'producao' ? 'https://api.bb.com.br/cobrancas/v2' : 'https://api.hm.bb.com.br/cobrancas/v2';
const COLS = ['filiais', 'usuarios', 'empreendimentos', 'lotes', 'clientes', 'vendas', 'boletos', 'extratos', 'webhooks', 'modelos', 'config', 'plantas', 'logs', 'solicitacoes', 'notificacoes'];
const ADMIN_ONLY = new Set(['usuarios', 'filiais']);

/* ---------- base de dados em arquivo JSON (gravação atômica) ---------- */
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_FILE = path.join(DATA_DIR, 'db.json');
let db = {}; try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { db = {}; }
for (const c of COLS) db[c] ||= {};
db.portal ||= {}; // acessos do painel do cliente (fica só no servidor, nunca vai para /api/data)
let saveTimer = null;
function persist() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { const tmp = DB_FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db)); fs.renameSync(tmp, DB_FILE); }, 150); }
const BK_DIR = path.join(DATA_DIR, 'backups');
function backupAgora(sufixo = '') { fs.mkdirSync(BK_DIR, { recursive: true }); const nome = `db_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}${sufixo}.json`; fs.writeFileSync(path.join(BK_DIR, nome), JSON.stringify(db)); return nome; }
function backupDiario() { const dir = BK_DIR; fs.mkdirSync(dir, { recursive: true }); const f = path.join(dir, `db_${new Date().toISOString().slice(0, 10)}.json`); if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(db)); const all = fs.readdirSync(dir).filter(x => /^db_\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort(); for (const old of all.slice(0, -30)) fs.unlinkSync(path.join(dir, old)); const man = fs.readdirSync(dir).filter(x => /^db_.*-manual\.json$/.test(x)).sort(); for (const old of man.slice(0, -20)) fs.unlinkSync(path.join(dir, old)); }
setInterval(backupDiario, 3600e3).unref(); backupDiario();

/* ---------- sessões ---------- */
const SESS_FILE = path.join(DATA_DIR, 'sessions.json');
const sessions = new Map(); try { for (const [t, v] of Object.entries(JSON.parse(fs.readFileSync(SESS_FILE, 'utf8')))) if (v.exp > Date.now()) sessions.set(t, v); } catch { }
let sessTimer = null; const saveSessions = () => { clearTimeout(sessTimer); sessTimer = setTimeout(() => { try { fs.writeFileSync(SESS_FILE, JSON.stringify(Object.fromEntries(sessions)), { mode: 0o600 }); } catch { } }, 2000); };
const pbkdf2 = (senha, salt) => crypto.pbkdf2Sync(String(senha), Buffer.from(salt, 'hex'), 120000, 32, 'sha256').toString('hex');
const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
function novaSessao(userId) { const t = crypto.randomBytes(32).toString('hex'); sessions.set(t, { userId, exp: Date.now() + SESSION_HOURS * 3600e3 }); saveSessions(); return t; }
function usuarioDa(req) { const t = (req.headers.authorization || '').replace(/^Bearer\s+/i, ''); const s = sessions.get(t); if (!s || s.exp < Date.now()) { sessions.delete(t); return null; } if (s.tipo === 'cliente') return null; const u = db.usuarios[s.userId]; if (!u || u.ativo === false) return null; if (s.exp - Date.now() < (SESSION_HOURS - 1) * 3600e3) { s.exp = Date.now() + SESSION_HOURS * 3600e3; saveSessions(); } return u; }
const tentativas = new Map();
function limitarLogin(ip) { const now = Date.now(); const a = (tentativas.get(ip) || []).filter(t => now - t < 15 * 60e3); a.push(now); tentativas.set(ip, a); return a.length > 10; }
const semSegredo = u => { const { salt, hash, ...rest } = u; return rest; };

/* ---------- utilidades HTTP ---------- */
function send(res, code, obj, headers = {}) { const body = typeof obj === 'string' || Buffer.isBuffer(obj) ? obj : JSON.stringify(obj); res.writeHead(code, { 'Content-Type': typeof obj === 'object' && !Buffer.isBuffer(obj) ? 'application/json; charset=utf-8' : 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', ...headers }); res.end(body); }
function readJSON(req, limit = 8e6) { return new Promise((ok, fail) => { let n = 0; const chunks = []; req.on('data', c => { n += c.length; if (n > limit) { fail(Object.assign(Error('Requisição grande demais.'), { status: 413 })); req.destroy(); } else chunks.push(c); }); req.on('end', () => { try { ok(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { fail(Object.assign(Error('JSON inválido.'), { status: 400 })); } }); req.on('error', fail); }); }
function httpsJSON(url, { method = 'GET', headers = {}, body, form, mtls = false } = {}) {
  return new Promise((ok, fail) => {
    const u = new URL(url); const data = form ? new URLSearchParams(form).toString() : body ? JSON.stringify(body) : null;
    const opts = { method, hostname: u.hostname, path: u.pathname + u.search, headers: { Accept: 'application/json', ...(data ? { 'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}), ...headers }, timeout: 30000 };
    if (mtls && BB.pfx) { opts.pfx = fs.readFileSync(path.resolve(ROOT, BB.pfx)); opts.passphrase = BB.pfxPass; }
    const rq = https.request(opts, rs => { const ch = []; rs.on('data', c => ch.push(c)); rs.on('end', () => { const txt = Buffer.concat(ch).toString('utf8'); let j = null; try { j = txt ? JSON.parse(txt) : {}; } catch { j = { raw: txt }; } ok({ status: rs.statusCode, json: j }); }); });
    rq.on('timeout', () => rq.destroy(Error('Tempo esgotado ao falar com ' + u.hostname))); rq.on('error', fail); if (data) rq.write(data); rq.end();
  });
}

/* ---------- Discord ---------- */
async function enviarDiscord(webhookId, content) {
  const h = db.webhooks[webhookId]; if (!h) throw Object.assign(Error('Canal não encontrado.'), { status: 404 });
  if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+/.test(h.url)) throw Object.assign(Error('URL de webhook inválida.'), { status: 400 });
  const text = String(content || '').slice(0, 2000); if (!text.trim()) throw Object.assign(Error('Mensagem vazia.'), { status: 400 });
  let r; try { r = await httpsJSON(h.url + '?wait=true', { method: 'POST', body: { content: text, username: process.env.DISCORD_USERNAME || 'TRAXUP Imobiliário', allowed_mentions: { parse: [] } } }); } catch (e) { throw Object.assign(Error('Não foi possível conectar ao Discord: ' + e.message), { status: 502 }); }
  if (r.status >= 300) throw Object.assign(Error('Discord respondeu ' + r.status + (r.json?.message ? ': ' + r.json.message : '')), { status: 502 });
}

/* ---------- Banco do Brasil — API de Cobrança v2 ---------- */
let bbToken = { token: '', exp: 0 };
async function tokenBB() {
  if (!BB.clientId || !BB.clientSecret || !BB.appKey) throw Object.assign(Error('Credenciais do Banco do Brasil não configuradas no .env do servidor (BB_CLIENT_ID, BB_CLIENT_SECRET, BB_DEV_APP_KEY).'), { status: 400 });
  if (bbToken.token && bbToken.exp > Date.now() + 60e3) return bbToken.token;
  let r; try { r = await httpsJSON(BB.oauth, { method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(BB.clientId + ':' + BB.clientSecret).toString('base64') }, form: { grant_type: 'client_credentials', scope: 'cobrancas.boletos-requisicao cobrancas.boletos-info' }, mtls: true }); } catch (e) { throw Object.assign(Error('Não foi possível conectar ao OAuth do Banco do Brasil: ' + e.message), { status: 502 }); }
  if (r.status !== 200 || !r.json.access_token) throw Object.assign(Error('BB recusou a autenticação (' + r.status + '): ' + (r.json.error_description || r.json.error || JSON.stringify(r.json).slice(0, 200))), { status: 502 });
  bbToken = { token: r.json.access_token, exp: Date.now() + (r.json.expires_in || 600) * 1000 }; return bbToken.token;
}
const dBB = iso => iso.split('-').reverse().join('.');
const dig = s => String(s || '').replace(/\D/g, '');
function erroBB(r) { const e = r.json?.erros?.[0] || r.json?.errors?.[0] || r.json; return (e?.mensagem || e?.message || e?.textoMensagem || JSON.stringify(r.json).slice(0, 300)); }
async function registrarBoleto(id) {
  const b = db.boletos[id]; if (!b) throw Object.assign(Error('Boleto não encontrado.'), { status: 404 });
  if (b.status !== 'Emitido') throw Object.assign(Error('Somente boletos com situação Emitido podem ser registrados.'), { status: 400 });
  const fil = db.filiais[b.filialId] || {}; const cfg = fil.bb || {}; const venda = db.vendas[b.vendaId] || {};
  if (cfg.banco && cfg.banco !== '001') throw Object.assign(Error('O registro automático está disponível só para o Banco do Brasil.'), { status: 400 });
  if (!/^\d{7}$/.test(cfg.convenio || '')) throw Object.assign(Error('Convênio BB da filial inválido.'), { status: 400 });
  const doc = dig(b.pagador?.cpf); if (![11, 14].includes(doc.length)) throw Object.assign(Error('CPF/CNPJ do pagador inválido. Corrija o cadastro do cliente e emita o boleto novamente.'), { status: 400 });
  const venc = b.venc < new Date().toISOString().slice(0, 10) ? new Date().toISOString().slice(0, 10) : b.venc;
  const corpo = {
    numeroConvenio: +cfg.convenio, numeroCarteira: +(cfg.carteira || 17), numeroVariacaoCarteira: +(cfg.variacao || 35), codigoModalidade: 1,
    dataEmissao: dBB(new Date().toISOString().slice(0, 10)), dataVencimento: dBB(venc), valorOriginal: +(b.valor / 100).toFixed(2), valorAbatimento: 0,
    quantidadeDiasProtesto: +cfg.protestoDias || 0, ...(+cfg.negativacaoDias ? { quantidadeDiasNegativacao: +cfg.negativacaoDias, orgaoNegativador: 10 } : { quantidadeDiasNegativacao: 0, orgaoNegativador: 0 }), indicadorAceiteTituloVencido: 'S', numeroDiasLimiteRecebimento: +(process.env.BB_DIAS_LIMITE || 60),
    codigoAceite: 'N', codigoTipoTitulo: +(cfg.especie || 2), descricaoTipoTitulo: ({ '02': 'DM', '04': 'DS', '12': 'NP', '17': 'RC', '99': 'OU' })[cfg.especie] || 'DM', indicadorPermissaoRecebimentoParcial: 'N',
    numeroTituloBeneficiario: String(venda.numero || b.seq).slice(0, 15), campoUtilizacaoBeneficiario: String(b.id).slice(0, 25).toUpperCase().replace(/[^A-Z0-9]/g, ''),
    numeroTituloCliente: '000' + cfg.convenio + String(b.seq).padStart(10, '0'), mensagemBloquetoOcorrencia: String(b.instrucoes || '').slice(0, 165),
    jurosMora: +(cfg.jurosMes ?? fil.jurosMes) ? { tipo: 2, porcentagem: +(cfg.jurosMes ?? fil.jurosMes) } : { tipo: 0 },
    multa: +(cfg.multa ?? fil.multa) ? { tipo: 2, data: dBB(new Date(Date.parse(venc) + (1 + (+cfg.multaDias || 0)) * 864e5).toISOString().slice(0, 10)), porcentagem: +(cfg.multa ?? fil.multa) } : { tipo: 0 },
    pagador: { tipoInscricao: doc.length === 11 ? 1 : 2, numeroInscricao: +doc, nome: String(b.pagador.nome || '').slice(0, 60), endereco: String(b.pagador.endereco || '').slice(0, 60), cep: +dig(b.pagador.cep) || 0, cidade: String(b.pagador.cidade || '').slice(0, 20), bairro: String(b.pagador.bairro || '').slice(0, 20), uf: String(b.pagador.uf || '').slice(0, 2).toUpperCase(), telefone: dig(b.pagador.telefone).slice(0, 15) },
    indicadorPix: process.env.BB_PIX === 'N' ? 'N' : 'S'
  };
  const token = await tokenBB();
  let r; try { r = await httpsJSON(`${BB.api}/boletos?gw-dev-app-key=${encodeURIComponent(BB.appKey)}`, { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: corpo, mtls: true }); } catch (e) { throw Object.assign(Error('Não foi possível conectar ao Banco do Brasil: ' + e.message), { status: 502 }); }
  if (r.status >= 300) throw Object.assign(Error('Banco do Brasil: ' + erroBB(r)), { status: 502 });
  const j = r.json;
  Object.assign(b, { status: 'Registrado', registradoEm: new Date().toISOString(), venc, linha: formatarLinha(j.linhaDigitavel) || b.linha, barras: j.codigoBarraNumerico || b.barras, pixEmv: j.qrCode?.emv || '', pixUrl: j.qrCode?.url || '', registroBB: { numero: j.numero, numeroContratoCobranca: j.numeroContratoCobranca, codigoCliente: j.codigoCliente, ambiente: BB.ambiente } });
  persist(); return b;
}
function formatarLinha(l) { const d = dig(l); if (d.length !== 47) return l; return `${d.slice(0, 5)}.${d.slice(5, 10)} ${d.slice(10, 15)}.${d.slice(15, 21)} ${d.slice(21, 26)}.${d.slice(26, 32)} ${d[32]} ${d.slice(33)}`; }
async function baixarBoleto(id) {
  const b = db.boletos[id]; if (!b?.registroBB?.numero) return; const cfg = (db.filiais[b.filialId] || {}).bb || {};
  const token = await tokenBB(); const r = await httpsJSON(`${BB.api}/boletos/${encodeURIComponent(b.registroBB.numero)}/baixar?gw-dev-app-key=${encodeURIComponent(BB.appKey)}`, { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: { numeroConvenio: +cfg.convenio }, mtls: true });
  if (r.status >= 300) throw Object.assign(Error('Banco do Brasil: ' + erroBB(r)), { status: 502 });
}

/* ---------- rotas ---------- */

/* ---------- Painel do cliente (somente leitura) ---------- */
const PORTAL_STAFF = new Set(['Administrador', 'Gerente', 'Financeiro']);
function novaSessaoCliente(clienteId) { const t = crypto.randomBytes(32).toString('hex'); sessions.set(t, { tipo: 'cliente', clienteId, exp: Date.now() + 4 * 3600e3 }); saveSessions(); return t; }
function clienteDa(req) {
  const t = (req.headers.authorization || '').replace(/^Bearer\s+/i, ''); const s = sessions.get(t);
  if (!s || s.tipo !== 'cliente' || s.exp < Date.now()) return null;
  const a = db.portal[s.clienteId], c = db.clientes[s.clienteId]; if (!a || a.ativo === false || !c) return null; return { c, a, t };
}
function notificar(tipo, cli, texto, extra = {}) {
  const id = 'not_' + Date.now().toString(36) + crypto.randomBytes(4).toString('hex');
  db.notificacoes[id] = { id, tipo, clienteId: cli?.id || '', clienteNome: cli?.nome || '', texto, lida: false, criadoEm: new Date().toISOString(), ...extra };
  const todas = Object.values(db.notificacoes).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)); for (const n of todas.slice(500)) delete db.notificacoes[n.id];
  persist();
}
const semChaves = (o, re) => { const r = { ...o }; for (const k of Object.keys(r)) if (re.test(k)) delete r[k]; return r; };
function dadosPortal(cid) {
  const cli = db.clientes[cid];
  const vendas = Object.values(db.vendas).filter(v => v.clienteId === cid && v.status !== 'Distratado').map(v => semChaves(v, /^comiss|custo|historico|^obs|^contratoGeradoPor/i));
  const vids = new Set(vendas.map(v => v.id));
  const lotes = [...new Set(vendas.map(v => v.loteId))].map(id => db.lotes[id]).filter(Boolean).map(l => semChaves(l, /custo|^obs|reserva/i));
  const emps = [...new Set(lotes.map(l => l.empId))].map(id => db.empreendimentos[id]).filter(Boolean).map(e => semChaves(e, /custo|^obs/i));
  const filiais = [...new Set(vendas.map(v => v.filialId))].map(id => db.filiais[id]).filter(Boolean).map(f => ({ id: f.id, nome: f.nome, cnpj: f.cnpj, cidade: f.cidade, telefone: f.telefone, email: f.email, bb: f.bb, multa: f.multa, jurosMes: f.jurosMes }));
  const boletos = Object.values(db.boletos).filter(b => vids.has(b.vendaId) && b.status !== 'Cancelado' && (b.status === 'Registrado' || b.portal === true));
  const modelos = {}; for (const v of vendas) { if (!v.contratoGeradoEm) continue; const m = db.modelos[v.contratoModeloId] || Object.values(db.modelos).find(x => x.nome === v.contratoModelo); if (m) modelos[m.id] = { id: m.id, nome: m.nome, tipo: m.tipo, conteudo: m.conteudo }; }
  const solicitacoes = Object.values(db.solicitacoes).filter(x => x.clienteId === cid);
  return { clientes: [semChaves(cli, /^obs|classific/i)], vendas, lotes, empreendimentos: emps, filiais, boletos, modelos: Object.values(modelos), solicitacoes, acesso: { email: db.portal[cid].email, ultimoAcesso: db.portal[cid].ultimoAcesso } };
}
async function rotaPortal(req, res, p, ip) {
  if (p === '/api/portal/login' && req.method === 'POST') {
    if (limitarLogin('portal:' + ip)) return send(res, 429, { error: 'Muitas tentativas. Aguarde 15 minutos.' });
    const { email, senha } = await readJSON(req, 1e4); const e = String(email || '').trim().toLowerCase();
    const cid = Object.keys(db.portal).find(k => db.portal[k].email === e); const a = cid && db.portal[cid];
    if (!a || a.ativo === false || !db.clientes[cid] || !safeEq(pbkdf2(String(senha || ''), a.salt), a.hash)) return send(res, 401, { error: 'E-mail ou senha inválidos.' });
    if (!a.ultimoAcesso) notificar('acesso', db.clientes[cid], 'acessou o painel do cliente pela primeira vez');
    a.ultimoAcesso = new Date().toISOString(); persist(); tentativas.delete('portal:' + ip);
    return send(res, 200, { token: novaSessaoCliente(cid), trocarSenha: !!a.trocarSenha });
  }
  const ses = clienteDa(req); if (!ses) return send(res, 401, { error: 'Sessão expirada. Entre novamente.' });
  if (p === '/api/portal/dados' && req.method === 'GET') return send(res, 200, dadosPortal(ses.c.id), { 'Cache-Control': 'no-store' });
  if (p === '/api/portal/logout') { sessions.delete(ses.t); saveSessions(); return send(res, 200, { ok: true }); }
  if (p === '/api/portal/senha' && req.method === 'POST') {
    const { atual, nova } = await readJSON(req, 1e4); if (!safeEq(pbkdf2(String(atual || ''), ses.a.salt), ses.a.hash)) return send(res, 400, { error: 'Senha atual incorreta.' });
    if (String(nova || '').length < 6) return send(res, 400, { error: 'A nova senha precisa ter 6 caracteres ou mais.' });
    ses.a.salt = crypto.randomBytes(16).toString('hex'); ses.a.hash = pbkdf2(String(nova), ses.a.salt); delete ses.a.trocarSenha; persist(); notificar('senha', ses.c, 'alterou a senha do painel'); return send(res, 200, { ok: true });
  }
  if (p === '/api/portal/solicitar' && req.method === 'POST') {
    const { vendaId, parcelaId, tipo = 'boleto', obs = '' } = await readJSON(req, 1e4);
    const v = db.vendas[vendaId]; if (!v || v.clienteId !== ses.c.id) return send(res, 404, { error: 'Contrato não encontrado.' });
    const parc = (v.parcelas || []).find(x => x.id === parcelaId); if (tipo === 'boleto' && !parc) return send(res, 404, { error: 'Parcela não encontrada.' });
    const dup = Object.values(db.solicitacoes).find(x => x.clienteId === ses.c.id && x.parcelaId === parcelaId && x.tipo === tipo && x.status === 'Pendente'); if (dup) return send(res, 200, { ok: true, solicitacao: dup, repetida: true });
    const id = 'sol_' + crypto.randomBytes(8).toString('hex');
    const sol = { id, clienteId: ses.c.id, clienteNome: ses.c.nome, vendaId, vendaNumero: v.numero, filialId: v.filialId, parcelaId: parc?.id || '', parcelaRef: parc ? `${parc.tipo} ${parc.ref}` : '', venc: parc?.venc || '', tipo, obs: String(obs).slice(0, 500), status: 'Pendente', criadoEm: new Date().toISOString() };
    db.solicitacoes[id] = sol; persist();
    notificar('boleto', ses.c, `solicitou boleto — contrato ${v.numero}${parc ? `, ${parc.tipo} ${parc.ref} (venc. ${parc.venc.split('-').reverse().join('/')})` : ''}`, { solicitacaoId: id, vendaId, filialId: v.filialId, obs: sol.obs });
    const avisar = Object.values(db.webhooks).filter(h => h.avisosPortal && (!h.filialId || h.filialId === v.filialId));
    for (const h of avisar) enviarDiscord(h.id, `📄 Painel do cliente: ${ses.c.nome} solicitou ${tipo === 'boleto' ? 'boleto' : tipo} — contrato ${v.numero}${parc ? `, parcela ${parc.tipo} ${parc.ref} (venc. ${parc.venc.split('-').reverse().join('/')})` : ''}.${sol.obs ? ' Obs.: ' + sol.obs : ''}`).catch(() => { });
    return send(res, 200, { ok: true, solicitacao: sol });
  }
  return send(res, 404, { error: 'Rota não encontrada.' });
}
function rotaPortalAdmin(req, res, p, user) {
  if (!PORTAL_STAFF.has(user.perfil)) return send(res, 403, { error: 'Sem permissão para gerenciar o painel do cliente.' });
  if (p === '/api/portal-admin/acessos' && req.method === 'GET') return send(res, 200, { acessos: Object.entries(db.portal).map(([clienteId, a]) => ({ clienteId, email: a.email, ativo: a.ativo !== false, criadoEm: a.criadoEm, ultimoAcesso: a.ultimoAcesso })) });
  if (p === '/api/portal-admin/acesso' && req.method === 'POST') return readJSON(req, 1e4).then(({ clienteId, email, senha, ativo = true, remover }) => {
    if (!db.clientes[clienteId]) return send(res, 404, { error: 'Cliente não encontrado.' });
    if (remover) { delete db.portal[clienteId]; for (const [t, s] of sessions) if (s.tipo === 'cliente' && s.clienteId === clienteId) sessions.delete(t); saveSessions(); persist(); return send(res, 200, { ok: true }); }
    const e = String(email || '').trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return send(res, 400, { error: 'Informe um e-mail válido.' });
    const outro = Object.keys(db.portal).find(k => k !== clienteId && db.portal[k].email === e); if (outro) return send(res, 400, { error: 'Este e-mail já dá acesso ao painel de outro cliente (' + (db.clientes[outro]?.nome || outro) + ').' });
    const a = db.portal[clienteId] || { criadoEm: new Date().toISOString() };
    if (senha) { if (String(senha).length < 6) return send(res, 400, { error: 'A senha precisa ter 6 caracteres ou mais.' }); a.salt = crypto.randomBytes(16).toString('hex'); a.hash = pbkdf2(String(senha), a.salt); a.trocarSenha = true; }
    if (!a.hash) return send(res, 400, { error: 'Defina uma senha inicial para o cliente.' });
    Object.assign(a, { email: e, ativo: !!ativo, atualizadoPor: user.nome, atualizadoEm: new Date().toISOString() }); db.portal[clienteId] = a;
    if (!a.ativo) for (const [t, s] of sessions) if (s.tipo === 'cliente' && s.clienteId === clienteId) sessions.delete(t);
    persist(); return send(res, 200, { ok: true });
  });
  return send(res, 404, { error: 'Rota não encontrada.' });
}
const INDEX = path.join(ROOT, 'public', 'index.html');
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x'); const p = url.pathname; const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  try {
    if (!p.startsWith('/api/')) {
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Método não permitido.' });
      return send(res, 200, fs.readFileSync(INDEX), { 'Cache-Control': 'no-cache' });
    }
    if (p === '/api/status') return send(res, 200, { app: 'traxup-imob', setupNeeded: !Object.keys(db.usuarios).length, bb: { ambiente: BB.ambiente, configurado: !!(BB.clientId && BB.clientSecret && BB.appKey) } });
    if (p === '/api/setup' && req.method === 'POST') {
      if (Object.keys(db.usuarios).length) return send(res, 403, { error: 'O sistema já foi configurado.' });
      const { filial, usuario, senha } = await readJSON(req);
      if (!filial?.id || !usuario?.id || !usuario.salt || !usuario.hash || !senha) return send(res, 400, { error: 'Dados incompletos.' });
      if (!safeEq(pbkdf2(senha, usuario.salt), usuario.hash)) return send(res, 400, { error: 'Falha na verificação da senha.' });
      db.filiais[filial.id] = filial; db.usuarios[usuario.id] = { ...usuario, perfil: 'Administrador', filiais: ['*'], ativo: true }; persist();
      return send(res, 200, { token: novaSessao(usuario.id), userId: usuario.id });
    }
    if (p === '/api/login' && req.method === 'POST') {
      if (limitarLogin(ip)) return send(res, 429, { error: 'Muitas tentativas. Aguarde 15 minutos.' });
      const { login, senha } = await readJSON(req); const l = String(login || '').trim().toLowerCase();
      const u = Object.values(db.usuarios).find(x => x.login?.toLowerCase() === l || (x.email && x.email.toLowerCase() === l));
      if (!u || u.ativo === false || !u.salt || !safeEq(pbkdf2(senha, u.salt), u.hash)) return send(res, 401, { error: 'Login ou senha inválidos.' });
      u.ultimoAcesso = new Date().toISOString(); persist(); tentativas.delete(ip);
      return send(res, 200, { token: novaSessao(u.id), userId: u.id });
    }
    if (p.startsWith('/api/portal/')) return await rotaPortal(req, res, p, ip);
    const user = usuarioDa(req); if (!user) return send(res, 401, { error: 'Sessão expirada. Entre novamente.' });
    if (p === '/api/notificacoes' && req.method === 'GET') return send(res, 200, { notificacoes: Object.values(db.notificacoes).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 60), solicitacoes: Object.values(db.solicitacoes).filter(x => x.status === 'Pendente') }, { 'Cache-Control': 'no-store' });
    if (p.startsWith('/api/portal-admin/')) return await rotaPortalAdmin(req, res, p, user);
    if (p === '/api/logout') { sessions.delete((req.headers.authorization || '').replace(/^Bearer\s+/i, '')); saveSessions(); return send(res, 200, { ok: true }); }
    if (p === '/api/data' && req.method === 'GET') { const out = {}; for (const c of COLS) out[c] = Object.values(db[c]).map(o => c === 'usuarios' ? semSegredo(o) : o); return send(res, 200, out, { 'Cache-Control': 'no-store' }); }
    const m = p.match(/^\/api\/data\/([a-z]+)\/([A-Za-z0-9_.:@+~-]{1,120})$/);
    if (m) {
      const [, col, id] = m; if (!COLS.includes(col)) return send(res, 404, { error: 'Coleção desconhecida.' });
      if (ADMIN_ONLY.has(col) && user.perfil !== 'Administrador') return send(res, 403, { error: 'Apenas administradores podem alterar ' + col + '.' });
      if (req.method === 'PUT') {
        const o = await readJSON(req); if (!o || typeof o !== 'object' || Array.isArray(o)) return send(res, 400, { error: 'Registro inválido.' }); o.id = id;
        if (col === 'usuarios') { const old = db.usuarios[id]; if (!o.hash && old) { o.salt = old.salt; o.hash = old.hash; } if (!o.hash) return send(res, 400, { error: 'Defina uma senha para o novo usuário.' }); if (id === user.id && o.perfil !== 'Administrador') return send(res, 400, { error: 'Você não pode rebaixar o próprio perfil.' }); }
        db[col][id] = o; persist(); return send(res, 200, { ok: true });
      }
      if (req.method === 'DELETE') { if (col === 'usuarios' && id === user.id) return send(res, 400, { error: 'Você não pode excluir o próprio usuário.' }); delete db[col][id]; persist(); return send(res, 200, { ok: true }); }
      return send(res, 405, { error: 'Método não permitido.' });
    }
    if (p === '/api/backups' || p.startsWith('/api/backups/')) {
      if (user.perfil !== 'Administrador') return send(res, 403, { error: 'Apenas administradores.' });
      if (p === '/api/backups' && req.method === 'GET') { fs.mkdirSync(BK_DIR, { recursive: true }); const list = fs.readdirSync(BK_DIR).filter(x => x.endsWith('.json')).map(n => { const st = fs.statSync(path.join(BK_DIR, n)); return { nome: n, data: st.mtime.toISOString(), tamanho: st.size }; }).sort((a, b) => b.data.localeCompare(a.data)); return send(res, 200, { backups: list }); }
      if (p === '/api/backups' && req.method === 'POST') { clearTimeout(saveTimer); fs.writeFileSync(DB_FILE, JSON.stringify(db)); return send(res, 200, { nome: backupAgora('-manual') }); }
      const nome = decodeURIComponent(p.slice('/api/backups/'.length)); if (!/^db_[\w.-]+\.json$/.test(nome) || !fs.existsSync(path.join(BK_DIR, nome))) return send(res, 404, { error: 'Backup não encontrado.' });
      return send(res, 200, fs.readFileSync(path.join(BK_DIR, nome)), { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="${nome}"` });
    }
    if (p === '/api/senha' && req.method === 'POST') { const { atual, nova } = await readJSON(req); if (!safeEq(pbkdf2(atual, user.salt), user.hash)) return send(res, 400, { error: 'Senha atual incorreta.' }); if (String(nova || '').length < 6) return send(res, 400, { error: 'A nova senha precisa ter 6 caracteres ou mais.' }); user.salt = crypto.randomBytes(16).toString('hex'); user.hash = pbkdf2(nova, user.salt); persist(); return send(res, 200, { ok: true }); }
    if (p === '/api/discord' && req.method === 'POST') { const { webhookId, content } = await readJSON(req); await enviarDiscord(webhookId, content); return send(res, 200, { ok: true }); }
    if (p === '/api/bb/registrar' && req.method === 'POST') { const { boletoId } = await readJSON(req); const b = await registrarBoleto(boletoId); return send(res, 200, { ok: true, boleto: b }); }
    if (p === '/api/bb/baixar' && req.method === 'POST') { const { boletoId } = await readJSON(req); await baixarBoleto(boletoId); return send(res, 200, { ok: true }); }
    return send(res, 404, { error: 'Rota não encontrada.' });
  } catch (e) { console.error(new Date().toISOString(), p, e.message); return send(res, e.status || 500, { error: e.status ? e.message : 'Erro interno no servidor.' }); }
});
server.listen(PORT, HOST, () => console.log(`TRAXUP Imobiliário em http://${HOST}:${PORT}  ·  dados em ${DATA_DIR}  ·  BB ${BB.ambiente}${BB.clientId ? '' : ' (sem credenciais)'}`));
process.on('SIGTERM', () => { clearTimeout(saveTimer); fs.writeFileSync(DB_FILE, JSON.stringify(db)); try { fs.writeFileSync(SESS_FILE, JSON.stringify(Object.fromEntries(sessions)), { mode: 0o600 }); } catch { } process.exit(0); });
