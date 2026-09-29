import {
  supabase,
  isSupabaseConfigured,
  mapDbTransactionToTransaction,
  mapTransactionToDb,
  mapDbInvestmentToAsset,
  mapAssetToDbInvestment,
  mapDbSourceAccountToSource,
  mapSourceToDb,
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
      console.warn('[CloudSync] Notice: sources query returned error (table source_accounts may need to be created in Supabase):', sourcesResponse.error.message);
    }

    const transactions: Transaction[] = (txResponse.data || []).map(
      mapDbTransactionToTransaction
    );

    const assets: InvestmentAsset[] = (assetsResponse.data || []).map(
      mapDbInvestmentToAsset
    );

    const sources: SourceAccount[] = (sourcesResponse.data || []).map(
      mapDbSourceAccountToSource
    );

    // If at least one table succeeded or if no fatal connection crash happened, succeed:
    const anyError = Boolean(txResponse.error || assetsResponse.error || sourcesResponse.error);
    const allFailed = Boolean(txResponse.error && assetsResponse.error && sourcesResponse.error);

    return {
      transactions,
      assets,
      sources,
      success: !allFailed,
      error: anyError
        ? (txResponse.error?.message || assetsResponse.error?.message || sourcesResponse.error?.message)
        : undefined,
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
 * Persist or upsert a transaction in Supabase
 */
export async function insertCloudTransaction(tx: Transaction, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const dbPayload = mapTransactionToDb(tx, userId);
    const { error } = await (supabase.from('transactions') as any).upsert(dbPayload, { onConflict: 'id' });
    if (error) {
      console.warn('[CloudSync] Error inserting/upserting transaction:', error.message);
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
 * Update an existing transaction in Supabase matching exact DB schema
 */
export async function updateCloudTransaction(
  id: string,
  updatedFields: Partial<Omit<Transaction, 'id' | 'createdAt'>>,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const patch: Record<string, any> = {};
    if (updatedFields.amount !== undefined) patch.amount = Number(updatedFields.amount);
    if (updatedFields.pillar !== undefined) {
      patch.type = updatedFields.pillar === 'income' ? 'income' : 'expense';
    }
    if (updatedFields.categoryId !== undefined) patch.category = updatedFields.categoryId;
    if (updatedFields.brandId !== undefined || updatedFields.concept !== undefined) {
      const bId = updatedFields.brandId;
      const conc = updatedFields.concept;
      if (bId && conc && bId !== conc) {
        patch.brand = `${bId}::${conc}`;
      } else {
        patch.brand = bId || conc || null;
      }
    }
    if (updatedFields.date !== undefined) patch.date = updatedFields.date;
    if (updatedFields.sourceId !== undefined) patch.source_id = updatedFields.sourceId || null;
    if (updatedFields.isRecurring !== undefined) {
      patch.is_recurring = Boolean(updatedFields.isRecurring);
      patch.recurring_period = updatedFields.isRecurring ? 'monthly' : null;
    }

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
 * Persist or upsert an investment asset in Supabase
 */
export async function insertCloudAsset(asset: InvestmentAsset, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const fullPayload = mapAssetToDbInvestment(asset, userId) as any;

    // Attempt 1: Full payload
    const res1 = await (supabase.from('investments') as any).upsert(fullPayload, { onConflict: 'id' });
    if (!res1.error) return true;

    console.warn('[CloudSync] Upsert full payload failed, trying adaptive fallbacks:', res1.error.message);

    // Attempt 2: Schema with 'identifier' (production Supabase DDL variant)
    const schemaIdentifierPayload: Record<string, any> = {
      id: fullPayload.id,
      user_id: fullPayload.user_id,
      name: fullPayload.name,
      identifier: fullPayload.identifier || fullPayload.symbol_or_isin,
      asset_type: fullPayload.asset_type,
      shares: fullPayload.shares,
      average_buy_price: fullPayload.average_buy_price,
      currency: fullPayload.currency,
      platform: fullPayload.platform,
      initial_fee: fullPayload.initial_fee,
      acquisition_date: fullPayload.acquisition_date,
      created_at: fullPayload.created_at,
    };
    const res2 = await (supabase.from('investments') as any).upsert(schemaIdentifierPayload, { onConflict: 'id' });
    if (!res2.error) return true;

    // Attempt 3: Schema with 'symbol_or_isin' (standard schema.sql DDL variant)
    const schemaSymbolPayload: Record<string, any> = {
      id: fullPayload.id,
      user_id: fullPayload.user_id,
      name: fullPayload.name,
      symbol_or_isin: fullPayload.symbol_or_isin || fullPayload.identifier,
      asset_type: fullPayload.asset_type,
      shares: fullPayload.shares,
      average_buy_price: fullPayload.average_buy_price,
      created_at: fullPayload.created_at,
    };
    const res3 = await (supabase.from('investments') as any).upsert(schemaSymbolPayload, { onConflict: 'id' });
    if (!res3.error) return true;

    // Attempt 4: Minimal identifier schema
    const minimalPayload: Record<string, any> = {
      id: fullPayload.id,
      user_id: fullPayload.user_id,
      name: fullPayload.name,
      identifier: fullPayload.identifier || fullPayload.symbol_or_isin,
      asset_type: fullPayload.asset_type,
      shares: fullPayload.shares,
      average_buy_price: fullPayload.average_buy_price,
    };
    const res4 = await (supabase.from('investments') as any).upsert(minimalPayload, { onConflict: 'id' });
    if (!res4.error) return true;

    console.error('[CloudSync] All adaptive upsert attempts failed for asset:', res4.error.message);
    return false;
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
 * Update an asset's current market quote (in-memory/local resilient)
 */
export async function updateCloudAssetPrice(
  id: string,
  newPrice: number,
  userId?: string,
  quoteTicker?: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const updatePayload: Record<string, any> = {
      current_price: newPrice,
      last_price_update: new Date().toISOString(),
    };
    if (quoteTicker) {
      updatePayload.quote_ticker = quoteTicker;
    }

    let query = (supabase.from('investments') as any)
      .update(updatePayload)
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    await query;
    return true;
  } catch {
    return true;
  }
}

/**
 * Persist a new financial source account in Supabase
 */
export async function insertCloudSource(source: SourceAccount, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const dbPayload = mapSourceToDb(source, userId);
    const { error } = await (supabase.from('source_accounts') as any).upsert(dbPayload, { onConflict: 'id' });
    if (error) {
      console.warn('[CloudSync] Error inserting/upserting source account:', error.message);
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
