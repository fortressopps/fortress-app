# FORTRESS v7 — METHOD GUIDE (Atualizado)
**Guia oficial do método Fortress v7**, incluindo agora a **convenção de nome de arquivos** adotada em toda a plataforma.

---

# 1. Propósito do Método
O Método Fortress v7 organiza como times e IAs devem pensar, estruturar e evoluir o ecossistema Fortress. Ele define:
- princípios operacionais,
- regras de comunicação,
- artefatos essenciais,
- limites de domínio,
- convenções obrigatórias (incluindo nomes de arquivos),
- e diretrizes de atuação.

---

# 2. Princípios do Método
1. **Clareza acima de velocidade.** Nenhum artefato deve criar ambiguidade.
2. **Domínios limpos.** Cada área opera com fronteiras claras.
3. **Interpretação antes de visualização.** Dados não são a entrega — interpretação é.
4. **Suavidade.** Comunicação sempre leve, indireta e respeitosa.
5. **Documentação viva.** Todos os documentos são atualizados regularmente.

---

# 3. Estrutura Geral do Método
O método se divide em quatro camadas:
- **Estratégica:** por que o produto existe.
- **Arquitetural:** como ele é organizado.
- **Operacional:** como times e IAs trabalham.
- **Normativa:** regras imutáveis (nomenclatura, limites, qualidade).

---

# 4. Domínios Considerados no Método
- Supermarket (entrada de dados)
- Financial Brain (interpretação)
- Daily Console (acompanhamento do usuário)
- Goals & Commitments (planejamento suave)
- Identity & Access (suporte)
- Observability & Events (fundação)

---

# 5. Convenção de Nomes do Método v7
**Padrão obrigatório:** `nome.restodonome.formato`

## 5.1 Regras
1. **prefixo = domínio** (ex: `supermarket`, `financial-brain`)
2. **segmento central = responsabilidade** (ex: `ocr-processor`, `insight-engine`)
3. **extensão = tecnologia** (ex: `.ts`, `.md`)
4. Palavras internas sempre separadas por `-`
5. Nunca usar nomes genéricos como:
   - `utils.ts`
   - `service.ts`
   - `index.ts`

## 5.2 Exemplos oficiais
```
supermarket.ocr-processor.ts
supermarket.receipt-mapper.ts
financial-brain.insight-engine.ts
daily-console.notification-adapter.ts
goals.commitment-projection.ts
schema.prisma.ts
```

---

# 6. Artefatos Essenciais do Método
1. **Master Context** (Visão Geral)
2. **Method Guide** (este documento)
3. **Master Context Técnico**
4. **PFS — Product Functional Specification**
5. **Glossário e Data Dictionary**
6. **Event Catalog**
7. **LLM Context Pack**
8. **Sensitive Content & Tone Styleguide**

Todos devem seguir o padrão de nome do item 5.

---

# 7. Regras de Suavidade
Toda comunicação:
- evita rótulos emocionais,
- evita alarmismo,
- é indireta e respeitosa,
- sugere em vez de impor,
- e mantém a estética "japonesa" de modéstia e suavidade.

Exemplo:
> "Talvez seja interessante revisar este tipo de gasto nos próximos dias."

---

# 8. Governança do Método
- Atualizações são versionadas (ex: v7.1, v7.2...).
- Mudanças em domínios exigem revisão técnica e de produto.
- IA só opera com contexto correto (LLM Context Pack).
- Arquivos seguem obrigatoriamente a convenção de nomes.

---

# 9. Encerramento
Este documento define o funcionamento do Método Fortress v7 e agora inclui a **Convenção Oficial de Nomes**, essencial para consistência entre equipes humanas e modelos de IA.

Ele deve ser revisitado e mantido em sincronia com o Master Técnico e com o catálogo de eventos.