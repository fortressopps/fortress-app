// Fortress v7.24 — Goals Repository
import { prisma } from '../../../libs/prisma';
import { Goal, GoalPeriodicity } from '../domain/goal.entity';

export class GoalsRepository {
  async create(data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    return prisma.goal.create({ data });
  }

  async findByUser(userId: string): Promise<Goal[]> {
    return prisma.goal.findMany({ where: { userId } });
  }

  async updateProgress(id: string, userId: string, progress: number): Promise<Goal | null> {
    return prisma.goal.update({ where: { id, userId }, data: { progress } });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.goal.delete({ where: { id, userId } });
  }
}
