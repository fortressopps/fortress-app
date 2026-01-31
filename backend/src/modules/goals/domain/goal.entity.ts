// Fortress v7.24 — Goal Entity
export enum GoalPeriodicity {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  value: number;
  periodicity: GoalPeriodicity;
  progress: number; // % atingido
  impactCurrent: number; // impacto no mês
  createdAt: Date;
  updatedAt: Date;
}
