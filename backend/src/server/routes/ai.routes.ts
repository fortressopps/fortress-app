import { Hono } from 'hono'
import Anthropic from '@anthropic-ai/sdk'
import { authMiddleware, AuthVariables } from '../../middleware/auth'
import { prisma } from '../../libs/prisma'
import { v4 as uuid } from 'uuid'

const ai = new Hono<{ Variables: AuthVariables }>()

ai.post('/analyze', authMiddleware, async (c) => {
  const user = c.get('user')
  const requestId = uuid()

  // 1. Verificar verificação de e-mail
  if (!user.emailVerified) {
    return c.json({ 
      request_id: requestId, 
      user_id: user.id, 
      plan: user.tier,
      email_verified: false,
      report_status: 'blocked', 
      message_to_user: 'AGUARDANDO_VERIFICACAO_EMAIL' 
    }, 403)
  }

  // 2. Verificar limites de plano
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const usageCount = await prisma.aIUsageLog.count({
    where: {
      userId: user.id,
      createdAt: { gte: startOfMonth },
      status: 'COMPLETED'
    }
  })

  const limit = user.tier === 'VANGUARD' ? 200 : 5
  if (usageCount >= limit) {
    return c.json({ 
      request_id: requestId, 
      user_id: user.id, 
      report_status: 'failed', 
      message_to_user: `LIMITE_${user.tier}_EXCEDIDO` 
    }, 429)
  }

  try {
    const body = await c.req.json()
    const { 
      income, food, transport, health, leisure, others, 
      goal, unexpected, currencyCode, currencySymbol 
    } = body
    const sym = currencySymbol || 'R$'

    if (!income || !goal) {
      return c.json({ error: 'PARAMETRO_FALTANDO' }, 400)
    }

    const totalExpenses = [food, transport, health, leisure, others]
      .map(Number)
      .reduce((a, b) => a + b, 0)

    const savingsRate = income > 0
      ? Math.round(((Number(income) - totalExpenses) / Number(income)) * 100)
      : 0

    const client = new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY as string) })
    const startTime = Date.now()

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Você é Kernel, o sistema de inteligência financeira do Fortress.
Sua missão é gerar um relatório de alta eficiência de tokens e precisão matemática.

DADOS:
- Nome: ${user.name || 'Usuário'}
- Renda: ${sym} ${income}
- Gastos: Alimentação(${sym}${food}), Transp(${sym}${transport}), Saúde(${sym}${health}), Lazer(${sym}${leisure}), Outros(${sym}${others})
- Meta: "${goal}"
- Extra: "${unexpected || 'Nenhum'}"

REGRAS DE RESPOSTA (ESTRITAMENTE NESTA ORDEM):
1. Sumário Executivo: 1 frase curta (máx 20 palavras).
2. Destaques: Exatamente 3 bullets (máx 12 palavras cada).
3. DETALHES: Bloco com exatas 6 frases curtas sobre os números reais.

Responda EXCLUSIVAMENTE com um JSON estruturado:
{
  "profileName": "Adjetivo + Substantivo",
  "profileEmoji": "1 emoji",
  "savingsHealth": "low" | "medium" | "high" | "deficit",
  "reportSummary": "1 frase curta",
  "highlights": ["bullet 1", "bullet 2", "bullet 3"],
  "details": ["frase 1", "frase 2", "frase 3", "frase 4", "frase 5", "frase 6"],
  "goals": [
    { "title": "Meta 1", "monthlyAmount": 0, "timelineMonths": 0, "description": "Resumo" },
    { "title": "Meta 2", "monthlyAmount": 0, "timelineMonths": 0, "description": "Resumo" },
    { "title": "Meta 3", "monthlyAmount": 0, "timelineMonths": 0, "description": "Resumo" }
  ],
  "lockedInsights": [
    "Insight incompleto sobre [tema relevante aos dados]...",
    "Insight incompleto sobre [tema relevante aos dados]...",
    "Insight incompleto sobre [tema relevante aos dados]..."
  ],
  "mainAlert": "Insight crítico com ${sym}",
  "scoreLabel": 0-100
}`
      }]
    })

    const latencyMs = Date.now() - startTime
    const text = (message.content[0] as { type: string; text: string }).text.trim()
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())

    // Estimativa de tokens e custos (Regra 4)
    const tokensIn = message.usage.input_tokens
    const tokensOut = message.usage.output_tokens
    const totalTokens = tokensIn + tokensOut
    const costUsd = (tokensIn * 0.000003) + (tokensOut * 0.000015) // Tarifas Claude 3.5 Sonnet aprox.
    const costBrl = costUsd * 5 // Regra 4: R$ 5,00/USD

    // Logar (Regra 6)
    await prisma.aIUsageLog.create({
      data: {
        requestId,
        userId: user.id,
        action: 'generate_report',
        plan: user.tier,
        emailVerified: user.emailVerified,
        status: 'COMPLETED',
        tokensUsed: totalTokens,
        costUsd,
        costBrl,
        latencyMs,
        reportUrl: `/api/ai/reports/${requestId}`
      }
    })

    return c.json({
      request_id: requestId,
      user_id: user.id,
      plan: user.tier,
      email_verified: user.emailVerified,
      report_status: 'completed',
      report_url: `/api/ai/reports/${requestId}`,
      token_estimate: totalTokens,
      cost_estimate_usd: Number(costUsd.toFixed(4)),
      cost_estimate_brl: Number(costBrl.toFixed(2)),
      message_to_user: `Olá ${user.name?.split(' ')[0] || 'usuário'}, seu relatório (ID ${requestId}) está pronto. Acesse: /api/ai/reports/${requestId}. Bem-vindo à Fortress.`,
      report: parsed
    })

  } catch (err: any) {
    console.error('AI analyze error:', err)
    await prisma.aIUsageLog.create({
      data: {
        requestId,
        userId: user.id,
        action: 'generate_report',
        plan: user.tier,
        emailVerified: user.emailVerified,
        status: 'FAILED',
        error: err.message
      }
    })
    return c.json({ 
      request_id: requestId, 
      user_id: user.id,
      plan: user.tier,
      email_verified: user.emailVerified,
      report_status: 'failed',
      message_to_user: `Olá ${user.name?.split(' ')[0] || 'usuário'}, houve um problema no relatório (ID ${requestId}). Tente novamente mais tarde.` 
    }, 500)
  }
})

export default ai
