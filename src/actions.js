/* TRAXUP Imobiliário — ações e formulários */
'use strict';

const ACT = {
  closeModal: () => closeModal(),
  go: el => { S.view = el.dataset.v; S.sel = {}; document.body.classList.remove('navOpen'); render(); window.scrollTo(0, 0); },
  toggleNav: () => document.body.classList.toggle('navOpen'),
  sair: () => sair(),
  copyTxt: el => copiar(el.dataset.t),

  /* mapa e lotes */
  selLote: el => { S.sel.lote = el.dataset.id; S.f.placing = false; renderView(); },
  mapaModo: el => { S.f.mapaModo = el.dataset.v; S.f.placing = false; renderView(); },
  placing: () => { S.f.placing = !S.f.placing; renderView(); },
  editLote: el => formLote(Store.get('lotes', el.dataset.id)),
  loteLote: () => formLoteSerie(),
  delLote: el => confirmar('Excluir este lote definitivamente?', async () => { await Store.del('lotes', el.dataset.id); await audit('Excluiu lote ' + el.dataset.id); toast('Lote excluído.'); renderView(); }, 'Excluir'),
  reservar: el => { const l = Store.get('lotes', el.dataset.id); modal(`${mHead(loteDesc(l.id), 'Reservar lote')}<form class="modalBody" data-form="reserva" data-id="${l.id}"><div class="formGrid" style="grid-template-columns:1fr 1fr"><label>Reservado para<input name="reservaPara" required></label><label>Válida até<input type="date" name="reservaAte" value="${addDias(hoje(), 7)}"></label></div><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Reservar</button></div></form>`, 'narrow'); },
  liberar: async el => { const l = Store.get('lotes', el.dataset.id); l.status = 'Disponível'; delete l.reservaPara; delete l.reservaAte; await Store.put('lotes', l); toast('Lote liberado.'); renderView(); },

  /* clientes */
  editCliente: el => formCliente(Store.get('clientes', el.dataset.id)),
  delCliente: el => { if (Store.list('vendas').some(v => v.clienteId === el.dataset.id)) return toast('Cliente tem contrato vinculado e não pode ser excluído.', true); confirmar('Excluir este cliente?', async () => { await Store.del('clientes', el.dataset.id); toast('Cliente excluído.'); renderView(); }, 'Excluir'); },
  cliRapido: () => { const f = $('[data-form=venda]'); const keep = fd(f); closeModal(); formCliente(null, c => { formVenda(keep.loteId); const nf = $('[data-form=venda]'); nf.clienteId.innerHTML += opt(c.id, c.nome, c.id); nf.clienteId.value = c.id; }); },

  /* vendas */
  novaVenda: el => formVenda(el.dataset.lote),
  verVenda: el => verVenda(el.dataset.id),
  planoPadrao: () => { const f = $('[data-form=venda]'); aplicarPlanoPadrao(f); formVenda.upd(); },
  restoMensal: () => { const f = $('[data-form=venda]'); const v = fd(f); f.mTotal.value = centsIn(toCents(v.valor) - toCents(v.eTotal) - toCents(v.iTotal)); formVenda.upd(); },
  distrato: el => confirmar('Distratar a venda? O lote volta a ficar <b>Disponível</b> e as parcelas em aberto deixam de ser cobradas. Os pagamentos já registrados são mantidos no histórico.', async () => { const v = Store.get('vendas', el.dataset.id); v.status = 'Distratado'; hist(v, 'Venda distratada'); await Store.put('vendas', v); const l = Store.get('lotes', v.loteId); if (l) { l.status = 'Disponível'; await Store.put('lotes', l); } for (const b of Store.list('boletos').filter(b => b.vendaId === v.id && ['Emitido', 'Registrado'].includes(b.status))) { b.status = 'Cancelado'; await Store.put('boletos', b); } await audit('Distratou ' + v.numero); toast('Venda distratada.'); renderView(); }, 'Distratar'),
  addParcela: el => { modal(`${mHead('Parcela avulsa', 'Incluir parcela')}<form class="modalBody" data-form="parcelaAvulsa" data-v="${el.dataset.id}"><div class="formGrid" style="grid-template-columns:1fr 1fr 1fr"><label>Tipo${sel('tipo', ['Avulsa', 'Entrada', 'Mensal', 'Intercalada'], 'Avulsa')}</label><label>Vencimento<input type="date" name="venc" required value="${hoje()}"></label><label>Valor (R$)<input name="valor" required></label><label style="grid-column:1/-1">Descrição<input name="ref" placeholder="Ex.: taxa de transferência"></label></div><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Incluir</button></div></form>`, 'narrow'); },
  editParcela: el => { const v = Store.get('vendas', el.dataset.v), p = v.parcelas.find(x => x.id === el.dataset.p); modal(`${mHead(v.numero, 'Corrigir parcela ' + p.tipo + ' ' + p.ref)}<form class="modalBody" data-form="editParcela" data-v="${v.id}" data-p="${p.id}"><div class="formGrid" style="grid-template-columns:1fr 1fr 1fr"><label>Tipo${sel('tipo', ['Entrada', 'Mensal', 'Intercalada', 'Avulsa'], p.tipo)}</label><label>Vencimento<input type="date" name="venc" required value="${p.venc}"></label><label>Valor (R$)<input name="valor" required value="${centsIn(p.valor)}"></label><label style="grid-column:1/-1">Motivo da correção<input name="motivo" required></label></div><div class="formActions">${!(p.pagamentos || []).length ? `<button type="button" class="danger" data-act="delParcela" data-v="${v.id}" data-p="${p.id}">Excluir parcela</button><span class="spacer"></span>` : ''}<button type="button" data-act="closeModal">Cancelar</button><button class="primary">Salvar</button></div></form>`, 'narrow'); },
  delParcela: async el => { const v = Store.get('vendas', el.dataset.v); const p = v.parcelas.find(x => x.id === el.dataset.p); v.parcelas = v.parcelas.filter(x => x.id !== p.id); hist(v, `Parcela excluída: ${p.tipo} ${p.ref} ${dataBR(p.venc)} ${brl(p.valor)}`); await Store.put('vendas', v); closeModal(); verVenda(v.id); renderView(); },
  baixa: el => formBaixa(el.dataset.v, el.dataset.p),
  histParcela: el => { const v = Store.get('vendas', el.dataset.v), p = v.parcelas.find(x => x.id === el.dataset.p); modal(`${mHead(v.numero, 'Pagamentos — ' + p.tipo + ' ' + p.ref)}<div class="modalBody"><div class="tableWrap"><table><thead><tr><th>Data</th><th class="num">Valor</th><th>Forma</th><th>Origem</th><th>Obs.</th><th>Usuário</th><th></th></tr></thead><tbody>${(p.pagamentos || []).map((q, i) => `<tr><td>${dataBR(q.data)}</td><td class="num">${brl(q.valor)}</td><td>${esc(q.forma || '')}</td><td>${esc(q.origem || '')}</td><td>${esc(q.obs || '')}</td><td>${esc(q.usuario || '')}</td><td>${['Administrador', 'Gerente'].includes(S.user.perfil) ? `<button class="sm danger" data-act="estornar" data-v="${v.id}" data-p="${p.id}" data-i="${i}">Estornar</button>` : ''}</td></tr>`).join('')}</tbody></table></div><p class="hint" style="margin-top:10px">Encargos lançados: multa ${brl(p.multa || 0)} · juros ${brl(p.juros || 0)}</p></div>`, 'wide'); },
  estornar: el => confirmar('Estornar este pagamento? A parcela volta a ter saldo.', async () => { const v = Store.get('vendas', el.dataset.v), p = v.parcelas.find(x => x.id === el.dataset.p); const q = p.pagamentos.splice(+el.dataset.i, 1)[0]; if (!p.pagamentos.length) { p.juros = 0; p.multa = 0; } hist(v, `Estorno de ${brl(q.valor)} (${p.tipo} ${p.ref})`); await Store.put('vendas', v); if (q?.fitid) { for (const e of Store.list('extratos')) { const t = e.transacoes.find(t => t.fitid === q.fitid); if (t) { t.status = 'pendente'; delete t.vinculo; await Store.put('extratos', e); } } } await audit(`Estornou ${brl(q.valor)} de ${v.numero}`); toast('Pagamento estornado.'); renderView(); }, 'Estornar'),
  exportParcelas: async () => { const rows = L('vendas').filter(vendaAtiva).flatMap(v => (v.parcelas || []).map(p => [v.numero, nomeFilial(v.filialId), cliNome(v.clienteId), loteDesc(v.loteId), p.tipo, p.ref, dataBR(p.venc), fmtNum(totalParcela(p)), fmtNum(pagoParcela(p)), fmtNum(saldoParcela(p)), statusParcela(p)])); await salvarArquivo(`parcelas_${hoje()}.csv`, '﻿' + csv([['Contrato', 'Filial', 'Cliente', 'Lote', 'Tipo', 'Parcela', 'Vencimento', 'Valor', 'Pago', 'Saldo', 'Situação'], ...rows]), 'text/csv'); },
  exportInad: async () => { const rows = L('vendas').filter(vendaAtiva).filter(v => vencidasVenda(v).length).map(v => { const c = Store.get('clientes', v.clienteId) || {}; return [v.numero, c.nome, fmtCPF(c.cpf), c.whatsapp || c.telefone, loteDesc(v.loteId), vencidasVenda(v).length, fmtNum(soma(vencidasVenda(v), saldoParcela)), situacaoVenda(v)]; }); await salvarArquivo(`inadimplencia_${hoje()}.csv`, '﻿' + csv([['Contrato', 'Cliente', 'CPF', 'Contato', 'Lote', 'Parcelas vencidas', 'Valor vencido', 'Situação'], ...rows]), 'text/csv'); },

  /* boletos */
  emitirBoleto: async el => { try { await emitirBoleto(el.dataset.v, el.dataset.p); renderView(); } catch (e) { toast(e.message, true); } },
  verBoleto: el => verBoleto(el.dataset.id),
  boletoLote: () => { const ini = hoje().slice(0, 7) + '-01', fim = addDias(addMeses(ini, 1), -1); modal(`${mHead('Boletos', 'Emitir boletos em lote')}<form class="modalBody" data-form="boletoLote"><p class="hint" style="margin-bottom:12px">Emite boleto para cada parcela em aberto com vencimento no período que ainda não tem boleto.</p><div class="formGrid" style="grid-template-columns:1fr 1fr"><label>Vencimento de<input type="date" name="ini" value="${ini}" required></label><label>até<input type="date" name="fim" value="${fim}" required></label></div><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Emitir</button></div></form>`, 'narrow'); },
  cancelBoleto: el => confirmar('Cancelar este boleto? (Se já estiver registrado no BB, faça a baixa também no banco.)', async () => { const b = Store.get('boletos', el.dataset.id); b.status = 'Cancelado'; b.canceladoEm = new Date().toISOString(); if (Store.mode === 'server' && b.registroBB) { try { await fetch('api/bb/baixar', { method: 'POST', headers: { 'Content-Type': 'application/json', ...Store.authH() }, body: JSON.stringify({ boletoId: b.id }) }); } catch (e) { } } await Store.put('boletos', b); closeModal(); toast('Boleto cancelado.'); renderView(); }, 'Cancelar boleto'),
  registrarBB: async el => { const b = Store.get('boletos', el.dataset.id); el.disabled = true; try { const r = await fetch('api/bb/registrar', { method: 'POST', headers: { 'Content-Type': 'application/json', ...Store.authH() }, body: JSON.stringify({ boletoId: b.id }) }); const j = await r.json(); if (!r.ok) throw Error(j.error || 'O Banco do Brasil recusou o registro.'); await Store.loadAll(); toast('Boleto registrado no Banco do Brasil.'); verBoleto(b.id); renderView(); } catch (e) { toast(e.message, true); el.disabled = false; } },
  baixarBoleto: async el => { const b = Store.get('boletos', el.dataset.id); const html = docBoleto(b); if (Store.mode === 'server' || Store.mode === 'local') { const w = window.open('', '_blank'); if (w) { w.document.write(html + '<script>setTimeout(()=>print(),300)<\/script>'); w.document.close(); return; } } await salvarArquivo(`boleto_${b.nossoNumero}.html`, html, 'text/html'); },
  discordBoleto: el => { const b = Store.get('boletos', el.dataset.id); closeModal(); abrirDiscordCom(`🧾 **Boleto emitido**\n\nPagador: **${b.pagador?.nome}**\nVencimento: ${dataBR(b.venc)} · Valor: **${brl(b.valor)}**\nLinha digitável:\n\`${onlyDigits(b.linha)}\``, b.vendaId); },

  /* conciliação */
  importarExtrato: () => { const fs = filiaisUsuario(); modal(`${mHead('Conciliação', 'Importar extrato bancário')}<form class="modalBody" data-form="importExtrato"><div class="formGrid" style="grid-template-columns:1fr 1fr"><label>Filial / conta${sel('filialId', fs.map(f => [f.id, f.nome + (f.bb?.conta ? ' · CC ' + f.bb.conta : '')]), filialPadrao())}</label><label>Arquivo (OFX ou CSV)<input type="file" name="arquivo" accept=".ofx,.csv,.txt" required></label></div><p class="hint" style="margin-top:10px">No Banco do Brasil: Extrato → Exportar → <b>Money (OFX)</b>. Lançamentos já importados (mesmo identificador) são ignorados.</p><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Importar</button></div></form>`, 'narrow'); },
  ofxExemplo: async () => { const ps = L('vendas').filter(vendaAtiva).flatMap(v => (v.parcelas || []).filter(p => saldoParcela(p) > 0 && p.venc <= addDias(hoje(), 20)).slice(0, 2).map(p => ({ v, p }))).slice(0, 6); const tx = ps.map(({ v, p }, i) => { const b = Store.list('boletos').find(x => x.parcelaId === p.id && x.status !== 'Cancelado'); return `<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>${(p.venc < hoje() ? hoje() : p.venc).replace(/-/g, '')}120000<TRNAMT>${(saldoParcela(p) / 100).toFixed(2)}<FITID>EX${Date.now()}${i}<MEMO>${b ? 'LIQ COBRANCA ' + b.nossoNumero : 'PIX RECEBIDO ' + cliNome(v.clienteId).toUpperCase()}</STMTTRN>`; }); tx.push(`<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>${hoje().replace(/-/g, '')}120000<TRNAMT>-35.90<FITID>EXT${Date.now()}<MEMO>TARIFA PACOTE SERVICOS</STMTTRN>`); const ofx = `OFXHEADER:100\nDATA:OFXSGML\nVERSION:102\n\n<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><CURDEF>BRL<BANKACCTFROM><BANKID>001<ACCTID>45678-9</BANKACCTFROM><BANKTRANLIST>${tx.join('\n')}</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>`; await salvarArquivo('extrato_exemplo.ofx', ofx, 'application/x-ofx'); if (Store.mode === 'db' && !Store.downloads) { await importarTextoExtrato(ofx, 'extrato_exemplo.ofx', filialPadrao()); } },
  conciliar: async el => { const { e, t } = acharTx(el.dataset.tx); const s = $(`select.sugSel[data-tx="${CSS.escape(t.fitid)}"]`); const [vid, pid] = s.value.split('|'); try { await conciliarTx(e, t, vid, pid); await Store.put('extratos', e); toast('Lançamento conciliado e baixa registrada.'); renderView(); } catch (err) { toast(err.message, true); } },
  conciliarTudo: async () => { const e = Store.get('extratos', S.f.ext); let n = 0; const usadas = new Set(); for (const t of e.transacoes) { if ((t.status || 'pendente') !== 'pendente' || t.valor <= 0) continue; const s = sugerirConciliacao(t, L('vendas'), L('boletos')).filter(x => !usadas.has(x.parcelaId)); if (s[0] && s[0].score >= 65 && (!s[1] || s[1].vendaId === s[0].vendaId || s[0].score - s[1].score >= 15)) { await conciliarTx(e, t, s[0].vendaId, s[0].parcelaId); usadas.add(s[0].parcelaId); n++; } } await Store.put('extratos', e); toast(n ? `${n} lançamento(s) conciliado(s). Confira os demais manualmente.` : 'Nenhuma sugestão forte o bastante para conciliar automaticamente.'); renderView(); },
  concManual: el => { const { t } = acharTx(el.dataset.tx); const ps = L('vendas').filter(vendaAtiva).flatMap(v => (v.parcelas || []).filter(p => saldoParcela(p) > 0).map(p => ({ v, p }))).sort((a, b) => a.p.venc.localeCompare(b.p.venc)); modal(`${mHead(dataBR(t.data) + ' · ' + brl(t.valor), 'Escolher parcela')}<form class="modalBody" data-form="concManual" data-tx="${esc(t.fitid)}"><p class="hint">${esc(t.memo)}</p><label style="margin-top:10px">Buscar<input id="cmBusca" placeholder="Cliente ou contrato"></label><label style="margin-top:10px">Parcela<select name="alvo" id="cmSel" size="10" required>${ps.map(({ v, p }) => opt(v.id + '|' + p.id, `${cliNome(v.clienteId)} · ${v.numero} · ${p.tipo} ${p.ref} · venc ${dataBR(p.venc)} · saldo ${brl(saldoParcela(p))}`, '')).join('')}</select></label><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Conciliar</button></div></form>`); $('#cmBusca').addEventListener('input', ev => { const q = norm(ev.target.value); $$('#cmSel option').forEach(o => o.hidden = q && !norm(o.textContent).includes(q)); }); },
  ignorarTx: async el => { const { e, t } = acharTx(el.dataset.tx); t.status = 'ignorado'; await Store.put('extratos', e); renderView(); },
  reativarTx: async el => { const { e, t } = acharTx(el.dataset.tx); t.status = 'pendente'; await Store.put('extratos', e); renderView(); },
  desconciliar: el => confirmar('Desfazer a conciliação? O pagamento lançado por ela será estornado da parcela.', async () => { const { e, t } = acharTx(el.dataset.tx); const v = Store.get('vendas', t.vinculo?.vendaId); const p = v?.parcelas.find(x => x.id === t.vinculo?.parcelaId); if (p) { const i = p.pagamentos.findIndex(q => q.fitid === t.fitid); if (i >= 0) { const q = p.pagamentos.splice(i, 1)[0]; const extra = Math.max(0, q.valor - p.valor); p.juros = Math.max(0, (p.juros || 0) - extra); } hist(v, 'Conciliação desfeita: ' + brl(t.valor)); await Store.put('vendas', v); const b = Store.list('boletos').find(x => x.parcelaId === p.id && x.status === 'Pago'); if (b && saldoParcela(p) > 0) { b.status = b.registroBB ? 'Registrado' : 'Emitido'; await Store.put('boletos', b); } } t.status = 'pendente'; delete t.vinculo; await Store.put('extratos', e); toast('Conciliação desfeita.'); renderView(); }, 'Desfazer'),
  delExtrato: el => confirmar('Excluir o extrato importado? As baixas já conciliadas continuam nas parcelas.', async () => { await Store.del('extratos', el.dataset.id); S.f.ext = null; renderView(); }, 'Excluir'),

  /* comissões */
  pagarComissao: el => { const v = Store.get('vendas', el.dataset.id); modal(`${mHead(v.numero + ' · ' + (v.corretor || ''), 'Pagamento de comissão')}<form class="modalBody" data-form="comissao" data-id="${v.id}"><div class="notice info">Comissão ${brl(comissaoTotal(v))} · pago ${brl(comissaoPaga(v))} · <b>saldo ${brl(comissaoSaldo(v))}</b></div><div class="formGrid" style="grid-template-columns:1fr 1fr"><label>Valor (R$)<input name="valor" required value="${centsIn(comissaoSaldo(v))}"></label><label>Data<input type="date" name="data" value="${hoje()}" required></label><label style="grid-column:1/-1">Observação<input name="obs"></label></div><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Registrar</button></div></form>`, 'narrow'); },

  suspComissao: async el => { const v = Store.get('vendas', el.dataset.id); v.comissaoSuspensa = !v.comissaoSuspensa; hist(v, v.comissaoSuspensa ? 'Comissão suspensa por inadimplência' : 'Comissão reativada'); await Store.put('vendas', v); renderView(); },

  /* discord */
  editHook: el => { const h = Store.get('webhooks', el.dataset.id) || { filialId: filialPadrao() }; modal(`${mHead('Discord', h.id ? h.nome : 'Novo canal')}<form class="modalBody" data-form="hook" data-id="${h.id || ''}"><div class="formGrid" style="grid-template-columns:1fr 1fr"><label>Nome do canal<input name="nome" required value="${esc(h.nome || '')}" placeholder="#financeiro"></label><label>Filial${sel('filialId', filiaisUsuario().map(f => [f.id, f.nome]), h.filialId)}</label><label style="grid-column:1/-1">URL do webhook<input name="url" required value="${esc(h.url || '')}" placeholder="https://discord.com/api/webhooks/…"></label></div><div class="formActions">${h.id ? `<button type="button" class="danger" data-act="delHook" data-id="${h.id}">Excluir</button><span class="spacer"></span>` : ''}<button type="button" data-act="closeModal">Cancelar</button><button class="primary">Salvar</button></div></form>`, 'narrow'); },
  delHook: async el => { await Store.del('webhooks', el.dataset.id); closeModal(); renderView(); },
  copyDiscord: () => { const d = S.discord; copiar(d.venda ? renderModelo(d.texto, contextoVenda(Store.get('vendas', d.venda)), { html: false }) : d.texto); },
  enviarDiscord: async el => { const d = S.discord; const txt = d.venda ? renderModelo(d.texto, contextoVenda(Store.get('vendas', d.venda)), { html: false }) : d.texto; el.disabled = true; try { const r = await enviarDiscord(txt, $$('.dHook:checked').map(x => x.value)); toast(r.ok === r.total ? `Mensagem enviada para ${r.ok} canal(is).` : `Enviada para ${r.ok} de ${r.total} canais. Veja o histórico.`, r.ok !== r.total); } catch (e) { toast(e.message, true); } renderView(); },
  salvarModeloDiscord: () => { modal(`${mHead('Discord', 'Salvar modelo de mensagem')}<form class="modalBody" data-form="modeloDiscord"><label>Nome do modelo<input name="nome" required></label><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Salvar</button></div></form>`, 'narrow'); },
  discordInad: () => abrirDiscordCom(MODELOS_DISCORD['Lista de inadimplentes']()),
  discordCobranca: el => { const v = Store.get('vendas', el.dataset.id); const ps = vencidasVenda(v); abrirDiscordCom(`⚠️ **Cobrança — {{cliente.nome}}**\nContrato {{venda.numero}} · {{lote.empreendimento}} Q{{lote.quadra}} L{{lote.numero}}\nContato: {{cliente.telefone}}\n\nParcelas vencidas:\n${ps.map(p => `• ${p.tipo} ${p.ref} — venc. ${dataBR(p.venc)} — ${brl(saldoParcela(p))}`).join('\n')}\n\nTotal vencido: **${brl(soma(ps, saldoParcela))}**`, v.id); },

  /* modelos de contrato */
  novoModelo: async () => { const m = await Store.put('modelos', { tipo: 'contrato', nome: 'Promessa de compra e venda (modelo base)', filialId: filialPadrao(), conteudo: MODELO_PADRAO, criadoEm: new Date().toISOString() }); S.f.mod = m.id; renderView(); },
  insVar: el => { const ta = $('#modTexto'); if (!ta) return; const s = ta.selectionStart, e = ta.selectionEnd, ins = `{{${el.dataset.k}}}`; ta.value = ta.value.slice(0, s) + ins + ta.value.slice(e); ta.focus(); ta.setSelectionRange(s + ins.length, s + ins.length); },
  substituirVar: () => { const de = $('#subDe').value; if (!de.trim()) return toast('Informe o texto a substituir.', true); const ta = $('#modTexto'); const n = ta.value.split(de).length - 1; if (!n) return toast('Texto não encontrado no modelo.', true); ta.value = ta.value.split(de).join(`{{${$('#subPara').value}}}`); toast(`${n} ocorrência(s) substituída(s). Lembre de salvar.`); },
  salvarModelo: async () => { const m = Store.get('modelos', S.f.mod); m.nome = $('#modNome').value || m.nome; m.filialId = $('#modFil').value; m.conteudo = $('#modTexto').value; await Store.put('modelos', m); toast('Modelo salvo.'); renderView(); },
  delModelo: el => confirmar('Excluir este modelo?', async () => { await Store.del('modelos', el.dataset.id); S.f.mod = null; renderView(); }, 'Excluir'),
  previewContrato: () => { const ta = $('#modTexto'); const m = Store.get('modelos', S.f.mod); if (ta && ta.value !== m.conteudo) m.conteudo = ta.value; previewContrato(S.f.modVenda, S.f.mod); },
  gerarContrato: el => { const ms = L('modelos').filter(m => m.tipo === 'contrato'); if (!ms.length) { toast('Crie ou importe um modelo de contrato primeiro.', true); S.view = 'modelos'; return render(); } const v = Store.get('vendas', el.dataset.id); const m = ms.find(x => x.filialId === v.filialId) || ms[0]; if (ms.length === 1) return previewContrato(v.id, m.id); modal(`${mHead(v.numero, 'Escolha o modelo')}<form class="modalBody" data-form="escolheModelo" data-v="${v.id}"><label>Modelo${sel('mid', ms.map(x => [x.id, x.nome]), m.id)}</label><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Gerar</button></div></form>`, 'narrow'); },
  copyContrato: el => { const v = Store.get('vendas', el.dataset.v), m = Store.get('modelos', el.dataset.m); copiar(renderModelo(m.conteudo, contextoVenda(v), { html: false })); },
  baixarContrato: async el => { const v = Store.get('vendas', el.dataset.v), m = Store.get('modelos', el.dataset.m); await salvarArquivo(`Contrato_${v.numero}_${norm(cliNome(v.clienteId)).replace(/\W+/g, '_')}.doc`, '﻿' + docContrato(v, m).doc, 'application/msword'); hist(v, 'Contrato gerado com o modelo ' + m.nome); await Store.put('vendas', v); },

  /* administração */
  editUser: el => formUser(Store.get('usuarios', el.dataset.id)),
  editFilial: el => formFilial(Store.get('filiais', el.dataset.id)),
  editEmp: el => formEmp(Store.get('empreendimentos', el.dataset.id)),
  backup: async () => { const dump = {}; for (const c of COLS) dump[c] = Store.data[c]; await salvarArquivo(`traxup_imobiliario_backup_${hoje()}.json`, JSON.stringify(dump, null, 1), 'application/json'); await audit('Exportou backup'); },
  demo: () => confirmar('Adicionar dados de demonstração na filial selecionada?', async () => { await carregarDemo(filialPadrao()); toast('Dados de demonstração carregados.'); render(); }, 'Carregar')
};
const acharTx = fitid => { for (const e of Store.list('extratos')) { const t = e.transacoes.find(t => t.fitid === fitid); if (t) return { e, t }; } throw Error('Lançamento não encontrado.'); };
async function importarTextoExtrato(txt, nome, filialId) {
  const r = /<OFX>|<STMTTRN>/i.test(txt) ? parseOFX(txt) : parseCSVExtrato(txt);
  const ja = new Set(Store.list('extratos').flatMap(e => e.transacoes.map(t => t.fitid)));
  const novos = r.transacoes.filter(t => !ja.has(t.fitid)).map(t => ({ ...t, status: 'pendente' }));
  if (!r.transacoes.length) throw Error('Nenhum lançamento encontrado no arquivo.');
  if (!novos.length) throw Error('Todos os lançamentos deste arquivo já foram importados.');
  const e = await Store.put('extratos', { filialId, arquivo: nome, banco: r.banco === '001' ? 'Banco do Brasil' : r.banco, conta: r.conta, importadoEm: new Date().toISOString(), importadoPor: S.user.nome, transacoes: novos });
  S.f.ext = e.id; S.f.cst = 'pendente'; toast(`${novos.length} lançamento(s) importado(s)${r.transacoes.length > novos.length ? `, ${r.transacoes.length - novos.length} já existiam` : ''}.`); renderView();
}

const FORMS = {
  async login(v) {
    const login = norm(v.login).trim();
    if (Store.mode === 'server') {
      const r = await fetch('api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: v.login, senha: v.senha }) }); const j = await r.json().catch(() => ({}));
      if (!r.ok) return telaLogin(j.error || 'Login ou senha inválidos.'); Store.token = j.token; await Store.loadAll(); S.user = Store.get('usuarios', j.userId); return entrar();
    }
    const u = Store.list('usuarios').find(x => norm(x.login) === login || (x.email && norm(x.email) === login));
    if (!u || u.ativo === false) return telaLogin('Login ou senha inválidos.');
    const h = await hashSenha(v.senha, u.salt); if (h.hash !== u.hash) return telaLogin('Login ou senha inválidos.');
    u.ultimoAcesso = new Date().toISOString(); S.user = u; Store.put('usuarios', u).catch(() => { }); entrar();
  },
  async setup(v) {
    const cid = v.cidade || ''; const [cidade, uf] = cid.split('/').map(s => s.trim());
    const filial = { id: uid(), nome: v.filial, razao: v.filial, cnpj: v.cnpj, cidade: cidade || '', uf: (uf || '').toUpperCase(), multa: 2, jurosMes: 1, bb: { carteira: '17', variacao: '35' } };
    const h = await hashSenha(v.senha); const user = { id: uid(), nome: v.nome, login: v.login.trim(), perfil: 'Administrador', filiais: ['*'], ativo: true, salt: h.salt, hash: h.hash, criadoEm: new Date().toISOString() };
    if (Store.mode === 'server') {
      const r = await fetch('api/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filial, usuario: user, senha: v.senha }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(j.error || 'Falha na configuração.');
      Store.token = j.token; await Store.loadAll();
    } else { await Store.put('filiais', filial); await Store.put('usuarios', user); }
    S.user = Store.get('usuarios', user.id) || user;
    await Store.put('modelos', { tipo: 'contrato', nome: 'Promessa de compra e venda (modelo base)', filialId: filial.id, conteudo: MODELO_PADRAO, criadoEm: new Date().toISOString() });
    if (v.demo) await carregarDemo(filial.id);
    await audit('Configuração inicial do sistema'); entrar();
  },
  async lote(v, f) {
    const l = Store.get('lotes', f.dataset.id) || {}; const emp = Store.get('empreendimentos', v.empId);
    const dup = Store.list('lotes').find(x => x.id !== l.id && x.empId === v.empId && norm(x.quadra) === norm(v.quadra) && norm(x.numero) === norm(v.numero)); if (dup) throw Error('Já existe esse lote neste empreendimento.');
    Object.assign(l, { empId: v.empId, filialId: emp.filialId, quadra: v.quadra.trim().toUpperCase(), numero: v.numero.trim(), area: v.area, frente: v.frente, fundo: v.fundo, status: v.status, preco: toCents(v.preco), custo: v.custo ? toCents(v.custo) : undefined, matricula: v.matricula, confrontacoes: v.confrontacoes, obs: v.obs });
    const s = await Store.put('lotes', l); S.sel.lote = s.id; closeModal(); toast('Lote salvo.'); renderView();
  },
  async loteSerie(v) {
    const emp = Store.get('empreendimentos', v.empId); const qs = v.quadras.split(/[,;\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean); let n = 0;
    for (const q of qs) for (let i = 1; i <= +v.qtd; i++) { if (Store.list('lotes').some(x => x.empId === emp.id && norm(x.quadra) === norm(q) && String(x.numero) === String(i))) continue; await Store.put('lotes', { empId: emp.id, filialId: emp.filialId, quadra: q, numero: String(i), area: v.area, frente: v.frente, fundo: v.fundo, preco: toCents(v.preco), status: 'Disponível' }); n++; }
    closeModal(); toast(`${n} lote(s) criado(s).`); S.f.mapaEmp = emp.id; renderView();
  },
  async cliente(v, f) {
    const c = Store.get('clientes', f.dataset.id) || { filialId: filialPadrao() }; Object.assign(c, v); c.nome = c.nome.trim();
    const dupe = c.cpf && Store.list('clientes').find(x => x.id !== c.id && onlyDigits(x.cpf) && onlyDigits(x.cpf) === onlyDigits(c.cpf)); if (dupe) throw Error('CPF/CNPJ já cadastrado para ' + dupe.nome + '.');
    const s = await Store.put('clientes', c); closeModal(); toast('Cliente salvo.'); const after = formCliente.after; formCliente.after = null; if (after) after(s); else renderView();
  },
  async reserva(v, f) { const l = Store.get('lotes', f.dataset.id); Object.assign(l, { status: 'Reservado', reservaPara: v.reservaPara, reservaAte: v.reservaAte }); await Store.put('lotes', l); closeModal(); toast('Lote reservado.'); renderView(); },
  async venda(v) {
    const lote = Store.get('lotes', v.loteId); if (!v.clienteId) throw Error('Selecione o cliente.'); if (lote.status === 'Vendido') throw Error('Este lote já foi vendido.');
    const valor = toCents(v.valor); const parcelas = [...serieParcelas('Entrada', toCents(v.eTotal), +v.eQtd, v.eVenc, 1), ...serieParcelas('Mensal', toCents(v.mTotal), +v.mQtd, v.mVenc, 1), ...serieParcelas('Intercalada', toCents(v.iTotal), +v.iQtd, v.iVenc, +v.iInt || 12)];
    if (!parcelas.length) throw Error('Informe ao menos uma série de parcelas.');
    const sp = soma(parcelas, p => p.valor); if (sp !== valor && !confirmVenda.ok) { confirmVenda.ok = true; throw Error(`A soma das parcelas (${brl(sp)}) difere do valor da venda (${brl(valor)}). Clique novamente para confirmar assim mesmo.`); } confirmVenda.ok = false;
    const nums = Store.list('vendas').filter(x => x.filialId === lote.filialId).map(x => +String(x.numero).replace(/\D/g, '') || 0);
    const venda = await Store.put('vendas', { filialId: lote.filialId, numero: 'VD-' + String(Math.max(0, ...nums) + 1).padStart(4, '0'), loteId: lote.id, clienteId: v.clienteId, data: v.data, valor, corretor: v.corretor.trim(), comissaoPct: parseFloat(String(v.comissaoPct).replace(',', '.')) || 0, comissoesPagas: [], indice: v.indice, reajuste: v.reajuste, status: 'Ativo', classificacao: 'Automático', parcelas, historico: [{ data: new Date().toISOString(), usuario: S.user.nome, acao: `Venda criada: ${brl(valor)}, ${parcelas.length} parcelas` }] });
    lote.status = 'Vendido'; delete lote.reservaPara; await Store.put('lotes', lote); await audit(`Venda ${venda.numero} — ${loteDesc(lote.id)} para ${cliNome(v.clienteId)}`);
    closeModal(); toast('Venda registrada com ' + parcelas.length + ' parcelas.'); renderView(); verVenda(venda.id);
  },
  async parcelaAvulsa(v, f) { const venda = Store.get('vendas', f.dataset.v); venda.parcelas.push({ id: uid(), tipo: v.tipo, ref: v.ref || 'avulsa', venc: v.venc, valor: toCents(v.valor), juros: 0, multa: 0, pagamentos: [] }); hist(venda, `Parcela incluída: ${v.tipo} ${dataBR(v.venc)} ${brl(toCents(v.valor))}`); await Store.put('vendas', venda); closeModal(); verVenda(venda.id); renderView(); },
  async editParcela(v, f) { const venda = Store.get('vendas', f.dataset.v), p = venda.parcelas.find(x => x.id === f.dataset.p); const antes = `${p.tipo} ${dataBR(p.venc)} ${brl(p.valor)}`; Object.assign(p, { tipo: v.tipo, venc: v.venc, valor: toCents(v.valor) }); hist(venda, `Parcela corrigida (${antes} → ${p.tipo} ${dataBR(p.venc)} ${brl(p.valor)}). Motivo: ${v.motivo}`); await Store.put('vendas', venda); closeModal(); verVenda(venda.id); renderView(); },
  async baixa(v, f) { const venda = Store.get('vendas', f.dataset.v), p = venda.parcelas.find(x => x.id === f.dataset.p); const valor = toCents(v.valor); if (valor <= 0) throw Error('Informe o valor recebido.'); await registrarPagamento(venda, p, { valor, data: v.data, juros: toCents(v.juros), multa: toCents(v.multa), obs: v.obs, forma: v.forma }); closeModal(); toast('Baixa registrada.'); renderView(); },
  async boletoLote(v) { const alvos = L('vendas').filter(vendaAtiva).flatMap(x => (x.parcelas || []).filter(p => saldoParcela(p) > 0 && p.venc >= v.ini && p.venc <= v.fim).map(p => ({ x, p }))); let n = 0, sem = 0; for (const { x, p } of alvos) { if (Store.list('boletos').some(b => b.parcelaId === p.id && b.status !== 'Cancelado')) continue; const b = await emitirBoleto(x.id, p.id, true); b ? n++ : sem++; } closeModal(); toast(`${n} boleto(s) emitido(s)${sem ? `; ${sem} sem convênio BB configurado` : ''}.`, !!sem); renderView(); },
  async importExtrato(v, f) { const file = f.arquivo.files[0]; if (!file) throw Error('Selecione o arquivo.'); let txt = await file.text(); if (/\uFFFD/.test(txt)) txt = new TextDecoder('windows-1252').decode(await file.arrayBuffer()); closeModal(); await importarTextoExtrato(txt, file.name, v.filialId); },
  async concManual(v, f) { const { e, t } = acharTx(f.dataset.tx); const [vid, pid] = v.alvo.split('|'); await conciliarTx(e, t, vid, pid); await Store.put('extratos', e); closeModal(); toast('Conciliado.'); renderView(); },
  async comissao(v, f) { const venda = Store.get('vendas', f.dataset.id); (venda.comissoesPagas ||= []).push({ valor: toCents(v.valor), data: v.data, obs: v.obs, usuario: S.user.nome }); hist(venda, `Comissão paga: ${brl(toCents(v.valor))}`); await Store.put('vendas', venda); closeModal(); toast('Pagamento de comissão registrado.'); renderView(); },
  async hook(v, f) { if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+/.test(v.url.trim())) throw Error('URL de webhook do Discord inválida.'); const h = Store.get('webhooks', f.dataset.id) || {}; Object.assign(h, { nome: v.nome, filialId: v.filialId, url: v.url.trim() }); await Store.put('webhooks', h); closeModal(); toast('Canal salvo.'); renderView(); },
  async modeloDiscord(v) { const m = await Store.put('modelos', { tipo: 'discord', nome: v.nome, filialId: filialPadrao(), conteudo: S.discord.texto }); S.discord.modelo = 'salvo:' + m.id; closeModal(); toast('Modelo salvo.'); renderView(); },
  async escolheModelo(v, f) { closeModal(); previewContrato(f.dataset.v, v.mid); },
  async user(v, f) {
    const u = Store.get('usuarios', f.dataset.id) || { criadoEm: new Date().toISOString() };
    if (Store.list('usuarios').some(x => x.id !== u.id && norm(x.login) === norm(v.login))) throw Error('Já existe um usuário com esse login.');
    const filiais = Object.keys(v).filter(k => k.startsWith('fil_')).map(k => k.slice(4));
    if (u.id === S.user.id && v.perfil !== 'Administrador' && S.user.perfil === 'Administrador') throw Error('Você não pode remover o seu próprio perfil de administrador.');
    Object.assign(u, { nome: v.nome, email: v.email, login: v.login.trim(), perfil: v.perfil, ativo: v.ativo === '1', filiais: filiais.length ? filiais : [filialPadrao()] });
    if (v.senha) { if (v.senha.length < 6) throw Error('A senha precisa ter ao menos 6 caracteres.'); Object.assign(u, await hashSenha(v.senha)); }
    await Store.put('usuarios', u); await audit(`Usuário ${u.login} salvo (${u.perfil})`); closeModal(); toast('Usuário salvo.'); renderView();
  },
  async filial(v, f) {
    const fl = Store.get('filiais', f.dataset.id) || {}; if (v.bb_convenio && !/^\d{7}$/.test(v.bb_convenio)) throw Error('O convênio deve ter 7 dígitos.');
    Object.assign(fl, { nome: v.nome, razao: v.razao, cnpj: v.cnpj, telefone: v.telefone, cidade: v.cidade, uf: v.uf.toUpperCase(), endereco: v.endereco, multa: parseFloat(String(v.multa).replace(',', '.')) || 0, jurosMes: parseFloat(String(v.jurosMes).replace(',', '.')) || 0, bb: { agencia: v.bb_agencia, conta: v.bb_conta, convenio: v.bb_convenio, carteira: v.bb_carteira, variacao: v.bb_variacao, beneficiario: v.bb_beneficiario, cnpj: v.bb_cnpj } });
    await Store.put('filiais', fl); await audit('Filial salva: ' + fl.nome); closeModal(); toast('Filial salva.'); render();
  },
  async emp(v, f) { const e = Store.get('empreendimentos', f.dataset.id) || {}; Object.assign(e, v); await Store.put('empreendimentos', e); for (const l of Store.list('lotes').filter(l => l.empId === e.id && l.filialId !== e.filialId)) { l.filialId = e.filialId; await Store.put('lotes', l); } closeModal(); toast('Empreendimento salvo.'); renderView(); },
  async minhaSenha(v, f) {
    if (Store.mode === 'server') { const r = await fetch('api/senha', { method: 'POST', headers: { 'Content-Type': 'application/json', ...Store.authH() }, body: JSON.stringify(v) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(j.error || 'Não foi possível alterar.'); f.reset(); return toast('Senha alterada.'); }
    const u = Store.get('usuarios', S.user.id); const h = await hashSenha(v.atual, u.salt); if (h.hash !== u.hash) throw Error('Senha atual incorreta.'); Object.assign(u, await hashSenha(v.nova)); await Store.put('usuarios', u); f.reset(); toast('Senha alterada.');
  }
};
const confirmVenda = { ok: false };

document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return; const fn = ACT[el.dataset.act]; if (!fn) return;
  e.preventDefault(); try { await fn(el, e); } catch (err) { console.error(err); toast(err.message || String(err), true); }
});
document.addEventListener('submit', async e => {
  const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault(); const fn = FORMS[f.dataset.form]; if (!fn) return;
  const btns = $$('button', f); btns.forEach(b => b.disabled = true);
  try { await fn(fd(f), f); } catch (err) { console.error(err); toast(err.message || String(err), true); } finally { btns.forEach(b => { if (b.isConnected) b.disabled = false; }); }
});
document.addEventListener('change', e => { if (e.target.id === 'filialSel') { S.filial = e.target.value; S.sel = {}; S.f.ext = null; S.f.mod = null; render(); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#overlay')) closeModal(); });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (S.user && TITULOS[h] && h !== S.view && pode(S.user, h)) { S.view = h; render(); } });
boot();
