import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();

// Conectar ao MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: '✅ Fortress Online',
    timestamp: new Date(),
    database: 'MongoDB configurado',
    message: 'Sistema funcionando perfeitamente!'
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Fortress API está no ar!',
    version: '1.0.0',
    endpoints: {
      health: '/health'
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎯 Fortress Backend rodando na porta ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});