🔐 IAM-RUNBOOK v7.24 — FORTRESS ENTERPRISE EDITION



Identity \& Access Management Operational Playbook

Status: Estável • Criticidade: P4 • Domínio: Autenticação, Autorização, Tokens, Sessões

Compatível com: Security Framework v7.24 • Privacy v7.24 • API Contract v7.24 • DB Runbook • Observability



1\. PROPÓSITO



Este runbook define a operação, detecção, recuperação, hardening e resposta a incidentes do Identity \& Access Management (IAM) da plataforma Fortress.



A camada IAM é responsável por:



Autenticação (login, MFA, device fingerprinting)



Autorização (RBAC/ABAC/Scopes)



Tokens (JWT, refresh tokens, rotation)



Sessões (controle, expiração, revogação)



Auditoria e detecção de anomalias de identidade



Proteção contra acesso indevido (cross-user)



Proteção regulatória (LGPD/GDPR – dados P3/P4)



Objetivos principais:



Zero acesso indevido entre usuários



Zero violação de escopos de API



Zero token comprometido



Tempo de reação < 5 minutos (MTTD)



Isolamento automático de identidade comprometida



2\. CLASSIFICAÇÃO DE SEGURANÇA (P4)



A camada IAM lida diretamente com:



Identidade completa do usuário



Permissões e escopos sensíveis



Chaves e tokens



Sessões de acesso



Dados críticos P3/P4 (Privacy Framework)



Consequências potenciais de falhas:



Vazamento entre contas



Elevação indevida de privilégio



Comprometimento de sessão



Perda de confiança institucional



Violação regulatória (LGPD, GDPR, PCI)



Tolerância para falhas críticas: zero.



3\. SINTOMAS DE COMPROMETIMENTO (IAM)

3.1 Autenticação



Taxa de falha > 5% em 60 minutos



Picos de tentativas do mesmo IP/device



MFA sendo ignorado ou não exigido quando deveria



Login de localizações incompatíveis com padrão histórico



Tokens com expiração fora do baseline



3.2 Autorização



Acessos cross-user detectados



Scopes ampliados sem MFA



Alterações de role sem autorização



Requests a endpoints fora do domínio do usuário



Serviços backend burlando RBAC



3.3 Tokens \& Sessões



Refresh token rotation falhando



Sessões zumbis (ativas após logout)



Tokens com claims inconsistentes



Tokens aparecendo em logs (PII violação)



Número de sessões simultâneas acima do threshold



3.4 Infraestrutura IAM



Falha no OIDC provider



Expiração de certificados (mTLS/JWT)



Clock drift entre serviços (exp/iat inválidos)



Job de revogação atrasado



4\. DETECÇÃO (N0–N4)

N0 — Monitoramento Automático (tempo real)

Acessos cross-user (essencial)

SELECT actor\_user\_id, COUNT(DISTINCT target\_user\_id) as accessed

FROM audit\_logs

WHERE action = 'data\_access'

AND created\_at > NOW() - INTERVAL '15 minutes'

GROUP BY actor\_user\_id

HAVING COUNT(DISTINCT target\_user\_id) > 1;



Detecção de brute-force

SELECT ip\_address, COUNT(\*) AS attempts

FROM auth\_events

WHERE created\_at > NOW() - INTERVAL '10 minutes'

AND success = FALSE

GROUP BY ip\_address

HAVING COUNT(\*) > 20;



Tokens suspeitos

SELECT user\_id, scopes, expires\_at - issued\_at AS duration

FROM tokens

WHERE expires\_at - issued\_at > INTERVAL '24 hours';



Sessões suspeitas

SELECT user\_id, COUNT(\*) AS active\_sessions

FROM user\_sessions

WHERE last\_activity\_at > NOW() - INTERVAL '1 hour'

GROUP BY user\_id

HAVING COUNT(\*) > 3;



N1 — Sintomas Estruturais



Muitos tokens revogados em pouco tempo



Usuários acessando endpoints incomuns



Mudança brusca de padrões de login



Discrepância entre IPs/sessões simultâneas



Registros de autorização divergentes



N2 — Auditoria Direcionada (Segurança)



Inclui:



Auditoria de claims de tokens inválidos



Reexecução de validação de escopos



Revisão de MFA/device fingerprint



Verificação de rotações de chave JWT



Análise de tentativas consecutivas de devices distintos



Comando de auditoria IAM

./iam-audit --user USER\_ID --window 24h --deep



N3 — Falha Operacional



Provedor OIDC fora do ar



JWT assinado com chave inválida



RBAC inconsistente entre microserviços



Rotação de chaves mal sucedida



Rejeição em massa de tokens válidos



Token hijacking confirmado



N4 — Crítico (Vazamento / Acesso Indevido)



Os gatilhos N4 incluem:



Cross-user confirmado



Token comprometido circulando



Acesso indevido a dados P3/P4



Elevação de privilégio real



Ataque ativo explorando identidades



Ações devem ser imediatas (ver seção 7).



5\. DIAGNÓSTICO AVANÇADO

5.1 Token Integrity Deep Audit

SELECT \*

FROM tokens

WHERE scopes != expected\_scopes(user\_id)

&nbsp;  OR mfa\_used = FALSE AND scopes LIKE '%sensitive%'

&nbsp;  OR issued\_at > expires\_at;



5.2 Session Hijacking



Padrão: múltiplas sessões incompatíveis geograficamente.



SELECT user\_id, session\_id, ip\_address, geo\_location

FROM user\_sessions

WHERE last\_activity\_at > NOW() - INTERVAL '1 hour'

ORDER BY user\_id, geo\_location;



5.3 MFA Abuse Detection

SELECT user\_id, COUNT(\*) AS no\_mfa\_critical\_operations

FROM security\_events

WHERE requires\_mfa = TRUE

AND mfa\_verified = FALSE

AND created\_at > NOW() - INTERVAL '24 hours'

GROUP BY user\_id;



5.4 RBAC/ABAC Consistency Check

SELECT user\_id

FROM permissions

WHERE assigned\_role NOT IN (SELECT role FROM roles\_baseline);



6\. RECUPERAÇÃO (N0–N4)

N0 — Autocorreção



Revogação automática de tokens suspeitos



Bloqueio temporário de IPs



Sessões inconsistentes são finalizadas



MFA é forçado para acessos suspeitos



Reemissão automática de JWT com claims corrigidos



N1 — Intervenção Controlada

./session-manager --kill-all --user USER\_ID

./iam-toolkit --revoke-tokens --user USER\_ID

./mfa-enforcer --user USER\_ID --require-now





Checklist:



Sessões limpas



Tokens revogados



Claims auditados



Dispositivo suspeito isolado



N2 — Correção Estrutural



Revisão de políticas RBAC/ABAC



Reemissão de certificados mTLS



Rotação de chaves JWT



Reconfiguração de OIDC/SAML



Revalidação de providers externos (Google/Apple)



N3 — Intervenção Operacional Crítica



Reset global de sessões



Revogação massiva de tokens



Rotação completa de chaves criptográficas



Revisão de logs de auditoria de 7 dias



Congelamento de endpoints sensíveis



N4 — Incidente Crítico IAM



Congelar toda escrita



Ativar Modo Read-Only



Revogação total de chaves



Reautenticação forçada de 100% da base



Preservação forense



Comunicação regulatória (GDPR/LGPD)



Abertura de investigação corporativa



7\. CASOS CRÍTICOS (Playbooks)

7.1 Vazamento de Tokens



Revogar tokens em massa



Rotacionar chave de assinatura



Forçar login de todos os usuários



Reemitir tokens limpos



Auditar logs dos últimos 30 min



Notificar usuários afetados



Documentar impacto



7.2 Elevação Indevida de Privilégio



Congelar operações



Reverter permissões



Auditar cadeia de escopos



Revisar logs de alteração



Verificar abuso (API/Backoffice)



Reforçar MFA



Gerar post-mortem v7



7.3 Session Hijacking Confirmado



Revogar todas as sessões



Bloquear IP/device



Exigir MFA



Revalidar identidade



Revisar atividades de 24h



8\. CHECKLISTS

Diário



Brute-force < 100/h



Cross-user: zero



Token rotation: 100%



Certificados válidos



Nenhum token em logs



Sessões expirando corretamente



Semanal



Revisão de políticas RBAC/ABAC



Auditoria de acessos críticos



Rotação de chaves menores



Teste de MFA em endpoints críticos



Integridade de device fingerprints



Mensal



Rotação parcial de chaves JWT



Teste de reset massivo de sessões



Validação anti-regressão IAM



Simulação de incidente tipo N3



9\. KPIs

KPI	Meta

Auth Success Rate	> 99.5%

Token Revocation Latency	< 30s

MFA Coverage	> 95% operações críticas

Cross-User Incidents	0

Session Hijacking	0

Token Rotation Success	100%

Certificate Validity	100%

10\. BLOQUEIOS DE EMERGÊNCIA (Hard Stops)



Quando ativar imediatamente:



Acesso cross-user detectado



Elevação de privilégio não autorizada



Vazamento de tokens



Sessão zumbi após logout



Token com claim manipulado



Falha total de OIDC / assinatura JWT



Logs contendo P3/P4 em plaintext



Ações:



Modo Read-Only



MFA obrigatório para tudo



Congelamento de sessões



Throttling agressivo de API



Revogação de tokens



Auditoria reforçada



11\. DIAGRAMAS (ASCII)

11.1 Ciclo IAM

Login → MFA → Token Issue → Access Validation → Session Tracking → Audit Logs



11.2 Detecção → Contenção → Recuperação

\[Anomalia] → \[N0 Detection] → \[N1 Checks] → N2 Auditoria → N3 Operacional → N4 Crítico



11.3 Autorização

Role → Policy → Scope → Enforcement → Audit



12\. HISTÓRICO



v7.24 — Revisão completa



Reescrito ao padrão Enterprise



Inclusão da matriz N0–N4



SQL avançado e análises comportamentais



KPIs rígidos e hard-stops adicionados



Adicionados diagramas



Alinhamento total com Security \& Privacy Framework

