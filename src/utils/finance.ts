import type { Transaction, InvestmentAsset, FinancialSummary } from '../types/finance';

export function computeFinancialSummary(
  transactions: Transaction[] = [],
  assets: InvestmentAsset[] = []
): FinancialSummary {
  const txList = Array.isArray(transactions) ? transactions : [];
  const assetList = Array.isArray(assets) ? assets : [];

  let totalIncome = 0;
  let totalExpense = 0;

  txList.forEach((tx) => {
    if (!tx || typeof tx.amount !== 'number' || isNaN(tx.amount)) return;
    if (tx.pillar === 'income') totalIncome += tx.amount;
    if (tx.pillar === 'expense') totalExpense += tx.amount;
  });

  let totalInvestedCost = 0;
  let portfolioMarketValue = 0;

  assetList.forEach((asset) => {
    if (!asset) return;
    const shares = typeof asset.shares === 'number' && !isNaN(asset.shares) ? asset.shares : 0;
    const buyPrice = typeof asset.averageBuyPrice === 'number' && !isNaN(asset.averageBuyPrice) ? asset.averageBuyPrice : 0;
    const curPrice = typeof asset.currentPrice === 'number' && !isNaN(asset.currentPrice) ? asset.currentPrice : 0;

    totalInvestedCost += shares * buyPrice;
    portfolioMarketValue += shares * curPrice;
  });

  const unrealizedPnL = portfolioMarketValue - totalInvestedCost;
  const unrealizedPnLPercentage =
    totalInvestedCost > 0 ? (unrealizedPnL / totalInvestedCost) * 100 : 0;

  const netCashBalance = totalIncome - totalExpense;
  const netBalance = netCashBalance + portfolioMarketValue;

  const savingsRate =
    totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return {
    netBalance,
    totalIncome,
    totalExpense,
    totalInvested: portfolioMarketValue,
    portfolioMarketValue,
    savingsRate,
    unrealizedPnL,
    unrealizedPnLPercentage,
  };
}
