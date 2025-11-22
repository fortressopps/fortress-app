import { ClerkExpressRequireAuth } from '@clerk/express';

export const clerkMiddleware = ClerkExpressRequireAuth({
  // Configurações avançadas do Clerk
  onError: (error, req, res, next) => {
    console.error('🔐 Clerk Auth Error:', error);
    res.status(401).json({
      success: false,
      error: 'Não autorizado',
      message: 'Autenticação requerida'
    });
  }
});

export default clerkMiddleware;