export class RevenueReportDto {
  mrr: number;
  arr: number;
  growthRate: number;
  churnRate: number;
  planDistribution: { planName: string; count: number; revenue: number }[];
  monthlyRevenueHistory: { month: string; amount: number }[];
}
