# PRODUCT FUNCTIONAL SPECIFICATION (PFS) — FORTRESS v7
## Documento 4E — Sistema de Insights & Interpretação (Versão Enterprise)
**Status:** v7.24 — Estrutura Cognitiva Universal Consolidada  
**Escopo:** Este documento define como a plataforma Fortress **gera, classifica, interpreta e estrutura todos os insights**. Inclui a gramática cognitiva, thresholds, tipos, hierarquia, arquitetura, variáveis e estrutura final entregue ao Kernel e ao Financial Brain.

---
# 1. PROPÓSITO DO SISTEMA DE INSIGHTS
Transformar **eventos financeiros brutos** em **interpretações legíveis**, seguindo as regras de:
- neutralidade emocional
- clareza cognitiva
- previsibilidade
- suavidade
- zero julgamento
- zero comando

O insight é o núcleo interpretativo da experiência Fortress.

---
# 2. PRINCÍPIOS CENTRAIS
1. **Interpretar, nunca opinar**
2. **Explicar, nunca instruir**
3. **Contextualizar, nunca alarmar**
4. **Simplificar, nunca ocultar**
5. **Descrever padrão, nunca atribuir culpa**
6. **Neutralidade + leveza**

---
# 3. ARQUITETURA DO INSIGHT
O módulo de insights recebe dados diretamente de:
- Supermarket
- Projeções
- Histórico
- Kernel Comportamental

E gera um objeto interpretativo padronizado.

## 3.1 Estrutura base
```
Insight {
  tipo: string,
  nivel: 1–5,
  relevancia: 0–100,
  categoria: string,
  interpretacao: string,
  dado: string,
  tendencia: string,
  impacto: number,
  suavidade: 1–5
}
```

---
# 4. CLASSIFICAÇÃO UNIVERSAL DE INSIGHTS
Existem **7 famílias principais**:

## 4.1 Família A — Impacto imediato
Mudanças detectadas após compra.

## 4.2 Família B — Tendência curta
Mudanças nos últimos 3–5 dias.

## 4.3 Família C — Tendência longa
Padrões consistentes em 10 dias ou mais.

## 4.4 Família D — Recorrência
Eventos repetidos semanalmente.

## 4.5 Família E — Desvios
Diferença entre previsto e realizado.

## 4.6 Família F — Estabilidade
Confirmação de tranquilidade.

## 4.7 Família G — Oportunidade suave
Leituras que sugerem micro ajustes opcionais.

---
# 5. TIPOS DE INSIGHTS DENTRO DAS FAMÍLIAS
Cada família possui subtipos.

## A — Impacto
- A1: Ajuste leve
- A2: Ajuste significativo
- A3: Ajuste cumulativo

## B — Tendência curta
- B1: Subida leve
- B2: Subida moderada
- B3: Subida forte
- B4: Queda leve

## C — Tendência longa
- C1: Movimento consistente
- C2: Movimento consolidado

## D — Recorrência
- D1: Evento semanal
- D2: Padrão bissemanal
- D3: Padrão consolidado

## E — Desvios
- E1: Desvio pequeno
- E2: Desvio moderado
- E3: Desvio forte

## F — Estabilidade
- F1: Estabilidade curta
- F2: Estabilidade longa

## G — Oportunidades
- G1: Observação leve
- G2: Micro sugestão opcional

---
# 6. THRESHOLDS DE DETECÇÃO
A interpretação é baseada em thresholds matemáticos:

### 6.1 Impacto
- leve: 1–3% do previsto mensal
- moderado: 3–7%
- forte: >7%

### 6.2 Tendência
- curta: média móvel de 3 dias
- longa: média móvel de 10 dias

### 6.3 Recorrência
- confirmado após 2 repetições
- consolidado após 4 repetições

### 6.4 Desvio previsto vs. realizado
- leve: <5%
- moderado: 5–12%
- forte: >12%

---
# 7. GRAMÁTICA COGNITIVA DO INSIGHT
Cada insight deve seguir a fórmula:

## 7.1 Fórmula universal
```
interpretação = observacao + contexto + movimento
```

### Observação
Descreve o evento de forma neutra.
Ex: "Seu ritmo subiu um pouco nos últimos 3 dias."

### Contexto
Explica a magnitude.
Ex: "Isso representa um aumento leve no padrão recente."

### Movimento
Explica a tendência.
Ex: "Ainda está dentro de um comportamento normal."

---
# 8. TONS DE INTERPRETAÇÃO (SUAVIDADE)
Mesmo padrão do Kernel.

1. Observação neutra
2. Leitura leve
3. Movimento moderado
4. Movimento forte
5. Contexto crítico sem urgência

---
# 9. COMO UM INSIGHT É FORMADO
Sequência completa:
1. Evento chega ao Financial Brain
2. Variáveis são calculadas
3. Família do insight é identificada
4. Subtipo é detectado
5. Relevância é calculada
6. Kernel aplica suavidade + prioridade
7. Formato universal é aplicado
8. Insight é entregue ao Daily Console (ou notificação)

---
# 10. REGRAS DE RELEVÂNCIA
Mesmo padrão do Kernel.

### 0–20 → descartado
### 21–40 → apenas Daily Console
### 41–70 → insight prioritário
### 71–100 → insight + possível notificação

---
# 11. FILTROS ANTI-RUÍDO
O sistema deve evitar repetição, excesso de interpretações e padrões que façam a plataforma parecer ansiosa, insistente ou artificial.

## 11.1 Regras Atualizadas de Anti-Ruído (Versão Natural v7.24)
### 1. **Intervalo mínimo entre insights similares: 72h–120h**
- 72h = para padrões muito relevantes
- 120h = para padrões leves ou rotineiros

O Kernel decide o intervalo dentro desse range com base em:
- relevância
- estabilidade
- sensibilidade do usuário
- criticidade da tendência

### 2. **Recorrência comportamental deve ser confirmada 3 vezes antes de virar insight**
Reduz falsos positivos.

### 3. **Tendências pequenas só devem aparecer após 4 dias de consistência**
Evita parecer hiperativo.

### 4. **Agrupamento obrigatório de micro variações**
Variações menores que ±3% devem ser consolidadas em um único insight.

### 5. **Insights do tipo “bom desempenho” só podem aparecer 1 vez por semana**
Evita sensação de gamificação artificial.

### 6. **Nenhuma repetição textual em 7 dias**
Mesmo se o padrão voltar, o texto precisa ser reescrito com variação natural.

---
# 12. EXEMPLOS DE INSIGHTS COMPLETOS. EXEMPLOS DE INSIGHTS COMPLETOS
### 12.1 Tendência curta
> "Seu ritmo subiu um pouco nos últimos 3 dias. Isso representa um aumento leve no padrão recente. Ainda dentro de um movimento normal."

### 12.2 Recorrência
> "Suas idas ao mercado mostraram um padrão semanal novamente. Isso indica consistência na rotina."

### 12.3 Desvio
> "Houve um desvio leve entre o previsto e o realizado hoje. Nada fora do comportamento esperado."

### 12.4 Estabilidade
> "Seu mês segue estável. Esse padrão tem sido consistente nos últimos dias."

---
# 13. ENTREGÁVEL FINAL (OBJETO COMPLETO)
```
{
  tipo: "C1",
  familia: "Tendência longa",
  nivel: 3,
  relevancia: 62,
  categoria: "Ritmo",
  interpretacao: "Seu ritmo dos últimos 10 dias mostra um movimento consistente...",
  dado: "média móvel +3%",
  tendencia: "subida leve",
  impacto: 3.2,
  suavidade: 3
}
```

---
# 14. REQUISITOS FUNCIONAIS (FR)
FR1 — Identificar famílias e subtipos.  
FR2 — Calcular thresholds.  
FR3 — Aplicar gramática universal.  
FR4 — Integrar suavidade do Kernel.  
FR5 — Gerar insight determinístico.

---
# 15. REQUISITOS NÃO FUNCIONAIS (NFR)
NFR1 — Consistência cognitiva obrigatória.  
NFR2 — Insight gerado em <120ms.  
NFR3 — Nenhum julgamento ou comando.  
NFR4 — Zero ambiguidade.  
NFR5 — Padrão replicável.

---
# 16. CRITÉRIOS DE ACEITE (AC)
AC1 — Todo insight segue fórmula observação + contexto + movimento.  
AC2 — Deve pertencer a uma das 7 famílias.  
AC3 — Deve ter relevância numérica.  
AC4 — Suavidade entre 1–5.  
AC5 — Sem repetição em <48h.

---
# 17. DEPENDÊNCIAS
- Kernel Comportamental
- Supermarket
- Projeções & Forecast
- Daily Console
- Sistema de Notificações

---
# 17\.1 Reforço Positivo em Bons Momentos
Quando o insight indica estabilidade, bom ritmo, consistência ou comportamento positivo, o texto final entregue ao usuário **deve incluir um reforço emocional sutil**, que gere leve dopamina/serotonina sem apelos comportamentais ou manipulação.

**Diretrizes de reforço positivo:**
- sempre discreto
- sempre factual
- sempre baseado em comportamento real
- nunca exagerado
- nunca manipulativo
- sem linguagem de mérito moral

**Exemplos:**
- "Seu ritmo está estável — ótimo sinal de consistência."
- "Seu mês vem seguindo um padrão bem confortável."
- "Esse tipo de estabilidade costuma trazer uma sensação boa de controle."
- "Esse movimento é bem positivo dentro do seu padrão."

O reforço positivo só aparece quando:
- a tendência é boa
- o impacto é saudável
- o comportamento está previsível

Só é usado **no final da mensagem**, como uma camada suave.

---
# 18. ENCERRAMENTO
O sistema de insights da Fortress é totalmente determinístico, replicável e seguro emocionalmente. Ele representa a camada cognitiva central que transforma dados em compreensão clara, suave e previsível para o usuário.

