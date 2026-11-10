#!/usr/bin/env bash
# Instala/atualiza o TRAXUP Imobiliário num VPS Ubuntu/Debian, em diretório próprio.
# Uso:  curl -fsSL https://raw.githubusercontent.com/DjonesErison/TRAXUP-SAAS-Imobiliario/main/scripts/install-vps.sh | sudo DOMAIN=imob.traxup.com.br bash
set -euo pipefail
DOMAIN="${DOMAIN:-imob.traxup.com.br}"
APP_DIR="${APP_DIR:-/opt/traxup/imobiliario}"
REPO="${REPO:-https://github.com/DjonesErison/TRAXUP-SAAS-Imobiliario.git}"
PORT="${PORT:-3010}"
EMAIL="${EMAIL:-}"
SERVICE=traxup-imob
log(){ printf '\n\033[1;34m[TRAXUP]\033[0m %s\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Rode como root (sudo)."; exit 1; }

log "1/6 Pacotes básicos"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git curl ca-certificates >/dev/null

log "2/6 Node.js"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
echo "node $(node -v)"

log "3/6 Código em $APP_DIR"
mkdir -p "$(dirname "$APP_DIR")"
if [ -d "$APP_DIR/.git" ]; then git -C "$APP_DIR" pull --ff-only; else git clone --depth 1 "$REPO" "$APP_DIR"; fi
id -u traxup >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin traxup
mkdir -p "$APP_DIR/data"
if [ ! -f "$APP_DIR/.env" ]; then
  # porta livre
  while ss -ltn "( sport = :$PORT )" | grep -q ":$PORT"; do PORT=$((PORT+1)); done
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  sed -i "s/^PORT=.*/PORT=$PORT/; s/^HOST=.*/HOST=127.0.0.1/" "$APP_DIR/.env"
else
  PORT="$(grep -E '^PORT=' "$APP_DIR/.env" | cut -d= -f2 | tr -dc 0-9)"; PORT="${PORT:-3010}"
fi
chown -R traxup:traxup "$APP_DIR/data" "$APP_DIR/.env"; chmod 600 "$APP_DIR/.env"
echo "porta interna: $PORT"

log "4/6 Serviço systemd ($SERVICE)"
cat > /etc/systemd/system/$SERVICE.service <<EOF
[Unit]
Description=TRAXUP Imobiliario
After=network.target
[Service]
WorkingDirectory=$APP_DIR
ExecStart=$(command -v node) server.js
Restart=always
RestartSec=3
User=traxup
Environment=NODE_ENV=production
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now $SERVICE >/dev/null
systemctl restart $SERVICE
sleep 2
curl -fsS "http://127.0.0.1:$PORT/api/status" && echo

log "5/6 Proxy web para $DOMAIN"
WEB="$(ss -ltnp '( sport = :80 )' 2>/dev/null | grep -oE 'users:\(\("[^"]+' | head -1 | cut -d'"' -f2 || true)"
echo "porta 80 em uso por: ${WEB:-ninguém}"
if [ -z "$WEB" ] || [ "$WEB" = nginx ]; then
  command -v nginx >/dev/null || apt-get install -y -qq nginx >/dev/null
  cat > /etc/nginx/sites-available/$SERVICE <<EOF
server {
  listen 80;
  server_name $DOMAIN;
  client_max_body_size 10m;
  location / {
    proxy_pass http://127.0.0.1:$PORT;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 90s;
  }
}
EOF
  ln -sf /etc/nginx/sites-available/$SERVICE /etc/nginx/sites-enabled/$SERVICE
  nginx -t && systemctl reload nginx || systemctl restart nginx
else
  echo "ATENÇÃO: a porta 80 é de '$WEB' (não Nginx). Configure nesse proxy: $DOMAIN -> http://127.0.0.1:$PORT"
  exit 2
fi

log "6/6 HTTPS (Let's Encrypt)"
command -v certbot >/dev/null || apt-get install -y -qq certbot python3-certbot-nginx >/dev/null
if getent hosts "$DOMAIN" >/dev/null; then
  if [ -n "$EMAIL" ]; then CB=(-m "$EMAIL"); else CB=(--register-unsafely-without-email); fi
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --redirect "${CB[@]}" || echo "Certificado não emitido agora (DNS ainda propagando?). Rode depois: certbot --nginx -d $DOMAIN"
else
  echo "DNS de $DOMAIN ainda não resolve. Depois rode: certbot --nginx -d $DOMAIN"
fi
log "Pronto: https://$DOMAIN  (logs: journalctl -u $SERVICE -f)"
