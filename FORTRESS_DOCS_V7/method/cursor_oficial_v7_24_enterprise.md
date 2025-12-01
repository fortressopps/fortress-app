📘 CURSOR OFICIAL v7.24 — ENTERPRISE MODE

Fortress v7.24 — Documento Oficial Institucional
Status: Consolidado
Versão: v7.24
Área: Engineering, Product, Governance
Uso: Obrigatório para qualquer uso do Cursor no ecossistema Fortress

1. Objetivo

Estabelecer as regras oficiais de uso, operação, segurança, navegação e geração de código/documentos usando o Cursor IDE dentro do ecossistema Fortress v7.24 Enterprise.

Este documento define:

como o Cursor deve interpretar a documentação Fortress

como o Cursor deve gerar, modificar e validar código

como o Cursor deve navegar entre módulos v7

restrições, limites e permissões

regras de impacto cruzado entre arquivos

integração com Auditor v7.3 ULTRA

comportamento obrigatório para agentes automáticos

padrões corporativos e ILIDs

2. Escopo
Inclui:

Operação do Cursor em todos os módulos Fortress

Comandos permitidos

Fluxo de trabalho com agentes

Criação e modificação de arquivos

Navegação entre PFS → Arquitetura → API

Uso de ILIDs

Regras de segurança

Propagação de mudanças

Não inclui:

Implementação do Auditor

Conteúdo específico dos PFS (definido nos próprios PFS)

Estratégias de desenvolvimento fora do Cursor

Instruções de ambiente (ver pre_fortress_cursor_w_11.md)

3. Princípios Fundamentais do Cursor v7.24

O Cursor funciona dentro das regras institucionais do ecossistema.

Princípio 1 — O Cursor nunca é criativo

Ele executa, modifica, propaga, alinha e garante coerência.

Princípio 2 — O Cursor nunca contradiz documentos

Ele segue a hierarquia:

Master Index

Method Guide

Architecture Blueprint

Security & Privacy Framework

PFS (todos)

Data Model / Event Catalog / DB Spec

API Contract

Observability

Runbooks

Ops

Princípio 3 — Nada é gerado sem ILID

Cada geração deve referenciar:

PFS.x (origem comportamental)

ARCH.x (integração arquitetural)

API.x (se criar rotas)

EVENT.x (para eventos)

Princípio 4 — O Cursor é sempre determinístico

Mesma entrada → mesmo output.

Princípio 5 — Toda mudança gera propagação

Se alterar:

comportamento → PFS + Modelo + Eventos + API

entidade → Data Model + DB Spec

evento → Event Catalog + API + Observability

payload → API + testes

lógica → Observability

Princípio 6 — Código só existe se estiver ancorado em PFS

O Cursor não cria features sem referência oficial.

4. Modos de Operação
4.1 Agent Mode (Modo Ultra-Estrito)

Usado para modificar múltiplos arquivos.

Regras:

só é usado quando necessário

deve exibir lista de arquivos antes de tocar neles

deve solicitar confirmação ANTES de alterar pastas inteiras

deve explicar impacto cruzado

deve gerar diffs limpos, pequenos, segmentados

deve sempre seguir PFS → Blueprint → API → Observability

Proibido:

tocar em arquivos sem listá-los antes

gerar mudanças gigantes em um único patch

4.2 Inline Mode (Ctrl+K)

Para editar um bloco específico.

Regras:

não altera comportamento global

não altera assinatura pública

não altera estrutura de pastas

só altera o trecho selecionado

4.3 Multi-File Mode

Permitido apenas quando:

impacto é arquitetural

evento novo é criado

entidade evolui

endpoint muda

Regras:

deve criar um patch por arquivo

deve exibir preview de cada patch

deve descrever resumo do impacto

5. Regras de Navegação Oficial (v7.24)

O Cursor deve navegar sempre nesta ordem:

Method Guide →
Master Context →
PFS →
Blueprint →
Data Model →
Event Catalog →
DB Spec →
API Contract →
Observability →
Runbooks

Regras:

Nunca gerar API antes de verificar Event Catalog

Nunca gerar entidade antes de verificar Data Model

Nunca gerar lógica antes de verificar PFS

Nunca gerar evento sem mapear no Event Catalog

6. ILIDs — Identificadores Lógicos Internos

O Cursor não trabalha com nomes de arquivos.
Ele trabalha com ILIDs oficiais, por exemplo:

pfs.general.v7
pfs.kernel.v7
pfs.insights.v7
pfs.notifications.v7
arch.blueprint.v7
arch.events.v7
arch.data_model.v7
api.contract.v7
security.framework.v7
obs.blueprint.v7
runbook.db.v7


Uso obrigatório:

@cursor follow pfs.kernel.v7 → implementar X
@cursor follow arch.events.v7 → mapear evento
@cursor apply api.contract.v7 → gerar rota

7. Fluxo Oficial de Desenvolvimento com Cursor
Etapa 1 → Selecionar o módulo no PFS

O Cursor sempre inicia pela origem comportamental.

Etapa 2 → Mapear entidades afetadas

Verifica Data Model.

Etapa 3 → Mapear eventos associados

Verifica Event Catalog.

Etapa 4 → Mapear persistência

Verifica DB Spec.

Etapa 5 → Mapear integração externa

Verifica API Contract.

Etapa 6 → Gerar código

O Cursor só gera:

rotas

controladores

serviços

validações

schema Zod

eventos

logs

métricas

Etapa 7 → Propagar impacto cruzado

Se necessário:

atualizar events

atualizar data model

atualizar api

atualizar observability

Etapa 8 → Executar Auditor v7.3 ULTRA

Antes de aceitar patch definitivo.

8. Restrições de Geração (Hard Rules)

O Cursor está PROIBIDO de:

❌ criar endpoints que não estejam no PFS
❌ criar modelos que não estejam no Data Model
❌ criar eventos que não existam no Event Catalog
❌ alterar arquivos de segurança sem PFS + Security Framework
❌ criar variáveis mágicas
❌ gerar código não tipado
❌ gerar arquivos fora das pastas oficiais
❌ sobrepor arquivos sem aviso

9. Padrões de Código Obrigatórios

TypeScript estrito

Zod para validação

Serviços → repositórios → prisma

Observabilidade padronizada

Eventos sempre mapeados

Respostas sempre tipadas

Uso obrigatório de DTOs

Tratamento de erros padrão Ops + Recovery Playbook

10. Padrões de Organização de Arquivos

Backend:

src/
  modules/
    module/
      domain/
      dto/
      service/
      controller/
      mapper/
      repository/
  common/
  core/
  api/
  events/


Frontend:

src/
  features/
  components/
  hooks/
  layouts/
  services/

11. Segurança (obrigatório)

O Cursor deve aplicar:

validação de input

classes de erro específicas

logs sensíveis mascarados

auditoria de acesso

segregação entre camadas

números de versão em payloads

12. Auditoria Integrada (Cursor → Auditor)

O Cursor deve acionar ou validar o Auditor v7.3 ULTRA em:

criação de módulo

criação de entidade

alteração de estrutura

alteração de evento

alteração de API

13. Fluxo de Confirmação de Mudanças

Antes de modificar arquivos:

Listar todos os arquivos que serão tocados

Aguardar confirmação

Exibir patch por arquivo

Aguardar confirmação final

Aplicar mudanças

14. Erros que o Cursor deve detectar automaticamente

endpoints ausentes no Contract Guide

entidades ausentes no Data Model

eventos sem telemetria

payloads inconsistentes

inexistência de versionamento nos arquivos

duplicação de lógica

arquivos fora da taxonomia v7

15. Histórico de Versão
Versão	Data	Autor	Mudanças
v7.24	2025-12-01	Sistema	Versão oficial Enterprise