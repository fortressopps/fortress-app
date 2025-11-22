// ~/fortress-app/backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import dotenv from 'dotenv';

import connectDB from './config/database.js';

// ==================== 🎯 IMPORT DE TODAS AS ROTAS FUTURAS ====================
import authRoutes from './routes/auth.js';
import supermarketRoutes from './routes/supermarket.js';
// 🚧 PRÓXIMOS MÓDULOS (COMENTADOS PARA IMPLEMENTAÇÃO FUTURA)
// import userRoutes from './routes/user.js';
// import budgetRoutes from './routes/budget.js'; 
// import billsRoutes from './routes/bills.js';
// import investmentsRoutes from './routes/investments.js';
// import battleRoutes from './routes/battle.js';
// import analyticsRoutes from './routes/analytics.js';

import AppError from './utils/appError.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ==================== 🛡️ SECURITY MIDDLEWARES ====================
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    status: 'error',
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(compression());

// ==================== 🎯 REQUEST LOGGING ====================
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(`📍 ${req.method} ${req.originalUrl} - ${req.ip} - ${req.requestTime}`);
  next();
});

// ==================== 🚀 API ROUTES - ESTRUTURA COMPLETA ====================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: '✅ Fortress Online',
    timestamp: req.requestTime,
    environment: process.env.NODE_ENV || 'development',
    database: 'MongoDB Connected',
    uptime: `${process.uptime().toFixed(2)}s`,
    memory: {
      used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`
    },
    modules: {
      active: ['auth', 'supermarket'],
      upcoming: ['user', 'budget', 'bills', 'investments', 'battle', 'analytics']
    }
  });
});

// ==================== 📦 ROTAS PRINCIPAIS ====================
app.use('/api/auth', authRoutes);
app.use('/api/supermarket', supermarketRoutes);

// 🚧 ROTAS FUTURAS (COMENTADAS - DESCOMENTAR CONFORME IMPLEMENTAÇÃO)
// app.use('/api/user', userRoutes);
// app.use('/api/budget', budgetRoutes);
// app.use('/api/bills', billsRoutes);
// app.use('/api/investments', investmentsRoutes);
// app.use('/api/battle', battleRoutes);
// app.use('/api/analytics', analyticsRoutes);

// ==================== 🏠 LANDING & DOCUMENTAÇÃO COMPLETA ====================

app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Fortress Finance API - Sistema Militarizado de Produtividade',
    version: '1.0.0',
    description: 'API backend para o sistema Fortress - Controle financeiro e de produtividade militarizado',
    documentation: 'https://github.com/fortressopps/fortress-app',
    status: 'operational',
    timestamp: req.requestTime,
    
    // ✅ MÓDULOS ATIVOS
    active_modules: {
      authentication: '/api/auth',
      supermarket: '/api/supermarket'
    },
    
    // 🚧 MÓDULOS EM DESENVOLVIMENTO
    upcoming_modules: {
      user_dashboard: '/api/user',
      budget: '/api/budget',
      bills: '/api/bills', 
      investments: '/api/investments',
      battle_system: '/api/battle',
      analytics: '/api/analytics'
    },

    // 📊 ENDPOINTS DETALHADOS
    endpoints: {
      // ✅ AUTH (IMPLEMENTADO)
      authentication: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        getMe: 'GET /api/auth/me',
        refreshToken: 'POST /api/auth/refresh-token'
      },
      
      // ✅ SUPERMARKET (IMPLEMENTADO)
      supermarket: {
        createList: 'POST /api/supermarket/lists',
        getLists: 'GET /api/supermarket/lists',
        getList: 'GET /api/supermarket/lists/:id',
        updateList: 'PATCH /api/supermarket/lists/:id',
        addItem: 'POST /api/supermarket/lists/:id/items',
        markPurchased: 'PATCH /api/supermarket/lists/:listId/items/:itemId',
        completeList: 'PATCH /api/supermarket/lists/:id/complete',
        analytics: 'GET /api/supermarket/analytics'
      },
      
      // 🚧 USER DASHBOARD (PRÓXIMO)
      user: {
        dashboard: 'GET /api/user/dashboard',
        profile: 'GET /api/user/profile',
        updateProfile: 'PATCH /api/user/profile',
        metrics: 'GET /api/user/metrics',
        battleReport: 'GET /api/user/battle-report'
      },
      
      // 🚧 BUDGET SYSTEM
      budget: {
        createBudget: 'POST /api/budget',
        getBudgets: 'GET /api/budget',
        getBudget: 'GET /api/budget/:id',
        updateBudget: 'PATCH /api/budget/:id',
        categories: 'GET /api/budget/categories'
      },
      
      // 🚧 BILLS SYSTEM  
      bills: {
        createBill: 'POST /api/bills',
        getBills: 'GET /api/bills',
        payBill: 'PATCH /api/bills/:id/pay',
        upcoming: 'GET /api/bills/upcoming'
      },
      
      // 🚧 INVESTMENTS SYSTEM
      investments: {
        portfolio: 'GET /api/investments/portfolio',
        addInvestment: 'POST /api/investments',
        performance: 'GET /api/investments/performance'
      },
      
      // 🚧 BATTLE SYSTEM
      battle: {
        report: 'GET /api/battle/report',
        achievements: 'GET /api/battle/achievements',
        rank: 'GET /api/battle/rank'
      },
      
      // 🚧 ANALYTICS SYSTEM
      analytics: {
        overview: 'GET /api/analytics/overview',
        trends: 'GET /api/analytics/trends',
        export: 'GET /api/analytics/export'
      },
      
      // ✅ SYSTEM
      system: {
        health: 'GET /health',
        metrics: 'GET /api/metrics'
      }
    },

    // 💎 PLANOS DO SISTEMA
    plans: {
      sentinel: {
        name: 'Vigia Financeiro',
        limits: {
          supermarket_lists: 5,
          supermarket_items: 25,
          budgets: 3,
          bills: 10
        }
      },
      vanguard: {
        name: 'Estrategista Financeiro', 
        limits: {
          supermarket_lists: 15,
          supermarket_items: 100,
          budgets: 10,
          bills: 50
        }
      },
      legacy: {
        name: 'Arquiteto do Legado',
        limits: {
          supermarket_lists: 'Ilimitado',
          supermarket_items: 'Ilimitado',
          budgets: 'Ilimitado',
          bills: 'Ilimitado'
        }
      }
    }
  });
});

// ==================== 📊 METRICS ENDPOINT ====================
app.get('/api/metrics', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      process: {
        pid: process.pid,
        cwd: process.cwd(),
        env: process.env.NODE_ENV
      },
      modules: {
        active: ['auth', 'supermarket'],
        total_endpoints: 12 // Atualizar conforme adiciona rotas
      }
    }
  });
});

// ==================== ❌ ERROR HANDLING ====================
app.all('*', (req, res, next) => {
  next(new AppError(`Rota ${req.originalUrl} não encontrada neste servidor!`, 404));
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack
    })
  });
});

// ==================== 🎪 SERVER STARTUP ====================
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(70));
  console.log('🏰  FORTRESS BACKEND - SISTEMA INICIALIZADO');
  console.log('═'.repeat(70));
  console.log(`📍  Porta: ${PORT}`);
  console.log(`🌐  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: MongoDB Connected`);
  console.log(`⏰  Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
  console.log('═'.repeat(70));
  console.log(`✅  MÓDULOS ATIVOS:`);
  console.log(`   🔐  Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`   🛒  Supermarket API: http://localhost:${PORT}/api/supermarket`);
  console.log('═'.repeat(70));
  console.log(`🚧  PRÓXIMOS MÓDULOS:`);
  console.log(`   👤  User Dashboard`);
  console.log(`   💰  Budget System`); 
  console.log(`   📅  Bills System`);
  console.log(`   📈  Investments System`);
  console.log(`   ⚔️  Battle System`);
  console.log(`   📊  Analytics System`);
  console.log('═'.repeat(70));
  console.log(`🔧  UTILIDADES:`);
  console.log(`   ❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`   📊  Metrics: http://localhost:${PORT}/api/metrics`);
  console.log('═'.repeat(70) + '\n');
});

// ==================== 🚨 GRACEFUL SHUTDOWN ====================
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received - shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received - shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

process.on('unhandledRejection', (err) => {
  console.log('💥 UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

export default app;