/* ==========================================================================
   Painel do cliente — acesso somente leitura em /painel-cliente
   O cliente entra com e-mail e senha, vê os próprios contratos, parcelas,
   boletos (2ª via), contrato e extrato. Não altera nada.
   ========================================================================== */
const PORTAL = { token: null, dados: null, venda: null, aba: 'abertas', mais: false };
const ehPortal = () => /^\/(painel-cliente|cliente)(\/|$)/.test(location.pathname);

async function portalApi(rota, opt = {}) {
  const r = await fetch('/api/portal/' + rota, { ...opt, headers: { 'Content-Type': 'application/json', ...(PORTAL.token ? { Authorization: 'Bearer ' + PORTAL.token } : {}), ...(opt.headers || {}) }, cache: 'no-store' });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && rota !== 'login') { portalSair(true); throw Error(j.error || 'Sessão expirada.'); }
  if (!r.ok) throw Error(j.error || 'Não foi possível concluir a operação.');
  return j;
}

async function portalBoot() {
  document.title = 'Painel do cliente — TRAXUP Imobiliário';
  $('#app').innerHTML = `<div class="lgLoad"><img src="${LOGO_IMG}" alt="TRAXUP"><div class="lgSpin"></div></div>`;
  Store.mode = 'portal';
  try { const s = JSON.parse(sessionStorage.getItem('traxup_portal') || 'null'); if (s?.token) { PORTAL.token = s.token; await portalCarregar(); return portalRender(); } } catch (e) { PORTAL.token = null; }
  portalLogin();
}

function portalLogin(erro = '') {
  const ult = lembrado('traxup_portal_email');
  $('#app').innerHTML = loginShell(`<form class="loginCard" data-form="portalLogin"><h1>Acesse a Área<br>do Cliente</h1><p class="sub">Entre com o e-mail e a senha enviados pela empresa.</p>${erro ? `<div class="notice bad">${esc(erro)}</div>` : ''}
  <label>E-mail<span class="lgInput">${ic('mail')}<input name="email" type="email" autocomplete="username" placeholder="seu@email.com" required value="${esc(ult)}" ${ult ? '' : 'autofocus'}></span></label>${campoSenha('senha', 'Senha', 'current-password')}
  ${loginAjuda('Lembrar meu e-mail', 'Fale com a empresa onde você comprou o lote para receber uma nova senha.')}
  <button class="primary lgBtn" type="submit">Entrar ${ic('arrow')}</button>
  <div class="lgHelp"><span>Precisa de ajuda?</span></div><p class="lgHelpTxt">Fale com a empresa onde você comprou o seu lote.</p></form>`, 'cliente');
  if (ult) setTimeout(() => $('input[name=senha]')?.focus(), 30);
}

async function portalCarregar() {
  const d = await portalApi('dados');
  PORTAL.dados = d;
  Store.data = {}; COLS.forEach(c => Store.data[c] = {});
  for (const c of ['clientes', 'vendas', 'lotes', 'empreendimentos', 'filiais', 'boletos', 'modelos', 'solicitacoes']) for (const o of (d[c] || [])) (Store.data[c] ||= {})[o.id] = o;
  PORTAL.cliente = d.clientes[0];
  const vs = d.vendas.sort((a, b) => (a.data || '').localeCompare(b.data || ''));
  if (!vs.some(v => v.id === PORTAL.venda)) PORTAL.venda = vs[0]?.id || null;
}

function portalSair(expirou = false) {
  if (PORTAL.token && !expirou) fetch('/api/portal/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + PORTAL.token } }).catch(() => { });
  PORTAL.token = null; PORTAL.dados = null; try { sessionStorage.removeItem('traxup_portal'); } catch (e) { }
  portalLogin(expirou ? 'Sua sessão terminou. Entre novamente.' : '');
}

const pVendas = () => Store.list('vendas').sort((a, b) => (a.data || '').localeCompare(b.data || ''));
const pBoletoDa = pid => Store.list('boletos').filter(b => b.parcelaId === pid && b.status !== 'Pago').sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''))[0];
const pSolDa = pid => Store.list('solicitacoes').find(s => s.parcelaId === pid && s.status === 'Pendente');
const pModeloDa = v => v?.contratoGeradoEm ? (Store.get('modelos', v.contratoModeloId) || Store.list('modelos').find(m => m.nome === v.contratoModelo)) : null;
const pLote = v => Store.get('lotes', v.loteId) || {};
const pEmp = v => Store.get('empreendimentos', pLote(v).empId) || {};
const pNomeLote = v => { const l = pLote(v); return `Quadra ${l.quadra || '—'} · Lote ${l.numero || '—'}`; };

function portalRender() {
  const c = PORTAL.cliente || {}, vs = pVendas(), v = Store.get('vendas', PORTAL.venda);
  const primeiro = (c.nome || '').split(' ')[0];
  const head = `<header class="ptTop"><div class="brand">${LOGO_MARCA('PAINEL DO CLIENTE', true)}</div><span class="spacer"></span>
    <button class="ghost themeBtn" data-act="tema" title="Tema claro/escuro">${ic(document.body.classList.contains('dark') ? 'sun' : 'moon')}</button>
    <div class="ptUser"><div class="avatar">${esc((c.nome || '?')[0])}</div><div><b>${esc(c.nome || '')}</b><small>${esc(PORTAL.dados?.acesso?.email || '')}</small></div></div>
    <button class="ghost" data-act="ptSenha" title="Alterar senha">${ic('key')}<span class="hideSm">Senha</span></button><button class="ghost" data-act="ptSair" title="Sair">${ic('logout')}<span class="hideSm">Sair</span></button></header>`;
  if (!v) { $('#app').innerHTML = `<div class="ptShell">${head}<main class="ptMain"><div class="card"><div class="cardBody"><h2>Olá, ${esc(primeiro)}!</h2><p class="muted">Não encontramos contratos ativos no seu nome. Se acha que isso é um engano, fale com a empresa.</p></div></div></main></div>`; return; }
  const ps = (v.parcelas || []).slice().sort((a, b) => a.venc.localeCompare(b.venc)); const ref = hoje();
  const pago = soma(ps, pagoParcela), saldo = soma(ps, saldoParcela), atraso = ps.filter(p => vencida(p, ref)), prox = ps.find(p => saldoParcela(p) > 0 && p.venc >= ref);
  const pagas = ps.filter(p => saldoParcela(p) === 0).length, pct = ps.length ? Math.round(pagas / ps.length * 100) : 0;
  const l = pLote(v), e = pEmp(v), fil = Store.get('filiais', v.filialId) || {}, mod = pModeloDa(v);
  const listaTot = ps.filter(p => PORTAL.aba === 'todas' || (PORTAL.aba === 'pagas' ? saldoParcela(p) === 0 : saldoParcela(p) > 0)); const lista = PORTAL.mais ? listaTot : (PORTAL.aba === 'pagas' ? listaTot.slice(-12).reverse() : listaTot.slice(0, 12));
  const seletor = vs.length > 1 ? `<div class="ptContratos">${vs.map(x => `<button class="${x.id === v.id ? 'on' : ''}" data-act="ptVenda" data-id="${x.id}"><b>${esc(pNomeLote(x))}</b><small>${esc(pEmp(x).nome || '')} · contrato ${esc(x.numero)}</small></button>`).join('')}</div>` : '';
  const acao = p => {
    if (saldoParcela(p) === 0) return `<span class="muted">Paga${(p.pagamentos || []).length ? ' em ' + dataBR(p.pagamentos.map(x => x.data).sort().pop()) : ''}</span>`;
    const b = pBoletoDa(p.id); if (b) return `<button class="sm primary" data-act="ptBoleto" data-id="${b.id}">${ic('barcode')}2ª via do boleto</button>`;
    if (pSolDa(p.id)) return `<span class="badge warn">Boleto solicitado</span>`;
    if (p.venc > addDias(ref, 45)) return '<span class="muted">—</span>';
    return `<button class="sm" data-act="ptSolicitar" data-v="${v.id}" data-p="${p.id}">${ic('send')}Solicitar boleto</button>`;
  };
  const sols = Store.list('solicitacoes').filter(s => s.vendaId === v.id).sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || '')).slice(0, 6);
  $('#app').innerHTML = `<div class="ptShell">${head}<main class="ptMain">
  <div class="ptHello"><div><div class="eyebrow">Olá, ${esc(primeiro)}</div><h1>${esc(pNomeLote(v))}</h1><p class="muted">${esc(e.nome || '')}${e.cidade ? ' · ' + esc(e.cidade) : ''} · contrato ${esc(v.numero)} de ${dataBR(v.data)}</p></div><span class="spacer"></span>
    <div class="ptActs"><button data-act="ptExtrato">${ic('down')}Imprimir extrato</button>${mod ? `<button data-act="ptContrato" data-id="${v.id}">${ic('doc')}Ver contrato</button>` : `<button disabled title="O contrato ainda não foi disponibilizado pela empresa">${ic('doc')}Contrato indisponível</button>`}</div></div>
  ${seletor}
  ${atraso.length ? `<div class="notice bad">Você tem ${atraso.length} parcela${atraso.length > 1 ? 's' : ''} em atraso, somando ${brl(soma(atraso, saldoParcela))}. Use a 2ª via do boleto ou solicite um novo boleto abaixo.</div>` : ''}
  <div class="kpis ptKpis"><div class="kpi bl"><span>Valor do contrato</span><strong>${brl(v.valor)}</strong><small>${ps.length} parcelas</small></div><div class="kpi"><span>Já pago</span><strong class="green">${brl(pago)}</strong><small>${pagas} de ${ps.length} parcelas · ${pct}%</small><div class="ptBar"><i style="width:${pct}%"></i></div></div><div class="kpi hl"><span>Saldo a pagar</span><strong>${brl(saldo)}</strong><small>${ps.length - pagas} parcelas restantes</small></div><div class="kpi ${atraso.length ? '' : 'bl'}"><span>${atraso.length ? 'Em atraso' : 'Próxima parcela'}</span><strong class="${atraso.length ? 'red' : ''}">${atraso.length ? brl(soma(atraso, saldoParcela)) : prox ? brl(saldoParcela(prox)) : '—'}</strong><small>${atraso.length ? 'desde ' + dataBR(atraso[0].venc) : prox ? 'vence em ' + dataBR(prox.venc) : 'tudo quitado'}</small></div></div>
  <div class="ptGrid"><div class="card"><div class="cardHead"><div><h2>Parcelas</h2><p>Consulte, imprima a 2ª via ou solicite o boleto</p></div><div class="seg">${[['abertas', 'A pagar'], ['pagas', 'Pagas'], ['todas', 'Todas']].map(([k, t]) => `<button class="${PORTAL.aba === k ? 'on' : ''}" data-act="ptAba" data-k="${k}">${t}</button>`).join('')}</div></div>
    <div class="tableWrap"><table><thead><tr><th>Vencimento</th><th>Parcela</th><th class="num">Valor</th><th class="num">Pago</th><th>Situação</th><th></th></tr></thead><tbody>${lista.map(p => `<tr><td>${dataBR(p.venc)}</td><td>${esc(p.tipo)} ${esc(p.ref)}</td><td class="num">${brl(totalParcela(p))}</td><td class="num">${brl(pagoParcela(p))}</td><td>${badgeSit(statusParcela(p, ref))}</td><td class="actions">${acao(p)}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">Nenhuma parcela aqui.</td></tr>'}</tbody></table></div>${listaTot.length > 12 ? `<div class="ptMais"><button class="ghost" data-act="ptMais">${PORTAL.mais ? 'Mostrar menos' : `Mostrar todas as ${listaTot.length} parcelas`}</button></div>` : ''}<p class="hint" style="padding:0 18px 14px;margin:0">O boleto pode ser solicitado para parcelas em atraso ou que vencem nos próximos 45 dias.</p></div>
    <div class="ptSide"><div class="card"><div class="cardHead"><div><h2>Seu lote</h2></div></div><div class="cardBody"><dl class="ptDl"><dt>Empreendimento</dt><dd>${esc(e.nome || '—')}</dd><dt>Quadra / lote</dt><dd>${esc(l.quadra || '—')} / ${esc(l.numero || '—')}</dd>${l.area ? `<dt>Área</dt><dd>${String(l.area).replace('.', ',')} m²</dd>` : ''}${l.frente ? `<dt>Frente × fundo</dt><dd>${esc(l.frente)} m × ${esc(l.fundo || '—')} m</dd>` : ''}${l.matricula ? `<dt>Matrícula</dt><dd>${esc(l.matricula)}</dd>` : ''}<dt>Reajuste</dt><dd>${esc(v.indice || '—')}</dd><dt>Empresa</dt><dd>${esc(fil.nome || '')}</dd></dl></div></div>
    <div class="card"><div class="cardHead"><div><h2>Suas solicitações</h2></div></div><div class="cardBody">${sols.length ? `<ul class="ptSols">${sols.map(s => `<li><div><b>${s.tipo === 'boleto' ? 'Boleto' : esc(s.tipo)} ${esc(s.parcelaRef || '')}</b><small>${new Date(s.criadoEm).toLocaleString('pt-BR')}</small></div><span class="badge ${s.status === 'Atendida' ? 'ok' : 'warn'}">${esc(s.status)}</span></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">Nenhuma solicitação ainda.</p>'}</div></div></div></div>
  <p class="ptFoot">TRAXUP Imobiliário · Tecnologia que impulsiona negócios · Este painel é apenas para consulta. Para alterar dados, fale com a empresa.</p>
  </main></div>`;
}

function portalExtrato() {
  const v = Store.get('vendas', PORTAL.venda), c = PORTAL.cliente || {}; if (!v) return;
  const ps = (v.parcelas || []).slice().sort((a, b) => a.venc.localeCompare(b.venc)); const e = pEmp(v), fil = Store.get('filiais', v.filialId) || {}, bb = cfgBoleto(fil);
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Extrato ${esc(v.numero)}</title><style>body{font-family:Inter,Arial,sans-serif;color:#0A1A3A;margin:28px;font-size:12px}h1{font-size:20px;margin:0}h2{font-size:13px;margin:18px 0 6px}.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #1B4DCC;padding-bottom:10px}.top small{color:#5A6B8C}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.g div{border:1px solid #D8E0EE;border-radius:8px;padding:8px}.g span{display:block;color:#5A6B8C;font-size:10.5px}.g b{font-size:14px}table{width:100%;border-collapse:collapse;margin-top:6px}th,td{border-bottom:1px solid #E3E8F2;padding:5px 6px;text-align:left}th{background:#F2F5FB;font-size:10.5px;text-transform:uppercase;color:#5A6B8C}.n{text-align:right;white-space:nowrap}tfoot td{font-weight:700;border-top:2px solid #1B4DCC}.foot{margin-top:18px;color:#5A6B8C;font-size:10px}</style></head><body>
  <div class="top"><div><small>${esc(bb.razao || fil.nome || '')}${bb.cnpj ? ' · CNPJ ' + esc(fmtCPF(bb.cnpj)) : ''}</small><h1>Extrato do contrato ${esc(v.numero)}</h1></div><small>Emitido em ${dataBR(hoje())}</small></div>
  <h2>Comprador</h2>${esc(c.nome || '')}${c.cpf ? ' · CPF ' + esc(fmtCPF(c.cpf)) : ''}
  <h2>Imóvel</h2>${esc(e.nome || '')} · ${esc(pNomeLote(v))} · contrato de ${dataBR(v.data)}
  <div class="g"><div><span>Valor do contrato</span><b>${brl(v.valor)}</b></div><div><span>Total pago</span><b>${brl(soma(ps, pagoParcela))}</b></div><div><span>Saldo a pagar</span><b>${brl(soma(ps, saldoParcela))}</b></div><div><span>Em atraso</span><b>${brl(soma(ps.filter(p => vencida(p)), saldoParcela))}</b></div></div>
  <h2>Parcelas</h2><table><thead><tr><th>Parcela</th><th>Vencimento</th><th class="n">Valor</th><th class="n">Pago</th><th>Pago em</th><th class="n">Saldo</th><th>Situação</th></tr></thead><tbody>${ps.map(p => `<tr><td>${esc(p.tipo)} ${esc(p.ref)}</td><td>${dataBR(p.venc)}</td><td class="n">${brl(totalParcela(p))}</td><td class="n">${brl(pagoParcela(p))}</td><td>${(p.pagamentos || []).map(x => dataBR(x.data)).join(', ') || '—'}</td><td class="n">${brl(saldoParcela(p))}</td><td>${esc(statusParcela(p))}</td></tr>`).join('')}</tbody>
  <tfoot><tr><td colspan="2">${ps.length} parcelas</td><td class="n">${brl(soma(ps, totalParcela))}</td><td class="n">${brl(soma(ps, pagoParcela))}</td><td></td><td class="n">${brl(soma(ps, saldoParcela))}</td><td></td></tr></tfoot></table>
  <p class="foot">Documento informativo gerado pelo Painel do cliente TRAXUP. Valores de parcelas vencidas podem receber multa e juros no pagamento.</p></body></html>`;
  imprimirHTML(html, `extrato_${v.numero}.html`);
}
function imprimirHTML(html, nome) { const w = window.open('', '_blank'); if (w) { w.document.write(html + '<script>setTimeout(()=>print(),400)<\/script>'); w.document.close(); } else salvarArquivo(nome, html, 'text/html'); }

function portalContrato(vid) {
  const v = Store.get('vendas', vid), m = pModeloDa(v); if (!m) return toast('Contrato ainda não disponibilizado.', true);
  const corpo = docContrato(v, m).corpo.replace(/<span style="background:#FFF3D6">(.*?)<\/span>/g, '$1');
  modal(`${mHead('Contrato ' + v.numero, m.nome)}<div class="modalBody"><div class="docPreview">${corpo}</div><div class="formActions"><span class="muted">Documento somente para consulta.</span><span class="spacer"></span><button type="button" data-act="closeModal">Fechar</button><button class="primary" data-act="ptImprimirContrato" data-id="${v.id}">${ic('down')}Imprimir / salvar PDF</button></div></div>`, 'wide');
}

Object.assign(ACT, {
  ptSair: () => portalSair(),
  ptVenda: el => { PORTAL.venda = el.dataset.id; portalRender(); },
  ptAba: el => { PORTAL.aba = el.dataset.k; PORTAL.mais = false; portalRender(); },
  ptMais: () => { PORTAL.mais = !PORTAL.mais; portalRender(); },
  ptExtrato: () => portalExtrato(),
  ptContrato: el => portalContrato(el.dataset.id),
  ptImprimirContrato: el => { const v = Store.get('vendas', el.dataset.id), m = pModeloDa(v); const { doc } = docContrato(v, m); imprimirHTML(doc.replace(/<span style="background:yellow">(.*?)<\/span>/g, '$1'), `contrato_${v.numero}.html`); },
  ptBoleto: el => { const b = Store.get('boletos', el.dataset.id); modal(`${mHead('2ª via do boleto', 'Vencimento ' + dataBR(b.venc) + ' · ' + brl(b.valor))}<div class="modalBody"><div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap"><code class="k" style="font-size:14px;padding:6px 10px">${esc(b.linha)}</code><button class="sm" data-act="copyTxt" data-t="${esc(onlyDigits(b.linha))}">${ic('copy')}Copiar linha digitável</button><span class="spacer"></span><button class="sm primary" data-act="ptImprimirBoleto" data-id="${b.id}">${ic('down')}Imprimir boleto</button></div><div style="border:1px solid var(--line);border-radius:10px;padding:16px;overflow:auto">${htmlBoleto(b)}</div></div>`, 'wide'); },
  ptImprimirBoleto: el => imprimirHTML(docBoleto(Store.get('boletos', el.dataset.id)), 'boleto.html'),
  ptSolicitar: el => { const v = Store.get('vendas', el.dataset.v), p = v.parcelas.find(x => x.id === el.dataset.p); modal(`${mHead('Solicitar boleto', p.tipo + ' ' + p.ref + ' · vence ' + dataBR(p.venc))}<form class="modalBody" data-form="ptSolicitar" data-v="${v.id}" data-p="${p.id}"><p>A empresa vai emitir o boleto desta parcela de <b>${brl(saldoParcela(p))}</b> e ele aparecerá aqui no painel para você imprimir.</p><label>Observação (opcional)<textarea name="obs" rows="3" maxlength="500" placeholder="Ex.: prefiro pagar no dia 20"></textarea></label><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Enviar solicitação</button></div></form>`, 'narrow'); },
  ptSenha: () => modal(`${mHead('Segurança', 'Alterar senha')}<form class="modalBody" data-form="ptSenha"><label>Senha atual<input name="atual" type="password" required autocomplete="current-password"></label><label>Nova senha (mín. 6)<input name="nova" type="password" minlength="6" required autocomplete="new-password"></label><label>Repita a nova senha<input name="nova2" type="password" minlength="6" required autocomplete="new-password"></label><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Salvar</button></div></form>`, 'narrow'),
});
Object.assign(FORMS, {
  async portalLogin(v) {
    try { const j = await portalApi('login', { method: 'POST', body: JSON.stringify({ email: v.email, senha: v.senha }) }); lembrar('traxup_portal_email', v.email, !!v.lembrar); PORTAL.token = j.token; try { sessionStorage.setItem('traxup_portal', JSON.stringify({ token: j.token })); } catch (e) { } await portalCarregar(); portalRender(); if (j.trocarSenha) { ACT.ptSenha(); toast('Primeiro acesso: crie uma senha só sua.'); } }
    catch (e) { portalLogin(e.message); }
  },
  async ptSolicitar(v, f) { const j = await portalApi('solicitar', { method: 'POST', body: JSON.stringify({ vendaId: f.dataset.v, parcelaId: f.dataset.p, tipo: 'boleto', obs: v.obs }) }); closeModal(); toast(j.repetida ? 'Você já tinha solicitado este boleto. Aguarde a empresa.' : 'Solicitação enviada. Assim que o boleto for emitido, ele aparece aqui.'); await portalCarregar(); portalRender(); },
  async ptSenha(v) { if (v.nova !== v.nova2) throw Error('As senhas novas não conferem.'); await portalApi('senha', { method: 'POST', body: JSON.stringify({ atual: v.atual, nova: v.nova }) }); closeModal(); toast('Senha alterada.'); },
});

(ehPortal() ? portalBoot : boot)();
