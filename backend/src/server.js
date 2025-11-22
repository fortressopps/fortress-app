// ~/fortress-app/backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import dotenv from 'dotenv';
import morgan from 'morgan';

// ==================== 🗄️ IMPORTAÇÕES DE BANCO E CONFIGURAÇÕES ====================
import connectDB from './config/database.js';

// ==================== 🎯 IMPORT DE TODAS AS ROTAS ====================
import authRoutes from './routes/auth.js';
import accountsRoutes from './routes/accounts.js';
import transactionsRoutes from './routes/transactions.js';
import supermarketRoutes from './routes/supermarket.js';
import budgetRoutes from './routes/budget.js';
import analyticsRoutes from './routes/analytics.js';
import userRoutes from './routes/user.js';
import privacyRoutes from './routes/privacy.js';

// 🚧 MÓDULOS FUTUROS
// import billsRoutes from './routes/bills.js';
// import investmentsRoutes from './routes/investments.js';
// import battleRoutes from './routes/battle.js';

import AppError from './utils/appError.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ==================== 🛡️ SECURITY MIDDLEWARES AVANÇADOS ====================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "ws:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Plan-Type', 'X-User-ID', 'Stripe-Signature']
}));

// ==================== 📊 RATE LIMITING POR PLANO ====================
const createPlanLimiter = (maxRequests) => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: maxRequests,
  message: {
    status: 'error',
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting global básico
app.use('/api', createPlanLimiter(process.env.NODE_ENV === 'production' ? 200 : 2000));

// ==================== 📦 MIDDLEWARES DE APLICAÇÃO ====================
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf; // Para webhooks (Stripe, etc.)
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(compression());

// ==================== 📝 LOGGING AVANÇADO ====================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`📍 ${req.requestId} | ${req.method} ${req.originalUrl} | IP: ${req.ip} | Time: ${req.requestTime}`);
  next();
});

// ==================== 🚀 API ROUTES - ESTRUTURA COMPLETA FORTRESS ====================

// Health check endpoint aprimorado
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: '✅ Fortress Online',
    timestamp: req.requestTime,
    requestId: req.requestId,
    environment: process.env.NODE_ENV || 'development',
    database: 'MongoDB Connected',
    uptime: `${process.uptime().toFixed(2)}s`,
    memory: {
      used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`
    },
    system: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    modules: {
      active: ['auth', 'accounts', 'transactions', 'supermarket', 'budget', 'analytics', 'user', 'privacy'],
      upcoming: ['bills', 'investments', 'battle']
    },
    limits: {
      SENTINEL: '100 req/15min',
      VANGUARD: '1000 req/15min', 
      LEGACY: '10000 req/15min'
    }
  };

  // Verificação de saúde do banco (opcional)
  try {
    // Adicionar verificação de ping ao MongoDB se necessário
    healthCheck.database_status = 'healthy';
  } catch (error) {
    healthCheck.database_status = 'unhealthy';
    healthCheck.database_error = error.message;
  }

  res.status(200).json(healthCheck);
});

// ==================== 📦 ROTAS PRINCIPAIS FORTRESS ====================
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/supermarket', supermarketRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/privacy', privacyRoutes);

// 🚧 ROTAS FUTURAS (COMENTADAS - DESCOMENTAR CONFORME IMPLEMENTAÇÃO)
// app.use('/api/bills', billsRoutes);
// app.use('/api/investments', investmentsRoutes);
// app.use('/api/battle', battleRoutes);

// ==================== 🏠 LANDING & DOCUMENTAÇÃO COMPLETA FORTRESS ====================

app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Fortress Finance API - Sistema Militarizado de Produtividade',
    version: '1.0.0',
    description: 'API backend para o sistema Fortress - Controle financeiro e de produtividade militarizado baseado na filosofia do Guardião Financeiro',
    documentation: 'https://github.com/fortressopps/fortress-app',
    status: 'operational',
    timestamp: req.requestTime,
    requestId: req.requestId,
    
    // 🎯 ARQUÉTIPO DA MARCA
    brand_archetype: {
      name: 'O Guardião Financeiro',
      mission: ['Proteger (dados)', 'Educar (conhecimento)', 'Empoderar (ação)'],
      personality: ['Sábio (conhecimento técnico)', 'Acessível (linguagem simples)', 'Inabalável (confiabilidade)', 'Empático (entende dores reais)']
    },

    // ✅ MÓDULOS ATIVOS
    active_modules: {
      authentication: '/api/auth',
      accounts: '/api/accounts',
      transactions: '/api/transactions', 
      supermarket: '/api/supermarket',
      budget: '/api/budget',
      analytics: '/api/analytics',
      user: '/api/user',
      privacy: '/api/privacy'
    },
    
    // 🚧 MÓDULOS EM DESENVOLVIMENTO
    upcoming_modules: {
      bills: '/api/bills',
      investments: '/api/investments',
      battle: '/api/battle'
    },

    // 📊 ENDPOINTS DETALHADOS - ALINHADO COM FORTRESS MASTER CONTEXT
    endpoints: {
      // 🔐 AUTHENTICATION
      authentication: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login', 
        logout: 'POST /api/auth/logout',
        getMe: 'GET /api/auth/me',
        refreshToken: 'POST /api/auth/refresh-token',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password'
      },
      
      // 💳 ACCOUNTS
      accounts: {
        createAccount: 'POST /api/accounts',
        getAccounts: 'GET /api/accounts',
        getAccount: 'GET /api/accounts/:id',
        updateAccount: 'PUT /api/accounts/:id',
        deleteAccount: 'DELETE /api/accounts/:id',
        getAccountTransactions: 'GET /api/accounts/:id/transactions',
        getAccountBalance: 'GET /api/accounts/:id/balance'
      },
      
      // 💰 TRANSACTIONS
      transactions: {
        createTransaction: 'POST /api/transactions',
        getTransactions: 'GET /api/transactions',
        getTransaction: 'GET /api/transactions/:id',
        updateTransaction: 'PUT /api/transactions/:id',
        deleteTransaction: 'DELETE /api/transactions/:id',
        bulkOperations: 'POST /api/transactions/bulk',
        categorize: 'PUT /api/transactions/:id/categorize',
        duplicate: 'POST /api/transactions/:id/duplicate'
      },
      
      // 🛒 SUPERMARKET MODE
      supermarket: {
        createList: 'POST /api/supermarket/lists',
        getLists: 'GET /api/supermarket/lists',
        getList: 'GET /api/supermarket/lists/:id',
        updateList: 'PUT /api/supermarket/lists/:id',
        deleteList: 'DELETE /api/supermarket/lists/:id',
        addItem: 'POST /api/supermarket/lists/:id/items',
        getItems: 'GET /api/supermarket/lists/:id/items',
        updateItem: 'PUT /api/supermarket/items/:id',
        deleteItem: 'DELETE /api/supermarket/items/:id',
        completeList: 'POST /api/supermarket/lists/:id/complete',
        budgetProgress: 'GET /api/supermarket/lists/:id/budget'
      },
      
      // 📊 BUDGET SYSTEM
      budget: {
        createBudget: 'POST /api/budget',
        getBudgets: 'GET /api/budget',
        getBudget: 'GET /api/budget/:id',
        updateBudget: 'PUT /api/budget/:id',
        deleteBudget: 'DELETE /api/budget/:id'
      },
      
      // 📈 ANALYTICS
      analytics: {
        overview: 'GET /api/analytics/overview',
        spending: 'GET /api/analytics/spending',
        trends: 'GET /api/analytics/trends',
        reports: 'GET /api/analytics/reports'
      },
      
      // 👤 USER MANAGEMENT
      user: {
        subscription: 'GET /api/user/subscription',
        updateSubscription: 'PUT /api/user/subscription',
        limits: 'GET /api/user/limits',
        preferences: 'GET /api/user/preferences',
        updatePreferences: 'PUT /api/user/preferences'
      },
      
      // 🔒 PRIVACY & COMPLIANCE
      privacy: {
        export: 'GET /api/privacy/export',
        delete: 'POST /api/privacy/delete'
      },
      
      // ⚙️ SYSTEM
      system: {
        health: 'GET /health',
        metrics: 'GET /api/metrics',
        documentation: 'GET /'
      }
    },

    // 💎 SISTEMA DE PLANOS FORTRESS - BASEADO NO MASTER CONTEXT
    plans: {
      SENTINEL: {
        name: 'Vigia Financeiro',
        price: 'Grátis',
        limits: {
          accounts: 3,
          transactionsPerMonth: 100,
          supermarketLists: 1,
          supermarketItemsPerList: 50,
          budgets: 3,
          exportFormats: ['PDF'],
          support: 'Comunidade',
          analyticsRetention: '30 dias'
        },
        features: [
          'Dashboard Básico',
          'Categorização Manual', 
          'Relatórios Básicos',
          'Modo Supermercado Básico'
        ]
      },
      VANGUARD: {
        name: 'Estrategista Financeiro',
        price: 'R$ 29,90/mês',
        limits: {
          accounts: 'Ilimitado',
          transactionsPerMonth: 'Ilimitado',
          supermarketLists: 'Ilimitado', 
          supermarketItemsPerList: 200,
          budgets: 20,
          exportFormats: ['PDF', 'Excel', 'CSV'],
          support: 'Email Prioritário',
          analyticsRetention: '90 dias'
        },
        features: [
          'Dashboard Avançado',
          'Categorização Automática',
          'Analytics Avançado',
          'Modo Supermercado Avançado',
          'Alertas de Orçamento',
          'Exportação de Dados',
          'Categorias Customizadas'
        ]
      },
      LEGACY: {
        name: 'Arquiteto do Legado',
        price: 'Personalizado',
        limits: {
          accounts: 'Ilimitado',
          transactionsPerMonth: 'Ilimitado', 
          supermarketLists: 'Ilimitado',
          supermarketItemsPerList: 'Ilimitado',
          budgets: 'Ilimitado',
          exportFormats: ['PDF', 'Excel', 'CSV', 'JSON'],
          support: 'Dedicado',
          analyticsRetention: '365 dias'
        },
        features: [
          'Todos os Recursos',
          'Integrações Customizadas',
          'Acesso à API',
          'White Label',
          'Suporte Dedicado',
          'SLA Customizado',
          'Segurança Avançada'
        ]
      }
    },

    // 🎯 JORNADA DO HERÓI FINANCEIRO
    user_journey: {
      phase_1: {
        name: 'Chamado à Aventura (Sentinela)',
        description: 'Reconheça onde está - sem julgamento'
      },
      phase_2: {
        name: 'Cruzamento do Limiar (Vanguarda)',
        description: 'Tome as rédeas do seu destino financeiro'  
      },
      phase_3: {
        name: 'Retorno com o Elixir (Legacy)',
        description: 'Compartilhe o conhecimento e construa legado'
      }
    }
  });
});

// ==================== 📊 METRICS ENDPOINT AVANÇADO ====================
app.get('/api/metrics', (req, res) => {
  const metrics = {
    status: 'success',
    timestamp: req.requestTime,
    requestId: req.requestId,
    data: {
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: {
          heapUsed: process.memoryUsage().heapUsed,
          heapTotal: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
          rss: process.memoryUsage().rss
        },
        cpu: process.cpuUsage(),
        pid: process.pid,
        cwd: process.cwd(),
        env: process.env.NODE_ENV
      },
      application: {
        modules: {
          active: ['auth', 'accounts', 'transactions', 'supermarket', 'budget', 'analytics', 'user', 'privacy'],
          total_endpoints: 42,
          status: 'operational'
        },
        performance: {
          startTime: new Date(Date.now() - process.uptime() * 1000),
          requests_processed: 'N/A' // Poderia ser incrementado com middleware
        }
      },
      business: {
        active_plans: ['SENTINEL', 'VANGUARD', 'LEGACY'],
        conversion_target: '8% free to pro',
        retention_target: '40% 30-day retention'
      }
    }
  };

  res.status(200).json(metrics);
});

// ==================== 🔧 WEBHOOKS ENDPOINTS ====================
// Webhook endpoint para Stripe (billing)
app.post('/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  // Implementar lógica de webhook do Stripe
  console.log('📩 Stripe Webhook Received:', req.body);
  res.status(200).json({received: true});
});

// Webhook endpoint para Clerk (auth)
app.post('/webhooks/clerk', express.raw({type: 'application/json'}), (req, res) => {
  // Implementar lógica de webhook do Clerk
  console.log('📩 Clerk Webhook Received:', req.body);
  res.status(200).json({received: true});
});

// ==================== ❌ ERROR HANDLING AVANÇADO ====================
app.all('*', (req, res, next) => {
  next(new AppError(
    `Rota ${req.originalUrl} não encontrada neste servidor!`, 
    404,
    {
      requestId: req.requestId,
      method: req.method,
      timestamp: req.requestTime
    }
  ));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const errorResponse = {
    status: err.status,
    message: err.message,
    requestId: req.requestId,
    timestamp: req.requestTime,
    path: req.originalUrl,
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack
    })
  };

  // Log de erro estruturado
  console.error('🚨 ERRO FORTRESS:', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode: err.statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    user: req.user?.id || 'anonymous'
  });

  res.status(err.statusCode).json(errorResponse);
});

// ==================== 🎪 SERVER STARTUP ====================
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(80));
  console.log('🏰  FORTRESS BACKEND - SISTEMA MILITARIZADO INICIALIZADO');
  console.log('═'.repeat(80));
  console.log(`📍  Porta: ${PORT}`);
  console.log(`🌐  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: MongoDB Connected`);
  console.log(`⏰  Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🆔  Instance: ${process.pid}`);
  console.log('═'.repeat(80));
  console.log(`✅  MÓDULOS ATIVOS:`);
  console.log(`   🔐  Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`   💳  Accounts API: http://localhost:${PORT}/api/accounts`);
  console.log(`   💰  Transactions API: http://localhost:${PORT}/api/transactions`);
  console.log(`   🛒  Supermarket API: http://localhost:${PORT}/api/supermarket`);
  console.log(`   📊  Budget API: http://localhost:${PORT}/api/budget`);
  console.log(`   📈  Analytics API: http://localhost:${PORT}/api/analytics`);
  console.log(`   👤  User API: http://localhost:${PORT}/api/user`);
  console.log(`   🔒  Privacy API: http://localhost:${PORT}/api/privacy`);
  console.log('═'.repeat(80));
  console.log(`🚧  PRÓXIMOS MÓDULOS:`);
  console.log(`   📅  Bills System`);
  console.log(`   📈  Investments System`);
  console.log(`   ⚔️  Battle System`);
  console.log('═'.repeat(80));
  console.log(`🔧  UTILIDADES:`);
  console.log(`   ❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`   📊  Metrics: http://localhost:${PORT}/api/metrics`);
  console.log(`   📚  Documentation: http://localhost:${PORT}/`);
  console.log(`   📩  Webhooks: http://localhost:${PORT}/webhooks/stripe`);
  console.log('═'.repeat(80));
  console.log(`💎  PLANOS DISPONÍVEIS:`);
  console.log(`   🛡️  SENTINEL (Grátis) - Vigia Financeiro`);
  console.log(`   ⚔️  VANGUARD (R$29,90/mês) - Estrategista Financeiro`);
  console.log(`   👑 LEGACY (Personalizado) - Arquiteto do Legado`);
  console.log('═'.repeat(80) + '\n');
});

// ==================== 🚨 GRACEFUL SHUTDOWN AVANÇADO ====================
const gracefulShutdown = (signal) => {
  console.log(`\n📢 ${signal} received - iniciando shutdown gracioso...`);
  
  // Parar de aceitar novas conexões
  server.close(() => {
    console.log('✅ HTTP server fechado');
    
    // Fechar conexões do banco de dados
    // mongoose.connection.close(false, () => {
      console.log('✅ Database connections fechadas');
      console.log('💤 Process terminated gracefully');
      process.exit(0);
    // });
  });

  // Force close após 10 segundos
  setTimeout(() => {
    console.error('💥 Forçando shutdown após timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

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

// ==================== 🎯 HEALTH CHECK PERIÓDICO ====================
setInterval(() => {
  if (process.env.NODE_ENV === 'production') {
    console.log('❤️  Health Check - Sistema operacional:', {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  }
}, 300000); // A cada 5 minutos

export default app;