const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// Schema de validação para contas
const accountSchema = z.object({
  name: z.string().min(1, 'Nome da conta é obrigatório'),
  type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT', 'INVESTMENT', 'CASH', 'OTHER']),
  balance: z.number().default(0),
  currency: z.string().default('BRL'),
  institution: z.string().optional(),
  color: z.string().default('#6b7280'),
  isActive: z.boolean().default(true)
});

// GET /accounts - Listar todas as contas do usuário
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id; // Assumindo que middleware de auth já setou req.user

    const accounts = await prisma.account.findMany({
      where: { userId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 5 // Últimas 5 transações
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: accounts
    });

  } catch (error) {
    console.error('[ACCOUNTS_GET]', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /accounts/:id - Obter uma conta específica
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: { 
        id, 
        userId 
      },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 20 // Últimas 20 transações
        }
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Conta não encontrada'
      });
    }

    res.json({
      success: true,
      data: account
    });

  } catch (error) {
    console.error('[ACCOUNTS_GET_BY_ID]', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /accounts - Criar nova conta
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const validatedData = accountSchema.parse(req.body);

    const account = await prisma.account.create({
      data: {
        ...validatedData,
        userId
      }
    });

    res.status(201).json({
      success: true,
      data: account
    });

  } catch (error) {
    console.error('[ACCOUNTS_POST]', error);
    
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

// PUT /accounts/:id - Atualizar conta
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const validatedData = accountSchema.partial().parse(req.body);

    // Verificar se a conta pertence ao usuário
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId }
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        error: 'Conta não encontrada'
      });
    }

    const account = await prisma.account.update({
      where: { id },
      data: validatedData
    });

    res.json({
      success: true,
      data: account
    });

  } catch (error) {
    console.error('[ACCOUNTS_PUT]', error);
    
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

// DELETE /accounts/:id - Deletar conta
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar se a conta pertence ao usuário
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId }
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        error: 'Conta não encontrada'
      });
    }

    // Verificar se existem transações associadas
    const transactionCount = await prisma.transaction.count({
      where: { accountId: id }
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar uma conta com transações associadas'
      });
    }

    await prisma.account.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Conta deletada com sucesso'
    });

  } catch (error) {
    console.error('[ACCOUNTS_DELETE]', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /accounts/:id/transactions - Listar transações de uma conta
router.get('/:id/transactions', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar se a conta pertence ao usuário
    const account = await prisma.account.findFirst({
      where: { id, userId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Conta não encontrada'
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: { accountId: id },
      include: {
        account: {
          select: { name: true, color: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('[ACCOUNTS_TRANSACTIONS_GET]', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /accounts/:id/balance - Obter saldo atualizado
router.get('/:id/balance', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar se a conta pertence ao usuário
    const account = await prisma.account.findFirst({
      where: { id, userId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Conta não encontrada'
      });
    }

    // Recalcular saldo baseado em todas as transações
    const transactions = await prisma.transaction.findMany({
      where: { accountId: id }
    });

    const balance = transactions.reduce((total, transaction) => {
      if (transaction.type === 'INCOME') {
        return total + transaction.amount;
      } else if (transaction.type === 'EXPENSE') {
        return total - transaction.amount;
      }
      return total;
    }, 0);

    // Atualizar saldo na conta se necessário
    if (account.balance !== balance) {
      await prisma.account.update({
        where: { id },
        data: { balance }
      });
    }

    res.json({
      success: true,
      data: { balance }
    });

  } catch (error) {
    console.error('[ACCOUNTS_BALANCE_GET]', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;