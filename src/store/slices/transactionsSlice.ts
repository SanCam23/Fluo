import type { Transaction, InvestmentAsset } from '../../types/finance';
import type { TransactionsSlice, StoreSet, StoreGet } from '../types';
import { sortTransactionsDesc } from '../../utils/dates';
import { parseInvestmentConcept, findMatchingAssetIndex } from '../../utils/finance';
import {
  insertCloudTransaction,
  updateCloudTransaction,
  deleteCloudTransaction,
  insertCloudAsset,
  deleteCloudAsset,
} from '../../services/cloudSyncService';
import { generateUuid } from '../../lib/supabaseClient';

export const createTransactionsSlice = (set: StoreSet, get: StoreGet): TransactionsSlice => ({
  addTransaction: (txData) => {
    const newTx: Transaction = {
      ...txData,
      id: txData.id || generateUuid(),
      createdAt: txData.createdAt || Date.now(),
    };

    const { sources, userId } = get();
    let companionIncomeTx: Transaction | null = null;

    // Cajero automated companion deposit in cash account:
    // "Cajero, en este caso se registrara como gasto y automaticamente como ingreso en la cuenta en efectivo si el usuario tiene."
    // 1. Traspaso entre cuentas / billetera (Companion deposit in destination source)
    if (
      newTx.pillar === 'expense' &&
      txData.destinationSourceId &&
      txData.destinationSourceId !== newTx.sourceId
    ) {
      const destSource = sources.find((s) => s.id === txData.destinationSourceId);
      const originSource = sources.find((s) => s.id === newTx.sourceId);
      const transferId = newTx.transferId || `trf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const companionId = generateUuid();

      newTx.transferId = transferId;
      newTx.companionTxId = companionId;
      if (!newTx.concept || !newTx.concept.trim()) {
        newTx.concept = `Traspaso a ${destSource?.name || 'otra cuenta'}`;
      }

      const customDesc = newTx.concept?.trim();
      let incomeConcept = `Traspaso desde ${originSource?.name || 'otra cuenta'}`;
      if (customDesc && !customDesc.startsWith('Traspaso a ')) {
        incomeConcept = `Traspaso desde ${originSource?.name || 'otra cuenta'} (${customDesc})`;
      }

      companionIncomeTx = {
        id: companionId,
        amount: newTx.amount,
        pillar: 'income',
        categoryId: 'cat-transfer-income',
        sourceId: txData.destinationSourceId,
        concept: incomeConcept,
        date: newTx.date,
        isRecurring: newTx.isRecurring,
        recurrenceId: newTx.recurrenceId,
        createdAt: Date.now() + 1,
        transferId,
        companionTxId: newTx.id,
      };
    } else if (newTx.pillar === 'expense' && newTx.categoryId === 'cat-atm') {
      const cashSource = sources.find((s) => s.type === 'cash');
      if (cashSource && cashSource.id !== newTx.sourceId) {
        companionIncomeTx = {
          id: generateUuid(),
          amount: newTx.amount,
          pillar: 'income',
          categoryId: 'cat-atm',
          sourceId: cashSource.id,
          concept: newTx.concept
            ? `Ingreso en efectivo (${newTx.concept})`
            : 'Ingreso en efectivo (Cajero)',
          date: newTx.date,
          createdAt: Date.now() + 1,
        };
      }
    }

    const txsToAdd = companionIncomeTx ? [newTx, companionIncomeTx] : [newTx];

    set((state) => ({
      transactions: sortTransactionsDesc([...txsToAdd, ...state.transactions]),
    }));

    if (userId) {
      txsToAdd.forEach((tx) => {
        insertCloudTransaction(tx, userId).catch((err) =>
          console.warn('[Store] Cloud sync failed for addTransaction:', err)
        );
      });
    }
  },

  transferBetweenSources: ({
    amount,
    fromSourceId,
    toSourceId,
    date,
    concept,
    isRecurring,
    recurrenceId,
  }) => {
    const { sources, userId } = get();
    const fromSource = sources.find((s) => s.id === fromSourceId);
    const toSource = sources.find((s) => s.id === toSourceId);

    const txDate = date
      ? (date.includes('T') ? date : `${date}T12:00:00.000Z`)
      : new Date().toISOString();

    const transferId = `trf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const expenseId = generateUuid();
    const incomeId = generateUuid();

    const expenseDesc = concept?.trim()
      ? `Traspaso a ${toSource?.name || 'otra cuenta'} (${concept.trim()})`
      : `Traspaso a ${toSource?.name || 'otra cuenta'}`;

    const incomeDesc = concept?.trim()
      ? `Traspaso desde ${fromSource?.name || 'otra cuenta'} (${concept.trim()})`
      : `Traspaso desde ${fromSource?.name || 'otra cuenta'}`;

    const expenseTx: Transaction = {
      id: expenseId,
      amount,
      pillar: 'expense',
      categoryId: 'cat-transfer-out',
      sourceId: fromSourceId,
      concept: expenseDesc,
      date: txDate,
      isRecurring: isRecurring || false,
      recurrenceId,
      createdAt: Date.now(),
      transferId,
      companionTxId: incomeId,
    };

    const incomeTx: Transaction = {
      id: incomeId,
      amount,
      pillar: 'income',
      categoryId: 'cat-transfer-income',
      sourceId: toSourceId,
      concept: incomeDesc,
      date: txDate,
      isRecurring: isRecurring || false,
      recurrenceId,
      createdAt: Date.now() + 1,
      transferId,
      companionTxId: expenseId,
    };

    set((state) => ({
      transactions: sortTransactionsDesc([expenseTx, incomeTx, ...state.transactions]),
    }));

    if (userId) {
      insertCloudTransaction(expenseTx, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for transfer expenseTx:', err)
      );
      insertCloudTransaction(incomeTx, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for transfer incomeTx:', err)
      );
    }

    return { expenseTx, incomeTx };
  },

  updateTransaction: (id, updatedFields) => {
    const { userId, transactions, assets } = get();
    const oldTx = transactions.find((tx) => tx.id === id);

    // Companion transfer synchronization: keep paired transfer transaction in sync (amount & date)
    let companionUpdates: Partial<Transaction> | null = null;
    let companionId: string | null = null;
    if (oldTx && (oldTx.transferId || oldTx.companionTxId)) {
      const companion = transactions.find(
        (t) =>
          t.id !== id &&
          ((oldTx.transferId && t.transferId === oldTx.transferId) ||
            (oldTx.companionTxId && t.id === oldTx.companionTxId))
      );
      if (companion) {
        companionId = companion.id;
        companionUpdates = {};
        if (updatedFields.amount !== undefined) companionUpdates.amount = updatedFields.amount;
        if (updatedFields.date !== undefined) companionUpdates.date = updatedFields.date;
      }
    }

    let nextAssets = assets;
    if (oldTx && oldTx.pillar === 'invest') {
      const oldAmount = Number(oldTx.amount) || 0;
      const newAmount = updatedFields.amount !== undefined ? Number(updatedFields.amount) || 0 : oldAmount;
      const diffAmount = newAmount - oldAmount;

      const { identifier: oldIdent, name: oldName } = parseInvestmentConcept(oldTx.concept);
      let assetIndex = findMatchingAssetIndex(assets, {
        identifier: oldIdent,
        name: oldName,
      });

      if (assetIndex === -1 && updatedFields.concept) {
        const { identifier: newIdent, name: newName } = parseInvestmentConcept(updatedFields.concept);
        assetIndex = findMatchingAssetIndex(assets, {
          identifier: newIdent,
          name: newName,
        });
      }

      if (assetIndex !== -1) {
        const targetAsset = assets[assetIndex];
        const avgPrice = Number(targetAsset.averageBuyPrice) || Number(targetAsset.currentPrice) || 1;

        // Derive shares for old tranche and new tranche
        const oldTxShares =
          typeof oldTx.shares === 'number' && oldTx.shares > 0
            ? oldTx.shares
            : typeof oldTx.unitPrice === 'number' && oldTx.unitPrice > 0
            ? oldAmount / oldTx.unitPrice
            : avgPrice > 0
            ? oldAmount / avgPrice
            : 0;

        const newTxShares =
          typeof updatedFields.shares === 'number' && updatedFields.shares > 0
            ? updatedFields.shares
            : typeof updatedFields.unitPrice === 'number' && updatedFields.unitPrice > 0
            ? newAmount / updatedFields.unitPrice
            : oldTxShares;

        const diffShares = newTxShares - oldTxShares;

        if (
          diffAmount !== 0 ||
          diffShares !== 0 ||
          (updatedFields.concept && updatedFields.concept !== oldTx.concept) ||
          updatedFields.brandId !== undefined
        ) {
          const currentShares = Number(targetAsset.shares) || 0;
          const currentTotalCost = currentShares * avgPrice;
          const updatedShares = Number(Math.max(0, currentShares + diffShares).toFixed(6));
          const updatedCost = Math.max(0, currentTotalCost + diffAmount);
          const updatedAvgPrice =
            updatedShares > 0 ? Number((updatedCost / updatedShares).toFixed(4)) : avgPrice;
          const curPrice = targetAsset.currentPrice || updatedAvgPrice;
          const currentValue = Number((updatedShares * curPrice).toFixed(2));
          const pnl = Number((currentValue - updatedCost).toFixed(2));
          const pnlPercentage = updatedCost > 0 ? Number(((pnl / updatedCost) * 100).toFixed(2)) : 0;

          let updatedName = targetAsset.name;
          let updatedIdent = targetAsset.identifier;
          if (updatedFields.concept && updatedFields.concept !== oldTx.concept) {
            const parsed = parseInvestmentConcept(updatedFields.concept);
            if (parsed.identifier && parsed.identifier !== targetAsset.identifier) {
              updatedIdent = parsed.identifier;
            }
            if (parsed.name && parsed.name !== targetAsset.name) {
              updatedName = parsed.name;
            }
          }

          const updatedAsset: InvestmentAsset = {
            ...targetAsset,
            name: updatedName,
            identifier: updatedIdent,
            shares: updatedShares,
            averageBuyPrice: updatedAvgPrice,
            averagePrice: updatedAvgPrice,
            currentValue,
            pnl,
            pnlPercentage,
            platform: updatedFields.brandId
              ? (get().getBrandById(updatedFields.brandId)?.name || targetAsset.platform)
              : targetAsset.platform,
            lastUpdated: 'Movimiento modificado',
          };

          nextAssets = [...assets];
          nextAssets[assetIndex] = updatedAsset;

          if (userId) {
            insertCloudAsset(updatedAsset, userId).catch((err) =>
              console.warn('[Store] Cloud sync failed for updateCloudAsset on editTransaction:', err)
            );
          }
        }
      }
    }

    set((state) => ({
      transactions: sortTransactionsDesc(
        state.transactions.map((tx) => {
          if (tx.id === id) {
            return { ...tx, ...updatedFields };
          }
          if (companionId && tx.id === companionId && companionUpdates) {
            return { ...tx, ...companionUpdates };
          }
          return tx;
        })
      ),
      assets: nextAssets,
    }));

    if (userId) {
      updateCloudTransaction(id, updatedFields, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for updateTransaction:', err)
      );
      if (companionId && companionUpdates) {
        updateCloudTransaction(companionId, companionUpdates, userId).catch((err) =>
          console.warn('[Store] Cloud sync failed for companion updateTransaction:', err)
        );
      }
    }
  },

  deleteTransaction: (id) => {
    const { userId, transactions, assets } = get();
    const txToDelete = transactions.find((tx) => tx.id === id);

    // 1. If it's an investment movement, deduct or remove from portfolio
    let nextAssets = assets;
    if (txToDelete && txToDelete.pillar === 'invest') {
      const { identifier: txIdent, name: txName } = parseInvestmentConcept(txToDelete.concept);
      const assetIndex = findMatchingAssetIndex(assets, {
        identifier: txIdent,
        name: txName,
      });

      if (assetIndex !== -1) {
        const targetAsset = assets[assetIndex];
        const txAmount = Number(txToDelete.amount) || 0;
        const avgPrice = Number(targetAsset.averageBuyPrice) || Number(targetAsset.currentPrice) || 1;
        const currentTotalCost = targetAsset.shares * avgPrice;

        // Shares corresponding to this transaction
        const sharesToRemove = avgPrice > 0 ? txAmount / avgPrice : 0;
        const remainingShares = Number(Math.max(0, targetAsset.shares - sharesToRemove).toFixed(6));
        const remainingCost = Math.max(0, currentTotalCost - txAmount);

        // If no shares remain (or was the only movement), delete asset from portfolio
        if (remainingShares <= 0.0001 || remainingCost <= 0.05) {
          nextAssets = assets.filter((_, idx) => idx !== assetIndex);
          if (userId) {
            deleteCloudAsset(targetAsset.id, userId).catch((err) =>
              console.warn('[Store] Cloud sync failed for deleteCloudAsset:', err)
            );
          }
        } else {
          // Deduct shares and cost from the asset
          const newAvgPrice =
            remainingShares > 0 ? Number((remainingCost / remainingShares).toFixed(4)) : avgPrice;
          const curPrice = targetAsset.currentPrice || newAvgPrice;
          const currentValue = Number((remainingShares * curPrice).toFixed(2));
          const pnl = Number((currentValue - remainingCost).toFixed(2));
          const pnlPercentage = remainingCost > 0 ? Number(((pnl / remainingCost) * 100).toFixed(2)) : 0;

          const updatedAsset: InvestmentAsset = {
            ...targetAsset,
            shares: remainingShares,
            averageBuyPrice: newAvgPrice,
            averagePrice: newAvgPrice,
            currentValue,
            pnl,
            pnlPercentage,
            lastUpdated: 'Aportación eliminada',
          };

          nextAssets = [...assets];
          nextAssets[assetIndex] = updatedAsset;

          if (userId) {
            insertCloudAsset(updatedAsset, userId).catch((err) =>
              console.warn('[Store] Cloud sync failed for updateCloudAsset on deleteTransaction:', err)
            );
          }
        }
      }
    }

    // 2. If it's a recurring movement, check and handle associated recurrence rule
    let nextRecurrences = get().recurrences;
    if (txToDelete && (txToDelete.isRecurring || txToDelete.recurrenceId)) {
      const matchedRule = txToDelete.recurrenceId
        ? nextRecurrences.find((r) => r.id === txToDelete.recurrenceId)
        : nextRecurrences.find(
            (r) =>
              r.pillar === txToDelete.pillar &&
              r.amount === txToDelete.amount &&
              (r.title.toLowerCase() === txToDelete.concept.toLowerCase() ||
                txToDelete.concept.toLowerCase().includes(r.title.toLowerCase()))
          );

      if (matchedRule) {
        nextRecurrences = nextRecurrences.filter((r) => r.id !== matchedRule.id);
      }
    }

    // 3. Companion transfer deletion: if deleting one side of a transfer, delete both sides
    let companionIdToDelete: string | null = null;
    if (txToDelete && (txToDelete.transferId || txToDelete.companionTxId)) {
      const companion = transactions.find(
        (t) =>
          t.id !== id &&
          ((txToDelete.transferId && t.transferId === txToDelete.transferId) ||
            (txToDelete.companionTxId && t.id === txToDelete.companionTxId))
      );
      if (companion) {
        companionIdToDelete = companion.id;
      }
    }

    set({
      transactions: transactions.filter((tx) => tx.id !== id && tx.id !== companionIdToDelete),
      assets: nextAssets,
      recurrences: nextRecurrences,
    });

    if (userId) {
      deleteCloudTransaction(id, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for deleteTransaction:', err)
      );
      if (companionIdToDelete) {
        deleteCloudTransaction(companionIdToDelete, userId).catch((err) =>
          console.warn('[Store] Cloud sync failed for delete companionTransaction:', err)
        );
      }
    }
  },
});

