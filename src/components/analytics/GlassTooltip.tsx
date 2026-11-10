import React from 'react';
import { formatCurrency } from '../../utils/currency';

export interface GlassTooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  fill?: string;
  payload?: unknown;
}

export interface GlassTooltipProps {
  active?: boolean;
  payload?: GlassTooltipPayloadItem[];
  label?: string;
}

/**
 * Reusable Liquid Glass Tooltip for Recharts (AreaChart, BarChart, LineChart)
 */
export const GlassTooltip: React.FC<GlassTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl bg-[#0F1626]/95 light:bg-white/95 border border-white/20 light:border-slate-300/80 p-3 shadow-2xl backdrop-blur-2xl text-xs flex flex-col gap-1.5 z-50 pointer-events-none">
        {label && <span className="font-bold text-slate-300 light:text-slate-800">{label}</span>}
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="text-slate-300 light:text-slate-600">{entry.name}:</span>
            </div>
            <span className="font-bold text-white light:text-slate-900">
              {formatCurrency(entry.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

