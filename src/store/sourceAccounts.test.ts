import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from './useFinanceStore';
import { computeSourceBalance, computeFinancialSummary } from '../utils/finance';
import type { SourceAccount, Transaction, InvestmentAsset } from '../types/finance';

describe('Sistema Multicuenta (Fuentes / SourceAccounts)', () => {
  beforeEach(() => {
    // Reset store to a clean state
    useFinanceStore.setState({
      transactions: [],
      sources: [],
      assets: [],
      recurrences: [],
      userId: null,
    });
  });

  describe('Cálculo de balance por fuente vs. balance global consolidado', () => {
    const sourceA: SourceAccount = {
      id: 'source-bbva',
      name: 'Nómina BBVA',
      type: 'bank',
      institution: 'BBVA',
      initialBalance: 1000,
      orderIndex: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    const sourceB: SourceAccount = {
      id: 'source-cash',
      name: 'Billetera Efectivo',
      type: 'cash',
      institution: 'Efectivo',
      initialBalance: 150,
      orderIndex: 1,
      createdAt: '2026-01-02T00:00:00.000Z',
    };

    const txs: Transaction[] = [
      // Source A transactions
      {
        id: 'tx-1',
        amount: 2500,
        pillar: 'income',
        categoryId: 'cat-salary',
        sourceId: 'source-bbva',
        concept: 'Nómina',
        date: '2026-03-01T10:00:00.000Z',
        createdAt: 1,
      },
      {
        id: 'tx-2',
        amount: 500,
        pillar: 'expense',
        categoryId: 'cat-housing',
        sourceId: 'source-bbva',
        concept: 'Alquiler',
        date: '2026-03-02T10:00:00.000Z',
        createdAt: 2,
      },
      {
        id: 'tx-3',
        amount: 300,
        pillar: 'invest',
        categoryId: 'cat-etf',
        sourceId: 'source-bbva',
        concept: 'Compra ETF Vanguard',
        date: '2026-03-03T10:00:00.000Z',
        createdAt: 3,
      },
      // Source B transactions
      {
        id: 'tx-4',
        amount: 45,
        pillar: 'expense',
        categoryId: 'cat-food',
        sourceId: 'source-cash',
        concept: 'Comida tapas',
        date: '2026-03-04T10:00:00.000Z',
        createdAt: 4,
      },
    ];

    const assets: InvestmentAsset[] = [
      {
        id: 'asset-1',
        name: 'Vanguard All-World',
        identifier: 'IE00BK5BQT80',
        assetType: 'etf',
        shares: 3,
        averageBuyPrice: 100,
        currentPrice: 110,
        currency: 'EUR',
        lastUpdated: 'Hoy',
      },
    ];

    it('calcula correctamente el balance neto individual de una cuenta bancaria', () => {
      const balanceA = computeSourceBalance(sourceA, txs);

      // Inicial: 1000 + Ingreso: 2500 - Gasto: 500 - Inversión salida: 300 = 2700
      expect(balanceA.initialBalance).toBe(1000);
      expect(balanceA.income).toBe(2500);
      expect(balanceA.expense).toBe(500);
      expect(balanceA.investExpense).toBe(300);
      expect(balanceA.netBalance).toBe(2700);
      expect(balanceA.transactionCount).toBe(3);
    });

    it('calcula correctamente el balance neto individual de una billetera de efectivo', () => {
      const balanceB = computeSourceBalance(sourceB, txs);

      // Inicial: 150 - Gasto: 45 = 105
      expect(balanceB.initialBalance).toBe(150);
      expect(balanceB.income).toBe(0);
      expect(balanceB.expense).toBe(45);
      expect(balanceB.investExpense).toBe(0);
      expect(balanceB.netBalance).toBe(105);
      expect(balanceB.transactionCount).toBe(1);
    });

    it('reconcilia la suma de los balances de las fuentes con el balance global consolidado', () => {
      const balanceA = computeSourceBalance(sourceA, txs);
      const balanceB = computeSourceBalance(sourceB, txs);
      const totalCashInSources = balanceA.netBalance + balanceB.netBalance; // 2700 + 105 = 2805

      const summary = computeFinancialSummary(txs, assets, [sourceA, sourceB]);

      // Portfolio Market Value: 3 shares * 110 = 330
      expect(summary.portfolioMarketValue).toBe(330);
      // Consolidated Net Worth = totalCashInSources (2805) + portfolioMarketValue (330) = 3135
      expect(summary.netBalance).toBe(totalCashInSources + summary.portfolioMarketValue);
      expect(summary.netBalance).toBe(3135);
    });
  });

  describe('Lógica de reordenación de fuentes (orderIndex) y selección predeterminada', () => {
    it('añade fuentes asignando orderIndex secuencial y permite reordenarlas', () => {
      const { addSource, reorderSources } = useFinanceStore.getState();

      const s1 = addSource({
        name: 'Cuenta Nómina',
        type: 'bank',
        institution: 'Santander',
        initialBalance: 500,
        orderIndex: 0,
      });

      const s2 = addSource({
        name: 'Ahorro Revolut',
        type: 'bank',
        institution: 'Revolut',
        initialBalance: 2000,
        orderIndex: 1,
      });

      const s3 = addSource({
        name: 'Efectivo',
        type: 'cash',
        institution: 'Efectivo',
        initialBalance: 80,
        orderIndex: 2,
      });

      let currentSources = useFinanceStore.getState().sources;
      expect(currentSources).toHaveLength(3);
      expect(currentSources[0].id).toBe(s1.id);
      expect(currentSources[1].id).toBe(s2.id);
      expect(currentSources[2].id).toBe(s3.id);

      // Reordenar: Mover s2 al primer puesto, luego s3, luego s1
      reorderSources([s2.id, s3.id, s1.id]);

      currentSources = useFinanceStore.getState().sources;
      expect(currentSources[0].id).toBe(s2.id);
      expect(currentSources[0].orderIndex).toBe(0);

      expect(currentSources[1].id).toBe(s3.id);
      expect(currentSources[1].orderIndex).toBe(1);

      expect(currentSources[2].id).toBe(s1.id);
      expect(currentSources[2].orderIndex).toBe(2);
    });

    it('la primera fuente según orderIndex es la predeterminada al consultar el store', () => {
      const { addSource } = useFinanceStore.getState();

      addSource({
        name: 'Segunda Cuenta',
        type: 'bank',
        initialBalance: 100,
        orderIndex: 1,
      });

      addSource({
        name: 'Primera Cuenta Principal',
        type: 'bank',
        initialBalance: 500,
        orderIndex: 0,
      });

      const sortedSources = useFinanceStore.getState().sources;
      expect(sortedSources[0].name).toBe('Primera Cuenta Principal');
      expect(sortedSources[0].orderIndex).toBe(0);
    });
  });

  describe('Flujo de Onboarding: Creación y garantía de fuente inicial', () => {
    it('crea automáticamente una fuente predeterminada si el usuario no tiene ninguna', () => {
      const { sources, ensureDefaultSource } = useFinanceStore.getState();
      expect(sources).toHaveLength(0);

      const createdSource = ensureDefaultSource();
      expect(createdSource).toBeDefined();
      expect(createdSource.name).toBe('Cuenta Principal');
      expect(createdSource.type).toBe('bank');
      expect(createdSource.orderIndex).toBe(0);

      const updatedSources = useFinanceStore.getState().sources;
      expect(updatedSources).toHaveLength(1);
      expect(updatedSources[0].id).toBe(createdSource.id);
    });

    it('retorna la fuente existente sin duplicar si ya existen fuentes', () => {
      const { addSource, ensureDefaultSource } = useFinanceStore.getState();

      const customSource = addSource({
        name: 'Mi Banco Sabadell',
        type: 'bank',
        institution: 'Sabadell',
        initialBalance: 1200,
        orderIndex: 0,
      });

      const result = ensureDefaultSource();
      expect(result.id).toBe(customSource.id);
      expect(useFinanceStore.getState().sources).toHaveLength(1);
    });
  });

  describe('Operaciones CRUD de fuentes', () => {
    it('permite actualizar nombre y balance inicial de una fuente', () => {
      const { addSource, updateSource, getSourceById } = useFinanceStore.getState();

      const source = addSource({
        name: 'Cuenta Nómina',
        type: 'bank',
        institution: 'BBVA',
        initialBalance: 500,
        orderIndex: 0,
      });

      updateSource(source.id, {
        name: 'Nómina BBVA Premium',
        initialBalance: 750,
      });

      const updated = getSourceById(source.id);
      expect(updated?.name).toBe('Nómina BBVA Premium');
      expect(updated?.initialBalance).toBe(750);
      expect(updated?.institution).toBe('BBVA');
    });

    it('permite eliminar una fuente y reindica automáticamente las fuentes restantes', () => {
      const { addSource, deleteSource } = useFinanceStore.getState();

      const s1 = addSource({ name: 'Cuenta 1', type: 'bank', orderIndex: 0 });
      const s2 = addSource({ name: 'Cuenta 2', type: 'bank', orderIndex: 1 });
      const s3 = addSource({ name: 'Cuenta 3', type: 'bank', orderIndex: 2 });

      deleteSource(s2.id);

      const remaining = useFinanceStore.getState().sources;
      expect(remaining).toHaveLength(2);
      expect(remaining[0].id).toBe(s1.id);
      expect(remaining[0].orderIndex).toBe(0);
      expect(remaining[1].id).toBe(s3.id);
      expect(remaining[1].orderIndex).toBe(1);
    });

    it('resetea activeSourceId a null si la fuente eliminada estaba activa', () => {
      const { addSource, deleteSource, setActiveSourceId } = useFinanceStore.getState();

      const s1 = addSource({ name: 'Cuenta Activa', type: 'bank', orderIndex: 0 });
      setActiveSourceId(s1.id);
      expect(useFinanceStore.getState().activeSourceId).toBe(s1.id);

      deleteSource(s1.id);
      expect(useFinanceStore.getState().activeSourceId).toBeNull();
    });

    it('permite conmutar activeSourceId entre fuentes y volver al modo global (null)', () => {
      const { addSource, setActiveSourceId } = useFinanceStore.getState();

      const s1 = addSource({ name: 'Cuenta BBVA', type: 'bank', orderIndex: 0 });
      const s2 = addSource({ name: 'Efectivo', type: 'cash', orderIndex: 1 });

      setActiveSourceId(s1.id);
      expect(useFinanceStore.getState().activeSourceId).toBe(s1.id);

      setActiveSourceId(s2.id);
      expect(useFinanceStore.getState().activeSourceId).toBe(s2.id);

      setActiveSourceId(null);
      expect(useFinanceStore.getState().activeSourceId).toBeNull();
    });
  });

  describe('Persistencia y resiliencia de fuentes al reiniciar sesión o app', () => {
    it('no borra las fuentes al asignar userId por primera vez (prevId === null en arranque)', () => {
      const { addSource, setUserId } = useFinanceStore.getState();

      // Simulate source created locally
      addSource({
        name: 'BBVA Principal',
        type: 'bank',
        institution: 'BBVA',
        initialBalance: 1200,
        orderIndex: 0,
      });

      expect(useFinanceStore.getState().sources).toHaveLength(1);

      // App starts and sets authenticated user
      setUserId('user-uuid-1234');

      // Sources must NOT be wiped
      expect(useFinanceStore.getState().userId).toBe('user-uuid-1234');
      expect(useFinanceStore.getState().sources).toHaveLength(1);
      expect(useFinanceStore.getState().sources[0].name).toBe('BBVA Principal');
    });

    it('no borra las fuentes al invocar setUserId con el mismo usuario', () => {
      const { addSource, setUserId } = useFinanceStore.getState();

      setUserId('user-uuid-1234');
      addSource({
        name: 'Billetera Efectivo',
        type: 'cash',
        initialBalance: 60,
        orderIndex: 0,
      });

      expect(useFinanceStore.getState().sources).toHaveLength(1);

      // Re-trigger with same ID (e.g. tab re-focus or session token refresh)
      setUserId('user-uuid-1234');

      expect(useFinanceStore.getState().sources).toHaveLength(1);
    });

    it('limpia las fuentes si cambia genuinamente a otro usuario (prevId !== userId)', () => {
      const { addSource, setUserId } = useFinanceStore.getState();

      setUserId('user-alice');
      addSource({
        name: 'Cuenta de Alice',
        type: 'bank',
        initialBalance: 3000,
        orderIndex: 0,
      });

      expect(useFinanceStore.getState().sources).toHaveLength(1);

      // Switch account on same browser without purge
      setUserId('user-bob');

      // Bob should NOT see Alice's sources
      expect(useFinanceStore.getState().userId).toBe('user-bob');
      expect(useFinanceStore.getState().sources).toHaveLength(0);
    });
  });
});

