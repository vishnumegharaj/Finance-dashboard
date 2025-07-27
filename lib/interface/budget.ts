export interface BudgetInterface {
  amount: number;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  lastAlertSent: Date | null;
};