# TRAXUP Imobiliário

**Tecnologia que impulsiona negócios.** Sistema SaaS de gestão de loteamentos, multifilial, com a identidade visual TRAXUP.

Derivado das regras de negócio do sistema financeiro Vico (lotes, vendas com entrada / mensais / intercaladas, baixas com juros e multa, inadimplência por parcelas vencidas, comissões de 4%), reescrito como produto TRAXUP e ampliado.

## Módulos

| Área | O que faz |
|---|---|
| **Login e usuários** | Senhas com PBKDF2-SHA256 (120 mil iterações). Perfis Administrador, Gerente, Financeiro, Comercial e Corretor, cada um com acesso às filiais escolhidas. Auditoria das ações. |
| **Multifiliais** | Cada filial tem seus empreendimentos, lotes, clientes, vendas, conta e convênio do Banco do Brasil. Seletor de filial no topo ("Todas" consolida). |
| **Mapa de lotes** | Visão por quadras (cores por situação) e visão sobre a **planta** do loteamento (envie a imagem e posicione cada lote). Reservar, liberar e vender direto do mapa. |
| **Lotes** | Cadastro individual ou em série (ex.: quadras A–F, 20 lotes cada), preço, custo e lucro previsto. |
| **Clientes** | Ficha completa para contrato (CPF, RG, estado civil, cônjuge, endereço). |
| **Vendas e contratos** | Plano de pagamento com entrada, mensais e intercaladas (botão de condição padrão: 5% entrada, 30% intercaladas, restante mensal). Gera as parcelas, marca o lote como vendido, registra histórico. Distrato devolve o lote. |
| **Parcelas e baixas** | Baixa com multa e juros pro rata calculados pela filial, estorno, parcelas avulsas, exportação CSV. |
| **Inadimplência** | Em atraso (1–2 parcelas) e inadimplente (3+ ou marcado manualmente), maior atraso, envio da lista ao Discord. |
| **Boletos Banco do Brasil** | Nosso número, código de barras e linha digitável no padrão FEBRABAN do BB (convênio de 7 dígitos, carteira 17), ficha de compensação para impressão, emissão em lote do mês e **registro na API de Cobrança v2 do BB** (com PIX) pelo servidor. |
| **Conciliação bancária** | Importa extrato **OFX** (BB e demais bancos) ou CSV, evita lançamentos duplicados e sugere a parcela de cada crédito cruzando nosso número, valor, nome do cliente e data. Conciliação em massa das sugestões fortes; desfazer estorna a baixa. |
| **Comissões** | Comissão por venda (percentual ou valor), pagamentos parciais e saldo por corretor. |
| **Mensagens Discord** | Canais por webhook, modelos prontos (resumo do dia, inadimplentes, vencimentos, lotes disponíveis, cobrança, nova venda), variáveis da venda, modelos salvos, divisão automática em mensagens de 2.000 caracteres e histórico de envios. |
| **Modelos de contrato** | Importa o modelo da empresa (**.docx**, .txt ou .html), troca os dados fixos por variáveis (`{{cliente.nome}}`, `{{venda.valor_extenso}}`, `{{tabela_parcelas}}`…), gera o contrato preenchido da venda e baixa em Word. Valores por extenso automáticos. |

## Estrutura

```
public/index.html   sistema completo em um arquivo (gerado)
src/                código-fonte: styles.css, core.js (regras, boleto, OFX), app.js (telas), actions.js (ações)
server.js           servidor Node sem dependências: login, dados, Discord, API do BB
scripts/build.mjs   gera public/index.html a partir de src/
assets/             logo TRAXUP
```

O sistema escolhe sozinho onde guardar os dados:

1. **Servidor TRAXUP** (`node server.js`) — modo de produção. Dados em `data/db.json` com backup diário (30 dias), login validado no servidor, Discord e Banco do Brasil funcionando.
2. **Base compartilhada do Claude** — quando aberto como artefato no claude.ai. Bom para demonstração e uso interno; o login é verificado no navegador e não há Discord nem registro no BB (o navegador não pode chamar sites externos).
3. **Navegador** — abrindo o `index.html` direto; dados só naquele navegador.

## Instalação no VPS (Hostinger, Ubuntu)

```bash
# 1. Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs

# 2. Código
sudo mkdir -p /opt/traxup && sudo chown $USER /opt/traxup
git clone https://github.com/DjonesErison/TRAXUP-SAAS-Imobiliario.git /opt/traxup/imobiliario
cd /opt/traxup/imobiliario && cp .env.example .env && nano .env

# 3. Teste
node server.js     # abra http://IP_DO_VPS:3000 (com HOST=0.0.0.0) e faça o primeiro acesso
```

Serviço permanente (`/etc/systemd/system/traxup-imob.service`):

```ini
[Unit]
Description=TRAXUP Imobiliario
After=network.target
[Service]
WorkingDirectory=/opt/traxup/imobiliario
ExecStart=/usr/bin/node server.js
Restart=always
User=www-data
Environment=NODE_ENV=production
[Install]
WantedBy=multi-user.target
```

```bash
sudo chown -R www-data /opt/traxup/imobiliario/data 2>/dev/null; sudo systemctl enable --now traxup-imob
```

Nginx + HTTPS (troque o domínio):

```nginx
server {
  server_name imob.traxup.com.br;
  client_max_body_size 10m;
  location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $remote_addr; }
}
```

```bash
sudo certbot --nginx -d imob.traxup.com.br
```

Atualizar: `git pull && sudo systemctl restart traxup-imob`. Se editar `src/`, rode `npm run build` antes.

## Banco do Brasil

1. Em **developers.bb.com.br**, crie a aplicação e habilite a **API Cobrança** (comece em homologação).
2. Copie `client_id`, `client_secret` e `developer_application_key` para o `.env` (`BB_AMBIENTE=sandbox`).
3. No sistema, em **Filiais**, informe agência, conta, **convênio de 7 dígitos**, carteira (17) e variação (ex.: 35), multa e juros.
4. Emita um boleto e clique **Registrar no BB**. Confira o retorno em homologação antes de passar para `BB_AMBIENTE=producao` (o BB pode exigir certificado digital: `BB_CERT_PFX`).
5. Para conciliar, exporte o extrato no formato **OFX (Money)** e importe em **Conciliação bancária**.

> Os campos enviados seguem a API de Cobrança v2 (`POST /cobrancas/v2/boletos`). Valide com o seu gerente/consultor BB as regras do seu convênio (variação, modalidade, juros e multa) no ambiente de homologação.

## Discord

No canal: **Configurações → Integrações → Webhooks → Novo webhook → Copiar URL**. Cole em **Mensagens Discord → Adicionar**. O envio sai pelo servidor.

## Desenvolvimento

```bash
npm run build   # gera public/index.html
npm start       # servidor em http://localhost:3000
```

Sem dependências npm. Leitura de .docx carrega o JSZip do cdnjs sob demanda.

## Observações

- O modelo de contrato incluído é uma **base** para adaptação; revise com o jurídico da empresa.
- No modo artefato, quem tem acesso ao artefato pode ler os registros da base (inclusive o hash das senhas). Para clientes e dados reais, use o servidor TRAXUP.
