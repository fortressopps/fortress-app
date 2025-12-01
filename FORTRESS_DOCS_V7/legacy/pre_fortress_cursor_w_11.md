# FORTRESS — PREPARAÇÃO COMPLETA DO AMBIENTE (WINDOWS 11)

### Versão 7.24 — Documento Oficial para Desenvolvedores + Cursor IDE

> **Objetivo:** Este documento prepara o ambiente **exatamente no padrão que o Cursor exige** para funcionar com máxima eficiência em projetos complexos (Fortress v7.x). Ele substitui e aprimora totalmente a versão anterior.

---

# **0. Visão Geral**

Este documento garante que qualquer desenvolvedor ou máquina nova consiga:

- instalar **todas as dependências corretas**;
- configurar **Windows 11 + WSL2 + Node + pnpm**;
- preparar **Cursor** com as extensões ideais;
- rodar projetos fullstack (frontend + backend + workers);
- debugar Node, React e Prisma sem fricção;
- usar IA integrada de forma produtiva.

> **Importante:** este documento é consumível pelo Cursor.\
> As instruções são diretas, previsíveis, padronizadas e sem ambiguidade, para facilitar automações.

---

# **1. Pré-Requisitos de Sistema**

- Windows 11 atualizado
- 8GB de RAM (mínimo) / 16GB recomendado
- 10GB de espaço livre
- Conta Microsoft para usar Winget

---

# **2. Instalações Fundamentais (via Winget)**

> Recomendado rodar tudo em **PowerShell (Admin)**.

```powershell
# Atualizar gerenciador
winget upgrade --all

# Git
winget install --id Git.Git -e

# Node LTS
winget install OpenJS.NodeJS.LTS -e

# Cursor IDE
winget install Anysphere.Cursor -e
```

### Verificar instalações

```powershell
node -v
npm -v
git --version
```

Tudo deve retornar versões válidas.

---

# **3. Instalar pnpm (recomendado para Fortress)**

```powershell
npm install -g pnpm
```

### Verificar

```powershell
pnpm -v
```

---

# **4. Ativar WSL2 (Altamente Recomendado)**

O Cursor funciona no Windows nativamente, porém **WSL2 entrega desempenho, compatibilidade e experiência Linux real**, ideal para Node, Prisma, Docker e workers.

### 4.1 Instalar WSL

```powershell
wsl --install
```

Isso instala WSL2 + Ubuntu automaticamente.

### 4.2 Reiniciar o PC.

### 4.3 Abrir Ubuntu e criar usuário

Apenas siga o prompt inicial.

---

# **5. Instalações Dentro do WSL (Ubuntu)**

Abra o terminal Ubuntu e execute:

```bash
sudo apt update && sudo apt upgrade -y

# Node (via nvm — melhor prática)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

# pnpm
npm install -g pnpm
```

### Conferir

```bash
node -v
pnpm -v
```

---

# **6. Configurar Cursor + WSL**

No Cursor:

1. `Ctrl + Shift + P` → **Remote: Connect to WSL**
2. Abrir o repositório dentro da pasta Linux (`/home/user/project`)
3. Confirmar que o Cursor reconhece o ambiente Linux.

> Isso garante que Prisma, Node, workers e watchers funcionem sem erros comuns no Windows.

---

# **7. Estrutura Padrão Fortress v7.24 no Workspace**

```
/fortress-app
  /backend
    package.json
    tsconfig.json
    prisma/
    src/
  /frontend
    package.json
    tsconfig.json
    src/
  pnpm-workspace.yaml
  README.md
```

> Essa estrutura é essencial para o Cursor compreender o projeto como um monorepo e gerar código consistente.

---

# **8. Extensões Obrigatórias no Cursor**

As extensões abaixo são necessárias para máximo desempenho:

### **Frontend & Backend**

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense**
- **Prisma** (Prisma.prisma)
- **Error Lens**

### **Configuração recomendada (settings.json)**

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact"
  ]
}
```

---

# **9. Git + Cursor — Fluxo Ideal**

### Commitar

- Abrir painel **Source Control**
- Fazer stage
- Digitar mensagem
- Ou usar: `@commit generate commit message`

### Resumo rápido

- `@Git summarize changes`
- `@Git explain this diff`

### Resolver conflitos

- `@Git resolve conflicts`

---

# **10. Executar o Backend no Cursor**

No terminal do Cursor (WSL preferido):

```bash
pnpm install
pnpm dev
```

Para ambientes com `tsx` ou `ts-node-dev`, o script está no `package.json` do backend.

---

# **11. Debug Node.js (recomendado)**

Criar `.vscode/launch.json` no backend:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Node",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/dist/index.js",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
    }
  ]
}
```

Depois pressionar **F5**.

---

# **12. Fluxo de Trabalho com IA (Cursor)**

### 12.1 Inline Composer (Ctrl + K)

- Para modificar trechos específicos.

### 12.2 Modo Agent (Ctrl + I)

- Para edições em múltiplos arquivos.
- Para criar módulos inteiros.

### 12.3 Chat (Ctrl + L)

- Explicações
- Revisões
- Bugfixes

### 12.4 Aceitar / Rejeitar mudanças

- **Tab** → aceitar
- **Ctrl + Backspace** → rejeitar

---

# **13. Solução de Problemas Comuns**

## ESLint não funciona

Adicione no `settings.json`:

```json
"eslint.validate": ["typescript", "typescriptreact"]
```

## Prisma não gera cliente

```bash
pnpm dlx prisma generate
```

## Problemas de permissão

```bash
sudo chown -R $USER:$USER .
```

---

# **14. Finalização do Ambiente**

Se tudo estiver funcionando:

- Cursor reconhece o projeto
- pnpm funciona tanto no Windows quanto no WSL
- Node + Prisma rodando
- Extensões instaladas
- Git integrado

Seu ambiente está pronto para desenvolvimento Fortress.

---

# **15. Próximo Documento Sugerido**

**Documento de Funções da Plataforma (Product Functional Specification v7.24)**.

Pronto para gerar quando você pedir.

