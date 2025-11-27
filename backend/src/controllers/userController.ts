/* FORTRESS ENTERPRISE AUTO-CONVERTED: userController.js */

// backend/src/controllers/userController.js
import User from '../models/User';
import SupermarketList from '../models/SupermarketList';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private
export const getDashboard = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Buscar dados em paralelo para performance
  const [
    user,
    supermarketLists,
    activeLists,
    completedLists
  ] = await Promise.all([
    User.findById(userId),
    SupermarketList.find({ userId }),
    SupermarketList.find({ userId, isActive: true }),
    SupermarketList.find({ userId, isActive: false })
  ]);

  // Calcular métricas do supermarket
  const totalSupermarketSavings = completedLists.reduce((sum, list) => 
    sum + (list.savings || 0), 0
  );

  const totalSupermarketSpent = completedLists.reduce((sum, list) => 
    sum + (list.totalActual || 0), 0
  );

  // Preparar dados do dashboard
  const dashboardData = {
    user: {
      name: user.name,
      email: user.email,
      plan: user.plan,
      joinDate: user.createdAt
    },
    metrics: {
      supermarket: {
        totalLists: supermarketLists.length,
        activeLists: activeLists.length,
        completedLists: completedLists.length,
        totalSavings: totalSupermarketSavings,
        totalSpent: totalSupermarketSpent,
        savingsPercentage: totalSupermarketSpent > 0 ? 
          ((totalSupermarketSavings / totalSupermarketSpent) * 100).toFixed(1) : 0
      },
      // 🚧 Placeholder para futuros módulos
      budget: {
        activeBudgets: 0,
        monthlyLimit: 0,
        spent: 0,
        remaining: 0
      },
      bills: {
        pending: 0,
        paid: 0,
        overdue: 0
      },
      investments: {
        portfolioValue: 0,
        totalReturn: 0
      }
    },
    battleReport: user.battleReport || {
      territorioDefendido: 0,
      missoesConcluidas: 0,
      recursosCapturados: 0,
      rank: 'Recruta'
    },
    quickActions: [
      {
        title: 'Criar Lista de Compras',
        description: 'Iniciar nova missão de supermercado',
        icon: '🛒',
        action: 'create_supermarket_list',
        url: '/api/supermarket/lists'
      },
      {
        title: 'Ver Economia',
        description: `R$ ${totalSupermarketSavings.toFixed(2)} economizados`,
        icon: '💰',
        action: 'view_savings',
        url: '/api/supermarket/analytics'
      }
    ],
    recentActivity: [
      // Atividade recente será populada com os últimos eventos
      ...completedLists.slice(0, 3).map(list => ({
        type: 'supermarket_completed',
        title: `Lista "${list.listName}" finalizada`,
        description: `Economia: R$ ${list.savings.toFixed(2)}`,
        date: list.completedAt,
        icon: '✅'
      }))
    ]
  };

  res.status(200).json({
    status: 'success',
    message: 'Dashboard carregado com sucesso!',
    data: {
      dashboard: dashboardData
    }
  });
});

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        monthlyLimits: user.monthlyLimits,
        metrics: user.metrics,
        battleReport: user.battleReport,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// @desc    Update user profile
// @route   PATCH /api/user/profile
// @access  Private
export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  // Verificar se email já existe (excluindo o usuário atual)
  if (email) {
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return next(new AppError('Este email já está em uso por outro usuário.', 400));
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      ...(name && { name }),
      ...(email && { email })
    },
    { 
      new: true,
      runValidators: true 
    }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    message: 'Perfil atualizado com sucesso!',
    data: {
      user: updatedUser
    }
  });
});

// @desc    Get user metrics
// @route   GET /api/user/metrics
// @access  Private
export const getMetrics = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const [
    supermarketLists,
    completedLists
  ] = await Promise.all([
    SupermarketList.find({ userId }),
    SupermarketList.find({ userId, isActive: false })
  ]);

  const metrics = {
    supermarket: {
      totalLists: supermarketLists.length,
      completedLists: completedLists.length,
      totalSavings: completedLists.reduce((sum, list) => sum + (list.savings || 0), 0),
      averageSavings: completedLists.length > 0 ? 
        completedLists.reduce((sum, list) => sum + (list.savings || 0), 0) / completedLists.length : 0,
      favoriteCategories: getFavoriteCategories(completedLists)
    },
    // 🚧 Placeholders para futuros módulos
    budget: {
      totalBudgets: 0,
      averageSpending: 0,
      savingsRate: 0
    },
    bills: {
      totalPaid: 0,
      onTimeRate: 0
    }
  };

  res.status(200).json({
    status: 'success',
    data: {
      metrics
    }
  });
});

// @desc    Get user battle report
// @route   GET /api/user/battle-report
// @access  Private
export const getBattleReport = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  const battleReport = {
    ...user.battleReport,
    rank: calculateRank(user.battleReport.territorioDefendido),
    nextRank: getNextRank(user.battleReport.territorioDefendido),
    progress: calculateRankProgress(user.battleReport.territorioDefendido)
  };

  res.status(200).json({
    status: 'success',
    data: {
      battleReport
    }
  });
});

// ==================== 🎯 HELPER FUNCTIONS ====================

const getFavoriteCategories = (lists) => {
  const categories = {};
  lists.forEach(list => {
    list.items.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
  });

  return Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category, count]) => ({ category, count }));
};

const calculateRank = (territory) => {
  if (territory >= 10000) return '🏰 General';
  if (territory >= 5000) return '🛡️ Coronel';
  if (territory >= 2500) return '⚔️ Major';
  if (territory >= 1000) return '🎯 Capitão';
  if (territory >= 500) return '🎖️ Tenente';
  if (territory >= 250) return '⭐ Sargento';
  if (territory >= 100) return '🔰 Cabo';
  return '🎖️ Recruta';
};

const getNextRank = (territory) => {
  const ranks = [
    { threshold: 100, rank: '🔰 Cabo' },
    { threshold: 250, rank: '⭐ Sargento' },
    { threshold: 500, rank: '🎖️ Tenente' },
    { threshold: 1000, rank: '🎯 Capitão' },
    { threshold: 2500, rank: '⚔️ Major' },
    { threshold: 5000, rank: '🛡️ Coronel' },
    { threshold: 10000, rank: '🏰 General' }
  ];

  const currentRankIndex = ranks.findIndex(rank => territory < rank.threshold);
  return currentRankIndex >= 0 ? ranks[currentRankIndex] : null;
};

const calculateRankProgress = (territory) => {
  const nextRank = getNextRank(territory);
  if (!nextRank) return 100; // Máximo rank alcançado

  const previousRank = nextRank.threshold === 100 ? 0 : 
    [100, 250, 500, 1000, 2500, 5000, 10000][
      [100, 250, 500, 1000, 2500, 5000, 10000].indexOf(nextRank.threshold) - 1
    ];

  const progress = ((territory - previousRank) / (nextRank.threshold - previousRank)) * 100;
  return Math.min(100, Math.max(0, progress));
};