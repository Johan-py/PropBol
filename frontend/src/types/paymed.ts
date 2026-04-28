export type Payment = {
  id: number;
  amount: number;
  dueDate: string;
  status: "paid" | "pending";
};

export type RiskLevel = "low" | "medium" | "high";
