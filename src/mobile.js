/* Celular: tabelas viram cartões.
 * Cada <td> recebe data-label com o título da coluna (do <thead>); o CSS (≤700px) mostra
 * cada linha como um cartão "Título: valor". Vale para todas as telas, sem mexer em cada uma. */
(function () {
  const MIN_COLS = 4; // tabelas pequenas (2–3 colunas) já cabem no celular
  const limpar = t => (t || '').replace(/[⇅↑↓▲▼⬍]/g, '').replace(/\s+/g, ' ').trim();
  function rotular(tb) {
    const head = tb.tHead && tb.tHead.rows[tb.tHead.rows.length - 1];
    if (!head) return;
    const nomes = []; let qtd = 0;
    for (const th of head.cells) { const span = th.colSpan || 1; for (let i = 0; i < span; i++) nomes.push(i ? '' : limpar(th.textContent)); qtd += span; }
    if (qtd < MIN_COLS || tb.closest('.boletoWrap,.docPreview,.rjQuadros,.noCards')) { tb.classList.remove('mCards'); return; }
    tb.classList.add('mCards');
    for (const sec of [...tb.tBodies, tb.tFoot].filter(Boolean)) for (const tr of sec.rows) {
      let c = 0; const cells = [...tr.cells];
      tr.classList.toggle('mLinhaUnica', cells.length === 1);
      cells.forEach((td, i) => {
        const span = td.colSpan || 1; const nome = span > 1 ? '' : (nomes[c] || '');
        if (td.dataset.label !== nome) td.dataset.label = nome;
        td.classList.toggle('mPrim', i === 0);
        const txt = td.textContent.trim(); td.classList.toggle('mVazio', (!txt || (!nome && /^[—–-]$/.test(txt))) && !td.querySelector('button,input,select,a,svg,img'));
        c += span;
      });
    }
  }
  let agendado = false;
  function rodar() { agendado = false; document.querySelectorAll('table').forEach(rotular); }
  function agendar() { if (!agendado) { agendado = true; requestAnimationFrame(rodar); } }
  const iniciar = () => { new MutationObserver(agendar).observe(document.body, { childList: true, subtree: true }); agendar(); };
  if (document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);
})();
