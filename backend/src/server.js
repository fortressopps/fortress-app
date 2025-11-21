// ~/fortress-app/backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import dotenv from 'dotenv';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import AppError from './utils/appError.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ==================== 🛡️ SECURITY MIDDLEWARES ====================

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    status: 'error',
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression middleware
app.use(compression());

// ==================== 🎯 REQUEST LOGGING ====================

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(`📍 ${req.method} ${req.originalUrl} - ${req.ip} - ${req.requestTime}`);
  next();
});

// ==================== 🚀 API ROUTES ====================

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
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);

// ==================== 🏠 LANDING & DOCUMENTATION ====================

app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Fortress Finance API - Construindo Fortalezas Financeiras',
    version: '1.0.0',
    description: 'API backend para o sistema Fortress - Controle financeiro militarizado',
    documentation: 'https://github.com/fortressopps/fortress-app',
    status: 'operational',
    timestamp: req.requestTime,
    endpoints: {
      authentication: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        getMe: 'GET /api/auth/me'
      },
      system: {
        health: 'GET /health'
      }
    },
    plans: {
      sentinel: 'Plano gratuito - Vigia financeiro',
      vanguard: 'Plano premium - Estrategista financeiro', 
      legacy: 'Plano enterprise - Arquiteto do legado'
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
      }
    }
  });
});

// ==================== ❌ ERROR HANDLING ====================

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Rota ${req.originalUrl} não encontrada neste servidor!`, 404));
});

// Global error handling middleware
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
  console.log('\n' + '═'.repeat(60));
  console.log('🏰  FORTRESS BACKEND - SISTEMA INICIALIZADO');
  console.log('═'.repeat(60));
  console.log(`📍  Porta: ${PORT}`);
  console.log(`🌐  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: MongoDB Connected`);
  console.log(`⏰  Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
  console.log('═'.repeat(60));
  console.log(`🔐  Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📊  Metrics: http://localhost:${PORT}/api/metrics`);
  console.log('═'.repeat(60) + '\n');
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('💥 UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

export default app;