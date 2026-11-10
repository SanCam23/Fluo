import type { SourceAccount } from '../../types/finance';
import type { SourceAccountsSlice, StoreSet, StoreGet } from '../types';
import { computeSourceBalance } from '../../utils/finance';
import {
  insertCloudSource,
  updateCloudSource,
  reorderCloudSources,
  deleteCloudSource,
} from '../../services/cloudSyncService';
import { generateUuid } from '../../lib/supabaseClient';

let cachedSourcesRef: SourceAccount[] | null = null;
let sourceLookupMap = new Map<string, SourceAccount>();

export function getSourceLookup(sources: SourceAccount[]): Map<string, SourceAccount> {
  if (sources !== cachedSourcesRef) {
    cachedSourcesRef = sources;
    sourceLookupMap = new Map((Array.isArray(sources) ? sources : []).map((s) => [s.id, s]));
  }
  return sourceLookupMap;
}

export const createSourceAccountsSlice = (set: StoreSet, get: StoreGet): SourceAccountsSlice => ({
  addSource: (sourceData) => {
    const { sources, userId } = get();

    // Regla de negocio: solo se permite una cuenta en efectivo
    if (sourceData.type === 'cash' && sources.some((s) => s.type === 'cash')) {
      console.warn('[Store] Solo se permite una cuenta en efectivo');
      throw new Error('Solo puedes tener una cuenta en efectivo.');
    }

    const newSource: SourceAccount = {
      ...sourceData,
      id: generateUuid(),
      userId: userId || undefined,
      orderIndex: sourceData.orderIndex ?? sources.length,
      createdAt: new Date().toISOString(),
    };
    const updated = [...sources, newSource].sort((a, b) => a.orderIndex - b.orderIndex);
    set({ sources: updated });

    if (userId) {
      insertCloudSource(newSource, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for addSource:', err)
      );
    }
    return newSource;
  },

  updateSource: (id, updatedFields) => {
    const { sources, userId } = get();

    // Regla de negocio: solo se permite una cuenta en efectivo
    if (
      updatedFields.type === 'cash' &&
      sources.some((s) => s.type === 'cash' && s.id !== id)
    ) {
      console.warn('[Store] Solo se permite una cuenta en efectivo');
      throw new Error('Solo puedes tener una cuenta en efectivo.');
    }

    set((state) => ({
      sources: state.sources
        .map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
        .sort((a, b) => a.orderIndex - b.orderIndex),
    }));

    if (userId) {
      updateCloudSource(id, updatedFields, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for updateSource:', err)
      );
    }
  },

  deleteSource: (id) => {
    const { userId, activeSourceId } = get();
    set((state) => {
      const filtered = state.sources.filter((s) => s.id !== id);
      const reindexed = filtered.map((s, idx) => ({ ...s, orderIndex: idx }));
      return {
        sources: reindexed,
        activeSourceId: activeSourceId === id ? null : state.activeSourceId,
      };
    });

    if (userId) {
      deleteCloudSource(id, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for deleteSource:', err)
      );
    }
  },

  reorderSources: (sourceIdsInOrder) => {
    const { sources, userId } = get();
    const sourceMap = new Map(sources.map((s) => [s.id, s]));
    const reordered: SourceAccount[] = [];
    sourceIdsInOrder.forEach((id, index) => {
      const s = sourceMap.get(id);
      if (s) {
        reordered.push({ ...s, orderIndex: index });
        sourceMap.delete(id);
      }
    });
    Array.from(sourceMap.values()).forEach((s) => {
      reordered.push({ ...s, orderIndex: reordered.length });
    });

    set({ sources: reordered });

    if (userId) {
      reorderCloudSources(reordered, userId).catch((err) =>
        console.warn('[Store] Cloud sync failed for reorderSources:', err)
      );
    }
  },

  getSourceById: (id) => {
    if (!id) return undefined;
    return getSourceLookup(get().sources).get(id);
  },

  getSourceBalance: (sourceId) => {
    const source = get().sources.find((s) => s.id === sourceId);
    if (!source) return undefined;
    return computeSourceBalance(source, get().transactions);
  },

  ensureDefaultSource: () => {
    const { sources, addSource } = get();
    if (sources.length > 0) return sources[0];
    return addSource({
      name: 'Cuenta Principal',
      type: 'bank',
      institution: 'Principal',
      initialBalance: 0,
      orderIndex: 0,
      color: '#004481',
    });
  },
});

