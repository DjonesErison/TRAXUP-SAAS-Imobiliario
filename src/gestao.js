/* ==========================================================================
   TRAXUP Imobiliário — Painel Gerencial (/painelgerencial)
   Clientes do SaaS, filiais, administradores, valores de implantação e mensalidade,
   status (ativo, trial, demonstração, bloqueado, cancelado) e mensalidades.
   ========================================================================== */
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const brl = c => 'R$ ' + fmt.format((c || 0) / 100);               // sempre o valor completo: R$ 11.013.000,00
const valorInput = c => c ? fmt.format(c / 100) : '';
const dataBR = d => d ? String(d).slice(0, 10).split('-').reverse().join('/') : '—';
const dataHoraBR = d => d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
const hoje = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const mesAtual = () => hoje().slice(0, 7);
const G = { token: null, eu: null, d: null, view: 'geral', busca: '', fStatus: '', fCob: 'abertas', comp: mesAtual() };
const STATUS_TXT = { Ativo: 'Usando e pagando', Trial: 'Período de teste', 'Demonstração': 'Ambiente de vendas com dados fictícios', Bloqueado: 'Acesso suspenso', Cancelado: 'Contrato encerrado' };

function toast(msg, bad = false) { const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), bad ? 6000 : 3500); }
async function api(rota, corpo) {
  const r = await fetch('/api/gestao/' + rota, { method: corpo === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...(G.token ? { Authorization: 'Bearer ' + G.token } : {}) }, body: corpo === undefined ? undefined : JSON.stringify(corpo), cache: 'no-store' });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && rota !== 'login') { sair(true); throw Error(j.error || 'Sessão expirada.'); }
  if (!r.ok) throw Error(j.error || 'Não foi possível concluir.');
  return j;
}
async function carregar() { G.d = await api('dados'); G.eu = G.d.eu; }
const cliente = cod => G.d.clientes.find(c => c.codigo === cod);
const nomeCli = c => c.fantasia || c.razao;

/* ---------- login ---------- */
async function boot() {
  try { const s = JSON.parse(sessionStorage.getItem('traxup_gestao') || 'null'); if (s?.token) { G.token = s.token; await carregar(); return render(); } } catch (e) { G.token = null; }
  telaLogin();
}
async function telaLogin(erro = '') {
  let setup = false; try { setup = (await api('status')).setupNeeded; } catch (e) { }
  document.body.innerHTML = `<div class="lg"><section class="lgArt"><img src="${LOGO_H}" alt="TRAXUP"><div><h2>Painel<br>Gerencial<br><em>TRAXUP Imobiliário.</em></h2><p>Clientes, filiais, implantação, mensalidades e bloqueios do SaaS num só lugar.</p></div><p style="font-size:12px">Tecnologia que impulsiona negócios.</p></section>
  <section class="lgPanel"><form class="lgCard" id="fLogin"><div class="eyebrow">Acesso restrito · TRAXUP</div><h1>Entrar no painel</h1>${erro ? `<div class="notice bad">${esc(erro)}</div>` : ''}
  ${setup ? `<div class="notice warn">Nenhum gestor cadastrado ainda. No VPS, defina <b>GESTAO_LOGIN</b> e <b>GESTAO_SENHA</b> no .env e reinicie o serviço, ou rode <span class="mono">node scripts/gestor.mjs</span>.</div>` : ''}
  <label>Login<input name="login" autocomplete="username" required autofocus></label><label>Senha<input name="senha" type="password" autocomplete="current-password" required></label>
  <button class="primary" style="justify-content:center;padding:12px">Entrar</button></form></section></div>`;
  $('#fLogin').onsubmit = async e => { e.preventDefault(); const v = Object.fromEntries(new FormData(e.target)); try { const j = await api('login', v); G.token = j.token; sessionStorage.setItem('traxup_gestao', JSON.stringify({ token: j.token })); await carregar(); render(); } catch (er) { telaLogin(er.message); } };
}
function sair(expirou = false) { if (G.token && !expirou) fetch('/api/gestao/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + G.token } }).catch(() => { }); G.token = null; sessionStorage.removeItem('traxup_gestao'); telaLogin(expirou ? 'Sua sessão terminou. Entre novamente.' : ''); }

/* ---------- casca ---------- */
const MENU = [['geral', 'Visão geral'], ['clientes', 'Clientes'], ['cobrancas', 'Mensalidades e cobranças'], ['gestores', 'Gestores do painel'], ['historico', 'Histórico']];
function render() {
  const t = MENU.find(m => m[0] === G.view)[1];
  document.body.innerHTML = `<div class="shell"><aside><div class="brand"><img src="${LOGO_H}" alt="TRAXUP"></div><div class="tag">Painel Gerencial</div>
  <nav>${MENU.map(([k, n]) => `<button class="${G.view === k ? 'active' : ''}" data-act="go" data-v="${k}">${n}</button>`).join('')}</nav>
  <div class="foot">Sistema dos clientes:<br><a href="/" target="_blank" style="color:#fff">imob.traxup.com.br</a></div></aside>
  <main><div class="top"><button class="menuBtn ghost" data-act="nav">☰</button><div><div class="eyebrow">TRAXUP / Painel Gerencial</div><h1>${t}</h1></div><span class="sp"></span>
  ${G.view === 'clientes' || G.view === 'geral' ? '<button class="primary" data-act="novoCliente">+ Novo cliente</button>' : ''}
  <div class="chip"><div class="avatar">${esc((G.eu?.nome || '?')[0].toUpperCase())}</div><div><b>${esc(G.eu?.nome)}</b><br><span class="muted" style="font-size:12px">Gestor</span></div><button class="ghost" data-act="sair" title="Sair">Sair</button></div></div>
  <div class="content" id="content">${VIEWS[G.view]()}</div></main></div>`;
}
const recarregar = async () => { await carregar(); render(); };

/* ---------- telas ---------- */
const statusChip = s => `<span class="st ${esc(s)}">${esc(s)}</span>`;
const pagantes = () => G.d.clientes.filter(c => c.status === 'Ativo');
const VIEWS = {
  geral() {
    const cs = G.d.clientes, cb = G.d.cobrancas.filter(c => c.situacao !== 'Cancelada');
    const mrr = pagantes().reduce((s, c) => s + (c.mensalidade || 0), 0);
    const abertas = cb.filter(c => c.situacao === 'Aberta'), atrasadas = cb.filter(c => c.situacao === 'Atrasada');
    const mes = mesAtual(), recebidoMes = cb.filter(c => c.status === 'Paga' && (c.pagoEm || '').startsWith(mes)).reduce((s, c) => s + (c.valorPago ?? c.valor), 0);
    const n = s => cs.filter(c => c.status === s).length;
    return `<div class="kpis">
      <div class="kpi g"><small>Clientes ativos</small><b>${n('Ativo')}</b><span>${cs.length} cadastrados no total</span></div>
      <div class="kpi"><small>Trial / Demonstração</small><b>${n('Trial')} / ${n('Demonstração')}</b><span>em avaliação ou vendas</span></div>
      <div class="kpi r"><small>Bloqueados</small><b>${n('Bloqueado')}</b><span>${n('Cancelado')} cancelado(s)</span></div>
      <div class="kpi o"><small>Receita mensal recorrente</small><b>${brl(mrr)}</b><span>soma das mensalidades dos ativos</span></div>
      <div class="kpi g"><small>Recebido em ${mes.split('-').reverse().join('/')}</small><b>${brl(recebidoMes)}</b><span>cobranças baixadas no mês</span></div>
      <div class="kpi"><small>A receber (em dia)</small><b>${brl(abertas.reduce((s, c) => s + c.valor, 0))}</b><span>${abertas.length} cobrança(s)</span></div>
      <div class="kpi r"><small>Em atraso</small><b>${brl(atrasadas.reduce((s, c) => s + c.valor, 0))}</b><span>${atrasadas.length} cobrança(s)</span></div></div>
    <div class="grid2"><div class="card"><div class="cardHead"><h3>Cobranças em atraso</h3><span class="sp"></span><button class="sm" data-act="go" data-v="cobrancas">Ver todas</button></div>${tabelaCobrancas(atrasadas.slice(0, 10), true)}</div>
    <div class="card"><div class="cardHead"><h3>Clientes</h3><span class="sp"></span><button class="sm" data-act="go" data-v="clientes">Ver todos</button></div>${tabelaClientes(cs.slice(0, 10), true)}</div></div>`;
  },
  clientes() {
    const q = G.busca.toLowerCase(); const cs = G.d.clientes.filter(c => (!G.fStatus || c.status === G.fStatus) && (!q || [c.codigo, c.razao, c.fantasia, c.cnpj, c.responsavel, c.cidade].join(' ').toLowerCase().includes(q)));
    return `<div class="card"><div class="cardHead"><div class="tools"><input id="busca" placeholder="Buscar por nome, código, CNPJ…" value="${esc(G.busca)}"><select id="fStatus"><option value="">Todos os status</option>${G.d.statusOpcoes.map(s => `<option ${s === G.fStatus ? 'selected' : ''}>${s}</option>`).join('')}</select></div><span class="sp"></span><span class="muted">${cs.length} cliente(s)</span></div>${tabelaClientes(cs)}</div>`;
  },
  cobrancas() {
    const f = G.fCob; const cs = G.d.cobrancas.filter(c => f === 'todas' || (f === 'abertas' ? ['Aberta', 'Atrasada'].includes(c.situacao) : c.situacao === f));
    return `<div class="card"><div class="cardHead"><h3>Gerar mensalidades</h3></div><div class="cardBody tools"><label>Mês de referência<input type="month" id="comp" value="${esc(G.comp)}" style="min-width:180px"></label>
      <button class="primary" data-act="gerarMens" style="align-self:flex-end">Gerar mensalidades do mês</button>
      <span class="muted" style="align-self:flex-end;max-width:520px">Cria uma cobrança para cada cliente <b>Ativo</b> ou <b>Bloqueado</b> com mensalidade, no dia de vencimento combinado. Quem já tem a mensalidade do mês não é duplicado.</span></div></div>
    <div class="card"><div class="cardHead"><div class="tools"><select id="fCob">${[['abertas', 'Em aberto e atrasadas'], ['Atrasada', 'Somente atrasadas'], ['Paga', 'Pagas'], ['Cancelada', 'Canceladas'], ['todas', 'Todas']].map(([k, n]) => `<option value="${k}" ${k === f ? 'selected' : ''}>${n}</option>`).join('')}</select></div><span class="sp"></span>
      <span class="muted">${cs.length} cobrança(s) · ${brl(cs.reduce((s, c) => s + c.valor, 0))}</span><button data-act="novaCob">+ Cobrança avulsa</button></div>${tabelaCobrancas(cs)}</div>`;
  },
  gestores() {
    return `<div class="card"><div class="cardHead"><h3>Quem acessa este painel</h3><span class="sp"></span><button class="primary" data-act="gestor">+ Novo gestor</button></div><div class="tblWrap"><table><thead><tr><th>Nome</th><th>Login</th><th>Situação</th><th>Último acesso</th><th></th></tr></thead><tbody>
    ${G.d.gestores.map(g => `<tr><td><b>${esc(g.nome)}</b></td><td class="mono">${esc(g.login)}</td><td>${g.ativo === false ? statusChip('Bloqueado') : statusChip('Ativo')}</td><td>${dataHoraBR(g.ultimoAcesso)}</td><td class="right"><button class="sm" data-act="gestor" data-id="${g.id}">Editar</button></td></tr>`).join('')}</tbody></table></div></div>
    <div class="notice info">Os gestores acessam só este painel. Os usuários de cada cliente são cadastrados dentro do sistema do próprio cliente (o administrador criado aqui cadastra os demais).</div>`;
  },
  historico() {
    return `<div class="card"><div class="tblWrap"><table><thead><tr><th>Data</th><th>Gestor</th><th>Cliente</th><th>Ação</th></tr></thead><tbody>${G.d.logs.map(l => `<tr><td class="nowrap">${dataHoraBR(l.data)}</td><td>${esc(l.gestor)}</td><td>${l.codigo ? `<span class="code">${esc(l.codigo)}</span>` : ''}</td><td>${esc(l.acao)}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Nada registrado ainda.</td></tr>'}</tbody></table></div></div>`;
  }
};
function tabelaClientes(cs, curta = false) {
  if (!cs.length) return '<div class="empty">Nenhum cliente encontrado.</div>';
  return `<div class="tblWrap"><table><thead><tr><th>Código</th><th>Cliente</th><th>Status</th>${curta ? '' : '<th>Filiais</th><th>Usuários</th><th class="right">Implantação</th>'}<th class="right">Mensalidade</th>${curta ? '' : '<th>Último acesso</th><th></th>'}</tr></thead><tbody>
  ${cs.map(c => `<tr data-act="abrirCliente" data-c="${esc(c.codigo)}" title="Abrir"><td><span class="code">${esc(c.codigo)}</span></td><td><b>${esc(nomeCli(c))}</b>${!curta && c.fantasia && c.razao !== c.fantasia ? `<br><span class="muted" style="font-size:12px">${esc(c.razao)}</span>` : ''}</td><td>${statusChip(c.status)}</td>
  ${curta ? '' : `<td>${c.base?.filiais?.length ?? 0}</td><td>${c.base?.usuarios ?? 0}</td><td class="right nowrap">${brl(c.implantacao)}</td>`}<td class="right nowrap">${brl(c.mensalidade)}</td>${curta ? '' : `<td class="nowrap">${dataHoraBR(c.base?.ultimoAcesso)}</td><td class="right"><button class="sm">Abrir</button></td>`}</tr>`).join('')}</tbody></table></div>`;
}
function tabelaCobrancas(cs, curta = false) {
  if (!cs.length) return '<div class="empty">Nenhuma cobrança aqui.</div>';
  return `<div class="tblWrap"><table><thead><tr><th>Vencimento</th><th>Cliente</th><th>Descrição</th><th class="right">Valor</th><th>Situação</th>${curta ? '' : '<th>Pagamento</th><th></th>'}</tr></thead><tbody>
  ${cs.map(c => `<tr><td class="nowrap">${dataBR(c.venc)}</td><td><span class="code">${esc(c.codigo)}</span> ${esc(c.cliente)}</td><td>${esc(c.descricao)}</td><td class="right nowrap"><b>${brl(c.valor)}</b></td><td>${statusChip(c.situacao)}</td>
  ${curta ? '' : `<td class="nowrap">${c.status === 'Paga' ? `${dataBR(c.pagoEm)} · ${brl(c.valorPago ?? c.valor)}${c.forma ? ' · ' + esc(c.forma) : ''}` : '—'}</td><td class="right nowrap">${c.status === 'Paga' || c.status === 'Cancelada' ? `<button class="sm" data-act="cobAcao" data-a="reabrir" data-id="${c.id}">Reabrir</button>` : `<button class="sm ok" data-act="pagar" data-id="${c.id}">Baixar</button> <button class="sm" data-act="novaCob" data-id="${c.id}">Editar</button> <button class="sm danger" data-act="cobAcao" data-a="cancelar" data-id="${c.id}">Cancelar</button>`}</td>`}</tr>`).join('')}</tbody></table></div>`;
}

/* ---------- modais ---------- */
function modal(html, cls = '') { fecharModal(); const o = document.createElement('div'); o.className = 'ov'; o.id = 'ov'; o.innerHTML = `<div class="modal ${cls}">${html}</div>`; o.addEventListener('mousedown', e => { if (e.target === o) fecharModal(); }); document.body.appendChild(o); }
function fecharModal() { $('#ov')?.remove(); }
const mHead = (t, sub = '') => `<div class="mHead"><div><h2>${t}</h2>${sub ? `<div class="muted" style="margin-top:4px">${sub}</div>` : ''}</div><span class="sp"></span><button class="ghost" data-act="fechar">✕</button></div>`;
const opts = (lista, sel) => lista.map(s => `<option ${s === sel ? 'selected' : ''}>${s}</option>`).join('');
const sugerirCodigo = n => String(n || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\b(ltda|me|eireli|epp|s\/?a|empreendimentos|imobiliaria|loteamentos?|incorporadora)\b/g, '').replace(/[^a-z0-9]/g, '').slice(0, 12);
const senhaAleatoria = () => { const a = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; const r = crypto.getRandomValues(new Uint32Array(10)); for (const x of r) s += a[x % a.length]; return s; };
const filialRow = (f = {}) => `<div class="rowF"><label>Nome da filial<input name="fNome" value="${esc(f.nome)}" placeholder="Ex.: Matriz Petrolina"></label><label>CNPJ<input name="fCnpj" value="${esc(f.cnpj)}"></label><label>Cidade<input name="fCidade" value="${esc(f.cidade)}"></label><label>UF<input name="fUf" maxlength="2" value="${esc(f.uf)}"></label><button type="button" class="sm danger" data-act="rmFilial" title="Remover">✕</button></div>`;

function camposCadastro(c = {}, novo = false) {
  return `<div class="sec"><h4>Empresa</h4><div class="fg">
    <label class="w2">Razão social *<input name="razao" required value="${esc(c.razao)}" ${novo ? 'data-sug="1"' : ''}></label><label>Nome fantasia<input name="fantasia" value="${esc(c.fantasia)}" ${novo ? 'data-sug="1"' : ''}></label><label>CNPJ<input name="cnpj" value="${esc(c.cnpj)}"></label>
    <label>Responsável<input name="responsavel" value="${esc(c.responsavel)}"></label><label>E-mail<input name="email" type="email" value="${esc(c.email)}"></label><label>Telefone / WhatsApp<input name="telefone" value="${esc(c.telefone)}"></label>
    <label>Cidade<input name="cidade" value="${esc(c.cidade)}"></label><label>UF<input name="uf" maxlength="2" value="${esc(c.uf)}"></label></div></div>
  <div class="sec"><h4>Acesso e situação</h4><div class="fg">
    <label>Código do cliente (usado no login) *<input name="codigo" required pattern="[a-z0-9]{2,20}" value="${esc(c.codigo)}" ${novo ? '' : 'readonly'} placeholder="ex.: busca" style="font-family:ui-monospace,monospace;font-weight:700"></label>
    <label>Status<select name="status">${opts(G.d.statusOpcoes, c.status || 'Ativo')}</select></label>
    <label class="w2">Motivo do bloqueio/cancelamento<input name="motivoBloqueio" value="${esc(c.motivoBloqueio)}" placeholder="Opcional"></label>
    <label class="chk w2"><input type="checkbox" name="resetDiario" ${c.resetDiario === false ? '' : 'checked'}> Se for demonstração, restaurar os dados todo dia às 3h</label></div>
    <div class="muted" style="margin-top:8px;font-size:12.5px">${Object.entries(STATUS_TXT).map(([k, v]) => `<b>${k}</b>: ${v}`).join(' · ')}. Bloqueado e Cancelado não conseguem entrar.</div></div>
  <div class="sec"><h4>Plano e valores</h4><div class="fg">
    <label>Funcionalidades<select name="funcionalidades" disabled><option>Todas as funcionalidades</option></select></label>
    <label>Valor da implantação (R$)<input name="implantacao" inputmode="decimal" data-money value="${valorInput(c.implantacao)}" placeholder="0,00"></label>
    <label>Implantação em quantas vezes<input name="implantacaoParcelas" type="number" min="1" max="24" value="${esc(c.implantacaoParcelas || 1)}"></label>
    ${novo ? `<label>1º vencimento da implantação<input name="vencImplantacao" type="date" value="${hoje()}"></label>` : ''}
    <label>Mensalidade (R$)<input name="mensalidade" inputmode="decimal" data-money value="${valorInput(c.mensalidade)}" placeholder="0,00"></label>
    <label>Dia de vencimento<input name="diaVenc" type="number" min="1" max="31" value="${esc(c.diaVenc || 10)}"></label>
    <label>Início do contrato<input name="inicio" type="date" value="${esc(c.inicio || hoje())}"></label>
    <label class="w2">Observações<textarea name="obs" rows="2">${esc(c.obs)}</textarea></label></div></div>`;
}
function novoCliente() {
  modal(`${mHead('Novo cliente', 'Cria a base do cliente, as filiais e o administrador. A base começa zerada e separada das demais.')}
  <form class="mBody form" id="fCli">${camposCadastro({}, true)}
  <div class="sec"><h4>Filiais</h4><div id="filiais">${filialRow()}</div><button type="button" class="sm" data-act="addFilial">+ Adicionar filial</button></div>
  <div class="sec"><h4>Administrador do cliente</h4><div class="fg"><label>Nome<input name="aNome" placeholder="Nome do responsável"></label><label>Login *<input name="aLogin" required autocomplete="off" placeholder="ex.: admin"></label><label>E-mail<input name="aEmail" type="email"></label>
    <label>Senha inicial *<input name="aSenha" required minlength="6" value="${senhaAleatoria()}" autocomplete="off"></label></div><div class="muted" style="margin-top:8px;font-size:12.5px">Ele entra com o código do cliente, este login e a senha, e cadastra os demais usuários dentro do sistema.</div></div>
  <div class="actions"><button type="button" data-act="fechar">Cancelar</button><button class="primary">Cadastrar cliente</button></div></form>`);
  const f = $('#fCli'); let mexeu = false;
  f.codigo.addEventListener('input', () => { mexeu = true; f.codigo.value = f.codigo.value.toLowerCase().replace(/[^a-z0-9]/g, ''); });
  for (const n of ['razao', 'fantasia']) f[n].addEventListener('input', () => { if (!mexeu) f.codigo.value = sugerirCodigo(f.fantasia.value || f.razao.value); });
  f.onsubmit = async e => {
    e.preventDefault(); const v = Object.fromEntries(new FormData(f)); const rows = [...f.querySelectorAll('.rowF')];
    const filiais = rows.map(r => ({ nome: r.querySelector('[name=fNome]').value, cnpj: r.querySelector('[name=fCnpj]').value, cidade: r.querySelector('[name=fCidade]').value, uf: r.querySelector('[name=fUf]').value })).filter(x => x.nome.trim());
    if (!filiais.length) return toast('Cadastre pelo menos uma filial.', true);
    const corpo = { ...v, novo: true, resetDiario: !!v.resetDiario, filiais, admin: { nome: v.aNome, login: v.aLogin, email: v.aEmail, senha: v.aSenha } };
    try { await api('cliente', corpo); await carregar(); G.view = 'clientes'; render(); abrirCliente(v.codigo, 'acesso', { login: v.aLogin, senha: v.aSenha }); toast('Cliente cadastrado.'); } catch (er) { toast(er.message, true); }
  };
}
function textoAcesso(c, login = '', senha = '') {
  return `Acesso ao TRAXUP Imobiliário — ${nomeCli(c)}\n\nEndereço: https://${location.host}\nCódigo da empresa: ${c.codigo}\nLogin: ${login || '(seu login)'}${senha ? `\nSenha inicial: ${senha}` : ''}\n\nNo primeiro acesso, troque a senha em Configurações.`;
}
function abrirCliente(codigo, aba = 'cadastro', acesso = null) {
  const c = cliente(codigo); if (!c) return; const b = c.base || {}; const cbs = G.d.cobrancas.filter(x => x.codigo === codigo);
  const abas = [['cadastro', 'Cadastro e valores'], ['filiais', `Filiais (${b.filiais?.length || 0})`], ['acesso', 'Acesso e administradores'], ['cobrancas', `Cobranças (${cbs.length})`]];
  const corpo = {
    cadastro: () => `<form class="mBody form" id="fCli">${camposCadastro(c)}<div class="actions">${c.status === 'Demonstração' ? '<button type="button" data-act="restaurarDemo">Restaurar dados da demonstração</button>' : ''}<button class="primary">Salvar alterações</button></div></form>`,
    filiais: () => `<div class="mBody form"><div class="card"><div class="tblWrap"><table><thead><tr><th>Filial</th><th>CNPJ</th><th>Cidade</th></tr></thead><tbody>${(b.filiais || []).map(f => `<tr><td><b>${esc(f.nome)}</b></td><td>${esc(f.cnpj || '—')}</td><td>${esc([f.cidade, f.uf].filter(Boolean).join('/') || '—')}</td></tr>`).join('') || '<tr><td colspan="3" class="empty">Nenhuma filial.</td></tr>'}</tbody></table></div></div>
      <form class="sec" id="fFil"><h4>Adicionar filial</h4>${filialRow().replace('<button type="button" class="sm danger" data-act="rmFilial" title="Remover">✕</button>', '<button class="primary sm">Adicionar</button>')}</form>
      <div class="muted" style="font-size:12.5px">Dados bancários, convênio do Banco do Brasil, multa e juros de cada filial são ajustados pelo administrador do cliente, em Filiais, dentro do sistema.</div></div>`,
    acesso: () => `<div class="mBody form">${acesso ? `<div class="notice info"><b>Cliente criado.</b> Envie os dados de acesso abaixo ao responsável.</div>` : ''}
      <div class="sec"><h4>Dados de acesso para enviar</h4><div class="acesso" id="txtAcesso">${esc(textoAcesso(c, acesso?.login || b.admins?.[0]?.login, acesso?.senha))}</div><div class="actions" style="margin-top:10px"><button class="sm" data-act="copiarAcesso">Copiar texto</button></div></div>
      <div class="card"><div class="cardHead"><h3>Administradores</h3></div><div class="tblWrap"><table><thead><tr><th>Nome</th><th>Login</th><th>E-mail</th><th>Último acesso</th></tr></thead><tbody>${(b.admins || []).map(u => `<tr><td><b>${esc(u.nome)}</b>${u.ativo ? '' : ' ' + statusChip('Bloqueado')}</td><td class="mono">${esc(u.login)}</td><td>${esc(u.email || '—')}</td><td>${dataHoraBR(u.ultimoAcesso)}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Nenhum administrador.</td></tr>'}</tbody></table></div></div>
      <form class="sec" id="fAdm"><h4>Criar administrador ou redefinir senha</h4><div class="fg"><label>Login *<input name="login" required autocomplete="off" placeholder="login existente ou novo"></label><label>Nova senha *<input name="senha" required minlength="6" value="${senhaAleatoria()}" autocomplete="off"></label><label>Nome (se for novo)<input name="nome"></label><label>E-mail (se for novo)<input name="email" type="email"></label></div>
      <div class="actions" style="margin-top:12px"><button class="primary">Salvar acesso</button></div><div class="muted" style="font-size:12.5px">Se o login já existir, a senha é trocada e as sessões abertas dele são encerradas.</div></form>
      <div class="muted" style="font-size:12.5px">Base: ${b.lotes || 0} lote(s), ${b.vendas || 0} venda(s), ${b.clientes || 0} comprador(es), ${b.usuarios || 0} usuário(s).</div></div>`,
    cobrancas: () => `<div class="mBody form"><div class="actions"><button class="sm" data-act="novaCob" data-c="${esc(codigo)}">+ Cobrança avulsa</button></div><div class="card">${tabelaCobrancas(cbs)}</div></div>`
  };
  modal(`${mHead(`${esc(nomeCli(c))} <span class="code" style="font-size:13px;vertical-align:middle">${esc(c.codigo)}</span>`, `${statusChip(c.status)} &nbsp; Mensalidade ${brl(c.mensalidade)} · vence dia ${c.diaVenc || 10}${c.padrao ? ' · base que já existia no sistema' : ''}`)}
  <div class="tabs">${abas.map(([k, n]) => `<button class="${k === aba ? 'active' : ''}" data-act="abaCliente" data-c="${esc(codigo)}" data-a="${k}">${n}</button>`).join('')}</div>${corpo[aba]()}`);
  const ov = $('#ov'); ov.dataset.c = codigo; ov.dataset.aba = aba;
  const f = $('#fCli'); if (f) f.onsubmit = async e => { e.preventDefault(); const v = Object.fromEntries(new FormData(f)); if (['Bloqueado', 'Cancelado'].includes(v.status) && c.status !== v.status && !confirm(`Mudar para ${v.status}? Os usuários de ${nomeCli(c)} serão desconectados e não conseguirão entrar.`)) return; try { await api('cliente', { ...v, resetDiario: !!v.resetDiario }); await recarregar(); abrirCliente(codigo, 'cadastro'); toast('Cliente atualizado.'); } catch (er) { toast(er.message, true); } };
  const ff = $('#fFil'); if (ff) ff.onsubmit = async e => { e.preventDefault(); const q = n => ff.querySelector(`[name=${n}]`).value; try { await api(`cliente/${codigo}/filial`, { nome: q('fNome'), cnpj: q('fCnpj'), cidade: q('fCidade'), uf: q('fUf') }); await recarregar(); abrirCliente(codigo, 'filiais'); toast('Filial adicionada.'); } catch (er) { toast(er.message, true); } };
  const fa = $('#fAdm'); if (fa) fa.onsubmit = async e => { e.preventDefault(); const v = Object.fromEntries(new FormData(fa)); try { await api(`cliente/${codigo}/admin`, v); await recarregar(); abrirCliente(codigo, 'acesso', { login: v.login, senha: v.senha }); toast('Acesso salvo.'); } catch (er) { toast(er.message, true); } };
}
function novaCob(id, codigo) {
  const c = id ? G.d.cobrancas.find(x => x.id === id) : { codigo, tipo: 'Avulsa', venc: hoje() };
  modal(`${mHead(id ? 'Editar cobrança' : 'Nova cobrança')}<form class="mBody form" id="fCob"><div class="fg">
  <label class="w2">Cliente<select name="codigo" ${id ? 'disabled' : ''}>${G.d.clientes.map(x => `<option value="${esc(x.codigo)}" ${x.codigo === c.codigo ? 'selected' : ''}>${esc(nomeCli(x))} (${esc(x.codigo)})</option>`).join('')}</select></label>
  <label>Tipo<select name="tipo">${opts(['Mensalidade', 'Implantação', 'Avulsa'], c.tipo)}</select></label><label>Descrição<input name="descricao" value="${esc(c.descricao)}" placeholder="Ex.: Treinamento extra"></label>
  <label>Valor (R$) *<input name="valor" required inputmode="decimal" data-money value="${valorInput(c.valor)}"></label><label>Vencimento *<input name="venc" type="date" required value="${esc(c.venc)}"></label>
  <label class="w2">Observação<input name="obs" value="${esc(c.obs)}"></label></div><div class="actions"><button type="button" data-act="fechar">Cancelar</button><button class="primary">Salvar</button></div></form>`, 'narrow');
  const f = $('#fCob'); f.onsubmit = async e => { e.preventDefault(); const v = Object.fromEntries(new FormData(f)); try { await api('cobranca', { ...v, id, codigo: id ? c.codigo : v.codigo }); fecharModal(); await recarregar(); toast('Cobrança salva.'); } catch (er) { toast(er.message, true); } };
}
function pagar(id) {
  const c = G.d.cobrancas.find(x => x.id === id);
  modal(`${mHead('Baixar cobrança', `${esc(c.cliente)} · ${esc(c.descricao)} · ${brl(c.valor)}`)}<form class="mBody form" id="fPag"><div class="fg"><label>Data do pagamento<input name="data" type="date" value="${hoje()}" required></label><label>Valor pago (R$)<input name="valor" inputmode="decimal" data-money value="${valorInput(c.valor)}"></label>
  <label class="w2">Forma<select name="forma">${opts(['PIX', 'Boleto', 'Transferência', 'Dinheiro', 'Cartão', 'Outra'], 'PIX')}</select></label></div><div class="actions"><button type="button" data-act="fechar">Cancelar</button><button class="primary">Confirmar baixa</button></div></form>`, 'narrow');
  const f = $('#fPag'); f.onsubmit = async e => { e.preventDefault(); try { await api(`cobranca/${id}/pagar`, Object.fromEntries(new FormData(f))); fecharModal(); await recarregar(); toast('Pagamento registrado.'); } catch (er) { toast(er.message, true); } };
}
function gestor(id) {
  const g = G.d.gestores.find(x => x.id === id) || {};
  modal(`${mHead(id ? 'Editar gestor' : 'Novo gestor', 'Acesso ao Painel Gerencial')}<form class="mBody form" id="fGes"><div class="fg"><label class="w2">Nome<input name="nome" value="${esc(g.nome)}"></label><label>Login *<input name="login" required value="${esc(g.login)}"></label><label>E-mail<input name="email" type="email" value="${esc(g.email)}"></label>
  <label class="w2">${id ? 'Nova senha (deixe em branco para manter)' : 'Senha * (mín. 8)'}<input name="senha" type="password" minlength="8" ${id ? '' : 'required'} autocomplete="new-password"></label><label class="chk w2"><input type="checkbox" name="ativo" ${g.ativo === false ? '' : 'checked'}> Acesso ativo</label></div>
  <div class="actions"><button type="button" data-act="fechar">Cancelar</button><button class="primary">Salvar</button></div></form>`, 'narrow');
  const f = $('#fGes'); f.onsubmit = async e => { e.preventDefault(); const v = Object.fromEntries(new FormData(f)); try { await api('gestor', { ...v, id, ativo: !!v.ativo }); fecharModal(); await recarregar(); toast('Gestor salvo.'); } catch (er) { toast(er.message, true); } };
}

/* ---------- ações ---------- */
const ACT = {
  go: el => { G.view = el.dataset.v; document.body.classList.remove('nav'); render(); },
  nav: () => document.body.classList.toggle('nav'),
  sair: () => sair(),
  fechar: fecharModal,
  novoCliente,
  addFilial: () => $('#filiais').insertAdjacentHTML('beforeend', filialRow()),
  rmFilial: el => { if (document.querySelectorAll('#filiais .rowF').length > 1) el.closest('.rowF').remove(); },
  abrirCliente: el => abrirCliente(el.dataset.c),
  abaCliente: el => abrirCliente(el.dataset.c, el.dataset.a),
  copiarAcesso: async () => { try { await navigator.clipboard.writeText($('#txtAcesso').textContent); toast('Texto copiado.'); } catch (e) { toast('Selecione o texto e copie manualmente.', true); } },
  restaurarDemo: async () => { const cod = $('#ov').dataset.c; if (!confirm('Apagar os dados desta demonstração? No próximo acesso o sistema recria os dados de exemplo.')) return; try { await api(`cliente/${cod}/demo-restaurar`, {}); await recarregar(); abrirCliente(cod); toast('Demonstração restaurada.'); } catch (er) { toast(er.message, true); } },
  novaCob: el => novaCob(el.dataset.id, el.dataset.c),
  pagar: el => pagar(el.dataset.id),
  cobAcao: async el => { const a = el.dataset.a; if (a === 'cancelar' && !confirm('Cancelar esta cobrança?')) return; const ov = $('#ov'); try { await api(`cobranca/${el.dataset.id}/${a}`, {}); await recarregar(); if (ov?.dataset.c) abrirCliente(ov.dataset.c, 'cobrancas'); toast(a === 'cancelar' ? 'Cobrança cancelada.' : 'Cobrança reaberta.'); } catch (er) { toast(er.message, true); } },
  gerarMens: async () => { const comp = $('#comp').value; if (!comp) return toast('Escolha o mês.', true); G.comp = comp; try { const j = await api('mensalidades', { competencia: comp }); await recarregar(); toast(j.geradas ? `${j.geradas} mensalidade(s) gerada(s).` : 'Nenhuma mensalidade nova: todas já existiam ou não há clientes ativos com mensalidade.'); } catch (er) { toast(er.message, true); } },
  gestor: el => gestor(el.dataset.id)
};
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el) return; const fn = ACT[el.dataset.act]; if (fn) { e.preventDefault(); fn(el); } });
document.addEventListener('input', e => {
  if (e.target.id === 'busca') { G.busca = e.target.value; const pos = e.target.selectionStart; $('#content').innerHTML = VIEWS.clientes(); const b = $('#busca'); b.focus(); b.setSelectionRange(pos, pos); }
  if (e.target.matches('[data-money]')) { const d = e.target.value.replace(/\D/g, '').replace(/^0+/, ''); e.target.value = d ? fmt.format(+d / 100) : ''; }
});
document.addEventListener('change', e => {
  if (e.target.id === 'fStatus') { G.fStatus = e.target.value; $('#content').innerHTML = VIEWS.clientes(); }
  if (e.target.id === 'fCob') { G.fCob = e.target.value; $('#content').innerHTML = VIEWS.cobrancas(); }
  if (e.target.id === 'comp') G.comp = e.target.value;
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });
boot();
