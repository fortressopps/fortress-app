// Fortress v7.24 — Goals Repository
import type { GoalPeriodicity as PrismaGoalPeriodicity } from "@prisma/client";
import { prisma } from "../../../libs/prisma";
import type { Goal } from "../domain/goal.entity";

export class GoalsRepository {
  async create(data: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<Goal> {
    const row = await prisma.goal.create({
      data: { ...data, periodicity: data.periodicity as PrismaGoalPeriodicity },
    });
    return { ...row, periodicity: row.periodicity as Goal["periodicity"] };
  }

  async findByUser(userId: string): Promise<Goal[]> {
    const rows = await prisma.goal.findMany({ where: { userId } });
    return rows.map((r) => ({ ...r, periodicity: r.periodicity as Goal["periodicity"] }));
  }

  async updateProgress(id: string, userId: string, progress: number): Promise<Goal | null> {
    try {
      const row = await prisma.goal.update({ where: { id, userId }, data: { progress } });
      return { ...row, periodicity: row.periodicity as Goal["periodicity"] };
    } catch {
      return null;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.goal.delete({ where: { id, userId } });
  }
}
