PFS GERAL — FORTRESS v7.24

Especificação Funcional Global Consolidada (4A + 4B + 4C + 4D + 4E + 4F)

Enterprise Full-Stack Master Document

0\. PROPÓSITO DO DOCUMENTO



Este documento consolida toda a arquitetura funcional da plataforma Fortress, unificando:



PFS Geral (4A)



PFS Supermarket (4B)



Kernel Comportamental (4C)



Sistema de Notificações (4D)



Sistema de Insights (4E)



Sistema de Forecast \& Projeções (4F)



E integra ainda:



Regras de tom emocional



Natural Flow Engine



Anti-ruído



Regras de relevância



Estruturas JSON padronizadas



Interoperabilidade entre módulos



Critérios de aceite



NFRs e SLOs



Este é o documento-mãe absoluto, servindo como referência principal para:



Engenharia



Produto



UX Writing



Data Science



Marketing/Brand



Infra/DevOps



Cursor AI



Auditoria e Compliance



1\. VISÃO MACRO DO PRODUTO

1.1 O que é o Fortress v7.24



Fortress é um sistema de interpretação financeira comportamental, capaz de transformar dados brutos (compras, hábitos, eventos cotidianos) em:



clareza emocional



previsibilidade financeira



rotinas inteligentes



leitura cognitiva suave



insights interpretativos



previsões transparentes



notificações leves e não-invasivas



Ele não é um app de controle financeiro tradicional.

Ele não julga, não manda, não alerta, não instrui.

Ele executa interpretação humana + previsibilidade suave.



2\. PRINCÍPIOS FUNDAMENTAIS DO PRODUTO

2.1 Princípios Cognitivos



Interpretação > números



Contexto > instrução



Movimento > estado



Claridade > intensidade



Humanidade > precisão fria



Suavidade > urgência



2.2 Princípios Emocionais



Zero julgamento



Zero pressão



Zero comando



Zero alarme



Linguagem leve, neutra e respeitosa



“Duolingo-ish + racionalidade”



Reforço positivo real, nunca exagerado



2.3 Princípios Funcionais



Determinístico



Relevância baseada em matemática



Previsível e explicável



Zero comportamento imprevisível



Sem “surpresas” cognitivas ao usuário



3\. A ARQUITETURA GLOBAL DO FORTRESS v7.24



O sistema completo é formado por 6 grandes módulos, todos interconectados:



Supermarket (4B)

Entrada de dados: compras, OCR, listas, categorias, histórico.



Financial Brain (4A/4E/4F)

Interpretação matemática, padronização, variáveis, padrões, tendências.



Forecast (4F)

Projeções mensais, semanais, estabilidade, risco leve.



Insight Engine (4E)

Classificação em famílias, interpretação cognitiva padronizada.



Kernel Comportamental (4C)

Relevância, suavidade, cooldowns, anti-ruído, permissões.



Sistema de Notificações (4D)

Linguagem final, variação textual, escolhas de tom.



Todos os módulos escrevem e consomem dados de forma padronizada.



4\. COMO OS MÓDULOS FLUEM ENTRE SI (MAPA MENTAL)

4.1 Fluxo Mestre

Supermarket (4B)

      ↓

Financial Brain (4A)

      ↓

Forecast (4F)

      ↓

Insights (4E)

      ↓

Kernel (4C)

      ↓

Notificações (4D)

      ↓

Daily Console e UX Final



4.2 Princípio de Data Gravity



O módulo mais influente é o Supermarket, pois ele alimenta:



padrões



tendências



recorrências



previsões



insights



notificações



4.3 Transparência Cognitiva



Todo insight/notificação é construído respeitando:



observação → contexto → movimento → (reforço opcional)



5\. PERSONAS (OFICIAIS v7.24)

Persona A — O Ansioso Desorganizado



Tem medo de ver números



Quer previsibilidade emocional



O app precisa ser leve, calmo e reconfortante



Persona B — O Disciplinado Analítico



Quer previsões e dados



Espera consistência e explicabilidade



Persona C — O Emocional



Gasta por impulsos



Precisa de leituras suaves que organizem percepção



Persona D — O Minimalista



Quer o mínimo possível



Sem ruído, sem excesso



Essas personas influenciam:



suavidade



dinamismo textual



frequência de insights



reforço positivo



6\. VISÃO GLOBAL DOS TIPOS DE SINAIS



Toda a plataforma produz 4 grandes tipos de entregáveis cognitivos:



Leituras (observações rápidas)



Tendências (curtas e longas)



Desvios (previsto vs real)



Estabilidades (bons momentos)



Esses sinais alimentam:



Daily Console



Insights



notificações



metas



previsões



7\. MODELOS INTERNOS E VARIÁVEIS UNIVERSAIS



O sistema extrai variáveis padronizadas para todos os módulos:



7.1 Variáveis temporais



MA3



MA10



sazonalidade



volatilidade temporal



last\_purchase\_gap



recurrence\_score



7.2 Variáveis financeiras



impacto em % do mês



gasto médio diário



previsto mensal



previsto semanal



desvio (%)



curva diária



ritmo (spend/day)



picos e outliers



7.3 Variáveis de confiança



confidence



confidenceForecast



novelty



noise\_reduction



7.4 Variáveis do Kernel



relevância



suavidade



prioridade



cooldown



reforço permitido



Essas variáveis são a base matemático-comportamental.



8\. A ESTRUTURA PADRÃO DE UM INSIGHT GLOBAL



Independente da família, todo insight final precisa ter:



Insight {

  tipo: string,

  familia: string,

  nivel: 1..5,

  relevancia: 0..100,

  dado: string,

  interpretacao: string,

  tendencia: string,

  impacto: number,

  suavidade: 1..5

}





Elementos obrigatórios:



observação



contexto



movimento



frase emocionalmente segura



9\. ARQUITETURA DO NATURAL FLOW ENGINE



O Natural Flow Engine controla:



quando insights podem aparecer



quando notificações podem acontecer



se o usuário está recebendo ruído



se a plataforma está "falando demais"



Regras globais:



Insights similares → intervalo mínimo 72–120h



Reforço positivo → 1 vez por semana



Zero repetição textual em 7 dias



Eventos pequenos → consolidados



Tendências pequenas: apenas com consistência mínima



Evitar sequência de notificações em 48h



Essa engine é central para a experiência emocional segura.



10\. TOM DE VOZ GERAL (UNIVERSAL DO SISTEMA)



O sistema fala como:



um leitor calmo



observador gentil



racional



preciso sem ser frio



leve sem ser infantil



Palavras proibidas:



alerta



urgente



cuidado



perigo



você gastou demais



você deveria



Palavras recomendadas:



ritmo



movimento



padrão



estabilidade



tendência



suavidade



11\. LIMITES POR PLANO (NÍVEIS DE SUBSCRIÇÃO)

Sentinel



histórico 30 dias



projeções básicas



insights essenciais



sem reforço positivo



Vanguard



histórico 90 dias



notificações moderadas



capacidade completa de insights



Legacy



histórico completo



todos módulos full



suavidade dinâmica avançada



reforços positivos completos



12\. MÓDULO SUPERMARKET (PFS 4B)

O coração da entrada de dados comportamentais



O Supermarket é a camada primária de ingestão do Fortress v7.24.

Sem ele, não existe:



Forecast



Insights



Tendências



Padrões



Risco leve



Estabilidade



Ritmo



Kernel



Notificações



Ele representa a porta de entrada do mundo real → sistema cognitivo.



12.1 VISÃO DO SUPERMARKET



O Supermarket transforma compras, recibos, listas e itens em:



eventos comportamentais



insumos para projeções



sequências temporais



padrões de consumo



dados para detecção de recorrência



sinais de impacto no mês



Diferente de um app tradicional, ele não é um organizador de compras, mas sim um interpretador comportamental financeiro doméstico.



12.2 OBJETIVOS DO SUPERMARKET



Minimizar atrito na entrada de dados.



Interpretar compras como eventos cognitivos.



Classificar itens e categorias automaticamente.



Alimentar o Financial Brain com dados limpos.



Criar listas inteligentes baseadas em comportamento real.



Injetar eventos no Forecast \& Insights com precisão.



Garantir coerência temporal dos dados.



12.3 PERSONAS APLICADAS AO MÓDULO



Usuário Rápido — registra total e sai.



Usuário Precisão — ajusta itens, categorias e quantidades.



Usuário Checklist — usa listas inteligentes.



Usuário Improvisado — usa OCR para registrar tudo.



O sistema deve funcionar perfeitamente para todos os perfis.



12.4 FLUXO GLOBAL DO SUPERMARKET

Entrada → Normalização → Classificação → Impacto → Eventos → Brain → Forecast → Insights → Kernel → Notificação/Console



13\. REGISTRO DE COMPRAS (MANUAL)

13.1 Dados obrigatórios



total (em centavos)



timestamp (UTC)



13.2 Dados opcionais



itens



categorias



estabelecimento



notas rápidas



tags personalizadas



13.3 Regras fundamentais



Todo valor é armazenado em centavos.



Data sempre em UTC, conversão na camada de UX.



Itens podem ser deixados para “classificação posterior”.



Edição da compra permitida por 24h.



14\. REGISTRO VIA OCR (RECIBO)



OCR é um dos pilares do módulo.



14.1 Fluxo completo



Usuário envia foto



Sistema cria objeto ReceiptScan



Worker executa OCR (adapter Tesseract/Cloud Vision/etc.)



Parser extrai itens



Classificador tenta identificar categorias



Compra é criada como draft



Usuário revisa e confirma



14.2 Políticas de Confiança



Confiança < 0.60 → item entra como “sugerido”



Confiança ≥ 0.85 → item é auto-confirmado



Itens com baixa confiança pedem mínimo de interação



14.3 Campos extraídos

rawText

parsedItems\[]

confidence

timestamp

imageMetadata



15\. CLASSIFICAÇÃO DE ITENS



O sistema usa três camadas:



Lexical (nome → categoria)



Histórico do usuário



Heurística comportamental



Regras fundamentais:



Histórico sempre vence heurística.



Categorias customizadas podem sobrescrever sistema.



Nenhum item pode ficar sem categoria (usa fallback “uncategorized”).



16\. TAXONOMIA OFICIAL DE CATEGORIAS



Categorias base:



Hortifruti



Proteínas



Congelados



Laticínios



Padaria



Lanches



Bebidas



Limpeza



Higiene



Casa



Pets



Drogaria



Fitness



Cada categoria contém:



id

slug

isFitness: boolean

type: primary | secondary





Usuário pode criar categorias próprias (persistência local + remota).



17\. LISTAS E CHECKLISTS INTELIGENTES



Listas são elementos críticos para comportamento doméstico.



17.1 Tipos de listas



lista manual



lista modelo (templates)



lista inteligente (baseada em histórico + frequência + decay model)



17.2 Regras da lista inteligente



ordem por prioridade



inclui itens com base em:



frequência



últimos X dias



“para acabar” (via decay model)



marcação rápida



salvamento automático a cada ação



18\. ESTATÍSTICAS E ANÁLISES DO SUPERMARKET



O Supermarket produz suas próprias análises, que alimentam Forecast, Brain e Insights.



18.1 Indicadores gerais



variação por categoria



item com maior aumento de preço



quantidade de compras



impacto do mês



média por ida ao mercado



distribuição de categorias



sazonalidade por item



18.2 Estruturas temporais



janelas 30/90 dias



histórico completo para Legacy



gráficos de consumo



curvas semanais/mensais



19\. PREVISÕES ASSOCIADAS (MOTOR 4F)



Do Supermarket surgem sinais para o Forecast:



próxima compra esperada



impacto no mês



previsão de gasto semanal



itens “aproximando fim” (via decay)



Tudo isso é transformado em features para MA3/MA10 e variáveis de estabilidade.



20\. IMPACTO IMEDIATO NO MÊS



Toda compra reativa uma atualização automática:



recalcula previsão mensal



recalcula ritmo semanal



ajusta estabilidade



mede impacto acumulado



atualiza console



envia evento para Insights 4E



21\. LIMITES POR PLANO — SUPERMARKET

Sentinel



histórico 30 dias



10 OCR scans



listas simples



estatísticas básicas



Vanguard



histórico 90 dias



100 OCR scans



listas inteligentes



análises completas



Legacy



histórico completo



scans ilimitados



inteligência completa



previsões avançadas



22\. REQUISITOS FUNCIONAIS (FR)



FR1 — Registrar compra manualmente

FR2 — Registrar compra via OCR

FR3 — Classificar itens automaticamente

FR4 — Permitir edição por 24h

FR5 — Gerar lista inteligente

FR6 — Calcular impacto automaticamente

FR7 — Aplicar limites de plano



23\. REQUISITOS NÃO FUNCIONAIS (NFR)



NFR1 — OCR < 8 segundos

NFR2 — Classificação > 85% acurácia

NFR3 — UI responsiva < 50ms

NFR4 — Zero julgamento textual

NFR5 — Modelo determinístico



24\. CRITÉRIOS DE ACEITE (AC)



AC1 — OCR gera draft antes de confirmação

AC2 — Toda lista inteligente gera justificativa

AC3 — Categorias possuem slug único

AC4 — Previsões exibem nível de confiança

AC5 — Impacto mensal reflete imediatamente



25\. FINANCIAL BRAIN (4A)

O núcleo matemático e interpretativo do sistema



O Financial Brain é a camada onde todo dado do Supermarket é convertido em:



padrões



tendências



ritmo de gasto



estabilidade



desvios



previsões base



recálculo do mês



variação contextual



detecção de padrões fracos e fortes



Ele é o “motor interno” que alimenta Forecast, Insights e Kernel.



25.1 OBJETIVOS DO FINANCIAL BRAIN



Criar uma visão limpa e coerente do comportamento financeiro.



Reduzir ruído (picos, compras atípicas, outliers).



Medir ritmo e tendência com base em janelas temporais.



Interpretar o mês atual em “estado”.



Alimentar Forecast com dados científicos e estáveis.



Suprir Insights com sinais padronizados.



25.2 VARIÁVEIS FUNDAMENTAIS



As variáveis abaixo são obrigatórias:



25.2.1 Temporais



MA3 (média móvel de 3 dias)



MA10 (média móvel de 10 dias)



volatilidade (σ normalizada)



sazonalidade (curvas semanais)



recorrência (weekly, biweekly, monthly)



25.2.2 Financeiras



impactoAbsoluto



impactoRelativo



tendenciaMensal



ritmoSemanal



previstoBruto



previstoAjustado



desvioPercentual



desvioAcumulado



25.2.3 Cognitivas



confidence



consistencia



novidade



noise



suavidade



25.3 COMO O BRAIN INTERPRETA O MÊS



O mês nunca é tratado como “bom” ou “ruim”.

É tratado como um estado cognitivo e estatístico.



Existem seis estados:



Estável



Levemente acelerado



Acelerado



Neutro



Retrocedendo / Abrandando



Irregular



Cada estado produz consequências para Forecast e Insights.



25.4 DETECÇÃO DE COMPORTAMENTO



Toda compra é interpretada sob três ângulos:



25.4.1 Padrão



Se combina com histórico, frequência, categoria.



25.4.2 Tendência



Se existe sequência crescente ou decrescente.



25.4.3 Movimento



Se existe “evento atípico suave” — não tratado como problema.



25.5 MODELO DE DESVIO



Desvio é calculado como:



desvio = (real - previsto) / previsto





Interpretado não como erro, mas como movimento normal do mês.



Faixas:



|desvio| < 8% → insignificante



8–15% → leve



15–30% → relevante



30% → marcador cognitivo



25.6 IMPACTO NO BRAIN



Toda nova compra desencadeia:



Recalculo do previsto mensal



Atualização da curva semanal



Atualização do ritmo



Cálculo do impacto



Sinalização de estabilidade



Emissão de eventos para Insights



26\. PREVISÕES (FORECAST ENGINE — 4F)

O sistema completo de projeções do mês e semana



O Forecast Engine transforma dados do Brain em previsões:



previsão mensal



previsão semanal



previsão da próxima compra



probabilidade de estabilidade



nível de confiança



26.1 OBJETIVOS DO FORECAST ENGINE



Criar projeções calmas, não alarmistas.



Ser matematicamente sólido.



Ser completamente explicável.



Atualizar logicamente a cada evento.



Alimentar Insights com sinais prontos.



Funcionar mesmo com poucos dados.



26.2 TIPOS DE PREVISÃO

26.2.1 Previsão Mensal



Baseada em:



ritmo dos últimos 14 dias



recorrência média



sazonalidade familiar



impacto de itens dominantes



MA10



score de consistência



Entrega:



previstoMensal



confidence



desvioAtual



estado



26.2.2 Previsão Semanal



Baseada em:



curvas semanais anteriores



histórico de categorias da semana



impacto relativo



mudanças no comportamento recente



Entrega:



previstoSemanal



previstoRestante



tendenciaSemanal



nivelDeEstabilidade



26.2.3 Previsão de Próxima Compra



Baseada em:



periodicidade



last\_purchase\_gap



padrões pessoais



Entrega:



nextPurchaseInDays



confidenceForecast



26.3 MODELO DE NÍVEL DE CONFIANÇA



Faixas oficiais:



0.2–0.4 → confiança baixa



0.4–0.6 → confiança moderada



0.6–0.8 → confiança boa



0.8–1.0 → confiança excelente



Nunca usar linguagem ansiosa mesmo com baixa confiança.



26.4 DETECÇÃO DE ESTABILIDADE



O Forecast determina estabilidade não como “bom”, mas como:



ritmo suave



previsibilidade



baixa volatilidade



consistência natural



Faixas:



Estabilidade Alta → curva muito suave



Estabilidade Média → movimento padrão



Estabilidade Baixa → leve oscilação



Estabilidade Irregular → dispersão incomum



26.5 PREVISÃO + COMPORTAMENTO (HÍBRIDO)



O sistema combina fatores para gerar sinais híbridos:



desvio + estabilidade



ritmo + impacto



sazonalidade + consistência



categoria dominante + recorrência



Esses sinais alimentam famílias inteiras do módulo Insights.



26.6 EVENTOS EMITIDOS PELO FORECAST



Sempre que Forecast recalcula, emite eventos:



ForecastEvent {

  tipo

  previsto

  desvio

  estabilidade

  tendencia

  confidence

  timestamp

}





Esses eventos vão para:



Insight Engine



Kernel



Notificações



27\. CRITÉRIOS DE ACEITE — BRAIN E FORECAST



AC1 — Toda previsão mensal deve ter nível de confiança.

AC2 — Nenhuma previsão deve sugerir urgência.

AC3 — Estabilidade deve ser visualmente clara no console.

AC4 — Forecast deve atualizar em ≤ 700ms após nova compra.

AC5 — Desvio deve ser matematicamente rastreável.



28\. INSIGHT ENGINE (4E)

A camada interpretativa que transforma dados em leitura humana



O Insight Engine é o núcleo cognitivo do Fortress.

Ele pega:



sinais do Financial Brain



projeções do Forecast



padrões do Supermarket



estados mensais



desvios



estabilidade



recorrência



sazonalidade



E converte tudo isso em interpretação natural, sempre:



suave



respeitosa



contextual



objetiva, mas leve



com tom japonês de polidez passiva



O Insight Engine não dá ordens.

Ele não corrige o usuário.

Ele não avalia moralmente.

Ele interpreta com suavidade.



29\. OBJETIVOS DO INSIGHT ENGINE



Traduzir matemática em significado humano.



Evitar sobrecarga cognitiva.



Reduzir ansiedade ao interpretar finanças.



Identificar padrões de forma gentil.



Oferecer leituras emocionalmente seguras.



Criar movimento, não diagnóstico.



Ser consistente e explicável.



30\. TIPOS DE INSIGHT



Existem 5 tipos principais e todos seguem a mesma estrutura.



30.1 Observação



Leitura simples baseada em um único evento.



30.2 Padrão



Detecta repetição ou comportamento recorrente.



30.3 Tendência



Detecta movimento sustentado em direção crescente ou decrescente.



30.4 Estabilidade



Detecta suavidade e consistência.



30.5 Movimento



Quando algo fora do padrão aparece, mas não representa problema.



31\. FAMÍLIAS DE INSIGHTS (OFICIAIS 4E)

31.1 Família A — Ritmo do Mês



Detecta como o mês está se comportando:



suavidade



ritmo



impacto



curva



estado mensal



consistência



Exemplo de frase (suave):



“O ritmo do mês está seguindo um movimento calmo e bem distribuído.”



31.2 Família B — Curva Semanal



Analisa comportamento das semanas:



picos



dispersão



concentração



variação natural



Exemplo:



“A semana mostrou um movimento um pouco mais concentrado em dois dias, algo dentro do comportamento natural.”



31.3 Família C — Categorias Dominantes



Analisa proporção da categoria no mês:



variação



crescimento



estabilidade



sazonalidade



Exemplo:



“A categoria de hortifruti movimentou uma parte maior do mês, algo comum nos últimos ciclos.”



31.4 Família D — Movimento de Preço



Baseado em variações de itens:



aumentos



reduções



oscilações suaves



Exemplo:



“Alguns itens tiveram um leve aumento natural de preço, nada fora do movimento esperado.”



31.5 Família E — Recorrência



Detecta periodicidade:



semanal



quinzenal



mensal



irregular



Exemplo:



“Esse item costuma aparecer com certa regularidade, e agora está seguindo um movimento parecido.”



31.6 Família F — Estabilidade e Confiança



Baseada no Forecast:



estabilidade



volatilidade



confiança da previsão



Exemplo:



“O mês mostra uma estabilidade confortável, com boas chances de manter esse movimento.”



31.7 Família G — Impacto Leve



Interpreta o impacto da compra:



impacto relativo



impacto acumulado



impacto mensal



Exemplo:



“Essa compra movimentou uma parte pequena do mês, algo dentro do comportamento natural.”



31.8 Família H — Comportamento de Longo Prazo



Analisa mais de 90 dias:



padrões amplos



sazonalidade



curvas de longo ciclo



Exemplo:



“Nos últimos meses, aparece um movimento parecido em certas semanas.”



31.9 Família I — Insights Híbridos



Combinam dois sistemas:



ritmo + estabilidade



impacto + consistência



recorrência + tendência



Exemplo:



“O ritmo do mês segue estável, mesmo com pequenas variações naturais.”



32\. ESTRUTURA INTERNA DE UM INSIGHT



Todos seguem:



Insight {

  tipo: Observacao | Padrao | Tendencia | Estabilidade | Movimento,

  familia: string,

  nivel: 1..5,

  relevancia: 0..100,

  dado: string,

  interpretacao: string,

  movimento: string,

  impacto: number,

  suavidade: 1..5

}



Explicação dos campos



tipo → classifica a natureza



familia → define impacto semântico



nivel → quão forte é o padrão



relevancia → Kernel usa para priorizar



dado → qual dado originou



interpretacao → frase humana final



movimento → tendência ou estabilidade



impacto → impacto percentual no mês



suavidade → garante tom calmo



33\. NÍVEIS DE INSIGHT

Nível 1 — Observação leve



Pequena leitura.



Nível 2 — Padrão suave



Duas ocorrências próximas.



Nível 3 — Tendência



Três ou mais ocorrências.



Nível 4 — Movimento relevante



Algo que altera o rumo do mês.



Nível 5 — Macrocomportamento



Fenômeno de longo prazo.



34\. RELEVÂNCIA (PESO PARA O KERNEL)



A relevância é:



relevancia = f(impactoRelativo, potenciaDoPadrão, estabilidade, consistencia)





Faixas:



0–20 → baixa



20–40 → moderada



40–60 → média



60–80 → relevante



80–100 → alta



O Kernel usa esta relevância para decidir:



se o insight aparece



quando aparece



se vira notificação ou não



35\. REGRAS DE SUAVIDADE (TOM DE VOZ)



A suavidade define como o insight fala.



Suavidade 1 — Muito Calmo



Eventos pequenos sem impacto.



Suavidade 2 — Calmo e Básico



Padrões simples.



Suavidade 3 — Neutro e Racional



Padrões moderados, previsões ajustadas.



Suavidade 4 — Sinal de Movimento Claro



Algo está se movendo de fato, mas sem urgência.



Suavidade 5 — Movimento marcante, porém suave



Impacto real, comunicação mínima.



36\. PROCESSO DE GERAÇÃO DE INSIGHT



O Insight Engine segue 6 etapas:



Recebe sinais do Brain e Forecast



Normaliza e filtra ruído



Identifica famílias possíveis



Escolhe tipo e nível



Aplica regras de suavidade



Constrói mensagem humana final



37\. FILTROS DE RUÍDO



Antes de virar insight, o sinal passa por:



Filtro 1: Desvio insignificante



Se < 8%, geralmente ignorado.



Filtro 2: Evento pequeno



Compra muito pequena → não vira insight.



Filtro 3: Padrão fraco



Menos de 2 ocorrências → não vira tendência.



Filtro 4: Repetição



Insight semelhante nos últimos 72h é bloqueado.



Filtro 5: Relevância baixa



Relevância < 12 → não emitido.



38\. ESTRUTURA TEXTUAL FINAL



Todos os insights obedecem:



\[observação neutra]

\[contexto tranquilo]

\[interpretação suave]

\[fechamento leve opcional]





Exemplo:



“Essa compra segue um movimento natural no seu mês, com um impacto leve e dentro do padrão que você costuma ter.”



39\. LIMITES POR PLANO

Sentinel



até 10 insights / mês



só níveis 1 e 2



Vanguard



até 25 insights / mês



níveis 1 até 4



Legacy



ilimitado



níveis 1–5



insights híbridos ativados



40\. CRITÉRIOS DE ACEITE



AC1 — Insight nunca pode gerar ansiedade.

AC2 — Toda interpretação deve ser rastreável por dados reais.

AC3 — Suavidade sempre aplicada.

AC4 — Repetição bloqueada por 72–120h.

AC5 — Famílias devem seguir a taxonomia oficial.



41\. O KERNEL COMPORTAMENTAL (4C)

O regulador central de tudo que o usuário recebe



O Kernel Comportamental é o árbitro final do sistema.

É ele quem decide:



o que aparece



quando aparece



o que não deve aparecer



o que fica em silêncio



qual suavidade deve ser aplicada



como organizar movimentos repetitivos



como evitar excesso de ruído



Se o Financial Brain é o motor, o Forecast é o mapa e o Insight Engine é o intérprete, o Kernel é o diplomata.



Ele é responsável por garantir:



consistência



calma



confiança



previsibilidade emocional



zero sobrecarga



42\. OBJETIVOS DO KERNEL



Reduzir ruído cognitivo.



Controlar sequência de mensagens.



Evitar repetição e redundância.



Priorizar eventos realmente relevantes.



Modular suavidade e tom.



Garantir coerência entre módulos.



Proteger a experiência emocional.



43\. MECANISMOS DO KERNEL



O Kernel funciona através de 5 mecanismos centrais:



Relevância



Prioridade



Cooldowns



Bloqueio por repetição



Regra de Suavidade Dinâmica



Cada mecanismo age antes do Insight ou Notificação aparecer para o usuário.



44\. MECANISMO 1 — RELEVÂNCIA



Relevância é o peso numérico que define a importância de um insight ou evento.



44.1 Faixas oficiais



0–20 → irrelevante



20–40 → leve



40–60 → média



60–80 → relevante



80–100 → muito relevante



44.2 Consequências

Relevância	Ação

0–20	descartado

20–40	só aparece no console

40–60	elegível para insight

60–80	insight provável

80–100	insight + possível notificação

45\. MECANISMO 2 — PRIORIDADE



Prioridade organiza eventos simultâneos.



Faixas:



Alta (A)



Média (B)



Baixa (C)



Regra:



O Kernel nunca entrega dois eventos A em menos de 24h.



46\. MECANISMO 3 — COOLDOWNS



O Kernel usa cool-downs para impedir repetição e overload.



46.1 Regras gerais



Insights do mesmo tipo → mínimo 72–120h



Insights da mesma família → 48–72h



Notificações → mínimo 48h



Reforço positivo → 1 por semana



Insights híbridos → respeitam cooldown individual dos dois tipos envolvidos



46.2 Cooldown de compra



Após uma compra, o sistema pode emitir no máximo 1 insight por evento.



47\. MECANISMO 4 — BLOQUEIO POR REPETIÇÃO



Regras:



Não repetir a mesma frase por 7 dias.



Não repetir a mesma estrutura por 72h.



Não repetir a mesma família por 48h.



Se o evento parecer idêntico, o Kernel silenciosamente descarta.



48\. MECANISMO 5 — SUAVIDADE DINÂMICA



O Kernel ajusta a suavidade final com base em:



impacto



estabilidade



relevância



padrão



estado do mês



frequência recente de mensagens



Faixas



Suavidade 1 — leve, quase silenciosa

Suavidade 2 — calma

Suavidade 3 — neutra e estável

Suavidade 4 — movimento claro

Suavidade 5 — impacto real, mas sempre suave



Regra:



Mesmo suavidade 5 nunca pode gerar ansiedade.



49\. PROCESSO DECISÓRIO DO KERNEL



O Kernel executa 4 etapas:



Etapa 1 — Recepção



Recebe:



sinais do Insight Engine



eventos do Forecast



eventos do Brain



notificações candidatas



Etapa 2 — Filtragem



Aplica:



relevância



repetição



recência



ruído



impacto



Etapa 3 — Harmonização



Reorganiza tudo de acordo com prioridades e cooldowns.



Etapa 4 — Emissão



Entrega:



insight (console)



insight + notificação



silêncio (descartado)



50\. REGRAS DE HARMONIZAÇÃO

50.1 Duas mensagens simultâneas



O Kernel sempre entrega apenas uma:



escolhe a de maior relevância



a outra é adiada ou descartada



50.2 Eventos pequenos



São consolidados em:



“Movimento leve e natural no seu mês.”



50.3 Eventos repetitivos



Agrupa em tendência.



51\. REGRAS DE PREVENÇÃO DE RUÍDO



Nunca mostrar dois insights do mesmo tipo em 24h.



Nunca mostrar dois eventos sem impacto.



Nunca mandar insight imediatamente após outro sem relevância.



Nunca empilhar notificações.



52\. VARIÁVEIS INTERNAS DO KERNEL

KernelState {

  lastInsightOfType\[]

  lastInsightOfFamily\[]

  lastNotificationTimestamp

  lastPositiveReinforcement

  dailyInsightCount

  weeklyReinforcementCount

  silentModeActive

}



53\. INTEGRAÇÃO COM O INSIGHT ENGINE



O Insight Engine produz mensagens, mas o Kernel decide:



deixar passar



adiar



descartar



transformar em tendência



alterar suavidade



promover para notificação



É o Kernel que impede comportamentos indesejados.



54\. LIMITES POR PLANO — KERNEL

Sentinel



máximo 2 insights/dia



máximo 5/semana



sem híbridos



Vanguard



máximo 4 insights/dia



máximo 12/semana



híbridos moderados



Legacy



ilimitado



híbridos completos



suavidade dinâmica avançada



55\. CRITÉRIOS DE ACEITE



AC1 — Kernel nunca deve gerar ansiedade.

AC2 — Nenhum insight pode furar os cooldowns.

AC3 — Bloqueio de repetição sempre aplicado.

AC4 — Suavidade deve respeitar impacto e contexto.

AC5 — Notificações devem seguir limites de frequência.



56\. SISTEMA DE NOTIFICAÇÕES (4D)

A camada que transforma interpretação em presença leve e gentil



O Sistema de Notificações é responsável por:



entregar mensagens contextuais



manter a experiência suave



evitar ruídos e interrupções desnecessárias



conversar com o usuário de forma educada



preservar a calma e a previsibilidade emocional



harmonizar toda a vivência da plataforma



Ele é o ponto onde o usuário mais sente a presença da plataforma.

Por isso, este módulo segue as regras mais restritas de toda a suíte.



57\. OBJETIVOS DO SISTEMA DE NOTIFICAÇÕES



Ser útil, mas nunca intrusivo.



Ser suave, mas nunca vago.



Ser presente, mas nunca insistente.



Ser informativo, mas nunca controlador.



Agir com calma e leveza.



Priorizar a saúde emocional do usuário.



58\. TIPOS DE NOTIFICAÇÃO



Existem 4 tipos principais:



58.1 Notificação de Observação



Baseada em um único evento:



“Movimento leve registrado no seu mês.”



58.2 Notificação de Tendência



Baseada em um padrão contínuo:



“Sua semana está seguindo um movimento um pouco mais concentrado.”



58.3 Notificação de Estabilidade



Quando o sistema detecta calmaria:



“O ritmo do mês está seguindo um caminho suave.”



58.4 Notificação Híbrida



Combina Forecast + Insight:



“Mesmo com pequenas oscilações, o mês segue com boa estabilidade.”



59\. O SISTEMA DE GATILHOS



Para que uma notificação seja enviada, tudo a seguir deve ser verdadeiro:



O Insight Engine gerou algo elegível



O Kernel liberou (relevância + cooldown + suavidade)



Não existe conflito com notificações recentes



A mensagem traz algum valor real



A mensagem não viola o tom emocional



A mensagem não repete nada dos últimos 7 dias



60\. REGRAS DE FREQUÊNCIA (AS MAIS IMPORTANTES)

60.1 Frequência Máxima



Nunca mais de 1 notificação em 24h



Ideal: 1 a cada 48–72 horas



60.2 Limites por plano

Sentinel



4 notificações por mês



Vanguard



12 notificações por mês



Legacy



ilimitado (mas respeitando frequência emocional)



60.3 Notificações só podem aparecer se:



não houve insight forte recente



o usuário não acabou de registrar uma compra



não existe cooldown ativo



61\. TOM DE VOZ DAS NOTIFICAÇÕES



As notificações seguem o tom japonês de polidez passiva.

Nada direto, nada imperativo, nada que possa soar como cobrança.



61.1 Princípios do tom



gentil



calmo



observador



quase documental



nunca emocional demais



nunca moralista



nunca dando ordens



61.2 Palavras proibidas



alerta



urgente



atenção



cuidado



evite



não faça



deveria



controle



61.3 Formato correto



“Parece que seu mês está seguindo um ritmo um pouco mais concentrado.”



“O movimento dessa semana ficou um pouco mais estável.”



“O impacto recente parece ter sido leve e dentro do padrão.”



“Tudo indica um movimento suave no seu mês.”



62\. ESTRUTURA INTERNA DE UMA NOTIFICAÇÃO



Toda notificação segue sempre:



Notificacao {

  tipo

  suavidade

  relevancia

  familia

  mensagem

  timestamp

  origem (insight|forecast|supermarket)

}



63\. REGRAS DE COMPOSIÇÃO TEXTUAL



Toda notificação deve seguir esta estrutura mínima:



Observação suave



Contexto leve e racional



Fechamento curto e calmo



Exemplo estruturado:



Observação: “Surgiu um movimento leve no seu mês.”

Contexto: “Ele está dentro da faixa normal dos últimos ciclos.”

Fechamento: “Tudo indica que segue no ritmo natural.”



64\. INTEGRAÇÃO COM O KERNEL



O Kernel controla:



relevância mínima para notificar



cooldown de 48h



suavidade final



bloqueio de repetição



prioridade



O Kernel pode:



Promover um insight para notificação



Rebaixar para console apenas



Ajustar suavidade



Silenciar totalmente



65\. NOTIFICAÇÕES SILENCIADAS (SILENT MODE)



O sistema ativa modo silencioso se:



houve 2 insights nas últimas 48h



o usuário fez muitas compras no mesmo dia



o mês tem volatilidade alta



relevância geral está baixa



Silent Mode desliga notificações por 72h.



66\. NOTIFICAÇÕES DOMÉSTICAS (BASEADAS EM SUPERMARKET)



São notificações leves e comportamentais:



tendência de categoria



recorrência semanal



concentração de compras



movimento irregular suave



impacto acumulado



Exemplos:



“Sua semana teve um leve movimento concentrado em um dia.”

“Certas categorias apareceram um pouco mais nesta fase.”

“Parece que a última compra teve um impacto pequeno no mês.”



67\. NOTIFICAÇÕES BASEADAS EM FORECAST



São notificações muito sutis:



“Suas projeções para o mês seguem estáveis.”

“A estimativa da semana está com boa consistência.”



68\. NOTIFICAÇÕES ESPECIAIS LEGACY



Usuários Legacy têm acesso a:



notificações híbridas



estabilidade avançada



projeções semanais dinâmicas



suavidade adaptativa



Exemplos:



“Mesmo com pequenas variações, as projeções mostram uma boa estabilidade neste ciclo.”



69\. CRITÉRIOS DE ACEITE — NOTIFICAÇÕES



AC1 — Notificação nunca pode soar como comando.

AC2 — Deve seguir suavidade 1–3 para maioria dos casos.

AC3 — Nunca repetir estrutura por 7 dias.

AC4 — Jamais ultrapassar 1 notificação/24h.

AC5 — Mensagem precisa ser rastreável ao insight ou forecast.



70\. CONTRATOS JSON (OFICIAIS v7.24)



A seguir estão os contratos formais usados entre módulos (Supermarket → Brain → Forecast → Insights → Kernel → Notificações).



Todos são contratos internos — usados entre serviços, workers e a camada cognitiva.



70.1 Contrato de Compra (Supermarket → Brain)

PurchaseEvent {

&nbsp; id: string,

&nbsp; amount: number,                      // em centavos

&nbsp; timestamp: string,                   // UTC ISO

&nbsp; category: string,                    // slug

&nbsp; items: PurchaseItem\[],

&nbsp; recurrenceScore: number,             // 0..1

&nbsp; context: {

&nbsp;   weekday: number,

&nbsp;   hour: number,

&nbsp;   isHoliday: boolean

&nbsp; }

}



PurchaseItem {

&nbsp; name: string,

&nbsp; category: string,

&nbsp; price: number,

&nbsp; quantity: number,

&nbsp; confidence: number

}



70.2 Contrato de Estado do Mês (Brain → Forecast)

MonthState {

&nbsp; totalGasto: number,

&nbsp; impactoRelativo: number,

&nbsp; ritmoDiario: number,

&nbsp; tendencia: "suave" | "neutro" | "concentrado" | "acelerado",

&nbsp; estabilidade: "alta" | "media" | "baixa" | "irregular",

&nbsp; ma3: number,

&nbsp; ma10: number,

&nbsp; volatilidade: number,

&nbsp; consistencia: number,

&nbsp; sazonalidade: number,

&nbsp; desvioAtual: number

}



70.3 Contrato de Previsão (Forecast → Insights)

ForecastEvent {

&nbsp; previstoMensal: number,

&nbsp; previstoSemanal: number,

&nbsp; previstoRestante: number,

&nbsp; nextPurchaseInDays: number,

&nbsp; confidence: number,

&nbsp; tendenciaSemanal: string,

&nbsp; estabilidade: string,

&nbsp; desvioPercentual: number,

&nbsp; timestamp: string

}



70.4 Contrato de Insight (Insights → Kernel)

Insight {

&nbsp; id: string,

&nbsp; tipo: "Observacao" | "Padrao" | "Tendencia" | "Estabilidade" | "Movimento",

&nbsp; familia: string,

&nbsp; nivel: number,

&nbsp; relevancia: number,

&nbsp; dado: string,

&nbsp; movimento: string,

&nbsp; interpretacao: string,

&nbsp; suavidade: number,

&nbsp; impacto: number,

&nbsp; timestamp: string

}



70.5 Contrato de Notificação (Kernel → Delivery)

Notification {

&nbsp; id: string,

&nbsp; origem: "insight" | "forecast" | "supermarket",

&nbsp; tipo: string,

&nbsp; familia: string,

&nbsp; mensagem: string,

&nbsp; relevancia: number,

&nbsp; suavidade: number,

&nbsp; timestamp: string

}



71\. EXEMPLOS COMPLETOS (PONTA A PONTA)



Aqui estão exemplos reais do fluxo completo do sistema, da compra bruta até a notificação final.



71.1 Caso Completo 1 — Compra Simples (Impacto Leve)

(1) Usuário faz compra

{ amount: 18990, category: "hortifruti" }



(2) Brain interpreta



impactoRelativo = 3%



estabilidade = alta



desvioAtual = 1.4%



(3) Forecast atualiza

previstoMensal: 420000

confidence: 0.74

estabilidade: "alta"



(4) Insight Engine gera

tipo: "Observacao"

familia: "Impacto Leve"

nivel: 1

interpretacao: "Essa compra teve um impacto leve e dentro do padrão natural do mês."

suavidade: 1



(5) Kernel valida



relevância baixa → aparece no console



não vira notificação



71.2 Caso Completo 2 — Compras Concentradas na Semana

(1) Histórico da semana



3 compras em 3 dias consecutivos.



(2) Brain detecta padrão



concentração acima do normal



ritmo semanal cresce 14%



MA3 > MA10



(3) Forecast

tendenciaSemanal: "concentrada"

estabilidade: "media"



(4) Insight Engine

tipo: "Tendencia"

familia: "Curva Semanal"

nivel: 3

interpretacao: "A semana ficou um pouco mais concentrada em alguns dias, algo que já ocorreu em ciclos anteriores."

suavidade: 2



(5) Kernel



relevância média-alta



cooldown ok



sem repetição nas últimas 72h



→ vira notificação



Mensagem final:



“Sua semana mostrou um movimento um pouco mais concentrado nesses dias, algo dentro do natural.”



71.3 Caso Completo 3 — Estabilidade Forte

(1) Brain



baixa volatilidade



MA3 ≈ MA10



curva suave



(2) Forecast

estabilidade: "alta"

confidence: 0.92



(3) Insight Engine

tipo: "Estabilidade"

familia: "Estabilidade e Confiança"

nivel: 3

interpretacao: "O mês segue com uma estabilidade confortável e previsível."

suavidade: 3



(4) Kernel



Relevância alta → elegível para notificação

Mas o Kernel reduz para console se há uma notificação recente (<48h).



72\. CRITÉRIOS GLOBAIS DE ACEITE (MASTER)



Nenhum insight pode gerar ansiedade.



Nenhum módulo pode emitir algo não rastreável.



Toda previsão precisa de nível de confiança.



Toda notificação precisa seguir tom japonês suave.



Cooldowns são inquebráveis.



Nenhum texto pode acusar, julgar ou instruir.



Kernel nunca entrega 2 mensagens fortes em <24h.



Padrões só viram tendência com ≥3 ocorrências.



Desvio < 8% nunca vira insight.



Nada pode contradizer o Console Diario.



73\. OBSERVABILIDADE \& TELEMETRIA



O sistema coleta apenas telemetria funcional, nunca comportamental sensível.



73.1 Métricas críticas



latência de OCR



latência do Forecast



profundidade de histórico



precisão da curva semanal



estabilidade mensal



quantidade de eventos descartados pelo Kernel



quantidade de insights emitidos



quantidade de notificações enviadas



repetição textual bloqueada



precisão de classificação de itens



73.2 Logs estruturados



Eventos importantes:



kernel.reject

kernel.cooldown

kernel.promote

insight.create

forecast.recalculated

supermarket.purchase



73.3 Alertas internos (não para usuário)



queda de confiança < 0.35



aumento brusco de volatilidade



falha na cadeia Brain → Forecast



74\. FINALIZAÇÃO DO DOCUMENTO — INTEGRAÇÃO GERAL



Este documento é o PFS Mestre Consolidado v7.24.

Ele unifica todos os módulos:



4A — Financial Brain



4B — Supermarket



4C — Kernel



4D — Notificações



4E — Insights



4F — Forecast



E estabelece:



arquitetura



métodos



tom



regras



limites



critérios



contratos



governança cognitiva



Com isso, você tem o documento-mãe absoluto da plataforma, pronto para:



Cursor



engenharia



produto



data science



UX writing



comunicação



QA



auditoria

