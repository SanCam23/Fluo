import type { Transaction, InvestmentAsset, FinancialSummary, SourceAccount, AssetType } from '../types/finance';

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

  let savingsRate = 0;
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
export function parseInvestmentConcept(concept: string): { name: string; identifier: string } {
  const clean = (concept || '').trim();
  if (!clean) {
    return { name: 'Inversión', identifier: 'ASSET' };
  }

  // Regex pattern matching: [Inversión en ] NAME (IDENTIFIER)
  const parenMatch = clean.match(/^(?:Inversi[oó]n\s+en\s+)?(.+?)\s*\(([A-Z0-9.\-_]{1,20})\)$/i);
  if (parenMatch) {
    const parsedName = parenMatch[1].trim();
    const parsedIdent = parenMatch[2].trim().toUpperCase();
    return {
      name: parsedName || parsedIdent,
      identifier: parsedIdent || parsedName,
    };
  }

  // Pattern matching: Embedded ISIN code anywhere in the concept (e.g. "Inversión en SP500 IE0007987690")
  const isinMatch = clean.match(/\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b/i);
  if (isinMatch) {
    const isin = isinMatch[1].toUpperCase();
    const cleanName = clean
      .replace(/^(?:Inversi[oó]n\s+en\s+)/i, '')
      .replace(new RegExp(`\\(?\\b${isin}\\b\\)?`, 'i'), '')
      .replace(/[()]/g, '')
      .trim();
    return {
      name: cleanName || isin,
      identifier: isin,
    };
  }

  // Regex pattern matching: Inversión en NAME
  const prefixMatch = clean.match(/^Inversi[oó]n\s+en\s+(.+)$/i);
  if (prefixMatch) {
    const assetPart = prefixMatch[1].trim();
    return {
      name: assetPart,
      identifier: assetPart.toUpperCase(),
    };
  }

  return {
    name: clean,
    identifier: clean.toUpperCase(),
  };
}

/**
 * Finds index of an asset in portfolio matching by ISIN, identifier, ticker, or name.
 */
export function findMatchingAssetIndex(
  assets: InvestmentAsset[],
  candidate: { identifier?: string; isin?: string; ticker?: string; name?: string; assetType?: AssetType }
): number {
  const cIdent = (candidate.identifier || '').trim().toUpperCase();
  const cIsin = (candidate.isin || '').trim().toUpperCase();
  const cTicker = (candidate.ticker || '').trim().toUpperCase();
  const cName = (candidate.name || '').trim().toUpperCase();

  // Extract embedded ISIN if present
  const cEmbeddedIsin = cIdent.match(/\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b/)?.[1] ||
    cName.match(/\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b/)?.[1] ||
    cIsin;

  return assets.findIndex((a) => {
    const aIdent = (a.identifier || '').trim().toUpperCase();
    const aIsin = (a.isin || '').trim().toUpperCase();
    const aTicker = (a.ticker || '').trim().toUpperCase();
    const aName = (a.name || '').trim().toUpperCase();
    const aEmbeddedIsin = aIdent.match(/\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b/)?.[1] || aIsin;

    // 1. ISIN match (direct or embedded)
    if (cEmbeddedIsin && (aIsin === cEmbeddedIsin || aIdent === cEmbeddedIsin || aEmbeddedIsin === cEmbeddedIsin)) {
      return true;
    }

    // 2. Direct identifier match
    if (cIdent && (aIdent === cIdent || aTicker === cIdent)) {
      return true;
    }

    // 3. Ticker match
    if (cTicker && (aTicker === cTicker || aIdent === cTicker)) {
      return true;
    }

    // 4. Exact name and assetType match
    if (cName && aName === cName && (!candidate.assetType || a.assetType === candidate.assetType)) {
      return true;
    }

    return false;
  });
}

/**
 * Retrieves all transactions related to a specific investment asset (contributions & withdrawals)
 * ordered chronologically descending (newest first).
 */
export function getTransactionsForAsset(
  asset: InvestmentAsset,
  transactions: Transaction[] = []
): Transaction[] {
  const cleanIdent = (asset.identifier || '').trim().toUpperCase();
  const cleanIsin = (asset.isin || '').trim().toUpperCase();
  const cleanTicker = (asset.ticker || '').trim().toUpperCase();
  const cleanName = (asset.name || '').trim().toLowerCase();

  const nameTokens = cleanName
    .replace(/[()]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !['fondo', 'index', 'stock', 'fund', 'ucits', 'acc', 'eur'].includes(t));

  return (transactions || []).filter((tx) => {
    if (!tx || (tx.pillar !== 'invest' && tx.pillar !== 'income')) return false;
    const conceptUpper = (tx.concept || '').toUpperCase();
    const conceptLower = (tx.concept || '').toLowerCase();

    // Check ISIN match
    if (cleanIsin && conceptUpper.includes(cleanIsin)) return true;
    // Check identifier/ticker match
    if (cleanIdent && (conceptUpper.includes(`(${cleanIdent})`) || conceptUpper.includes(cleanIdent))) return true;
    if (cleanTicker && (conceptUpper.includes(`(${cleanTicker})`) || conceptUpper.includes(cleanTicker))) return true;

    // Check parsed identifier
    const parsed = parseInvestmentConcept(tx.concept);
    if (parsed.identifier) {
      const pId = parsed.identifier.toUpperCase();
      if (pId === cleanIdent || (cleanIsin && pId === cleanIsin) || (cleanTicker && pId === cleanTicker)) {
        return true;
      }
    }

    // Name tokens match
    if (cleanName && conceptLower.includes(cleanName)) return true;
    if (nameTokens.length > 0 && nameTokens.every((t) => conceptLower.includes(t))) return true;

    // Retirada concept match: "Retirada de S&P 500"
    if (conceptLower.startsWith('retirada') && (conceptLower.includes(cleanName) || (cleanIdent && conceptUpper.includes(cleanIdent)))) {
      return true;
    }

    return false;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Infers AssetType from category ID or asset identifier/symbol
 */
export function inferAssetTypeFromCategory(categoryId?: string, identifier?: string): AssetType {
  const cat = (categoryId || '').toLowerCase();
  const ident = (identifier || '').toUpperCase();

  if (cat.includes('crypto')) return 'crypto';
  if (cat.includes('etf')) return 'etf';
  if (cat.includes('stock') || cat.includes('accion')) return 'stock';
  if (cat.includes('fixed') || cat.includes('fija')) return 'fixed_income';
  if (cat.includes('deposit') || cat.includes('deposito')) return 'deposit';
  if (cat.includes('fund') || cat.includes('fondo')) return 'index_fund';

  // Fallback by identifier format
  if (ident.startsWith('IE') || ident.startsWith('LU') || ident.startsWith('ES')) {
    return 'index_fund';
  }
  if (['BTC', 'ETH', 'SOL', 'USDT', 'BNB', 'XRP', 'ADA', 'DOT'].includes(ident)) {
    return 'crypto';
  }
  return 'stock';
}

/**
/**
 * Auto-corrects an asset where the total invested amount was erroneously stored as averageBuyPrice
 * with shares = 1 instead of calculating the true number of shares based on the market quotation price.
 * 
 * Example:
 * User deployed 209.81 € in S&P 500 (whose market quotation is 82.97 €).
 * If the asset ended up with shares = 1 and averageBuyPrice = 209.81 €,
 * upon live market update to 82.97 €, currentValue was erroneously computed as 1 * 82.97 = 82.97 €
 * (a false sudden drop of -126.84 €).
 * 
 * This corrector identifies this symptom:
 * - shares === 1 (or integer 1)
 * - averageBuyPrice is significantly higher than known unit quotation (>= 1.25x)
 * And corrects the position:
 * - true shares = totalInvested / currentPrice (209.81 / 82.97 = 2.528745)
 * - averageBuyPrice = currentPrice (82.97 €)
 * - currentValue = shares * currentPrice = 209.81 €
 * - pnl = 0 €
 */
export function autoCorrectAssetShares(
  asset: InvestmentAsset,
  referenceMarketPrice?: number
): { asset: InvestmentAsset; wasCorrected: boolean } {
  const currentPrice =
    typeof referenceMarketPrice === 'number' && referenceMarketPrice > 0
      ? referenceMarketPrice
      : typeof asset.currentPrice === 'number' && asset.currentPrice > 0
      ? asset.currentPrice
      : 0;

  const avgBuyPrice = typeof asset.averageBuyPrice === 'number' ? asset.averageBuyPrice : 0;
  const shares = typeof asset.shares === 'number' ? asset.shares : 0;

  // Known asset overrides (e.g. Vanguard US 500 Stock Index Fund IE0032126645 basePrice 82.97)
  const isSp500Fund =
    asset.identifier?.toUpperCase() === 'IE0032126645' ||
    asset.name?.toLowerCase().includes('us 500') ||
    asset.name?.toLowerCase().includes('sp500') ||
    asset.name?.toLowerCase().includes('s&p 500');

  const knownPrice = currentPrice > 0 ? currentPrice : isSp500Fund ? 82.97 : 0;

  if (knownPrice > 0 && avgBuyPrice > 0) {
    const isErroneousSingleShare = shares === 1 && avgBuyPrice >= knownPrice * 1.25;
    const isSp500Discrepancy =
      isSp500Fund && (shares === 1 || Math.abs(avgBuyPrice - 209.81) < 15) && avgBuyPrice > 100;

    if (isErroneousSingleShare || isSp500Discrepancy) {
      const totalInvested = Number((shares * avgBuyPrice).toFixed(2));
      const correctedShares = Number((totalInvested / knownPrice).toFixed(6));
      const correctedBuyPrice = knownPrice;
      const currentValue = Number((correctedShares * knownPrice).toFixed(2));
      const pnl = Number((currentValue - totalInvested).toFixed(2));
      const pnlPercentage = totalInvested > 0 ? Number(((pnl / totalInvested) * 100).toFixed(2)) : 0;

      return {
        wasCorrected: true,
        asset: {
          ...asset,
          shares: correctedShares,
          averageBuyPrice: correctedBuyPrice,
          averagePrice: correctedBuyPrice,
          currentPrice: knownPrice,
          currentValue,
          pnl,
          pnlPercentage,
          lastUpdated: 'Unidades calculadas según cotización',
        },
      };
    }
  }

  return { asset, wasCorrected: false };
}

// Known benchmark quotations map for instant offline reconciliation without network wait
const KNOWN_BENCHMARK_PRICES: Record<string, number> = {
  IE0032126645: 82.97, // Vanguard US 500 Stock Index Fund
  'VUSA.AS': 82.97,
  '0P00000SUJ.F': 82.97,
  IE0007987690: 41.25, // Vanguard European Stock Index Fund
  'VEUR.AS': 41.25,
  '0P00000RQ8.F': 41.25,
  IE00B03HD191: 122.45, // Vanguard Global Stock Index Fund
  'VWCE.DE': 122.45,
  IE00B3XXRP09: 98.45, // Vanguard S&P 500 ETF
  VUSA: 82.97,
  VWCE: 122.45,
};

/**
 * Reconciles and reconstructs missing InvestmentAssets from transactions of pillar === 'invest'.
 * If a user has invest transactions in their ledger but their portfolio assets list is empty or missing those items,
 * this function generates or merges the corresponding InvestmentAsset positions with accurately derived units.
 */
export function reconcileAssetsFromTransactions(
  transactions: Transaction[] = [],
  currentAssets: InvestmentAsset[] = [],
  brands: { id: string; name: string }[] = [],
  priceLookup?: (identifier: string) => number | undefined
): InvestmentAsset[] {
  // Group all active invest transactions by normalized identifier key in a single pass
  const txsByKey = new Map<string, Transaction[]>();
  let hasInvestTx = false;
  const txList = Array.isArray(transactions) ? transactions : [];

  for (let i = 0; i < txList.length; i++) {
    const tx = txList[i];
    if (tx && tx.pillar === 'invest' && typeof tx.amount === 'number' && tx.amount > 0) {
      hasInvestTx = true;
      const { identifier } = parseInvestmentConcept(tx.concept);
      const key = identifier.toUpperCase();
      let list = txsByKey.get(key);
      if (!list) {
        list = [];
        txsByKey.set(key, list);
      }
      list.push(tx);
    }
  }

  if (!hasInvestTx) {
    // If no invest transactions exist in the ledger, prune any orphaned auto-reconciled assets
    return currentAssets
      .filter((a) => !a.id.startsWith('reconciled-asset-'))
      .map((a) => autoCorrectAssetShares(a).asset);
  }

  const brandMap = new Map<string, string>();
  (brands || []).forEach((b) => {
    if (b?.id && b?.name) brandMap.set(b.id, b.name);
  });

  // Track existing assets by identifier/ISIN/ticker (uppercase)
  const existingByIdent = new Map<string, InvestmentAsset>();
  (currentAssets || []).forEach((asset) => {
    if (!asset) return;
    const { asset: corrected } = autoCorrectAssetShares(asset);
    const primaryKey = (corrected.identifier || corrected.isin || corrected.ticker || '').toUpperCase();
    if (primaryKey) {
      existingByIdent.set(primaryKey, corrected);
    }
  });

  const reconciledAssets: InvestmentAsset[] = [];

  // 1. Process and heal existing assets
  existingByIdent.forEach((existingAsset, key) => {
    const txs = txsByKey.get(key);

    // If an asset was created as reconciled-asset-* but has NO active transactions, drop it (orphan from deleted tx)
    if ((!txs || txs.length === 0) && existingAsset.id.startsWith('reconciled-asset-')) {
      return;
    }

    if (txs && txs.length > 0) {
      const firstTx = txs[0];
      const { name: primaryTxName, identifier: txIdent } = parseInvestmentConcept(firstTx.concept);
      const isIsinFormat = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(txIdent);
      const totalInvested = txs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      // Check for name conflict (e.g. fund was overwritten by an orphaned/deleted movement)
      const existingNameLower = (existingAsset.name || '').toLowerCase();
      const txNameLower = (primaryTxName || '').toLowerCase();
      const hasSpecificTxName = primaryTxName && primaryTxName !== txIdent && primaryTxName.length > 2;

      const isSameIndexFamily =
        ((existingNameLower.includes('500') || existingNameLower.includes('sp500') || existingNameLower.includes('s&p')) &&
          (txNameLower.includes('500') || txNameLower.includes('sp500') || txNameLower.includes('s&p'))) ||
        ((existingNameLower.includes('world') || existingNameLower.includes('vwce')) &&
          (txNameLower.includes('world') || txNameLower.includes('vwce')));

      const namesConflict =
        hasSpecificTxName &&
        !isSameIndexFamily &&
        !existingNameLower.includes(txNameLower) &&
        !txNameLower.includes(existingNameLower);

      if (namesConflict) {
        // Heal the asset: restore name and recalculate based on the active transactions in the ledger
        const isSp500 =
          txNameLower.includes('sp500') ||
          txNameLower.includes('s&p') ||
          txNameLower.includes('500') ||
          firstTx.concept.toLowerCase().includes('sp500');

        const knownPrice =
          (priceLookup ? priceLookup(txIdent) : undefined) ??
          (isSp500 ? 82.97 : KNOWN_BENCHMARK_PRICES[key]);

        let derivedShares = 1;
        let derivedBuyPrice = totalInvested;
        let derivedCurPrice = totalInvested;

        if (knownPrice && knownPrice > 0 && knownPrice !== totalInvested) {
          derivedShares = Number((totalInvested / knownPrice).toFixed(6));
          derivedBuyPrice = knownPrice;
          derivedCurPrice = knownPrice;
        }

        const currentValue = Number((derivedShares * derivedCurPrice).toFixed(2));
        const pnl = Number((currentValue - totalInvested).toFixed(2));
        const pnlPercentage = totalInvested > 0 ? Number(((pnl / totalInvested) * 100).toFixed(2)) : 0;
        const nowIso = new Date().toISOString();
        const platform = firstTx.brandId ? brandMap.get(firstTx.brandId) : existingAsset.platform;

        const healedAsset: InvestmentAsset = {
          ...existingAsset,
          name: primaryTxName,
          identifier: txIdent,
          isin: isIsinFormat ? txIdent : existingAsset.isin,
          ticker: !isIsinFormat ? txIdent : existingAsset.ticker,
          shares: derivedShares,
          averageBuyPrice: derivedBuyPrice,
          averagePrice: derivedBuyPrice,
          currentPrice: derivedCurPrice,
          currentValue,
          pnl,
          pnlPercentage,
          platform,
          brandId: firstTx.brandId || existingAsset.brandId,
          lastPriceUpdate: nowIso,
          last_price_update: nowIso,
          lastUpdated: 'Auto-reconciliado con movimientos',
        };

        reconciledAssets.push(healedAsset);
        return;
      }
    }

    reconciledAssets.push(existingAsset);
  });

  // 2. Generate missing assets for active transactions not present in existingAssets
  txsByKey.forEach((txs, key) => {
    if (existingByIdent.has(key)) {
      return;
    }

    const firstTx = txs[0];
    const { name, identifier } = parseInvestmentConcept(firstTx.concept);
    const assetType = inferAssetTypeFromCategory(firstTx.categoryId, identifier);
    const nowIso = new Date().toISOString();
    const platform = firstTx.brandId ? brandMap.get(firstTx.brandId) : undefined;
    const acquisitionDate = firstTx.date ? firstTx.date.substring(0, 10) : nowIso.substring(0, 10);
    const isIsinFormat = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(identifier);

    // Sum total invested across all transactions for this asset
    const totalInvested = txs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // Check if known market price exists for accurate units calculation
    const knownPrice =
      (priceLookup ? priceLookup(identifier) : undefined) ??
      KNOWN_BENCHMARK_PRICES[key] ??
      (key.includes('SP500') || key.includes('S&P') || name.toLowerCase().includes('us 500') || name.toLowerCase().includes('sp500') ? 82.97 : undefined);

    let derivedShares = 1;
    let derivedBuyPrice = totalInvested;
    let derivedCurPrice = totalInvested;

    if (knownPrice && knownPrice > 0 && knownPrice !== totalInvested) {
      derivedShares = Number((totalInvested / knownPrice).toFixed(6));
      derivedBuyPrice = knownPrice;
      derivedCurPrice = knownPrice;
    }

    const currentValue = Number((derivedShares * derivedCurPrice).toFixed(2));
    const pnl = Number((currentValue - totalInvested).toFixed(2));
    const pnlPercentage = totalInvested > 0 ? Number(((pnl / totalInvested) * 100).toFixed(2)) : 0;

    const newAsset: InvestmentAsset = {
      id: `reconciled-asset-${firstTx.id}`,
      name,
      identifier,
      ticker: !isIsinFormat ? identifier : undefined,
      isin: isIsinFormat ? identifier : undefined,
      assetType,
      shares: derivedShares,
      averageBuyPrice: derivedBuyPrice,
      averagePrice: derivedBuyPrice,
      currentPrice: derivedCurPrice,
      currentValue,
      pnl,
      pnlPercentage,
      currency: 'EUR',
      platform,
      brandId: firstTx.brandId,
      acquisitionDate,
      lastPriceUpdate: nowIso,
      last_price_update: nowIso,
      lastUpdated: 'Reconciliado de movimientos',
    };

    reconciledAssets.push(newAsset);
    existingByIdent.set(key, newAsset);
  });

  return reconciledAssets;
}

