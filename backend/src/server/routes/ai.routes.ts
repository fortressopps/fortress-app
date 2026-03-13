import { Hono } from 'hono'
import Anthropic from '@anthropic-ai/sdk'

const ai = new Hono()

ai.post('/analyze', async (c) => {
  try {
    const body = await c.req.json()
    const { income, food, transport, health, leisure, others, goal, unexpected, currencyCode, currencySymbol } = body
    const sym = currencySymbol || 'R$'

    if (!income || !goal) {
      return c.json({ error: 'income and goal are required' }, 400)
    }

    const totalExpenses = [food, transport, health, leisure, others]
      .map(Number)
      .reduce((a, b) => a + b, 0)

    const savingsRate = income > 0
      ? Math.round(((Number(income) - totalExpenses) / Number(income)) * 100)
      : 0

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Você é o sistema de inteligência financeira do Fortress, um app de finanças pessoais.

Analise os dados financeiros abaixo e gere um relatório personalizado em JSON.

DADOS DO USUÁRIO:
- Renda mensal: ${sym} ${income}
- Gastos mensais:
  - Alimentação: ${sym} ${food || 0}
  - Transporte: ${sym} ${transport || 0}
  - Saúde: ${sym} ${health || 0}
  - Lazer: ${sym} ${leisure || 0}
  - Outros: ${sym} ${others || 0}
- Total de gastos: ${sym} ${totalExpenses}
- Saldo restante: ${sym} ${Number(income) - totalExpenses}
- Taxa de economia: ${savingsRate}%
- Meta declarada: "${goal}"
- Gasto inesperado: "${unexpected || 'Nenhum informado'}"

Responda EXCLUSIVAMENTE com um objeto JSON válido, sem markdown, sem backticks, sem texto fora do JSON:

{
  "profileName": "Nome do perfil (2-3 palavras, ex: Construtor Cauteloso)",
  "profileDescription": "Descrição do comportamento em 2 frases diretas e honestas",
  "spendingAnalysis": {
    "positive": "O que está fazendo bem (1-2 frases)",
    "warning": "Principal problema nos gastos (1-2 frases)"
  },
  "goals": [
    {
      "title": "Título da meta",
      "description": "Como atingir com valores reais em ${currencyCode || 'BRL'}",
      "monthlyAmount": 0,
      "timelineMonths": 0
    },
    {
      "title": "Título da meta 2",
      "description": "Como atingir com valores reais em ${currencyCode || 'BRL'}",
      "monthlyAmount": 0,
      "timelineMonths": 0
    },
    {
      "title": "Título da meta 3",
      "description": "Como atingir com valores reais em ${currencyCode || 'BRL'}",
      "monthlyAmount": 0,
      "timelineMonths": 0
    }
  ],
  "mainAlert": "Insight crítico mais importante para esse perfil (1-2 frases impactantes e específicas aos números)"
}

Use os números reais fornecidos. Seja específico com valores em ${sym}. Não seja genérico.`
      }]
    })

    const text = (message.content[0] as { type: string; text: string }).text.trim()
    const cleanText = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleanText)
    return c.json(parsed)

  } catch (err) {
    console.error('AI analyze error:', JSON.stringify(err))
    return c.json({ error: 'Failed to analyze' }, 500)
  }
})

export default ai
