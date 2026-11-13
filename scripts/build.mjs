// Gera public/index.html (arquivo único) a partir de src/. Sem dependências: node scripts/build.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = f => fs.readFileSync(path.join(root, f), 'utf8');
const b64 = f => 'data:image/' + (f.endsWith('.png') ? 'png' : f.endsWith('.webp') ? 'webp' : 'jpeg') + ';base64,' + fs.readFileSync(path.join(root, 'assets/' + f)).toString('base64');
const logo = b64('traxup-logo.jpg'), word = b64('traxup-stack.webp'), icon = b64('traxup-icon.webp'), horiz = b64('traxup-horizontal.webp');
const fav = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#0A2463"/><rect x="8" y="26" width="7" height="14" rx="2" fill="#2F6BF0"/><rect x="19" y="20" width="7" height="20" rx="2" fill="#2F6BF0"/><rect x="30" y="13" width="7" height="27" rx="2" fill="#2F6BF0"/><path d="M6 36 17 28l6 4 14-14" stroke="#FF9F1C" stroke-width="4" fill="none" stroke-linecap="round"/></svg>')}`;
const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>TRAXUP Imobiliário</title><link rel="icon" href="${icon}"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest"><script>if(/^\/(painel-cliente|cliente)(\/|$)/.test(location.pathname)){document.querySelector('link[rel=manifest]').href='/painel-cliente/manifest.webmanifest';document.querySelector('meta[name=apple-mobile-web-app-title]')?.setAttribute('content','Meu Lote')}</script><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="TRAXUP Imob"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="theme-color" content="#0A2463">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
<style id="appStyles">${r('src/styles.css')}</style></head>
<body><div id="app"></div>
<script>const LOGO_IMG=${JSON.stringify(logo)}, LOGO_WORD=${JSON.stringify(word)}, LOGO_ICON=${JSON.stringify(icon)}, LOGO_H=${JSON.stringify(horiz)};</script>
<script>${r('src/core.js')}</script>
<script>${r('src/vico.js')}</script>
<script>${r('src/app.js')}</script>
<script>${r('src/actions.js')}</script>
<script>${r('src/portal.js')}</script>
</body></html>`;
fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/index.html'), html);
console.log('public/index.html', (html.length / 1024).toFixed(0) + ' KB');

// Painel Gerencial (/painelgerencial)
const gestao = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Painel Gerencial — TRAXUP Imobiliário</title><link rel="icon" href="${icon}"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="apple-mobile-web-app-title" content="TRAXUP Gestão"><meta name="theme-color" content="#0A2463">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
<style>${r('src/gestao.css')}</style></head>
<body><div style="min-height:100vh;display:grid;place-items:center;background:#0A2463"><div class="spin"></div></div>
<script>const LOGO_H=${JSON.stringify(horiz)};</script>
<script>${r('src/gestao.js')}</script>
</body></html>`;
fs.writeFileSync(path.join(root, 'public/gestao.html'), gestao);
console.log('public/gestao.html', (gestao.length / 1024).toFixed(0) + ' KB');
