# PRODUCT FUNCTIONAL SPECIFICATION (PFS) — FORTRESS v7
## Documento 4B — Módulo Supermarket (Versão Enterprise)
**Status:** v7.24 — Reestruturação consolidada
**Escopo:** Este documento descreve de forma completa o comportamento funcional do módulo **Supermarket**, responsável pela **entrada estruturada de dados financeiros**, **interpretação de compras**, **listas inteligentes**, **análises comportamentais** e **alimentação do Financial Brain**.

---
# 1. VISÃO DO MÓDULO SUPERMARKET
O módulo Supermarket é o **ponto central de coleta de dados reais do usuário**.

Ele permite:
- registrar compras
- escanear recibos
- interpretar itens
- gerar listas e checklists inteligentes
- atualizar estatísticas e hábitos
- alimentar projeções do mês
- gerar insights de impacto

Este módulo **não é um organizador de compras**, e sim um **interpretador de comportamento financeiro alimentar e doméstico**.

---
# 2. OBJETIVOS DO MÓDULO
1. Reduzir atrito na entrada de dados.  
2. Interpretar cada compra como um “evento de comportamento”.  
3. Classificar itens automaticamente.  
4. Aprender padrões pessoais.  
5. Conectar consumo → previsões → insights.  

---
# 3. PERSONAS APLICADAS AO SUPERMARKET
- **Usuário Rápido:** quer registrar sem detalhes.
- **Usuário Precisão:** revisa cada item.
- **Usuário Checklist:** usa listas pré-criadas.
- **Usuário Improvisado:** registra via OCR espontâneo.

---
# 4. PRINCIPAIS FUNÇÕES
1. Registro manual de compras.
2. Registro via OCR (foto do recibo).
3. Classificação automática de itens.
4. Histórico detalhado.
5. Análises por categoria.
6. Checklists / listas inteligentes.
7. Previsões alimentares e domésticas.
8. Impacto imediato no mês.

---
# 5. REGISTRO DE COMPRA (MANUAL)
## 5.1 Dados mínimos
- total
- data

## 5.2 Dados opcionais
- itens
- categorias
- estabelecimento
- notas

## 5.3 Regras de negócio
- valores sempre armazenados em centavos.
- data sempre em UTC.
- itens sem categoria recebem "uncategorized" temporário.
- compras editáveis por **24h** para correções.

---
# 6. REGISTRO DE COMPRA VIA OCR
## 6.1 Fluxo completo
1. Usuário envia foto.  
2. Sistema cria registro `ReceiptScan`.
3. Worker processa OCR (Tesseract / Vision API / outro adapter).  
4. Parser extrai itens, quantidades e valores.  
5. Classificador tenta identificar categorias.  
6. Compra é criada como "draft".
7. Usuário aprova ou ajusta.

## 6.2 Regras essenciais
- OCR nunca é definitivo sem revisão (quando confiança < limite).
- Itens com baixa confiança entram como “sugeridos”.
- Usuário pode confirmar com um toque.
- Estimativa do total deve ser verificada sempre.

## 6.3 Campos de OCR
- rawText
- parsedItems
- confidence
- timestamp

---
# 7. CLASSIFICAÇÃO DE ITENS
## 7.1 Tipos de classificação
- regra lexical (nome → categoria)
- histórico do usuário
- heurística comportamental
- ML leve (versões futuras)

## 7.2 Sinalizadores
- `isFitness`
- `isRecurring`
- `isEssential`

## 7.3 Regras
- Preferência do histórico do usuário > heurística > ML.
- Categorias personalizadas podem sobrescrever padrão.
- Todos itens têm pelo menos 1 categoria.

---
# 8. TAXONOMIA OFICIAL DE CATEGORIAS
**Categorias base:**
- Hortifruti  
- Proteínas  
- Congelados  
- Laticínios  
- Padaria  
- Lanches  
- Bebidas  
- Limpeza  
- Higiene  
- Casa  
- Pets  
- Drogaria  
- Fitness  

**Regras:**
- Todas têm `id`, `slug`, `isFitness`, `type`.
- Usuário pode criar categorias próprias.

---
# 9. LISTAS E CHECKLISTS INTELIGENTES
## 9.1 Tipos de listas
- Lista manual
- Lista inteligente (baseada no histórico)
- Lista modelo (templates)

## 9.2 Geração automática
Com base em:
- frequência histórica
- itens que estão “para acabar” (decay model)
- categorias mais consumidas

## 9.3 Regras funcionais
- Ordem por prioridade (itens essenciais primeiro)
- Marcação rápida
- Salvamento automático

---
# 10. ANÁLISES E ESTATÍSTICAS
## 10.1 Insights do Supermarket
- variação por categoria
- impacto no mês
- item com maior aumento de preço
- quantidade de compras no período
- média por ida ao mercado
- tendência semanal

## 10.2 Estrutura de análise
- histórico 30/90/∞ conforme plano
- agregações por período
- curva de sazonalidade
- gráfico de distribuição de categorias

---
# 11. PREVISÕES (FORECAST)
## 11.1 Tipos de previsão
- próxima compra
- gasto estimado do mês
- impacto de compras recentes
- itens próximos do vencimento comportamental

## 11.2 Regras
- previsões sempre probabilísticas
- intervalo de confiança exibido
- nunca prescritivo

---
# 12. IMPACTO IMEDIATO NO MÊS
Toda compra registrada recalcula:
- saldo projetado
- ritmo semanal
- impacto do dia
- desvio da média
- tendência atual

Estrutura usada pelo Financial Brain para insights.

---
# 13. LIMITES POR PLANO
## Sentinel
- histórico 30 dias
- 10 scans mensais
- listas simples
- análises básicas

## Vanguard
- histórico 90 dias
- 100 scans mensais
- listas inteligentes
- análises detalhadas

## Legacy
- histórico completo
- scans ilimitados
- inteligência completa

---
# 14. REQUISITOS FUNCIONAIS (FR)
FR1 — Registrar compra manualmente.  
FR2 — Registrar compra via OCR.  
FR3 — Classificar itens.  
FR4 — Permitir editar compra.  
FR5 — Gerar listas inteligentes.  
FR6 — Calcular impacto mensal.  
FR7 — Aplicar limites de plano.

---
# 15. REQUISITOS NÃO FUNCIONAIS (NFR)
NFR1 — OCR processado em até 8 segundos.  
NFR2 — Classificação com >85% acurácia mínima.  
NFR3 — UI de checklist deve responder em <50ms.  
NFR4 — Zero julgamento em textos.  
NFR5 — Previsões exibem confiança.

---
# 16. CRITÉRIOS DE ACEITE (AC)
AC1 — Compra via OCR deve gerar rascunho antes da aprovação.  
AC2 — Toda lista inteligente deve conter justificativa.  
AC3 — Toda categoria deve ter slug único.  
AC4 — Previsões devem mostrar intervalo.  
AC5 — Impacto mensal deve refletir imediatamente na dashboard.

---
# 17. DEPENDÊNCIAS
- Supermarket → Financial Brain (dados de compras)
- Supermarket → Kernel (relevância e comportamento)
- Lists → compras anteriores
- Forecast → histórico

---
# 18. ENCERRAMENTO
Este PFS 4B detalha integralmente o módulo Supermarket e serve como documento de referência para Produto, Engenharia, UX, Marketing e para o Cursor na geração de código e fluxo de trabalho.  
Integra-se diretamente ao **PFS 4A (Geral)** e ao **Master Context Técnico v1.x**.

