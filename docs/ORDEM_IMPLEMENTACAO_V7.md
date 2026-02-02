# Ordem Oficial de Implementação — Fortress v7.24

**Fonte:** FORTRESS_DOCS_V7 (Master Index v7, README, Seção 18.6, 19.3, 9.2)  
**Propósito:** Única fonte de verdade para a ordem em que documentação deve ser lida e funcionalidades implementadas.

---

## 1. Ordem canônica de leitura (documentação)

Para entender o ecossistema antes de implementar, seguir **exatamente** esta ordem:

| # | Documento | Localização |
|---|-----------|-------------|
| 1 | Method Guide v7 | FORTRESS_DOCS_V7/method/fortress_v_7_method_guide_updated.md |
| 2 | PFS Geral | FORTRESS_DOCS_V7/PFS/pfs_geral_v_7.md |
| 3 | Kernel Comportamental (4C) | FORTRESS_DOCS_V7/PFS/pfs_v_7_kernel_comportamental_4_c.md |
| 4 | Insights (4E) | FORTRESS_DOCS_V7/PFS/pfs_v_7_insights_4_e.md |
| 5 | PFS Enterprise | FORTRESS_DOCS_V7/PFS/pfs_v_7_enterprise.md |
| 6 | Architecture Blueprint | FORTRESS_DOCS_V7/architecture/architecture_blueprint_v_7.md |
| 7 | Data Model | FORTRESS_DOCS_V7/architecture/data_model_specification_v_7.md |
| 8 | Event Catalog | FORTRESS_DOCS_V7/architecture/event_catalog_v_7.md |
| 9 | Observability Blueprint | FORTRESS_DOCS_V7/architecture/observality_blueprint_v_7.md |
| 10 | DB Spec | FORTRESS_DOCS_V7/architecture/db_spec_v_7.md |
| 11 | API Contract | FORTRESS_DOCS_V7/api/API_contract_guide_v_7.md |
| 12 | Security & Privacy | FORTRESS_DOCS_V7/security/security_privacyframework_v_7.md |
| 13 | Runbooks | FORTRESS_DOCS_V7/runbooks/ |
| 14 | Ops Manual | FORTRESS_DOCS_V7/ops/ops_manual_v_7.md |
| 15 | Brand & Marketing | FORTRESS_DOCS_V7/product/brand_marketing_master_guide_v_2_2.md |
| 16 | Master Context Enterprise | FORTRESS_DOCS_V7/product/master_context_tecnico_v_7_enterprise.md |
| 17 | Master Index | FORTRESS_DOCS_V7/master_index_v_7.md |

---

## 2. Ordem de implementação dos módulos PFS (por dependência)

Conforme **Master Index — Tabela 19.3** e **Mapa de Dependências 9.2**:

| Módulo | Nome | Depende de | Ordem de implementação |
|--------|------|------------|------------------------|
| 4C | Kernel Comportamental | PFS Geral | **1º** — Núcleo; 4B, 4D, 4E dependem dele |
| 4B | Supermarket | PFS Geral, Kernel (4C) | **2º** |
| 4E | Insights | Kernel (4C), Observabilidade | **3º** |
| 4D | Notificações | Kernel (4C), Insights (4E) | **4º** |
| 4F | Consolidado / Forecast | 4B, 4C, 4D, 4E | **5º** |

Regra: **nunca implementar um módulo antes de seus dependentes**. Kernel 4C é o primeiro; 4F é o último (consolida todos).

---

## 3. Fluxo de dependências (arquitetura)

```
Method Guide → Architecture Blueprint → Security → Observability
       ↓
     [PFS]
       ↓
Data Model → Event Catalog → DB Spec
       ↓
API Contract Guide
       ↓
Runbooks / Ops Manual → Operação
```

---

## 4. Aplicação no repositório (checklist)

- [x] **1. Kernel 4C** — Domain: tipos, variáveis, decisão de notificação (stub/minimal). `backend/src/modules/kernel/` — `kernel.types.ts`, `kernel.decision.ts`, `index.ts`.
- [x] **2. Supermarket 4B** — Alinhar ao PFS 4B: `supermarket.constants.ts` (taxonomia §8, toCents/fromCents §5.3, computeImpactInMonth §12); reexport no index.
- [x] **3. Insights 4E** — Estrutura de insight (tipo, nível, relevância, interpretação). `backend/src/modules/insights/` — tipos que referenciam Kernel (Suavidade).
- [x] **4. Notificações 4D** — Tipos de domínio. `backend/src/modules/notifications/` — estrutura `Notificacao` conforme PFS 4D §5.
- [x] **5. Consolidado 4F** — Módulo forecast: `backend/src/modules/forecast/` — tipos `ForecastResult`, `PrevisaoMensal`, `PrevisaoSemanal` (PFS 4F §3–4).

---

## 5. Nota sobre testes

Os testes `auth-register.spec.ts` e `goals.spec.ts` estão passando. O banco foi migrado (`npx prisma migrate dev`) e as tabelas `User`, `Goal`, etc. existem. O build e os testes de `pagination.spec.ts` também passam.

---

## 6. Método Fortress

Aplicação do Method Guide (convenção de nomes, princípios, domínios): ver **docs/METHOD_APPLICATION_V7.md**.

---

## 7. Referências

- **Ordem canônica de leitura:** Master Index v7 — Seção 18.6.
- **Como navegar:** FORTRESS_DOCS_V7/README.md.
- **Matriz de módulos:** Master Index v7 — Tabela 19.3.
- **Mapa de dependências:** Master Index v7 — Seção 9.2.
- **Método Fortress:** FORTRESS_DOCS_V7/method/fortress_v_7_method_guide_updated.md.
