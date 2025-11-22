// ~/fortress-app/backend/src/controllers/supermarketController.js
import SupermarketList from '../models/SupermarketList.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// @desc    Create new supermarket list
// @route   POST /api/supermarket/lists
// @access  Private
export const createList = catchAsync(async (req, res, next) => {
  const { listName, items } = req.body;
  
  // Verificar limite do plano
  const userListsCount = await SupermarketList.countDocuments({ userId: req.user.id, isActive: true });
  const userLimit = req.user.monthlyLimits.supermarketLists;
  
  if (userListsCount >= userLimit && req.user.plan === 'sentinel') {
    return next(new AppError(`Limite de ${userLimit} listas atingido para o plano Sentinel. Faça upgrade para criar mais listas.`, 400));
  }

  const supermarketList = await SupermarketList.create({
    userId: req.user.id,
    listName: listName || 'Minha Lista de Compras',
    items: items || []
  });

  // Atualizar métricas do usuário
  req.user.metrics.supermarketLists += 1;
  await req.user.save();

  res.status(201).json({
    status: 'success',
    message: 'Lista de compras criada com sucesso!',
    data: {
      list: supermarketList
    }
  });
});

// @desc    Get all user's supermarket lists
// @route   GET /api/supermarket/lists
// @access  Private
export const getLists = catchAsync(async (req, res, next) => {
  const lists = await SupermarketList.find({ userId: req.user.id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: lists.length,
    data: {
      lists
    }
  });
});

// @desc    Get single supermarket list
// @route   GET /api/supermarket/lists/:id
// @access  Private
export const getList = catchAsync(async (req, res, next) => {
  const list = await SupermarketList.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!list) {
    return next(new AppError('Lista de compras não encontrada', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      list
    }
  });
});

// @desc    Update supermarket list
// @route   PATCH /api/supermarket/lists/:id
// @access  Private
export const updateList = catchAsync(async (req, res, next) => {
  const { listName, items } = req.body;
  
  const list = await SupermarketList.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    {
      ...(listName && { listName }),
      ...(items && { items })
    },
    { new: true, runValidators: true }
  );

  if (!list) {
    return next(new AppError('Lista de compras não encontrada', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Lista atualizada com sucesso!',
    data: {
      list
    }
  });
});

// @desc    Add item to supermarket list
// @route   POST /api/supermarket/lists/:id/items
// @access  Private
export const addItem = catchAsync(async (req, res, next) => {
  const { name, category, quantity, estimatedPrice, unit } = req.body;
  
  const list = await SupermarketList.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!list) {
    return next(new AppError('Lista de compras não encontrada', 404));
  }

  list.items.push({
    name,
    category: category || 'outros',
    quantity: quantity || 1,
    estimatedPrice,
    unit: unit || 'un'
  });

  await list.save();

  res.status(200).json({
    status: 'success',
    message: 'Item adicionado à lista!',
    data: {
      list
    }
  });
});

// @desc    Mark item as purchased
// @route   PATCH /api/supermarket/lists/:listId/items/:itemId
// @access  Private
export const markItemPurchased = catchAsync(async (req, res, next) => {
  const { actualPrice, store } = req.body;
  
  const list = await SupermarketList.findOne({
    _id: req.params.listId,
    userId: req.user.id
  });

  if (!list) {
    return next(new AppError('Lista de compras não encontrada', 404));
  }

  const item = list.items.id(req.params.itemId);
  if (!item) {
    return next(new AppError('Item não encontrado na lista', 404));
  }

  item.purchased = true;
  item.actualPrice = actualPrice || item.estimatedPrice;
  item.store = store;
  item.purchaseDate = new Date();

  await list.save();

  // Atualizar economia do usuário
  const savings = item.estimatedPrice - item.actualPrice;
  if (savings > 0) {
    req.user.metrics.totalSavings += savings;
    req.user.battleReport.territorioDefendido += savings;
    await req.user.save();
  }

  res.status(200).json({
    status: 'success',
    message: `Item marcado como comprado! ${savings > 0 ? `Economia: R$ ${savings.toFixed(2)}` : ''}`,
    data: {
      list,
      savings: savings > 0 ? savings : 0
    }
  });
});

// @desc    Complete supermarket list
// @route   PATCH /api/supermarket/lists/:id/complete
// @access  Private
export const completeList = catchAsync(async (req, res, next) => {
  const list = await SupermarketList.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!list) {
    return next(new AppError('Lista de compras não encontrada', 404));
  }

  list.isActive = false;
  list.completedAt = new Date();

  await list.save();

  res.status(200).json({
    status: 'success',
    message: 'Lista de compras finalizada!',
    data: {
      list,
      totalSavings: list.savings,
      totalEconomy: `${((list.savings / list.totalEstimated) * 100).toFixed(1)}%`
    }
  });
});

// @desc    Get supermarket analytics
// @route   GET /api/supermarket/analytics
// @access  Private
export const getAnalytics = catchAsync(async (req, res, next) => {
  const lists = await SupermarketList.find({ userId: req.user.id });
  
  const completedLists = lists.filter(list => !list.isActive);
  const totalSavings = completedLists.reduce((sum, list) => sum + (list.savings || 0), 0);
  const totalSpent = completedLists.reduce((sum, list) => sum + (list.totalActual || 0), 0);
  
  const analytics = {
    totalLists: lists.length,
    completedLists: completedLists.length,
    activeLists: lists.filter(list => list.isActive).length,
    totalSavings,
    totalSpent,
    averageSavings: completedLists.length > 0 ? totalSavings / completedLists.length : 0,
    favoriteCategories: getFavoriteCategories(completedLists),
    monthlyTrend: getMonthlyTrend(completedLists)
  };

  res.status(200).json({
    status: 'success',
    data: {
      analytics
    }
  });
});

// Helper functions
const getFavoriteCategories = (lists) => {
  const categories = {};
  lists.forEach(list => {
    list.items.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
  });
  
  return Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));
};

const getMonthlyTrend = (lists) => {
  const monthlyData = {};
  lists.forEach(list => {
    const month = list.completedAt.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { savings: 0, lists: 0 };
    }
    monthlyData[month].savings += list.savings || 0;
    monthlyData[month].lists += 1;
  });
  
  return monthlyData;
};