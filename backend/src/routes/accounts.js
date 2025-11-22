import express from 'express';
import { prisma } from '../lib/db.js';

const router = express.Router();

// GET - Listar todas as contas do usuário
router.get('/', async (req, res) => {
  try {
    // TODO: Implementar autenticação
    const userId = "user-temporario"; // Temporário - vamos implementar auth depois
    
    const accounts = await prisma.account.findMany({
      where: {
        userId: userId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: accounts
    });

  } catch (error) {
    console.error('[ACCOUNTS_GET]', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST - Criar nova conta
router.post('/', async (req, res) => {
  try {
    const { name, type, balance, institution, color } = req.body;
    
    // TODO: Implementar autenticação
    const userId = "user-temporario";

    // Validação básica
    if (!name || !type) {
      return res.status(400).json({
        error: 'Nome e tipo são obrigatórios'
      });
    }

    // Criar conta
    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: balance || 0,
        currency: 'BRL',
        institution,
        color: color || '#6b7280',
        userId
      }
    });

    res.status(201).json({
      success: true,
      data: account,
      message: 'Conta criada com sucesso'
    });

  } catch (error) {
    console.error('[ACCOUNTS_POST]', error);
    res.status(500).json({
      error: 'Erro ao criar conta'
    });
  }
});

export default router;
