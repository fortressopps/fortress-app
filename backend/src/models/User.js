// ~/fortress-app/backend/src/models/User.js - VERSÃO SUPER REFINADA
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  // 🔐 AUTH - SUPER REFINADO
  email: { 
    type: String, 
    required: [true, 'Email é obrigatório'], 
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Email inválido'],
    index: true
  },
  password: { 
    type: String, 
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // ⚔️ PLANO - REFINADO
  plan: { 
    type: String, 
    enum: ['sentinel', 'vanguard', 'legacy'], 
    default: 'sentinel',
    index: true
  },
  
  // 🎖️ SISTEMA MILITAR - REFINADO
  rank: {
    title: { 
      type: String, 
      enum: ['recruta', 'sentinela', 'estrategista', 'comandante', 'arquiteto'],
      default: 'recruta'
    },
    promotionDate: { type: Date, default: Date.now },
    monthsOfService: { type: Number, default: 0 }
  },
  
  // 👤 PERFIL - SUPER REFINADO
  profile: {
    name: { 
      type: String, 
      required: [true, 'Nome é obrigatório'],
      trim: true,
      maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
    },
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return /^(\+55)?[\s]?\(?(\d{2})\)?[\s-]?(\d{4,5})[\s-]?(\d{4})$/.test(v);
        },
        message: 'Número de telefone inválido'
      }
    }
  },
  
  // 🛡️ STATUS - REFINADO
  subscriptionStatus: {
    type: String,
    enum: ['active', 'trial', 'canceled'],
    default: 'trial'
  },
  trialEndsAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  
  // 🏗️ RECURSOS - REFINADO
  fortressResources: {
    // SENTINEL
    muralhaBasica: { type: Boolean, default: true },
    torreVigia: { type: Boolean, default: true },
    mapaSimplificado: { type: Boolean, default: true },
    
    // VANGUARD 
    muralhaReforcada: { type: Boolean, default: false },
    sistemaDefesa: { type: Boolean, default: false },
    salaGuerra: { type: Boolean, default: false },
    arsenalBasico: { type: Boolean, default: false },
    acessoQuartel: { type: Boolean, default: false },
    
    // LEGACY
    fortalezaFamiliar: { type: Boolean, default: false },
    conselhoGuerra: { type: Boolean, default: false },
    salaoLideres: { type: Boolean, default: false },
    estrategiasBatalha: { type: Boolean, default: false }
  },
  
  // 📊 MÉTRICAS & LIMITES - SUPER REFINADO
  metrics: {
    totalSavings: { type: Number, default: 0 },
    activeGoals: { type: Number, default: 0 },
    completedGoals: { type: Number, default: 0 },
    supermarketLists: { type: Number, default: 0 }
  },
  monthlyLimits: {
    transactions: { type: Number, default: 50 },
    goals: { type: Number, default: 3 },
    supermarketLists: { type: Number, default: 1 }
  },
  transactionCount: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now },

  // ⏰ TIMESTAMPS
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🎯 VIRTUAL FIELDS - REFINADO
userSchema.virtual('trialDaysLeft').get(function() {
  const daysLeft = Math.ceil((this.trialEndsAt - new Date()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLeft);
});

userSchema.virtual('isTrialActive').get(function() {
  return this.trialEndsAt > new Date();
});

userSchema.virtual('serviceMonths').get(function() {
  const months = Math.floor((new Date() - this.createdAt) / (30 * 24 * 60 * 60 * 1000));
  return Math.max(0, months);
});

// 🔐 MÉTODOS DE SEGURANÇA - SUPER REFINADO
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// 💼 LÓGICA DE NEGÓCIO - SUPER REFINADO
userSchema.methods.updateFortressResources = function() {
  const baseResources = {
    muralhaBasica: true,
    torreVigia: true, 
    mapaSimplificado: true
  };

  const vanguardResources = {
    muralhaReforcada: true,
    sistemaDefesa: true,
    salaGuerra: true,
    arsenalBasico: true,
    acessoQuartel: true
  };

  const legacyResources = {
    fortalezaFamiliar: true,
    conselhoGuerra: true,
    salaoLideres: true,
    estrategiasBatalha: true
  };

  let resources = { ...baseResources };

  if (this.plan === 'vanguard' || this.plan === 'legacy') {
    resources = { ...resources, ...vanguardResources };
  }

  if (this.plan === 'legacy') {
    resources = { ...resources, ...legacyResources };
  }

  this.fortressResources = resources;
  return resources;
};

userSchema.methods.calculateRank = function() {
  const monthsService = this.serviceMonths;
  
  if (this.plan === 'legacy') return 'arquiteto';
  if (this.plan === 'vanguard' && monthsService >= 6) return 'comandante';
  if (this.plan === 'vanguard') return 'estrategista';
  if (this.plan === 'sentinel' && monthsService >= 1) return 'sentinela';
  return 'recruta';
};

userSchema.methods.canMakeTransaction = function() {
  if (this.plan === 'sentinel') {
    const now = new Date();
    const lastReset = new Date(this.lastReset);
    const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                       now.getFullYear() !== lastReset.getFullYear();
    
    if (shouldReset) {
      this.transactionCount = 0;
      this.lastReset = now;
      return true;
    }
    
    return this.transactionCount < this.monthlyLimits.transactions;
  }
  return true;
};

userSchema.methods.getDashboardData = function() {
  return {
    user: {
      name: this.profile.name,
      plan: this.plan,
      rank: this.rank.title,
      trialDaysLeft: this.trialDaysLeft
    },
    metrics: this.metrics,
    resources: this.fortressResources,
    quickStats: {
      monthlySavings: this.metrics.totalSavings || 287,
      goalsProgress: Math.min(100, (this.metrics.completedGoals / (this.metrics.activeGoals || 1)) * 100),
      activeBenefits: Object.values(this.fortressResources).filter(Boolean).length
    }
  };
};

// ⚡ MIDDLEWARE & INDEXES - REFINADO
userSchema.pre('save', function(next) {
  if (this.isModified('plan') || this.isNew) {
    this.updateFortressResources();
    this.rank.title = this.calculateRank();
    this.rank.monthsOfService = this.serviceMonths;
  }
  next();
});

// ✅ INDEXES PARA PERFORMANCE
userSchema.index({ 'rank.title': 1, 'metrics.totalSavings': -1 });
userSchema.index({ 'subscriptionStatus': 1, 'trialEndsAt': 1 });

export default mongoose.model('User', userSchema);