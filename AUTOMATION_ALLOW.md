AUTOMATION ALLOW (PowerShell)

Instruções: cole as linhas/entradas apropriadas na sua UI de "Allow automatic" ou mantenha este arquivo como referência. Abaixo há dois perfis: MINIMAL (recomendado) e FULL (mais permissivo).

---
MINIMAL (recomendado)
- Objetivo: permitir que eu automatize alterações seguras, rodar install/tests e commitar em branch de trabalho local.
- Permissões solicitadas (copie/cole como ações separadas):

# Instalar dependências (backend + frontend)
Push-Location 'C:\Users\Robert\fortress-app\backend'; npm install; Pop-Location
Push-Location 'C:\Users\Robert\fortress-app\frontend'; npm install; Pop-Location

# Rodar testes não interativos (backend)
Push-Location 'C:\Users\Robert\fortress-app\backend'; npm test; Pop-Location

# Permitir edição de arquivos no workspace (apply_patch)
# (A ação que autoriza a edição de arquivos — tipicamente marcada separadamente na UI)
ALLOW: edit files (apply_patch)

# Permitir git local: criar branch e commitar (NÃO PUSHAR para 'main' sem revisão)
Push-Location 'C:\Users\Robert\fortress-app'; git checkout -b automation/supermarket-refactor; git add -A; git commit -m "chore(supabase): refactor supermarket controller and import pagination helpers"; Pop-Location

Notas de risco: segura — não sobe alterações ao remoto nem toca no banco.

---
FULL (use com cautela)
- Objetivo: permitir automação completa (lint, format, build, push, start servers, migrações). Autorize só se confiar totalmente.

# Tudo do MINIMAL, mais:
# Lint & format (corrigir automaticamente)
Push-Location 'C:\Users\Robert\fortress-app\backend'; npx eslint --fix .; npx prettier --write .; Pop-Location

# Audit fix (cuidado com --force)
Push-Location 'C:\Users\Robert\fortress-app\frontend'; npm audit fix; Pop-Location
# (opcional e mais arriscado)
# Push-Location 'C:\Users\Robert\fortress-app\frontend'; npm audit fix --force; Pop-Location

# Build frontend
Push-Location 'C:\Users\Robert\fortress-app\frontend'; npm run build; Pop-Location

# Start servers em background (dev)
Push-Location 'C:\Users\Robert\fortress-app\backend'; Start-Process -NoNewWindow -FilePath 'npm' -ArgumentList 'run','dev'; Pop-Location

# Git push (só branch criado pelo agente)
Push-Location 'C:\Users\Robert\fortress-app'; git push origin automation/supermarket-refactor; Pop-Location

# Migrações / DB sensíveis (ALTO RISCO) — autorize apenas manualmente e com backup
# Push-Location 'C:\Users\Robert\fortress-app\backend'; npx prisma migrate deploy; Pop-Location
# Push-Location 'C:\Users\Robert\fortress-app\backend'; npx prisma migrate reset --force; Pop-Location

Notas de risco: FULL pode atualizar dependências ou resetar DB; faça backup e prefira revisão manual.

---
Sugestões de configuração (segurança)
- Permita commits locais automáticos, mas NÃO push para `main` sem revisão.
- Exija que eu crie branches com prefixo `automation/` para facilitar revisão.
- Faça backup do banco antes de permitir qualquer comando de migration/reset.
- Preferir `npm audit fix` sem `--force`.

---
Como usar agora (recomendado):
1) Cole as entradas do MINIMAL na sua UI de "Allow automatic".
2) Autorize "edit files (apply_patch)" e "git create branch/commit".
3) Eu criarei uma branch local `automation/supermarket-refactor`, commito as mudanças atuais, e rodarei os testes.

Se quiser que eu prossiga agora com o MINIMAL (criar branch + commitar + rodar testes), confirme aqui (ou apenas deixe o arquivo colado na UI e eu seguirei). Boa pausa — eu executo tudo e volto com o resultado.
