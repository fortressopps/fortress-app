import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPaginationParams, toSkipTake, getPaginationMetaWithOptions } from '../../../utils/pagination'
import { auth } from "@clerk/nextjs";
import { checkPlanLimit } from "@/lib/plan-limits";

// Schema de validação com Zod
const budgetSchema = z.object({
  category: z.string(),
  amount: z.number().positive(),
  alertThreshold: z.number().min(0).max(1).default(0.8),
});

// GET - listar budgets do usuário autenticado
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Paginação
    const params = getPaginationParams(new URL((globalThis as any).location?.href || '').searchParams);
    const { skip, take } = toSkipTake(params.page, params.pageSize);

    const [budgets, totalCount] = await Promise.all([
      prisma.budget.findMany({ where: { userId }, skip, take }),
      prisma.budget.count({ where: { userId } })
    ])

    const meta = getPaginationMetaWithOptions(totalCount, params.page, params.pageSize)

    return NextResponse.json({ data: budgets, meta });
  } catch (error) {
    console.error("Erro ao listar budgets:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - criar novo budget
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verifica limites do plano
    await checkPlanLimit(userId, "budgets");

    const body = await req.json();
    const parsed = budgetSchema.parse(body);

    const newBudget = await prisma.budget.create({
      data: {
        ...parsed,
        userId,
      },
    });

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar budget:", error);
    return NextResponse.json({ error: "Erro ao criar budget" }, { status: 400 });
  }
}