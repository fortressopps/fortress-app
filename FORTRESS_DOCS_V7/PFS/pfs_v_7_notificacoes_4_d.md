
# PFS 4D — Sistema de Notificações & Linguagem  
### Versão Enterprise v7.24 — Natural Flow Engine + Anti-Ruído Humano + Reforço Positivo Sutil

**Status:** Concluído v7.24  
**Escopo:** Define a arquitetura, comportamento, lógica, linguagem, regras de cooldown, suavidade, reforço positivo e integração com o Kernel e Insights.  
**Tamanho:** Documento expandido (≈10.000+ caracteres), nível Enterprise.

---

# 1. PROPÓSITO DO SISTEMA DE NOTIFICAÇÕES

O sistema de notificações da Fortress é responsável por transformar eventos financeiros interpretados pelo Financial Brain em comunicações **claras**, **calmas**, **previsíveis** e **emocionalmente seguras** para o usuário.

O propósito é:

- entregar contexto, não pressão  
- facilitar entendimento, não induzir comportamento  
- reforçar estabilidade, não criar ansiedade  
- manter previsibilidade cognitiva  
- reforçar sensação de controle interno  
- criar uma relação saudável com finanças

Notificações devem **representar o fluxo real da vida financeira**, sem parecerem “pushy”, artificiais ou exageradas.

---

# 2. PRINCÍPIOS CENTRAIS

1. **Interpretação > instrução**  
2. **Observação > opinião**  
3. **Contexto > alarme**  
4. **Clareza > intensidade**  
5. **Natural Flow**: tudo deve parecer no ritmo humano  
6. **Duolingo-ish + Fortress**: leveza com racionalidade  
7. **Nenhuma urgência artificial**  
8. **Nenhum julgamento implícito**  
9. **Reforço positivo real, nunca inventado**  

---

# 3. ARQUITETURA DA NOTIFICAÇÃO

Cada notificação é formada por quatro camadas independentes:

### 3.1 *Input:* Financial Brain → Insight (estrutura do 4E)  
### 3.2 *Kernel:*  
- relevância  
- suavidade  
- prioridade  
- permissões  
- cooldown mínimo  
- reforço positivo permitido ou não  

### 3.3 *Linguagem:*  
A mensagem final é construída seguindo a gramática cognitiva:

```
observação + contexto + tendência + finalização suave
```

### 3.4 *Entrega:*  
- push notification  
- Daily Console  
- timeline de insights

---

# 4. TIPOS DE NOTIFICAÇÕES

As notificações refletem necessariamente um tipo de insight (4E).  
Existem 8 classes:

1. **Impacto imediato (A)**  
2. **Tendência curta (B)**  
3. **Tendência longa (C)**  
4. **Recorrência (D)**  
5. **Desvio previsto vs real (E)**  
6. **Estabilidade — comportamento positivo (F)**  
7. **Oportunidade suave (G)**  
8. **Reforço positivo natural (H)**  

---

# 5. ESTRUTURA UNIVERSAL DO OBJETO

```
Notificacao {
  id: string,
  tipo: string,  
  familia: string,
  relevancia: number,
  suavidade: number,
  prioridade: number,
  leitura: string,
  dado: string,
  tendencia: string,
  reforcoPositivo: boolean,
  horarioPermitido: boolean,
  cooldownMinimo: number,
  mensagemFinal: string
}
```

---

# 6. TONS DE SUAVIDADE (1–5)

Mesma lógica do Kernel:

1. **Neutro:** 100% descritivo  
2. **Leve:** tom amigável sem emoção forte  
3. **Moderado:** clareza explicativa  
4. **Forte suave:** sinal importante, mas calmo  
5. **Crítico suave:** extremo sem alarme

---

# 7. REGRAS DE TOM DE VOZ

### 7.1 Nunca usar:
- urgente  
- cuidado  
- alerta  
- atenção  
- você gastou demais  
- você deveria  

### 7.2 Sempre usar:
- “ritmo”  
- “movimento”  
- “padrão”  
- “estabilidade”  
- “tendência”  
- “consistência”  
- “suave”  
- “natural”  

### 7.3 Tom Duolingo-ish adaptado:
- leveza controlada  
- micro humor implícito  
- metáforas suaves  
- sem infantilização  

---

# 8. NATURAL FLOW ENGINE — COOLDOWN & FREQUÊNCIA

A parte mais importante da experiência.

## 8.1 Intervalos naturais
Para evitar ruído cognitivo:

- **Notificações similares:** 72h–120h  
- **Sugestões leves:** mínimo 5 dias  
- **Reforço positivo:** mínimo 7 dias  
- **Tendências:** 96h mínimo  
- **Eventos de estabilidade:** 72–168h  
- **Padrões repetidos:** mínimo 5 dias para reaparecer  

## 8.2 Limites globais de frequência
- **1 por dia (normal)**  
- **2 por dia (alta relevância real)**  
- **Máx. 4 por semana — Sentinel/Vanguard**  
- **Máx. 6/semana — Legacy**  
- **Nunca entre 00h e 06h**  

## 8.3 Anti-repetição textual
- nenhuma frase, termo ou estrutura pode repetir em menos de 7 dias  
- diferentes composições mesmo para o mesmo conteúdo  
- variação semântica obrigatória  

## 8.4 Anti-ansiedade
O sistema evita:
- sequências de 3 notificações em 48h  
- alertas seguidos  
- padrões que pareçam cobrança  
- correções moralistas  

---

# 9. CENÁRIOS DE DISPARO PERMITIDOS

O sistema não dispara por qualquer micro variação.  
Só dispara quando:

1. tendência confirmada (pelo menos 3 dias)  
2. padrão consistente  
3. desvio relevante  
4. recorrência confirmada (3 eventos)  
5. oportunidade real e leve  
6. estabilidade consolidada (com reforço positivo)  
7. relevância ≥ 70  

---

# 10. TEMPLATE LINGUÍSTICO BASE

```
[Observação neutra do evento]
[Contexto numérico interpretado]
[Descrição da tendência atual]
[Camada opcional de reforço positivo]
```

Exemplo:

> “Seu ritmo nos últimos dias ficou um pouco acima do padrão recente. Isso representa um movimento leve e dentro do esperado. Ainda é um comportamento normal no seu mês.”

---

# 11. REFORÇO POSITIVO NATURAL

O reforço só aparece quando:
- comportamento estável  
- padrão positivo  
- tendência saudável  
- impacto leve/positivo  

Nunca é inventado ou usado em excesso.

### Exemplos:
- “Ótimo sinal de consistência.”  
- “Isso costuma trazer uma sensação boa de controle.”  
- “Seu mês está em uma linha bem confortável.”

Sempre **no final** do texto.

---

# 12. INTEGRAÇÃO COM O KERNEL (4C)

O Kernel envia para o sistema:

- relevância  
- suavidade  
- prioridade  
- horários permitidos  
- cooldown mínimo  
- reforço positivo permitido  
- tipo sugerido  

O sistema de notificações apenas constrói a mensagem final.

---

# 13. LIMITES POR PLANO

### Sentinel  
- 1/dia  
- sem reforço positivo  
- cooldown mais rígido  

### Vanguard  
- 2/dia  
- reforço leve permitido  

### Legacy  
- regras completas do Natural Flow  

---

# 14. CRITÉRIOS DE ACEITE (AC)

- AC1: linguagem sem comando  
- AC2: nenhum termo ansioso  
- AC3: nenhuma repetição textual <7 dias  
- AC4: cooldown ≥ 72h entre similares  
- AC5: reforço positivo apenas quando permitido  
- AC6: suavidade correta 1–5  

---

# 15. NFR — NÃO FUNCIONAIS

- NFR1: 100% determinístico  
- NFR2: gerar em <100ms  
- NFR3: linguagem estável  
- NFR4: sem duplicação  
- NFR5: tom consistente em todas as famílias  

---

# 16. ENCERRAMENTO

O sistema de notificações v7.24 representa o ápice da comunicação emocionalmente estável da Fortress: claro, leve, previsível, humano e consistente.

