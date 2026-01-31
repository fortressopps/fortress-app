# Fluxo de Autenticação Fortress

## Registro
- Usuário preenche nome, email e senha
- Backend cria usuário, gera token de verificação e envia email
- Usuário clica no link recebido para ativar conta

## Login
- Login tradicional (email/senha)
- Login social (Google/Microsoft)

## Verificação de Email
- Endpoint `/auth/verify-email?token=...` valida token e ativa conta

## Variáveis de ambiente
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET

## Rate Limit
- Protege endpoints públicos de abuso

## Testes
- Testes automatizados para registro, verificação e erros
