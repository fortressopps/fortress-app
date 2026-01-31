# Fluxo de Autenticação Social (Google/Microsoft)

## Backend
- Rotas OAuth implementadas com Passport
- Usuário é criado/atualizado no banco com email e nome
- JWT gerado e enviado ao frontend via callback
- Variáveis necessárias: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, FRONTEND_URL

## Frontend
- Botões de login social (Google/Microsoft)
- Redirecionamento para /oauth-callback com token JWT
- Estado de autenticação atualizado

## Exemplo de .env
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
FRONTEND_URL=http://localhost:5173
```

## Fluxo
1. Usuário clica em "Entrar com Google/Microsoft"
2. Redireciona para provedor OAuth
3. Após autenticação, backend gera JWT e redireciona para frontend
4. Frontend recebe token, atualiza estado e navega para dashboard
