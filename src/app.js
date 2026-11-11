/* TRAXUP Imobiliário — interface */
'use strict';

const S = { user: null, filial: '*', view: 'painel', f: {}, sel: {}, busy: false };
const ICON = {
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4', moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14', layers: 'm12 3 9 5-9 5-9-5 9-5zm-9 9 9 5 9-5M3 16l9 5 9-5',
  users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm13 9v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8', file: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zm0 0v6h6M8 13h8M8 17h6',
  wallet: 'M3 7h18v12H3zM3 7l3-4h12l3 4M16 13h2', alert: 'M12 3 2 20h20L12 3zm0 6v5m0 3v.5', barcode: 'M4 5v14M7 5v14M10 5v14M14 5v14M16 5v14M20 5v14', bank: 'M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M3 20h18M12 3l9 5H3l9-5z',
  hand: 'M7 11 4 14l4 4 3-3m-4-4 4-4 6 6-4 4m-6-6 6 6', send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z', doc: 'M6 3h9l5 5v13H6zM14 3v6h6M9 13h7M9 17h7M9 9h2', user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  building: 'M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 8h2m4 0h2M8 12h2m4 0h2', gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2.2-1.3L14.4 3h-4l-.4 2.4a7 7 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2.2 1.3l.4 2.4h4l.4-2.4a7 7 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3z',
  plus: 'M12 5v14M5 12h14', x: 'M18 6 6 18M6 6l12 12', search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.3-4.3', logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9', menu: 'M3 6h18M3 12h18M3 18h18', down: 'M12 3v12m-5-5 5 5 5-5M5 21h14', upload: 'M12 21V9m-5 5 5-5 5 5M5 3h14', copy: 'M9 9h11v11H9zM5 15H4V4h11v1', check: 'M20 6 9 17l-5-5', chev: 'm9 6 6 6-6 6'
};
const ic = (n, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[n] || ''}"/></svg>`;
const LOGO_MARK = `<svg viewBox="0 0 48 48"><rect x="6" y="24" width="8" height="16" rx="2" fill="#2F6BF0"/><rect x="18" y="17" width="8" height="23" rx="2" fill="#2F6BF0"/><rect x="30" y="10" width="8" height="30" rx="2" fill="#2F6BF0"/><path d="M4 36 L16 27 L22 31 L36 17" stroke="#FF9F1C" stroke-width="4.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 14 L41 11 L38 22 Z" fill="#FFB938"/></svg>`;

const MENU = [
  ['Gestão', [['painel', 'Painel', 'grid'], ['mapa', 'Mapa de lotes', 'map'], ['lotes', 'Lotes', 'layers'], ['clientes', 'Clientes', 'users'], ['vendas', 'Vendas e contratos', 'file']]],
  ['Financeiro', [['financeiro', 'Parcelas e baixas', 'wallet'], ['inadimplencia', 'Inadimplência', 'alert'], ['boletos', 'Boletos Banco do Brasil', 'barcode'], ['conciliacao', 'Conciliação bancária', 'bank'], ['comissoes', 'Comissões', 'hand']]],
  ['Comunicação', [['discord', 'Mensagens Discord', 'send'], ['modelos', 'Modelos de contrato', 'doc']]],
  ['Administração', [['usuarios', 'Usuários', 'user'], ['filiais', 'Filiais e empreendimentos', 'building'], ['config', 'Configurações', 'gear']]]
];
const TITULOS = Object.fromEntries(MENU.flatMap(g => g[1]).map(([k, t]) => [k, t]));

/* ---------- helpers de interface ---------- */
function toast(msg, bad = false) { let b = $('.toastBox'); if (!b) { b = document.createElement('div'); b.className = 'toastBox'; document.body.append(b); } while (b.children.length >= 3) b.firstChild.remove(); const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg; b.append(t); setTimeout(() => t.remove(), bad ? 7000 : 4000); }
function modal(html, cls = '') { closeModal(); const o = document.createElement('div'); o.className = 'overlay'; o.id = 'overlay'; o.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>`; o.addEventListener('mousedown', e => { if (e.target === o) closeModal(); }); document.body.append(o); const f = o.querySelector('input:not([type=hidden]),select,textarea'); if (f) setTimeout(() => f.focus(), 30); return o; }
function closeModal() { $('#overlay')?.remove(); }
const mHead = (eyebrow, title) => `<div class="modalHead"><div><div class="eyebrow">${esc(eyebrow)}</div><h2>${esc(title)}</h2></div><button class="ghost" data-act="closeModal" aria-label="Fechar">${ic('x')}</button></div>`;
function confirmar(texto, onOk, rotulo = 'Confirmar') { modal(`${mHead('Confirmação', 'Tem certeza?')}<div class="modalBody"><p>${texto}</p><div class="formActions"><button data-act="closeModal">Cancelar</button><button class="danger" id="okBtn">${esc(rotulo)}</button></div></div>`, 'narrow'); $('#okBtn').onclick = async () => { closeModal(); try { await onOk(); } catch (e) { toast(e.message, true); } }; }
const opt = (v, t, sel) => `<option value="${esc(v)}" ${String(v) === String(sel) ? 'selected' : ''}>${esc(t)}</option>`;
const sel = (name, items, val, attrs = '') => `<select name="${name}" ${attrs}>${items.map(i => Array.isArray(i) ? opt(i[0], i[1], val) : opt(i, i, val)).join('')}</select>`;
const fd = form => Object.fromEntries(new FormData(form).entries());
const badgeSit = s => `<span class="badge ${({ 'Em dia': 'ok', 'Quitado': 'blue', 'Paga': 'ok', 'Em atraso': 'warn', 'Vencida': 'bad', 'Inadimplente': 'bad', 'Vence hoje': 'orange', 'Parcial': 'orange', 'Distratado': '', 'Disponível': 'ok', 'Reservado': 'orange', 'Vendido': 'blue', 'Bloqueado': '', 'Emitido': 'orange', 'Registrado': 'blue', 'Pago': 'ok', 'Cancelado': '', 'conciliado': 'ok', 'pendente': 'orange', 'ignorado': '' })[s] || ''}">${esc(s)}</span>`;
async function salvarArquivo(nome, conteudo, mime = 'text/plain') {
  if (Store.downloads) { try { await Store.downloads.save({ filename: nome, data: conteudo }); return; } catch (e) { toast('Download não confirmado.', true); return; } }
  if (Store.mode === 'db') { toast('Download indisponível nesta visualização. Use o botão Copiar.', true); return; }
  const url = URL.createObjectURL(new Blob([conteudo], { type: mime })); const a = document.createElement('a'); a.href = url; a.download = nome; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 20000);
}
async function copiar(txt) { try { await navigator.clipboard.writeText(txt); toast('Copiado para a área de transferência.'); } catch (e) { toast('Não foi possível copiar automaticamente. Selecione o texto e copie.', true); } }
const csv = rows => rows.map(r => r.map(c => { const s = String(c ?? ''); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\r\n');
async function audit(acao) { try { const id = 'auditoria'; const doc = Store.get('logs', id) || { id, itens: [] }; doc.itens = [{ data: new Date().toISOString(), usuario: S.user?.nome, acao }, ...(doc.itens || [])].slice(0, 300); await Store.put('logs', doc); } catch (e) { /* auditoria é opcional */ } }

/* ---------- escopo multifilial ---------- */
const filiaisUsuario = () => { const all = Store.list('filiais').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')); if (!S.user || S.user.perfil === 'Administrador' || (S.user.filiais || []).includes('*')) return all; return all.filter(f => (S.user.filiais || []).includes(f.id)); };
const noEscopo = r => { const ids = filiaisUsuario().map(f => f.id); return S.filial === '*' ? ids.includes(r.filialId) : r.filialId === S.filial; };
const L = c => Store.list(c).filter(noEscopo);
const filialPadrao = () => S.filial !== '*' ? S.filial : filiaisUsuario()[0]?.id;
const nomeFilial = id => Store.get('filiais', id)?.nome || '—';
const loteNome = l => l ? `Q${l.quadra}-L${l.numero}` : '—';
const loteDesc = id => { const l = Store.get('lotes', id); if (!l) return '—'; const e = Store.get('empreendimentos', l.empId); return `${loteNome(l)}${e ? ' · ' + e.nome : ''}`; };
const cliNome = id => Store.get('clientes', id)?.nome || '—';
const cfg = () => Store.get('config', 'geral') || { id: 'geral' };

/* ---------- inicialização e login ---------- */
function aplicarTema(t) { document.body.classList.toggle('dark', t === 'dark'); }
(function temaInicial() { let t = null; try { t = localStorage.getItem('traxup_tema'); } catch (e) { } if (!t) t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; aplicarTema(t); })();
async function boot() {
  $('#app').innerHTML = `<div class="login"><div class="loginArt"><img src="${LOGO_IMG}" alt="TRAXUP"></div><div class="loginPanel"><div class="loginCard"><h1>Carregando…</h1><p class="sub">Conectando ao armazenamento de dados.</p></div></div></div>`;
  await Store.init();
  try { const s = JSON.parse(sessionStorage.getItem('traxup_sess') || 'null'); if (s && Store.mode === 'server' && s.token) { Store.token = s.token; await Store.loadAll(); const u = Store.get('usuarios', s.userId); if (u && u.ativo !== false) { S.user = u; return entrar(); } } } catch (e) { Store.token = null; }
  if (Store.mode !== 'server') { try { await Store.loadAll(); } catch (e) { return telaErro(e.message); } }
  const setup = Store.mode === 'server' ? Store.serverStatus.setupNeeded : !Store.list('usuarios').length;
  try { const s = JSON.parse(sessionStorage.getItem('traxup_sess') || 'null'); if (s && Store.mode !== 'server') { const u = Store.get('usuarios', s.userId); if (u && u.ativo !== false) { S.user = u; return entrar(); } } } catch (e) { }
  setup ? telaSetup() : telaLogin();
}
function telaErro(msg) { $('#app').innerHTML = `<div class="login"><div class="loginArt"><img src="${LOGO_IMG}" alt="TRAXUP"></div><div class="loginPanel"><div class="loginCard"><h1>Não foi possível carregar</h1><div class="notice bad">${esc(msg)}</div></div></div></div>`; }
const loginShell = inner => `<div class="login"><div class="loginArt"><img src="${LOGO_IMG}" alt="TRAXUP — Tecnologia que impulsiona negócios"><p>Gestão imobiliária multifilial: lotes, vendas, recebimentos, boletos Banco do Brasil, conciliação bancária e contratos em um só lugar.</p></div><div class="loginPanel">${inner}</div></div>`;
function telaLogin(erro = '') {
  $('#app').innerHTML = loginShell(`<form class="loginCard" data-form="login"><div><div class="eyebrow">TRAXUP Imobiliário</div><h1>Entrar no sistema</h1></div><p class="sub">Use o login e a senha cadastrados pelo administrador.</p>${erro ? `<div class="notice bad">${esc(erro)}</div>` : ''}<label>Login ou e-mail<input name="login" autocomplete="username" required></label><label>Senha<input name="senha" type="password" autocomplete="current-password" required></label><button class="primary" type="submit">Entrar</button><div class="storageNote">Dados: <b>${esc(Store.label())}</b>${Store.mode === 'local' ? '. Para uso real, rode o servidor TRAXUP no seu VPS.' : ''}</div></form>`);
}
function telaSetup() {
  $('#app').innerHTML = loginShell(`<form class="loginCard" data-form="setup"><div><div class="eyebrow">Primeiro acesso</div><h1>Configurar o sistema</h1></div><p class="sub">Cadastre a primeira filial e o administrador. Depois você cria as demais filiais e usuários.</p>
  <label>Nome da filial<input name="filial" required placeholder="Ex.: Matriz Petrolina"></label>
  <div class="formGrid" style="grid-template-columns:1fr 1fr"><label>CNPJ<input name="cnpj"></label><label>Cidade/UF<input name="cidade" placeholder="Petrolina/PE"></label></div>
  <label>Seu nome<input name="nome" required></label>
  <div class="formGrid" style="grid-template-columns:1fr 1fr"><label>Login<input name="login" required autocomplete="username"></label><label>Senha (mín. 6)<input name="senha" type="password" minlength="6" required autocomplete="new-password"></label></div>
  <label class="check"><input type="checkbox" name="demo" checked> Carregar dados de demonstração (empreendimento, lotes, clientes e vendas)</label>
  <button class="primary" type="submit">Criar e entrar</button><div class="storageNote">Dados: <b>${esc(Store.label())}</b></div></form>`);
}
async function entrar() {
  try { sessionStorage.setItem('traxup_sess', JSON.stringify({ userId: S.user.id, token: Store.token })); } catch (e) { }
  const fs = filiaisUsuario(); S.filial = fs.length === 1 ? fs[0].id : '*';
  const h = (location.hash || '').slice(1); S.view = TITULOS[h] && pode(S.user, h) ? h : (pode(S.user, 'painel') ? 'painel' : 'mapa');
  render();
}
function sair() { try { sessionStorage.removeItem('traxup_sess'); } catch (e) { } if (Store.mode === 'server' && Store.token) fetch('api/logout', { method: 'POST', headers: Store.authH() }).catch(() => { }); Store.token = null; S.user = null; telaLogin(); }

/* ---------- casca ---------- */
function render() {
  if (!S.user) return telaLogin();
  if (!pode(S.user, S.view)) S.view = 'mapa';
  const fs = filiaisUsuario(); const nav = MENU.map(([g, items]) => { const its = items.filter(([k]) => pode(S.user, k)); return its.length ? `<div class="navGroup">${g}</div>` + its.map(([k, t, i]) => `<button class="${S.view === k ? 'active' : ''}" data-act="go" data-v="${k}">${ic(i)}${t}</button>`).join('') : ''; }).join('');
  $('#app').innerHTML = `<div class="shell"><aside><div class="brand">${LOGO_MARK}<div><div class="brandText">TRAX<b>UP</b></div><div class="brandSub">IMOBILIÁRIO</div></div></div><div class="brandLine"></div><nav>${nav}</nav><div class="asideFoot">Tecnologia que impulsiona negócios<br>${esc(Store.label())}</div></aside>
  <main><div class="topbar"><button class="menuToggle ghost" data-act="toggleNav">${ic('menu')}</button><div class="title"><div class="eyebrow">TRAXUP / ${esc(TITULOS[S.view] || '')}</div><h1>${esc(TITULOS[S.view] || '')}</h1></div>
  <div class="filialPick">Empresa ${fs.length > 1 ? `<select id="filialSel">${opt('*', 'Todas as empresas', S.filial)}${fs.map(f => opt(f.id, f.nome, S.filial)).join('')}</select>` : `<b style="padding:6px 8px;color:var(--text)">${esc(fs[0]?.nome || '—')}</b>`}</div>
  <button class="themeBtn" data-act="tema" title="${document.body.classList.contains('dark') ? 'Mudar para tema claro' : 'Mudar para tema escuro'}" aria-label="Alternar tema claro/escuro">${ic(document.body.classList.contains('dark') ? 'sun' : 'moon')}</button><div class="userChip"><div class="avatar">${esc((S.user.nome || '?')[0].toUpperCase())}</div><div><b>${esc(S.user.nome)}</b><br><span class="muted">${esc(S.user.perfil)}</span></div><button class="ghost" data-act="sair" title="Sair">${ic('logout')}</button></div></div>
  <div class="content" id="content"></div></main></div>`;
  renderView();
}
function renderView() {
  const el = $('#content'); if (!el) return; try { el.innerHTML = (VIEWS[S.view] || VIEWS.painel)(); AFTER[S.view]?.(); } catch (e) { console.error(e); el.innerHTML = `<div class="notice bad">Erro ao montar a tela: ${esc(e.message)}</div>`; }
  try { history.replaceState(null, '', '#' + S.view); } catch (e) { }
}
const AFTER = {};

/* ======================= TELAS ======================= */
const VIEWS = {};

/* ---------- Painel ---------- */
/* ---------- período do painel ---------- */
let P = { ativo: false, per: () => true, label: 'todo o período' };
function periodoPainel() {
  if (S.f.pAno && !anosDisponiveis().some(([y]) => String(y) === String(S.f.pAno))) S.f.pAno = '';
  const a = S.f.pAno ? String(S.f.pAno) : '', m = S.f.pMes ? +S.f.pMes : 0;
  const per = d => !!d && (!a || String(d).slice(0, 4) === a) && (!m || +String(d).slice(5, 7) === m);
  const label = a && m ? `${MESES[m - 1]} de ${a}` : a ? `ano de ${a}` : m ? `${MESES[m - 1]} (todos os anos)` : 'todo o período';
  return { ativo: !!(a || m), per: a || m ? per : () => true, ano: a, mes: m, label };
}
function anosDisponiveis() {
  const atual = +hoje().slice(0, 4); const futuros = new Set();
  for (const v of L('vendas')) for (const p of v.parcelas || []) { const y = +p.venc.slice(0, 4); if (y > atual && y <= atual + 5 && saldoParcela(p) > 0) futuros.add(y); }
  return [...[...futuros].sort((a, b) => b - a).map(y => [y, y + ' (previsão)']), ...[0, 1, 2, 3, 4].map(k => [atual - k, String(atual - k)])];
}

VIEWS.painel = () => {
  P = periodoPainel();
  const empsFil = S.filial === '*' ? [] : L('empreendimentos').filter(e => e.filialId === S.filial).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  if (S.emp && !empsFil.some(e => e.id === S.emp)) S.emp = '';
  const noEmp = l => !S.emp || l.empId === S.emp;
  const todas = L('vendas').filter(vendaAtiva).filter(v => noEmp(loteDe(v))), lotes = L('lotes').filter(noEmp), ref = hoje();
  const vendasPer = todas.filter(v => P.per(v.data));
  const ps = todas.flatMap(v => (v.parcelas || []).map(p => ({ v, p })));
  const recebido = soma(ps, x => soma((x.p.pagamentos || []).filter(q => P.per(q.data)), q => q.valor));
  const aReceber = soma(ps.filter(x => P.per(x.p.venc)), x => saldoParcela(x.p));
  const vencPer = v => vencidasVenda(v).filter(p => P.per(p.venc));
  const vencidoInad = soma(todas.filter(v => situacaoVenda(v) === 'Inadimplente'), v => soma(vencPer(v), saldoParcela)), vencidoAtraso = soma(todas.filter(v => situacaoVenda(v) === 'Em atraso'), v => soma(vencPer(v), saldoParcela));
  const nInad = todas.filter(v => situacaoVenda(v) === 'Inadimplente' && vencPer(v).length).length;
  const comPag = soma(vendasPer, comissaoAPagar); const vIds = new Set(todas.map(v => v.id)); const bolAbertos = L('boletos').filter(b => vIds.has(b.vendaId) && ['Emitido', 'Registrado'].includes(b.status) && P.per(b.venc));
  const cnt = s => lotes.filter(l => l.status === s).length;
  const devedores = todas.map(v => ({ v, val: soma(vencPer(v), saldoParcela), n: vencPer(v).length })).filter(x => x.val > 0).sort((a, b) => b.val - a.val).slice(0, 6);
  const prox = ps.filter(x => saldoParcela(x.p) > 0 && x.p.venc >= ref && x.p.venc <= addDias(ref, 7)).sort((a, b) => a.p.venc.localeCompare(b.p.venc)).slice(0, 8);
  const graf = graficoRecebimentos(ps), rosca = graficoLotes(lotes, vendasPer);
  const fsBar = filiaisUsuario().filter(f => f.id === S.filial || Store.list('lotes').some(l => l.filialId === f.id) || Store.list('vendas').some(v => v.filialId === f.id)); const barra = fsBar.length > 1 ? `<div class="empBar" role="tablist" aria-label="Empresa">${[{ id: '*', nome: 'Todas as empresas' }, ...fsBar].map(f => `<button role="tab" aria-selected="${S.filial === f.id}" class="${S.filial === f.id ? 'on' : ''}" data-act="verFilial" data-id="${f.id}">${esc(f.nome)}${ic(S.filial === f.id ? 'check' : 'chev')}</button>`).join('')}</div>` : '';
  const nomeFil = nomeFilial(S.filial); const barraEmp = empsFil.length > 1 ? `<div class="empSub"><span class="empSubLbl">${ic('building')}Empreendimento de ${esc(nomeFil)}:</span>${[{ id: '', nome: 'Todos os empreendimentos' }, ...empsFil].map(e => `<button class="${(S.emp || '') === e.id ? 'on' : ''}" data-act="verEmp" data-id="${e.id}">${esc(e.nome)}${(S.emp || '') === e.id ? ic('check') : ''}</button>`).join('')}</div>` : '';
  const barraPer = `<div class="perBar"><span class="empSubLbl">${ic('grid')}Período:</span><label>Ano<select id="pAno">${opt('', 'Todos os anos', P.ano)}${anosDisponiveis().map(([a, t]) => opt(a, t, P.ano)).join('')}</select></label><label>Mês<select id="pMes">${opt('', 'Todos os meses', P.mes || '')}${MESES.map((n, i) => opt(i + 1, n[0].toUpperCase() + n.slice(1), P.mes || '')).join('')}</select></label>${P.ativo ? `<span class="badge orange">${esc(P.label)}</span><button class="sm ghost" data-act="limparPeriodo">${ic('x')}Limpar período</button>` : `<span class="muted" style="font-size:13px">Mostrando todo o período</span>`}</div>`;
  const sub = (geral, comPer) => P.ativo ? comPer : geral;
  return `${barra}${barraEmp}${barraPer}${S.emp ? `<div class="notice info" style="margin-bottom:16px">Mostrando somente o empreendimento <b>${esc(Store.get('empreendimentos', S.emp)?.nome)}</b> de ${esc(nomeFil)}.</div>` : ''}<div class="kpis">
   <div class="kpi bl"><span>Valor vendido</span><strong>${brl(soma(vendasPer, v => v.valor))}</strong><small>${sub(`${vendasPer.length} vendas ativas`, `${vendasPer.length} vendas em ${esc(P.label)}`)}</small></div>
   <div class="kpi bl"><span>Recebido</span><strong class="green">${brl(recebido)}</strong><small>${sub('Soma das baixas registradas', 'Baixas em ' + esc(P.label))}</small></div>
   <div class="kpi bl"><span>A receber</span><strong>${brl(aReceber)}</strong><small>${sub('Saldo das parcelas em aberto', 'Parcelas que vencem em ' + esc(P.label))}</small></div>
   <div class="kpi hl"><span>Em atraso + inadimplente</span><strong class="red">${brl(vencidoAtraso + vencidoInad)}</strong><small>${brl(vencidoInad)} inadimplente${P.ativo ? ' · vencidas em ' + esc(P.label) : ''}</small></div>
   <div class="kpi"><span>Lotes</span><strong>${cnt('Vendido')}<span class="muted" style="display:inline;font-size:15px"> / ${lotes.length} vendidos</span></strong><small>${P.ativo ? `${vendasPer.length} vendidos em ${esc(P.label)}` : `${cnt('Disponível')} disponíveis · ${cnt('Reservado')} reservados`}</small></div>
   <div class="kpi"><span>Comissões a pagar</span><strong>${brl(comPag)}</strong><small>${sub('Saldo dos corretores', 'Das vendas em ' + esc(P.label))}</small></div>
   <div class="kpi"><span>Boletos em aberto</span><strong>${bolAbertos.length}</strong><small>${brl(soma(bolAbertos, b => b.valor))}${P.ativo ? ' · vencimento no período' : ''}</small></div>
   <div class="kpi"><span>Inadimplência</span><strong class="${nInad ? 'red' : ''}">${nInad}</strong><small>contratos com 3+ parcelas vencidas${P.ativo ? ' (no período)' : ''}</small></div></div>
  <div class="two">${graf}${rosca}</div>
  ${proximos12(ps)}
  ${receitaProjetada(todas)}
  ${resultadosPorEmpresa(todas, lotes)}${comissoesPorEmpresa(vendasPer)}
  ${maioresVencidos(todas, vencPer)}
  <div class="two"><div class="card"><div class="cardHead"><h2>Vencem nos próximos 7 dias</h2></div><div class="cardBody">${prox.length ? `<div class="list">${prox.map(x => `<div class="listRow"><span>${esc(cliNome(x.v.clienteId))}<br><small class="muted">${esc(x.p.tipo)} ${esc(x.p.ref)} · ${dataBR(x.p.venc)}</small></span><b>${brl(saldoParcela(x.p))}</b></div>`).join('')}</div>` : '<div class="empty">Nada vencendo nesta semana.</div>'}</div></div></div>`;
};

/* ---------- gráficos do painel ---------- */
const MES_CURTO = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const intBR = n => Math.round(n).toLocaleString('pt-BR');
function escalaBonita(max) { if (max <= 0) return { top: 100, step: 25 }; const raw = max / 4; const mag = Math.pow(10, Math.floor(Math.log10(raw))); const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map(m => m * mag).find(st => st >= raw); return { top: step * 4, step }; }
function graficoRecebimentos(ps) {
  const anoAtual = +hoje().slice(0, 4), mesAtual = +hoje().slice(5, 7);
  const ano = P.ano ? +P.ano : anoAtual; const futuro = ano > anoAtual;
  const pags = ps.flatMap(x => (x.p.pagamentos || []).map(q => ({ data: q.data, valor: q.valor, tipo: x.p.tipo })));
  const prev = ps.filter(x => saldoParcela(x.p) > 0).map(x => ({ data: x.p.venc, valor: saldoParcela(x.p), tipo: x.p.tipo }));
  const fonte = futuro ? prev : pags;
  const porMes = Array.from({ length: 12 }, (_, i) => { const pref = `${ano}-${String(i + 1).padStart(2, '0')}`; const it = fonte.filter(x => String(x.data || '').startsWith(pref)); const t = tp => soma(it.filter(x => x.tipo === tp), x => x.valor); return { total: soma(it, x => x.valor), Entrada: t('Entrada'), Mensal: t('Mensal'), Intercalada: t('Intercalada'), Avulsa: t('Avulsa'), n: it.length }; });
  let mes = +P.mes || 0;
  if (!mes) { if (ano === anoAtual) mes = mesAtual; else { const ult = porMes.map((m, i) => m.total > 0 ? i + 1 : 0).filter(Boolean); mes = futuro ? (ult[0] || 1) : (ult[ult.length - 1] || 12); } }
  mes = Math.min(12, Math.max(1, mes));
  const { top, step } = escalaBonita(Math.max(...porMes.map(m => m.total)) / 100);
  const H = 230; const ticks = [4, 3, 2, 1, 0].map(k => k * step);
  const sel = porMes[mes - 1]; const totalAno = soma(porMes, m => m.total);
  const ini = `${ano}-${String(mes).padStart(2, '0')}-01`, fim = addDias(addMeses(ini, 1), -1);
  const nomeMes = MESES[mes - 1][0].toUpperCase() + MESES[mes - 1].slice(1);
  return `<div class="card chartCard ${futuro ? 'previsao' : ''}"><div class="cardHead"><div><h2>${futuro ? 'Previsão de recebimento por mês' : 'Recebimentos por mês'}</h2><p>${futuro ? `A receber em ${ano}` : `Total recebido em ${ano}`}: <b>${brl(totalAno)}</b>${P.ano ? '' : ' · escolha outro ano no Período'}</p></div><button class="sm" data-act="recDetalhes" data-ini="${ini}" data-fim="${fim}" data-prev="${futuro ? 1 : ''}">Ver detalhes</button></div>
  <div class="cardBody"><div class="vchart"><div class="vAxis">${ticks.map(t => `<span>${intBR(t)}</span>`).join('')}</div><div class="vPlot" style="height:${H}px">${ticks.map((t, i) => `<i class="vGrid" style="top:${i / 4 * 100}%"></i>`).join('')}<div class="vBars">${porMes.map((m, i) => `<button class="vBar ${i + 1 === mes ? 'on' : ''} ${ano === anoAtual && i + 1 === mesAtual ? 'now' : ''}" data-act="recMes" data-m="${i + 1}" data-a="${ano}" title="${MES_CURTO[i]}/${ano}: ${brl(m.total)} — clique para filtrar o painel por este mês"><i style="height:${m.total / 100 / top * 100}%"></i></button>`).join('')}</div></div><div></div><div class="vLabels">${MES_CURTO.map((n, i) => `<span class="${i + 1 === mes ? 'on' : ''}">${n}</span>`).join('')}</div></div>
  <div class="mesBox"><h3>${nomeMes} de ${ano}${futuro ? ' · previsão' : ''}</h3><div class="mesGrid"><div><span>${futuro ? 'Total a receber' : 'Total recebido'}</span><b>${brl(sel.total)}</b></div><div><span>Entrada</span><b>${brl(sel.Entrada)}</b></div><div><span>Mensal</span><b>${brl(sel.Mensal)}</b></div><div><span>Intercalada</span><b>${brl(sel.Intercalada)}</b></div>${sel.Avulsa ? `<div><span>Avulsa</span><b>${brl(sel.Avulsa)}</b></div>` : ''}</div><small class="muted">${sel.n} ${futuro ? 'parcela(s) a vencer' : 'pagamento(s) registrados'} no mês · clique numa barra para filtrar o painel pelo mês</small></div></div></div>`;
}
function maioresVencidos(vendas, vencPer) {
  const porCli = new Map();
  for (const v of vendas) { const val = soma(vencPer(v), saldoParcela); if (!val) continue; const k = v.clienteId || v.id; const x = porCli.get(k) || { cli: Store.get('clientes', v.clienteId), vendas: [], val: 0, inad: false }; x.vendas.push(v); x.val += val; if (situacaoVenda(v) === 'Inadimplente') x.inad = true; porCli.set(k, x); }
  const top = [...porCli.values()].sort((a, b) => b.val - a.val).slice(0, 5); const max = top[0]?.val || 1;
  const lotes = x => x.vendas.map(v => { const l = loteDe(v); return `${nomeFilial(v.filialId)} · ${l.quadra || ''}-${l.numero || ''}`; }).join(' / ');
  return `<div class="card"><div class="cardHead"><div><h2>Clientes com maiores valores vencidos</h2><p>5 maiores saldos · atrasados e inadimplentes${P.ativo ? ` · vencidas em ${esc(P.label)}` : ''}</p></div><button class="sm" data-act="go" data-v="inadimplencia">Ver todos os clientes</button></div><div class="cardBody">
  ${top.length ? `<div class="rankList">${top.map((x, i) => `<button class="rankRow ${i === 0 ? 'top' : ''}" data-act="verVenda" data-id="${x.vendas[0].id}" title="Abrir contrato"><span class="rankN">${i + 1}</span><span class="rankNome"><b>${esc(x.cli?.nome || '—')}</b><small>${esc(lotes(x))}</small></span><span class="rankSit ${x.inad ? 'bad' : 'warn'}">${x.inad ? 'Inadimplente' : 'Em atraso'}</span><span class="rankBar"><i class="${x.inad ? 'bad' : 'warn'}" style="width:${Math.max(3, x.val / max * 100)}%"></i></span><span class="rankVal">${brl(x.val)}</span></button>`).join('')}</div>` : '<div class="empty">Nenhum cliente com valores vencidos. 🎉</div>'}</div></div>`;
}
function receitaProjetada(vendas) {
  const txt = S.f.ipca ?? '0'; const rate = Number(String(txt).replace(',', '.')); const valid = String(txt).trim() !== '' && Number.isFinite(rate) && rate > -100 && rate <= 100;
  const start = hoje(), baseMonth = +start.slice(0, 4) * 12 + +start.slice(5, 7) - 1; const annual = (1 + (valid ? rate : 0) / 100) * 1.07;
  const rows = Array.from({ length: 180 }, (_, i) => { const ix = baseMonth + i; return { month: `${Math.floor(ix / 12)}-${String(ix % 12 + 1).padStart(2, '0')}`, base: 0, proj: 0, types: {} }; });
  for (const v of vendas) {
    const firstMonthly = (v.parcelas || []).filter(p => p.tipo === 'Mensal' && /^\d{4}-\d{2}-\d{2}$/.test(p.venc)).map(p => p.venc).sort()[0];
    const yearsSince = d => firstMonthly ? Math.max(0, +d.slice(0, 4) - +firstMonthly.slice(0, 4) - (d.slice(5) < firstMonthly.slice(5) ? 1 : 0)) : 0;
    for (const p of v.parcelas || []) {
      const sd = saldoParcela(p); if (p.venc < start || sd <= 0) continue;
      const off = +p.venc.slice(0, 4) * 12 + +p.venc.slice(5, 7) - 1 - baseMonth; if (!Number.isInteger(off) || off < 0 || off >= 180) continue;
      const ann = Math.max(0, yearsSince(p.venc) - yearsSince(start)); const val = Math.round(sd * (p.tipo === 'Mensal' || p.tipo === 'Intercalada' ? annual ** ann : 1));
      rows[off].base += sd; rows[off].proj += val; rows[off].types[p.tipo] = (rows[off].types[p.tipo] || 0) + val;
    }
  }
  const total = soma(rows, r => r.proj); const fmtM = m => m.split('-').reverse().join('/');
  const blocks = Array.from({ length: 15 }, (_, i) => { const ms = rows.slice(i * 12, (i + 1) * 12); return { label: `Ano ${i + 1}`, ms, base: soma(ms, r => r.base), val: soma(ms, r => r.proj), types: ['Entrada', 'Mensal', 'Intercalada'].map(t => soma(ms, r => r.types[t] || 0)) }; });
  const sel = Math.min(14, Math.max(0, +S.f.fSel || 0)), page = Math.floor(sel / 6), a = blocks[sel];
  return `<div class="card"><div class="cardHead"><div><h2>Receita projetada para os próximos 15 anos</h2><p>Simulação de 180 meses · ${fmtM(rows[0].month)} a ${fmtM(rows[179].month)}</p></div><label class="ipcaBox">IPCA anual estimado (%)<span><input id="ipca" inputmode="decimal" value="${esc(txt)}"> + 7% ao ano</span></label></div><div class="cardBody">
  ${!valid ? '<div class="notice bad">Informe um IPCA maior que −100% e até 100%.</div>' : `<div class="fcTotal"><span>Total projetado</span><b>${brl(total)}</b></div>
  <div class="fcGrid"><div><div class="tableWrap"><table class="fcTable"><thead><tr><th>Período</th><th class="num">Sem reajuste</th><th class="num">Projetado</th></tr></thead><tbody>${blocks.slice(page * 6, page * 6 + 6).map((b, i) => { const ix = page * 6 + i; return `<tr class="${ix === sel ? 'fcSel' : ''}" data-act="fcAno" data-i="${ix}"><td><b>${b.label}</b><small>${fmtM(b.ms[0].month)} a ${fmtM(b.ms[11].month)}</small></td><td class="num">${brl(b.base)}</td><td class="num"><b>${brl(b.val)}</b></td></tr>`; }).join('')}</tbody></table></div>
  <div class="fcPag"><button class="sm" data-act="fcAno" data-i="${(page - 1) * 6}" ${page === 0 ? 'disabled' : ''}>Anterior</button><span class="muted">Anos ${page * 6 + 1}–${Math.min(page * 6 + 6, 15)} de 15</span><button class="sm" data-act="fcAno" data-i="${(page + 1) * 6}" ${page === 2 ? 'disabled' : ''}>Próximos</button></div></div>
  <div class="fcDet"><h3>${a.label}</h3><p class="muted">${fmtM(a.ms[0].month)} a ${fmtM(a.ms[11].month)}</p><div class="bigNum" style="color:var(--ok)">${brl(a.val)}</div>${['Entrada', 'Mensal', 'Intercalada'].map((t, i) => `<div class="listRow"><span>${t}</span><b>${brl(a.types[i])}</b></div>`).join('')}<div class="listRow"><span class="muted">Sem reajuste</span><span class="muted">${brl(a.base)}</span></div><button class="fcBtn" data-act="fcExp">${S.f.fExp ? 'Ocultar meses' : 'Ver os 12 meses'}</button></div></div>
  ${S.f.fExp ? `<div class="tableWrap" style="margin-top:16px;border:1px solid var(--line);border-radius:10px"><table><thead><tr><th>Mês</th><th class="num">Sem reajuste</th><th class="num">Entrada</th><th class="num">Mensal</th><th class="num">Intercalada</th><th class="num">Projetado</th></tr></thead><tbody>${a.ms.map(r => `<tr><td>${fmtM(r.month)}</td><td class="num">${brl(r.base)}</td>${['Entrada', 'Mensal', 'Intercalada'].map(t => `<td class="num">${brl(r.types[t] || 0)}</td>`).join('')}<td class="num"><b>${brl(r.proj)}</b></td></tr>`).join('')}</tbody></table></div>` : ''}
  <details style="margin-top:14px"><summary class="fcHow">Como a projeção é calculada</summary><p class="hint" style="margin-top:8px">Os anos são blocos consecutivos de 12 meses a partir do mês atual. Mensais e intercaladas recebem reajuste nos aniversários do primeiro vencimento mensal do contrato, pelo fator (1 + IPCA) × 1,07. Entradas mantêm o saldo atual. O IPCA inicial de 0% é uma hipótese ajustável. Inclui só parcelas futuras com saldo, respeitando o término dos contratos e a empresa/empreendimento escolhidos. Não inclui vencidos, novas vendas ou descontos. Os valores cadastrados são considerados atualizados até hoje; só os reajustes futuros são aplicados. Contratos sem mensal cadastrada não recebem reajuste.</p></details>`}</div></div>`;
}
function proximos12(ps) {
  const base = hoje().slice(0, 7) + '-01'; const meses = Array.from({ length: 12 }, (_, i) => addMeses(base, i).slice(0, 7));
  const abertas = ps.filter(x => saldoParcela(x.p) > 0);
  const porMes = meses.map(m => { const it = abertas.filter(x => x.p.venc.startsWith(m)); const t = tp => soma(it.filter(x => x.p.tipo === tp), x => saldoParcela(x.p)); return { m, total: soma(it, x => saldoParcela(x.p)), Entrada: t('Entrada'), Mensal: t('Mensal'), Intercalada: t('Intercalada'), Avulsa: t('Avulsa'), n: it.length }; });
  const idx = Math.min(11, Math.max(0, +S.f.p12 || 0)); const sel = porMes[idx]; const total = soma(porMes, m => m.total);
  const { top, step } = escalaBonita(Math.max(...porMes.map(m => m.total)) / 100); const ticks = [4, 3, 2, 1, 0].map(k => k * step);
  const rot = m => `${MES_CURTO[+m.slice(5) - 1].toLowerCase()}. de ${m.slice(2, 4)}`;
  const ini = sel.m + '-01', fim = addDias(addMeses(ini, 1), -1);
  return `<div class="card chartCard previsao"><div class="cardHead"><div><h2>Próximos 12 meses a receber</h2><p>Saldo das parcelas futuras cadastradas</p></div><button class="sm" data-act="recDetalhes" data-prev="1" data-ini="${ini}" data-fim="${fim}">Ver detalhes</button></div>
  <div class="cardBody"><div style="margin-bottom:14px"><span class="muted" style="font-size:13px">Total previsto nos 12 meses</span><div class="bigNum">${brl(total)}</div></div>
  <div class="vchart"><div class="vAxis">${ticks.map(t => `<span>${intBR(t)}</span>`).join('')}</div><div class="vPlot" style="height:230px">${ticks.map((t, i) => `<i class="vGrid" style="top:${i / 4 * 100}%"></i>`).join('')}<div class="vBars">${porMes.map((m, i) => `<button class="vBar ${i === idx ? 'on' : ''}" data-act="p12" data-i="${i}" title="${rot(m.m)}: ${brl(m.total)}"><i style="height:${m.total / 100 / top * 100}%"></i></button>`).join('')}</div></div><div></div><div class="vLabels">${porMes.map((m, i) => `<span class="${i === idx ? 'on' : ''}">${rot(m.m)}</span>`).join('')}</div></div>
  <div class="mesBox"><h3>${MESES[+sel.m.slice(5) - 1][0].toUpperCase() + MESES[+sel.m.slice(5) - 1].slice(1)} de ${sel.m.slice(0, 4)}</h3><div class="mesGrid"><div><span>Total a receber</span><b>${brl(sel.total)}</b></div><div><span>Entrada</span><b>${brl(sel.Entrada)}</b></div><div><span>Mensal</span><b>${brl(sel.Mensal)}</b></div><div><span>Intercalada</span><b>${brl(sel.Intercalada)}</b></div>${sel.Avulsa ? `<div><span>Avulsa</span><b>${brl(sel.Avulsa)}</b></div>` : ''}</div><small class="muted">${sel.n} parcela(s) em aberto no mês</small></div>
  <p class="hint" style="margin-top:12px">Não inclui parcelas vencidas de meses anteriores nem reajustes futuros. Segue a empresa e o empreendimento selecionados.</p></div></div>`;
}
function empresasNoEscopo() { return filiaisUsuario().filter(f => S.filial === '*' || f.id === S.filial); }
function resultadosPorEmpresa(vendas, lotes) {
  const linhas = empresasNoEscopo().map(f => { const vs = vendas.filter(v => v.filialId === f.id), ls = lotes.filter(l => l.filialId === f.id); const pp = vs.flatMap(v => v.parcelas || []); const vsPer = vs.filter(v => P.per(v.data));
    const venc = s => soma(vs.filter(v => situacaoVenda(v) === s), v => soma(vencidasVenda(v).filter(p => P.per(p.venc)), saldoParcela));
    return { f, vend: soma(vsPer, v => v.valor), nvend: vsPer.length, rec: soma(pp, p => soma((p.pagamentos || []).filter(q => P.per(q.data)), q => q.valor)), atraso: venc('Em atraso'), inad: venc('Inadimplente'), arec: soma(pp.filter(p => P.per(p.venc)), saldoParcela), nv: ls.filter(l => l.status === 'Vendido').length, nl: ls.length }; }).filter(x => x.nl || x.vend || x.rec);
  const T = k => soma(linhas, x => x[k]);
  return `<div class="card"><div class="cardHead"><div><h2>Resultados por empresa</h2><p>${P.ativo ? `Período: <b>${esc(P.label)}</b> · vendas pela data do contrato, recebido pela data da baixa, atraso e a receber pelo vencimento · lotes na posição atual` : 'Todo o período · lotes na posição atual'}</p></div></div><div class="tableWrap"><table class="resTable"><thead><tr><th>Empresa</th><th class="num">Vendas</th><th class="num">Recebido</th><th class="num">Em atraso</th><th class="num">Inadimplente</th><th class="num">A receber</th><th class="num">Lotes vendidos</th></tr></thead><tbody>${linhas.map(x => `<tr><td><button class="sm ghost" data-act="verFilial" data-id="${x.f.id}" style="padding:2px 0;font-weight:700">${esc(x.f.nome)}</button></td><td class="num">${brl(x.vend)}${P.ativo ? `<small>${x.nvend} venda(s)</small>` : ''}</td><td class="num green">${brl(x.rec)}</td><td class="num ${x.atraso ? 'orange' : ''}">${brl(x.atraso)}</td><td class="num ${x.inad ? 'red' : ''}">${brl(x.inad)}</td><td class="num">${brl(x.arec)}</td><td class="num">${x.nv} / ${x.nl}</td></tr>`).join('') || '<tr><td colspan="7" class="empty">Sem dados no período.</td></tr>'}</tbody>${linhas.length ? `<tfoot><tr><td>Total</td><td class="num">${brl(T('vend'))}</td><td class="num">${brl(T('rec'))}</td><td class="num">${brl(T('atraso'))}</td><td class="num">${brl(T('inad'))}</td><td class="num">${brl(T('arec'))}</td><td class="num">${T('nv')} / ${T('nl')}</td></tr></tfoot>` : ''}</table></div></div>`;
}
function comissoesPorEmpresa(vendas) {
  const ativas = vendas.filter(v => !v.comissaoExcluida);
  const linhas = empresasNoEscopo().map(f => { const vs = ativas.filter(v => v.filialId === f.id); return { f, tot: soma(vs, comissaoTotal), pago: soma(vs, comissaoPaga), apagar: soma(vs, comissaoAPagar), susp: soma(vs.filter(v => v.comissaoSuspensa), comissaoSaldo) }; }).filter(x => x.tot);
  const T = k => soma(linhas, x => x[k]); const pc = (v, t) => t ? (v / t * 100) : 0;
  return `<div class="card"><div class="cardHead"><div><h2>Comissões por empresa</h2><p>Valores pagos, a pagar e suspensos${P.ativo ? ` · vendas de <b>${esc(P.label)}</b>` : ''}</p></div><div class="legend"><span><i style="background:var(--blue)"></i>Pagas</span><span><i style="background:var(--orange)"></i>A pagar</span><span><i style="background:var(--gray)"></i>Suspensas</span></div></div><div class="cardBody"><div class="comGrid">
  ${linhas.map(x => `<div class="comEmp"><h3>${esc(x.f.nome)}</h3><div class="comNums"><div><span>Pagas</span><b class="cBlue">${brl(x.pago)}</b></div><div><span>A pagar</span><b class="cOrange">${brl(x.apagar)}</b></div><div><span>Suspensas</span><b>${brl(x.susp)}</b></div></div><div class="stackBar" title="Pagas ${brl(x.pago)} · A pagar ${brl(x.apagar)} · Suspensas ${brl(x.susp)}"><i style="width:${pc(x.pago, x.tot)}%;background:var(--blue)"></i><i style="width:${pc(x.apagar, x.tot)}%;background:var(--orange)"></i><i style="width:${pc(x.susp, x.tot)}%;background:var(--gray)"></i></div></div>`).join('') || '<div class="empty">Sem comissões no período.</div>'}</div>
  ${linhas.length ? `<div class="comTot"><div><span>Comissão total</span><b>${brl(T('tot'))}</b></div><div><span>Já paga</span><b class="cBlue">${brl(T('pago'))}</b></div><div><span>A pagar</span><b class="cOrange">${brl(T('apagar'))}</b></div><div><span>Suspensas por inadimplência</span><b>${brl(T('susp'))}</b></div></div><p class="hint" style="margin-top:10px">Inclui comissões históricas registradas no Vico. Comissões suspensas ficam fora do valor a pagar até serem reativadas.</p>` : ''}</div></div>`;
}
function graficoLotes(lotes, vendasPer = []) {
  const tot = lotes.length; const itens = [['Vendido', 'Vendidos', 'var(--blue)'], ['Disponível', 'A vender', 'var(--orange)'], ['Reservado', 'Reservados', '#8FB3FF'], ['Bloqueado', 'Bloqueados', 'var(--gray)']].map(([st, nome, cor]) => ({ nome, cor, n: lotes.filter(l => l.status === st).length })).filter((x, i) => i < 3 || x.n);
  const R = 70, C = 2 * Math.PI * R; let acc = 0;
  const arcos = tot ? itens.filter(x => x.n).map(x => { const len = x.n / tot * C; const a = `<circle r="${R}" cx="100" cy="100" fill="none" stroke="${x.cor}" stroke-width="26" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 100 100)"><title>${x.nome}: ${x.n}</title></circle>`; acc += len; return a; }).join('') : '';
  const pct = tot ? Math.round(itens[0].n / tot * 100) : 0; const pct1 = n => tot ? (n / tot * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0,0';
  return `<div class="card chartCard"><div class="cardHead"><div><h2>Situação dos lotes</h2><p>Posição atual · ${tot} lotes cadastrados${P.ativo ? ` · <b>${vendasPer.length}</b> vendido(s) em ${esc(P.label)}` : ''}</p></div></div><div class="cardBody"><div class="donutWrap"><svg viewBox="0 0 200 200" class="donut"><circle r="${R}" cx="100" cy="100" fill="none" stroke="var(--soft)" stroke-width="26"/>${arcos}<text x="100" y="100" text-anchor="middle" class="dPct">${pct}%</text><text x="100" y="124" text-anchor="middle" class="dLbl">vendidos</text></svg></div>
  <div class="list" style="margin-top:12px">${itens.map(x => `<div class="listRow"><span><i class="pill" style="background:${x.cor};border-radius:3px;width:12px;height:12px;margin-right:8px;vertical-align:-1px"></i>${x.nome}</span><span><b>${x.n}</b> <span class="muted">(${pct1(x.n)}%)</span></span></div>`).join('')}</div></div></div>`;
}

/* ---------- Mapa de lotes ---------- */
VIEWS.mapa = () => {
  const emps = L('empreendimentos'); if (!emps.length) return `<div class="card"><div class="empty">Cadastre um empreendimento em <b>Filiais e empreendimentos</b> para ver o mapa.</div></div>`;
  if (!emps.some(e => e.id === S.f.mapaEmp)) S.f.mapaEmp = emps[0].id; const emp = Store.get('empreendimentos', S.f.mapaEmp);
  const modo = S.f.mapaModo || 'quadras', fst = S.f.mapaStatus || '';
  const lotes = Store.list('lotes').filter(l => l.empId === emp.id).sort((a, b) => String(a.quadra).localeCompare(String(b.quadra), 'pt-BR', { numeric: true }) || String(a.numero).localeCompare(String(b.numero), 'pt-BR', { numeric: true }));
  const vis = lotes.filter(l => !fst || l.status === fst); const quadras = [...new Set(vis.map(l => l.quadra))];
  const cnt = s => lotes.filter(l => l.status === s).length; const planta = Store.get('plantas', emp.id);
  const selL = Store.get('lotes', S.sel.lote);
  const tile = l => `<div class="lotTile st-${l.status} ${S.sel.lote === l.id ? 'sel' : ''}" data-act="selLote" data-id="${l.id}" title="${esc(loteNome(l))} · ${esc(l.status)} · ${brl(l.preco)}">${esc(l.numero)}<small>${l.area ? esc(l.area) + 'm²' : esc(l.status.slice(0, 4))}</small></div>`;
  const body = modo === 'quadras' ? (quadras.length ? quadras.map(q => `<div class="quadra"><h3>Quadra ${esc(q)} <span class="muted" style="font-weight:400;font-size:12px">${vis.filter(l => l.quadra === q).length} lotes</span></h3><div class="lotGrid">${vis.filter(l => l.quadra === q).map(tile).join('')}</div></div>`).join('') : '<div class="empty">Nenhum lote neste filtro.</div>')
    : (planta ? `<div class="notice info noPrint">${S.f.placing ? `<b>Posicionando ${esc(loteNome(selL))}:</b> clique na planta no ponto do lote.` : 'Selecione um lote (na planta ou na lista ao lado) e clique em <b>Posicionar na planta</b> para marcar onde ele fica.'}</div><div class="planta ${S.f.placing ? 'placing' : ''}" id="planta"><img src="${planta.imagem}" alt="Planta do empreendimento" draggable="false">${vis.filter(l => l.x != null).map(l => `<div class="pin st-${l.status} ${S.sel.lote === l.id ? 'sel' : ''}" style="left:${l.x}%;top:${l.y}%" data-act="selLote" data-id="${l.id}" title="${esc(loteNome(l))} · ${esc(l.status)}">${esc(l.quadra)}${esc(l.numero)}</div>`).join('')}</div>`
      : `<div class="empty">Nenhuma planta enviada para este empreendimento.<br><br><label style="display:inline-flex"><span class="primary" style="display:inline-flex;gap:7px;align-items:center;padding:9px 14px;border-radius:9px;background:var(--blue);color:#fff;cursor:pointer">${ic('upload')} Enviar imagem da planta</span><input type="file" accept="image/*" id="plantaFile" hidden></label></div>`);
  const vendaSel = selL && L('vendas').find(v => v.loteId === selL.id && vendaAtiva(v));
  const panel = selL ? `<div class="card sidePanel"><div class="cardHead"><div><div class="eyebrow">${esc(emp.nome)}</div><h2>${esc(loteNome(selL))}</h2></div>${badgeSit(selL.status)}</div><div class="cardBody"><div class="detailList"><div><span>Preço</span><b>${brl(selL.preco)}</b></div><div><span>Área</span><b>${selL.area ? esc(selL.area) + ' m²' : '—'}</b></div><div><span>Frente × fundo</span><b>${esc(selL.frente || '—')} × ${esc(selL.fundo || '—')} m</b></div>${selL.reservaPara ? `<div><span>Reservado para</span><b>${esc(selL.reservaPara)}</b></div>` : ''}${vendaSel ? `<div><span>Cliente</span><b>${esc(cliNome(vendaSel.clienteId))}</b></div><div><span>Situação</span>${badgeSit(situacaoVenda(vendaSel))}</div><div><span>Saldo</span><b>${brl(saldoVenda(vendaSel))}</b></div>` : ''}</div>
    <div class="formActions" style="justify-content:flex-start">${pode(S.user, 'lotes') && S.user.perfil !== 'Corretor' ? `<button class="sm" data-act="editLote" data-id="${selL.id}">Editar</button>` : ''}${selL.status === 'Disponível' ? `<button class="sm" data-act="reservar" data-id="${selL.id}">Reservar</button>${pode(S.user, 'vendas') ? `<button class="sm accent" data-act="novaVenda" data-lote="${selL.id}">Vender</button>` : ''}` : ''}${selL.status === 'Reservado' ? `<button class="sm" data-act="liberar" data-id="${selL.id}">Liberar</button>${pode(S.user, 'vendas') ? `<button class="sm accent" data-act="novaVenda" data-lote="${selL.id}">Vender</button>` : ''}` : ''}${vendaSel && pode(S.user, 'vendas') ? `<button class="sm" data-act="verVenda" data-id="${vendaSel.id}">Ver venda</button>` : ''}${modo === 'planta' && planta ? `<button class="sm" data-act="placing">${S.f.placing ? 'Cancelar posicionamento' : 'Posicionar na planta'}</button>` : ''}</div></div></div>`
    : `<div class="card sidePanel"><div class="cardBody"><p class="hint">Clique em um lote para ver detalhes, reservar ou vender.</p>${modo === 'planta' && planta ? `<div style="margin-top:14px"><b style="font-size:13px">Lotes sem posição na planta</b><div class="lotGrid" style="margin-top:8px">${lotes.filter(l => l.x == null).slice(0, 60).map(tile).join('') || '<small class="muted">Todos posicionados.</small>'}</div></div>` : ''}</div></div>`;
  return `<div class="toolbar"><label>Empreendimento<select id="mapaEmp">${emps.map(e => opt(e.id, e.nome, emp.id)).join('')}</select></label><label>Situação<select id="mapaStatus">${opt('', 'Todas', fst)}${['Disponível', 'Reservado', 'Vendido', 'Bloqueado'].map(s => opt(s, s, fst)).join('')}</select></label><div class="tabs"><button class="${modo === 'quadras' ? 'on' : ''}" data-act="mapaModo" data-v="quadras">Quadras</button><button class="${modo === 'planta' ? 'on' : ''}" data-act="mapaModo" data-v="planta">Planta</button></div><span class="spacer"></span><div class="legend">${['Disponível', 'Reservado', 'Vendido', 'Bloqueado'].map(s => `<span><i class="st-${s}"></i>${s} (${cnt(s)})</span>`).join('')}</div>${modo === 'planta' && planta ? `<label style="min-width:0"><span class="sm" style="display:inline-flex;gap:6px;align-items:center;border:1px solid var(--line);background:#fff;border-radius:9px;padding:6px 10px;cursor:pointer;color:var(--text)">${ic('upload')}Trocar planta</span><input type="file" accept="image/*" id="plantaFile" hidden></label>` : ''}</div>
  <div class="mapLayout"><div class="card"><div class="cardBody">${body}</div></div>${panel}</div>`;
};
AFTER.painel = () => { bindFilter('pAno', 'pAno'); bindFilter('pMes', 'pMes'); bindFilter('ipca', 'ipca', true); };
AFTER.mapa = () => {
  $('#mapaEmp')?.addEventListener('change', e => { S.f.mapaEmp = e.target.value; S.sel.lote = null; S.f.placing = false; renderView(); });
  $('#mapaStatus')?.addEventListener('change', e => { S.f.mapaStatus = e.target.value; renderView(); });
  $('#plantaFile')?.addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; try { const img = await reduzirImagem(f); await Store.put('plantas', { id: S.f.mapaEmp, filialId: Store.get('empreendimentos', S.f.mapaEmp).filialId, imagem: img }); toast('Planta salva.'); renderView(); } catch (err) { toast(err.message, true); } });
  $('#planta')?.addEventListener('click', async e => { if (!S.f.placing || e.target.closest('.pin')) return; const r = e.currentTarget.getBoundingClientRect(); const l = Store.get('lotes', S.sel.lote); if (!l) return; l.x = +((e.clientX - r.left) / r.width * 100).toFixed(2); l.y = +((e.clientY - r.top) / r.height * 100).toFixed(2); S.f.placing = false; await Store.put('lotes', l); renderView(); });
};
function reduzirImagem(file) {
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onerror = () => rej(Error('Falha ao ler a imagem.')); fr.onload = () => { const im = new Image(); im.onerror = () => rej(Error('Imagem inválida.')); im.onload = () => { let w = im.width, h = im.height, maxW = 1500; let out = ''; for (let q = 0.75; q > 0.25; q -= 0.1) { const sc = Math.min(1, maxW / w); const c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); out = c.toDataURL('image/jpeg', q); if (out.length < 235000) return res(out); maxW = Math.round(maxW * 0.85); } rej(Error('A imagem da planta é grande demais. Use uma imagem menor.')); }; im.src = fr.result; }; fr.readAsDataURL(file); });
}

/* ---------- filtros (componentes) ---------- */
const fSel = (id, label, items, val) => `<label>${label}<select id="${id}">${items.map(i => Array.isArray(i) ? opt(i[0], i[1], val ?? '') : opt(i, i, val ?? '')).join('')}</select></label>`;
const fTxt = (id, label, val, ph = '', cls = 'grow') => `<label class="${cls}">${label}<input id="${id}" value="${esc(val || '')}" placeholder="${esc(ph)}"></label>`;
const fDate = (id, label, val) => `<label style="min-width:140px">${label}<input type="date" id="${id}" value="${val || ''}"></label>`;
const fNum = (id, label, val, ph = '') => `<label style="min-width:110px;max-width:140px">${label}<input id="${id}" inputmode="decimal" value="${esc(val || '')}" placeholder="${esc(ph)}"></label>`;
const empItems = () => [['', 'Todos'], ...L('empreendimentos').map(e => [e.id, e.nome])];
const quadraItems = empId => [['', 'Todas'], ...[...new Set(L('lotes').filter(l => !empId || l.empId === empId).map(l => l.quadra))].sort((a, b) => String(a).localeCompare(String(b), 'pt-BR', { numeric: true })).map(q => [q, 'Quadra ' + q])];
const nAtivos = keys => keys.filter(k => S.f[k] !== undefined && S.f[k] !== '' && S.f[k] !== null).length;
const btnLimpar = keys => nAtivos(keys) ? `<button class="sm ghost" data-act="limparFiltros" data-k="${keys.join(',')}">${ic('x')}Limpar filtros (${nAtivos(keys)})</button>` : '';
const bindAll = (texto, outros) => { texto.forEach(k => bindFilter(k, k, true)); outros.forEach(k => bindFilter(k, k)); };
const naFaixa = (v, min, max) => (!min || v >= toCents(min)) && (!max || v <= toCents(max));
const loteDe = v => Store.get('lotes', v.loteId) || {};
const filtroBox = (linha1, linha2 = '') => `<div class="card noPrint" style="margin-bottom:16px"><div class="cardBody" style="padding:12px 16px"><div class="toolbar" style="margin:0">${linha1}</div>${linha2 ? `<div class="toolbar" style="margin:10px 0 0">${linha2}</div>` : ''}</div></div>`;

/* ---------- Lotes ---------- */
VIEWS.lotes = () => {
  const f = S.f, q = norm(f.lq); const K = ['lq', 'lemp', 'lquad', 'lst', 'lpmin', 'lpmax', 'lamin', 'lcusto'];
  const rows = L('lotes').filter(l => (!f.lst || l.status === f.lst) && (!f.lemp || l.empId === f.lemp) && (!f.lquad || l.quadra === f.lquad) && naFaixa(l.preco, f.lpmin, f.lpmax) && (!f.lamin || parseFloat(String(l.area || 0).replace(',', '.')) >= parseFloat(String(f.lamin).replace(',', '.'))) && (!f.lcusto || (f.lcusto === 'com' ? !!l.custo : !l.custo)) && (!q || norm(`${loteNome(l)} ${l.quadra} ${l.numero} ${Store.get('empreendimentos', l.empId)?.nome} ${l.matricula || ''}`).includes(q))).sort((a, b) => String(a.empId).localeCompare(b.empId) || String(a.quadra).localeCompare(String(b.quadra), 'pt-BR', { numeric: true }) || String(a.numero).localeCompare(String(b.numero), 'pt-BR', { numeric: true }));
  const editor = S.user.perfil !== 'Corretor';
  return `${filtroBox(`${fTxt('lq', 'Buscar', f.lq, 'Quadra, lote, matrícula')}${fSel('lquad', 'Quadra', quadraItems(f.lemp), f.lquad)}${fSel('lst', 'Situação', [['', 'Todas'], 'Disponível', 'Reservado', 'Vendido', 'Bloqueado'], f.lst)}`, `${fNum('lpmin', 'Preço de (R$)', f.lpmin)}${fNum('lpmax', 'até (R$)', f.lpmax)}${fNum('lamin', 'Área mín. (m²)', f.lamin)}${editor ? fSel('lcusto', 'Custo', [['', 'Todos'], ['com', 'Com custo'], ['sem', 'Sem custo']], f.lcusto) : ''}<span class="spacer"></span>${btnLimpar(K)}${editor ? `<button data-act="loteLote">${ic('layers')}Gerar lotes em série</button><button class="primary" data-act="editLote">${ic('plus')}Novo lote</button>` : ''}`)}
  <div class="card"><div class="tableWrap"><table><thead><tr><th>Lote</th><th>Empreendimento</th><th class="num">Área</th><th class="num">Preço</th>${editor ? '<th class="num">Custo</th><th class="num">Lucro previsto</th>' : ''}<th>Situação</th><th></th></tr></thead><tbody>${rows.map(l => `<tr><td><b>${esc(loteNome(l))}</b><small>${esc(nomeFilial(l.filialId))}</small></td><td>${esc(Store.get('empreendimentos', l.empId)?.nome || '—')}</td><td class="num">${l.area ? esc(l.area) + ' m²' : '—'}</td><td class="num">${brl(l.preco)}</td>${editor ? `<td class="num">${l.custo ? brl(l.custo) : '—'}</td><td class="num">${l.custo ? brl(l.preco - l.custo) : '—'}</td>` : ''}<td>${badgeSit(l.status)}</td><td class="actions">${editor ? `<button class="sm" data-act="editLote" data-id="${l.id}">Editar</button>` : ''}${l.status !== 'Vendido' && pode(S.user, 'vendas') ? `<button class="sm accent" data-act="novaVenda" data-lote="${l.id}">Vender</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="8" class="empty">Nenhum lote encontrado.</td></tr>`}</tbody>
  <tfoot><tr><td colspan="3">${rows.length} lotes</td><td class="num">${brl(soma(rows, l => l.preco))}</td>${editor ? `<td class="num">${brl(soma(rows, l => l.custo))}</td><td class="num">${brl(soma(rows.filter(l => l.custo), l => l.preco - l.custo))}</td>` : ''}<td colspan="2"></td></tr></tfoot></table></div></div>`;
};
AFTER.lotes = () => bindAll(['lq', 'lpmin', 'lpmax', 'lamin'], ['lemp', 'lquad', 'lst', 'lcusto']);
function bindFilter(id, key, text = false) { const el = $('#' + id); if (!el) return; el.addEventListener(text ? 'input' : 'change', e => { S.f[key] = e.target.value; if (text) { clearTimeout(bindFilter.t); bindFilter.t = setTimeout(() => { const pos = e.target.selectionStart; renderView(); const n = $('#' + id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (er) { } } }, 250); } else renderView(); }); }

function formLote(l) {
  const emps = L('empreendimentos'); if (!emps.length) return toast('Cadastre um empreendimento primeiro (Filiais e empreendimentos).', true);
  l = l || { empId: S.f.mapaEmp || emps[0].id, status: 'Disponível', preco: 0 };
  modal(`${mHead('Lote', l.id ? 'Editar ' + loteNome(l) : 'Novo lote')}<form class="modalBody" data-form="lote" data-id="${l.id || ''}"><div class="formGrid">
  <label class="c2">Empreendimento${sel('empId', emps.map(e => [e.id, e.nome]), l.empId)}</label><label>Quadra<input name="quadra" required value="${esc(l.quadra || '')}"></label><label>Lote nº<input name="numero" required value="${esc(l.numero || '')}"></label>
  <label>Área (m²)<input name="area" value="${esc(l.area || '')}"></label><label>Frente (m)<input name="frente" value="${esc(l.frente || '')}"></label><label>Fundo (m)<input name="fundo" value="${esc(l.fundo || '')}"></label><label>Situação${sel('status', ['Disponível', 'Reservado', 'Vendido', 'Bloqueado'], l.status)}</label>
  <label>Preço de venda (R$)<input name="preco" required value="${centsIn(l.preco)}"></label><label>Custo (R$)<input name="custo" value="${l.custo ? centsIn(l.custo) : ''}"></label><label class="c2">Matrícula / registro<input name="matricula" value="${esc(l.matricula || '')}"></label>
  <label class="c4">Confrontações<textarea name="confrontacoes" rows="2">${esc(l.confrontacoes || '')}</textarea></label><label class="c4">Observações<textarea name="obs" rows="2">${esc(l.obs || '')}</textarea></label></div>
  <div class="formActions">${l.id && S.user.perfil === 'Administrador' && l.status !== 'Vendido' ? `<button type="button" class="danger" data-act="delLote" data-id="${l.id}">Excluir</button><span class="spacer"></span>` : ''}<button type="button" data-act="closeModal">Cancelar</button><button class="primary">Salvar lote</button></div></form>`);
}
function formLoteSerie() {
  const emps = L('empreendimentos'); if (!emps.length) return toast('Cadastre um empreendimento primeiro.', true);
  modal(`${mHead('Lotes', 'Gerar lotes em série')}<form class="modalBody" data-form="loteSerie"><p class="hint" style="margin-bottom:12px">Cria vários lotes de uma vez, por exemplo Quadra A, lotes 1 a 20. Lotes que já existem são ignorados.</p><div class="formGrid">
  <label class="c2">Empreendimento${sel('empId', emps.map(e => [e.id, e.nome]), S.f.mapaEmp || emps[0].id)}</label><label>Quadras (separe por vírgula)<input name="quadras" required placeholder="A, B, C"></label><label>Lotes por quadra<input name="qtd" type="number" min="1" max="300" required value="20"></label>
  <label>Área (m²)<input name="area" value="250"></label><label>Frente (m)<input name="frente" value="10"></label><label>Fundo (m)<input name="fundo" value="25"></label><label>Preço (R$)<input name="preco" required value="80000,00"></label></div>
  <div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Gerar lotes</button></div></form>`);
}

/* ---------- Clientes ---------- */
const PAPEL_CONJUGE = /c[oô]njuge|companheir/i;
const contratosTitular = c => (c.vinculosVico || []).filter(l => !PAPEL_CONJUGE.test(l.papel || '')).map(l => l.contrato || l.empresa + '-' + l.lote);
const ehConjuge = c => !!c.conjugeDeId || ((c.vinculosVico || []).length > 0 && c.vinculosVico.every(l => PAPEL_CONJUGE.test(l.papel || '')));
const _titCache = { ver: null, map: new Map() };
function titularDe(o) {
  if (o.conjugeDeId) return Store.get('clientes', o.conjugeDeId);
  const ver = Store.list('clientes').length + ':' + (Store.list('clientes').reduce((m, c) => c.atualizadoEm > m ? c.atualizadoEm : m, ''));
  if (_titCache.ver !== ver) { _titCache.ver = ver; _titCache.map = new Map(); }
  if (_titCache.map.has(o.id)) return Store.get('clientes', _titCache.map.get(o.id));
  const ks = new Set((o.vinculosVico || []).map(l => l.contrato || l.empresa + '-' + l.lote)); const sob = new Set(norm(o.nome).split(' ').filter(t => t.length > 3));
  let best = null, bs = 0;
  for (const c of Store.list('clientes')) {
    if (c.id === o.id || ehConjuge(c)) continue; const tv = (c.vinculosVico || []).filter(l => !PAPEL_CONJUGE.test(l.papel || ''));
    const comum = tv.filter(l => ks.has(l.contrato || l.empresa + '-' + l.lote)).length; if (!comum) continue;
    const sc = comum * 100 + norm(c.nome).split(' ').filter(t => sob.has(t)).length * 10 + (tv.some(l => /principal/i.test(l.papel || '') && ks.has(l.contrato)) ? 1 : 0) + (norm(c.conjuge || '') === norm(o.nome) ? 1000 : 0);
    if (sc > bs) { bs = sc; best = c; }
  }
  _titCache.map.set(o.id, best?.id); return best;
}
function conjugesDe(c) { return Store.list('clientes').filter(o => o.id !== c.id && ehConjuge(o) && titularDe(o)?.id === c.id); }
const CAMPOS_CLIENTE = [['nome', 'Nome completo / razão social', 'c2', true], ['cpf', 'CPF / CNPJ'], ['rg', 'RG / órgão / UF'], ['nacionalidade', 'Nacionalidade'], ['estadoCivil', 'Estado civil'], ['profissao', 'Profissão'], ['conjuge', 'Cônjuge / companheiro(a)'], ['telefone', 'Telefone'], ['whatsapp', 'WhatsApp'], ['email', 'E-mail', 'c2'], ['cep', 'CEP'], ['logradouro', 'Logradouro', 'c2'], ['numero', 'Número'], ['complemento', 'Complemento'], ['bairro', 'Bairro'], ['cidade', 'Cidade'], ['uf', 'UF']];
VIEWS.clientes = () => {
  const f = S.f, q = norm(f.cq); const vendas = L('vendas'); const K = ['cq', 'ccid', 'ccon', 'csit', 'cemp', 'cconj'];
  const todos = L('clientes'); const cidades = [...new Set(todos.map(c => c.cidade).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const mostrarConj = f.cconj === 'sim'; const rows = todos.filter(c => { if (!mostrarConj && ehConjuge(c) && titularDe(c)) return false; const vs = vendas.filter(v => v.clienteId === c.id); const cj = q ? conjugesDe(c).map(o => o.nome + ' ' + onlyDigits(o.cpf)).join(' ') : ''; return (!q || norm(`${c.nome} ${c.cpf} ${onlyDigits(c.cpf)} ${c.telefone} ${c.whatsapp} ${c.email} ${c.cidade} ${cj}`).includes(q)) && (!f.ccid || c.cidade === f.ccid) && (!f.ccon || (f.ccon === 'com' ? vs.length : !vs.length)) && (!f.csit || vs.some(v => situacaoVenda(v) === f.csit)) && (!f.cemp || vs.some(v => loteDe(v).empId === f.cemp)); }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  return `${filtroBox(`${fTxt('cq', 'Buscar', f.cq, 'Nome, CPF, telefone, e-mail')}${fSel('ccid', 'Cidade', [['', 'Todas'], ...cidades], f.ccid)}${fSel('ccon', 'Contratos', [['', 'Todos'], ['com', 'Com contrato'], ['sem', 'Sem contrato']], f.ccon)}${fSel('csit', 'Situação financeira', [['', 'Todas'], 'Em dia', 'Em atraso', 'Inadimplente', 'Quitado'], f.csit)}${fSel('cconj', 'Cônjuges', [['', 'Dentro do titular'], ['sim', 'Mostrar na lista']], f.cconj)}<span class="spacer"></span>${btnLimpar(K)}<button class="primary" data-act="editCliente">${ic('plus')}Novo cliente</button>`)}
  <div class="card"><div class="tableWrap"><table><thead><tr><th>Cliente</th><th>CPF/CNPJ</th><th>Contato</th><th>Cidade</th><th>Contratos</th><th></th></tr></thead><tbody>${rows.map(c => { const vs = vendas.filter(v => v.clienteId === c.id); return `<tr><td><b>${esc(c.nome)}</b>${ehConjuge(c) ? ' <span class="badge">cônjuge</span>' : ''}<small>${esc(nomeFilial(c.filialId))}${(() => { const cj = conjugesDe(c); return cj.length ? ' · Cônjuge: ' + esc(cj.map(o => o.nome).join(', ')) : ''; })()}</small></td><td>${esc(fmtCPF(c.cpf))}</td><td>${esc(c.whatsapp || c.telefone || '')}<small>${esc(c.email || '')}</small></td><td>${esc(c.cidade || '')}${c.uf ? '/' + esc(c.uf) : ''}</td><td>${vs.map(v => `<span class="badge ${({ 'Em dia': 'blue', 'Quitado': 'ok', 'Em atraso': 'warn', 'Inadimplente': 'bad' })[situacaoVenda(v)] || ''}" title="${esc(situacaoVenda(v))}">${esc(loteNome(loteDe(v)))}</span>`).join(' ') || '<span class="muted">—</span>'}</td><td class="actions"><button class="sm" data-act="editCliente" data-id="${c.id}">Abrir</button></td></tr>`; }).join('') || `<tr><td colspan="6" class="empty">Nenhum cliente.</td></tr>`}</tbody><tfoot><tr><td colspan="6">${rows.length} clientes${mostrarConj ? '' : ` · ${todos.filter(o => ehConjuge(o) && titularDe(o)).length} cônjuges dentro dos cadastros dos titulares`}</td></tr></tfoot></table></div></div>`;
};
AFTER.clientes = () => bindAll(['cq'], ['ccid', 'ccon', 'csit', 'cemp', 'cconj']);
function formCliente(c, after) {
  c = c || {}; const cj = c.id ? conjugesDe(c) : []; const tit = c.id && ehConjuge(c) ? titularDe(c) : null;
  const titulares = L('clientes').filter(o => o.id !== c.id && !ehConjuge(o)).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  modal(`${mHead(tit ? 'Cônjuge de ' + tit.nome : 'Cliente', c.id ? c.nome : 'Novo cliente')}<form class="modalBody" data-form="cliente" data-id="${c.id || ''}">
  ${tit ? `<div class="notice info">Este cadastro é cônjuge/companheiro(a) de <b>${esc(tit.nome)}</b> e aparece dentro do cadastro do titular. <button type="button" class="sm" data-act="editCliente" data-id="${tit.id}">Abrir titular</button></div>` : ''}
  ${cj.length ? `<div class="card" style="margin-bottom:14px"><div class="cardHead" style="padding:10px 14px"><h3>Cônjuge / companheiro(a)</h3></div><div class="tableWrap"><table><tbody>${cj.map(o => `<tr><td><b>${esc(o.nome)}</b><small>${esc((o.vinculosVico || []).map(l => l.papel).filter(Boolean)[0] || 'Cônjuge')}</small></td><td>${esc(fmtCPF(o.cpf))}</td><td>${esc(o.rg || '')}</td><td>${esc(o.profissao || '')}</td><td>${esc(o.whatsapp || o.telefone || '')}</td><td class="actions"><button type="button" class="sm" data-act="editCliente" data-id="${o.id}">Abrir</button></td></tr>`).join('')}</tbody></table></div></div>` : ''}
  <div class="formGrid">${CAMPOS_CLIENTE.map(([k, t, cls, req]) => `<label class="${cls || ''}">${t}<input name="${k}" value="${esc(c[k] || '')}" ${req ? 'required' : ''}></label>`).join('')}
  <label class="c2">Este cadastro é cônjuge de<select name="conjugeDeId">${opt('', tit && !c.conjugeDeId ? 'Vínculo do Vico: ' + tit.nome : '— não é cônjuge (titular) —', c.conjugeDeId || '')}${titulares.map(o => opt(o.id, o.nome, c.conjugeDeId || '')).join('')}</select></label>
  <label class="c4">Observações<textarea name="obs" rows="2">${esc(c.obs || '')}</textarea></label></div>
  <div class="formActions">${c.id && S.user.perfil === 'Administrador' ? `<button type="button" class="danger" data-act="delCliente" data-id="${c.id}">Excluir</button><span class="spacer"></span>` : ''}<button type="button" data-act="closeModal">Cancelar</button><button class="primary">Salvar cliente</button></div></form>`, 'wide');
  formCliente.after = after;
}

/* ---------- Vendas ---------- */
function linhasVendas() {
  const f = S.f, q = norm(f.vq);
  const todas = L('vendas'); const corretores = [...new Set(todas.map(v => v.corretor).filter(Boolean))].sort();
  const rows = todas.filter(v => { const l = loteDe(v); const rec = recebidoVenda(v); const pct = v.valor ? rec / v.valor * 100 : 0; return (!f.vst || situacaoVenda(v) === f.vst) && (!f.vemp || l.empId === f.vemp) && (!f.vquad || l.quadra === f.vquad) && (!f.vcor || v.corretor === f.vcor) && (!f.vini || (v.data || '') >= f.vini) && (!f.vfim || (v.data || '') <= f.vfim) && naFaixa(saldoVenda(v), f.vsmin, f.vsmax) && (!f.vrec || (f.vrec === '0' ? rec === 0 : f.vrec === '25' ? pct < 25 : f.vrec === '50' ? pct >= 25 && pct < 50 : f.vrec === '75' ? pct >= 50 && pct < 75 : pct >= 75)) && (!q || norm(`${v.numero} ${cliNome(v.clienteId)} ${loteDesc(v.loteId)} ${v.corretor}`).includes(q)); }).sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  return rows;
}
VIEWS.vendas = () => {
  const f = S.f; const K = ['vq', 'vemp', 'vquad', 'vcor', 'vst', 'vini', 'vfim', 'vsmin', 'vsmax', 'vrec'];
  const corretores = [...new Set(L('vendas').map(v => v.corretor).filter(Boolean))].sort(); const rows = linhasVendas();
  return `${filtroBox(`${fTxt('vq', 'Buscar', f.vq, 'Contrato, cliente, lote, corretor')}${fSel('vquad', 'Quadra', quadraItems(f.vemp), f.vquad)}${fSel('vst', 'Situação', [['', 'Todas'], 'Em dia', 'Em atraso', 'Inadimplente', 'Quitado', 'Distratado'], f.vst)}${fSel('vcor', 'Corretor', [['', 'Todos'], ...corretores], f.vcor)}`, `${fDate('vini', 'Venda de', f.vini)}${fDate('vfim', 'até', f.vfim)}${fNum('vsmin', 'Saldo de (R$)', f.vsmin)}${fNum('vsmax', 'até (R$)', f.vsmax)}${fSel('vrec', '% já pago', [['', 'Qualquer'], ['0', 'Nada pago'], ['25', 'Menos de 25%'], ['50', '25% a 50%'], ['75', '50% a 75%'], ['100', '75% ou mais']], f.vrec)}<span class="spacer"></span>${btnLimpar(K)}<button data-act="exportVendas">${ic('down')}CSV</button><button class="primary" data-act="novaVenda">${ic('plus')}Nova venda</button>`)}
  <div class="card"><div class="tableWrap"><table><thead><tr><th>Contrato</th><th>Cliente</th><th>Lote</th><th class="num">Valor</th><th class="num">Recebido</th><th class="num">Saldo</th><th>Situação</th><th></th></tr></thead><tbody>${rows.map(v => `<tr><td><b>${esc(v.numero)}</b><small>${dataBR(v.data)}</small></td><td>${esc(cliNome(v.clienteId))}<small>${esc(v.corretor || '')}</small></td><td>${esc(loteDesc(v.loteId))}</td><td class="num">${brl(v.valor)}</td><td class="num green">${brl(recebidoVenda(v))}<small>${v.valor ? Math.round(recebidoVenda(v) / v.valor * 100) : 0}%</small></td><td class="num">${brl(saldoVenda(v))}</td><td>${badgeSit(situacaoVenda(v))}</td><td class="actions"><button class="sm" data-act="verVenda" data-id="${v.id}">Abrir</button>${pode(S.user, 'modelos') ? `<button class="sm" data-act="gerarContrato" data-id="${v.id}">Contrato</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="8" class="empty">Nenhuma venda.</td></tr>`}</tbody>
  <tfoot><tr><td colspan="3">${rows.length} contratos</td><td class="num">${brl(soma(rows, v => v.valor))}</td><td class="num">${brl(soma(rows, recebidoVenda))}</td><td class="num">${brl(soma(rows, saldoVenda))}</td><td colspan="2"></td></tr></tfoot></table></div></div>`;
};
AFTER.vendas = () => bindAll(['vq', 'vsmin', 'vsmax'], ['vemp', 'vquad', 'vst', 'vcor', 'vini', 'vfim', 'vrec']);
function formVenda(loteId) {
  const lotes = L('lotes').filter(l => l.status !== 'Vendido' && l.status !== 'Bloqueado'); if (!lotes.length) return toast('Não há lotes disponíveis nesta filial.', true);
  const l0 = Store.get('lotes', loteId) || lotes[0]; const clientes = L('clientes').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const d = hoje(), m1 = addMeses(d, 1);
  modal(`${mHead('Venda', 'Nova venda de lote')}<form class="modalBody" data-form="venda"><div class="formGrid">
  <div class="formSection">Contrato</div>
  <label class="c2">Lote${sel('loteId', lotes.map(l => [l.id, `${loteDesc(l.id)} — ${brl(l.preco)}${l.status === 'Reservado' ? ' (reservado)' : ''}`]), l0.id, 'id="vLote"')}</label>
  <label class="c2">Cliente<div style="display:flex;gap:6px">${sel('clienteId', [['', 'Selecione…'], ...clientes.map(c => [c.id, c.nome + (c.cpf ? ' · ' + fmtCPF(c.cpf) : '')])], '', 'id="vCli" required')}<button type="button" class="sm" data-act="cliRapido" title="Cadastrar cliente">${ic('plus')}</button></div></label>
  <label>Valor da venda (R$)<input name="valor" id="vValor" required value="${centsIn(l0.preco)}"></label><label>Data do contrato<input type="date" name="data" required value="${d}"></label><label>Corretor<input name="corretor" list="corretores" value=""><datalist id="corretores">${[...new Set(Store.list('vendas').map(v => v.corretor).filter(Boolean))].map(c => `<option value="${esc(c)}">`).join('')}</datalist></label><label>Comissão (%)<input name="comissaoPct" value="4"></label>
  <label>Índice de reajuste${sel('indice', ['IPCA', 'IGP-M', 'INCC', 'Sem reajuste'], 'IPCA')}</label><label class="c3">Reajuste / juros contratuais<input name="reajuste" value="IPCA + 7% a.a., aplicado anualmente"></label>
  <div class="formSection">Plano de pagamento <button type="button" class="sm" data-act="planoPadrao" style="margin-left:8px">Aplicar condição padrão (5% entrada · 30% intercaladas · restante mensal)</button></div>
  <label>Entrada — total (R$)<input name="eTotal" class="pl" value="0,00"></label><label>Entrada — nº parcelas<input name="eQtd" class="pl" type="number" min="0" value="1"></label><label class="c2">Entrada — 1º vencimento<input type="date" name="eVenc" value="${d}"></label>
  <label>Mensais — total (R$)<input name="mTotal" class="pl" value="0,00"></label><label>Mensais — nº parcelas<input name="mQtd" class="pl" type="number" min="0" value="120"></label><label class="c2">Mensais — 1º vencimento<input type="date" name="mVenc" value="${m1}"></label>
  <label>Intercaladas — total (R$)<input name="iTotal" class="pl" value="0,00"></label><label>Intercaladas — nº<input name="iQtd" class="pl" type="number" min="0" value="0"></label><label>A cada (meses)<input name="iInt" type="number" min="1" value="12"></label><label>Intercaladas — 1ª<input type="date" name="iVenc" value="${addMeses(d, 6)}"></label>
  <div class="c4" id="planoResumo"></div></div>
  <div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="accent">Confirmar venda e gerar parcelas</button></div></form>`, 'wide');
  const f = $('[data-form=venda]'); const upd = () => { const v = fd(f), tot = toCents(v.valor), s = toCents(v.eTotal) + toCents(v.mTotal) + toCents(v.iTotal); const dif = tot - s; const parc = (t, q) => +q ? brl(Math.floor(toCents(t) / +q)) : '—'; $('#planoResumo').innerHTML = `<div class="notice ${dif === 0 ? 'ok' : 'warn'}">Entrada: ${v.eQtd}× ${parc(v.eTotal, v.eQtd)} · Mensais: ${v.mQtd}× ${parc(v.mTotal, v.mQtd)} · Intercaladas: ${v.iQtd}× ${parc(v.iTotal, v.iQtd)}<br>Soma do plano: <b>${brl(s)}</b> · Valor da venda: <b>${brl(tot)}</b>${dif ? ` · <b>Diferença: ${brl(dif)}</b> <button type="button" class="sm" data-act="restoMensal">Jogar diferença nas mensais</button>` : ' ✓ plano confere com o valor da venda'}</div>`; };
  f.addEventListener('input', upd); $('#vLote').addEventListener('change', e => { f.valor.value = centsIn(Store.get('lotes', e.target.value).preco); upd(); }); formVenda.upd = upd; aplicarPlanoPadrao(f); upd();
}
function aplicarPlanoPadrao(f) { const tot = toCents(f.valor.value); const e = Math.round(tot * .05), i = Math.round(tot * .30); f.eTotal.value = centsIn(e); f.eQtd.value = 3; f.iTotal.value = centsIn(i); f.iQtd.value = Math.max(1, Math.round(+f.mQtd.value / 12) || 10); f.mTotal.value = centsIn(tot - e - i); }
function verVenda(id) {
  const v = Store.get('vendas', id); if (!v) return; const lote = Store.get('lotes', v.loteId); const fin = pode(S.user, 'financeiro');
  const ps = (v.parcelas || []).slice().sort((a, b) => a.venc.localeCompare(b.venc)); const tipos = ['Entrada', 'Mensal', 'Intercalada'];
  modal(`${mHead(`${v.numero} · ${nomeFilial(v.filialId)}`, cliNome(v.clienteId) + ' — ' + loteDesc(v.loteId))}<div class="modalBody">
  <div class="kpis" style="grid-template-columns:repeat(4,1fr)"><div class="kpi"><span>Valor</span><strong>${brl(v.valor)}</strong><small>${dataBR(v.data)}</small></div><div class="kpi"><span>Recebido</span><strong class="green">${brl(recebidoVenda(v))}</strong></div><div class="kpi"><span>Saldo</span><strong>${brl(saldoVenda(v))}</strong><small>${vencidasVenda(v).length} vencidas</small></div><div class="kpi"><span>Situação</span><strong style="font-size:16px">${badgeSit(situacaoVenda(v))}</strong><small>Classificação: ${esc(v.classificacao || 'Automático')}</small></div></div>
  <div class="toolbar"><div class="legend">${tipos.map(t => { const a = ps.filter(p => p.tipo === t); return a.length ? `<span><b>${t}:</b>&nbsp;${a.length}× · ${brl(soma(a, p => p.valor))}</span>` : ''; }).join('')}</div><span class="spacer"></span>${fin ? `<button class="sm" data-act="addParcela" data-id="${v.id}">${ic('plus')}Parcela avulsa</button>` : ''}${pode(S.user, 'modelos') ? `<button class="sm" data-act="gerarContrato" data-id="${v.id}">${ic('doc')}Gerar contrato</button>` : ''}${S.user.perfil === 'Administrador' || S.user.perfil === 'Gerente' ? (v.status === 'Distratado' ? '' : `<button class="sm danger" data-act="distrato" data-id="${v.id}">Distratar</button>`) : ''}</div>
  <div class="tableWrap" style="max-height:420px;overflow:auto;border:1px solid var(--line);border-radius:10px"><table><thead><tr><th>Tipo</th><th>Parcela</th><th>Vencimento</th><th class="num">Valor</th><th class="num">Encargos</th><th class="num">Pago</th><th class="num">Saldo</th><th>Situação</th><th></th></tr></thead><tbody>${ps.map(p => { const b = Store.list('boletos').find(x => x.parcelaId === p.id && x.status !== 'Cancelado'); return `<tr><td>${esc(p.tipo)}</td><td>${esc(p.ref)}</td><td>${dataBR(p.venc)}</td><td class="num">${brl(p.valor)}</td><td class="num">${(p.juros || p.multa) ? brl((p.juros || 0) + (p.multa || 0)) : '—'}</td><td class="num">${brl(pagoParcela(p))}</td><td class="num">${brl(saldoParcela(p))}</td><td>${badgeSit(statusParcela(p))}${b ? ` <span class="badge blue" title="${esc(b.linha)}">boleto</span>` : ''}</td><td class="actions">${fin && saldoParcela(p) > 0 ? `<button class="sm" data-act="baixa" data-v="${v.id}" data-p="${p.id}">Baixar</button>` : ''}${fin && saldoParcela(p) > 0 && pode(S.user, 'boletos') ? `<button class="sm" data-act="emitirBoleto" data-v="${v.id}" data-p="${p.id}">${b ? 'Ver boleto' : 'Boleto'}</button>` : ''}${(p.pagamentos || []).length ? `<button class="sm" data-act="histParcela" data-v="${v.id}" data-p="${p.id}">Histórico</button>` : ''}${fin && S.user.perfil !== 'Financeiro' ? `<button class="sm ghost" data-act="editParcela" data-v="${v.id}" data-p="${p.id}">Editar</button>` : ''}</td></tr>`; }).join('') || `<tr><td colspan="9" class="empty">Sem parcelas.</td></tr>`}</tbody></table></div>
  <div class="formGrid" style="margin-top:16px"><label>Classificação financeira<select id="vClass" ${fin ? '' : 'disabled'}>${['Automático', 'Em atraso', 'Inadimplente'].map(s => opt(s, s, v.classificacao || 'Automático')).join('')}</select></label><label>Corretor<input value="${esc(v.corretor || '')}" disabled></label><label>Comissão<input value="${brl(comissaoTotal(v))} (${esc(v.comissaoPct ?? 4)}%)" disabled></label><label>Reajuste<input value="${esc(v.indice || '')} · ${esc(v.reajuste || '')}" disabled></label></div>
  ${(v.antecipacoes || []).length ? `<details style="margin-top:14px"><summary class="muted" style="cursor:pointer">Antecipações de parcelas (${v.antecipacoes.length})</summary><div class="tableWrap" style="margin-top:8px"><table><thead><tr><th>Tipo</th><th>Parcela</th><th>Vencimento</th><th>Pago em</th><th class="num">Valor</th></tr></thead><tbody>${v.antecipacoes.map(a => `<tr><td>${esc(a.tipo)}</td><td>${esc(a.ref)}</td><td>${dataBR(a.venc)}</td><td>${dataBR(a.pagoEm)}</td><td class="num">${brl(a.valor)}</td></tr>`).join('')}</tbody></table></div></details>` : ''}
  ${(v.historico || []).length ? `<details style="margin-top:14px"><summary class="muted" style="cursor:pointer">Histórico de alterações (${v.historico.length})</summary><div class="list" style="margin-top:8px">${v.historico.slice().reverse().map(h => `<div class="listRow"><span>${esc(h.acao)}</span><small class="muted">${esc(h.usuario || '')} · ${new Date(h.data).toLocaleString('pt-BR')}</small></div>`).join('')}</div></details>` : ''}</div>`, 'wide');
  $('#vClass')?.addEventListener('change', async e => { v.classificacao = e.target.value; hist(v, 'Classificação financeira: ' + e.target.value); await Store.put('vendas', v); toast('Classificação salva.'); renderView(); });
}
const hist = (v, acao) => { (v.historico ||= []).push({ data: new Date().toISOString(), usuario: S.user?.nome, acao }); if (v.historico.length > 200) v.historico = v.historico.slice(-200); };
function formBaixa(vid, pid) {
  const v = Store.get('vendas', vid), p = v.parcelas.find(x => x.id === pid), fil = Store.get('filiais', v.filialId); const d = hoje(); const enc = encargos(p, d, fil);
  modal(`${mHead(cliNome(v.clienteId) + ' · ' + v.numero, `Baixa — ${p.tipo} ${p.ref}`)}<form class="modalBody" data-form="baixa" data-v="${vid}" data-p="${pid}" data-etapa="1"><div id="bEtapa1"><div class="notice info">Vencimento ${dataBR(p.venc)} · Valor ${brl(p.valor)} · Já pago ${brl(pagoParcela(p))} · <b>Saldo ${brl(saldoParcela(p))}</b></div>
  <label class="dataBaixa">Data da baixa (dia em que o dinheiro entrou)<input type="date" name="data" id="bData" value="${d}" max="${d}" required></label>
  <div class="formGrid" style="margin-top:12px"><label>Multa (R$)<input name="multa" id="bMulta" value="${centsIn(enc.multa)}"></label><label>Juros (R$)<input name="juros" id="bJuros" value="${centsIn(enc.juros)}"></label><label>Valor recebido (R$)<input name="valor" id="bValor" required value="${centsIn(saldoParcela(p) + enc.multa + enc.juros)}"></label>
  <label>Forma${sel('forma', ['PIX', 'Boleto', 'Transferência', 'Dinheiro', 'Cartão', 'Cheque'], 'PIX')}</label><label class="c4">Observação<input name="obs"></label></div><p class="hint" id="bHint" style="margin-top:8px">${enc.dias ? `${enc.dias} dia(s) de atraso: multa de ${fil?.multa ?? 2}% e juros de ${fil?.jurosMes ?? 1}% ao mês pro rata, conforme a filial.` : 'Pagamento sem atraso.'}</p>
  <div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Continuar</button></div></div><div id="bEtapa2" hidden></div></form>`);
  $('#bData').addEventListener('change', e => { const x = encargos(p, e.target.value, fil); $('#bMulta').value = centsIn(x.multa); $('#bJuros').value = centsIn(x.juros); $('#bValor').value = centsIn(saldoParcela(p) + x.multa + x.juros); $('#bHint').textContent = x.dias ? `${x.dias} dia(s) de atraso: multa e juros recalculados para a data da baixa.` : 'Pagamento sem atraso.'; });
}
function confirmarBaixaHTML(v, p, d) {
  const valor = toCents(d.valor), multa = toCents(d.multa), juros = toCents(d.juros); const saldo = saldoParcela(p), totalDevido = saldo + multa + juros; const resta = Math.max(0, totalDevido - valor);
  return `<div class="notice warn" style="font-size:15px"><b>Deseja realmente baixar este pagamento?</b> Confira os dados abaixo.</div>
  <div class="detailList" style="margin:6px 0 4px"><div><span>Cliente</span><b>${esc(cliNome(v.clienteId))}</b></div><div><span>Contrato / lote</span><b>${esc(v.numero)} · ${esc(loteNome(loteDe(v)))}</b></div><div><span>Parcela</span><b>${esc(p.tipo)} ${esc(p.ref)} · venc. ${dataBR(p.venc)}</b></div>
  <div class="destaque"><span>Data da baixa</span><b>${dataBR(d.data)}</b></div><div><span>Forma</span><b>${esc(d.forma)}</b></div>${multa || juros ? `<div><span>Multa + juros</span><b>${brl(multa + juros)}</b></div>` : ''}<div class="destaque"><span>Valor recebido</span><b>${brl(valor)}</b></div>${resta ? `<div><span>Fica em aberto na parcela</span><b class="orange">${brl(resta)}</b></div>` : ''}${valor > totalDevido ? `<div><span>Atenção</span><b class="orange">valor maior que o devido (${brl(totalDevido)})</b></div>` : ''}</div>
  <div class="formActions"><button type="button" data-act="baixaVoltar">Voltar e corrigir</button><button class="primary" id="bConfirmar">Confirmar baixa</button></div>`;
}
async function registrarPagamento(v, p, { valor, data, juros = 0, multa = 0, obs = '', forma = '', origem = 'manual', fitid }) {
  p.juros = (p.juros || 0) + juros; p.multa = (p.multa || 0) + multa;
  (p.pagamentos ||= []).push({ valor, data, obs, forma, origem, fitid, usuario: S.user?.nome, em: new Date().toISOString() });
  hist(v, `Baixa ${p.tipo} ${p.ref}: ${brl(valor)} em ${dataBR(data)} (${origem})`); await Store.put('vendas', v);
  if (saldoParcela(p) === 0) { const b = Store.list('boletos').find(x => x.parcelaId === p.id && ['Emitido', 'Registrado'].includes(x.status)); if (b) { b.status = 'Pago'; b.pagoEm = data; await Store.put('boletos', b); } }
}

/* ---------- Parcelas e baixas ---------- */
function linhasParcelas() {
  const f = S.f; const st = f.pst ?? 'Em aberto', q = norm(f.pq), ref = hoje(); const bols = new Set(Store.list('boletos').filter(b => b.status !== 'Cancelado').map(b => b.parcelaId));
  return L('vendas').filter(vendaAtiva).filter(v => { const l = loteDe(v); return (!f.pemp || l.empId === f.pemp) && (!f.pquad || l.quadra === f.pquad) && (!q || norm(cliNome(v.clienteId) + ' ' + v.numero + ' ' + loteDesc(v.loteId)).includes(q)); })
    .flatMap(v => (v.parcelas || []).map(p => ({ v, p }))).filter(({ p }) => {
      const sd = saldoParcela(p);
      const okSt = st === 'Todas' || (st === 'Em aberto' && sd > 0) || (st === 'Vencidas' && vencida(p, ref)) || (st === 'Pagas' && sd === 0) || (st === 'Parciais' && sd > 0 && pagoParcela(p) > 0) || (st === 'Vence hoje' && sd > 0 && p.venc === ref) || (st === 'Próximos 7 dias' && sd > 0 && p.venc >= ref && p.venc <= addDias(ref, 7)) || (st === 'Próximos 30 dias' && sd > 0 && p.venc >= ref && p.venc <= addDias(ref, 30)) || (st === 'Com encargos' && ((p.juros || 0) + (p.multa || 0)) > 0);
      const pagNoPeriodo = !f.ppini && !f.ppfim ? true : (p.pagamentos || []).some(x => (!f.ppini || x.data >= f.ppini) && (!f.ppfim || x.data <= f.ppfim));
      return okSt && pagNoPeriodo && (!f.ptp || p.tipo === f.ptp) && (!f.pini || p.venc >= f.pini) && (!f.pfim || p.venc <= f.pfim) && (!f.pdia || +p.venc.slice(8) === +f.pdia) && naFaixa(totalParcela(p), f.pmin, f.pmax) && (!f.pbol || (f.pbol === 'com' ? bols.has(p.id) : !bols.has(p.id)));
    }).sort((a, b) => a.p.venc.localeCompare(b.p.venc));
}
VIEWS.financeiro = () => {
  const f = S.f; const st = f.pst ?? 'Em aberto'; const K = ['pq', 'pst', 'ptp', 'pemp', 'pquad', 'pini', 'pfim', 'pdia', 'pmin', 'pmax', 'pbol', 'ppini', 'ppfim'];
  const rows = linhasParcelas(); const shown = rows.slice(0, 400); const periodoPag = f.ppini || f.ppfim;
  const recPeriodo = periodoPag ? soma(rows, ({ p }) => soma((p.pagamentos || []).filter(x => (!f.ppini || x.data >= f.ppini) && (!f.ppfim || x.data <= f.ppfim)), x => x.valor)) : 0;
  return `${filtroBox(`${fTxt('pq', 'Buscar', f.pq, 'Cliente, contrato ou lote')}${fSel('pst', 'Situação', ['Em aberto', 'Vencidas', 'Vence hoje', 'Próximos 7 dias', 'Próximos 30 dias', 'Parciais', 'Pagas', 'Com encargos', 'Todas'], st)}${fSel('ptp', 'Tipo', [['', 'Todos'], 'Entrada', 'Mensal', 'Intercalada', 'Avulsa'], f.ptp)}${fSel('pquad', 'Quadra', quadraItems(f.pemp), f.pquad)}`,
    `${fDate('pini', 'Vencimento de', f.pini)}${fDate('pfim', 'até', f.pfim)}${fSel('pdia', 'Dia do venc.', [['', 'Todos'], ...Array.from({ length: 31 }, (_, i) => [String(i + 1), 'Dia ' + (i + 1)])], f.pdia)}${fDate('ppini', 'Pago de', f.ppini)}${fDate('ppfim', 'até', f.ppfim)}${fNum('pmin', 'Valor de (R$)', f.pmin)}${fNum('pmax', 'até (R$)', f.pmax)}${fSel('pbol', 'Boleto', [['', 'Todos'], ['com', 'Com boleto'], ['sem', 'Sem boleto']], f.pbol)}<span class="spacer"></span>${btnLimpar(K)}<button data-act="exportParcelas">${ic('down')}Exportar CSV</button>`)}
  <div class="kpis" style="grid-template-columns:repeat(${periodoPag ? 4 : 3},1fr)"><div class="kpi bl"><span>Parcelas no filtro</span><strong>${rows.length.toLocaleString('pt-BR')}</strong></div><div class="kpi bl"><span>Valor das parcelas</span><strong>${brl(soma(rows, x => totalParcela(x.p)))}</strong></div><div class="kpi hl"><span>Saldo a receber</span><strong>${brl(soma(rows, x => saldoParcela(x.p)))}</strong></div>${periodoPag ? `<div class="kpi bl"><span>Recebido no período</span><strong class="green">${brl(recPeriodo)}</strong><small>${f.ppini ? dataBR(f.ppini) : 'início'} a ${f.ppfim ? dataBR(f.ppfim) : 'hoje'}</small></div>` : ''}</div>
  <div class="card"><div class="tableWrap"><table><thead><tr><th>Vencimento</th><th>Cliente / contrato</th><th>Lote</th><th>Parcela</th><th class="num">Valor</th><th class="num">Pago</th><th class="num">Saldo</th><th>Situação</th><th></th></tr></thead><tbody>${shown.map(({ v, p }) => `<tr><td>${dataBR(p.venc)}</td><td><b>${esc(cliNome(v.clienteId))}</b><small>${esc(v.numero)}</small></td><td>${esc(loteDesc(v.loteId))}</td><td>${esc(p.tipo)} ${esc(p.ref)}</td><td class="num">${brl(totalParcela(p))}</td><td class="num">${brl(pagoParcela(p))}</td><td class="num">${brl(saldoParcela(p))}</td><td>${badgeSit(statusParcela(p))}</td><td class="actions">${saldoParcela(p) > 0 ? `<button class="sm" data-act="baixa" data-v="${v.id}" data-p="${p.id}">Baixar</button>${pode(S.user, 'boletos') ? `<button class="sm" data-act="emitirBoleto" data-v="${v.id}" data-p="${p.id}">Boleto</button>` : ''}` : `<button class="sm" data-act="histParcela" data-v="${v.id}" data-p="${p.id}">Histórico</button>`}</td></tr>`).join('') || `<tr><td colspan="9" class="empty">Nenhuma parcela no filtro.</td></tr>`}</tbody></table></div>${rows.length > shown.length ? `<p class="hint" style="padding:10px 18px">Mostrando ${shown.length} de ${rows.length.toLocaleString('pt-BR')}. Refine o filtro ou exporte o CSV (exporta todas do filtro).</p>` : ''}</div>`;
};
AFTER.financeiro = () => bindAll(['pq', 'pmin', 'pmax'], ['pst', 'ptp', 'pemp', 'pquad', 'pini', 'pfim', 'pdia', 'pbol', 'ppini', 'ppfim']);

/* ---------- Inadimplência ---------- */
function linhasInad() {
  const f = S.f, ref = hoje(), q = norm(f.iq);
  return L('vendas').filter(vendaAtiva).map(v => { const venc = vencidasVenda(v, ref); return { v, venc, valor: soma(venc, saldoParcela), dias: venc.length ? Math.max(...venc.map(p => diasEntre(p.venc, ref))) : 0, sit: situacaoVenda(v, ref) }; })
    .filter(x => { const l = loteDe(x.v); const [a, b] = (f.ifx || '').split('-').map(Number); return x.venc.length && (!f.ist || f.ist === 'Todos' || x.sit === f.ist) && (!f.iemp || l.empId === f.iemp) && (!f.iquad || l.quadra === f.iquad) && (!f.ifx || (x.dias >= a && (!b || x.dias <= b))) && (!f.imin || x.venc.length >= +f.imin) && naFaixa(x.valor, f.ivmin, '') && (!q || norm(cliNome(x.v.clienteId) + ' ' + x.v.numero + ' ' + loteDesc(x.v.loteId)).includes(q)); })
    .sort((a, b) => f.iord === 'dias' ? b.dias - a.dias : f.iord === 'nome' ? cliNome(a.v.clienteId).localeCompare(cliNome(b.v.clienteId), 'pt-BR') : b.valor - a.valor);
}
VIEWS.inadimplencia = () => {
  const f = S.f; const K = ['iq', 'ist', 'iemp', 'iquad', 'ifx', 'imin', 'ivmin', 'iord']; const rows = linhasInad();
  const t = s => rows.filter(x => x.sit === s);
  return `<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi hl"><span>Total vencido</span><strong class="red">${brl(soma(rows, x => x.valor))}</strong><small>${rows.length} contratos</small></div><div class="kpi"><span>Em atraso (1–2 parcelas)</span><strong class="orange">${brl(soma(t('Em atraso'), x => x.valor))}</strong><small>${t('Em atraso').length} contratos</small></div><div class="kpi"><span>Inadimplentes (3+ ou marcados)</span><strong class="red">${brl(soma(t('Inadimplente'), x => x.valor))}</strong><small>${t('Inadimplente').length} contratos</small></div></div>
  ${filtroBox(`${fTxt('iq', 'Buscar', f.iq, 'Cliente, contrato ou lote')}${fSel('ist', 'Situação', [['', 'Todos'], 'Em atraso', 'Inadimplente'], f.ist === 'Todos' ? '' : f.ist)}${fSel('iquad', 'Quadra', quadraItems(f.iemp), f.iquad)}`, `${fSel('ifx', 'Maior atraso', [['', 'Qualquer'], ['1-30', '1 a 30 dias'], ['31-60', '31 a 60 dias'], ['61-90', '61 a 90 dias'], ['91-180', '91 a 180 dias'], ['181-', 'Mais de 180 dias']], f.ifx)}${fSel('imin', 'Parcelas vencidas', [['', 'Qualquer'], ['2', '2 ou mais'], ['3', '3 ou mais'], ['6', '6 ou mais'], ['12', '12 ou mais']], f.imin)}${fNum('ivmin', 'Valor mín. (R$)', f.ivmin)}${fSel('iord', 'Ordenar por', [['', 'Maior valor'], ['dias', 'Maior atraso'], ['nome', 'Nome do cliente']], f.iord)}<span class="spacer"></span>${btnLimpar(K)}<button data-act="exportInad">${ic('down')}Exportar CSV</button>${pode(S.user, 'discord') ? `<button class="accent" data-act="discordInad">${ic('send')}Enviar lista no Discord</button>` : ''}`)}
  <div class="card"><div class="tableWrap"><table><thead><tr><th>Cliente</th><th>Lote / contrato</th><th>Contato</th><th class="num">Parcelas vencidas</th><th class="num">Maior atraso</th><th class="num">Valor vencido</th><th>Situação</th><th></th></tr></thead><tbody>${rows.map(x => { const c = Store.get('clientes', x.v.clienteId) || {}; return `<tr><td><b>${esc(c.nome || '—')}</b></td><td>${esc(loteDesc(x.v.loteId))}<small>${esc(x.v.numero)}</small></td><td>${esc(c.whatsapp || c.telefone || '—')}</td><td class="num">${x.venc.length}</td><td class="num">${x.dias} dias</td><td class="num red"><b>${brl(x.valor)}</b></td><td>${badgeSit(x.sit)}</td><td class="actions"><button class="sm" data-act="verVenda" data-id="${x.v.id}">Abrir</button>${pode(S.user, 'discord') ? `<button class="sm" data-act="discordCobranca" data-id="${x.v.id}">Discord</button>` : ''}</td></tr>`; }).join('') || `<tr><td colspan="8" class="empty">Nenhum contrato com parcelas vencidas neste filtro.</td></tr>`}</tbody></table></div></div>`;
};
AFTER.inadimplencia = () => bindAll(['iq', 'ivmin'], ['ist', 'iemp', 'iquad', 'ifx', 'imin', 'iord']);

/* ---------- Boletos ---------- */
VIEWS.boletos = () => {
  const f = S.f, st = f.bst || '', q = norm(f.bq); const K = ['bst', 'bq', 'bini', 'bfim']; const rows = L('boletos').filter(b => (!st || b.status === st) && (!f.bini || b.venc >= f.bini) && (!f.bfim || b.venc <= f.bfim) && (!q || norm(`${b.nossoNumero} ${b.pagador?.nome} ${onlyDigits(b.pagador?.cpf)} ${Store.get('vendas', b.vendaId)?.numero}`).includes(q))).sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
  const semBB = filiaisUsuario().filter(f => !f.bb?.convenio);
  return `${semBB.length ? `<div class="notice warn">Configure agência, conta e convênio do Banco do Brasil em <b>Filiais</b> para: ${semBB.map(f => esc(f.nome)).join(', ')}.</div>` : ''}<div class="notice info">Os boletos são gerados no padrão FEBRABAN do Banco do Brasil (carteira 17, convênio de 7 dígitos). ${Store.mode === 'server' ? 'O botão <b>Registrar no BB</b> envia o título à API de Cobrança do BB com as credenciais configuradas no servidor.' : 'O <b>registro automático na API do BB</b> funciona quando o sistema roda no servidor TRAXUP (VPS) com as credenciais do BB no arquivo .env. Aqui o boleto é gerado com linha digitável e código de barras para conferência e para envio via arquivo/Internet Banking.'}</div>
  ${filtroBox(`${fTxt('bq', 'Buscar', f.bq, 'Pagador, CPF, nosso número, contrato')}${fSel('bst', 'Situação', [['', 'Todos'], 'Emitido', 'Registrado', 'Pago', 'Cancelado'], st)}${fDate('bini', 'Vencimento de', f.bini)}${fDate('bfim', 'até', f.bfim)}<span class="spacer"></span>${btnLimpar(K)}<button class="primary" data-act="boletoLote">${ic('barcode')}Emitir boletos do mês</button>`)}
  <div class="card"><div class="tableWrap"><table><thead><tr><th>Nosso número</th><th>Pagador</th><th>Parcela</th><th>Vencimento</th><th class="num">Valor</th><th>Situação</th><th></th></tr></thead><tbody>${rows.map(b => { const v = Store.get('vendas', b.vendaId); const p = v?.parcelas.find(x => x.id === b.parcelaId); return `<tr><td><b>${esc(b.nossoNumero)}</b><small>${esc(nomeFilial(b.filialId))}</small></td><td>${esc(b.pagador?.nome || '—')}<small>${esc(fmtCPF(b.pagador?.cpf))}</small></td><td>${p ? esc(p.tipo + ' ' + p.ref) : '—'}<small>${esc(v?.numero || '')}</small></td><td>${dataBR(b.venc)}</td><td class="num">${brl(b.valor)}</td><td>${badgeSit(b.status)}</td><td class="actions"><button class="sm" data-act="verBoleto" data-id="${b.id}">Ver</button>${b.status === 'Emitido' && Store.mode === 'server' ? `<button class="sm primary" data-act="registrarBB" data-id="${b.id}">Registrar no BB</button>` : ''}${['Emitido', 'Registrado'].includes(b.status) ? `<button class="sm danger" data-act="cancelBoleto" data-id="${b.id}">Cancelar</button>` : ''}</td></tr>`; }).join('') || `<tr><td colspan="7" class="empty">Nenhum boleto emitido. Emita pela parcela (Parcelas e baixas) ou em lote.</td></tr>`}</tbody></table></div></div>`;
};
AFTER.boletos = () => bindAll(['bq'], ['bst', 'bini', 'bfim']);
async function emitirBoleto(vid, pid, silencioso = false) {
  const v = Store.get('vendas', vid), p = v.parcelas.find(x => x.id === pid); const fil = Store.get('filiais', v.filialId);
  const existente = Store.list('boletos').find(b => b.parcelaId === pid && b.status !== 'Cancelado' && b.status !== 'Pago'); if (existente) { if (!silencioso) verBoleto(existente.id); return existente; }
  if (!fil?.bb?.convenio) { if (!silencioso) toast('Configure o convênio BB da filial ' + (fil?.nome || '') + ' em Filiais.', true); return null; }
  const seq = Math.max(0, ...Store.list('boletos').filter(b => b.filialId === v.filialId).map(b => b.seq || 0)) + 1;
  const venc = p.venc < hoje() ? hoje() : p.venc; const valor = saldoParcela(p); const cli = Store.get('clientes', v.clienteId) || {};
  const barras = codigoBarrasBB({ convenio: fil.bb.convenio, seq, carteira: fil.bb.carteira || '17', valor, venc });
  const b = await Store.put('boletos', { filialId: v.filialId, vendaId: v.id, parcelaId: p.id, seq, nossoNumero: nossoNumeroBB(fil.bb.convenio, seq), valor, venc, vencOriginal: p.venc, barras, linha: linhaDigitavel(barras), status: 'Emitido', criadoEm: new Date().toISOString(), criadoPor: S.user.nome, pagador: { nome: cli.nome, cpf: onlyDigits(cli.cpf), endereco: [cli.logradouro, cli.numero, cli.complemento].filter(Boolean).join(', '), bairro: cli.bairro, cidade: cli.cidade, uf: cli.uf, cep: onlyDigits(cli.cep), telefone: onlyDigits(cli.whatsapp || cli.telefone) }, instrucoes: `Após o vencimento cobrar multa de ${fil.multa ?? 2}% e juros de ${fil.jurosMes ?? 1}% ao mês. Referente a ${p.tipo} ${p.ref} — ${loteDesc(v.loteId)} — contrato ${v.numero}.` });
  hist(v, `Boleto ${b.nossoNumero} emitido para ${p.tipo} ${p.ref}`); await Store.put('vendas', v);
  if (!silencioso) { toast('Boleto emitido.'); verBoleto(b.id); }
  return b;
}
function htmlBoleto(b) {
  const fil = Store.get('filiais', b.filialId) || {}, bb = fil.bb || {}; const ag = `${esc(bb.agencia || '')} / ${esc(bb.conta || '')}`;
  const ficha = (titulo) => `<div class="bTop"><div class="bBank">Banco do Brasil</div><div class="bCode">001-9</div><div class="bLine">${titulo === 'recibo' ? 'Recibo do Pagador' : esc(b.linha)}</div></div>
  <table><tr><td colspan="5"><span>Local de pagamento</span><b>Pagável em qualquer banco até o vencimento${b.status === 'Registrado' ? '' : ''}</b></td><td style="width:28%"><span>Vencimento</span><b>${dataBR(b.venc)}</b></td></tr>
  <tr><td colspan="5"><span>Beneficiário</span><b>${esc(bb.beneficiario || fil.razao || fil.nome)}</b> — CNPJ ${esc(fmtCPF(bb.cnpj || fil.cnpj))}</td><td><span>Agência / Código do beneficiário</span><b>${ag}</b></td></tr>
  <tr><td><span>Data do documento</span>${dataBR((b.criadoEm || '').slice(0, 10))}</td><td><span>Nº documento</span>${esc(Store.get('vendas', b.vendaId)?.numero || '')}</td><td><span>Espécie doc.</span>DM</td><td><span>Aceite</span>N</td><td><span>Data processamento</span>${dataBR((b.criadoEm || '').slice(0, 10))}</td><td><span>Nosso número</span><b>${esc(b.nossoNumero)}</b></td></tr>
  <tr><td><span>Uso do banco</span></td><td><span>Carteira</span>${esc(bb.carteira || '17')}${bb.variacao ? '/' + esc(bb.variacao) : ''}</td><td><span>Espécie</span>R$</td><td><span>Quantidade</span></td><td><span>Valor</span></td><td><span>(=) Valor do documento</span><b>${brl(b.valor)}</b></td></tr>
  <tr><td colspan="5" rowspan="3" style="height:70px"><span>Instruções (texto de responsabilidade do beneficiário)</span>${esc(b.instrucoes || '')}</td><td><span>(-) Desconto / abatimento</span>&nbsp;</td></tr><tr><td><span>(+) Mora / multa</span>&nbsp;</td></tr><tr><td><span>(=) Valor cobrado</span>&nbsp;</td></tr>
  <tr><td colspan="6"><span>Pagador</span><b>${esc(b.pagador?.nome || '')}</b> — CPF/CNPJ ${esc(fmtCPF(b.pagador?.cpf))}<br>${esc([b.pagador?.endereco, b.pagador?.bairro, b.pagador?.cidade && b.pagador.cidade + '/' + (b.pagador?.uf || ''), b.pagador?.cep && 'CEP ' + b.pagador.cep].filter(Boolean).join(' — '))}</td></tr></table>`;
  return `<div class="boletoWrap">${ficha('recibo')}<div class="cut">Autenticação mecânica — corte aqui</div>${ficha('ficha')}${svgI25(b.barras)}<div style="font-size:9px;text-align:right">Ficha de compensação — autenticação mecânica</div>${b.pixEmv ? `<p style="font-size:10px;word-break:break-all"><b>PIX copia e cola:</b> ${esc(b.pixEmv)}</p>` : ''}</div>`;
}
function verBoleto(id) {
  const b = Store.get('boletos', id);
  modal(`${mHead('Boleto ' + b.status, b.pagador?.nome || 'Boleto')}<div class="modalBody"><div class="notice ${b.status === 'Registrado' ? 'ok' : b.status === 'Emitido' ? 'warn' : 'info'}">${b.status === 'Emitido' ? 'Boleto gerado, ainda não registrado no Banco do Brasil. Registre antes de enviar ao cliente.' : b.status === 'Registrado' ? 'Registrado no Banco do Brasil' + (b.registradoEm ? ' em ' + new Date(b.registradoEm).toLocaleString('pt-BR') : '') + '.' : 'Situação: ' + esc(b.status)}</div>
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap"><code class="k" style="font-size:14px;padding:6px 10px">${esc(b.linha)}</code><button class="sm" data-act="copyTxt" data-t="${esc(onlyDigits(b.linha))}">${ic('copy')}Copiar linha digitável</button><span class="spacer"></span>${b.status === 'Emitido' && Store.mode === 'server' ? `<button class="sm primary" data-act="registrarBB" data-id="${b.id}">Registrar no BB</button>` : ''}<button class="sm" data-act="baixarBoleto" data-id="${b.id}">${ic('down')}${Store.mode === 'server' || Store.mode === 'local' ? 'Imprimir / PDF' : 'Baixar boleto'}</button>${pode(S.user, 'discord') ? `<button class="sm" data-act="discordBoleto" data-id="${b.id}">${ic('send')}Discord</button>` : ''}</div>
  <div style="border:1px solid var(--line);border-radius:10px;padding:16px;overflow:auto">${htmlBoleto(b)}</div></div>`, 'wide');
}
function docBoleto(b) { return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Boleto ${esc(b.nossoNumero)}</title><style>${$('#appStyles').textContent}body{background:#fff;padding:20px}</style></head><body>${htmlBoleto(b)}</body></html>`; }

/* ---------- Conciliação bancária ---------- */
VIEWS.conciliacao = () => {
  const exts = L('extratos').sort((a, b) => (b.importadoEm || '').localeCompare(a.importadoEm || '')); if (!exts.some(e => e.id === S.f.ext)) S.f.ext = exts[0]?.id;
  const e = Store.get('extratos', S.f.ext); const fst = S.f.cst || 'pendente';
  const vendas = L('vendas'), bols = L('boletos');
  const txs = e ? e.transacoes.filter(t => fst === 'todas' || t.status === fst || (fst === 'pendente' && !t.status)) : [];
  const resumo = e ? { cred: soma(e.transacoes.filter(t => t.valor > 0), t => t.valor), conc: soma(e.transacoes.filter(t => t.status === 'conciliado'), t => t.valor), pend: e.transacoes.filter(t => (t.status || 'pendente') === 'pendente' && t.valor > 0).length } : null;
  const linha = t => {
    const sug = t.status === 'conciliado' || t.valor <= 0 ? [] : sugerirConciliacao(t, vendas, bols); const best = sug[0];
    const vinc = t.vinculo ? (() => { const v = Store.get('vendas', t.vinculo.vendaId); const p = v?.parcelas.find(x => x.id === t.vinculo.parcelaId); return `${esc(cliNome(v?.clienteId))} — ${esc(p ? p.tipo + ' ' + p.ref : '')}`; })() : '';
    return `<tr><td>${dataBR(t.data)}</td><td>${esc(t.memo || '—')}<small>${esc(t.doc || '')}</small></td><td class="num ${t.valor < 0 ? 'red' : 'green'}"><b>${brl(t.valor)}</b></td><td>${t.status === 'conciliado' ? `<span class="badge ok">${ic('check', 'icon')} ${vinc}</span>` : t.status === 'ignorado' ? badgeSit('ignorado') : t.valor <= 0 ? '<span class="muted">Débito</span>' : best ? `<select data-tx="${esc(t.fitid)}" class="sugSel">${sug.map(s => { const v = Store.get('vendas', s.vendaId), p = v.parcelas.find(x => x.id === s.parcelaId); return opt(s.vendaId + '|' + s.parcelaId, `${cliNome(v.clienteId)} · ${p.tipo} ${p.ref} · ${dataBR(p.venc)} · ${brl(s.saldo)} (${s.motivos.join(', ')})`, ''); }).join('')}</select>` : '<span class="muted">Sem sugestão</span>'}</td>
    <td class="actions">${t.status === 'conciliado' ? `<button class="sm" data-act="desconciliar" data-tx="${esc(t.fitid)}">Desfazer</button>` : t.status === 'ignorado' ? `<button class="sm" data-act="reativarTx" data-tx="${esc(t.fitid)}">Reativar</button>` : `${t.valor > 0 ? `${best ? `<button class="sm primary" data-act="conciliar" data-tx="${esc(t.fitid)}">Conciliar</button>` : ''}<button class="sm" data-act="concManual" data-tx="${esc(t.fitid)}">Escolher parcela</button>` : ''}<button class="sm ghost" data-act="ignorarTx" data-tx="${esc(t.fitid)}">Ignorar</button>`}</td></tr>`;
  };
  return `<div class="toolbar"><label class="grow">Extrato importado<select id="extSel">${exts.length ? exts.map(x => opt(x.id, `${dataBR((x.importadoEm || '').slice(0, 10))} · ${x.arquivo} · ${nomeFilial(x.filialId)} (${x.transacoes.length} lançamentos)`, S.f.ext)).join('') : opt('', 'Nenhum extrato importado', '')}</select></label><label>Mostrar<select id="cst">${[['pendente', 'Pendentes'], ['conciliado', 'Conciliados'], ['ignorado', 'Ignorados'], ['todas', 'Todos']].map(([a, b]) => opt(a, b, fst)).join('')}</select></label><button data-act="ofxExemplo">${ic('down')}OFX de exemplo</button><button class="primary" data-act="importarExtrato">${ic('upload')}Importar extrato (OFX/CSV)</button></div>
  ${e ? `<div class="kpis" style="grid-template-columns:repeat(4,1fr)"><div class="kpi bl"><span>Créditos no extrato</span><strong>${brl(resumo.cred)}</strong></div><div class="kpi bl"><span>Conciliado</span><strong class="green">${brl(resumo.conc)}</strong></div><div class="kpi hl"><span>Créditos pendentes</span><strong>${resumo.pend}</strong></div><div class="kpi"><span>Conta</span><strong style="font-size:16px">${esc(e.banco || '')} ${esc(e.conta || '')}</strong><small>${esc(e.arquivo)}</small></div></div>
  <div class="card"><div class="cardHead"><div><h2>Lançamentos</h2><p>As sugestões cruzam valor, nosso número do boleto, nome do cliente e data de vencimento.</p></div><div style="display:flex;gap:8px"><button class="accent" data-act="conciliarTudo">${ic('check')}Conciliar todas as sugestões fortes</button>${S.user.perfil === 'Administrador' ? `<button class="danger sm" data-act="delExtrato" data-id="${e.id}">Excluir extrato</button>` : ''}</div></div><div class="tableWrap"><table><thead><tr><th>Data</th><th>Histórico</th><th class="num">Valor</th><th>Vínculo / sugestão</th><th></th></tr></thead><tbody>${txs.map(linha).join('') || '<tr><td colspan="5" class="empty">Nada neste filtro.</td></tr>'}</tbody></table></div></div>` : `<div class="card"><div class="empty">Importe o extrato do banco em OFX (Banco do Brasil, Caixa, Itaú, etc.) ou CSV com colunas Data, Histórico e Valor.<br>As baixas conciliadas entram nas parcelas automaticamente.</div></div>`}`;
};
AFTER.conciliacao = () => { $('#extSel')?.addEventListener('change', e => { S.f.ext = e.target.value; renderView(); }); bindFilter('cst', 'cst'); };
async function conciliarTx(ext, t, vendaId, parcelaId) {
  const v = Store.get('vendas', vendaId), p = v?.parcelas.find(x => x.id === parcelaId); if (!p) throw Error('Parcela não encontrada.');
  const saldo = saldoParcela(p); const extra = Math.max(0, t.valor - saldo);
  await registrarPagamento(v, p, { valor: t.valor, data: t.data, juros: extra, obs: 'Conciliação: ' + (t.memo || ''), forma: 'Extrato', origem: 'conciliação', fitid: t.fitid });
  t.status = 'conciliado'; t.vinculo = { vendaId, parcelaId }; t.conciliadoPor = S.user.nome; t.conciliadoEm = new Date().toISOString();
}

/* ---------- Comissões ---------- */
VIEWS.comissoes = () => {
  const f = S.f, q = norm(f.kq); const K = ['ccor', 'kq', 'kst', 'kemp', 'kini', 'kfim'];
  const vendas = L('vendas').filter(v => vendaAtiva(v) && !v.comissaoExcluida && (!f.ccor || v.corretor === f.ccor) && (!f.kemp || loteDe(v).empId === f.kemp) && (!f.kini || (v.data || '') >= f.kini) && (!f.kfim || (v.data || '') <= f.kfim) && (!f.kst || (f.kst === 'Pendente' ? comissaoAPagar(v) > 0 : f.kst === 'Paga' ? comissaoSaldo(v) === 0 : f.kst === 'Suspensa' ? v.comissaoSuspensa && comissaoSaldo(v) > 0 : f.kst === 'Parcial' ? comissaoPaga(v) > 0 && comissaoSaldo(v) > 0 : true)) && (!q || norm(`${v.numero} ${cliNome(v.clienteId)} ${loteDesc(v.loteId)}`).includes(q)));
  const corretores = [...new Set(L('vendas').map(v => v.corretor).filter(Boolean))].sort();
  return `${filtroBox(`${fTxt('kq', 'Buscar', f.kq, 'Contrato, cliente ou lote')}${fSel('ccor', 'Corretor', [['', 'Todos'], ...corretores], f.ccor)}${fSel('kst', 'Situação', [['', 'Todas'], 'Pendente', 'Parcial', 'Paga', 'Suspensa'], f.kst)}${fDate('kini', 'Venda de', f.kini)}${fDate('kfim', 'até', f.kfim)}<span class="spacer"></span>${btnLimpar(K)}`)}
  <div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi bl"><span>Comissão total</span><strong>${brl(soma(vendas, comissaoTotal))}</strong></div><div class="kpi bl"><span>Pago</span><strong class="green">${brl(soma(vendas, comissaoPaga))}</strong></div><div class="kpi hl"><span>Saldo a pagar</span><strong>${brl(soma(vendas, comissaoAPagar))}</strong><small>${brl(soma(vendas.filter(v => v.comissaoSuspensa), comissaoSaldo))} suspenso por inadimplência</small></div></div>
  <div class="card"><div class="tableWrap"><table><thead><tr><th>Contrato</th><th>Corretor</th><th class="num">Venda</th><th class="num">%</th><th class="num">Comissão</th><th class="num">Pago</th><th class="num">Saldo</th><th></th></tr></thead><tbody>${vendas.map(v => `<tr><td><b>${esc(v.numero)}</b><small>${esc(cliNome(v.clienteId))} · ${esc(loteDesc(v.loteId))}</small></td><td>${esc(v.corretor || '—')}</td><td class="num">${brl(v.valor)}</td><td class="num">${esc(v.comissaoPct ?? 4)}%</td><td class="num">${brl(comissaoTotal(v))}</td><td class="num green">${brl(comissaoPaga(v))}</td><td class="num"><b>${brl(comissaoSaldo(v))}</b></td><td class="actions">${v.comissaoSuspensa && comissaoSaldo(v) > 0 ? `<span class="badge bad">Suspensa</span> ` : ''}${['Administrador', 'Gerente', 'Financeiro'].includes(S.user.perfil) && comissaoSaldo(v) > 0 ? `<button class="sm ghost" data-act="suspComissao" data-id="${v.id}">${v.comissaoSuspensa ? 'Reativar' : 'Suspender'}</button>` : ''}${comissaoSaldo(v) > 0 ? `<button class="sm" data-act="pagarComissao" data-id="${v.id}">Pagar</button>` : badgeSit('Pago')}</td></tr>`).join('') || '<tr><td colspan="8" class="empty">Nenhuma comissão neste filtro.</td></tr>'}</tbody></table></div></div>`;
};
AFTER.comissoes = () => bindAll(['kq'], ['ccor', 'kst', 'kemp', 'kini', 'kfim']);

/* ---------- Discord ---------- */
const MODELOS_DISCORD = {
  'Resumo financeiro do dia': () => { const vs = L('vendas').filter(vendaAtiva), ref = hoje(); const ps = vs.flatMap(v => v.parcelas || []); const rec = soma(ps, p => soma((p.pagamentos || []).filter(q => q.data === ref), q => q.valor)); const venceHoje = ps.filter(p => p.venc === ref && saldoParcela(p) > 0); const venc = vs.flatMap(v => vencidasVenda(v)); return `📊 **Resumo TRAXUP — ${dataBR(ref)}**${S.filial !== '*' ? ' · ' + nomeFilial(S.filial) : ''}\n\n💰 Recebido hoje: **${brl(rec)}**\n📅 Vencendo hoje: **${venceHoje.length}** parcela(s) · ${brl(soma(venceHoje, saldoParcela))}\n⚠️ Total vencido: **${brl(soma(venc, saldoParcela))}** em ${venc.length} parcela(s)\n🏡 Lotes disponíveis: **${L('lotes').filter(l => l.status === 'Disponível').length}**`; },
  'Lista de inadimplentes': () => { const rows = L('vendas').filter(vendaAtiva).map(v => ({ v, val: soma(vencidasVenda(v), saldoParcela), n: vencidasVenda(v).length })).filter(x => x.n).sort((a, b) => b.val - a.val); return `🚨 **Contratos com parcelas vencidas — ${dataBR(hoje())}**\n\n${rows.map((x, i) => `${i + 1}. **${cliNome(x.v.clienteId)}** — ${loteDesc(x.v.loteId)} · ${x.n} parcela(s) · ${brl(x.val)} · ${situacaoVenda(x.v)}`).join('\n') || 'Nenhum contrato em atraso. ✅'}\n\nTotal: **${brl(soma(rows, x => x.val))}**`; },
  'Parcelas que vencem hoje': () => { const ref = hoje(); const rows = L('vendas').filter(vendaAtiva).flatMap(v => (v.parcelas || []).filter(p => p.venc === ref && saldoParcela(p) > 0).map(p => ({ v, p }))); return `📅 **Vencimentos de hoje (${dataBR(ref)})**\n\n${rows.map(x => `• ${cliNome(x.v.clienteId)} — ${x.p.tipo} ${x.p.ref} · ${brl(saldoParcela(x.p))}`).join('\n') || 'Nenhuma parcela vence hoje.'}`; },
  'Lotes disponíveis': () => { const ls = L('lotes').filter(l => l.status === 'Disponível'); return `🏡 **Lotes disponíveis (${ls.length})**\n\n${ls.slice(0, 40).map(l => `• ${loteDesc(l.id)} — ${l.area ? l.area + ' m² · ' : ''}${brl(l.preco)}`).join('\n')}${ls.length > 40 ? `\n… e mais ${ls.length - 40}` : ''}`; },
  'Cobrança de cliente (venda selecionada)': () => '⚠️ **Aviso de parcela em atraso**\n\nCliente: **{{cliente.nome}}**\nLote: {{lote.empreendimento}} — Quadra {{lote.quadra}}, Lote {{lote.numero}}\nContrato: {{venda.numero}}\n\nRegularize o pagamento para evitar encargos adicionais. Em caso de dúvida, fale com o financeiro.',
  'Nova venda (venda selecionada)': () => '🎉 **Nova venda fechada!**\n\nLote **{{lote.empreendimento}} — Q{{lote.quadra}} L{{lote.numero}}**\nCliente: {{cliente.nome}}\nValor: **{{venda.valor}}**\nCorretor: {{venda.corretor}}',
  'Mensagem livre': () => ''
};
VIEWS.discord = () => {
  const hooks = L('webhooks'); const log = (Store.get('logs', 'discord')?.itens || []).filter(x => S.filial === '*' || x.filialId === S.filial).slice(0, 30);
  const vendas = L('vendas').sort((a, b) => cliNome(a.clienteId).localeCompare(cliNome(b.clienteId), 'pt-BR'));
  const salvos = L('modelos').filter(m => m.tipo === 'discord');
  const d = S.discord ||= { modelo: 'Resumo financeiro do dia', texto: MODELOS_DISCORD['Resumo financeiro do dia'](), venda: '' };
  const preview = d.venda ? renderModelo(d.texto, contextoVenda(Store.get('vendas', d.venda)), { html: false }) : d.texto;
  return `${Store.mode !== 'server' ? `<div class="notice warn"><b>Envio direto ao Discord:</b> disponível quando o sistema roda no servidor TRAXUP (VPS), que faz a chamada ao webhook. Nesta visualização você monta a mensagem e usa <b>Copiar</b> para colar no canal.</div>` : ''}
  <div class="two"><div class="card"><div class="cardHead"><div><h2>Compor mensagem</h2><p>Use modelos prontos ou escreva a sua. Variáveis <code class="k">{{cliente.nome}}</code> usam a venda selecionada.</p></div></div><div class="cardBody"><div class="formGrid" style="grid-template-columns:1fr 1fr">
  <label>Modelo<select id="dModelo">${[...Object.keys(MODELOS_DISCORD), ...salvos.map(m => 'salvo:' + m.id)].map(k => opt(k, k.startsWith('salvo:') ? '★ ' + (Store.get('modelos', k.slice(6))?.nome) : k, d.modelo)).join('')}</select></label>
  <label>Venda (para variáveis)<select id="dVenda">${opt('', '—', d.venda)}${vendas.map(v => opt(v.id, `${cliNome(v.clienteId)} · ${loteNome(Store.get('lotes', v.loteId))}`, d.venda)).join('')}</select></label>
  <label class="c4" style="grid-column:1/-1">Mensagem (Markdown do Discord)<textarea id="dTexto" rows="11">${esc(d.texto)}</textarea></label>
  <label style="grid-column:1/-1">Enviar para<div style="display:flex;flex-wrap:wrap;gap:12px;padding:6px 0">${hooks.map(h => `<label class="check"><input type="checkbox" class="dHook" value="${h.id}" checked> ${esc(h.nome)} <span class="muted">(${esc(nomeFilial(h.filialId))})</span></label>`).join('') || '<span class="muted">Nenhum canal cadastrado — adicione um webhook ao lado.</span>'}</div></label></div>
  <div class="formActions"><button data-act="salvarModeloDiscord">Salvar como modelo</button><button data-act="copyDiscord">${ic('copy')}Copiar</button><button class="accent" data-act="enviarDiscord" ${Store.mode !== 'server' || !hooks.length ? 'disabled' : ''}>${ic('send')}Enviar ao Discord</button></div></div></div>
  <div><div class="card"><div class="cardHead"><h2>Pré-visualização</h2><span class="muted" style="font-size:12px">${preview.length}/2000 caracteres${preview.length > 2000 ? ' — será dividida' : ''}</span></div><div class="cardBody"><div class="discordPreview"><div class="dName">TRAXUP Imobiliário <span class="badge blue" style="font-size:10px">BOT</span></div>${discordMd(preview)}</div></div></div>
  <div class="card"><div class="cardHead"><h2>Canais (webhooks)</h2><button class="sm primary" data-act="editHook">${ic('plus')}Adicionar</button></div><div class="cardBody">${hooks.length ? `<div class="list">${hooks.map(h => `<div class="listRow"><span><b>${esc(h.nome)}</b><br><small class="muted">${esc(nomeFilial(h.filialId))} · …${esc(String(h.url).slice(-10))}</small></span><span><button class="sm" data-act="editHook" data-id="${h.id}">Editar</button></span></div>`).join('')}</div>` : '<p class="hint">No Discord: Configurações do canal → Integrações → Webhooks → Novo webhook → Copiar URL. Cole a URL aqui.</p>'}</div></div></div></div>
  <div class="card"><div class="cardHead"><h2>Histórico de envios</h2></div><div class="tableWrap"><table><thead><tr><th>Data</th><th>Canal</th><th>Mensagem</th><th>Resultado</th></tr></thead><tbody>${log.map(x => `<tr><td>${new Date(x.data).toLocaleString('pt-BR')}</td><td>${esc(x.canal)}</td><td>${esc(String(x.texto).slice(0, 90))}${String(x.texto).length > 90 ? '…' : ''}</td><td>${x.ok ? '<span class="badge ok">Enviado</span>' : `<span class="badge bad" title="${esc(x.erro || '')}">Falhou</span>`}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Nenhum envio ainda.</td></tr>'}</tbody></table></div></div>`;
};
const discordMd = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/__(.+?)__/g, '<u>$1</u>').replace(/\*(.+?)\*/g, '<i>$1</i>');
AFTER.discord = () => {
  const d = S.discord; const rer = () => { const pos = $('#dTexto').selectionStart; renderView(); const n = $('#dTexto'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } };
  $('#dModelo').addEventListener('change', e => { d.modelo = e.target.value; d.texto = d.modelo.startsWith('salvo:') ? (Store.get('modelos', d.modelo.slice(6))?.conteudo || '') : MODELOS_DISCORD[d.modelo](); renderView(); });
  $('#dVenda').addEventListener('change', e => { d.venda = e.target.value; renderView(); });
  $('#dTexto').addEventListener('input', e => { d.texto = e.target.value; clearTimeout(AFTER.dt); AFTER.dt = setTimeout(rer, 400); });
};
function partesDiscord(t) { const out = []; let s = String(t); while (s.length > 1990) { let cut = s.lastIndexOf('\n', 1990); if (cut < 1000) cut = 1990; out.push(s.slice(0, cut)); s = s.slice(cut).replace(/^\n/, ''); } if (s.trim()) out.push(s); return out; }
async function enviarDiscord(texto, hookIds) {
  const hooks = hookIds.map(id => Store.get('webhooks', id)).filter(Boolean); if (!hooks.length) throw Error('Selecione pelo menos um canal.'); if (!texto.trim()) throw Error('A mensagem está vazia.');
  const logDoc = Store.get('logs', 'discord') || { id: 'discord', itens: [] }; let ok = 0;
  for (const h of hooks) {
    let erro = ''; try { for (const parte of partesDiscord(texto)) { const r = await fetch('api/discord', { method: 'POST', headers: { 'Content-Type': 'application/json', ...Store.authH() }, body: JSON.stringify({ webhookId: h.id, content: parte }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(j.error || 'Falha no envio'); } ok++; } catch (e) { erro = e.message; }
    logDoc.itens = [{ data: new Date().toISOString(), canal: h.nome, filialId: h.filialId, texto, ok: !erro, erro, usuario: S.user.nome }, ...(logDoc.itens || [])].slice(0, 150);
  }
  await Store.put('logs', logDoc); return { ok, total: hooks.length };
}
function abrirDiscordCom(texto, vendaId = '') { S.discord = { modelo: 'Mensagem livre', texto, venda: vendaId }; S.view = 'discord'; render(); }

/* ---------- Modelos de contrato ---------- */
VIEWS.modelos = () => {
  const ms = L('modelos').filter(m => m.tipo === 'contrato'); if (!ms.some(m => m.id === S.f.mod)) S.f.mod = ms[0]?.id; const m = Store.get('modelos', S.f.mod);
  const vendas = L('vendas'); const vSel = Store.get('vendas', S.f.modVenda);
  const grupos = {}; VARIAVEIS.forEach(k => { const g = k.split('.')[0]; (grupos[g] ||= []).push(k); });
  return `<div class="toolbar"><label class="grow">Modelo<select id="modSel">${ms.map(x => opt(x.id, x.nome + ' · ' + nomeFilial(x.filialId), S.f.mod)).join('') || opt('', 'Nenhum modelo', '')}</select></label><button data-act="novoModelo">${ic('plus')}Novo modelo</button><label style="min-width:0"><span style="display:inline-flex;gap:6px;align-items:center;border:1px solid var(--line);background:#fff;border-radius:9px;padding:8px 13px;cursor:pointer;color:var(--text);font-size:14px;font-weight:500">${ic('upload')}Importar modelo da empresa (.docx, .txt, .html)</span><input type="file" id="modFile" accept=".docx,.txt,.html,.htm,.md" hidden></label></div>
  ${m ? `<div class="two"><div class="card"><div class="cardHead"><div><h2>Editar modelo</h2><p>Escreva o contrato com as variáveis entre chaves duplas. Clique numa variável para inseri-la no cursor.</p></div></div><div class="cardBody"><div class="formGrid" style="grid-template-columns:2fr 1fr"><label>Nome do modelo<input id="modNome" value="${esc(m.nome)}"></label><label>Filial${sel('modFil', filiaisUsuario().map(f => [f.id, f.nome]), m.filialId, 'id="modFil"')}</label></div>
  <label style="margin-top:12px">Texto do contrato<textarea id="modTexto" rows="22" style="font-family:'Times New Roman',serif;font-size:14px;line-height:1.5">${esc(m.conteudo)}</textarea></label>
  <details style="margin-top:12px" open><summary class="muted" style="cursor:pointer;font-size:13px">Substituir texto do modelo original por variável</summary><div class="formGrid" style="grid-template-columns:2fr 2fr auto;margin-top:8px;align-items:end"><label>Texto existente (ex.: nome do comprador do modelo)<input id="subDe" placeholder="FULANO DE TAL"></label><label>Trocar por${sel('subPara', VARIAVEIS, 'cliente.nome', 'id="subPara"')}</label><button class="sm" data-act="substituirVar">Substituir todos</button></div></details>
  <div class="formActions">${S.user.perfil === 'Administrador' ? `<button class="danger" data-act="delModelo" data-id="${m.id}">Excluir</button><span class="spacer"></span>` : ''}<button class="primary" data-act="salvarModelo">Salvar modelo</button></div></div></div>
  <div><div class="card"><div class="cardHead"><h2>Variáveis</h2></div><div class="cardBody">${Object.entries(grupos).map(([g, ks]) => `<div style="margin-bottom:8px"><b style="font-size:12px;text-transform:uppercase;color:var(--muted)">${g}</b><div class="varPalette">${ks.map(k => `<button data-act="insVar" data-k="${k}">${k}</button>`).join('')}</div></div>`).join('')}</div></div>
  <div class="card"><div class="cardHead"><h2>Gerar contrato</h2></div><div class="cardBody"><label>Venda<select id="modVenda">${opt('', 'Selecione a venda…', S.f.modVenda)}${vendas.map(v => opt(v.id, `${v.numero} · ${cliNome(v.clienteId)} · ${loteNome(Store.get('lotes', v.loteId))}`, S.f.modVenda)).join('')}</select></label><div class="formActions" style="justify-content:flex-start"><button class="accent" data-act="previewContrato" ${vSel ? '' : 'disabled'}>Visualizar contrato preenchido</button></div></div></div></div></div>`
      : `<div class="card"><div class="empty">Crie um modelo ou importe o modelo de contrato da empresa.</div></div>`}`;
};
AFTER.modelos = () => {
  $('#modSel')?.addEventListener('change', e => { S.f.mod = e.target.value; renderView(); }); $('#modVenda')?.addEventListener('change', e => { S.f.modVenda = e.target.value; renderView(); });
  $('#modFile')?.addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; try { const texto = await lerModelo(f); const m = await Store.put('modelos', { tipo: 'contrato', nome: f.name.replace(/\.\w+$/, ''), filialId: filialPadrao(), conteudo: texto, criadoEm: new Date().toISOString() }); S.f.mod = m.id; toast('Modelo importado. Agora troque os dados fixos por variáveis.'); renderView(); } catch (err) { toast(err.message, true); } });
};
async function lerModelo(f) {
  if (/\.docx$/i.test(f.name)) {
    if (!window.JSZip) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = res; s.onerror = () => rej(Error('Não foi possível carregar o leitor de .docx. Salve o modelo como .txt e importe.')); document.head.append(s); });
    const zip = await window.JSZip.loadAsync(await f.arrayBuffer()); const xml = await zip.file('word/document.xml')?.async('string'); if (!xml) throw Error('Arquivo .docx inválido.');
    const doc = new DOMParser().parseFromString(xml, 'application/xml'); const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    return [...doc.getElementsByTagNameNS(W, 'p')].map(p => { let t = ''; for (const n of p.getElementsByTagNameNS(W, '*')) { if (n.localName === 't') t += n.textContent; else if (n.localName === 'tab') t += '\t'; else if (n.localName === 'br') t += '\n'; } return t; }).join('\n').replace(/\n{3,}/g, '\n\n');
  }
  const t = await f.text(); if (/\.html?$/i.test(f.name)) { const d = new DOMParser().parseFromString(t, 'text/html'); return d.body.innerText || d.body.textContent; } return t;
}
function docContrato(v, m) { const ctx = contextoVenda(v); const corpo = renderModelo(m.conteudo, ctx, { html: true }).replace(/\n/g, '<br>'); return { corpo, doc: `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>Contrato ${esc(v.numero)}</title><style>body{font-family:'Times New Roman';font-size:12pt;line-height:1.5}table{border-collapse:collapse}td,th{border:1px solid #888;padding:3px 6px;font-size:10pt}</style></head><body>${corpo.replace(/<span style="background:#FFF3D6">/g, '<span style="background:yellow">')}</body></html>` }; }
function previewContrato(vid, mid) {
  const v = Store.get('vendas', vid), m = Store.get('modelos', mid); if (!v || !m) return; const { corpo } = docContrato(v, m); const faltas = (corpo.match(/background:#FFF3D6/g) || []).length;
  modal(`${mHead(m.nome, 'Contrato ' + v.numero + ' — ' + cliNome(v.clienteId))}<div class="modalBody">${faltas ? `<div class="notice warn">${faltas} campo(s) sem informação, destacados em amarelo. Complete o cadastro do cliente/lote ou edite depois no Word.</div>` : ''}<div class="docPreview">${corpo}</div><div class="formActions"><button data-act="copyContrato" data-v="${vid}" data-m="${mid}">${ic('copy')}Copiar texto</button><button class="primary" data-act="baixarContrato" data-v="${vid}" data-m="${mid}">${ic('down')}Baixar para Word (.doc)</button></div></div>`, 'wide');
}

/* ---------- Usuários ---------- */
VIEWS.usuarios = () => {
  const us = Store.list('usuarios').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  return `<div class="toolbar"><p class="hint grow">Perfis: <b>Administrador</b> (tudo), <b>Gerente</b> (tudo menos usuários e filiais), <b>Financeiro</b> (parcelas, boletos, conciliação, comissões), <b>Comercial</b> (mapa, lotes, clientes, vendas, contratos) e <b>Corretor</b> (mapa, lotes e clientes).</p><button class="primary" data-act="editUser">${ic('plus')}Novo usuário</button></div>
  <div class="card"><div class="tableWrap"><table><thead><tr><th>Nome</th><th>Login</th><th>Perfil</th><th>Filiais</th><th>Situação</th><th>Último acesso</th><th></th></tr></thead><tbody>${us.map(u => `<tr><td><b>${esc(u.nome)}</b><small>${esc(u.email || '')}</small></td><td>${esc(u.login)}</td><td><span class="badge blue">${esc(u.perfil)}</span></td><td>${(u.filiais || []).includes('*') || u.perfil === 'Administrador' ? 'Todas' : (u.filiais || []).map(nomeFilial).join(', ') || '—'}</td><td>${u.ativo === false ? '<span class="badge">Inativo</span>' : '<span class="badge ok">Ativo</span>'}</td><td>${u.ultimoAcesso ? new Date(u.ultimoAcesso).toLocaleString('pt-BR') : '—'}</td><td class="actions"><button class="sm" data-act="editUser" data-id="${u.id}">Editar</button></td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><div class="cardHead"><h2>Auditoria recente</h2></div><div class="tableWrap"><table><tbody>${(Store.get('logs', 'auditoria')?.itens || []).slice(0, 25).map(a => `<tr><td style="width:180px">${new Date(a.data).toLocaleString('pt-BR')}</td><td style="width:160px">${esc(a.usuario || '')}</td><td>${esc(a.acao)}</td></tr>`).join('') || '<tr><td class="empty">Sem registros.</td></tr>'}</tbody></table></div></div>`;
};
function formUser(u) {
  u = u || { perfil: 'Comercial', filiais: [filialPadrao()].filter(Boolean), ativo: true }; const fs = Store.list('filiais');
  modal(`${mHead('Usuário', u.id ? u.nome : 'Novo usuário')}<form class="modalBody" data-form="user" data-id="${u.id || ''}"><div class="formGrid" style="grid-template-columns:1fr 1fr">
  <label>Nome<input name="nome" required value="${esc(u.nome || '')}"></label><label>E-mail<input name="email" type="email" value="${esc(u.email || '')}"></label><label>Login<input name="login" required value="${esc(u.login || '')}" autocomplete="off"></label><label>${u.id ? 'Nova senha (deixe em branco para manter)' : 'Senha (mín. 6)'}<input name="senha" type="password" minlength="6" ${u.id ? '' : 'required'} autocomplete="new-password"></label>
  <label>Perfil${sel('perfil', Object.keys(PERFIS), u.perfil)}</label><label>Situação${sel('ativo', [['1', 'Ativo'], ['0', 'Inativo']], u.ativo === false ? '0' : '1')}</label>
  <div style="grid-column:1/-1"><div class="muted" style="font-size:13px;margin-bottom:6px">Filiais com acesso</div><div style="display:flex;flex-wrap:wrap;gap:14px"><label class="check"><input type="checkbox" name="fil_*" ${(u.filiais || []).includes('*') ? 'checked' : ''}> Todas as filiais</label>${fs.map(f => `<label class="check"><input type="checkbox" name="fil_${f.id}" ${(u.filiais || []).includes(f.id) ? 'checked' : ''}> ${esc(f.nome)}</label>`).join('')}</div></div></div>
  <div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Salvar usuário</button></div></form>`);
}

/* ---------- Filiais e empreendimentos ---------- */
VIEWS.filiais = () => {
  const fs = Store.list('filiais').sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  return `<div class="card"><div class="cardHead"><div><h2>Filiais</h2><p>Cada filial tem seus lotes, clientes, vendas e conta do Banco do Brasil.</p></div><button class="primary" data-act="editFilial">${ic('plus')}Nova filial</button></div><div class="tableWrap"><table><thead><tr><th>Filial</th><th>CNPJ</th><th>Cidade</th><th>Banco do Brasil</th><th class="num">Lotes</th><th class="num">Vendas</th><th></th></tr></thead><tbody>${fs.map(f => `<tr><td><b>${esc(f.nome)}</b><small>${esc(f.razao || '')}</small></td><td>${esc(fmtCPF(f.cnpj))}</td><td>${esc(f.cidade || '')}${f.uf ? '/' + esc(f.uf) : ''}</td><td>${f.bb?.convenio ? `Ag ${esc(f.bb.agencia)} · CC ${esc(f.bb.conta)}<small>Convênio ${esc(f.bb.convenio)} · Cart. ${esc(f.bb.carteira || '17')}</small>` : '<span class="badge warn">Não configurado</span>'}</td><td class="num">${Store.list('lotes').filter(l => l.filialId === f.id).length}</td><td class="num">${Store.list('vendas').filter(v => v.filialId === f.id).length}</td><td class="actions"><button class="sm" data-act="editFilial" data-id="${f.id}">Editar</button></td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><div class="cardHead"><div><h2>Empreendimentos</h2><p>Loteamentos de cada filial. Os lotes e o mapa são organizados por empreendimento.</p></div><button class="primary" data-act="editEmp">${ic('plus')}Novo empreendimento</button></div><div class="tableWrap"><table><thead><tr><th>Empreendimento</th><th>Filial</th><th>Cidade</th><th class="num">Lotes</th><th class="num">Disponíveis</th><th></th></tr></thead><tbody>${L('empreendimentos').map(e => { const ls = Store.list('lotes').filter(l => l.empId === e.id); return `<tr><td><b>${esc(e.nome)}</b></td><td>${esc(nomeFilial(e.filialId))}</td><td>${esc(e.cidade || '')}</td><td class="num">${ls.length}</td><td class="num">${ls.filter(l => l.status === 'Disponível').length}</td><td class="actions"><button class="sm" data-act="editEmp" data-id="${e.id}">Editar</button>${['Administrador', 'Gerente'].includes(S.user.perfil) ? `<button class="sm danger" data-act="delEmp" data-id="${e.id}">Excluir</button>` : ''}</td></tr>`; }).join('') || '<tr><td colspan="6" class="empty">Nenhum empreendimento.</td></tr>'}</tbody></table></div></div>`;
};
function formFilial(f) {
  f = f || { multa: 2, jurosMes: 1, bb: { carteira: '17', variacao: '35' } }; const bb = f.bb || {};
  modal(`${mHead('Filial', f.id ? f.nome : 'Nova filial')}<form class="modalBody" data-form="filial" data-id="${f.id || ''}"><div class="formGrid"><div class="formSection">Dados da filial</div>
  <label class="c2">Nome da filial<input name="nome" required value="${esc(f.nome || '')}"></label><label class="c2">Razão social<input name="razao" value="${esc(f.razao || '')}"></label><label>CNPJ<input name="cnpj" value="${esc(f.cnpj || '')}"></label><label>Telefone<input name="telefone" value="${esc(f.telefone || '')}"></label><label>Cidade<input name="cidade" value="${esc(f.cidade || '')}"></label><label>UF<input name="uf" maxlength="2" value="${esc(f.uf || '')}"></label><label class="c4">Endereço<input name="endereco" value="${esc(f.endereco || '')}"></label>
  <div class="formSection">Banco do Brasil — cobrança</div><label>Agência<input name="bb_agencia" value="${esc(bb.agencia || '')}"></label><label>Conta corrente<input name="bb_conta" value="${esc(bb.conta || '')}"></label><label>Convênio (7 dígitos)<input name="bb_convenio" maxlength="7" pattern="\\d{7}" value="${esc(bb.convenio || '')}"></label><label>Carteira / variação<div style="display:flex;gap:6px"><input name="bb_carteira" value="${esc(bb.carteira || '17')}"><input name="bb_variacao" value="${esc(bb.variacao || '35')}"></div></label>
  <label class="c2">Beneficiário (nome no boleto)<input name="bb_beneficiario" value="${esc(bb.beneficiario || '')}"></label><label>CNPJ do beneficiário<input name="bb_cnpj" value="${esc(bb.cnpj || '')}"></label><label>Multa após venc. (%)<input name="multa" value="${esc(f.multa ?? 2)}"></label><label>Juros ao mês (%)<input name="jurosMes" value="${esc(f.jurosMes ?? 1)}"></label>
  <p class="hint c4">As credenciais da API do BB (client_id, client_secret e developer key) ficam só no arquivo <code class="k">.env</code> do servidor, nunca no sistema.</p></div>
  <div class="formActions">${f.id && !['lotes', 'clientes', 'vendas', 'empreendimentos', 'boletos'].some(c => Store.list(c).some(o => o.filialId === f.id)) && Store.list('filiais').length > 1 ? `<button type="button" class="danger" data-act="delFilial" data-id="${f.id}">Excluir filial vazia</button><span class="spacer"></span>` : ''}<button type="button" data-act="closeModal">Cancelar</button><button class="primary">Salvar filial</button></div></form>`, 'wide');
}
function formEmp(e) {
  e = e || { filialId: filialPadrao() };
  modal(`${mHead('Empreendimento', e.id ? e.nome : 'Novo empreendimento')}<form class="modalBody" data-form="emp" data-id="${e.id || ''}"><div class="formGrid" style="grid-template-columns:1fr 1fr"><label>Nome<input name="nome" required value="${esc(e.nome || '')}"></label><label>Filial${sel('filialId', filiaisUsuario().map(f => [f.id, f.nome]), e.filialId)}</label><label>Cidade<input name="cidade" value="${esc(e.cidade || '')}"></label><label>Matrícula-mãe / registro<input name="registro" value="${esc(e.registro || '')}"></label><label style="grid-column:1/-1">Descrição<textarea name="descricao" rows="2">${esc(e.descricao || '')}</textarea></label></div><div class="formActions">${e.id && ['Administrador', 'Gerente'].includes(S.user.perfil) ? `<button type="button" class="danger" data-act="delEmp" data-id="${e.id}">Excluir empreendimento</button><span class="spacer"></span>` : ''}<button type="button" data-act="closeModal">Cancelar</button><button class="primary">Salvar</button></div></form>`);
}

/* ---------- Configurações ---------- */
VIEWS.config = () => `<div class="two"><div class="card"><div class="cardHead"><h2>Minha conta</h2></div><form class="cardBody" data-form="minhaSenha"><div class="formGrid" style="grid-template-columns:1fr 1fr"><label>Senha atual<input type="password" name="atual" required autocomplete="current-password"></label><label>Nova senha<input type="password" name="nova" minlength="6" required autocomplete="new-password"></label></div><div class="formActions"><button class="primary">Alterar senha</button></div></form></div>
  <div class="card"><div class="cardHead"><h2>Armazenamento</h2></div><div class="cardBody"><p class="hint">Modo atual: <b>${esc(Store.label())}</b>.</p>${Store.mode === 'local' ? '<div class="notice warn" style="margin-top:10px">Os dados estão só neste navegador. Para uso real, implante o servidor TRAXUP no VPS (veja o README do repositório).</div>' : ''}${Store.mode === 'db' ? '<div class="notice info" style="margin-top:10px">Os dados ficam na base do artefato, compartilhada com quem tiver acesso a ele. Para o Discord e o registro de boletos no BB, rode o servidor TRAXUP.</div>' : ''}</div></div></div>
  ${S.user.perfil === 'Administrador' ? `<div class="card"><div class="cardHead"><div><h2>Backup e dados</h2><p>Exporte tudo em JSON para guardar ou migrar para o servidor TRAXUP.</p></div></div><div class="cardBody" style="display:flex;gap:10px;flex-wrap:wrap"><button data-act="backup">${ic('down')}Exportar backup (JSON)</button><label style="min-width:0"><span style="display:inline-flex;gap:6px;align-items:center;border:1px solid var(--line);background:#fff;border-radius:9px;padding:8px 13px;cursor:pointer;color:var(--text);font-size:14px;font-weight:500">${ic('upload')}Restaurar backup / importar do Vico (.json ou .sql)</span><input type="file" id="restoreFile" accept=".json,.sql,.txt,application/json,application/sql,text/plain" hidden></label><button data-act="demo">Carregar dados de demonstração</button>${dadosDemo().total ? `<button class="danger" data-act="removerDemo">Remover dados de demonstração (${dadosDemo().total})</button>` : ''}</div></div>` : ''}`;
AFTER.config = () => { $('#restoreFile')?.addEventListener('change', async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { await restaurarArquivo(f); } catch (err) { toast(err.message || 'Arquivo de backup inválido.', true); } }); };
async function restaurarArquivo(f) {
  const txt = await f.text(); let dados, titulo;
  if (/\.sql$/i.test(f.name) || /^\s*--\s*Vico/i.test(txt.slice(0, 200)) || /INSERT INTO records/.test(txt.slice(0, 5000))) {
    const r = converterVico(txt, [], f.name); dados = r.dados; const x = r.resumo;
    titulo = `Backup do <b>Vico</b> reconhecido: ${x.filiais} empresas (viram filiais), ${x.lotes} lotes, ${x.vendas} vendas, ${x.clientes} clientes, ${x.parcelas.toLocaleString('pt-BR')} parcelas, ${x.pagamentos} pagamentos e ${x.comissoes} comissões pagas.<br><br>Importar agora? Registros já importados antes são atualizados, sem duplicar.`;
  } else {
    let j; try { j = JSON.parse(txt); } catch (e) { throw Error('Arquivo inválido. Use o backup do TRAXUP (.json) ou do Vico (.sql).'); }
    dados = {}; for (const c of COLS) dados[c] = j[c] || {}; const n = COLS.reduce((t, c) => t + Object.keys(dados[c]).length, 0);
    if (!n) throw Error('O arquivo não tem registros do TRAXUP.');
    titulo = `Restaurar <b>${n}</b> registros deste backup? Registros com o mesmo código são substituídos.`;
  }
  confirmar(titulo, async () => {
    const itens = COLS.flatMap(c => Object.values(dados[c] || {}).filter(o => !(c === 'usuarios' && Store.mode === 'server' && !o.hash)).map(o => [c, o]));
    modal(`${mHead('Importação', 'Gravando registros…')}<div class="modalBody"><div class="meter"><i id="impBar" style="width:0%"></i></div><p class="hint" id="impTxt" style="margin-top:10px">0 de ${itens.length}</p></div>`, 'narrow');
    let n = 0; for (const [c, o] of itens) { await Store.put(c, o); n++; if (n % 10 === 0 || n === itens.length) { const b = $('#impBar'), t = $('#impTxt'); if (b) b.style.width = (n / itens.length * 100) + '%'; if (t) t.textContent = `${n} de ${itens.length}`; } }
    closeModal(); await audit(`Importou backup ${f.name} (${n} registros)`); toast(n + ' registros importados.'); S.filial = '*'; render();
  }, 'Importar');
}

/* ---------- dados de demonstração ---------- */
function dadosDemo() {
  const emps = Store.list('empreendimentos').filter(e => e.demo || e.nome === 'Residencial Vale do São Francisco'); const eIds = new Set(emps.map(e => e.id));
  const lotes = Store.list('lotes').filter(l => l.demo || eIds.has(l.empId)); const lIds = new Set(lotes.map(l => l.id));
  const vendas = Store.list('vendas').filter(v => v.demo || lIds.has(v.loteId) || (v.historico || []).some(h => h.usuario === 'Demonstração')); const vIds = new Set(vendas.map(v => v.id));
  const clientes = Store.list('clientes').filter(c => (c.demo || /@exemplo\.com\.br$/i.test(c.email || '')) && !Store.list('vendas').some(v => v.clienteId === c.id && !vIds.has(v.id)));
  const boletos = Store.list('boletos').filter(b => vIds.has(b.vendaId)); const plantas = Store.list('plantas').filter(p => eIds.has(p.id));
  return { emps, lotes, vendas, clientes, boletos, plantas, total: emps.length + lotes.length + vendas.length + clientes.length };
}
async function carregarDemo(filialId) {
  const nomes = ['Maria José da Silva', 'Antônio Carlos Ferreira', 'Francisca Oliveira Santos', 'José Ribeiro Neto', 'Ana Paula Cavalcanti', 'Luiz Henrique Barros', 'Patrícia Gomes de Sá', 'Roberto Alves Coelho'];
  const fil = Store.get('filiais', filialId);
  if (fil && !fil.bb?.convenio) { fil.bb = { ...(fil.bb || {}), agencia: '0123-4', conta: '45678-9', convenio: '1234567', carteira: '17', variacao: '35', beneficiario: fil.razao || fil.nome }; await Store.put('filiais', fil); }
  const emp = await Store.put('empreendimentos', { filialId, nome: 'Residencial Vale do São Francisco', cidade: fil?.cidade || 'Petrolina', demo: true });
  const lotes = []; for (const q of ['A', 'B', 'C', 'D']) for (let n = 1; n <= 12; n++) lotes.push(await Store.put('lotes', { filialId, empId: emp.id, quadra: q, numero: String(n), area: 250 + (n % 3) * 25, frente: 10, fundo: 25 + (n % 3) * 2.5, preco: (78000 + (n % 4) * 4500 + (q.charCodeAt(0) - 65) * 3000) * 100, custo: 41000 * 100, status: (q === 'D' && n > 10) ? 'Bloqueado' : 'Disponível', demo: true }));
  const clientes = []; for (const [i, nome] of nomes.entries()) clientes.push(await Store.put('clientes', { filialId, nome, cpf: String(10000000000 + i * 1234567891).slice(0, 11), nacionalidade: 'brasileira', estadoCivil: i % 2 ? 'casado(a)' : 'solteiro(a)', profissao: ['comerciante', 'professora', 'agricultor', 'enfermeira', 'servidor público', 'motorista', 'empresária', 'engenheiro'][i], whatsapp: '(87) 9 9' + String(1000 + i * 137).padStart(4, '0') + '-' + String(2000 + i * 71).slice(0, 4), email: norm(nome.split(' ')[0]) + '@exemplo.com.br', logradouro: 'Rua ' + ['das Flores', 'do Sol', 'São João', 'Dom Malan'][i % 4], numero: String(100 + i * 11), bairro: ['Centro', 'Areia Branca', 'Gercino Coelho', 'Cohab'][i % 4], cidade: fil?.cidade?.split('/')[0] || 'Petrolina', uf: 'PE', cep: '56300-000', demo: true }));
  const ref = hoje(); const atrasos = [0, 1, 4, 0, 2, 0];
  for (let i = 0; i < 6; i++) {
    const l = lotes[i * 5 + 1]; const c = clientes[i]; const data = addMeses(ref, -(10 + i * 2)); const tot = l.preco; const e = Math.round(tot * .05), it = Math.round(tot * .3), m = tot - e - it;
    const parcelas = [...serieParcelas('Entrada', e, 3, data, 1), ...serieParcelas('Mensal', m, 120, addMeses(data, 3), 1), ...serieParcelas('Intercalada', it, 10, addMeses(data, 9), 12)];
    for (const p of parcelas) { if (p.venc < addMeses(ref, -atrasos[i]) || (p.venc < ref && atrasos[i] === 0)) p.pagamentos.push({ valor: p.valor, data: addDias(p.venc, (i % 3) - 1), origem: 'manual', forma: 'PIX', obs: 'Demonstração' }); }
    l.status = 'Vendido'; await Store.put('lotes', l);
    await Store.put('vendas', { filialId, numero: 'VD-' + String(i + 1).padStart(4, '0'), loteId: l.id, clienteId: c.id, data, valor: tot, corretor: ['Carla Menezes', 'João Batista', 'Carla Menezes'][i % 3], comissaoPct: 4, comissoesPagas: i % 2 ? [{ valor: Math.round(tot * .02), data: addDias(data, 30), obs: '1ª parte' }] : [], indice: 'IPCA', reajuste: 'IPCA + 7% a.a., aplicado anualmente', status: 'Ativo', classificacao: 'Automático', parcelas, historico: [{ data: new Date().toISOString(), usuario: 'Demonstração', acao: 'Venda criada (dados de demonstração)' }], demo: true });
  }
  const r = lotes[20]; r.status = 'Reservado'; r.reservaPara = 'Cliente em negociação'; await Store.put('lotes', r);
}
const MODELO_PADRAO = `INSTRUMENTO PARTICULAR DE PROMESSA DE COMPRA E VENDA DE LOTE URBANO
Contrato nº {{venda.numero}}

Pelo presente instrumento particular, de um lado {{filial.nome}}, inscrita no CNPJ sob o nº {{filial.cnpj}}, com sede em {{filial.endereco}}, {{filial.cidade}}/{{filial.uf}}, doravante denominada PROMITENTE VENDEDORA; e de outro lado {{cliente.nome}}, {{cliente.nacionalidade}}, {{cliente.estado_civil}}, {{cliente.profissao}}, portador(a) do RG nº {{cliente.rg}} e inscrito(a) no CPF/CNPJ sob o nº {{cliente.cpf}}, residente e domiciliado(a) em {{cliente.endereco_completo}}, doravante denominado(a) PROMISSÁRIO(A) COMPRADOR(A), têm entre si justo e contratado o seguinte:

CLÁUSULA PRIMEIRA — DO OBJETO
A PROMITENTE VENDEDORA, legítima proprietária do empreendimento {{lote.empreendimento}}, localizado em {{empreendimento.cidade}}, promete vender ao(à) PROMISSÁRIO(A) COMPRADOR(A) o Lote nº {{lote.numero}} da Quadra {{lote.quadra}}, com área de {{lote.area}}, medindo {{lote.frente}} de frente e {{lote.fundo}} de fundo, matrícula {{lote.matricula}}, com as seguintes confrontações: {{lote.confrontacoes}}.

CLÁUSULA SEGUNDA — DO PREÇO E DA FORMA DE PAGAMENTO
O preço total do lote é de {{venda.valor}} ({{venda.valor_extenso}}), que será pago da seguinte forma:
a) Entrada de {{entrada.total}} ({{entrada.total_extenso}}), em {{entrada.qtd}} parcela(s) de {{entrada.valor}}, com primeiro vencimento em {{entrada.primeiro_venc}};
b) {{mensal.qtd}} parcelas mensais e sucessivas de {{mensal.valor}} ({{mensal.valor_extenso}}), totalizando {{mensal.total}}, com primeiro vencimento em {{mensal.primeiro_venc}};
c) {{intercalada.qtd}} parcelas intercaladas de {{intercalada.valor}}, totalizando {{intercalada.total}}, com primeiro vencimento em {{intercalada.primeiro_venc}}.

Parágrafo único. As parcelas serão reajustadas pelo índice {{venda.indice}}, na forma: {{venda.juros_reajuste}}.

CLÁUSULA TERCEIRA — DOS ENCARGOS POR ATRASO
O atraso no pagamento de qualquer parcela sujeitará o(a) PROMISSÁRIO(A) COMPRADOR(A) a multa e juros de mora conforme indicados nos boletos de cobrança, além da atualização monetária.

CLÁUSULA QUARTA — DA POSSE, TRIBUTOS E ESCRITURA
[Ajustar conforme o modelo da empresa e a orientação jurídica.]

CLÁUSULA QUINTA — DO FORO
Fica eleito o foro da comarca de {{filial.cidade}}/{{filial.uf}} para dirimir quaisquer dúvidas oriundas deste contrato.

QUADRO DE PARCELAS
{{tabela_parcelas}}

E, por estarem justos e contratados, assinam o presente em duas vias de igual teor.

{{filial.cidade}}, {{venda.data_extenso}}.


_______________________________________
{{filial.nome}} — PROMITENTE VENDEDORA


_______________________________________
{{cliente.nome}} — PROMISSÁRIO(A) COMPRADOR(A)


Testemunhas:
1. _______________________________   2. _______________________________

Corretor responsável: {{venda.corretor}}`;
