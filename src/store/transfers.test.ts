import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from './useFinanceStore';
import { computeSourceBalance, computeFinancialSummary } from '../utils/finance';
import type { SourceAccount } from '../types/finance';

describe('Source Account Transfers (Cuentas <-> Cuentas / Billetera Efectivo)', () => {
  const bankA: SourceAccount = {
    id: 'source-bank-a',
    name: 'Cuenta Nómina BBVA',
    type: 'bank',
    institution: 'BBVA',
    initialBalance: 1000,
    orderIndex: 0,
    color: '#004481',
    createdAt: new Date('2026-01-01').toISOString(),
  };

  const bankB: SourceAccount = {
    id: 'source-bank-b',
    name: 'Ahorro Revolut',
    type: 'bank',
    institution: 'Revolut',
    initialBalance: 500,
    orderIndex: 1,
    color: '#0075eb',
    createdAt: new Date('2026-01-02').toISOString(),
  };

  const cashWallet: SourceAccount = {
    id: 'source-cash',
    name: 'Billetera Efectivo',
    type: 'cash',
    institution: 'Efectivo',
    initialBalance: 200,
    orderIndex: 2,
    color: '#10b981',
    createdAt: new Date('2026-01-03').toISOString(),
  };

  beforeEach(() => {
    useFinanceStore.setState({
      sources: [bankA, bankB, cashWallet],
      transactions: [],
      assets: [],
      recurrences: [],
      activeSourceId: null,
    });
  });

  it('should transfer money between two bank accounts (Bank -> Bank)', () => {
    const store = useFinanceStore.getState();

    // Transfer 150 € from bankA to bankB
    store.addTransaction({
      amount: 150,
      pillar: 'expense',
      categoryId: 'cat-transfer',
      sourceId: bankA.id,
      destinationSourceId: bankB.id,
      concept: 'Traspaso a Ahorro Revolut',
      date: new Date('2026-03-01T10:00:00.000Z').toISOString(),
    });

    const txs = useFinanceStore.getState().transactions;
    expect(txs.length).toBe(2);

    const expenseTx = txs.find((t) => t.sourceId === bankA.id);
    const incomeTx = txs.find((t) => t.sourceId === bankB.id);

    expect(expenseTx).toBeDefined();
    expect(expenseTx?.pillar).toBe('expense');
    expect(expenseTx?.amount).toBe(150);
    expect(expenseTx?.transferId).toBeDefined();
    expect(expenseTx?.companionTxId).toBe(incomeTx?.id);

    expect(incomeTx).toBeDefined();
    expect(incomeTx?.pillar).toBe('income');
    expect(incomeTx?.amount).toBe(150);
    expect(incomeTx?.transferId).toBe(expenseTx?.transferId);
    expect(incomeTx?.companionTxId).toBe(expenseTx?.id);

    // Verify Balances
    const balA = computeSourceBalance(bankA, txs);
    const balB = computeSourceBalance(bankB, txs);

    expect(balA.netBalance).toBe(850); // 1000 - 150
    expect(balB.netBalance).toBe(650); // 500 + 150

    // Total liquid wealth remains constant (1000 + 500 + 200 = 1700)
    const summary = computeFinancialSummary(txs, [], [bankA, bankB, cashWallet]);
    expect(summary.totalIncome).toBe(150);
    expect(summary.totalExpense).toBe(150);
  });

  it('should transfer money from Cash Wallet to a Bank Account (Wallet -> Bank)', () => {
    const store = useFinanceStore.getState();

    // Deposit 50 € from cash to bankA
    store.transferBetweenSources({
      amount: 50,
      fromSourceId: cashWallet.id,
      toSourceId: bankA.id,
      concept: 'Ingreso efectivo en cuenta',
      date: new Date('2026-03-02T12:00:00.000Z').toISOString(),
    });

    const txs = useFinanceStore.getState().transactions;
    expect(txs.length).toBe(2);

    const balCash = computeSourceBalance(cashWallet, txs);
    const balA = computeSourceBalance(bankA, txs);

    expect(balCash.netBalance).toBe(150); // 200 - 50
    expect(balA.netBalance).toBe(1050); // 1000 + 50
  });

  it('should transfer money from Bank Account to Cash Wallet (Bank -> Wallet)', () => {
    const store = useFinanceStore.getState();

    // Move 100 € from bankB to cashWallet
    store.transferBetweenSources({
      amount: 100,
      fromSourceId: bankB.id,
      toSourceId: cashWallet.id,
    });

    const txs = useFinanceStore.getState().transactions;
    const balB = computeSourceBalance(bankB, txs);
    const balCash = computeSourceBalance(cashWallet, txs);

    expect(balB.netBalance).toBe(400); // 500 - 100
    expect(balCash.netBalance).toBe(300); // 200 + 100
  });

  it('should keep companion transfer in sync when updating amount or date', () => {
    const store = useFinanceStore.getState();

    store.addTransaction({
      amount: 80,
      pillar: 'expense',
      categoryId: 'cat-transfer',
      sourceId: bankA.id,
      destinationSourceId: bankB.id,
      concept: 'Traspaso a Revolut',
      date: new Date('2026-03-01T10:00:00.000Z').toISOString(),
    });

    let txs = useFinanceStore.getState().transactions;
    const expenseTx = txs.find((t) => t.sourceId === bankA.id)!;
    const incomeTx = txs.find((t) => t.sourceId === bankB.id)!;

    // Update expense amount from 80 to 120 and new date
    const newDate = new Date('2026-03-05T15:00:00.000Z').toISOString();
    store.updateTransaction(expenseTx.id, {
      amount: 120,
      date: newDate,
    });

    txs = useFinanceStore.getState().transactions;
    const updatedExpense = txs.find((t) => t.id === expenseTx.id);
    const updatedIncome = txs.find((t) => t.id === incomeTx.id);

    expect(updatedExpense?.amount).toBe(120);
    expect(updatedExpense?.date).toBe(newDate);

    // Companion income must reflect identical amount and date
    expect(updatedIncome?.amount).toBe(120);
    expect(updatedIncome?.date).toBe(newDate);

    // Verify updated balances
    const balA = computeSourceBalance(bankA, txs);
    const balB = computeSourceBalance(bankB, txs);
    expect(balA.netBalance).toBe(880); // 1000 - 120
    expect(balB.netBalance).toBe(620); // 500 + 120
  });

  it('should atomically delete both sides of a transfer when one side is deleted', () => {
    const store = useFinanceStore.getState();

    store.addTransaction({
      amount: 200,
      pillar: 'expense',
      categoryId: 'cat-transfer',
      sourceId: bankA.id,
      destinationSourceId: bankB.id,
      concept: 'Traspaso a Revolut',
      date: new Date('2026-03-01T10:00:00.000Z').toISOString(),
    });

    let txs = useFinanceStore.getState().transactions;
    expect(txs.length).toBe(2);

    const expenseTx = txs.find((t) => t.sourceId === bankA.id)!;

    // Delete the expense side
    store.deleteTransaction(expenseTx.id);

    txs = useFinanceStore.getState().transactions;
    // Both sides must be completely removed
    expect(txs.length).toBe(0);

    const balA = computeSourceBalance(bankA, txs);
    const balB = computeSourceBalance(bankB, txs);
    expect(balA.netBalance).toBe(1000);
    expect(balB.netBalance).toBe(500);
  });

  it('should provide transfer categories with correct icons and metadata', () => {
    const store = useFinanceStore.getState();
    const catExpense = store.getCategoryById('cat-transfer');
    const catIncome = store.getCategoryById('cat-transfer-income');

    expect(catExpense).toBeDefined();
    expect(catExpense?.name).toBe('Traspaso');
    expect(catExpense?.icon).toBe('ArrowLeftRight');
    expect(catExpense?.pillar).toBe('expense');

    expect(catIncome).toBeDefined();
    expect(catIncome?.name).toBe('Traspaso recibido');
    expect(catIncome?.icon).toBe('ArrowLeftRight');
    expect(catIncome?.pillar).toBe('income');
  });
});
