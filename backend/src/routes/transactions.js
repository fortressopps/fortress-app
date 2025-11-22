const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// Schema de validação para transações
const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime(),
  tags: z.array(z.string()).optional(),
  accountId: z.string().cuid(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.string().optional()
});

// Schema para filtros
const transactionFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  accountId: z.string().cuid().optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional()
});

// GET /transactions - Listar transações com filtros
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id; // Assumindo que middleware de auth já setou req.user

    // Validar filtros da query string
    const filters = transactionFiltersSchema.parse({
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
      accountId: req.query.accountId,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      type: req.query.type
    });

    const skip = (filters.page - 1) * filters.limit;

    // Construir where clause baseado nos filtros
    const where = {
      userId,
      ...(filters.accountId && { accountId: filters.accountId }),
      ...(filters.category && { category: filters.category }),
      ...(filters.type && { type: filters.type }),
      ...(filters.startDate && filters.endDate && {
        date: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate)
        }
      })
    };

    // Buscar transações e total
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: { 
              name: true, 
              color: true,
              institution: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: filters.limit
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    });

  } catch (error) {
    console.error('[TRANSACTIONS_GET]', error);
    
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        success: false,
        error: 'Dados de filtro inválidos',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /transactions - Criar nova transação
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Validar dados da requisição
    const validatedData = transactionSchema.parse(req.body);

    // Criar transação
    const transaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        userId
      },
      include: {
        account: {
          select: { 
            name: true, 
            color: true,
            institution: true
          }
        }
      }
    });

    // Atualizar saldo da conta
    await updateAccountBalance(validatedData.accountId);

    res.status(201).json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('[TRANSACTIONS_POST]', error);
    
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Função para atualizar saldo da conta
async function updateAccountBalance(accountId) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        transactions: true
      }
    });

    if (!account) return;

    // Calcular novo saldo baseado em todas as transações
    const balance = account.transactions.reduce((total, transaction) => {
      if (transaction.type === 'INCOME') {
        return total + transaction.amount;
      } else if (transaction.type === 'EXPENSE') {
        return total - transaction.amount;
      }
      // TRANSFER não altera o saldo total
      return total;
    }, 0);

    // Atualizar conta
    await prisma.account.update({
      where: { id: accountId },
      data: { balance }
    });

  } catch (error) {
    console.error('[UPDATE_ACCOUNT_BALANCE]', error);
  }
}

module.exports = router;