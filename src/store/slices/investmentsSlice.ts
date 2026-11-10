import type { InvestmentAsset } from '../../types/finance';
import type { InvestmentsSlice, StoreSet, StoreGet } from '../types';
import {
  batchUpdateMarketQuotes,
  resetSwrTimestamps,
  isIsin,
  CURATED_MARKET_ASSETS,
} from '../../services/marketDataService';
import {
  findMatchingAssetIndex,
  autoCorrectAssetShares,
  reconcileAssetsFromTransactions,
} from '../../utils/finance';
import {
  insertCloudAsset,
  deleteCloudAsset,
  updateCloudAssetPrice,
} from '../../services/cloudSyncService';
import { generateUuid } from '../../lib/supabaseClient';

export const createInvestmentsSlice = (set: StoreSet, get: StoreGet): InvestmentsSlice => ({
  addAsset: (assetData) => {
    const { assets, userId } = get();
    const existingIdx = findMatchingAssetIndex(assets, assetData);

    if (existingIdx !== -1) {
      // Accumulate into existing asset (sum shares & recalculate weighted average buy price)
      const existing = assets[existingIdx];
      const oldShares = Number(existing.shares) || 0;
      const oldAvgPrice = Number(existing.averageBuyPrice) || 0;
      const oldTotalCost = oldShares * oldAvgPrice;

      const newShares = Number(assetData.shares) || 0;
      const newBuyPrice = Number(assetData.averageBuyPrice) || 0;
      const newTotalCost = newShares * newBuyPrice;

      const combinedShares = Number((oldShares + newShares).toFixed(6));
      const combinedTotalCost = oldTotalCost + newTotalCost;
      const combinedAvgPrice =
        combinedShares > 0 ? Number((combinedTotalCost / combinedShares).toFixed(4)) : newBuyPrice;
      const latestPrice = Number(assetData.currentPrice) || Number(existing.currentPrice) || combinedAvgPrice;
      const currentValue = Number((combinedShares * latestPrice).toFixed(2));
      const pnl = Number((currentValue - combinedTotalCost).toFixed(2));
      const pnlPercentage =
        combinedTotalCost > 0 ? Number(((pnl / combinedTotalCost) * 100).toFixed(2)) : 0;
      const combinedFee = (Number(existing.initialFee) || 0) + (Number(assetData.initialFee) || 0);
      const nowIso = new Date().toISOString();

      const updatedAsset: InvestmentAsset = {
        ...existing,
        shares: combinedShares,
        averageBuyPrice: combinedAvgPrice,
        averagePrice: combinedAvgPrice,
        currentPrice: latestPrice,
        currentValue,
        pnl,
        pnlPercentage,
        initialFee: combinedFee > 0 ? combinedFee : undefined,
        quoteTicker: assetData.quoteTicker || existing.quoteTicker,
        quote_ticker: assetData.quote_ticker || existing.quote_ticker,
        lastPriceUpdate: nowIso,
        last_price_update: nowIso,
        lastUpdated: 'Posición acumulada',
        isOfflineCached:
          assetData.isOfflineCached !== undefined ? assetData.isOfflineCached : existing.isOfflineCached,
      };

      const nextAssets = [...assets];
      nextAssets[existingIdx] = updatedAsset;
      set({ assets: nextAssets });

      if (userId) {
        insertCloudAsset(updatedAsset, userId).catch((err) =>
          console.warn('[Store] Cloud sync failed for accumulate asset:', err)
        );
      }
      return;
    }

    // New asset registration
    const shares = Number(assetData.shares) || 0;
    const buyPrice = Number(assetData.averageBuyPrice) || 0;
    const curPrice = Number(assetData.currentPrice) || buyPrice;
    const currentValue = Number((shares * curPrice).toFixed(2));
    const pnl = Number((currentValue - (shares * buyPrice)).toFixed(2));
    const pnlPercentage = buyPrice > 0 ? Number((((curPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;
    const nowIso = new Date().toISOString();

    const newAsset: InvestmentAsset = {
      ...assetData,
      id: generateUuid(),
      shares,
      averageBuyPrice: buyPrice,
      currentPrice: curPrice,
      currentValue,
      pnl,
      pnlPercentage,
      lastPriceUpdate: nowIso,
      last_price_update: nowIso,
      lastUpdated: 'Recién añadido',
    };
    set((state) => ({
      assets: [newAsset, ...state.assets],
    }));

    if (userId) {
      insertCloudAsset(newAsset, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for addAsset:', err)
      );
    }
  },

  deleteAsset: (id) => {
    const { userId } = get();
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    }));

    if (userId) {
      deleteCloudAsset(id, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for deleteAsset:', err)
      );
    }

    // Reconcile immediately so any shadowed active transaction is restored
    get().reconcileInvestments();
  },

  updateAsset: (id, updatedFields) => {
    const { assets, userId } = get();
    const existing = assets.find((a) => a.id === id);
    if (!existing) return;

    const nextShares =
      updatedFields.shares !== undefined ? Number(updatedFields.shares) : existing.shares;
    const nextBuyPrice =
      updatedFields.averageBuyPrice !== undefined
        ? Number(updatedFields.averageBuyPrice)
        : existing.averageBuyPrice;
    const nextCurrentPrice =
      updatedFields.currentPrice !== undefined
        ? Number(updatedFields.currentPrice)
        : (existing.currentPrice || nextBuyPrice);
    const nextFee =
      updatedFields.initialFee !== undefined
        ? Number(updatedFields.initialFee)
        : (existing.initialFee || 0);
    const nextTotalCost = nextShares * nextBuyPrice + nextFee;
    const nextCurrentValue = Number((nextShares * nextCurrentPrice).toFixed(2));
    const nextPnl = Number((nextCurrentValue - nextTotalCost).toFixed(2));
    const nextPnlPercentage =
      nextTotalCost > 0 ? Number(((nextPnl / nextTotalCost) * 100).toFixed(2)) : 0;
    const nowIso = new Date().toISOString();

    const updatedAsset: InvestmentAsset = {
      ...existing,
      ...updatedFields,
      shares: nextShares,
      averageBuyPrice: nextBuyPrice,
      averagePrice: nextBuyPrice,
      currentPrice: nextCurrentPrice,
      currentValue: nextCurrentValue,
      pnl: nextPnl,
      pnlPercentage: nextPnlPercentage,
      lastPriceUpdate: nowIso,
      last_price_update: nowIso,
      lastUpdated: 'Modificado manualmente',
    };

    set({
      assets: assets.map((a) => (a.id === id ? updatedAsset : a)),
    });

    if (userId) {
      insertCloudAsset(updatedAsset, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for updateAsset:', err)
      );
    }
  },

  withdrawAsset: (id, amount, destinationSourceId, date) => {
    const { assets, userId, addTransaction } = get();
    const existing = assets.find((a) => a.id === id);
    if (!existing) return;

    const curPrice = Number(existing.currentPrice) || Number(existing.averageBuyPrice) || 1;
    const safeAmount = Math.max(0, Number(amount) || 0);
    if (safeAmount <= 0) return;

    const sharesWithdrawn = curPrice > 0 ? safeAmount / curPrice : 0;
    const totalPositionValue = Number((existing.shares * curPrice).toFixed(2));
    const isFullWithdrawal = safeAmount >= totalPositionValue - 0.05;

    if (isFullWithdrawal) {
      // Posición liquidada por completo
      set((state) => ({
        assets: state.assets.filter((a) => a.id !== id),
      }));
      if (userId) {
        deleteCloudAsset(id, userId).catch((err) =>
          console.warn('[Store] Cloud sync failed for withdraw deleteAsset:', err)
        );
      }
    } else {
      // Retirada parcial: se reducen las participaciones correspondientes
      const remainingShares = Number(Math.max(0, existing.shares - sharesWithdrawn).toFixed(6));

      if (remainingShares <= 0.0001) {
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        }));
        if (userId) {
          deleteCloudAsset(id, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for withdraw deleteAsset:', err)
          );
        }
      } else {
        const nextCurrentValue = Number((remainingShares * curPrice).toFixed(2));
        const costBasis = remainingShares * existing.averageBuyPrice;
        const nextPnl = Number((nextCurrentValue - costBasis).toFixed(2));
        const nextPnlPercentage =
          costBasis > 0 ? Number(((nextPnl / costBasis) * 100).toFixed(2)) : 0;

        const updatedAsset: InvestmentAsset = {
          ...existing,
          shares: remainingShares,
          currentValue: nextCurrentValue,
          pnl: nextPnl,
          pnlPercentage: nextPnlPercentage,
          lastUpdated: 'Retirada parcial',
        };

        set((state) => ({
          assets: state.assets.map((a) => (a.id === id ? updatedAsset : a)),
        }));

        if (userId) {
          insertCloudAsset(updatedAsset, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for withdraw updateAsset:', err)
          );
        }
      }
    }

    // Registrar movimiento de ingreso en la cuenta destino seleccionada
    const txDate = date
      ? (date.includes('T') ? date : `${date}T12:00:00.000Z`)
      : new Date().toISOString();

    addTransaction({
      amount: safeAmount,
      shares: Number(sharesWithdrawn.toFixed(6)),
      unitPrice: curPrice,
      pillar: 'income',
      categoryId: 'cat-dividends',
      sourceId: destinationSourceId || undefined,
      concept: `Retirada de ${existing.name} (${existing.identifier})`,
      date: txDate,
    });
  },

  updateAssetPrice: (id, newPrice) => {
    const { userId } = get();
    const nowIso = new Date().toISOString();
    set((state) => ({
      assets: state.assets.map((asset) => {
        if (asset.id !== id) return asset;
        const shares = Number(asset.shares) || 0;
        const buyPrice = Number(asset.averageBuyPrice) || 0; // NEVER alter buy price!
        const curPrice = Number(newPrice) || buyPrice;
        const currentValue = Number((shares * curPrice).toFixed(2));
        const pnl = Number((currentValue - (shares * buyPrice)).toFixed(2));
        const pnlPercentage = buyPrice > 0 ? Number((((curPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;
        return {
          ...asset,
          currentPrice: curPrice,
          currentValue,
          pnl,
          pnlPercentage,
          lastPriceUpdate: nowIso,
          last_price_update: nowIso,
          lastUpdated: 'Ahora mismo',
        };
      }),
    }));

    if (userId) {
      updateCloudAssetPrice(id, newPrice, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for updateAssetPrice:', err)
      );
    }
  },

  refreshAllAssetPrices: async () => {
    // Force bypass SWR freshness window so the user's manual refresh always fetches live data
    resetSwrTimestamps();
    set({ isLiveUpdating: true });
    try {
      const state = get();
      const queries = state.assets
        .filter((a) => a.assetType !== 'deposit')
        .map((a) => {
          const cleanIdent = a.identifier?.trim().toUpperCase() || '';
          const curatedMatch = CURATED_MARKET_ASSETS.find(
            (c) =>
              c.identifier.toUpperCase() === cleanIdent ||
              c.isin?.toUpperCase() === cleanIdent ||
              (c.keywords && c.keywords.some((k) => a.name?.toLowerCase().includes(k)))
          );
          const isin = a.isin || (isIsin(cleanIdent) ? cleanIdent : undefined) || curatedMatch?.isin;
          return {
            identifier: a.identifier,
            quoteTicker: a.quoteTicker || a.quote_ticker || curatedMatch?.quoteTicker,
            isin,
          };
        });
      const quotes = await batchUpdateMarketQuotes(queries, true);
      const syncTime = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const nowIso = new Date().toISOString();

      set((s) => ({
        lastSyncTimestamp: syncTime,
        assets: s.assets.map((asset) => {
          const cleanId = asset.identifier?.trim().toUpperCase() || '';
          const cleanIsin = asset.isin?.trim().toUpperCase() || '';
          const cleanTicker = (asset.quoteTicker || asset.quote_ticker)?.trim().toUpperCase() || '';

          const quote =
            quotes[asset.identifier] ||
            quotes[cleanId] ||
            (cleanTicker ? quotes[cleanTicker] || quotes[asset.quoteTicker!] : undefined) ||
            (cleanIsin ? quotes[cleanIsin] || quotes[asset.isin!] : undefined) ||
            (cleanId === 'IE0032126645' || asset.name?.toLowerCase().includes('us 500') || asset.name?.toLowerCase().includes('sp500')
              ? quotes['IE0032126645'] || quotes['0P00000SUJ.F']
              : undefined);

          if (quote) {
            // Auto-correct any single-share distorted cost position (e.g. S&P 500 total invested vs quotation)
            const { asset: correctedAsset, wasCorrected } = autoCorrectAssetShares(asset, Number(quote.price));
            const shares = Number(correctedAsset.shares) || 0;
            const buyPrice = Number(correctedAsset.averageBuyPrice) || 0;
            const curPrice = Number(quote.price) || buyPrice;
            const currentValue = Number((shares * curPrice).toFixed(2));
            const pnl = Number((currentValue - (shares * buyPrice)).toFixed(2));
            const pnlPercentage = buyPrice > 0 ? Number((((curPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;
            const resolvedTicker = quote.quoteTicker || asset.quoteTicker || asset.quote_ticker;

            if (wasCorrected && get().userId) {
              insertCloudAsset(correctedAsset, get().userId!).catch(() => {});
            }

            return {
              ...correctedAsset,
              currentPrice: curPrice,
              currentValue,
              pnl,
              pnlPercentage,
              quoteTicker: resolvedTicker,
              quote_ticker: resolvedTicker,
              lastPriceUpdate: nowIso,
              last_price_update: nowIso,
              change24h: quote.change24h,
              isOfflineCached: quote.isOfflineCached,
              lastUpdated: quote.isOfflineCached
                ? `En caché (${quote.lastUpdated})`
                : `En vivo (${quote.lastUpdated})`,
            };
          }
          return asset;
        }),
      }));
    } finally {
      set({ isLiveUpdating: false });
    }
  },

  syncStaleAssetQuotes: async (maxAgeHours = 6) => {
    const state = get();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    const now = Date.now();

    const staleAssets = state.assets.filter((a) => {
      if (a.assetType === 'deposit') return false;
      const ts = a.lastPriceUpdate || a.last_price_update;
      if (!ts) return true;
      const parsed = new Date(ts).getTime();
      if (isNaN(parsed)) return true;
      return now - parsed > maxAgeMs;
    });

    if (staleAssets.length === 0) return;

    try {
      const queries = staleAssets.map((a) => {
        const cleanIdent = a.identifier?.trim().toUpperCase() || '';
        const curatedMatch = CURATED_MARKET_ASSETS.find(
          (c) =>
            c.identifier.toUpperCase() === cleanIdent ||
            c.isin?.toUpperCase() === cleanIdent ||
            (c.keywords && c.keywords.some((k) => a.name?.toLowerCase().includes(k)))
        );
        const isin = a.isin || (isIsin(cleanIdent) ? cleanIdent : undefined) || curatedMatch?.isin;
        return {
          identifier: a.identifier,
          quoteTicker: a.quoteTicker || a.quote_ticker || curatedMatch?.quoteTicker,
          isin,
        };
      });
      const quotes = await batchUpdateMarketQuotes(queries, true);
      const syncTime = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const nowIso = new Date().toISOString();

      set((s) => ({
        lastSyncTimestamp: syncTime,
        assets: s.assets.map((asset) => {
          const cleanId = asset.identifier?.trim().toUpperCase() || '';
          const cleanIsin = asset.isin?.trim().toUpperCase() || '';
          const cleanTicker = (asset.quoteTicker || asset.quote_ticker)?.trim().toUpperCase() || '';

          const quote =
            quotes[asset.identifier] ||
            quotes[cleanId] ||
            (cleanTicker ? quotes[cleanTicker] || quotes[asset.quoteTicker!] : undefined) ||
            (cleanIsin ? quotes[cleanIsin] || quotes[asset.isin!] : undefined) ||
            (cleanId === 'IE0032126645' || asset.name?.toLowerCase().includes('us 500') || asset.name?.toLowerCase().includes('sp500')
              ? quotes['IE0032126645'] || quotes['0P00000SUJ.F']
              : undefined);

          if (quote) {
            // Auto-correct any single-share distorted cost position (e.g. S&P 500 total invested vs quotation)
            const { asset: correctedAsset, wasCorrected } = autoCorrectAssetShares(asset, Number(quote.price));
            const shares = Number(correctedAsset.shares) || 0;
            const buyPrice = Number(correctedAsset.averageBuyPrice) || 0;
            const curPrice = Number(quote.price) || buyPrice;
            const currentValue = Number((shares * curPrice).toFixed(2));
            const pnl = Number((currentValue - (shares * buyPrice)).toFixed(2));
            const pnlPercentage = buyPrice > 0 ? Number((((curPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;
            const resolvedTicker = quote.quoteTicker || asset.quoteTicker || asset.quote_ticker;

            if (wasCorrected && get().userId) {
              insertCloudAsset(correctedAsset, get().userId!).catch(() => {});
            }

            // Only advance the lastPriceUpdate timestamp when we got a LIVE price.
            // If the quote is offline-cached (network failed), keep the old timestamp
            // so the asset remains stale and gets retried on the next session/boot.
            const gotLivePrice = !quote.isOfflineCached;
            const newLastPriceUpdate = gotLivePrice ? nowIso : (asset.lastPriceUpdate || asset.last_price_update);

            return {
              ...correctedAsset,
              currentPrice: curPrice,
              currentValue,
              pnl,
              pnlPercentage,
              quoteTicker: resolvedTicker,
              quote_ticker: resolvedTicker,
              lastPriceUpdate: newLastPriceUpdate,
              last_price_update: newLastPriceUpdate,
              change24h: quote.change24h,
              isOfflineCached: quote.isOfflineCached,
              lastUpdated: quote.isOfflineCached
                ? `En caché (${quote.lastUpdated})`
                : `En vivo (${quote.lastUpdated})`,
            };
          }
          return asset;
        }),
      }));
    } catch (err) {
      console.warn('[Store] Background syncStaleAssetQuotes error:', err);
    }
  },

  reconcileInvestments: () => {
    const { transactions, assets, brands, userId } = get();
    // 1. Run auto-correction on all existing assets
    let anyCorrected = false;
    const correctedAssets = assets.map((a) => {
      const { asset: fixed, wasCorrected } = autoCorrectAssetShares(a);
      if (wasCorrected) anyCorrected = true;
      return fixed;
    });

    // 2. Reconcile with transactions
    const reconciled = reconcileAssetsFromTransactions(transactions, correctedAssets, brands);

    const hasChanges =
      reconciled.length !== assets.length ||
      anyCorrected ||
      reconciled.some((ra, idx) => {
        const a = assets[idx];
        return (
          !a ||
          ra.id !== a.id ||
          ra.name !== a.name ||
          ra.shares !== a.shares ||
          ra.averageBuyPrice !== a.averageBuyPrice ||
          ra.identifier !== a.identifier
        );
      });

    if (hasChanges) {
      set({ assets: reconciled });
      if (userId) {
        reconciled.forEach((a) => {
          insertCloudAsset(a, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for reconcileInvestments asset:', err)
          );
        });
      }
      get().syncStaleAssetQuotes(0).catch(() => {});
    }
  },
});

