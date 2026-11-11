/* TRAXUP Imobiliário — ações e formulários */
'use strict';

const ACT = {
  closeModal: () => closeModal(),
  go: el => { S.view = el.dataset.v; S.sel = {}; document.body.classList.remove('navOpen'); render(); window.scrollTo(0, 0); },
  tema: () => { const t = document.body.classList.contains('dark') ? 'light' : 'dark'; aplicarTema(t); try { localStorage.setItem('traxup_tema', t); } catch (e) { } Store.mode === 'portal' ? portalRender() : render(); },
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
  baixaVoltar: () => { const f = $('[data-form=baixa]'); if (!f) return; f.dataset.etapa = '1'; $('#bEtapa2').hidden = true; $('#bEtapa1').hidden = false; $('#bData')?.focus(); },
  histParcela: el => { const v = Store.get('vendas', el.dataset.v), p = v.parcelas.find(x => x.id === el.dataset.p); modal(`${mHead(v.numero, 'Pagamentos — ' + p.tipo + ' ' + p.ref)}<div class="modalBody"><div class="tableWrap"><table><thead><tr><th>Data</th><th class="num">Valor</th><th>Forma</th><th>Origem</th><th>Obs.</th><th>Usuário</th><th></th></tr></thead><tbody>${(p.pagamentos || []).map((q, i) => `<tr><td>${dataBR(q.data)}</td><td class="num">${brl(q.valor)}</td><td>${esc(q.forma || '')}</td><td>${esc(q.origem || '')}</td><td>${esc(q.obs || '')}</td><td>${esc(q.usuario || '')}</td><td>${['Administrador', 'Gerente'].includes(S.user.perfil) ? `<button class="sm danger" data-act="estornar" data-v="${v.id}" data-p="${p.id}" data-i="${i}">Estornar</button>` : ''}</td></tr>`).join('')}</tbody></table></div><p class="hint" style="margin-top:10px">Encargos lançados: multa ${brl(p.multa || 0)} · juros ${brl(p.juros || 0)}</p></div>`, 'wide'); },
  estornar: el => confirmar('Estornar este pagamento? A parcela volta a ter saldo.', async () => { const v = Store.get('vendas', el.dataset.v), p = v.parcelas.find(x => x.id === el.dataset.p); const q = p.pagamentos.splice(+el.dataset.i, 1)[0]; if (!p.pagamentos.length) { p.juros = 0; p.multa = 0; } hist(v, `Estorno de ${brl(q.valor)} (${p.tipo} ${p.ref})`); await Store.put('vendas', v); if (q?.fitid) { for (const e of Store.list('extratos')) { const t = e.transacoes.find(t => t.fitid === q.fitid); if (t) { t.status = 'pendente'; delete t.vinculo; await Store.put('extratos', e); } } } await audit(`Estornou ${brl(q.valor)} de ${v.numero}`); toast('Pagamento estornado.'); renderView(); }, 'Estornar'),
  exportParcelas: async () => { const rows = linhasParcelas().map(({ v, p }) => [v.numero, nomeFilial(v.filialId), cliNome(v.clienteId), loteDesc(v.loteId), p.tipo, p.ref, dataBR(p.venc), fmtNum(totalParcela(p)), fmtNum(pagoParcela(p)), fmtNum(saldoParcela(p)), statusParcela(p), (p.pagamentos || []).map(x => dataBR(x.data)).join(' ')]); await salvarArquivo(`parcelas_${hoje()}.csv`, '﻿' + csv([['Contrato', 'Empresa', 'Cliente', 'Lote', 'Tipo', 'Parcela', 'Vencimento', 'Valor', 'Pago', 'Saldo', 'Situação', 'Datas de pagamento'], ...rows]), 'text/csv'); },
  exportInad: async () => { const rows = linhasInad().map(x => { const c = Store.get('clientes', x.v.clienteId) || {}; return [x.v.numero, nomeFilial(x.v.filialId), c.nome, fmtCPF(c.cpf), c.whatsapp || c.telefone, loteDesc(x.v.loteId), x.venc.length, x.dias, fmtNum(x.valor), x.sit]; }); await salvarArquivo(`inadimplencia_${hoje()}.csv`, '﻿' + csv([['Contrato', 'Empresa', 'Cliente', 'CPF', 'Contato', 'Lote', 'Parcelas vencidas', 'Maior atraso (dias)', 'Valor vencido', 'Situação'], ...rows]), 'text/csv'); },
  exportVendas: async () => { const rows = linhasVendas().map(v => [v.numero, nomeFilial(v.filialId), cliNome(v.clienteId), loteDesc(v.loteId), dataBR(v.data), v.corretor || '', fmtNum(v.valor), fmtNum(recebidoVenda(v)), fmtNum(saldoVenda(v)), vencidasVenda(v).length, situacaoVenda(v)]); await salvarArquivo(`vendas_${hoje()}.csv`, '﻿' + csv([['Contrato', 'Empresa', 'Cliente', 'Lote', 'Data', 'Corretor', 'Valor', 'Recebido', 'Saldo', 'Parcelas vencidas', 'Situação'], ...rows]), 'text/csv'); },
  limparFiltros: el => { for (const k of el.dataset.k.split(',')) delete S.f[k]; renderView(); },

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
  editHook: el => { const h = Store.get('webhooks', el.dataset.id) || { filialId: filialPadrao() }; modal(`${mHead('Discord', h.id ? h.nome : 'Novo canal')}<form class="modalBody" data-form="hook" data-id="${h.id || ''}"><div class="formGrid" style="grid-template-columns:1fr 1fr"><label>Nome do canal<input name="nome" required value="${esc(h.nome || '')}" placeholder="#financeiro"></label><label>Filial${sel('filialId', filiaisUsuario().map(f => [f.id, f.nome]), h.filialId)}</label><label style="grid-column:1/-1">URL do webhook<input name="url" required value="${esc(h.url || '')}" placeholder="https://discord.com/api/webhooks/…"></label><label class="check" style="grid-column:1/-1"><input type="checkbox" name="avisosPortal" ${h.avisosPortal ? 'checked' : ''}> Avisar neste canal quando um cliente solicitar boleto pelo painel</label></div><div class="formActions">${h.id ? `<button type="button" class="danger" data-act="delHook" data-id="${h.id}">Excluir</button><span class="spacer"></span>` : ''}<button type="button" data-act="closeModal">Cancelar</button><button class="primary">Salvar</button></div></form>`, 'narrow'); },
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
  limparPainelParc: () => { Object.assign(S.f, { pini: '', pfim: '', ppini: '', ppfim: '' }); renderView(); },
  portalAcesso: el => abrirAcessoPortal(el.dataset.id),
  portalRemover: async el => { if (!confirm('Remover o acesso deste cliente ao painel?')) return; const r = await fetch('api/portal-admin/acesso', { method: 'POST', headers: { 'Content-Type': 'application/json', ...Store.authH() }, body: JSON.stringify({ clienteId: el.dataset.id, remover: true }) }); if (!r.ok) return toast('Não foi possível remover.', true); closeModal(); toast('Acesso removido.'); },
  portalMensagem: el => { const f = el.closest('form'); const c = Store.get('clientes', el.dataset.id); const email = f.email.value, senha = f.senha.value; copiar(`Olá, ${(c.nome || '').split(' ')[0]}! Agora você pode acompanhar o seu lote pelo Painel do cliente:\n${linkPortal()}\n\nE-mail: ${email}${senha ? `\nSenha inicial: ${senha}\n\nNo primeiro acesso, crie uma senha só sua.` : ''}\n\nLá você consulta as parcelas, imprime a 2ª via do boleto, vê o contrato e o extrato.`); },
  solConcluir: async el => { const x = Store.get('solicitacoes', el.dataset.id); Object.assign(x, { status: 'Atendida', atendidaEm: new Date().toISOString(), atendidaPor: S.user.nome }); await Store.put('solicitacoes', x); toast('Solicitação marcada como atendida.'); renderView(); },
  solAtender: async el => { const x = Store.get('solicitacoes', el.dataset.id); try { const b = await emitirBoleto(x.vendaId, x.parcelaId, true); if (!b) return; if (b.status === 'Emitido' && !b.portal) { b.portal = true; await Store.put('boletos', b); } Object.assign(x, { status: 'Atendida', atendidaEm: new Date().toISOString(), atendidaPor: S.user.nome, boletoId: b.id }); await Store.put('solicitacoes', x); toast('Boleto emitido e liberado no painel do cliente.'); renderView(); verBoleto(b.id); } catch (e) { toast(e.message, true); } },
  liberarPortal: async el => { const b = Store.get('boletos', el.dataset.id); b.portal = !b.portal; await Store.put('boletos', b); toast(b.portal ? 'Boleto liberado no painel do cliente.' : 'Boleto retirado do painel do cliente.'); verBoleto(b.id); },
  sino: () => $('#sinoPanel') ? fecharSino() : abrirSino(),
  sinoLerTodas: async () => { const ns = naoLidas(); for (const n of ns) { n.lida = true; n.lidaPor = S.user.nome; } atualizarSino(); await Promise.all(ns.map(n => Store.put('notificacoes', n))); },
  sinoAbrir: async el => { const n = Store.get('notificacoes', el.dataset.id); fecharSino(); if (n && !n.lida) { n.lida = true; n.lidaPor = S.user.nome; Store.put('notificacoes', n).catch(() => { }); } const destino = n?.tipo === 'boleto' && pode(S.user, 'boletos') ? 'boletos' : 'clientes'; if (destino === 'clientes') S.f.cq = n?.clienteNome || ''; S.view = destino; render(); },
  esqueciSenha: el => { if (!emailAtivo()) return toast(el.dataset.msg || 'Fale com o administrador para redefinir a sua senha.'); telaEsqueci(el.dataset.modo || 'equipe'); },
  voltarLogin: () => telaLogin(),
  verSenha: el => { const i = el.parentElement.querySelector('input'); const ver = i.type === 'password'; i.type = ver ? 'text' : 'password'; el.classList.toggle('on', ver); el.title = ver ? 'Ocultar senha' : 'Mostrar senha'; i.focus(); },
  pstSet: el => { S.f.pst = el.dataset.st; renderView(); },
  baixarContrato: async el => { const v = Store.get('vendas', el.dataset.v), m = Store.get('modelos', el.dataset.m); await salvarArquivo(`Contrato_${v.numero}_${norm(cliNome(v.clienteId)).replace(/\W+/g, '_')}.doc`, '\ufeff' + docContrato(v, m).doc, 'application/msword'); Object.assign(v, { contratoGeradoEm: new Date().toISOString(), contratoGeradoPor: S.user.nome, contratoModelo: m.nome, contratoModeloId: m.id }); hist(v, 'Contrato gerado com o modelo ' + m.nome); await Store.put('vendas', v); if (S.view === 'contratos') renderView(); },

  /* administração */
  editUser: el => formUser(Store.get('usuarios', el.dataset.id)),
  editFilial: el => formFilial(Store.get('filiais', el.dataset.id)),
  editEmp: el => formEmp(Store.get('empreendimentos', el.dataset.id)),
  recMes: el => { const same = +S.f.pMes === +el.dataset.m && String(S.f.pAno) === el.dataset.a; S.f.pMes = same ? '' : el.dataset.m; S.f.pAno = el.dataset.a; renderView(); },
  fcAno: el => { if (el.disabled) return; S.f.fSel = +el.dataset.i; S.f.fExp = false; renderView(); },
  fcExp: () => { S.f.fExp = !S.f.fExp; renderView(); },
  p12: el => { S.f.p12 = +el.dataset.i; renderView(); },
  limparPeriodo: () => { S.f.pAno = ''; S.f.pMes = ''; renderView(); },
  recDetalhes: el => {
    const { ini = '', fim = '' } = el.dataset; const prev = !!el.dataset.prev; const ult = d => new Date(+d.slice(0, 4), +d.slice(5, 7), 0).getDate();
    const mesCheio = ini && fim && ini.slice(0, 7) === fim.slice(0, 7) && ini.slice(8) === '01' && +fim.slice(8) === ult(fim);
    const anoCheio = ini && fim && ini.slice(0, 4) === fim.slice(0, 4) && ini.slice(5) === '01-01' && fim.slice(5) === '12-31';
    Object.assign(S.f, { pst: prev ? 'Em aberto' : 'Recebidas', pini: '', pfim: '', ppini: '', ppfim: '', pmes: '', pano: '' });
    if (mesCheio) Object.assign(S.f, { pmes: ini.slice(5, 7), pano: ini.slice(0, 4) }); else if (anoCheio) S.f.pano = ini.slice(0, 4); else Object.assign(S.f, prev ? { pini: ini, pfim: fim } : { ppini: ini, ppfim: fim });
    S.view = 'financeiro'; render();
  },
  delEmp: el => {
    const e = Store.get('empreendimentos', el.dataset.id); if (!e) return; const ls = Store.list('lotes').filter(l => l.empId === e.id);
    const vendidos = ls.filter(l => Store.list('vendas').some(v => v.loteId === l.id)); const outros = Store.list('empreendimentos').filter(x => x.id !== e.id && x.filialId === e.filialId);
    if (!ls.length) return confirmar(`Excluir o empreendimento <b>${esc(e.nome)}</b>? Ele não tem lotes.`, async () => { await Store.del('empreendimentos', e.id); if (Store.get('plantas', e.id)) await Store.del('plantas', e.id); await audit('Excluiu empreendimento ' + e.nome); closeModal(); toast('Empreendimento excluído.'); render(); }, 'Excluir');
    modal(`${mHead('Excluir empreendimento', e.nome)}<form class="modalBody" data-form="delEmp" data-id="${e.id}"><div class="notice warn">Este empreendimento tem <b>${ls.length} lote(s)</b>${vendidos.length ? `, sendo <b>${vendidos.length} com venda</b>` : ''}. Escolha o que fazer com eles:</div>
    <div style="display:grid;gap:10px">${outros.length ? `<label class="check"><input type="radio" name="acao" value="mover" checked> Mover os lotes para outro empreendimento da mesma empresa</label><label style="margin-left:26px">${sel('destino', outros.map(x => [x.id, x.nome]), outros[0].id)}</label>` : ''}
    ${vendidos.length ? `<p class="hint">Lotes com venda não podem ser apagados${outros.length ? '; mova-os para outro empreendimento' : '. Cadastre outro empreendimento nesta empresa para movê-los'}.</p>` : `<label class="check"><input type="radio" name="acao" value="apagar" ${outros.length ? '' : 'checked'}> Apagar também os ${ls.length} lote(s) (nenhum tem venda)</label>`}</div>
    <div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="danger" ${!outros.length && vendidos.length ? 'disabled' : ''}>Excluir empreendimento</button></div></form>`, 'narrow');
  },
  corrigirCadastro: el => formCorrigirCadastro(el.dataset.id),
  corrigirTotais: el => formCorrigirTotais(el.dataset.id),
  lancarParcelas: el => formLancarParcelas(el.dataset.id),
  historicoLote: el => { const l = Store.get('lotes', el.dataset.id); const vs = Store.list('vendas').filter(v => v.loteId === l.id); const itens = [...(l.historico || []).map(h => ({ ...h, de: 'Lote' })), ...vs.flatMap(v => (v.historico || []).map(h => ({ ...h, de: v.numero + (v.status === 'Distratado' ? ' (distratada)' : '') })))].sort((a, b) => String(b.data).localeCompare(String(a.data)));
    modal(`${mHead(nomeFilial(l.filialId), 'Histórico — ' + l.quadra + '-' + l.numero)}<div class="modalBody">${itens.length ? `<div class="tableWrap" style="max-height:480px;overflow:auto"><table><thead><tr><th>Data</th><th>Origem</th><th>Usuário</th><th>Alteração</th></tr></thead><tbody>${itens.map(h => `<tr><td style="white-space:nowrap">${h.data && h.data.length > 10 ? new Date(h.data).toLocaleString('pt-BR') : dataBR(h.data)}</td><td>${esc(h.de)}</td><td>${esc(h.usuario || '')}</td><td>${esc(h.acao)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Sem histórico registrado.</div>'}</div>`, 'wide'); },
  excluirCadastro: el => { const l = Store.get('lotes', el.dataset.id); const v = Store.list('vendas').find(x => x.loteId === l.id && vendaAtiva(x)); const pag = v ? soma(v.parcelas || [], pagoParcela) : 0;
    modal(`${mHead('Excluir cadastro', l.quadra + '-' + l.numero + ' · ' + nomeFilial(l.filialId))}<form class="modalBody" data-form="excluirCadastro" data-id="${l.id}" data-v="${v?.id || ''}">${v ? `<div class="notice bad">Este lote tem a venda <b>${esc(v.numero)}</b> de <b>${esc(cliNome(v.clienteId))}</b>, com ${(v.parcelas || []).length} parcelas${pag ? ` e <b>${brl(pag)}</b> já recebidos` : ''}. Excluir apaga a venda, as parcelas, os pagamentos e os boletos dela, e o lote volta a ficar disponível. Para cancelar mantendo o histórico, use <b>Distratar</b>.</div>
    <label class="check"><input type="radio" name="o" value="venda" checked> Excluir só a venda (o lote continua cadastrado, disponível)</label><label class="check" style="margin-top:6px"><input type="radio" name="o" value="tudo"> Excluir a venda e também o lote</label>` : `<div class="notice warn">O lote será excluído definitivamente.</div><input type="hidden" name="o" value="lote">`}
    <label style="margin-top:12px">Para confirmar, digite <b>EXCLUIR</b><input name="conf" autocomplete="off" required></label><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="danger">Excluir definitivamente</button></div></form>`); },
  custosExcel: async () => { const rows = linhasCustos(); await salvarArquivo(`custo_venda_lucro_${hoje()}.xls`, '﻿' + docCustos(rows), 'application/vnd.ms-excel'); },
  custosPdf: async () => { const html = docCustos(linhasCustos()); if (Store.mode !== 'db') { const w = window.open('', '_blank'); if (w) { w.document.write(html + '<script>setTimeout(()=>print(),300)<\/script>'); w.document.close(); return; } } await salvarArquivo(`custo_venda_lucro_${hoje()}.html`, html, 'text/html'); },
  importarCustos: () => modal(`${mHead('Custo, venda e lucro', 'Importar custos dos lotes')}<form class="modalBody" data-form="importarCustos"><p class="hint">Arquivo CSV com as colunas <b>empresa;lote;custo</b> (ex.: <code class="k">Busca;B-10;57059,59</code>). O lote é localizado pela empresa e por quadra-número. Custos existentes são substituídos.</p><label style="margin-top:12px">Arquivo (.csv)<input type="file" name="arq" accept=".csv,.txt" required></label><div class="formActions"><button type="button" data-act="closeModal">Cancelar</button><button class="primary">Importar</button></div></form>`, 'narrow'),
  cfgBoleto: el => formCobranca(el.dataset.id),
  verFilial: el => { S.filial = el.dataset.id; S.emp = ''; render(); },
  verEmp: el => { S.emp = el.dataset.id; renderView(); },
  delFilial: el => confirmar('Excluir esta filial? Ela não tem lotes, clientes nem vendas.', async () => { const id = el.dataset.id; await Store.del('filiais', id); for (const u of Store.list('usuarios').filter(u => (u.filiais || []).includes(id))) { u.filiais = u.filiais.filter(x => x !== id); await Store.put('usuarios', u); } if (S.filial === id) S.filial = '*'; await audit('Excluiu filial vazia'); closeModal(); toast('Filial excluída.'); render(); }, 'Excluir'),
  backup: async () => { const dump = { _traxup: { app: 'TRAXUP Imobiliário', versao: 1, geradoEm: new Date().toISOString(), por: S.user?.nome, contagem: Object.fromEntries(COLS.map(c => [c, Object.keys(Store.data[c] || {}).length])) } }; for (const c of COLS) dump[c] = Store.data[c]; await salvarArquivo(`traxup_imobiliario_backup_${hoje()}_${new Date().toTimeString().slice(0, 5).replace(':', 'h')}.json`, JSON.stringify(dump), 'application/json'); const c = { ...cfg(), ultimoBackup: new Date().toISOString(), ultimoBackupPor: S.user?.nome }; await Store.put('config', c); await audit('Fez backup completo'); if (S.view === 'config') renderView(); },
  backupServidor: async () => { const r = await fetch('api/backups', { method: 'POST', headers: Store.authH() }); const j = await r.json().catch(() => ({})); if (!r.ok) return toast(j.error || 'Falha ao criar backup.', true); toast('Cópia criada no servidor: ' + j.nome); await audit('Criou backup no servidor'); listarBackupsServidor(); },
  baixarBackupServidor: async el => { const r = await fetch('api/backups/' + encodeURIComponent(el.dataset.n), { headers: Store.authH() }); if (!r.ok) return toast('Não foi possível baixar.', true); await salvarArquivo(el.dataset.n, await r.text(), 'application/json'); },
  exportar: el => exportarTela(el.dataset.f),
  removerDemo: () => { const d = dadosDemo(); confirmar(`Remover os dados de demonstração? Serão excluídos <b>${d.vendas.length} vendas</b>, <b>${d.lotes.length} lotes</b>, <b>${d.clientes.length} clientes</b>, ${d.emps.length} empreendimento(s) e ${d.boletos.length} boleto(s) de exemplo. Os dados importados do Vico não são afetados.`, async () => { for (const [c, arr] of [['boletos', d.boletos], ['vendas', d.vendas], ['lotes', d.lotes], ['clientes', d.clientes], ['plantas', d.plantas], ['empreendimentos', d.emps]]) for (const o of arr) await Store.del(c, o.id); await audit('Removeu dados de demonstração'); toast('Dados de demonstração removidos.'); render(); }, 'Remover'); },
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
    lembrar('traxup_ultimo_login', v.login, !!v.lembrar);
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
    const c = Store.get('clientes', f.dataset.id) || { filialId: filialPadrao() }; Object.assign(c, v); c.nome = c.nome.trim(); if (!c.conjugeDeId) delete c.conjugeDeId; if (c.conjugeDeId === c.id) throw Error('Um cadastro não pode ser cônjuge de si mesmo.');
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
  async baixa(v, f) {
    const venda = Store.get('vendas', f.dataset.v), p = venda.parcelas.find(x => x.id === f.dataset.p); const valor = toCents(v.valor);
    if (!v.data) throw Error('Informe a data da baixa.'); if (v.data > hoje()) throw Error('A data da baixa não pode ser futura.'); if (valor <= 0) throw Error('Informe o valor recebido.');
    if (f.dataset.etapa === '1') { f.dataset.etapa = '2'; $('#bEtapa1').hidden = true; const e2 = $('#bEtapa2'); e2.hidden = false; e2.innerHTML = confirmarBaixaHTML(venda, p, v); setTimeout(() => $('#bConfirmar')?.focus(), 30); return; }
    await registrarPagamento(venda, p, { valor, data: v.data, juros: toCents(v.juros), multa: toCents(v.multa), obs: v.obs, forma: v.forma }); closeModal(); toast(`Baixa de ${brl(valor)} registrada em ${dataBR(v.data)}.`); renderView();
  },
  async boletoLote(v) { const alvos = L('vendas').filter(vendaAtiva).flatMap(x => (x.parcelas || []).filter(p => saldoParcela(p) > 0 && p.venc >= v.ini && p.venc <= v.fim).map(p => ({ x, p }))); let n = 0, sem = 0; for (const { x, p } of alvos) { if (Store.list('boletos').some(b => b.parcelaId === p.id && b.status !== 'Cancelado')) continue; const b = await emitirBoleto(x.id, p.id, true); b ? n++ : sem++; } closeModal(); toast(`${n} boleto(s) emitido(s)${sem ? `; ${sem} sem convênio BB configurado` : ''}.`, !!sem); renderView(); },
  async importExtrato(v, f) { const file = f.arquivo.files[0]; if (!file) throw Error('Selecione o arquivo.'); let txt = await file.text(); if (/\uFFFD/.test(txt)) txt = new TextDecoder('windows-1252').decode(await file.arrayBuffer()); closeModal(); await importarTextoExtrato(txt, file.name, v.filialId); },
  async concManual(v, f) { const { e, t } = acharTx(f.dataset.tx); const [vid, pid] = v.alvo.split('|'); await conciliarTx(e, t, vid, pid); await Store.put('extratos', e); closeModal(); toast('Conciliado.'); renderView(); },
  async comissao(v, f) { const venda = Store.get('vendas', f.dataset.id); (venda.comissoesPagas ||= []).push({ valor: toCents(v.valor), data: v.data, obs: v.obs, usuario: S.user.nome }); hist(venda, `Comissão paga: ${brl(toCents(v.valor))}`); await Store.put('vendas', venda); closeModal(); toast('Pagamento de comissão registrado.'); renderView(); },
  async emailTeste(v) { const r = await fetch('api/email/teste', { method: 'POST', headers: { 'Content-Type': 'application/json', ...Store.authH() }, body: JSON.stringify({ para: v.para }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(j.error || 'Falha no envio.'); toast('E-mail de teste enviado para ' + v.para + '.'); },
  async esqueci(v, f) { const r = await fetch('/api/senha/esqueci', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v.email, tipo: f.dataset.modo }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(j.error || 'Não foi possível enviar agora.'); telaEsqueci(f.dataset.modo, v.email); },
  async redefinir(v, f) { if (v.nova !== v.nova2) throw Error('As duas senhas não são iguais.'); if (v.nova.length < 6) throw Error('A senha precisa ter 6 caracteres ou mais.'); const r = await fetch('/api/senha/redefinir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: f.dataset.t, nova: v.nova }) }); const j = await r.json().catch(() => ({})); if (!r.ok) return telaRedefinir(f.dataset.modo, f.dataset.t, j.error || 'Não foi possível salvar.'); telaSenhaRedefinida(f.dataset.modo); },
  async portalAcesso(v, f) { const r = await fetch('api/portal-admin/acesso', { method: 'POST', headers: { 'Content-Type': 'application/json', ...Store.authH() }, body: JSON.stringify({ clienteId: f.dataset.id, email: v.email, senha: v.senha, ativo: !!v.ativo }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(j.error || 'Não foi possível salvar.'); closeModal(); toast('Acesso ao painel salvo.'); },
  async hook(v, f) { if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+/.test(v.url.trim())) throw Error('URL de webhook do Discord inválida.'); const h = Store.get('webhooks', f.dataset.id) || {}; Object.assign(h, { nome: v.nome, filialId: v.filialId, url: v.url.trim(), avisosPortal: !!v.avisosPortal }); await Store.put('webhooks', h); closeModal(); toast('Canal salvo.'); renderView(); },
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
    Object.assign(fl, { nome: v.nome, razao: v.razao, cnpj: v.cnpj, telefone: v.telefone, cidade: v.cidade, uf: v.uf.toUpperCase(), endereco: v.endereco });
    if (!fl.bb) fl.bb = { ...cfgBoleto(fl), razao: v.razao || v.nome, cnpj: v.cnpj };
    await Store.put('filiais', fl); await audit('Filial salva: ' + fl.nome); closeModal(); toast('Filial salva.'); render();
  },
  async delEmp(v, f) {
    const e = Store.get('empreendimentos', f.dataset.id); const ls = Store.list('lotes').filter(l => l.empId === e.id);
    if (v.acao === 'mover') { const d = Store.get('empreendimentos', v.destino); for (const l of ls) { l.empId = d.id; l.filialId = d.filialId; delete l.x; delete l.y; await Store.put('lotes', l); } }
    else if (v.acao === 'apagar') { if (ls.some(l => Store.list('vendas').some(x => x.loteId === l.id))) throw Error('Há lotes com venda. Mova-os para outro empreendimento.'); for (const l of ls) await Store.del('lotes', l.id); }
    else throw Error('Escolha o que fazer com os lotes.');
    await Store.del('empreendimentos', e.id); if (Store.get('plantas', e.id)) await Store.del('plantas', e.id);
    await audit(`Excluiu empreendimento ${e.nome} (${ls.length} lotes ${v.acao === 'mover' ? 'movidos' : 'apagados'})`); closeModal(); toast('Empreendimento excluído.'); S.emp = ''; render();
  },
  async corrigirCadastro(v, f) {
    const l = Store.get('lotes', f.dataset.id); const antes = `${l.quadra}-${l.numero} preço ${brl(l.preco)} custo ${l.custo ? brl(l.custo) : '—'}`;
    Object.assign(l, { quadra: v.quadra.trim().toUpperCase(), numero: v.numero.trim(), area: v.area, status: v.status, preco: toCents(v.preco), matricula: v.matricula }); if (v.custo.trim()) l.custo = toCents(v.custo); else delete l.custo;
    (l.historico ||= []).push({ data: new Date().toISOString(), usuario: S.user.nome, acao: `Lote corrigido (${antes} → ${l.quadra}-${l.numero} preço ${brl(l.preco)} custo ${l.custo ? brl(l.custo) : '—'}). Motivo: ${v.motivo}` }); await Store.put('lotes', l);
    if (f.dataset.v) { const vd = Store.get('vendas', f.dataset.v); const mud = []; const nv = toCents(v.valor); if (nv !== vd.valor) mud.push(`valor ${brl(vd.valor)} → ${brl(nv)}`); if (v.clienteId !== vd.clienteId) mud.push(`cliente ${cliNome(vd.clienteId)} → ${cliNome(v.clienteId)}`); if ((v.data || '') !== (vd.data || '')) mud.push(`data ${dataBR(vd.data)} → ${dataBR(v.data)}`); if ((v.corretor || '') !== (vd.corretor || '')) mud.push(`corretor ${vd.corretor || '—'} → ${v.corretor || '—'}`);
      Object.assign(vd, { valor: nv, clienteId: v.clienteId, data: v.data, corretor: v.corretor.trim(), comissaoPct: parseFloat(String(v.comissaoPct).replace(',', '.')) || 0, reajuste: v.reajuste }); hist(vd, `Cadastro corrigido${mud.length ? ': ' + mud.join('; ') : ''}. Motivo: ${v.motivo}`); await Store.put('vendas', vd); }
    await audit(`Corrigiu cadastro ${l.quadra}-${l.numero} (${nomeFilial(l.filialId)})`); closeModal(); toast('Cadastro corrigido.'); renderView();
  },
  async corrigirTotais(v, f) {
    const vd = Store.get('vendas', f.dataset.id); const mud = [];
    for (const t of ['Entrada', 'Mensal', 'Intercalada', 'Avulsa']) { const k = 't_' + t; if (!(k in v)) continue; const novo = toCents(v[k]); const ps = vd.parcelas.filter(p => p.tipo === t); const atual = soma(ps, p => p.valor); if (novo === atual) continue;
      const abertas = ps.filter(p => !pagoParcela(p)).sort((a, b) => a.venc.localeCompare(b.venc)); if (!abertas.length) throw Error(`${t}: não há parcelas sem baixa para redistribuir.`);
      const alvo = novo - soma(ps.filter(p => pagoParcela(p) > 0), p => p.valor); if (alvo < 0) throw Error(`${t}: o novo total é menor que o já recebido nas parcelas com baixa.`);
      const reg = Math.floor(alvo / abertas.length); abertas.forEach((p, i) => { p.valor = i === abertas.length - 1 ? alvo - reg * (abertas.length - 1) : reg; }); mud.push(`${t}: ${brl(atual)} → ${brl(novo)}`); }
    if (!mud.length) throw Error('Nenhum total foi alterado.');
    hist(vd, `Totais das parcelas corrigidos (${mud.join('; ')}). Motivo: ${v.motivo}`); await Store.put('vendas', vd); await audit(`Corrigiu totais das parcelas de ${vd.numero}`); closeModal(); toast('Totais corrigidos.'); renderView();
  },
  async lancarParcelas(v, f) {
    const vd = Store.get('vendas', f.dataset.id); const q = Math.round(+v.qtd), t = toCents(v.total); if (!(q > 0) || t <= 0) throw Error('Informe quantidade e valor total.');
    const doTipo = vd.parcelas.filter(p => p.tipo === v.tipo).length; const novas = serieParcelas(v.tipo, t, q, v.venc, +v.int || 1); const n0 = doTipo; novas.forEach((p, i) => { p.ref = `${n0 + i + 1}/${n0 + q}`; });
    for (const p of vd.parcelas.filter(p => p.tipo === v.tipo)) { const m = String(p.ref).match(/^(\d+)\/\d+$/); if (m) p.ref = `${m[1]}/${n0 + q}`; }
    vd.parcelas.push(...novas); hist(vd, `${q} parcela(s) ${v.tipo} lançada(s), total ${brl(t)}, a partir de ${dataBR(v.venc)}. Motivo: ${v.motivo}`); await Store.put('vendas', vd); await audit(`Lançou ${q} parcelas em ${vd.numero}`); closeModal(); toast(`${q} parcela(s) lançada(s).`); renderView();
  },
  async excluirCadastro(v, f) {
    if (v.conf.trim().toUpperCase() !== 'EXCLUIR') throw Error('Digite EXCLUIR para confirmar.'); const l = Store.get('lotes', f.dataset.id); const vd = f.dataset.v ? Store.get('vendas', f.dataset.v) : null;
    if (vd) { for (const b of Store.list('boletos').filter(b => b.vendaId === vd.id)) await Store.del('boletos', b.id); await Store.del('vendas', vd.id); }
    if (v.o === 'tudo' || v.o === 'lote') { await Store.del('lotes', l.id); } else { l.status = 'Disponível'; (l.historico ||= []).push({ data: new Date().toISOString(), usuario: S.user.nome, acao: `Venda ${vd?.numero} excluída; lote liberado` }); await Store.put('lotes', l); }
    await audit(`Excluiu cadastro ${l.quadra}-${l.numero} (${nomeFilial(l.filialId)})${vd ? ' com a venda ' + vd.numero : ''}`); closeModal(); toast('Cadastro excluído.'); renderView();
  },
  async importarCustos(v, f) {
    const file = f.arq.files[0]; if (!file) throw Error('Selecione o arquivo.'); const linhas = (await file.text()).split(/\r?\n/).map(x => x.trim()).filter(Boolean); let ok = 0; const nao = [];
    for (const ln of linhas) { const c = ln.split(/[;\t]/).map(x => x.trim().replace(/^"|"$/g, '')); if (c.length < 3 || /empresa/i.test(c[0])) continue; const m = c[1].toUpperCase().match(/^([A-Z]+)\s*-?\s*0*(\d+\w*)$/); const fil = Store.list('filiais').find(x => norm(x.nome) === norm(c[0]));
      const l = m && fil && Store.list('lotes').find(x => x.filialId === fil.id && norm(x.quadra) === norm(m[1]) && String(x.numero).replace(/^0+/, '') === m[2]); if (!l) { nao.push(c[0] + ' ' + c[1]); continue; }
      const custo = toCents(c[2]); if (l.custo !== custo) { (l.historico ||= []).push({ data: new Date().toISOString(), usuario: S.user.nome, acao: `Custo importado: ${l.custo ? brl(l.custo) : '—'} → ${brl(custo)}` }); l.custo = custo; await Store.put('lotes', l); } ok++; }
    await audit(`Importou custos de ${ok} lotes`); closeModal(); toast(`${ok} custo(s) importado(s)${nao.length ? `; não encontrados: ${nao.slice(0, 5).join(', ')}${nao.length > 5 ? '…' : ''}` : ''}.`, !!nao.length); renderView();
  },
  async cobranca(v, f) {
    const fl = Store.get('filiais', f.dataset.id); const num = k => { const n = parseFloat(String(v[k] ?? '').replace(',', '.')); return Number.isFinite(n) && n >= 0 ? n : 0; };
    if (v.banco === '001' && onlyDigits(v.convenio).length !== 7) throw Error('No Banco do Brasil (carteira 17) o convênio deve ter 7 dígitos.');
    if (![11, 14].includes(onlyDigits(v.cnpj).length)) throw Error('Informe um CNPJ (ou CPF) válido do cedente.');
    if (num('multa') > 2) { if (!FORMS.cobranca.okMulta) { FORMS.cobranca.okMulta = true; throw Error('Atenção: multa acima de 2% pode ser abusiva para pessoa física (CDC). Clique em salvar de novo para manter.'); } }
    FORMS.cobranca.okMulta = false;
    const bb = { banco: v.banco, tipoConta: v.tipoConta, agencia: onlyDigits(v.agencia), agenciaDv: v.agenciaDv.trim().toUpperCase(), conta: onlyDigits(v.conta), contaDv: v.contaDv.trim().toUpperCase(), codigoBeneficiario: v.codigoBeneficiario.trim(), convenio: onlyDigits(v.convenio), convenioDv: (v.convenioDv || '0').trim() || '0', carteira: v.carteira.trim().toUpperCase(), variacao: onlyDigits(v.variacao), layout: v.layout, especie: v.especie, multa: num('multa'), multaDias: Math.round(num('multaDias')), jurosMes: num('jurosMes'), jurosDias: Math.round(num('jurosDias')), protestoDias: Math.round(num('protestoDias')), negativacaoDias: Math.round(num('negativacaoDias')), nossoNumeroInicial: Math.max(1, Math.round(num('nossoNumeroInicial'))), localPagamento: v.localPagamento.trim() || 'Pagável em qualquer banco até o vencimento', instrucoes: v.instrucoes.trim(), razao: v.razao.trim(), cnpj: onlyDigits(v.cnpj), ie: v.ie.trim(), cep: onlyDigits(v.cep), logradouro: v.logradouro.trim(), numero: v.numero.trim(), complemento: v.complemento.trim(), bairro: v.bairro.trim(), cidade: v.cidade.trim(), uf: v.uf.trim().toUpperCase() };
    fl.bb = bb; fl.multa = bb.multa; fl.jurosMes = bb.jurosMes; await Store.put('filiais', fl); await audit('Configuração de boleto salva: ' + fl.nome);
    const pend = pendenciasBoleto(fl); closeModal(); toast(pend.length ? `Configuração salva. Ainda falta: ${pend.join(', ')}.` : 'Configuração de boleto completa.', !!pend.length); render();
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
document.addEventListener('change', e => { if (e.target.id === 'filialSel') { S.filial = e.target.value; S.emp = ''; S.sel = {}; S.f.ext = null; S.f.mod = null; render(); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#overlay')) closeModal(); });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (S.user && TITULOS[h] && h !== S.view && pode(S.user, h)) { S.view = h; render(); } });
