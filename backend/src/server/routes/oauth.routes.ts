import { Hono } from "hono";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { prisma } from "../../libs/prisma";

const oauthRoutes = new Hono();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.APP_BASE_URL || 'http://localhost:3001'}/auth/google/callback`,
}, async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: Function) => {
  let user = await prisma.user.findUnique({ where: { email: profile.emails?.[0]?.value || "" } });
  if (!user) {
    user = await prisma.user.create({ data: {
      email: profile.emails?.[0]?.value || "",
      name: profile.displayName,
      // emailVerified: true // Remover se não suportado
    }});
  }
  return done(null, user);
}));

passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  callbackURL: `${process.env.APP_BASE_URL || 'http://localhost:3001'}/auth/microsoft/callback`,
}, async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
  let user = await prisma.user.findUnique({ where: { email: profile.emails?.[0]?.value || "" } });
  if (!user) {
    user = await prisma.user.create({ data: {
      email: profile.emails?.[0]?.value || "",
      name: profile.displayName,
      // emailVerified: true // Remover se não suportado
    }});
  }
  return done(null, user);
}));

// Google OAuth
oauthRoutes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

oauthRoutes.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (c) => {
  const user = c.req.user;
  // Gerar JWT
  const jwt = require('../../libs/jwt').signAccessToken(user.id);
  // Redirecionar para frontend com token
  return c.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?token=${jwt}`);
});

// Microsoft OAuth
oauthRoutes.get('/auth/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));

oauthRoutes.get('/auth/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: '/login' }), async (c) => {
  const user = c.req.user;
  // Gerar JWT
  const jwt = require('../../libs/jwt').signAccessToken(user.id);
  // Redirecionar para frontend com token
  return c.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?token=${jwt}`);
});

export { oauthRoutes };
