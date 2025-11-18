import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Health Check - OBRIGATÓRIO
app.get('/health', (req, res) => {
  res.json({ 
    status: '✅ Fortress Online', 
    timestamp: new Date(),
    message: 'Sistema funcionando perfeitamente!'
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Fortress API está no ar!',
    next_steps: 'Configure o MongoDB Atlas'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎯 Fortress rodando na porta ${PORT}`);
});
