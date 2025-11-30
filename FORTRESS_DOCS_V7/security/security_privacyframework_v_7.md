Security \& Privacy Framework v7.24



Fortress Enterprise Edition

Última atualização: 2025-11-29

Documento oficial de Governança, Controles, Segurança, Privacidade e Continuidade



1\. PROPÓSITO DO DOCUMENTO



Este documento define os princípios, políticas, padrões, regras, diretrizes e procedimentos oficiais que regem todos os aspectos de Segurança e Privacidade dentro do ecossistema Fortress.



Esse framework é a fonte única da verdade (SSOT) para:



Engenharia



Produto



Operações



Segurança



Auditoria



Suporte



Compliance



Ele estabelece:



Como projetar segurança



Como implementar segurança



Como validar segurança



Como monitorar segurança



Como reagir a incidentes



Como proteger identidades e dados



Como garantir privacidade ativa



Como assegurar continuidade do sistema



2\. PRINCÍPIOS MESTRES v7 (Método Fortress)



O Método v7 aplica 7 pilares obrigatórios para todos os documentos estratégicos.

Abaixo está a versão estendida desses pilares aplicados especificamente a Segurança \& Privacidade.



2.1 P1 — Simplicidade Estrutural



Apesar da profundidade técnica, as regras devem ser:



claras



inequívocas



não ambíguas



aplicáveis por qualquer equipe



O framework v7 elimina redundâncias e evita termos que permitam múltiplas interpretações.



2.2 P2 — Arquitetura Determinística



Para segurança, isso significa:



Toda decisão deve ser previsível.



Nada depende da interpretação pessoal do desenvolvedor.



Nenhuma feature pode ser implementada sem passar pelo fluxo de segurança definido.



2.3 P3 — Segurança Como Comportamento



No Método v7:



Segurança não é um módulo.



Segurança é um comportamento operacional contínuo, reflexo do design.



Isso implica:



Cada microserviço é responsável por validar contextos.



Cada componente executa suas próprias garantias.



Nada é presumido “seguro”.



2.4 P4 — Observabilidade Absoluta



Uma feature só existe se puder ser observada.

Uma ação só é confiável se puder ser rastreada.



Portanto:



Segurança = capacidade de provar o que aconteceu.



Logs ≠ opcional



Telemetria ≠ opcional



Auditoria ≠ opcional



2.5 P5 — Privacy by Design



Conceito expandido no Método v7:



Privacidade começa antes de qualquer linha de código.



Decisões técnicas devem proteger o usuário até mesmo contra o próprio desenvolvedor.



Dados não devem existir se não forem absolutamente necessários.



2.6 P6 — Defesa Profunda Estratificada



Cada camada opera independentemente proporcionando:



contenção



redundância



validação



auditoria



As 7 camadas mínimas exigidas pelo Método v7:



Edge



API Gateway



BFF ou Orquestrador



Aplicação



Persistência



Nível Privilegiado



Observabilidade



Cada uma deve ter controles próprios.



2.7 P7 — Governança e Ciclicidade Permanente



Segurança nunca é concluída.

Ela apenas muda de estado.



O método exige ciclos de:



revisão



auditoria



maturação



automação



Em intervalos predefinidos: semanal, mensal e trimestral.



3\. CLASSIFICAÇÃO DE DADOS (Versão Estendida)



A classificação segue o padrão Fortress Data Tier v7.24.



3.1 Níveis oficiais

Nível	Nome	Impacto se vazado	Exemplo

P0	Público	Nenhum	Conteúdo institucional

P1	Interno	Baixo	Logs simplificados

P2	Sensível	Moderado	Preferências, hábitos

P3	Crítico	Alto	Movimentações financeiras

P4	Ultra-Crítico	Extremo	Tokens, chaves, identidade + dinheiro

3.2 Regras detalhadas por nível

P2 — Sensível



Nunca aparece em logs brutos



Sempre anonimizado quando exibido



Persistência deve usar criptografia simétrica



API nunca devolve sem mascaramento



P3 — Crítico



Regras estendidas:



Exigência de assinatura digital interna



Carimbo de tempo de origem



Entrada obrigatória em trilha imutável



Obrigatório uso de enclave lógico



P4 — Ultra-Crítico



Regras estendidas:



Jamais trafega em texto plano



Rotação automática semanal



Alto custo de acesso (multifator + política de sessão curta)



Política de segregação operacional: ninguém tem acesso total



4\. CRIPTOGRAFIA (Versão Estendida)



Abaixo, o detalhamento completo dos controles de criptografia exigidos pelo Método v7.



4.1 Criptografia em trânsito



TLS 1.3



Cipher suites modernas (AES-GCM ou CHACHA20)



Rejeição automática de downgrade



HSTS ativo



Revalidação de certificado: diária



4.2 Criptografia em repouso



Obrigação: AES-256-GCM em todos os níveis P2+.

Para bancos:



TDE por padrão



Camadas lógicas com chaves únicas por tabela sensível



Derivação de chave independente por ambiente



4.3 Hashing



Argon2id



256MB RAM



3 iterações



threads paralelos = 4



4.4 Gestão de segredos



Seguindo o padrão v7:



Segredos nunca no repositório



Segredos nunca em .env



Segredos nunca em Dockerfile



Vault centralizado (HashiVault ou compatível)



TTL curto



Renovação automática



Registros de acesso imutáveis



5\. IDENTITY \& ACCESS MANAGEMENT (Versão Estendida)



IAM no método v7 é considerado núcleo da arquitetura, não módulo complementar.



5.1 Princípios



Menor privilégio absoluto



Permissões explícitas, nunca implícitas



Identidades efêmeras sempre que possível



Permissões não são herdadas automaticamente



Revalidação contínua de contexto



5.2 Modelo IAM v7



Combina:



RBAC (papéis)



ABAC (atributos)



PBAC (permissions-based control)



Behavioral Auth (contexto comportamental)



5.3 Sessões



Sessões seguem:



expiração curta



rotação automática



revogação instantânea



rastreabilidade



assinatura interna



5.4 Identidades de Serviço



SPIFFE/SPIRE como padrão



Mutual TLS obrigatório



Policies assinadas



Identidades renovadas automaticamente



6\. ARQUITETURA DE SEGURANÇA (Versão Estendida)



A arquitetura Fortress é Zero Trust + Defense-in-Depth + Observabilidade Total.



6.1 Camada Edge



WAF nível 7 com regras adaptadas



Firewall de comportamento



Detecção precoce de automação maliciosa



Limitação por padrão (rate limit adaptativo)



6.2 API Gateway



JWT curto



Validação de escopo



Validação de claims



Reemissão obrigatória a cada transição crítica



6.3 Backend (microserviços)



Sem comunicação direta sem mTLS



Sem confiança entre serviços



Cada serviço valida seu input



Cada serviço valida seu estado



Cada serviço assina suas respostas



6.4 Storage



Políticas de acesso restritivas



Acesso apenas por microserviço dono



Restrições de leitura e escrita separadas



Auditoria completa



6.5 Auditoria Estrutural



Trilha imutável



Assinatura criptográfica



Redundância em 3 zonas



Validação periódica



7\. OBSERVABILIDADE \& AUDITORIA (Versão Estendida)



Observabilidade é pilar obrigatório do Método v7.



7.1 Logging



Logs assinados



Logs segregados por sensibilidade



Logs não podem conter dados sensíveis



Máscara automática em tempo real



7.2 Telemetria



Métricas de segurança ativas



Coleta comportamental



Marcadores para fraude



Anomalias detectadas em até 5 segundos



7.3 Auditoria



Auditoria contínua



Jobs diários de verificação



Jobs semanais de consistência



Jobs mensais de integridade criptográfica



8\. PRIVACIDADE (Versão Estendida)



Aqui está a versão expandida das regras de privacidade exigidas pelo Método v7.



8.1 Princípios



Minimização



Clareza



Finalidade legítima



Consentimento explícito onde necessário



Facilitação da exclusão



Portabilidade garantida



8.2 Privacidade no Produto



Notificações devem:



Nunca acusar o usuário diretamente



Ser sempre suaves e indiretas



Usar estilo japonês “neutro e gentil”



Misturar leveza inspirada no Duolingo



Mas sem infantilizar o tema financeiro



Exemplos indiretos:



“Talvez seja interessante revisar este comportamento recente.”



“Pode ser útil dar uma olhada nos seus limites definidos.”



8.3 Retenção e Exclusão

Retenção:



Operacional: 12 meses



Perfil: permanente até exclusão



Logs: 24 meses



Exclusão (obrigatório):



Processo irreversível



2 etapas: intenção + confirmação



Senha + segundo fator



Imediata revogação de tokens



9\. THREAT MODELING (Versão Estendida)



Framework: STRIDE + Fortress Extended Misuse



9.1 Ameaças gerais



Spoofing



Tampering



Repudiation



Information Disclosure



DoS



Elevação de privilégio



9.2 Ameaças específicas Fortress



Manipulação de hábitos financeiros



Fraudes comportamentais sutis



Tentativa de confundir o motor emocional



Forçar alertas falsos



Bypass de limites de gasto



Geração de perfis artificiais



10\. TESTES DE SEGURANÇA (Versão Estendida)



SAST completo



DAST contínuo



Pentest trimestral



Pentest externo anual



Simulações de abuso



Testes de estresse comportamental



Revisões de dependências críticas



11\. INCIDENT MANAGEMENT (Versão Estendida)



4 níveis:



N1 — suspeita



N2 — evento incomum



N3 — ataque



N4 — vazamento crítico



Fluxo:



Detectar



Conter



Analisar



Erradicar



Recuperar



Pós-mortem



Auditoria reforçada



12\. SECURE SDLC v7 (Versão Estendida)

12.1 Design



threat modeling



mapeamento de superfícies



validação de dados



12.2 Desenvolvimento



scanning automático



políticas contínuas



PR com verificação crítica



12.3 Testes



testes de abuso



testes de fraude



testes de integridade



12.4 Deploy



validação de IAM



verificação de segredos



sanity checks comportamentais



12.5 Monitoramento



alertas



telemetria



recomendações automáticas



13\. CONTINUIDADE (Versão Estendida)



Failover multi-zona



Snapshots horários



Teste de restauração semanal



RTO: 15 minutos



RPO: 5 minutos



14\. MATRIZ RACI



(alinhada com o padrão v7 — igual à versão reduzida, porém expandida)



15\. ANEXOS



Headers obrigatórios



Políticas de token



Checklists oficiais

