import type {
  Transaction,
  InvestmentAsset,
  SourceAccount,
  SourceAssetHolding,
  InvestmentAccountSummary,
  AssetAllocationItem,
  BrokerMonthlyFlow,
  AssetProgressionDataPoint,
  AssetSeriesMeta,
  AssetProgressionResult,
} from '../types/finance';
import { computeSourceBalance } from './financialCalculations';
import { getTransactionsForAsset } from './investmentMatching';

export type { AssetProgressionDataPoint, AssetSeriesMeta, AssetProgressionResult };

export const KNOWN_INVESTMENT_BROKERS = [
  'myinvestor',
  'trade republic',
  'traderepublic',
  'degiro',
  'scalable capital',
  'scalable',
  'indexa capital',
  'indexa',
  'interactive brokers',
  'ibkr',
  'heytrade',
  'trading 212',
  'trading212',
  'etoro',
  'binance',
  'coinbase',
  'kraken',
  'bit2me',
  'bitpanda',
  'openbank inversores',
  'inversis',
];

/**
 * Checks whether a given source account represents an investment or broker account
 * (e.g., MyInvestor, Trade Republic, Scalable, DEGIRO, or type === 'investment').
 */
export function isInvestmentSource(source: SourceAccount | null | undefined): boolean {
  if (!source) return false;
  if (source.type === 'cash') return false;
  if (source.type === 'investment') return true;

  const inst = (source.institution || '').trim().toLowerCase();
  const name = (source.name || '').trim().toLowerCase();

  if (
    inst.includes('inversión') ||
    inst.includes('inversion') ||
    inst.includes('broker') ||
    inst.includes('cartera') ||
    inst.includes('valores')
  ) {
    return true;
  }

  if (
    name.includes('inversión') ||
    name.includes('inversion') ||
    name.includes('broker') ||
    name.includes('cartera') ||
    name.includes('valores')
  ) {
    return true;
  }

  return KNOWN_INVESTMENT_BROKERS.some((b) => inst.includes(b) || name.includes(b));
}

/**
 * Retrieves all portfolio holdings associated with a specific broker / source account,
 * calculating account-specific shares, cost, current value, P&L, and contribution history.
 */
export function getAssetsForSource(
  source: SourceAccount,
  transactions: Transaction[] = [],
  assets: InvestmentAsset[] = []
): SourceAssetHolding[] {
  if (!source) return [];

  const sourceInst = (source.institution || '').trim().toLowerCase();
  const sourceName = (source.name || '').trim().toLowerCase();
  const holdings: SourceAssetHolding[] = [];

  assets.forEach((asset) => {
    // 1. Check if asset belongs to this source
    const assetPlatform = (asset.platform || '').trim().toLowerCase();
    const isDirectSource = asset.sourceId === source.id;
    const isPlatformMatch =
      assetPlatform.length > 0 &&
      ((sourceInst.length > 0 && (assetPlatform === sourceInst || assetPlatform.includes(sourceInst) || sourceInst.includes(assetPlatform))) ||
        (sourceName.length > 0 && (assetPlatform === sourceName || assetPlatform.includes(sourceName) || sourceName.includes(assetPlatform))));
    const isBrandMatch = Boolean(asset.brandId && source.brandId && asset.brandId === source.brandId);

    const assetTxs = getTransactionsForAsset(asset, transactions);
    const sourceTxs = assetTxs.filter((tx) => tx.sourceId === source.id);
    const hasSourceTransactions = sourceTxs.length > 0;

    if (!isDirectSource && !isPlatformMatch && !isBrandMatch && !hasSourceTransactions) {
      return;
    }

    // 2. Compute shares and invested cost for this specific source
    let sourceShares = 0;
    let sourceInvestedCost = 0;

    if (hasSourceTransactions) {
      sourceTxs.forEach((tx) => {
        if (tx.pillar === 'invest') {
          sourceInvestedCost += tx.amount || 0;
          if (typeof tx.shares === 'number' && tx.shares > 0) {
            sourceShares += tx.shares;
          }
        }
      });

      // Fallback: If shares weren't stored on individual transactions
      if (sourceShares <= 0 && asset.averageBuyPrice > 0) {
        sourceShares = Number((sourceInvestedCost / asset.averageBuyPrice).toFixed(6));
      } else if (sourceShares <= 0 && asset.shares > 0 && (isDirectSource || isPlatformMatch)) {
        sourceShares = asset.shares;
      }
    } else {
      // Linked via platform name or sourceId without recorded transactions
      sourceShares = asset.shares || 0;
      sourceInvestedCost = sourceShares * (asset.averageBuyPrice || asset.currentPrice || 0);
    }

    if (sourceShares <= 0.000001 && sourceInvestedCost <= 0.01) {
      return;
    }

    const curPrice = asset.currentPrice || asset.averageBuyPrice || 0;
    const currentValue = Number((sourceShares * curPrice).toFixed(2));
    const pnl = Number((currentValue - sourceInvestedCost).toFixed(2));
    const pnlPercentage =
      sourceInvestedCost > 0 ? Number(((pnl / sourceInvestedCost) * 100).toFixed(2)) : 0;
    const avgBuyPrice = sourceShares > 0 ? sourceInvestedCost / sourceShares : asset.averageBuyPrice;

    holdings.push({
      asset,
      shares: sourceShares,
      averageBuyPrice: avgBuyPrice,
      investedCost: Number(sourceInvestedCost.toFixed(2)),
      currentValue,
      pnl,
      pnlPercentage,
      isProfit: pnl >= 0,
      contributions: sourceTxs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    });
  });

  return holdings.sort((a, b) => b.currentValue - a.currentValue);
}

/**
 * Computes complete financial metrics for an investment / broker account:
 * - Cash liquidity (uninvested balance)
 * - Invested capital (cost)
 * - Portfolio market value (current value)
 * - Total account value (cash + portfolio)
 * - Unrealized P&L ("cuánto está dando") in € and %
 */
export function computeInvestmentAccountSummary(
  source: SourceAccount,
  transactions: Transaction[] = [],
  assets: InvestmentAsset[] = []
): InvestmentAccountSummary {
  const baseBalance = computeSourceBalance(source, transactions);
  const holdings = getAssetsForSource(source, transactions, assets);

  let investedCapital = 0;
  let portfolioMarketValue = 0;

  holdings.forEach((h) => {
    investedCapital += h.investedCost;
    portfolioMarketValue += h.currentValue;
  });

  investedCapital = Number(investedCapital.toFixed(2));
  portfolioMarketValue = Number(portfolioMarketValue.toFixed(2));

  const unrealizedPnL = Number((portfolioMarketValue - investedCapital).toFixed(2));
  const unrealizedPnLPercentage =
    investedCapital > 0 ? Number(((unrealizedPnL / investedCapital) * 100).toFixed(2)) : 0;
  const isProfit = unrealizedPnL >= 0;

  const cashBalance = Number(baseBalance.netBalance.toFixed(2));
  const totalAccountValue = Number((cashBalance + portfolioMarketValue).toFixed(2));

  return {
    source,
    cashBalance,
    investedCapital,
    portfolioMarketValue,
    totalAccountValue,
    unrealizedPnL,
    unrealizedPnLPercentage,
    isProfit,
    assetsCount: holdings.length,
    holdings,
    income: baseBalance.income,
    expense: baseBalance.expense,
    investExpense: baseBalance.investExpense,
    transactionCount: baseBalance.transactionCount,
  };
}

// ============================================================================
// 11. Analítica de Cuentas Broker & Inversión
// ============================================================================

export const ASSET_TYPE_CONFIG: Record<string, { name: string; color: string }> = {
  etf: { name: 'ETFs', color: '#6366F1' },
  index_fund: { name: 'Fondos Indexados', color: '#8B5CF6' },
  stock: { name: 'Acciones', color: '#3B82F6' },
  crypto: { name: 'Criptoactivos', color: '#F59E0B' },
  fixed_income: { name: 'Renta Fija', color: '#10B981' },
  deposit: { name: 'Depósitos', color: '#14B8A6' },
  cash: { name: 'Efectivo / Liquidez', color: '#06B6D4' },
};

/**
 * Computes asset allocation breakdown by category and cash liquidity for a broker account.
 */
export function computeBrokerAssetAllocation(summary: InvestmentAccountSummary): AssetAllocationItem[] {
  const total = Math.max(0.01, summary.totalAccountValue);
  const byType: Record<string, { value: number; count: number }> = {};

  summary.holdings.forEach((h) => {
    const t = h.asset.assetType || 'etf';
    if (!byType[t]) byType[t] = { value: 0, count: 0 };
    byType[t].value += h.currentValue;
    byType[t].count += 1;
  });

  if (summary.cashBalance > 0.01) {
    byType['cash'] = { value: summary.cashBalance, count: 1 };
  }

  const items: AssetAllocationItem[] = Object.entries(byType).map(([typeId, data]) => {
    const config = ASSET_TYPE_CONFIG[typeId] || { name: typeId.toUpperCase(), color: '#94A3B8' };
    const val = Number(data.value.toFixed(2));
    const percentage = Number(((val / total) * 100).toFixed(1));
    return {
      id: typeId,
      name: config.name,
      value: val,
      percentage,
      color: config.color,
      count: data.count,
    };
  });

  return items.sort((a, b) => b.value - a.value);
}

/**
 * Computes monthly inflow, investment contributions, and withdrawals for a broker account.
 */
export function computeBrokerMonthlyFlows(
  sourceId: string,
  transactions: Transaction[] = [],
  monthCount: number = 5,
  referenceDate: Date = new Date()
): BrokerMonthlyFlow[] {
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const buckets: Record<string, BrokerMonthlyFlow> = {};

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = {
      label: monthNames[d.getMonth()],
      monthKey: key,
      inflow: 0,
      invested: 0,
      withdrawn: 0,
      netFlow: 0,
      order: d.getTime(),
    };
  }

  (transactions || []).forEach((tx) => {
    if (!tx || !tx.date || tx.sourceId !== sourceId) return;
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (buckets[key]) {
      const amt = typeof tx.amount === 'number' && !isNaN(tx.amount) ? tx.amount : 0;
      if (tx.pillar === 'income') {
        buckets[key].inflow += amt;
      } else if (tx.pillar === 'invest') {
        buckets[key].invested += amt;
      } else if (tx.pillar === 'expense') {
        buckets[key].withdrawn += amt;
      }
    }
  });

  return Object.values(buckets)
    .sort((a, b) => a.order - b.order)
    .map((b) => ({
      ...b,
      inflow: Number(b.inflow.toFixed(2)),
      invested: Number(b.invested.toFixed(2)),
      withdrawn: Number(b.withdrawn.toFixed(2)),
      netFlow: Number((b.inflow - b.withdrawn).toFixed(2)),
    }));
}

export interface RankedHoldingItem extends SourceAssetHolding {
  rank: number;
  weightPercentage: number;
}

/**
 * Computes ordered holdings ranked by market value with their weight in the broker account.
 */
export function computeBrokerHoldingsRanking(summary: InvestmentAccountSummary): RankedHoldingItem[] {
  const total = Math.max(0.01, summary.totalAccountValue);
  const sorted = [...summary.holdings].sort((a, b) => b.currentValue - a.currentValue);

  return sorted.map((h, idx) => ({
    ...h,
    rank: idx + 1,
    weightPercentage: Number(((h.currentValue / total) * 100).toFixed(1)),
  }));
}

export const ASSET_PROGRESSION_PALETTE = [
  '#6366F1', // Indigo (ETFs principales / Tech)
  '#F59E0B', // Amber (Bitcoin / Cripto)
  '#10B981', // Emerald (Renta Fija / Valor)
  '#EC4899', // Pink (Acciones Crecimiento)
  '#8B5CF6', // Purple (Ethereum / Fondos Indexados)
  '#06B6D4', // Cyan (Blue chips / Global)
  '#F97316', // Orange (Altcoins / Commodities)
  '#3B82F6', // Blue (S&P 500 / Finanzas)
  '#14B8A6', // Teal (Depósitos / Mercados Emergentes)
  '#A855F7', // Violet
  '#EAB308', // Yellow
  '#E11D48', // Rose
];

export function getAssetProgressionColor(asset: InvestmentAsset, index: number): string {
  const nameOrTicker = `${asset.ticker || ''} ${asset.identifier || ''} ${asset.name || ''}`.toUpperCase();
  if (nameOrTicker.includes('BTC') || nameOrTicker.includes('BITCOIN')) return '#F59E0B'; // Bitcoin Gold
  if (nameOrTicker.includes('ETH') || nameOrTicker.includes('ETHEREUM')) return '#8B5CF6'; // Ethereum Purple
  if (asset.assetType === 'etf' && index === 0) return '#6366F1'; // Vanguard/iShares Indigo
  return ASSET_PROGRESSION_PALETTE[index % ASSET_PROGRESSION_PALETTE.length];
}

/**
 * Computes time-series progression points for each individual investment asset.
 * Generates monthly coordinates of market valuation and invested capital for multi-line charting.
 */
export function computeAssetProgressionSeries(
  assets: InvestmentAsset[] = [],
  transactions: Transaction[] = [],
  monthCount: number = 6,
  referenceDate: Date = new Date()
): AssetProgressionResult {
  const assetList = Array.isArray(assets) ? assets : [];
  const txList = Array.isArray(transactions) ? transactions : [];

  if (assetList.length === 0) {
    return { series: [], assetsMeta: [] };
  }

  // 1. Prepare assets metadata
  const assetsMeta: AssetSeriesMeta[] = assetList.map((asset, idx) => {
    const shares = typeof asset.shares === 'number' && !isNaN(asset.shares) ? asset.shares : 0;
    const currentPrice = typeof asset.currentPrice === 'number' && !isNaN(asset.currentPrice) ? asset.currentPrice : 0;
    const avgPrice = typeof asset.averageBuyPrice === 'number' && !isNaN(asset.averageBuyPrice) ? asset.averageBuyPrice : currentPrice;

    const currentValue = Number((shares * currentPrice).toFixed(2));
    const investedCost = Number(((shares * avgPrice) + (asset.initialFee || 0)).toFixed(2));
    const unrealizedPnL = Number((currentValue - investedCost).toFixed(2));
    const unrealizedPnLPercentage = investedCost > 0
      ? Number(((unrealizedPnL / investedCost) * 100).toFixed(2))
      : 0;

    const cleanKey = `asset_${asset.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;

    return {
      id: asset.id,
      name: asset.name,
      ticker: asset.ticker || asset.identifier,
      isin: asset.isin,
      assetType: asset.assetType,
      color: getAssetProgressionColor(asset, idx),
      currentValue,
      investedCost,
      unrealizedPnL,
      unrealizedPnLPercentage,
      currentPrice,
      shares,
      dataKey: cleanKey,
    };
  });

  // 2. Build Month Buckets
  const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const now = referenceDate;
  const count = Math.max(2, Math.min(24, monthCount));

  // Buckets sorted chronological ascending: [oldestMonth, ..., currentMonth]
  const buckets: Array<{
    date: string;
    label: string;
    timestamp: number;
    isCurrentMonth: boolean;
  }> = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    const label = `${monthNamesShort[m]} '${String(y).slice(-2)}`;
    const isCurrent = i === 0;

    buckets.push({
      date: monthKey,
      label,
      timestamp: endOfMonth.getTime(),
      isCurrentMonth: isCurrent,
    });
  }

  // Pre-index transactions per asset
  const txByAsset = new Map<string, Transaction[]>();
  assetList.forEach((asset) => {
    txByAsset.set(asset.id, getTransactionsForAsset(asset, txList));
  });

  // 3. For each bucket, calculate each asset's money value and invested cost
  const series: AssetProgressionDataPoint[] = buckets.map((bucket, bIdx) => {
    const point: AssetProgressionDataPoint = {
      date: bucket.date,
      label: bucket.label,
      timestamp: bucket.timestamp,
      totalValue: 0,
      totalCost: 0,
    };

    let totalVal = 0;
    let totalCst = 0;

    assetsMeta.forEach((meta) => {
      const asset = assetList.find((a) => a.id === meta.id);
      if (!asset) return;

      const assetTxs = txByAsset.get(asset.id) || [];
      const isLatest = bucket.isCurrentMonth || bIdx === buckets.length - 1;

      if (isLatest) {
        point[meta.dataKey] = meta.currentValue;
        point[`${meta.dataKey}_cost`] = meta.investedCost;
        totalVal += meta.currentValue;
        totalCst += meta.investedCost;
        return;
      }

      // Past month: reconstruct accumulated shares and cost up to this bucket timestamp
      let accShares = 0;
      let accCost = 0;
      let hadTxsBeforeOrAtBucket = false;

      assetTxs.forEach((tx) => {
        if (!tx || !tx.date) return;
        const txTime = new Date(tx.date).getTime();
        if (txTime <= bucket.timestamp) {
          hadTxsBeforeOrAtBucket = true;
          const amt = typeof tx.amount === 'number' ? tx.amount : 0;
          if (tx.pillar === 'invest') {
            accCost += amt;
            if (typeof tx.shares === 'number' && tx.shares > 0) {
              accShares += tx.shares;
            } else if (tx.unitPrice && tx.unitPrice > 0) {
              accShares += amt / tx.unitPrice;
            } else if (meta.shares > 0 && meta.investedCost > 0) {
              accShares += (amt / meta.investedCost) * meta.shares;
            }
          } else if (tx.pillar === 'income') {
            accCost = Math.max(0, accCost - amt);
            if (typeof tx.shares === 'number' && tx.shares > 0) {
              accShares = Math.max(0, accShares - tx.shares);
            }
          }
        }
      });

      // Price estimation for past bucket:
      let estimatedPrice = meta.currentPrice;
      if (asset.historicalPrices && asset.historicalPrices.length > 0) {
        const bucketIso = bucket.date;
        const match = asset.historicalPrices
          .filter((hp) => hp.date.slice(0, 7) <= bucketIso)
          .sort((a, b) => b.date.localeCompare(a.date))[0];
        if (match && typeof match.price === 'number') {
          estimatedPrice = match.price;
        }
      } else {
        const progressRatio = bIdx / (buckets.length - 1);
        const avgBuy = typeof asset.averageBuyPrice === 'number' && asset.averageBuyPrice > 0
          ? asset.averageBuyPrice
          : meta.currentPrice;
        estimatedPrice = avgBuy + (meta.currentPrice - avgBuy) * progressRatio;
      }

      let assetValAtBucket = 0;
      if (hadTxsBeforeOrAtBucket) {
        if (accShares > 0) {
          assetValAtBucket = Number((accShares * estimatedPrice).toFixed(2));
        } else if (accCost > 0) {
          const pRatio = (asset.averageBuyPrice && asset.averageBuyPrice > 0)
            ? estimatedPrice / asset.averageBuyPrice
            : 1;
          assetValAtBucket = Number((accCost * pRatio).toFixed(2));
        }
      } else {
        const progressRatio = bIdx / (buckets.length - 1);
        const interpolatedCost = Number((meta.investedCost * (0.6 + 0.4 * progressRatio)).toFixed(2));
        const interpolatedVal = Number((interpolatedCost * (estimatedPrice / Math.max(1, asset.averageBuyPrice || estimatedPrice))).toFixed(2));

        accCost = interpolatedCost;
        assetValAtBucket = interpolatedVal;
      }

      point[meta.dataKey] = Math.max(0, assetValAtBucket);
      point[`${meta.dataKey}_cost`] = Math.max(0, accCost);
      totalVal += Math.max(0, assetValAtBucket);
      totalCst += Math.max(0, accCost);
    });

    point.totalValue = Number(totalVal.toFixed(2));
    point.totalCost = Number(totalCst.toFixed(2));
    return point;
  });

  return { series, assetsMeta };
}
