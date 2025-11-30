# MASTER CONTEXT TÉCNICO — FORTRESS v7 (Enterprise Edition)
**Documento 3 — Versão Corporativa Profissional**  
**Propósito:** estabelecer uma visão técnica clara, completa e robusta da plataforma Fortress v7, adequada para equipes de engenharia, produto, arquitetura corporativa e uso por modelos de IA.

---

# 1. VISÃO GERAL
O Master Context Técnico v7 define a arquitetura, os domínios, as responsabilidades, os padrões técnicos e as diretrizes estruturais que governam todo o ecossistema Fortress. Este documento é a referência principal para alinhamento técnico e tomada de decisão.

A plataforma Fortress é projetada como um **sistema financeiro interpretativo**, modular e seguro, capaz de:
- Receber dados financeiros brutos (especialmente documentos de compras e recibos).
- Estruturar, classificar e transformar esses dados em entidades de domínio.
- Interpretar padrões, tendências e riscos de forma suave.
- Apresentar insights por meio de interfaces claras e notificações humanizadas.

---

# 2. PRINCÍPIOS TÉCNICOS FUNDAMENTAIS
1. **Arquitetura Modular (DDD):** o sistema é organizado em domínios verticais com fronteiras claras.
2. **Interpretação como núcleo:** a inteligência está concentrada no módulo Financial Brain.
3. **Suavidade operacional:** nenhuma camada pode gerar comunicação agressiva ou alarmista.
4. **Segurança invisível:** proteção forte sem fricção perceptível.
5. **Evolução contínua:** decisões arquiteturais seguem processo claro e versionado.
6. **IA como parceira:** modelos de IA são integrados como assistentes estruturados, nunca como caixas-pretas.

---

# 3. DOMÍNIOS PRINCIPAIS
A arquitetura v7 contempla quatro domínios principais e dois domínios auxiliares.

## 3.1 Supermarket (Entrada de Dados)
### Responsabilidade Central
Transformar entradas brutas (recibos, documentos, fotos, listas) em **dados estruturados, categorizados e confiáveis**.

### Principais funções
- Upload de arquivos.
- OCR e pré-processamento.
- Parsing e extração de itens.
- Classificação de categorias.
- Sinalização de incerteza.
- Emissão de eventos estruturados.

### Saídas
- `DocumentoEstruturado`
- `CompraRegistrada`
- `ItensClassificados`

---

## 3.2 Financial Brain (Interpretação & IA)
### Responsabilidade Central
Interpretar dados, identificar padrões e produzir insights previsíveis, explicáveis e suaves.

### Principais funções
- Projeções financeiras.
- Identificação de padrões de consumo.
- Detecção de oportunidades e riscos leves.
- Geração de insights interpretativos.
- Aplicação das regras de suavidade.

### Saídas
- `InsightDiario`
- `ProjecaoMensal`
- `SinalAntecipado`

---

## 3.3 Daily Console (Interface e Consumo)
### Responsabilidade Central
Apresentar ao usuário uma visão clara, elegante e tranquila do seu dia financeiro.

### Principais funções
- Dashboards.
- Notificações leves.
- Resumo diário.
- Leitura simplificada de financeiro.

### Saídas
- Ações do usuário.
- Preferências.

---

## 3.4 Goals & Commitments (Planejamento Suave)
### Responsabilidade Central
Facilitar a criação de metas sem pressão.

### Principais funções
- Registro de metas.
- Monitoramento de trajetória.
- Projeções de atingimento.
- Recomendações suaves.

---

# 4. DOMÍNIOS AUXILIARES

## 4.1 Identity & Access
- Autenticação segura.
- Controle de permissões.
- Sessões e tokens.

## 4.2 Observability & Events
- Registro estruturado de eventos.
- Métricas operacionais.
- Logs com correlação.

---

# 5. PADRÕES DE ARQUITETURA

## 5.0 Convenção de Nomes (Padrão Fortress v7)
Todos os arquivos devem seguir o padrão **nome.restodonome.extensão**, garantindo rastreabilidade clara do domínio e propósito. Exemplos:
- `supermarket.receipt-processor.ts`
- `financial-brain.insight-service.ts`
- `goals.projection-engine.ts`
- `schema.prisma.ts` (quando o schema for exposto como módulo TS auxiliar)
- `daily-console.notification-adapter.ts`

### Regras:
1. **prefixo** = domínio
2. **segmento central** = função/responsabilidade
3. **extensão** = linguagem/tecnologia
4. Use `-` para separar palavras internas
5. Não usar nomes genéricos (ex: `utils.ts`, `service.ts`)

---

## 5.1 Organização Interna
Cada domínio é composto por quatro camadas textuais:
- **Domain** — entidades, regras, invariantes.
- **Application** — casos de uso e serviços.
- **Adapters** — interfaces com tecnologias externas.
- **Interfaces** — endpoints e contratos.

## 5.2 Comunicação
- Preferência por eventos assíncronos.
- Endpoints REST/GraphQL para interações diretas.
- Eventos padronizados seguindo `{Domínio}{Ação}`.

## 5.3 Padrões de Entidades
- Datas sempre em ISO UTC.
- Valores financeiros sempre em centavos.
- Categorias mapeadas para uma taxonomia oficial.

---

# 6. EVENTOS PRINCIPAIS DO SISTEMA
Os eventos são estruturados para permitir rastreabilidade.

### Supermarket
- `DocumentoProcessado`
- `ItensExtraidos`
- `CompraRegistrada`

### Financial Brain
- `InsightGerado`
- `TendenciaDetectada`
- `ProjecaoCriada`

### Goals & Commitments
- `MetaCriada`
- `MetaAjustada`
- `MetaConcluida`

### Daily Console
- `NotificacaoEmitida`
- `PreferenciaAtualizada`

---

# 7. RESPONSABILIDADES DE CADA MÓDULO (DETALHADAS)

## 7.1 Supermarket
- Processar documentos.
- Executar OCR com fallback.
- Estruturar compras e itens.
- Validar dados críticos.
- Publicar eventos.
- Não interpretar comportamento.

## 7.2 Financial Brain
- Utilizar modelos heurísticos e ML leves.
- Calcular projeções com base em séries.
- Identificar tendências por categorias.
- Formular insights baseados em explicabilidade.
- Aplicar suavidade textual.

## 7.3 Daily Console
- Exibir informações.
- Priorizar o que é relevante.
- Minimizar ruído.
- Adaptar-se a preferências.

## 7.4 Goals & Commitments
- Registrar metas.
- Lidar com compromissos.
- Avaliar trajetória.
- Enviar eventos antecipados.

---

# 8. MODELOS DE DADOS (CONCEITUAIS)
O modelo não inclui código nem schema — apenas conceitos.

### Entidades Principais
- **Usuário** — perfil, preferências, limites.
- **Compra** — data, valor, itens.
- **Item** — nome, categoria, preço.
- **Categoria** — tipo e finalidade.
- **Insight** — mensagem interpretativa.
- **Meta** — objetivo definido pelo usuário.
- **Evento** — ação significativa no sistema.

---

# 9. REGRAS TRANSVERSAIS

## 9.1 Suavidade
Qualquer texto exibido ao usuário deve:
- evitar imposição,
- evitar ansiedade,
- evitar rótulos emocionais,
- sugerir sem pressionar.

## 9.2 Segurança
- Criptografia de dados sensíveis.
- Tokens rotacionados.
- Política de mínimos privilégios.

## 9.3 Privacidade
- Minimização de dados.
- Logs sem PII.
- Processamento restrito.

## 9.4 Observabilidade
- Logs estruturados.
- Métricas por domínio.
- Eventos rastreáveis.

---

# 10. DECISÕES ARQUITETURAIS CRÍTICAS (ENTERPRISE)
- Modularidade é obrigatória.
- Eventos nunca carregam dados sensíveis desnecessários.
- Interpretação deve ser explicável.
- Nomes seguem padrão global.
- Domínios não podem se misturar.
- Interfaces seguem contratos versionados.

---

# 11. LIMITES E RESPONSABILIDADES
Cada domínio atua dentro de limites estritos.

### O que o sistema NÃO faz
- Não julga comportamento.
- Não pressiona metas.
- Não faz recomendações financeiras.
- Não cria alarmes agressivos.
- Não valida estilo de vida do usuário.

---

# 12. ENCERRAMENTO
Este documento consolida a visão técnica enterprise da arquitetura Fortress v7. Ele deve orientar:
- decisões técnicas,
- evolução de módulos,
- integração de IA,
- revisões de produto,
- e governança de qualidade.

É um documento vivo e deve ser atualizado sempre que domínios, eventos ou responsabilidades mudarem.

