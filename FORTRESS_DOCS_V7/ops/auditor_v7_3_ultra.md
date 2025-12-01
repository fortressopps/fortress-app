# AUDITOR v7.3 ULTRA — FORTRESS v7.24 (Enterprise Final)

**Versão:** v7.3 ULTRA  
**Área:** Ops / Auditoria / Governança  
**Status:** Final — Pronto para integração com Cursor v7.24 Enterprise

## 1. Objetivo
O Auditor v7.3 ULTRA valida automaticamente a conformidade dos arquivos de documentação e estrutura do repositório `FORTRESS_DOCS_V7` contra as regras do Master Index e do Consistency Engine v7.24.  
Ele é a peça que fecha o ciclo do Cursor: detecta violações, sugere correções e gera relatórios.

## 2. Principais verificações (checks)
1. **Presença do Master Index** (`master_index_v_7.md`)  
2. **Estrutura oficial de pastas** (foundation, method, architecture, PFS, api, ops, runbooks, security, product, glossary)  
3. **Nomeação (snake_case + _v_7)** em todos os arquivos `.md`  
4. **Arquivos fora de lugar** (arquivos que não pertencem à pasta oficial)  
5. **Arquivos sem versão explícita** (falta `_v_7` ou similar)  
6. **Arquivos muito pequenos (< 2KB)** — sinal de rascunho inválido  
7. **Duplicatas por conteúdo ou nome**  
8. **ILIDs indexados no Master Index** (referências cruzadas)  
9. **Links quebrados entre documentos** (referências a arquivos inexistentes)  
10. **Eventos sem referência no Event Catalog** (inspeção heurística por `event`/`emit` tokens)  
11. **PFS sem referência ao Blueprint** (checagem de citações)  
12. **Regras de versionamento corretas** (MAJOR.MINOR.PATCH)  
13. **Verificação rápida de scripts executáveis** (presença de `auditor/auditor_v7.ps1`)  
14. **Checklist de Observability** (presença de observability_blueprint_v_7.md)  
15. **Report final em Markdown + JSON**

## 3. Como executar (PowerShell)
No terminal, posicione no diretório raiz que contém `FORTRESS_DOCS_V7` e execute:

```powershell
# dar permissão caso necessário
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# executar o auditor
.uditor_v7_3_ultra.ps1 -Path "./FORTRESS_DOCS_V7" -ReportOut "./auditor_report.json"
```

## 4. Integração com Cursor
- O Cursor aciona o Auditor sempre que for aplicar mudanças que toquem *múltiplos arquivos* (Agent Mode, Multi-File Mode).
- O fluxo recomendado:
  1. Cursor gera patch (preview).
  2. Cursor chama Auditor para validar o preview (modo `--staged` ou apontando para a pasta temporária).
  3. Auditor retorna relatório (passa/falha + lista de violações).
  4. Cursor exibe relatório ao usuário e bloqueia aplicação se houver falhas críticas.

## 5. Modos de operação do Auditor
- **Full Run**: varre todo o repositório (`-Path` para raiz).
- **Staged Run**: recebe uma lista de arquivos (modo preview) e valida apenas esses.
- **CI Run**: retorna código de saída não-zero em caso de violação crítica (para integrar em pipelines).
- **Fix Suggestions**: gera um patch (.diff) com sugestões automatizadas para violações simples (nomeação, versão, placeholders).

## 6. Severidade
- **CRITICAL**: quebram políticas (ex.: endpoint faltando no API contract, PFS sem referência no Blueprint). Bloqueiam deploy.
- **HIGH**: violam regras de nomenclatura, arquivos fora de lugar.
- **MEDIUM**: arquivos muito pequenos, falta de observability.
- **LOW**: sugestões de melhoria (formatos, estilo).

## 7. Saída do Auditor
- `auditor_report.json` — JSON com lista de checagens e severidade.
- `auditor_report.md` — resumo humano legível.
- Exit code:
  - `0`: sem violações críticas
  - `1`: violações HIGH ou CRITICAL
  - `2`: falha na execução do auditor

## 8. Extensibilidade
O script PowerShell é modular e projetado para ser estendido com novos detectores (ex.: verificação semântica via heurística, integração com linter customizado, chamada a serviços externos).

## 9. Histórico
- v7.3 ULTRA — 2025-12-01 — Versão final Enterprise, integrada ao Cursor v7.24.

---
