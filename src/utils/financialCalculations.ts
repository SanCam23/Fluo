import type {
  Transaction,
  InvestmentAsset,
  FinancialSummary,
  SourceAccount,
} from '../types/finance';

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

/**
 * Computes balance information for all sources in a single consolidated pass over transactions.
 */
export function computeAllSourceBalances(
  sources: SourceAccount[],
  transactions: Transaction[] = []
): Map<string, SourceBalanceInfo> {
  const map = new Map<string, { income: number; expense: number; investExpense: number; count: number }>();
  for (let i = 0; i < sources.length; i++) {
    map.set(sources[i].id, { income: 0, expense: 0, investExpense: 0, count: 0 });
  }

  const txList = Array.isArray(transactions) ? transactions : [];
  for (let i = 0; i < txList.length; i++) {
    const tx = txList[i];
    if (!tx || !tx.sourceId) continue;
    const bucket = map.get(tx.sourceId);
    if (!bucket) continue;
    bucket.count++;
    const amt = tx.amount;
    if (typeof amt !== 'number' || isNaN(amt)) continue;
    if (tx.pillar === 'income') bucket.income += amt;
    else if (tx.pillar === 'expense') bucket.expense += amt;
    else if (tx.pillar === 'invest') bucket.investExpense += amt;
  }

  const result = new Map<string, SourceBalanceInfo>();
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    const data = map.get(s.id) || { income: 0, expense: 0, investExpense: 0, count: 0 };
    const initial = typeof s.initialBalance === 'number' && !isNaN(s.initialBalance) ? s.initialBalance : 0;
    const netBalance = initial + data.income - data.expense - data.investExpense;
    result.set(s.id, {
      sourceId: s.id,
      name: s.name,
      initialBalance: initial,
      income: data.income,
      expense: data.expense,
      investExpense: data.investExpense,
      netBalance,
      transactionCount: data.count,
    });
  }
  return result;
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
    if (tx.pillar === 'invest') {
      // Only deduct from cash if it was actually drawn from a tracked source account
      if (sourceList.length === 0 || !!tx.sourceId) {
        totalInvestTx += tx.amount;
      }
    }
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
    netCashBalance,
    totalIncome,
    totalExpense,
    totalInvested: portfolioMarketValue,
    portfolioMarketValue,
    savingsRate,
    unrealizedPnL,
    unrealizedPnLPercentage,
  };
}

export interface SavingsMetrics {
  netSavings: number;             // Total Ingresos - Total Gastos
  savingsRate: number;            // (netSavings / income) * 100
  dailyAverageSavings: number;    // netSavings / days
  projectedMonthEndSavings: number; // Proyección de cierre de mes
  isPositive: boolean;            // netSavings >= 0
}

/**
 * Computes exact net savings metrics, rate, daily pace and month-end projection.
 */
export function computeSavingsMetrics(
  income: number,
  expense: number,
  daysInPeriod: number = 30,
  referenceDate: Date = new Date()
): SavingsMetrics {
  const safeIncome = typeof income === 'number' && !isNaN(income) ? income : 0;
  const safeExpense = typeof expense === 'number' && !isNaN(expense) ? expense : 0;
  const safeDays = Math.max(1, typeof daysInPeriod === 'number' && !isNaN(daysInPeriod) ? daysInPeriod : 1);

  const netSavings = safeIncome - safeExpense;
  const isPositive = netSavings >= 0;

  let savingsRate: number;
  if (safeIncome > 0) {
    savingsRate = (netSavings / safeIncome) * 100;
  } else if (safeExpense > 0) {
    // Sin ingresos pero con gastos: déficit absoluto (-100%)
    savingsRate = -100;
  } else {
    savingsRate = 0;
  }

  const dailyAverageSavings = netSavings / safeDays;

  const totalDaysInMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0
  ).getDate();

  const projectedMonthEndSavings = dailyAverageSavings * totalDaysInMonth;

  return {
    netSavings,
    savingsRate,
    dailyAverageSavings,
    projectedMonthEndSavings,
    isPositive,
  };
}

export interface SavingsEvolutionPoint {
  label: string;
  dateKey: string;
  income: number;
  expense: number;
  netSavings: number;
  accumulatedSavings: number;
}

/**
 * Generates continuous time-series data points for savings evolution charts
 * adaptable to the active TimeRangeFilter.
 */
export function generateSavingsEvolution(
  transactions: Transaction[] = [],
  timeRange: string = 'this_month',
  referenceDate: Date = new Date()
): SavingsEvolutionPoint[] {
  const txList = Array.isArray(transactions) ? transactions : [];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const now = referenceDate;
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 0. SPECIFIC MONTH (YYYY-MM): Daily points for the requested month
  if (/^\d{4}-\d{2}$/.test(timeRange)) {
    const [targetYear, targetMonthNum] = timeRange.split('-').map(Number);
    const targetMonthIdx = targetMonthNum - 1;
    const isCurrentMonth = targetYear === currentYear && targetMonthIdx === currentMonth;
    const totalDays = isCurrentMonth
      ? Math.max(1, now.getDate())
      : new Date(targetYear, targetMonthNum, 0).getDate();

    const points: SavingsEvolutionPoint[] = [];
    let runningAccumulated = 0;

    const dayMap = new Map<number, { income: number; expense: number }>();
    txList.forEach((tx) => {
      if (!tx?.date) return;
      const d = new Date(tx.date);
      if (d.getFullYear() === targetYear && d.getMonth() === targetMonthIdx) {
        const day = d.getDate();
        if (day <= totalDays) {
          const cur = dayMap.get(day) || { income: 0, expense: 0 };
          if (tx.pillar === 'income') cur.income += tx.amount;
          if (tx.pillar === 'expense') cur.expense += tx.amount;
          dayMap.set(day, cur);
        }
      }
    });

    const monthShort = monthNames[targetMonthIdx] || 'Mes';
    for (let day = 1; day <= totalDays; day++) {
      const data = dayMap.get(day) || { income: 0, expense: 0 };
      const net = data.income - data.expense;
      runningAccumulated += net;
      points.push({
        label: `${day} ${monthShort}`,
        dateKey: `${targetYear}-${String(targetMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
        netSavings: Math.round(net * 100) / 100,
        accumulatedSavings: Math.round(runningAccumulated * 100) / 100,
      });
    }

    return points;
  }

  // 1. THIS MONTH: Daily points from day 1 up to today
  if (timeRange === 'this_month') {
    const today = Math.max(1, now.getDate());
    const points: SavingsEvolutionPoint[] = [];
    let runningAccumulated = 0;

    const dayMap = new Map<number, { income: number; expense: number }>();
    txList.forEach((tx) => {
      if (!tx?.date) return;
      const d = new Date(tx.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const day = d.getDate();
        if (day <= today) {
          const cur = dayMap.get(day) || { income: 0, expense: 0 };
          if (tx.pillar === 'income') cur.income += tx.amount;
          if (tx.pillar === 'expense') cur.expense += tx.amount;
          dayMap.set(day, cur);
        }
      }
    });

    const monthShort = monthNames[currentMonth];
    for (let day = 1; day <= today; day++) {
      const data = dayMap.get(day) || { income: 0, expense: 0 };
      const net = data.income - data.expense;
      runningAccumulated += net;
      points.push({
        label: `${day} ${monthShort}`,
        dateKey: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
        netSavings: Math.round(net * 100) / 100,
        accumulatedSavings: Math.round(runningAccumulated * 100) / 100,
      });
    }

    return points;
  }

  // 2. LAST MONTH: Daily points for all days in last month
  if (timeRange === 'last_month') {
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonthIdx = lastMonthDate.getMonth();
    const totalDays = new Date(currentYear, currentMonth, 0).getDate();

    const points: SavingsEvolutionPoint[] = [];
    let runningAccumulated = 0;

    const dayMap = new Map<number, { income: number; expense: number }>();
    txList.forEach((tx) => {
      if (!tx?.date) return;
      const d = new Date(tx.date);
      if (d.getFullYear() === lastMonthYear && d.getMonth() === lastMonthIdx) {
        const day = d.getDate();
        const cur = dayMap.get(day) || { income: 0, expense: 0 };
        if (tx.pillar === 'income') cur.income += tx.amount;
        if (tx.pillar === 'expense') cur.expense += tx.amount;
        dayMap.set(day, cur);
      }
    });

    const monthShort = monthNames[lastMonthIdx];
    for (let day = 1; day <= totalDays; day++) {
      const data = dayMap.get(day) || { income: 0, expense: 0 };
      const net = data.income - data.expense;
      runningAccumulated += net;
      points.push({
        label: `${day} ${monthShort}`,
        dateKey: `${lastMonthYear}-${String(lastMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
        netSavings: Math.round(net * 100) / 100,
        accumulatedSavings: Math.round(runningAccumulated * 100) / 100,
      });
    }

    return points;
  }

  // 3. LAST 3 MONTHS: Bi-weekly periods (6 points)
  if (timeRange === 'last_3_months') {
    const periodsCount = 6;
    const points: SavingsEvolutionPoint[] = [];
    let runningAccumulated = 0;
    const startDate = new Date(currentYear, currentMonth - 2, 1);
    const intervalDays = 15;
    const intervalMs = intervalDays * 86400000;
    const startMs = startDate.getTime();

    const periodData = Array.from({ length: periodsCount }, (_, i) => {
      const pStart = new Date(startMs + i * intervalMs);
      return {
        pStart,
        startTime: pStart.getTime(),
        endTime: pStart.getTime() + intervalMs,
        income: 0,
        expense: 0,
      };
    });

    for (let j = 0; j < txList.length; j++) {
      const tx = txList[j];
      if (!tx?.date) continue;
      const txTime = new Date(tx.date).getTime();
      for (let i = 0; i < periodsCount; i++) {
        if (txTime >= periodData[i].startTime && txTime < periodData[i].endTime) {
          if (tx.pillar === 'income') periodData[i].income += tx.amount;
          else if (tx.pillar === 'expense') periodData[i].expense += tx.amount;
          break;
        }
      }
    }

    for (let i = 0; i < periodsCount; i++) {
      const p = periodData[i];
      const net = p.income - p.expense;
      runningAccumulated += net;
      points.push({
        label: `${p.pStart.getDate()} ${monthNames[p.pStart.getMonth()]}`,
        dateKey: p.pStart.toISOString().substring(0, 10),
        income: Math.round(p.income * 100) / 100,
        expense: Math.round(p.expense * 100) / 100,
        netSavings: Math.round(net * 100) / 100,
        accumulatedSavings: Math.round(runningAccumulated * 100) / 100,
      });
    }

    return points;
  }

  // 4. LAST 6 MONTHS / THIS YEAR / ALL: Monthly buckets
  const monthsBack = timeRange === 'last_6_months' ? 6 : timeRange === 'this_year' ? currentMonth + 1 : 6;
  const points: SavingsEvolutionPoint[] = [];
  let runningAccumulated = 0;

  const monthBuckets: Array<{
    y: number;
    m: number;
    key: string;
    label: string;
    startTime: number;
    endTime: number;
    income: number;
    expense: number;
  }> = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const nextM = new Date(y, m + 1, 1);
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    monthBuckets.push({
      y,
      m,
      key,
      label: monthNames[m],
      startTime: d.getTime(),
      endTime: nextM.getTime(),
      income: 0,
      expense: 0,
    });
  }

  for (let j = 0; j < txList.length; j++) {
    const tx = txList[j];
    if (!tx?.date) continue;
    const txTime = new Date(tx.date).getTime();
    for (let i = 0; i < monthBuckets.length; i++) {
      if (txTime >= monthBuckets[i].startTime && txTime < monthBuckets[i].endTime) {
        if (tx.pillar === 'income') monthBuckets[i].income += tx.amount;
        else if (tx.pillar === 'expense') monthBuckets[i].expense += tx.amount;
        break;
      }
    }
  }

  for (let i = 0; i < monthBuckets.length; i++) {
    const b = monthBuckets[i];
    const net = b.income - b.expense;
    runningAccumulated += net;
    points.push({
      label: b.label,
      dateKey: b.key,
      income: Math.round(b.income * 100) / 100,
      expense: Math.round(b.expense * 100) / 100,
      netSavings: Math.round(net * 100) / 100,
      accumulatedSavings: Math.round(runningAccumulated * 100) / 100,
    });
  }

  return points;
}

/**
 * Extracts clean asset name and ticker/identifier from transaction concepts like:
 * - "Inversión en Apple (AAPL)" -> { name: "Apple", identifier: "AAPL" }
 * - "Inversión en Vanguard US 500 (IE0032126645)" -> { name: "Vanguard US 500", identifier: "IE0032126645" }
 * - "Inversión en BTC" -> { name: "BTC", identifier: "BTC" }
 * - "Nvidia (NVDA)" -> { name: "Nvidia", identifier: "NVDA" }
 */
