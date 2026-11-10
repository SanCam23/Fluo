import React from 'react';
import { Flame } from 'lucide-react';
import type { Brand } from '../../types/finance';
import { BrandAvatar } from '../common/BrandAvatar';
import { formatCurrency } from '../../utils/currency';

export interface BrandRankingItem {
  id: string;
  brand?: Brand;
  name: string;
  total: number;
  count: number;
  percentage: number;
}

export interface BrandRankingCardProps {
  sortedBrands: BrandRankingItem[];
  maxBrandTotal: number;
}

export const BrandRankingCard: React.FC<BrandRankingCardProps> = ({
  sortedBrands,
  maxBrandTotal,
}) => {
  return (
    <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-2xl light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <div className="h-7 w-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 light:text-rose-600 flex-shrink-0">
            <Flame className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">Comercios & Marcas Top</h3>
            <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">Mayor volumen de gasto en el periodo</p>
          </div>
        </div>
      </div>

      {sortedBrands.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 light:text-slate-500">
          No hay compras registradas en comercios durante este periodo.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedBrands.map((b, index) => {
            const proportion = (b.total / maxBrandTotal) * 100;
            const medalColors = [
              'from-amber-400 to-yellow-500 text-slate-950 font-black', // 1st
              'from-slate-200 to-slate-400 text-slate-950 font-black', // 2nd
              'from-amber-600 to-amber-700 text-white font-black',     // 3rd
            ];
            const medal = medalColors[index] || 'bg-white/10 text-slate-300 light:bg-slate-200 light:text-slate-700';

            return (
              <div
                key={b.id}
                className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] light:bg-white/80 light:hover:bg-white border border-white/10 light:border-slate-200/80 flex flex-col gap-2 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] shadow-sm bg-gradient-to-tr ${medal} flex-shrink-0`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-shrink-0">
                      <BrandAvatar brand={b.brand} fallbackText={b.name} size="sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-white light:text-slate-900 block leading-tight truncate">
                        {b.name}
                      </span>
                      <span className="text-[10px] text-slate-400 light:text-slate-500 block truncate mt-0.5">
                        {b.count} {b.count === 1 ? 'movimiento' : 'movimientos'} •{' '}
                        {b.percentage.toFixed(1)}% del gasto
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-rose-400 light:text-rose-600 flex-shrink-0 whitespace-nowrap">
                    -{formatCurrency(b.total)}
                  </span>
                </div>

                {/* Horizontal Bar Chart Progress */}
                <div className="w-full h-1.5 rounded-full bg-white/10 light:bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${proportion}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

