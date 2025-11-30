🚨 SECURITY-INCIDENT-RUNBOOK v7.24 — FORTRESS ENTERPRISE EDITION



Incident Detection, Response \& Forensics Playbook

Status: Crítico • Classificação: P4 • Domínio: Infra, AppSec, Dados, IAM, Rede

Compatível com: Security \& Privacy Framework v7.24 • IAM v7.24 • Privacy v7.24 • Observability v7 • DB Runbook v7



1\. PROPÓSITO



Este documento define toda a operação de resposta a incidentes de segurança da plataforma Fortress.

Abrange:



Detecção inicial (N0)



Análise e confirmação (N1/N2)



Contenção (N3)



Erradicação e recuperação (N4)



Forense digital



Comunicação externa (regulatória)



Fechamento pós-incidente



O objetivo é limitar impacto, preservar integridade, proteger dados P3/P4 e cumprir obrigações regulatórias com tempo de resposta rápido e verificável.



2\. CLASSIFICAÇÃO DE INCIDENTES (NÍVEIS v7)

Nível	Definição	Ação

N1 – Suspeita	Comportamento anômalo	Monitorar + validar

N2 – Evento Incomum	Padrão de ataque detectado	Contenção inicial

N3 – Ataque Confirmado	Violação ativa	Bloqueio, isolamento, erradicação

N4 – Vazamento Crítico	Dados P3/P4 expostos ou comprometidos	Resposta corporativa + regulatória



Eventos podem escalar automaticamente quando indicadores cruzados atingem thresholds.



3\. SINTOMAS AVANÇADOS DE COMPROMETIMENTO

3.1 Infraestrutura



Logins SSH/RDP de IPs não autorizados



Alterações em /etc/passwd, sudoers, systemd



Processos novos desconhecidos



Binários alterados (hash mismatch)



Tráfego de saída para IPs maliciosos



Instalação suspeita de ferramentas (nmap, tshark, tcpdump)



3.2 Aplicação



Exploits de API (IDOR, SSRF, SQLi, LFI, brute-force)



Requests anômalos com payloads ofuscados



Padrões de varredura vertical/horizontal



Uploads maliciosos (webshells, files poluídos)



3.3 Dados



Downloads massivos de registros P3/P4



Consultas fora do padrão normal



Níveis anormais de “data\_access\_denied”



Tentativas reiteradas de acessar contas de terceiros



Alterações indevidas em registros financeiros



3.4 IAM (Integração)



Tokens suspeitos



Sessões múltiplas incompatíveis



Escopos elevados sem MFA



Acesso cross-user



Rotação falha de refresh tokens



3.5 Rede



Aumento abrupto de tráfego



Padrões de exfiltração (burst / stealth)



Comunicação com C2 (Command \& Control)



DNS tunneling ou conexões 443 desviadas



4\. DETECÇÃO AVANÇADA (N0)

4.1 APIs – Padrões Anômalos

SELECT user\_id,

&nbsp;      COUNT(\*) AS reqs,

&nbsp;      COUNT(DISTINCT endpoint) AS endpoints,

&nbsp;      MAX(created\_at) AS last\_seen

FROM api\_audit\_logs

WHERE created\_at > NOW() - INTERVAL '10 minutes'

GROUP BY user\_id

HAVING COUNT(\*) > 100

&nbsp;  OR COUNT(DISTINCT endpoint) > 20;



4.2 Monitoração de Dados Sensíveis

SELECT COUNT(\*) AS p3\_accesses,

&nbsp;      COUNT(DISTINCT user\_id) AS unique\_users

FROM data\_access\_logs

WHERE sensitivity\_level IN ('P3','P4')

AND created\_at > NOW() - INTERVAL '1 hour';



4.3 IAM – Tentativa de Escalada

SELECT user\_id, scopes

FROM tokens

WHERE scopes LIKE '%admin%'

AND mfa\_used = FALSE;



4.4 Infra – Processos Incomuns

ps aux | grep -v trusted\_processes.list



4.5 Rede – Padrões de Exfiltração

netstat -tunlp | grep -v known\_egress.list



5\. ANÁLISE FORENSE (N1–N2)

5.1 Behavioral Analysis



Detecção de scanning:



def detect\_scanning():

&nbsp;   suspicious = AuditLog.query.filter(

&nbsp;       AuditLog.user\_agent.ilike('%scanner%'),

&nbsp;       AuditLog.status\_code.in\_(\[404,403]),

&nbsp;       AuditLog.created\_at > datetime.utcnow() - timedelta(minutes=5)

&nbsp;   ).count()

&nbsp;   return suspicious > 50



5.2 Endpoint Abuse



Excesso de erros 4xx/5xx:



SELECT endpoint, COUNT(\*) 

FROM api\_audit\_logs

WHERE status\_code >= 400

AND created\_at > NOW() - INTERVAL '30 minutes'

GROUP BY endpoint

HAVING COUNT(\*) > 200;



5.3 Alterações indevidas

SELECT \*

FROM config\_changes

WHERE verified = FALSE

AND created\_at > NOW() - INTERVAL '24 hours';



5.4 Financial/Data Integrity Cross-Check

SELECT \*

FROM financial\_ledger

WHERE checksum != expected\_checksum;



5.5 IAM/Privacy Cross-Validation



Verificação de cross-user



Presença de PII em logs



Sessões incompatíveis



Token leakage



6\. RESPOSTA A INCIDENTES (N3–N4)

6.1 N3 – Ataque Confirmado

Contenção imediata (runbook automatizado)

./security-containment --block-ip $ATTACKER\_IP

./token-revoker --all-sessions --user=$COMPROMISED\_USER

./firewall-updater --emergency-rules

./isolate-service --name=affected-service



Ações obrigatórias:



Bloquear IP/ASN/país



Encerrar sessões e tokens



Desabilitar acessos externos ao serviço afetado



Elevar exigência de MFA global



Rotacionar chaves sensíveis



Ativar logging nível máximo para domínio afetado



6.2 N4 – Vazamento Crítico (P3/P4)



Gatilhos:



Dados pessoais sensíveis expostos



Dump completo de tabelas vazado



Exfiltração confirmada



Acesso cross-user massivo



Violação confirmada pela equipe forense



Ações imediatas:



Isolamento total do cluster afetado



Revogação de todas as credenciais



Bloqueio de exportações



Ativação do Modo Privacidade Máxima



Notificação ao DPO, Security, Legal, Executivos



Abertura de processo regulatório em até 72h (GDPR/LGPD)



Coleta forense imutável



Notificação aos usuários afetados



Análise de impacto global



Reforço de IAM e Privacy Framework



7\. PLAYBOOKS ESPECÍFICOS DE ATAQUE

7.1 SQL Injection Confirmado



Bloquear endpoint



Revogar tokens da sessão atacante



Reprocessar query logs



Conferir integridade de tabelas



Verificar exfiltração



Revisar validações ORM/API



Implementar WAF rules



7.2 Account Takeover (ATO)



Revogar todas as sessões do usuário



Forçar reset de senha + MFA obrigatório



Verificar mudanças de email/dispositivo



Auditar endpoints financeiros e IAM



Notificar o usuário



Confirmar se houve acesso a dados P3/P4



7.3 Exploração de API (IDOR/SSRF)



Bloquear endpoint ofensivo



Executar auditoria cruzada IAM+Privacy



Verificar exposure de dados PII



Reprocessar logs corretivamente



Revisar regras de autorização



Adicionar validações server-side



7.4 Upload Malicioso (Webshell / File Abuse)



Suspender upload service



Verificar storage buckets



Hash e verificar arquivos suspeitos



Remover binários alterados



Reforçar validação de upload



Atualizar antivirus/antimalware



7.5 Exfiltração de Dados



Cortar tráfego egress suspeito



Verificar Nó → IP internacional



Estimar volume exportado



Ativar Privacy Runbook N3/N4



Bloquear usuários/processos envolvidos



Notificar equipe regulatória



8\. CHECKLISTS

Diário



Zero erros anômalos no endpoint de autenticação



Zero acessos P3/P4 sem permissão



Alertas IAM/Privacy processados



Firewalls ativos



Tabelas financeiras íntegras



Nenhum processo suspeito



Semanal



Scan de vulnerabilidade



Testes IDOR/SSRF automatizados



Revisão de permissões



Auditoria de logs sensíveis



Teste anti-exfiltração



Mensal



Simulação de incidente (tabletop)



Teste de resposta completa N3→N4



Rotação de chaves



Hardening de serviços externos



Revalidação de fluxos sensíveis



9\. KPIs DE RESPOSTA

Métrica	Meta

MTTD	< 5 min

MTTR	< 15 min

Containment Success	100%

Data Integrity Loss	0

Token Compromise	0

Cross-User Exposure	0

Recovery Completeness	100%

10\. HARD STOPS (BLOQUEIOS AUTOMÁTICOS)



Ativar imediatamente quando:



Access cross-user confirmado



Acesso a P4 sem autorização



Vazamento detectado



SQLi confirmado



Exfiltração ativa



Webshell detectado



IAM comprometido



Qualquer tabela financeira adulterada



Ações:



Modo Read-Only



Firewall lockdown



MFA obrigatório global



Revogação total de sessões



Isolamento do cluster afetado



Notificação automática do Security Team



11\. COMUNICAÇÃO DE CRISE

Interna



Security Team → Engenharia → Executivos → Jurídico → Privacidade



Externa



Autoridades (72h regulatório)



Usuários afetados



Parceiros/fornecedores afetados



Nota técnica clara e factual



12\. DIAGRAMAS (ASCII)

12.1 Ciclo de Resposta

Detect → Validate → Contain → Isolate → Eradicate → Recover → Audit → Harden



12.2 Matriz N0–N4

N0: Alerts

N1: Validate

N2: Forensics

N3: Containment

N4: Regulatory



12.3 Fluxo de Ataque / Contenção

\[Attack] → \[Detection Engine] → \[IAM/Privacy Check] → \[Firewall] → \[Contain]



13\. HISTÓRICO



v7.24 — Revisão Completa



Expansão para padrão Enterprise



Matriz N0–N4 completa



Integração com IAM + Privacy + Financial



Playbooks por vetor de ataque



SQL avançado



Forense e comunicação formal incluídos

