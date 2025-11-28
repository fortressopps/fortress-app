MASTER\_CONTEXT.md — Fortress Platform (v7.23 → v7.24)



Documento Mestre de Arquitetura, Estratégia, Filosofia, Regras e Padrões



Este documento unifica todo o conhecimento essencial para que o repositório fortress-app evolua de maneira consistente, previsível e escalável.

É o núcleo de referência para decisões de arquitetura, estilo, domínio, módulos, regras de negócio e padrões de segurança.



1\. PROPÓSITO FUNDAMENTAL



Reestruturar a relação psicológica das pessoas com seu dinheiro, transformando finanças em algo leve, confiável e previsível — usando:



tecnologia inteligente,



automações,



e arquitetura de software com padrão empresarial.



A plataforma Fortress é mais do que um aplicativo financeiro;

é uma infraestrutura de hábitos, clareza emocional e organização automática.



2\. FILOSOFIA DA PLATAFORMA

2.1 Simplicidade Radical



Código simples é mais seguro, rápido e previsível.

Nada é implementado antes de estar claro.



2.2 Poucos pontos de verdade



Cada parte tem um lugar único para existir.

Nada duplicado. Nada flutuante.



2.3 Previsibilidade operacional



Toda ação deve sempre produzir o mesmo resultado.



2.4 Arquitetura opinada



Decisões difíceis são impostas pela estrutura, não por preferência pessoal.



3\. VISÃO v7.23 / v7.24



A partir do v7.21 → v7.23, a plataforma passou por uma reconstrução hexagonal total, aplicando:



ESM + TS



Prisma modernizado



Camadas bem definidas



Nomemclatura consistente



Estrutura consolidada



Frontend e backend totalmente isolados



CI e deploy opinados



O objetivo da v7.24 é:



domínio completo do backend modular



criação dos primeiros bounded contexts reais



início do Domain Kernel



fortificação das políticas de segurança



introdução do Fortress BI Core



4\. ESTRUTURA OFICIAL DO REPOSITÓRIO

fortress-app/

│

├── backend/

│   ├── src/

│   │   ├── app/

│   │   │   ├── http/          → rotas, controllers, middleware

│   │   │   ├── domain/        → entidades, serviços, regras

│   │   │   ├── core/          → bootstrap, kernel

│   │   │   └── config/        → logger, env

│   │   ├── infra/

│   │   │   ├── prisma/        → prisma client + queries

│   │   │   └── init/          → inicialização de infra

│   │   ├── main.server.ts     → entrypoint oficial

│   │   └── …

│   ├── prisma/

│   ├── package.json

│   └── tsconfig.json

│

├── frontend/

│   └── app/ (Next.js)

│

├── infra/         → scripts, imagens, automações

├── scripts/       → init-dev, doctor, maintenance

├── docs/          → ESTE MASTER CONTEXT

└── .github/workflows/



5\. PADRÕES DE ARQUITETURA (HEXAGONAL REAL)

5.1 Camadas



App Layer



Rotas



Controllers



Middlewares



DTOs



Validation



Mappers

Não contém lógica de negócio.



Domain Layer



Entities



Value Objects



Services (pure)



Regras



Políticas

Não acessa banco, HTTP, nada externo.



Infra Layer



Prisma



Repositórios



Cache



Providers externos



Core Layer



Bootstrap



Application Kernel



Container de dependências (opcional)



6\. PRINCÍPIOS DE NOMENCLATURA

Diretórios



app/http



app/domain



infra/prisma



core/bootstrap



Arquivos



\[feature].routes.ts



\[feature].controller.ts



\[feature].service.ts



\[feature].entity.ts



\[feature].mapper.ts



\[feature].repo.ts



\[feature].validation.ts



Pastas de features

domain/<feature>/

infra/<feature>/

app/http/<feature>/





Sempre feature-oriented, nunca “folders genéricas”.



7\. PRISMA (REGRAS OFICIAIS)



nenhuma regra de negócio dentro de prisma



repositórios isolados em infra/prisma



DTOs nunca tocam prisma direct



todas queries vão via repositório



NUNCA:

prisma.table.findMany(...)





dentro de controllers ou services.



SEMPRE:

this.userRepo.findAll();



8\. PADRÕES DE SEGURANÇA (V7)

8.1 Entrada



validação zod em todos endpoints



sanitização



ratelimiting (app layer)



headers obrigatórios



8.2 Backend



JWT rotating tokens



env schema obrigatório



logger centralizado



erros centralizados



zero qualquer arquivo .js no backend



ESM only



8.3 Secrets



Nunca commitados

Sempre documentados em .env.example



9\. BOOTSTRAP \& EXECUÇÃO



Arquivo oficial:



backend/src/main.server.ts





Fluxo:



main.server.ts

&nbsp;→ app.bootstrap.ts

&nbsp;   → infra.init.ts

&nbsp;      → prisma client

&nbsp;        → http server





Nada além disso inicia o backend.



10\. PADRÕES DE PULL REQUEST (FORTRESS METHOD)



Cada PR deve conter:



Título



feat(v7.xx): <resumo>

fix(api): <resumo>

chore(core): <resumo>

refactor(domain): <resumo>

security(auth): <resumo>



Checklist obrigatório



&nbsp;Estrutura segue método v7



&nbsp;Nomeação correta



&nbsp;Zero duplicações



&nbsp;Zero regras de negócio na app layer



&nbsp;Zero imports relativos quebrados



&nbsp;Testou localmente



&nbsp;Gerou migrações (se necessário)



11\. CI / DEPLOY (VERCEL + BACKEND ISOLADO)

Frontend



Vercel



pasta raiz: /frontend



Backend



Deploy futuro no Railway / Render / Docker



.vercelignore impede conflitos



Backend não é buildado pela Vercel



12\. VISÃO PARA AS PRÓXIMAS VERSÕES

v7.24



Bounded contexts reais



Domain kernel



Authentication solidificada



Observability (pino + grafana future)



Supermarket Module rebuild completo



Fortress BI Core foundation



v7.25



Automação real de faturas



Regras financeiras



Sistema de relevância comportamental



Feature flags e orchestrator



13\. DEFINIÇÃO DE “QUALIDADE DE CÓDIGO” (FORTRESS)



Um PR só é considerado aceitável quando:



não precisa de explicação



estrutura comunica tudo



import paths são limpos



serviços não dependem do framework



controllers não têm regras



domain é puro



infra é substituível



tudo é previsível



documentação bate com o código



inconsistências ZERO



14\. O QUE NUNCA PODE EXISTIR NO REPO



❌ routes/legacy/

❌ código comentado

❌ arquivos .js no backend

❌ lógica financeira em controllers

❌ múltiplas pastas para a mesma feature

❌ segredo commitado

❌ migrations soltas

❌ commit “temporary”



15\. MANTRA FINAL



Se não for modular, previsível, limpo e seguro, não entra.



Se não puder ser explicado em 30 segundos, está errado.



O código deve servir ao comportamento humano — não ao contrário.

