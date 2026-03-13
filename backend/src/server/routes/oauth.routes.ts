import { Hono } from "hono";
import { prisma } from "../../libs/prisma";
import { signAccessToken, signRefreshToken } from "../../libs/jwt";
import { ENV } from "../../libs/env";
import { Logger } from "../../libs/logger";

const oauthRoutes = new Hono();

const REFRESH_COOKIE = "fortress_refresh";

async function handleOAuthSuccess(c: any, email: string, name: string) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true // OAuth providers verify email
      },
    });
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  c.header(
    "Set-Cookie",
    `${REFRESH_COOKIE}=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${ENV.APP_ENV === "production" ? "; Secure" : ""}`,
  );

  return c.redirect(`${ENV.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?token=${accessToken}`);
}

// ==========================================
// GOOGLE OAUTH
// ==========================================
oauthRoutes.get('/auth/google', (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.APP_BASE_URL || "http://localhost:3001"}/auth/google/callback`;
  const scope = encodeURIComponent('openid email profile');

  if (!clientId) return c.json({ error: "Google OAuth not configured" }, 500);

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;
  return c.redirect(url);
});

oauthRoutes.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) return c.redirect(`${ENV.FRONTEND_URL || 'http://localhost:5173'}/login?error=NoCode`);

  try {
    const redirectUri = `${process.env.APP_BASE_URL || "http://localhost:3001"}/auth/google/callback`;

    // 1. Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Token exchange failed');

    // 2. Fetch user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    if (!userRes.ok) throw new Error('User info fetch failed');

    return handleOAuthSuccess(c, userData.email, userData.name || userData.given_name);
  } catch (err) {
    Logger.error({ err }, "Google OAuth Error");
    return c.redirect(`${ENV.FRONTEND_URL || 'http://localhost:5173'}/login?error=OAuthFailed`);
  }
});

// ==========================================
// MICROSOFT OAUTH
// ==========================================
oauthRoutes.get('/auth/microsoft', (c) => {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri = `${process.env.APP_BASE_URL || "http://localhost:3001"}/auth/microsoft/callback`;
  const scope = encodeURIComponent('openid email profile User.Read');

  if (!clientId) return c.json({ error: "Microsoft OAuth not configured" }, 500);

  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  return c.redirect(url);
});

oauthRoutes.get('/auth/microsoft/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) return c.redirect(`${ENV.FRONTEND_URL || 'http://localhost:5173'}/login?error=NoCode`);

  try {
    const redirectUri = `${process.env.APP_BASE_URL || "http://localhost:3001"}/auth/microsoft/callback`;

    // 1. Exchange code for token
    const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Token exchange failed');

    // 2. Fetch user info
    const userRes = await fetch('https://graph.microsoft.com/oidc/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    if (!userRes.ok) throw new Error('User info fetch failed');

    return handleOAuthSuccess(c, userData.email, userData.name);
  } catch (err) {
    Logger.error({ err }, "Microsoft OAuth Error");
    return c.redirect(`${ENV.FRONTEND_URL || 'http://localhost:5173'}/login?error=OAuthFailed`);
  }
});

export { oauthRoutes };
