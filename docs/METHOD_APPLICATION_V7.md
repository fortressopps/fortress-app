# Aplicação do Método Fortress v7

**Fonte:** FORTRESS_DOCS_V7/method/fortress_v_7_method_guide_updated.md  
**Propósito:** Como o Method Guide é aplicado no repositório (princípios, convenção de nomes, domínios).

---

## 1. Princípios do Método (aplicados)

| Princípio | Aplicação no repositório |
|-----------|---------------------------|
| **Clareza acima de velocidade** | Tipos explícitos (TypeScript), nomes de arquivos por responsabilidade, sem `utils`/`service` genéricos. |
| **Domínios limpos** | Módulos por domínio: `kernel`, `supermarket`, `goals`, `insights`, `notifications`, `forecast`; cada um com domain/infra (e routes onde couber). |
| **Interpretação antes de visualização** | Kernel (4C) e Insights (4E) produzem interpretação; dados brutos ficam em Supermarket/DB. |
| **Suavidade** | Mensagens de produto/UX seguem tom leve (PFS 4D/4C); logs e erros técnicos são neutros. |
| **Documentação viva** | docs/ e FORTRESS_DOCS_V7 são referência; ORDEM_IMPLEMENTACAO_V7 e este doc são atualizados quando o método é aplicado. |

---

## 2. Convenção de nomes (Method §5)

**Padrão obrigatório:** `nome.restodonome.formato`

- **prefixo** = domínio (ex.: `supermarket`, `kernel`, `goals`)
- **segmento central** = responsabilidade (ex.: `commitment-projection`, `csv-currency-pagination`, `decision`)
- **extensão** = tecnologia (ex.: `.ts`, `.md`)
- Palavras internas separadas por `-`
- **Não usar** nomes genéricos: `utils.ts`, `service.ts`, `index.ts`

### 2.1 Arquivos renomeados conforme o método

| Antes | Depois | Motivo |
|-------|--------|--------|
| `goals/service/goals.service.ts` | `goals/domain/goals.commitment-projection.ts` | Responsabilidade = projeção de compromissos (metas); Method exemplo: `goals.commitment-projection.ts` |
| `supermarket/domain/supermarket.utils.ts` | `supermarket/domain/supermarket.csv-currency-pagination.ts` | Agrupa CSV, moeda e paginação; evita `utils` genérico |

### 2.2 Barrels (`index.ts`)

O Method desaconselha `index.ts` genérico. No repositório, **index.ts** é usado apenas como barrel (reexport) para resolução Node/TS (`import from "modules/kernel"`). Os arquivos **internos** dos módulos seguem `nome.responsabilidade.formato`. Opcionalmente, barrels podem ser renomeados para `kernel.entry.ts`, `supermarket.entry.ts`, etc., exigindo atualização de todos os imports; por isso mantemos `index.ts` apenas como barrel e documentamos a exceção aqui.

---

## 3. Domínios considerados (Method §4)

| Domínio | Módulo no repositório | PFS |
|---------|------------------------|-----|
| Supermarket (entrada de dados) | `backend/src/modules/supermarket` | 4B |
| Financial Brain (interpretação) | Kernel + Insights + Forecast | 4C, 4E, 4F |
| Daily Console (acompanhamento) | Frontend (Dashboard, páginas) | — |
| Goals & Commitments | `backend/src/modules/goals` | — |
| Identity & Access | Auth, middleware, rotas `/auth`, `/users/me` | — |
| Observability & Events | Logger (pino), health, futuros eventos | Observability Blueprint |

---

## 4. Regras de suavidade (Method §7)

- Comunicação ao usuário: indireta, respeitosa, sem alarmismo.
- Exemplo de tom: *"Talvez seja interessante revisar este tipo de gasto nos próximos dias."*
- Textos gerados por Insights/Notificações devem seguir PFS 4D e 4C (suavidade 1–5, zero julgamento).

---

## 5. Referências

- **Method Guide:** FORTRESS_DOCS_V7/method/fortress_v_7_method_guide_updated.md
- **Cursor oficial:** FORTRESS_DOCS_V7/method/cursor_oficial_v7_24_enterprise.md
- **Ordem de implementação:** docs/ORDEM_IMPLEMENTACAO_V7.md
