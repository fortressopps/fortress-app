# Projet onboarding para mudanças de paginação

Este arquivo lista tudo o que eu (assistente) preciso saber / confirmar quando você abrir a raiz do projeto `fortress-app` no VS Code, e descreve os próximos passos que eu vou executar para integrar e ajustar a paginação (backend Nest + frontend Next). Cole/abra este arquivo antes de eu começar a aplicar patches que toquem múltiplas pastas.

---

## Objetivo

- Atualizar e padronizar a paginação (offset-based) usando `utils/pagination.ts` já modificado.
- Fornecer DTO/Pipe/Helpers para Nest (Prisma) e adaptar consumidores no frontend.
- Criar testes unitários e de integração leve para garantir comportamento consistente.

---

## O que eu preciso que você faça agora

1. Abra a raiz do projeto no VS Code: selecione a pasta `fortress-app` (File → Open Folder → `fortress-app`).
2. Confirme aqui quando a pasta estiver aberta.
3. Se possível, rode `npm install` nas pastas relevantes (`backend` e `frontend`) antes que eu crie mudanças que exijam novas dependências.

Comandos (PowerShell):

```powershell
cd C:\caminho\para\fortress-app\backend
npm install

cd ..\frontend   # se existir
npm install
```

Se preferir eu deixo os patches sem instalar dependências — então você instala e roda os testes localmente.

---

## Informações que eu vou procurar automaticamente ao abrir o workspace

- `package.json` em `backend/` e `frontend/` (test runner, scripts, dependências). 
- `lib/db.ts` ou `prisma` client (onde o `prisma` é exportado) para ajustar imports no controller de exemplo.
- Estrutura Nest: `src/modules/...`, controllers, services e módulos onde endpoints retornam listas.
- Frontend Next: verificar se usa App Router (`/app`) ou Pages Router (`/pages`) e localizar componentes que consomem `meta` (listagens, hooks, swr/fetchers).
- Config de paths/aliases (`tsconfig.json` paths) para ajustar imports (`@/` ou `src/`).
- CI (workflow) e qualquer script de test que precise atualização.

---

## Decisões que preciso que você confirme (máximas prioritárias)

1. Política sobre decimais em query params:
   - Atualmente o util rejeita decimais (só aceita inteiros). Confirma que devemos REJEITAR decimais (current) ou TRUNCAR (parseInt) automaticamente?
2. Comportamento quando `page > totalPages`:
   - Opções: (A) retornar `page` solicitado e `totalPages` separado, ou (B) ajustar (clamp) `page` para `totalPages` automaticamente.
   - Código atual: clamp por padrão; eu já adicionei uma versão com `options.clampPage` para desabilitar clamp.
3. `totalPages` quando `totalCount === 0`:
   - Atual: `totalPages === 0`. Quer que seja `0` (atual) ou `1` para simplificar frontends que esperam >=1?
4. Limite máximo `MAX_PAGE_SIZE`:
   - Atual: `100`. Confirma se esse valor está OK ou se prefere outro limite (ex.: 50, 200).

Por favor responda a essas 4 decisões — com isso eu aplico alterações consistentes e documentadas.

---

## Padrões e arquivos que eu vou criar/atualizar automaticamente (resumido)

- Backend (Nest):
  - `src/common/dto/pagination.dto.ts` (DTO com class-validator) — já criado.
  - `src/common/pipes/pagination.pipe.ts` — já criado.
  - `src/common/utils/pagination.helper.ts` — helper para aplicar skip/take no Prisma — já criado.
  - `src/modules/*/*controller.ts` — vou propor patches para controllers que retornam listas para usar o pipe/helper.
  - `test/*.spec.ts` — testes unitários para `utils/pagination.ts` e helpers (já criei um teste básico).

- Frontend (Next):
  - Procurarei todos os consumidores de endpoints paginados e atualizarei os fetchers/hooks/components para entender o novo `meta` (`totalCount`, `page`, `pageSize`, `totalPages`).
  - Caso o frontend espere um formato diferente, posso adicionar adaptadores/backwards-compat responses no backend.

---

## Como eu vou trabalhar (fluxo seguro)

1. Escaneio o repo (buscar controllers e fetchers).  
2. Crio patches pequenos (1 controller / 1 frontend consumer por patch) e adiciono testes.  
3. Você roda os testes localmente e me informa falhas; corrijo e repito.  
4. Ao final, eu crio um resumo de mudanças e sugestões para migrar para cursor-based pagination nos endpoints críticos.

---

## Comandos úteis que eu vou pedir que você rode localmente

No backend (PowerShell):
```powershell
cd C:\caminho\para\fortress-app\backend
npm install
npm test           # ajustado ao script de test no package.json (pode ser `npm run test`)
```

No frontend (PowerShell):
```powershell
cd C:\caminho\para\fortress-app\frontend
npm install
npm run dev
```

---

## Observações finais (com visão estratégica)

- Prioridade: evitar breaking changes nos clientes. Prefira compat layer quando houver risco.  
- Para endpoints de alto volume, planejar migração para cursor-based pagination (em paralelo), não agora.  
- Documentar as decisões neste repositório (`docs/pagination.md` ou similar) para referência da equipe.

---

Quando abrir a raiz do projeto, confirme aqui "aberto" e eu começo a varredura automática e aplico patches conforme o plano seguro acima.

Obrigado — pronto para começar quando você abrir a pasta `fortress-app`.
