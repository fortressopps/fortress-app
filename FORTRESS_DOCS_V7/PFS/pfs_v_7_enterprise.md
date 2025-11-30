# PRODUCT FUNCTIONAL SPECIFICATION (PFS) — FORTRESS v7 ENTERPRISE EDITION
## Documento 4A — Especificação Funcional Geral (Completa)
**Status:** v7.24 — Revisão Enterprise  
**Escopo:** Este documento descreve o comportamento funcional completo da plataforma Fortress, excluindo o módulo Supermarket (PFS 4B).  
**Objetivo:** Responder de forma absoluta: **“O que o Fortress faz? Como faz? Por que faz?”**

---
# 1. VISÃO MACRO DO PRODUTO
Fortress v7 é um sistema de **interpretação financeira comportamental**, projetado para transformar dados financeiros brutos em **clareza emocional**, **previsibilidade**, **rotinas inteligentes** e **insights suaves**.

O produto é composto por quatro pilares:
1. **Financial Brain** — interpretação + padrões + previsões + insights.
2. **Daily Console** — console central do usuário (resumos + leituras + navegação).
3. **Goals & Commitments** — metas, compromissos e planejamento leve.
4. **Supermarket** — entrada prática de dados (documento separado: PFS 4B).

A plataforma não julga, não pressiona, não assume moralidade e não tenta controlar decisões. É um **sistema de leitura**, não um "coach financeiro".

---
# 2. PERSONAS OFICIAIS
## 2.1 Persona A — O Desorganizado Ansioso
- Não acompanha gastos.
- Sente medo, culpa ou ansiedade envolvendo dinheiro.
- Quer clareza sobre impacto do dia a dia.

**Objetivo:** Previsibilidade e sensação de controle.

## 2.2 Persona B — O Usuário Disciplinado
- Já possui algum controle.
- Busca previsões, métricas e melhora contínua.

**Objetivo:** Eficiência e insights de otimização.

## 2.3 Persona C — O Usuário Emocional
- Variação de comportamento financeiro por emoções.
- Gasta por impulso.

**Objetivo:** Leitura emocional e awareness comportamental.

## 2.4 Persona D — O Usuário Minimalista
- Quer ver apenas o essencial.
- Pouca interação, alta expectativa de clareza.

**Objetivo:** Resumo claro e zero ruído.

---
# 3. PRINCÍPIOS FUNCIONAIS DO FORTRESS
- **Suavidade:** jamais empurra, jamais pressiona.
- **Clareza:** linguagem direta, limpa e emocionalmente neutra.
- **Interpretação:** não só mostrar números, mas interpretar.
- **Previsibilidade:** explicar o que aconteceu, o que significa e o que pode acontecer.
- **Humanidade:** tom leve, inspirado no Duolingo + racionalidade.

---
# 4. MÓDULO FINANCIAL BRAIN
É o núcleo cognitivo da plataforma.

## 4.1 Responsabilidades
- Identificar padrões.
- Detectar recorrências.
- Avaliar sazonalidade.
- Calcular ritmo financeiro.
- Gerar previsões.
- Gerar insights interpretativos.

## 4.2 Tipos de insights
### **Insight Tipo A — Leitura Pura**
Exemplo: “Seu gasto médio diário subiu 12% nos últimos 7 dias.”

### **Insight Tipo B — Padrão Detectado**
Exemplo: “Sempre que entra semana do pagamento, seu gasto sobe entre 9% e 15%.”

### **Insight Tipo C — Tendência Leve**
Exemplo: “Seu ritmo atual indica que o mês tende a fechar um pouco acima da média.”

### **Insight Tipo D — Impacto Projetado**
Exemplo: “Suas compras dos últimos 3 dias adicionaram R$ 142 ao fechamento estimado do mês.”

### **Insight Tipo E — Explicabilidade**
Cada insight contém:
- DADOS: o que foi usado.
- INTERPRETAÇÃO: o que significa.
- TENDÊNCIA: para onde aponta.

## 4.3 Estrutura funcional mínima de um insight
- id
- tipo
- level (suavidade)
- dados usados
- texto final
- tendência (subindo, estável, caindo)
- confiança
- origem (padrão detectado / impacto / projeção)

## 4.4 Regras funcionais
- Nunca julgar comportamento.
- Nunca impor.
- Mostrar caminho, não ordem.
- Privacidade de dados absoluta.

---
# 5. DAILY CONSOLE (Console Diário)
O local onde o usuário **lê sua vida financeira**.

## 5.1 Conteúdos
- Resumo do dia.
- Insights relevantes.
- Projeções imediatas.
- Anomalias comportamentais.
- Gasto médio diário.
- Cards de tendência.

## 5.2 Fluxos principais
### Fluxo 1 — Começo do dia
- Usuário entra.
- Recebe “Leitura do dia”.
- Recebe 1 insight relevante.
- Status do mês.

### Fluxo 2 — Após nova compra
- Supermarket registra compra.
- Financial Brain recalcula.
- Insight de impacto é gerado.
- Notificação opcional.

### Fluxo 3 — Tendência da semana
- Console mostra variações semanais.

---
# 6. NOTIFICAÇÕES
## 6.1 Linguagem
- leve
- amigável
- explicativa
- zero julgamento
- inspirada no Duolingo, porém séria

## 6.2 Tipos de disparo
- padrão detectado
- compra registrada
- tendência semanal
- risco de estouro mensal
- meta fora do ritmo

## 6.3 Regras de cooldown
- Máx. 2 por dia.
- Nunca enviar insights redundantes.
- Prioridade automática.

## 6.4 Estrutura de notificação
- título
- texto
- emoção leve
- ação opcional
- referência de dados

---
# 7. GOALS & COMMITMENTS
## 7.1 Funções
- criar metas
- acompanhar progresso
- avaliar impacto
- trajetórias projetadas
- compromissos mensais

## 7.2 Tipos de meta
- valor único
- intervalo
- recorrente

## 7.3 Estrutura funcional
Cada meta contém:
- nome
- valor
- período
- indicador
- progresso
- impacto atual no mês

## 7.4 Recomendações suaves
Sempre opcionais, nunca imperativas.

Exemplo:
> “Seu ritmo está um pouco acima. Talvez ajustar duas pequenas despesas já normalize o caminho.”

---
# 8. PERSONALIZAÇÃO
## Preferências
- frequência de insights
- tipos de alertas
- categorias favoritas
- sensibilidade comportamental

---
# 9. LIMITES POR PLANO (SUBSCRIPTION TIERS)
## 9.1 Sentinel
- histórico 30 dias
- insights básicos
- notificações limitadas
- projeções simples

## 9.2 Vanguard
- histórico 90 dias
- insights intermediários
- notificações mais frequentes
- projeções detalhadas
- metas avançadas

## 9.3 Legacy
- histórico completo
- insights completos
- notificações ilimitadas
- previsões completas

---
# 10. REQUISITOS FUNCIONAIS (FR)
### FR1 — Sistema deve interpretar dados automaticamente.
### FR2 — Usuário deve receber insights diários.
### FR3 — Sistema deve recalcular projeções após nova compra.
### FR4 — Deve haver resumo diário central.
### FR5 — Deve gerar tendência semanal.
### FR6 — Deve permitir criação e acompanhamento de metas.
### FR7 — Deve aplicar limite de plano.

---
# 11. REQUISITOS NÃO FUNCIONAIS (NFR)
### NFR1 — Resposta < 300ms.
### NFR2 — Zero julgamento textual.
### NFR3 — Privacidade absoluta.
### NFR4 — Previsibilidade das regras.
### NFR5 — Consistência do tom de voz.

---
# 12. CRITÉRIOS DE ACEITE (AC)
### AC1 — Todo insight deve conter dados + interpretação + tendência.
### AC2 — Nenhum insight pode conter tom de pressão.
### AC3 — Notificações devem respeitar cooldown.
### AC4 — Resumo diário deve ter no mínimo 3 elementos.
### AC5 — Projeções devem mostrar intervalo + confiança.

---
# 13. KPIs INTERNOS
- precisão interpretativa
- taxa de utilidade dos insights
- taxa de engajamento do Daily Console
- tempo médio por sessão
- variação positiva do comportamento financeiro

---
# 14. DEPENDÊNCIAS ENTRE MÓDULOS
- Financial Brain → abastece Daily Console.
- Supermarket → alimenta Brain.
- Kernel → gerencia relevância.
- Goals → consome projeções.
- Notificações dependem do Kernel + Brain.

---
# 15. ENCERRAMENTO
Este PFS 4A define toda a estrutura funcional geral da plataforma Fortress v7.  
Para o módulo de entrada de dados (Supermarket), consulte o documento **PFS 4B — Supermarket**.

