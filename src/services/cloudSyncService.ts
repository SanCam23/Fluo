import {
  supabase,
  isSupabaseConfigured,
  mapDbTransactionToTransaction,
  mapTransactionToDb,
  mapDbInvestmentToAsset,
  mapAssetToDbInvestment,
  mapDbSourceAccountToSource,
  mapSourceToDb,
  type DbTransaction,
  type DbInvestment,
  type DbSourceAccount,
} from '../lib/supabaseClient';
import type { Transaction, InvestmentAsset, SourceAccount } from '../types/finance';

export interface CloudFetchResult {
  transactions: Transaction[];
  assets: InvestmentAsset[];
  sources: SourceAccount[];
  success: boolean;
  error?: string;
}

/**
 * Fetch all user transactions, investments, and source accounts from Supabase.
 */
export async function fetchUserCloudData(userId: string): Promise<CloudFetchResult> {
  if (!isSupabaseConfigured || !userId) {
    return { transactions: [], assets: [], sources: [], success: false, error: 'Supabase no configurado o usuario inválido' };
  }

  try {
    const [txResponse, assetsResponse, sourcesResponse] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false }),
      supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true }),
      supabase
        .from('source_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true }),
    ]);

    if (txResponse.error) {
      console.warn('[CloudSync] Error fetching transactions:', txResponse.error.message);
    }
    if (assetsResponse.error) {
      console.warn('[CloudSync] Error fetching investments:', assetsResponse.error.message);
    }
    if (sourcesResponse.error) {
      console.warn('[CloudSync] Error fetching sources:', sourcesResponse.error.message);
    }

    const transactions: Transaction[] = (txResponse.data as DbTransaction[] || []).map(
      mapDbTransactionToTransaction
    );

    const assets: InvestmentAsset[] = (assetsResponse.data as DbInvestment[] || []).map(
      mapDbInvestmentToAsset
    );

    const sources: SourceAccount[] = (sourcesResponse.data as DbSourceAccount[] || []).map(
      mapDbSourceAccountToSource
    );

    return {
      transactions,
      assets,
      sources,
      success: !txResponse.error && !assetsResponse.error && !sourcesResponse.error,
      error: txResponse.error?.message || assetsResponse.error?.message || sourcesResponse.error?.message,
    };
  } catch (err: any) {
    console.error('[CloudSync] Unexpected error fetching user data:', err);
    return {
      transactions: [],
      assets: [],
      sources: [],
      success: false,
      error: err?.message || 'Error de conexión con la nube',
    };
  }
}

/**
 * Persist a new transaction in Supabase
 */
export async function insertCloudTransaction(tx: Transaction, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const dbPayload = mapTransactionToDb(tx, userId);
    const { error } = await supabase.from('transactions').insert(dbPayload as any);
    if (error) {
      console.warn('[CloudSync] Error inserting transaction:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[CloudSync] Unexpected error inserting transaction:', err);
    return false;
  }
}

/**
 * Delete a transaction from Supabase
 */
export async function deleteCloudTransaction(id: string, userId?: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    let query = supabase.from('transactions').delete().eq('id', id);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) {
      console.warn('[CloudSync] Error deleting transaction:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[CloudSync] Unexpected error deleting transaction:', err);
    return false;
  }
}

/**
 * Update an existing transaction in Supabase
 */
export async function updateCloudTransaction(
  id: string,
  updatedFields: Partial<Omit<Transaction, 'id' | 'createdAt'>>,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const patch: Record<string, any> = {};
    if (updatedFields.amount !== undefined) patch.amount = updatedFields.amount;
    if (updatedFields.pillar !== undefined) patch.pillar = updatedFields.pillar;
    if (updatedFields.categoryId !== undefined) patch.category_id = updatedFields.categoryId;
    if (updatedFields.concept !== undefined) patch.concept = updatedFields.concept;
    if (updatedFields.date !== undefined) patch.date = updatedFields.date;
    if (updatedFields.brandId !== undefined) patch.brand_id = updatedFields.brandId;
    if (updatedFields.sourceId !== undefined) patch.source_id = updatedFields.sourceId || null;

    const { error } = await (supabase
      .from('transactions') as any)
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('[CloudSync] Error updating transaction:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[CloudSync] Unexpected error updating transaction:', err);
    return false;
  }
}

/**
 * Persist a new investment asset in Supabase
 */
export async function insertCloudAsset(asset: InvestmentAsset, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const dbPayload = mapAssetToDbInvestment(asset, userId);
    const { error } = await supabase.from('investments').insert(dbPayload as any);
    if (error) {
      console.warn('[CloudSync] Error inserting asset:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[CloudSync] Unexpected error inserting asset:', err);
    return false;
  }
}

/**
 * Delete an investment asset from Supabase
 */
export async function deleteCloudAsset(id: string, userId?: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    let query = supabase.from('investments').delete().eq('id', id);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) {
      console.warn('[CloudSync] Error deleting asset:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[CloudSync] Unexpected error deleting asset:', err);
    return false;
  }
}

/**
 * Update an asset's current market quote in Supabase
 */
export async function updateCloudAssetPrice(id: string, newPrice: number, userId?: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const updatePayload: Partial<DbInvestment> = {
      current_price: newPrice,
      last_updated: new Date().toISOString(),
    };

    let query = (supabase.from('investments') as any)
      .update(updatePayload)
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) {
      console.warn('[CloudSync] Error updating asset price:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[CloudSync] Unexpected error updating asset price:', err);
    return false;
  }
}

/**
 * Persist a new financial source account in Supabase
 */
export async function insertCloudSource(source: SourceAccount, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const dbPayload = mapSourceToDb(source, userId);
    const { error } = await supabase.from('source_accounts').insert(dbPayload as any);
    if (error) {
      console.warn('[CloudSync] Error inserting source account:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[CloudSync] Unexpected error inserting source account:', err);
    return false;
  }
}

/**
 * Update an existing financial source account in Supabase
 */
export async function updateCloudSource(
  id: string,
  updatedFields: Partial<Omit<SourceAccount, 'id' | 'createdAt'>>,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const patch: Record<string, any> = {};
    if (updatedFields.name !== undefined) patch.name = updatedFields.name;
    if (updatedFields.type !== undefined) patch.type = updatedFields.type;
    if (updatedFields.institution !== undefined) patch.institution = updatedFields.institution || null;
    if (updatedFields.brandId !== undefined) patch.brand_id = updatedFields.brandId || null;
    if (updatedFields.initialBalance !== undefined) patch.initial_balance = updatedFields.initialBalance;
    if (updatedFields.orderIndex !== undefined) patch.order_index = updatedFields.orderIndex;
    if (updatedFields.color !== undefined) patch.color = updatedFields.color || null;

    const { error } = await (supabase.from('source_accounts') as any)
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('[CloudSync] Error updating source account:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[CloudSync] Unexpected error updating source account:', err);
    return false;
  }
}

/**
 * Persist reordered source accounts in Supabase
 */
export async function reorderCloudSources(sources: SourceAccount[], userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    await Promise.all(
      sources.map((s, idx) =>
        (supabase.from('source_accounts') as any)
          .update({ order_index: idx })
          .eq('id', s.id)
          .eq('user_id', userId)
      )
    );
    return true;
  } catch (err) {
    console.error('[CloudSync] Error reordering source accounts in cloud:', err);
    return false;
  }
}

/**
 * Delete a financial source account from Supabase
 */
export async function deleteCloudSource(id: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const { error } = await supabase
      .from('source_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('[CloudSync] Error deleting source account:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[CloudSync] Unexpected error deleting source account:', err);
    return false;
  }
}
