/**
 * Fortress v7.24 — Goals: projeção de compromissos (metas)
 * Method: goals.commitment-projection.ts (responsabilidade = commitment-projection)
 */
import { GoalsRepository } from "../infra/goals.repository";
import type { Goal, GoalPeriodicity } from "./goal.entity";

export class GoalsService {
  private repo = new GoalsRepository();

  async createGoal(
    userId: string,
    data: { name: string; value: number; periodicity: GoalPeriodicity }
  ): Promise<Goal> {
    return this.repo.create({ ...data, userId, progress: 0, impactCurrent: 0 });
  }

  async listGoals(userId: string): Promise<any[]> {
    const goals = await this.repo.findByUser(userId);
    const { analyzeGoal } = await import("./goal.calculator");

    return goals.map(goal => {
      // Reconstruct actual spent from progress field for analysis
      const actualSpent = (goal.progress / 100) * goal.value;

      // Mock days elapsed for demo (e.g. middle of month)
      const analysis = analyzeGoal(goal, actualSpent, 15, 30);

      return {
        ...goal,
        analysis
      };
    });
  }

  async updateProgress(id: string, userId: string, progress: number): Promise<Goal | null> {
    return this.repo.updateProgress(id, userId, progress);
  }

  async deleteGoal(id: string, userId: string): Promise<void> {
    return this.repo.delete(id, userId);
  }
}
