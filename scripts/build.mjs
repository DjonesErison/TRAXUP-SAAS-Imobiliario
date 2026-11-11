// Gera public/index.html (arquivo único) a partir de src/. Sem dependências: node scripts/build.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = f => fs.readFileSync(path.join(root, f), 'utf8');
const logo = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(root, 'assets/traxup-logo.jpg')).toString('base64');
const fav = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#0A2463"/><rect x="8" y="26" width="7" height="14" rx="2" fill="#2F6BF0"/><rect x="19" y="20" width="7" height="20" rx="2" fill="#2F6BF0"/><rect x="30" y="13" width="7" height="27" rx="2" fill="#2F6BF0"/><path d="M6 36 17 28l6 4 14-14" stroke="#FF9F1C" stroke-width="4" fill="none" stroke-linecap="round"/></svg>')}`;
const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>TRAXUP Imobiliário</title><link rel="icon" href="${fav}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
<style id="appStyles">${r('src/styles.css')}</style></head>
<body><div id="app"></div>
<script>const LOGO_IMG=${JSON.stringify(logo)};</script>
<script>${r('src/core.js')}</script>
<script>${r('src/vico.js')}</script>
<script>${r('src/app.js')}</script>
<script>${r('src/actions.js')}</script>
<script>${r('src/portal.js')}</script>
</body></html>`;
fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/index.html'), html);
console.log('public/index.html', (html.length / 1024).toFixed(0) + ' KB');
