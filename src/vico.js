/* Conversão do backup do sistema Vico (Vico_Banco_Completo_*.sql) para o formato TRAXUP. Usado pelo navegador e por scripts/import-vico.mjs. */
function converterVico(sql, custos = [], nomeArquivo = 'backup.sql') {
  const ITBI_AVALIACAO = 17000000;
/* ---------- leitura do .sql ---------- */
const tables = { records: [], clients: [], advances: [] };
for (const line of String(sql).split(/\r?\n/)) {
  const m = line.match(/^INSERT INTO (\w+) \([^)]*\) VALUES \('((?:[^']|'')*)','((?:[^']|'')*)',(\d+)\);?\s*$/);
  if (!m || !tables[m[1]]) continue;
  tables[m[1]].push({ id: m[2].replace(/''/g, "'"), ...JSON.parse(m[3].replace(/''/g, "'")) });
}

/* ---------- utilidades ---------- */
const sid = s => { let h1 = 0x811c9dc5, h2 = 0x01000193; for (const ch of String(s)) { const c = ch.codePointAt(0); h1 = Math.imul(h1 ^ c, 16777619) >>> 0; h2 = Math.imul(h2 ^ c, 2246822519) >>> 0; } return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0'); };
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
const lotKey = s => String(s).toUpperCase().replace(/QUADRA|LOTE/g, '').replace(/[^A-Z0-9]/g, '').replace(/^([A-Z]+)0+(\d)/, '$1$2');
const splitLot = s => { const m = String(s).trim().match(/^([A-Za-z]+)\s*-*\s*(\d+\w*)$/); return m ? { quadra: m[1].toUpperCase(), numero: m[2] } : { quadra: '-', numero: String(s).trim() }; };
const now = new Date().toISOString();

const out = {}; for (const c of ['filiais', 'empreendimentos', 'lotes', 'clientes', 'vendas', 'logs']) out[c] = {};
const put = (c, o) => { out[c][o.id] = o; return o; };

/* ---------- filiais (uma por empresa) e empreendimento ---------- */
const empresas = [...new Set(tables.records.map(r => r.company))].sort();
const filialDe = {}, empDe = {};
for (const e of empresas) {
  const f = put('filiais', { id: 'vico-fil-' + sid(e), nome: e, razao: e, cnpj: '', cidade: 'Petrolina', uf: 'PE', multa: 2, jurosMes: 1, bb: { carteira: '17', variacao: '35' }, origem: 'Vico', atualizadoEm: now });
  const emp = put('empreendimentos', { id: 'vico-emp-' + sid(e), filialId: f.id, nome: 'Vico Home Resort — ' + e, cidade: 'Petrolina', origem: 'Vico', atualizadoEm: now });
  filialDe[e] = f.id; empDe[e] = emp.id;
}

/* ---------- clientes ---------- */
const F = { name: 'nome', cpf: 'cpf', rg: 'rg', nationality: 'nacionalidade', civilStatus: 'estadoCivil', profession: 'profissao', spouseName: 'conjuge', phone: 'telefone', whatsapp: 'whatsapp', email: 'email', street: 'logradouro', number: 'numero', complement: 'complemento', neighborhood: 'bairro', city: 'cidade', state: 'uf', zip: 'cep' };
const clientePorContrato = {}, clientePorNome = {};
for (const c of tables.clients) {
  const f = c.fields || {}; const o = { id: 'vico-cli-' + sid(c.id), origem: 'Vico', vicoId: c.id, atualizadoEm: now };
  for (const [a, b] of Object.entries(F)) if (f[a]) o[b] = String(f[a]).trim();
  const obs = [f.notes, f.address && !f.street ? 'Endereço: ' + f.address : '', f.additionalBuyers ? 'Comprador adicional: ' + f.additionalBuyers : ''].filter(Boolean).join('\n');
  if (obs) o.obs = obs;
  o.vinculosVico = (c.links || []).map(l => ({ empresa: l.company, lote: l.lot, papel: l.role, contrato: l.contractId, anterior: l.previousOwner }));
  const first = (c.links || [])[0]; o.filialId = filialDe[first?.company] || filialDe[empresas[0]];
  if (!o.nome) continue; put('clientes', o);
  for (const l of c.links || []) { const k = l.company + '|' + lotKey(l.lot); if (/principal/i.test(l.role) || !clientePorContrato[k]) clientePorContrato[k] = clientePorContrato[k] && !/principal/i.test(l.role) ? clientePorContrato[k] : o.id; }
  (clientePorNome[norm(o.nome)] ||= []).push(o.id);
}

/* ---------- lotes, vendas, parcelas ---------- */
let nParc = 0, nPag = 0, nCom = 0, criados = 0;
const antecip = {}; for (const a of tables.advances) (antecip[a.company + '|' + norm(a.client)] ||= []).push(a);
for (const r of tables.records) {
  const { quadra, numero } = splitLot(r.lot); const k = r.company + '|' + lotKey(r.lot);
  const ref = custos.find(x => x.company === r.company && lotKey(x.lot) === lotKey(r.lot));
  const custoOrig = ref?.cost ?? r.cost; const custo = custoOrig === undefined ? undefined : custoOrig - ITBI_AVALIACAO;
  const lote = put('lotes', { id: 'vico-lot-' + sid(r.id), filialId: filialDe[r.company], empId: empDe[r.company], quadra, numero, preco: r.price || ref?.price || 0, ...(custo !== undefined ? { custo } : {}), status: r.status === 'Vendido' ? 'Vendido' : r.status === 'Reservado' ? 'Reservado' : 'Disponível', obs: `Importado do Vico (${r.company} ${r.lot})`, origem: 'Vico', vicoId: r.id, atualizadoEm: now });
  if (r.status !== 'Vendido' && !(r.parcels || []).length) continue;

  let clienteId = clientePorContrato[k] || (clientePorNome[norm(r.client)] || [])[0];
  if (!clienteId && r.client) { const c = put('clientes', { id: 'vico-cli-' + sid('nome:' + r.client), filialId: filialDe[r.company], nome: r.client.trim(), origem: 'Vico', obs: 'Criado na importação: o Vico só tinha o nome no lote.', atualizadoEm: now }); clienteId = c.id; (clientePorNome[norm(r.client)] ||= []).push(c.id); criados++; }

  const parcelas = (r.parcels || []).map(p => {
    const juros = p.interest || 0, multa = p.fine || 0; nParc++; nPag += (p.payments || []).length;
    return { id: p.id, tipo: p.type, ref: p.reference || '', venc: p.due, valor: p.amount - juros - multa, juros, multa, pagamentos: (p.payments || []).map(q => ({ valor: q.amount, data: q.date, obs: q.note || '', origem: 'Vico', forma: '' })) };
  });
  const primeiro = parcelas.map(p => p.venc).filter(Boolean).sort()[0] || '';
  const entrada = parcelas.filter(p => p.tipo === 'Entrada').map(p => p.venc).sort()[0];
  const historico = (r.corrections || []).slice(-200).map(c => ({ data: c.date, usuario: 'Vico', acao: `${c.field}: ${String(c.before ?? '').slice(0, 120)} → ${String(c.after ?? '').slice(0, 120)}${c.reason ? ' (' + c.reason + ')' : ''}` }));
  historico.push({ data: now, usuario: 'Importação', acao: `Importado do Vico: ${parcelas.length} parcelas, ${parcelas.reduce((s, p) => s + p.pagamentos.length, 0)} pagamentos` });
  const comissoesPagas = (r.commissions || []).map(q => ({ valor: q.amount, data: q.date, obs: (q.note || '') + (q.relatedClient ? ' · ' + q.relatedClient : '') })); nCom += comissoesPagas.length;
  const relacionadas = (r.commissions || []).filter(q => q.relatedClient && q.relatedClient !== r.client).reduce((t, q) => t + q.amount, 0);
  const comBase = r.commissionExcluded ? 0 : (r.commissionAmount ?? Math.round(r.price * 0.04));
  const adv = antecip[r.company + '|' + norm(r.client)] || [];
  put('vendas', {
    id: 'vico-vd-' + sid(r.id), filialId: filialDe[r.company], numero: `${r.company.toUpperCase()}-${r.lot}`, loteId: lote.id, clienteId, data: entrada || primeiro, valor: r.price,
    corretor: 'Metro Quadrado', comissaoPct: 4, ...(r.commissionAmount !== undefined || relacionadas ? { comissaoValor: comBase + relacionadas } : {}), ...(r.commissionExcluded ? { comissaoExcluida: true } : {}), ...(r.commissionSuspended ? { comissaoSuspensa: true } : {}), ...(r.commissionSchedule ? { comissaoParcelamento: r.commissionSchedule } : {}),
    comissoesPagas, indice: 'IPCA', reajuste: 'IPCA + 7% a.a., conforme a vigência de cada período contratual', status: 'Ativo',
    classificacao: r.debtClassification === 'Inadimplente' ? 'Inadimplente' : r.debtClassification === 'Em atraso' ? 'Em atraso' : 'Automático',
    ...(r.saleTotals ? { totaisContrato: r.saleTotals } : {}), ...(adv.length ? { antecipacoes: adv.map(a => ({ tipo: a.type, ref: a.reference, venc: a.due, pagoEm: a.paidDate, valor: a.total })) } : {}),
    parcelas, historico, origem: 'Vico', vicoId: r.id, atualizadoEm: now
  });
}
put('logs', { id: 'importacao-vico', itens: [{ data: now, usuario: 'Importação', acao: `Backup Vico ${nomeArquivo}: ${tables.records.length} lotes, ${Object.keys(out.vendas).length} vendas, ${nParc} parcelas, ${nPag} pagamentos, ${nCom} comissões` }], atualizadoEm: now });

  if (!tables.records.length) throw Error('Arquivo não parece um backup do Vico (nenhum registro de lote encontrado).');
  return { dados: out, resumo: { lotes: Object.keys(out.lotes).length, vendas: Object.keys(out.vendas).length, clientes: Object.keys(out.clientes).length, parcelas: nParc, pagamentos: nPag, comissoes: nCom, antecipacoes: tables.advances.length, filiais: empresas.length } };
}
if (typeof module !== 'undefined') module.exports = { converterVico };
