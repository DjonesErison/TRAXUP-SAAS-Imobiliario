/* TRAXUP Imobiliário — núcleo: utilidades, armazenamento, autenticação, regras financeiras, boleto BB, conciliação */
'use strict';

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
const fmtNum = c => (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const brl = c => 'R$ ' + fmtNum(c || 0);
const toCents = v => { v = String(v ?? '').trim().replace(/[R$\s]/g, ''); if (!v) return 0; if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.'); const n = Math.round(parseFloat(v) * 100); return Number.isFinite(n) ? n : 0; };
const centsIn = c => ((c || 0) / 100).toFixed(2).replace('.', ',');
const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Recife', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const dataBR = s => s ? s.slice(0, 10).split('-').reverse().join('/') : '—';
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const isoUTC = d => d.toISOString().slice(0, 10);
const diasEntre = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5);
function addMeses(iso, n) { const [y, m, d] = iso.split('-').map(Number); const t = m - 1 + n; const yy = y + Math.floor(t / 12), mm = ((t % 12) + 12) % 12; const last = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate(); return `${yy}-${String(mm + 1).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`; }
const addDias = (iso, n) => { const d = parseISO(iso); d.setUTCDate(d.getUTCDate() + n); return isoUTC(d); };
const soma = (arr, f = x => x) => arr.reduce((s, x) => s + (f(x) || 0), 0);
const onlyDigits = s => String(s || '').replace(/\D/g, '');
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dataExtenso = s => { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${y}`; };
const fmtCPF = v => { const d = onlyDigits(v); if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'); return v || ''; };

/* valor por extenso (reais) */
function extenso(cents) {
  const u = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dz = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const ct = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  const tri = n => { if (n === 100) return 'cem'; const c = Math.floor(n / 100), r = n % 100, p = []; if (c) p.push(ct[c]); if (r) { if (r < 20) p.push(u[r]); else { p.push(dz[Math.floor(r / 10)] + (r % 10 ? ' e ' + u[r % 10] : '')); } } return p.join(' e '); };
  const num = n => {
    if (n === 0) return 'zero';
    const g = [['', ''], ['mil', 'mil'], ['milhão', 'milhões'], ['bilhão', 'bilhões']]; const parts = []; let i = 0, groups = [];
    while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000); }
    for (i = groups.length - 1; i >= 0; i--) { const v = groups[i]; if (!v) continue; let t = i === 1 && v === 1 ? 'mil' : tri(v) + (i ? ' ' + (v === 1 ? g[i][0] : g[i][1]) : ''); parts.push({ t, v, i }); }
    return parts.map((p, k) => { if (k === 0) return p.t; const last = k === parts.length - 1; const join = last && (p.i === 0) && (p.v < 100 || p.v % 100 === 0) ? ' e ' : last && p.i === 0 ? ', ' : ', '; return join + p.t; }).join('').replace(/^, /, '');
  };
  cents = Math.round(cents || 0); const r = Math.floor(cents / 100), c = cents % 100; const out = [];
  if (r) { const t = num(r); const de = (r >= 1e6 && r % 1e6 === 0) ? ' de' : ''; out.push(t + de + (r === 1 ? ' real' : ' reais')); }
  if (c) out.push(num(c) + (c === 1 ? ' centavo' : ' centavos'));
  return out.length ? out.join(' e ') : 'zero real';
}

/* ---------- armazenamento (3 modos: servidor próprio, base do artefato, navegador) ---------- */
const COLS = ['filiais', 'usuarios', 'empreendimentos', 'lotes', 'clientes', 'vendas', 'boletos', 'extratos', 'webhooks', 'modelos', 'config', 'plantas', 'logs', 'solicitacoes', 'notificacoes', 'assinaturas'];
const Store = {
  mode: 'local', data: {}, db: null, token: null, downloads: null, queue: {},
  async init() {
    const inArtifact = typeof window.claude === 'object' && window.claude && typeof window.claude.use === 'function';
    if (!inArtifact && /^https?:$/.test(location.protocol)) {
      try { const r = await fetch('api/status', { cache: 'no-store' }); if (r.ok) { const j = await r.json(); if (j && j.app === 'traxup-imob') { this.mode = 'server'; this.serverStatus = j; return; } } } catch (e) { /* sem servidor */ }
    }
    if (inArtifact) {
      const timeout = ms => new Promise(r => setTimeout(() => r(null), ms));
      try { this.db = await Promise.race([window.claude.use('db'), timeout(10000)]); } catch (e) { this.db = null; }
      try { this.downloads = await Promise.race([window.claude.use('downloads'), timeout(4000)]); } catch (e) { this.downloads = null; }
      if (this.db) { this.mode = 'db'; return; }
    }
    this.mode = 'local';
  },
  label() { return { server: 'Servidor TRAXUP (seu VPS)', db: 'Base compartilhada do Claude', local: 'Somente neste navegador (demonstração)' }[this.mode]; },
  async loadAll() {
    this.data = {}; COLS.forEach(c => this.data[c] = {});
    if (this.mode === 'server') {
      const r = await fetch('api/data', { headers: this.authH(), cache: 'no-store' }); if (r.status === 401) throw Error('Sessão expirada. Entre novamente.'); if (r.status === 403) { const j = await r.json().catch(() => ({})); throw Error(j.error || 'Acesso suspenso.'); } if (!r.ok) throw Error('Falha ao carregar dados do servidor.');
      const j = await r.json(); for (const c of COLS) for (const o of (j[c] || [])) this.data[c][o.id] = o; return;
    }
    if (this.mode === 'db') {
      await Promise.all(COLS.map(async c => {
        let last = '';
        for (let page = 0; page < 30; page++) {
          let q = this.db.collection(c).orderBy('id').limit(1000); if (last) q = q.where('id', '>', last);
          const snap = await q.get(); snap.docs.forEach(d => { if (d.exists) this.data[c][d.id] = { ...d.data(), id: d.id }; });
          if (snap.size < 1000) break; last = snap.docs[snap.docs.length - 1].id;
        }
      }));
      return;
    }
    try { const raw = localStorage.getItem('traxup_imob_v1'); if (raw) { const j = JSON.parse(raw); for (const c of COLS) this.data[c] = j[c] || {}; } } catch (e) { /* armazenamento indisponível */ }
  },
  authH() { return this.token ? { Authorization: 'Bearer ' + this.token } : {}; },
  list(c) { return Object.values(this.data[c] || {}); },
  get(c, id) { return id ? (this.data[c] || {})[id] : undefined; },
  saveLocal() { try { localStorage.setItem('traxup_imob_v1', JSON.stringify(this.data)); } catch (e) { toast('Não foi possível gravar no navegador (espaço cheio?).', true); } },
  async put(c, o) {
    if (this.mode === 'portal') throw Error('Painel somente para consulta.');
    o = JSON.parse(JSON.stringify(o)); if (!o.id) o.id = uid(); o.atualizadoEm = new Date().toISOString();
    (this.data[c] ||= {})[o.id] = o;
    const key = c + '/' + o.id; const prev = this.queue[key] || Promise.resolve();
    const job = prev.catch(() => { }).then(() => this._write(c, o)); this.queue[key] = job; await job; return o;
  },
  async _write(c, o) {
    if (this.mode === 'server') { const r = await fetch(`api/data/${c}/${encodeURIComponent(o.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...this.authH() }, body: JSON.stringify(o) }); if (!r.ok) { const j = await r.json().catch(() => ({})); throw Error(j.error || 'O servidor recusou a gravação.'); } return; }
    if (this.mode === 'db') { try { await this.db.collection(c).doc(o.id).set(o); } catch (e) { throw Error(e && e.code === 'quota_exceeded' ? 'A base atingiu o limite de armazenamento.' : e && e.code === 'invalid_argument' ? 'Sem permissão de gravação ou registro grande demais.' : 'Falha ao gravar: ' + (e && e.message || e)); } return; }
    this.saveLocal();
  },
  async del(c, id) {
    if (this.mode === 'portal') throw Error('Painel somente para consulta.');
    delete (this.data[c] || {})[id];
    if (this.mode === 'server') { const r = await fetch(`api/data/${c}/${encodeURIComponent(id)}`, { method: 'DELETE', headers: this.authH() }); if (!r.ok) throw Error('O servidor recusou a exclusão.'); return; }
    if (this.mode === 'db') { await this.db.collection(c).doc(id).delete(); return; }
    this.saveLocal();
  }
};

/* ---------- autenticação ---------- */
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const unhex = h => new Uint8Array(h.match(/../g).map(x => parseInt(x, 16)));
async function hashSenha(senha, saltHex) {
  const salt = saltHex ? unhex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 120000 }, key, 256);
  return { salt: hex(salt), hash: hex(bits) };
}
const PERFIS = {
  'Administrador': ['*'],
  'Gerente': ['mercado', 'painel', 'mapa', 'lotes', 'clientes', 'vendas', 'contratos', 'custos', 'financeiro', 'inadimplencia', 'boletos', 'conciliacao', 'comissoes', 'discord', 'modelos', 'config'],
  'Financeiro': ['mercado', 'painel', 'clientes', 'vendas', 'contratos', 'custos', 'financeiro', 'inadimplencia', 'boletos', 'conciliacao', 'comissoes', 'discord', 'config'],
  'Comercial': ['mercado', 'painel', 'mapa', 'lotes', 'clientes', 'vendas', 'contratos', 'modelos', 'discord', 'config'],
  'Corretor': ['mercado', 'mapa', 'lotes', 'clientes', 'config']
};
const pode = (u, mod) => !!u && (PERFIS[u.perfil] || []).some(m => m === '*' || m === mod);

/* ---------- regras financeiras (herdadas do Vico: entrada, mensal, intercalada, baixas, juros/multa, comissão) ---------- */
const pagoParcela = p => soma(p.pagamentos || [], x => x.valor);
const totalParcela = p => p.valor + (p.juros || 0) + (p.multa || 0);
const saldoParcela = p => Math.max(0, totalParcela(p) - pagoParcela(p));
const vencida = (p, ref = hoje()) => p.venc < ref && saldoParcela(p) > 0;
const statusParcela = (p, ref = hoje()) => saldoParcela(p) === 0 ? 'Paga' : p.venc < ref ? 'Vencida' : p.venc === ref ? 'Vence hoje' : pagoParcela(p) > 0 ? 'Parcial' : 'Em aberto';
const vendaAtiva = v => v.status !== 'Distratado';
const vencidasVenda = (v, ref = hoje()) => (v.parcelas || []).filter(p => vencida(p, ref));
const recebidoVenda = v => soma(v.parcelas || [], pagoParcela);
const saldoVenda = v => soma(v.parcelas || [], saldoParcela);
// saldo da venda como no Vico: valor vendido menos o que já foi pago do principal das parcelas (juros e multa pagos não abatem)
const aReceberVenda = v => Math.max(0, (v.valor || 0) - soma(v.parcelas || [], p => Math.min(pagoParcela(p), p.valor || 0)));
function situacaoVenda(v, ref = hoje()) {
  if (v.status === 'Distratado') return 'Distratado';
  if (v.classificacao === 'Inadimplente') return 'Inadimplente';
  if (v.classificacao === 'Em atraso') return 'Em atraso';
  if (vencidasVenda(v, ref).length) return 'Em atraso'; // como no Vico: inadimplente só quando marcado na venda
  return saldoVenda(v) === 0 && (v.parcelas || []).length ? 'Quitado' : 'Em dia';
}
const comissaoTotal = v => v.comissaoExcluida ? 0 : (v.comissaoValor ?? Math.round(v.valor * (v.comissaoPct ?? 4) / 100));
const comissaoPaga = v => soma(v.comissoesPagas || [], x => x.valor);
const comissaoSaldo = v => Math.max(0, comissaoTotal(v) - comissaoPaga(v));
const comissaoAPagar = v => v.comissaoSuspensa ? 0 : comissaoSaldo(v);
function serieParcelas(tipo, total, qtd, primeiro, intervalo = 1) {
  const out = []; if (!total || !qtd || !primeiro) return out; const reg = Math.floor(total / qtd), ult = total - reg * (qtd - 1);
  for (let i = 0; i < qtd; i++) out.push({ id: uid(), tipo, ref: `${i + 1}/${qtd}`, venc: addMeses(primeiro, i * intervalo), valor: i === qtd - 1 ? ult : reg, juros: 0, multa: 0, pagamentos: [] });
  return out;
}
function encargos(p, dataPag, filial) {
  const dias = Math.max(0, diasEntre(p.venc, dataPag)); if (!dias) return { dias, juros: 0, multa: 0 };
  const base = saldoParcela({ ...p, juros: 0, multa: 0 }) || p.valor;
  const cb = filial?.bb || {}; const multaPct = +(cb.multa ?? filial?.multa ?? 2), jurosMes = +(cb.jurosMes ?? filial?.jurosMes ?? 1);
  const multa = dias > (+cb.multaDias || 0) ? Math.round(base * multaPct / 100) : 0, juros = dias > (+cb.jurosDias || 0) ? Math.round(base * (jurosMes / 100) / 30 * dias) : 0;
  return { dias, multa, juros };
}

/* ---------- configuração de cobrança (por empresa) ---------- */
const BANCOS = [['001', '001 · Banco do Brasil'], ['104', '104 · Caixa Econômica Federal'], ['237', '237 · Bradesco'], ['341', '341 · Itaú'], ['033', '033 · Santander'], ['756', '756 · Sicoob'], ['748', '748 · Sicredi'], ['077', '077 · Inter'], ['260', '260 · Nubank'], ['000', 'Outro']];
const ESPECIES = [['02', '02 · DM – Duplicata Mercantil'], ['04', '04 · DS – Duplicata de Serviço'], ['12', '12 · NP – Nota Promissória'], ['17', '17 · RC – Recibo'], ['99', '99 · Outros']];
const SIGLA_ESPECIE = { '02': 'DM', '04': 'DS', '12': 'NP', '17': 'RC', '99': 'OU' };
function cfgBoleto(fil) {
  const b = fil?.bb || {};
  return { banco: '001', tipoConta: 'Corrente', agencia: '', agenciaDv: '', conta: '', contaDv: '', codigoBeneficiario: '', convenio: '', convenioDv: '0', carteira: '17', variacao: '35', layout: 'CNAB 240', especie: '02', multa: fil?.multa ?? 2, multaDias: 0, jurosMes: fil?.jurosMes ?? 1, jurosDias: 0, protestoDias: 0, negativacaoDias: 0, nossoNumeroInicial: 1, localPagamento: 'Pagável em qualquer banco até o vencimento', instrucoes: '', razao: fil?.razao || fil?.nome || '', cnpj: fil?.cnpj || '', ie: '', cep: '', logradouro: fil?.endereco || '', numero: '', complemento: '', bairro: '', cidade: fil?.cidade || '', uf: fil?.uf || '', ...b,
    ...(b.agencia && b.agencia.includes('-') && !b.agenciaDv ? { agencia: b.agencia.split('-')[0], agenciaDv: b.agencia.split('-')[1] } : {}), ...(b.conta && b.conta.includes('-') && !b.contaDv ? { conta: b.conta.split('-')[0], contaDv: b.conta.split('-')[1] } : {}), ...(b.beneficiario && !b.razao ? { razao: b.beneficiario } : {}) };
}
function pendenciasBoleto(fil) {
  const c = cfgBoleto(fil), f = [];
  if (!c.banco) f.push('banco'); if (!onlyDigits(c.agencia)) f.push('agência'); if (!onlyDigits(c.conta)) f.push('conta'); if (!onlyDigits(c.convenio)) f.push('convênio'); if (!c.carteira) f.push('carteira');
  if (c.banco === '001' && !c.variacao) f.push('variação da carteira'); if (!c.razao) f.push('razão social'); if (onlyDigits(c.cnpj).length !== 14 && onlyDigits(c.cnpj).length !== 11) f.push('CNPJ');
  if (!onlyDigits(c.cep) || !c.logradouro || !c.cidade || !c.uf) f.push('endereço do cedente');
  return f;
}
function instrucoesBoleto(c, extra = '') {
  const t = [];
  if (+c.multa) t.push(`Após ${+c.multaDias ? (+c.multaDias + ' dia(s) do vencimento') : 'o vencimento'}, cobrar multa de ${String(c.multa).replace('.', ',')}%.`);
  if (+c.jurosMes) t.push(`Juros de mora de ${String(c.jurosMes).replace('.', ',')}% ao mês${+c.jurosDias ? ` após ${c.jurosDias} dia(s) do vencimento` : ''}.`);
  if (+c.protestoDias) t.push(`Sujeito a protesto após ${c.protestoDias} dias do vencimento.`);
  if (+c.negativacaoDias) t.push(`Sujeito a negativação após ${c.negativacaoDias} dias do vencimento.`);
  if (c.instrucoes) t.push(c.instrucoes); if (extra) t.push(extra);
  return t.join(' ');
}

/* ---------- boleto Banco do Brasil (convênio de 7 dígitos, carteira 17) ---------- */
function mod10(n) { let s = 0, w = 2; for (let i = n.length - 1; i >= 0; i--) { let x = +n[i] * w; if (x > 9) x = Math.floor(x / 10) + (x % 10); s += x; w = w === 2 ? 1 : 2; } return (10 - (s % 10)) % 10; }
function mod11Barra(n) { let s = 0, w = 2; for (let i = n.length - 1; i >= 0; i--) { s += +n[i] * w; w = w === 9 ? 2 : w + 1; } const r = 11 - (s % 11); return (r === 0 || r === 10 || r === 11) ? 1 : r; }
function fatorVencimento(iso) { let d = diasEntre('1997-10-07', iso); while (d > 9999) d -= 9000; return String(d).padStart(4, '0'); }
function nossoNumeroBB(convenio, seq) { return String(convenio).padStart(7, '0').slice(-7) + String(seq).padStart(10, '0').slice(-10); }
function codigoBarrasBB({ convenio, seq, carteira = '17', valor, venc }) {
  const nn = nossoNumeroBB(convenio, seq); const livre = '000000' + nn + String(carteira).padStart(2, '0').slice(-2);
  const semDV = '001' + '9' + fatorVencimento(venc) + String(Math.round(valor)).padStart(10, '0') + livre;
  const dv = mod11Barra(semDV); return semDV.slice(0, 4) + dv + semDV.slice(4);
}
function linhaDigitavel(barras) {
  const livre = barras.slice(19), c1 = barras.slice(0, 4) + livre.slice(0, 5), c2 = livre.slice(5, 15), c3 = livre.slice(15, 25);
  const f1 = c1 + mod10(c1), f2 = c2 + mod10(c2), f3 = c3 + mod10(c3);
  return `${f1.slice(0, 5)}.${f1.slice(5)} ${f2.slice(0, 5)}.${f2.slice(5)} ${f3.slice(0, 5)}.${f3.slice(5)} ${barras[4]} ${barras.slice(5, 19)}`;
}
function barrasDeLinha(linha) { const d = onlyDigits(linha); if (d.length !== 47) return ''; return d.slice(0, 4) + d[32] + d.slice(33, 47) + d.slice(4, 9) + d.slice(10, 20) + d.slice(21, 31); }
function svgI25(code, h = 50, n = 1, w = 3) {
  const P = ['nnwwn', 'wnnnw', 'nwnnw', 'wwnnn', 'nnwnw', 'wnwnn', 'nwwnn', 'nnnww', 'wnnwn', 'nwnwn'];
  if (code.length % 2) code = '0' + code; let x = 10, bars = ''; const bar = (bw, on) => { if (on) bars += `<rect x="${x}" y="0" width="${bw}" height="${h}"/>`; x += bw; };
  ['n', 'n', 'n', 'n'].forEach((t, i) => bar(n, i % 2 === 0));
  for (let i = 0; i < code.length; i += 2) { const a = P[+code[i]], b = P[+code[i + 1]]; for (let k = 0; k < 5; k++) { bar(a[k] === 'w' ? w : n, true); bar(b[k] === 'w' ? w : n, false); } }
  bar(w, true); bar(n, false); bar(n, true);
  return `<svg class="barcodeSvg" xmlns="http://www.w3.org/2000/svg" width="${x + 10}" height="${h}" viewBox="0 0 ${x + 10} ${h}" fill="#000">${bars}</svg>`;
}

/* ---------- conciliação: leitura de extrato OFX / CSV ---------- */
function parseOFX(txt) {
  const out = []; const blocks = txt.split(/<STMTTRN>/i).slice(1);
  const tag = (b, t) => { const m = b.match(new RegExp('<' + t + '>([^<\\r\\n]*)', 'i')); return m ? m[1].trim() : ''; };
  for (const b of blocks) {
    const dt = tag(b, 'DTPOSTED'); const amt = tag(b, 'TRNAMT').replace(',', '.');
    if (!dt || !amt) continue;
    out.push({ fitid: tag(b, 'FITID') || uid(), data: `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`, valor: Math.round(parseFloat(amt) * 100), memo: [tag(b, 'NAME'), tag(b, 'MEMO')].filter(Boolean).join(' · '), doc: tag(b, 'CHECKNUM') || tag(b, 'REFNUM') });
  }
  const conta = (txt.match(/<ACCTID>([^<\r\n]*)/i) || [])[1] || ''; const banco = (txt.match(/<BANKID>([^<\r\n]*)/i) || [])[1] || '';
  return { conta: conta.trim(), banco: banco.trim(), transacoes: out };
}
function parseCSVExtrato(txt) {
  const lines = txt.split(/\r?\n/).filter(l => l.trim()); if (!lines.length) return { transacoes: [] };
  const sep = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ';' : ',';
  const split = l => { const r = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === sep && !q) { r.push(cur); cur = ''; } else cur += ch; } r.push(cur); return r.map(s => s.trim()); };
  let head = split(lines[0]).map(norm); let start = 1;
  let iD = head.findIndex(h => h.includes('data')), iV = head.findIndex(h => h.includes('valor')), iM = head.findIndex(h => /hist|descr|memo|lanc/.test(h)), iDoc = head.findIndex(h => /doc|nosso/.test(h));
  if (iD < 0 || iV < 0) { iD = 0; iM = 1; iV = 2; start = 0; }
  const out = [];
  for (const l of lines.slice(start)) {
    const c = split(l); const d = c[iD] || ''; let iso = '';
    const m1 = d.match(/(\d{2})\/(\d{2})\/(\d{4})/), m2 = d.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m1) iso = `${m1[3]}-${m1[2]}-${m1[1]}`; else if (m2) iso = m2[0]; else continue;
    let v = (c[iV] || '').replace(/[R$\s]/g, ''); const neg = /^-|D$/i.test(v); v = v.replace(/[CD]$/i, '').replace('-', '');
    const cents = toCents(v) * (neg ? -1 : 1); if (!cents) continue;
    out.push({ fitid: 'csv-' + iso + '-' + cents + '-' + norm(c[iM] || '').slice(0, 24).replace(/\W/g, ''), data: iso, valor: cents, memo: c[iM] || '', doc: iDoc >= 0 ? c[iDoc] : '' });
  }
  return { transacoes: out };
}
/* pontua parcelas em aberto para um crédito do extrato */
function sugerirConciliacao(tx, vendas, boletos) {
  if (tx.valor <= 0) return [];
  const memo = norm(tx.memo + ' ' + (tx.doc || '')), memoDig = onlyDigits(tx.memo + ' ' + (tx.doc || ''));
  const res = [];
  for (const v of vendas) {
    if (!vendaAtiva(v)) continue; const cli = Store.get('clientes', v.clienteId); const nomeTokens = norm(cli?.nome).split(/\s+/).filter(t => t.length > 3);
    for (const p of v.parcelas || []) {
      const saldo = saldoParcela(p); if (!saldo) continue; let s = 0; const motivos = [];
      const bol = boletos.find(b => b.vendaId === v.id && b.parcelaId === p.id && b.status !== 'Cancelado');
      if (bol && memoDig.includes(onlyDigits(bol.nossoNumero).slice(-10))) { s += 100; motivos.push('nosso número'); }
      if (tx.valor === saldo || tx.valor === p.valor) { s += 50; motivos.push('valor exato'); }
      else if (tx.valor > saldo && tx.valor <= saldo * 1.15) { s += 25; motivos.push('valor com encargos'); }
      const hits = nomeTokens.filter(t => memo.includes(t)).length; if (hits) { s += Math.min(30, hits * 15); motivos.push('nome do cliente'); }
      const dd = Math.abs(diasEntre(p.venc, tx.data)); if (dd <= 5) { s += 15; motivos.push('data próxima'); } else if (dd <= 35) s += 5;
      if (s >= 50) res.push({ vendaId: v.id, parcelaId: p.id, score: s, motivos, saldo, venc: p.venc });
    }
  }
  return res.sort((a, b) => b.score - a.score || a.venc.localeCompare(b.venc)).slice(0, 5);
}

/* ---------- modelo de contrato: variáveis ---------- */
function contextoVenda(v) {
  const cli = Store.get('clientes', v?.clienteId) || {}, lote = Store.get('lotes', v?.loteId) || {}, emp = Store.get('empreendimentos', lote.empId) || {}, fil = Store.get('filiais', v?.filialId) || {};
  const ps = v?.parcelas || []; const t = tipo => ps.filter(p => p.tipo === tipo);
  const serie = tipo => { const a = t(tipo); return { total: soma(a, p => p.valor), qtd: a.length, valor: a[0]?.valor || 0, primeiro: a[0]?.venc || '' }; };
  const E = serie('Entrada'), M = serie('Mensal'), I = serie('Intercalada');
  const endereco = [cli.logradouro, cli.numero, cli.complemento, cli.bairro, cli.cidade && (cli.cidade + (cli.uf ? '/' + cli.uf : '')), cli.cep && 'CEP ' + cli.cep].filter(Boolean).join(', ');
  const tabela = ps.length ? `<table style="border-collapse:collapse;width:100%"><tr><th>Tipo</th><th>Parcela</th><th>Vencimento</th><th>Valor</th></tr>${ps.map(p => `<tr><td>${esc(p.tipo)}</td><td>${esc(p.ref)}</td><td>${dataBR(p.venc)}</td><td style="text-align:right">${brl(p.valor)}</td></tr>`).join('')}</table>` : '';
  return {
    'cliente.nome': cli.nome, 'cliente.cpf': fmtCPF(cli.cpf), 'cliente.rg': cli.rg, 'cliente.nacionalidade': cli.nacionalidade, 'cliente.estado_civil': cli.estadoCivil, 'cliente.profissao': cli.profissao, 'cliente.conjuge': cli.conjuge, 'cliente.endereco_completo': endereco, 'cliente.telefone': cli.telefone, 'cliente.email': cli.email,
    'lote.empreendimento': emp.nome, 'lote.quadra': lote.quadra, 'lote.numero': lote.numero, 'lote.area': lote.area ? String(lote.area).replace('.', ',') + ' m²' : '', 'lote.frente': lote.frente ? lote.frente + ' m' : '', 'lote.fundo': lote.fundo ? lote.fundo + ' m' : '', 'lote.matricula': lote.matricula, 'lote.confrontacoes': lote.confrontacoes, 'empreendimento.cidade': emp.cidade,
    'venda.numero': v?.numero, 'venda.data': dataBR(v?.data), 'venda.data_extenso': dataExtenso(v?.data), 'venda.valor': brl(v?.valor), 'venda.valor_extenso': extenso(v?.valor), 'venda.corretor': v?.corretor, 'venda.indice': v?.indice, 'venda.juros_reajuste': v?.reajuste,
    'entrada.total': brl(E.total), 'entrada.total_extenso': extenso(E.total), 'entrada.qtd': E.qtd, 'entrada.valor': brl(E.valor), 'entrada.primeiro_venc': dataBR(E.primeiro),
    'mensal.total': brl(M.total), 'mensal.total_extenso': extenso(M.total), 'mensal.qtd': M.qtd, 'mensal.valor': brl(M.valor), 'mensal.valor_extenso': extenso(M.valor), 'mensal.primeiro_venc': dataBR(M.primeiro),
    'intercalada.total': brl(I.total), 'intercalada.total_extenso': extenso(I.total), 'intercalada.qtd': I.qtd, 'intercalada.valor': brl(I.valor), 'intercalada.primeiro_venc': dataBR(I.primeiro),
    'filial.nome': fil.razao || fil.nome, 'filial.cnpj': fmtCPF(fil.cnpj), 'filial.endereco': fil.endereco, 'filial.cidade': fil.cidade, 'filial.uf': fil.uf,
    'hoje': dataBR(hoje()), 'hoje_extenso': dataExtenso(hoje()), 'tabela_parcelas': tabela
  };
}
const VARIAVEIS = Object.keys(contextoVenda(null));
function renderModelo(texto, ctx, { html = true } = {}) {
  return String(texto || '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k) => {
    if (!(k in ctx)) return m; const v = ctx[k];
    if (k === 'tabela_parcelas') return html ? v : '';
    return v === undefined || v === null || v === '' ? (html ? '<span style="background:#FFF3D6">[' + k + ']</span>' : '[' + k + ']') : (html ? esc(v) : String(v));
  });
}
