# Fortress UI Production Guide v1.0

> Guia de produção visual e funcional para o app/site Fortress (landing + app autenticada).
> Referências visuais: Obsidian Night (dark) + Porcelain Light (light).

---

## 1. Propósito

Este documento descreve **como produzir** a experiência visual e funcional do Fortress com base nos padrões de branding e nas features existentes no repositório. Ele cobre:

- Landing (tela inicial), fluxo de experimentação e páginas de marketing.
- Telas de autenticação (login, registro e verificação).
- App autenticada (dashboard, metas, supermercado, intelligence e recibos).
- Regras de UI, layout, componentes e microcopy.

---

## 2. Arquitetura de informação (IA)

### 2.1 Rotas atuais

**Marketing / Público**
- `/` — Landing (Header, Hero, Benefits, Pricing, Footer)
- `/try` — Try Fortress (experiência simplificada de experimentação)

**Autenticação**
- `/login` — Login
- `/register` — Registro
- `/verify-email` — Verificação (quando aplicável)
- `/auth/callback` — OAuth callback

**App autenticada**
- `/dashboard`
- `/goals`
- `/supermarket`
- `/intelligence`
- `/receipts` (quando ativada)

### 2.2 Navegação principal (app autenticada)

Sidebar vertical com ícone da marca no topo e itens:

1. Home/Dashboard
2. Goals
3. Supermarket
4. Intelligence
5. Receipts (placeholder quando não ativo)
6. Settings (opcional, futuro)

---

## 3. Diretrizes visuais globais

### 3.1 Temas

**Obsidian Night**
- Ideal para modo de análise e foco.
- Fundo escuro, cards grafite, texto alto contraste.

**Porcelain Light**
- Ideal para navegação clara e leitura prolongada.
- Fundo claro, cards brancos, sombra suave.

### 3.2 Elementos recorrentes

- **Cards**: raio 20–24px, borda sutil, sombra leve, hover discreto.
- **Botões**: primário verde Fortress; secundário com outline suave.
- **Typography**: títulos com peso 600–700; labels em uppercase com tracking amplo.
- **Badges**: micro labels em 10–12px com fundo leve.

---

## 4. Produção das telas

### 4.1 Landing (tela inicial)

**Objetivo**: apresentar valor, gerar confiança e conduzir para `Try` e `Login`.

**Estrutura**
1. **Header** — Logo + menu curto (Produto, Recursos, Preço, Entrar).
2. **Hero** — promessa principal + CTA ("Começar" / "Ver Demo").
3. **Benefits** — 3–6 cards com principais resultados (ordem, previsibilidade, controle).
4. **Pricing** — planos claros e transparentes.
5. **Footer** — marca, links institucionais e contato.

**Diretrizes**
- Microcopy calma e clara.
- CTA principal em verde institucional.
- Uso de gráficos/ilustrações discretas.

---

### 4.2 Try Fortress (`/try`)

**Objetivo**: demonstrar valor sem cadastro.

**Blocos sugeridos**
- Prévia de dashboard com dados fictícios.
- Exemplo de insight de estabilidade.
- Botão final para criar conta.

---

### 4.3 Login (`/login`)

**Objetivo**: acesso rápido e confiante.

**Layout**
- Card centralizado, com logo circular e título institucional.
- Inputs grandes, com bordas discretas.
- Botão primário com microcopy clara.

**Estados**
- Erro: mensagem curta, tom neutro.
- Carregando: feedback sutil.

---

### 4.4 Registro (`/register`)

**Objetivo**: onboarding leve.

**Layout**
- Mesmo padrão do login.
- Inputs para nome, email, senha.
- Mensagem de segurança/privacidade curta no rodapé.

---

### 4.5 Dashboard (`/dashboard`)

**Objetivo**: visão rápida, elegante e clara da saúde financeira.

**Layout (grid 12 colunas)**
- **Coluna esquerda (2/3)**
  1. **Card principal** — valor consolidado (Fortress Card).
  2. **Card de performance** — gráfico mensal.
  3. **Card de insights** — CTA para insights.
- **Coluna direita (1/3)**
  1. **Market Data** — 2–3 ativos.
  2. **Recent Transactions** — últimas 2–5 transações.

**Detalhes visuais**
- Barras com destaque em um pico (efeito “ponto alto”).
- Ícones minimalistas e alinhados ao verde institucional.
- Shadow sutil para destacar cards.

---

### 4.6 Metas (`/goals`)

**Objetivo**: registrar diretrizes financeiras e acompanhar progresso.

**Componentes**
- Cards com:
  - nome da meta
  - periodicidade
  - valor alvo
  - progresso visual (barra)
  - status (nominal / risco)

**Interação**
- Modal de criação com inputs grandes e layout limpo.

---

### 4.7 Supermarket (`/supermarket`)

**Objetivo**: organizar listas de consumo e processar recibos.

**Componentes**
- Tabs/segmentos de estratégia (mensal, estratégica, emergência).
- Listas com itens e toggle comprado.
- Sidebar de auditoria (processamento de recibo + insight).

**Visual**
- Uso de ícones sutis (🛒, 🧠) com estilo minimal.
- Cards organizados com spacing generoso.

---

### 4.8 Intelligence (`/intelligence`)

**Objetivo**: transparência do motor de análise.

**Componentes**
- Card de Persona Audit (avatar circular + métricas).
- Card de Pesos Neurais (barras horizontais).
- Card de Fluxo Natural (estado cognitivo e cooldown).

---

### 4.9 Receipts (`/receipts`)

**Objetivo**: histórico de auditorias e recibos.

**Diretriz**
- Cards com data, valor, categoria e status.
- CTA para exportar ou arquivar.

---

## 5. Microcopy & tom

- Evitar julgamento e pressão.
- Texto deve sugerir segurança e controle.
- Manter terminologia institucional: "Diretrizes", "Auditoria", "Kernel", "Fortress Card".

---

## 6. Checklist de produção

- [ ] Tema dark e light aplicados com coerência.
- [ ] Cards com raio 20–24px, bordas discretas.
- [ ] CTA principal em verde Fortress.
- [ ] Microcopy consistente com tom calmo e institucional.
- [ ] Layout responsivo com grid claro.

---

## 7. Referências internas

- Branding: `FORTRESS_DOCS_V7/product/brand_marketing_master_guide_v_2_2.md`
- Método: `FORTRESS_DOCS_V7/method/fortress_v_7_method_guide_updated.md`
- PFS/Kernel: `FORTRESS_DOCS_V7/PFS/`
