// Fortress v7.24 — Goals Service
import { GoalsRepository } from '../infra/goals.repository';
import { Goal, GoalPeriodicity } from '../domain/goal.entity';

export class GoalsService {
  private repo = new GoalsRepository();

  async createGoal(userId: string, data: { name: string; value: number; periodicity: GoalPeriodicity }): Promise<Goal> {
    return this.repo.create({ ...data, userId, progress: 0, impactCurrent: 0 });
  }

  async listGoals(userId: string): Promise<Goal[]> {
    return this.repo.findByUser(userId);
  }

  async updateProgress(id: string, userId: string, progress: number): Promise<Goal | null> {
    return this.repo.updateProgress(id, userId, progress);
  }

  async deleteGoal(id: string, userId: string): Promise<void> {
    await this.repo.delete(id, userId);
  }
}
