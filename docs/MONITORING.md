# Monitoramento Básico Fortress

## Logs
- Backend utiliza pino para registrar eventos de registro, login, verificação e erros
- Logs podem ser enviados para arquivos ou serviços externos

## Métricas
- Contagem de registros, logins, falhas e tentativas de verificação
- Possível integração futura com Prometheus/Grafana

## Exemplos
- Registro: logger.info({ email }, "Tentativa de registro")
- Login: logger.info({ email }, "Tentativa de login")
- Verificação: logger.info({ token }, "Tentativa de verificação de email")
- Erro: logger.error({ error }, "Erro de autenticação")
