#!/usr/bin/env node
// Converte o backup do sistema Vico (Vico_Banco_Completo_*.sql) para o formato de backup do TRAXUP Imobiliário.
// Sem dependências. Uso:
//   node scripts/import-vico.mjs Vico_Banco_Completo_2026-11-10.sql [--custos contract-cost-reference.json] [--out traxup_vico.json] [--db data/db.json]
//   --custos  arquivo de referência de custos do código Vico (lib/contract-cost-reference.json), opcional
//   --out     grava o backup TRAXUP em JSON (restaure em Configurações → Restaurar backup)
//   --db      mescla direto na base do servidor (pare o serviço antes: systemctl stop traxup-imob)
import fs from 'node:fs';
import path from 'node:path'; import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2); const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const file = args.find(a => !a.startsWith('--') && !Object.values({ c: opt('--custos'), o: opt('--out'), d: opt('--db') }).includes(a));
if (!file) { console.error('Informe o arquivo .sql do backup Vico.'); process.exit(1); }

const here = path.dirname(fileURLToPath(import.meta.url));
const converterVico = new Function(fs.readFileSync(path.join(here, '../src/vico.js'), 'utf8').replace("if (typeof module !== 'undefined') module.exports = { converterVico };", '') + '; return converterVico;')();
const custos = opt('--custos') ? JSON.parse(fs.readFileSync(opt('--custos'), 'utf8')) : [];
const { dados: out, resumo } = converterVico(fs.readFileSync(file, 'utf8'), custos, file.split('/').pop());
const nParc = resumo.parcelas, nPag = resumo.pagamentos, nCom = resumo.comissoes, criados = Object.values(out.clientes).filter(c => /Criado na importação/.test(c.obs || '')).length, empresas = Object.keys(out.filiais);
console.log(`Backup Vico: ${resumo.lotes} lotes, ${resumo.antecipacoes} antecipações`);
/* ---------- conferência ---------- */
const vs = Object.values(out.vendas); const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
const recebido = sum(vs, v => sum(v.parcelas, p => sum(p.pagamentos, q => q.valor)));
const valorVendas = sum(vs, v => v.valor);
const saldo = sum(vs, v => sum(v.parcelas, p => Math.max(0, p.valor + p.juros + p.multa - sum(p.pagamentos, q => q.valor))));
const brl = c => 'R$ ' + (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
console.log(`TRAXUP: ${empresas.length} filiais, ${Object.keys(out.lotes).length} lotes, ${vs.length} vendas, ${Object.keys(out.clientes).length} clientes (${criados} criados só com nome), ${nParc} parcelas, ${nPag} pagamentos, ${nCom} comissões pagas`);
console.log(`Valor das vendas ${brl(valorVendas)} · recebido ${brl(recebido)} · saldo das parcelas ${brl(saldo)}`);
const semCli = vs.filter(v => !v.clienteId).length; if (semCli) console.log(`Atenção: ${semCli} venda(s) sem cliente.`);

if (opt('--out')) { fs.writeFileSync(opt('--out'), JSON.stringify(out)); console.log('Backup TRAXUP gravado em', opt('--out')); }
if (opt('--db')) {
  const p = opt('--db'); const db = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
  if (fs.existsSync(p)) fs.copyFileSync(p, p + '.antes-vico-' + Date.now()); for (const [c, docs] of Object.entries(out)) db[c] = { ...(db[c] || {}), ...docs };
  fs.writeFileSync(p, JSON.stringify(db)); console.log('Mesclado em', p, '(cópia anterior salva ao lado). Inicie o serviço: systemctl start traxup-imob');
}
