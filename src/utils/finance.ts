import type { Transaction, InvestmentAsset, FinancialSummary, SourceAccount } from '../types/finance';

export interface SourceBalanceInfo {
  sourceId: string;
  name: string;
  initialBalance: number;
  income: number;
  expense: number;
  investExpense: number;
  netBalance: number;
  transactionCount: number;
}

export function computeSourceBalance(
  source: SourceAccount,
  transactions: Transaction[] = []
): SourceBalanceInfo {
  const txList = Array.isArray(transactions) ? transactions : [];
  let income = 0;
  let expense = 0;
  let investExpense = 0;
  let count = 0;

  txList.forEach((tx) => {
    if (!tx || tx.sourceId !== source.id) return;
    count++;
    if (typeof tx.amount !== 'number' || isNaN(tx.amount)) return;
    if (tx.pillar === 'income') income += tx.amount;
    if (tx.pillar === 'expense') expense += tx.amount;
    if (tx.pillar === 'invest') investExpense += tx.amount;
  });

  const initial =
    typeof source.initialBalance === 'number' && !isNaN(source.initialBalance)
      ? source.initialBalance
      : 0;

  const netBalance = initial + income - expense - investExpense;

  return {
    sourceId: source.id,
    name: source.name,
    initialBalance: initial,
    income,
    expense,
    investExpense,
    netBalance,
    transactionCount: count,
  };
}

export function computeFinancialSummary(
  transactions: Transaction[] = [],
  assets: InvestmentAsset[] = [],
  sources: SourceAccount[] = []
): FinancialSummary {
  const txList = Array.isArray(transactions) ? transactions : [];
  const assetList = Array.isArray(assets) ? assets : [];
  const sourceList = Array.isArray(sources) ? sources : [];

  let totalIncome = 0;
  let totalExpense = 0;
  let totalInvestTx = 0;

  txList.forEach((tx) => {
    if (!tx || typeof tx.amount !== 'number' || isNaN(tx.amount)) return;
    if (tx.pillar === 'income') totalIncome += tx.amount;
    if (tx.pillar === 'expense') totalExpense += tx.amount;
    if (tx.pillar === 'invest') totalInvestTx += tx.amount;
  });

  let totalInvestedCost = 0;
  let portfolioMarketValue = 0;

  assetList.forEach((asset) => {
    if (!asset) return;
    const shares = typeof asset.shares === 'number' && !isNaN(asset.shares) ? asset.shares : 0;
    const buyPrice =
      typeof asset.averageBuyPrice === 'number' && !isNaN(asset.averageBuyPrice)
        ? asset.averageBuyPrice
        : 0;
    const curPrice =
      typeof asset.currentPrice === 'number' && !isNaN(asset.currentPrice)
        ? asset.currentPrice
        : 0;

    totalInvestedCost += shares * buyPrice;
    portfolioMarketValue += shares * curPrice;
  });

  const unrealizedPnL = portfolioMarketValue - totalInvestedCost;
  const unrealizedPnLPercentage =
    totalInvestedCost > 0 ? (unrealizedPnL / totalInvestedCost) * 100 : 0;

  const totalInitialBalance = sourceList.reduce((sum, s) => {
    const init =
      typeof s.initialBalance === 'number' && !isNaN(s.initialBalance) ? s.initialBalance : 0;
    return sum + init;
  }, 0);

  // Consolidated cash: initial bank/cash balances + income - expense - investments outflows
  // If no sources exist yet, fallback to simple cash balance (totalIncome - totalExpense)
  const netCashBalance =
    sourceList.length > 0
      ? totalInitialBalance + totalIncome - totalExpense - totalInvestTx
      : totalIncome - totalExpense;

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
