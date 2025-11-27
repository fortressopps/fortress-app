// ============================================================================
// USER SERVICE – Fortress-app
// Arquitetura: Enterprise-grade
// Responsável por encapsular operações de persistência e regras de negócio
// relacionadas ao usuário, utilizando Supabase/Postgres.
// ============================================================================

import { supabaseAdmin } from "../lib/supabase";
import bcrypt from "bcryptjs";

// ============================================================================
// 1. Tipos
// ============================================================================
export interface User {
  id: string;
  email: string;
  password: string;
  plan: string;
  profile: {
    name: string;
    phone?: string;
  };
  lastLogin?: string;
}

// ============================================================================
// 2. Helpers internos
// ============================================================================
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function comparePassword(candidate: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(candidate, hashed);
}

// ============================================================================
// 3. Operações de persistência
// ============================================================================

// Buscar usuário por email
export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from<User>("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) return null;
  return data;
}

// Criar usuário
export async function createUser(payload: Partial<User>): Promise<User | null> {
  const hashedPassword = await hashPassword(payload.password!);

  const { data, error } = await supabaseAdmin
    .from<User>("users")
    .insert({
      ...payload,
      password: hashedPassword,
    })
    .select()
    .single();

  if (error) return null;
  return data;
}

// Buscar usuário por ID
export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from<User>("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// Atualizar senha
export async function updateUserPassword(id: string, newPassword: string): Promise<boolean> {
  const hashedPassword = await hashPassword(newPassword);

  const { error } = await supabaseAdmin
    .from<User>("users")
    .update({ password: hashedPassword })
    .eq("id", id);

  return !error;
}

// Atualizar último login
export async function updateLastLogin(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from<User>("users")
    .update({ lastLogin: new Date().toISOString() })
    .eq("id", id);

  return !error;
}

// Verificar senha
export async function verifyUserPassword(user: User, candidatePassword: string): Promise<boolean> {
  return comparePassword(candidatePassword, user.password);
}

// ============================================================================
// 4. Dashboard data
// ============================================================================
export function getDashboardData(user: User): Record<string, unknown> {
  return {
    id: user.id,
    email: user.email,
    plan: user.plan,
    profile: user.profile,
    lastLogin: user.lastLogin,
  };
}

// ============================================================================
// 5. Exports
// ============================================================================
export default {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserPassword,
  updateLastLogin,
  verifyUserPassword,
  getDashboardData,
};