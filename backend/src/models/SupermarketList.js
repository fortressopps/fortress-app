// backend/src/models/SupermarketList.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item deve ter um nome'],
    trim: true,
    maxlength: [100, 'Nome do item não pode exceder 100 caracteres']
  },
  category: {
    type: String,
    default: 'outros',
    enum: ['alimentos', 'bebidas', 'limpeza', 'higiene', 'hortifruti', 'padaria', 'carnes', 'laticinios', 'outros']
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantidade não pode ser menor que 1']
  },
  unit: {
    type: String,
    default: 'un',
    enum: ['un', 'kg', 'g', 'l', 'ml', 'cx', 'pct']
  },
  estimatedPrice: {
    type: Number,
    min: [0, 'Preço estimado não pode ser negativo']
  },
  actualPrice: {
    type: Number,
    min: [0, 'Preço real não pode ser negativo']
  },
  purchased: {
    type: Boolean,
    default: false
  },
  store: String,
  purchaseDate: Date
}, { _id: true });

const supermarketListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lista deve pertencer a um usuário']
  },
  listName: {
    type: String,
    required: [true, 'Lista deve ter um nome'],
    trim: true,
    maxlength: [50, 'Nome da lista não pode exceder 50 caracteres'],
    default: 'Minha Lista de Compras'
  },
  items: [itemSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  completedAt: Date,
  totalEstimated: {
    type: Number,
    default: 0
  },
  totalActual: {
    type: Number,
    default: 0
  },
  savings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ MIDDLEWARE PRE-SAVE PARA CÁLCULOS AUTOMÁTICOS
supermarketListSchema.pre('save', function(next) {
  // Calcular totais
  this.totalEstimated = this.items.reduce((total, item) => {
    return total + (item.estimatedPrice || 0) * (item.quantity || 1);
  }, 0);

  // Calcular totais reais apenas para itens comprados
  this.totalActual = this.items.reduce((total, item) => {
    if (item.purchased && item.actualPrice) {
      return total + (item.actualPrice * (item.quantity || 1));
    }
    return total;
  }, 0);

  // Calcular economia
  this.savings = Math.max(0, this.totalEstimated - this.totalActual);

  next();
});

// ✅ INDEX PARA PERFORMANCE
supermarketListSchema.index({ userId: 1, createdAt: -1 });
supermarketListSchema.index({ isActive: 1, completedAt: -1 });

// ✅ VIRTUAL PARA PORCENTAGEM DE ECONOMIA
supermarketListSchema.virtual('savingsPercentage').get(function() {
  if (this.totalEstimated === 0) return 0;
  return ((this.savings / this.totalEstimated) * 100).toFixed(1);
});

// ✅ VIRTUAL PARA ITENS COMPRADOS
supermarketListSchema.virtual('purchasedItems').get(function() {
  return this.items.filter(item => item.purchased);
});

// ✅ VIRTUAL PARA ITENS PENDENTES
supermarketListSchema.virtual('pendingItems').get(function() {
  return this.items.filter(item => !item.purchased);
});

// ✅ METHOD PARA VERIFICAR LIMITE DE ITENS (SENTINEL: 25)
supermarketListSchema.methods.checkItemLimit = function() {
  const userPlan = this.userId?.plan || 'sentinel';
  const itemLimit = userPlan === 'sentinel' ? 25 : Infinity;
  
  if (this.items.length > itemLimit) {
    throw new Error(`Limite de ${itemLimit} itens atingido para o plano ${userPlan}. Faça upgrade para adicionar mais itens.`);
  }
  return true;
};

const SupermarketList = mongoose.model('SupermarketList', supermarketListSchema);

export default SupermarketList;