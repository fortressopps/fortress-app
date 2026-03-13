import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../../libs/prisma";
import { authMiddleware } from "../../middleware/auth";

export const userRoutes = new Hono();

const onboardingSchema = z.object({
  monthlyBudget: z.number().positive(),
  mainGoal: z.string().min(1),
  primaryCategory: z.enum(['FOOD','TRANSPORT','HEALTH','ENTERTAINMENT','SHOPPING','SALARY','OTHER'])
});

userRoutes.post("/onboarding/complete", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const parsed = onboardingSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: "Dados inválidos", details: parsed.error.flatten() }, 400);
  }
  
  const data = parsed.data;

  try {
    // 1. Criar Goal mensal
    await prisma.goal.create({
      data: {
        userId: user.id,
        name: data.mainGoal,
        value: data.monthlyBudget,
        periodicity: 'MONTHLY',
        progress: 0,
        impactCurrent: 0
      }
    });

    // 2. Criar KernelProfile se não existir
    await prisma.kernelProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    });

    // 3. Marcar onboarding como completo
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true }
    });

    return c.json({ user: updatedUser }, 200);
  } catch (err: any) {
    return c.json({ error: "Erro ao finalizar onboarding", detail: err.message }, 500);
  }
});
