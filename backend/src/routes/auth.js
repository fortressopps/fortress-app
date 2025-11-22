import express from 'express';
import { clerkClient, getAuth } from '@clerk/express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticação para a versão atual do Clerk
const requireAuth = (req, res, next) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado',
      message: 'Autenticação requerida'
    });
  }
  
  req.auth = { userId };
  next();
};

// ==================== 🎯 ROTAS DE AUTENTICAÇÃO COMPLETAS ====================

// GET /api/auth/me - Obter dados do usuário autenticado
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    console.log('🔐 Buscando usuário:', userId);

    // Buscar ou criar usuário no nosso banco
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    });

    // Se usuário não existe no nosso banco, criar
    if (!user) {
      console.log('👤 Criando novo usuário no banco:', userId);
      
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        
        user = await prisma.user.create({
          data: {
            id: userId,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Usuário',
            planType: 'SENTINEL',
            lastLoginAt: new Date()
          },
          select: {
            id: true,
            email: true,
            name: true,
            planType: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true
          }
        });
        
        console.log('✅ Usuário criado com sucesso:', user.id);
      } catch (clerkError) {
        console.error('❌ Erro ao buscar usuário do Clerk:', clerkError);
        
        // Fallback: criar usuário básico
        user = await prisma.user.create({
          data: {
            id: userId,
            email: 'user@example.com',
            name: 'Usuário',
            planType: 'SENTINEL',
            lastLoginAt: new Date()
          },
          select: {
            id: true,
            email: true,
            name: true,
            planType: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true
          }
        });
      }
    } else {
      // Atualizar último login
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() }
      });
    }

    res.json({
      success: true,
      data: {
        user,
        session: {
          userId: req.auth.userId,
          status: 'active'
        }
      }
    });

  } catch (error) {
    console.error('[AUTH_ME]', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados do usuário'
    });
  }
});

// POST /api/auth/sync-user - Sincronizar dados do usuário (para webhooks)
router.post('/sync-user', async (req, res) => {
  try {
    const { user_id, email_addresses, first_name, last_name } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
    }

    const user = await prisma.user.upsert({
      where: { id: user_id },
      update: {
        email: email_addresses?.[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim() || 'Usuário',
        updatedAt: new Date()
      },
      create: {
        id: user_id,
        email: email_addresses?.[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim() || 'Usuário',
        planType: 'SENTINEL'
      }
    });

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('[AUTH_SYNC_USER]', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao sincronizar usuário'
    });
  }
});

// GET /api/auth/session - Verificar sessão
router.get('/session', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      session: {
        userId: req.auth.userId,
        status: 'active'
      }
    }
  });
});

// POST /api/auth/upgrade-plan - Upgrade de plano
router.post('/upgrade-plan', requireAuth, async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.auth.userId;

    if (!['SENTINEL', 'VANGUARD', 'LEGACY'].includes(planType)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de plano inválido'
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { planType },
      select: {
        id: true,
        email: true,
        name: true,
        planType: true
      }
    });

    res.json({
      success: true,
      data: user,
      message: `Plano atualizado para ${planType}`
    });

  } catch (error) {
    console.error('[AUTH_UPGRADE_PLAN]', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar plano'
    });
  }
});

// GET /api/auth/limits - Obter limites do plano atual
router.get('/limits', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const PLAN_LIMITS = {
      SENTINEL: {
        accounts: 3,
        transactionsPerMonth: 100,
        supermarketLists: 1,
        supermarketItemsPerList: 50,
        budgets: 3,
        exportFormats: ['PDF'],
        support: 'Comunidade',
        analyticsRetention: '30 dias'
      },
      VANGUARD: {
        accounts: Infinity,
        transactionsPerMonth: Infinity,
        supermarketLists: Infinity,
        supermarketItemsPerList: 200,
        budgets: 20,
        exportFormats: ['PDF', 'Excel', 'CSV'],
        support: 'Email Prioritário',
        analyticsRetention: '90 dias'
      },
      LEGACY: {
        accounts: Infinity,
        transactionsPerMonth: Infinity,
        supermarketLists: Infinity,
        supermarketItemsPerList: Infinity,
        budgets: Infinity,
        exportFormats: ['PDF', 'Excel', 'CSV', 'JSON'],
        support: 'Dedicado',
        analyticsRetention: '365 dias'
      }
    };

    res.json({
      success: true,
      data: {
        planType: user.planType,
        limits: PLAN_LIMITS[user.planType]
      }
    });

  } catch (error) {
    console.error('[AUTH_LIMITS]', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar limites'
    });
  }
});

// Rota pública para health check da auth
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API está funcionando',
    timestamp: new Date().toISOString()
  });
});

export default router;