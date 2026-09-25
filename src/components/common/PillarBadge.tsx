import type { PillarType } from '../../types/finance';

interface PillarBadgeProps {
  pillar: PillarType;
  label?: string;
  size?: 'sm' | 'md';
}

export const PillarBadge: React.FC<PillarBadgeProps> = ({
  pillar,
  label,
  size = 'sm',
}) => {
  const getStyles = () => {
    switch (pillar) {
      case 'income':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          defaultLabel: 'Ingreso',
        };
      case 'expense':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          defaultLabel: 'Gasto',
        };
      case 'invest':
        return {
          bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
          dot: 'bg-indigo-400',
          defaultLabel: 'Inversión',
        };
    }
  };

  const style = getStyles();
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium backdrop-blur-md ${style.bg} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {label || style.defaultLabel}
    </span>
  );
};
