import {
  supabase,
  isSupabaseConfigured,
  mapDbTransactionToTransaction,
  mapTransactionToDb,
  mapDbInvestmentToAsset,
  mapAssetToDbInvestment,
  type DbTransaction,
  type DbInvestment,
} from '../lib/supabaseClient';
import type { Transaction, InvestmentAsset } from '../types/finance';

export interface CloudFetchResult {
  transactions: Transaction[];
  assets: InvestmentAsset[];
  success: boolean;
  error?: string;
}

/**
 * Fetch all user transactions and investments from Supabase.
 */
export async function fetchUserCloudData(userId: string): Promise<CloudFetchResult> {
  if (!isSupabaseConfigured || !userId) {
    return { transactions: [], assets: [], success: false, error: 'Supabase no configurado o usuario inválido' };
  }

  try {
    const [txResponse, assetsResponse] = await Promise.all([
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
    ]);

    if (txResponse.error) {
      console.warn('[CloudSync] Error fetching transactions:', txResponse.error.message);
    }
    if (assetsResponse.error) {
      console.warn('[CloudSync] Error fetching investments:', assetsResponse.error.message);
    }

    const transactions: Transaction[] = (txResponse.data as DbTransaction[] || []).map(
      mapDbTransactionToTransaction
    );

    const assets: InvestmentAsset[] = (assetsResponse.data as DbInvestment[] || []).map(
      mapDbInvestmentToAsset
    );

    return {
      transactions,
      assets,
      success: !txResponse.error && !assetsResponse.error,
      error: txResponse.error?.message || assetsResponse.error?.message,
    };
  } catch (err: any) {
    console.error('[CloudSync] Unexpected error fetching user data:', err);
    return {
      transactions: [],
      assets: [],
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
