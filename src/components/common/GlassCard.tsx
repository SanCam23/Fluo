import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'tinted' | 'subtle';
  tintColor?: 'emerald' | 'rose' | 'indigo';
  isInteractive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  tintColor = 'indigo',
  isInteractive = false,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'tinted':
        if (tintColor === 'emerald') {
          return 'bg-emerald-500/10 border-emerald-500/25 shadow-emerald-500/5';
        }
        if (tintColor === 'rose') {
          return 'bg-rose-500/10 border-rose-500/25 shadow-rose-500/5';
        }
        return 'bg-indigo-500/10 border-indigo-500/25 shadow-indigo-500/5';
      case 'subtle':
        return 'bg-white/[0.04] border-white/10 shadow-black/20';
      case 'default':
      default:
        return 'bg-white/[0.08] border-white/15 shadow-black/40';
    }
  };

  const interactiveStyles = isInteractive
    ? 'cursor-pointer active:scale-[0.98] hover:border-white/25 hover:bg-white/[0.11] transition-all duration-200'
    : '';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl backdrop-blur-2xl border shadow-2xl ${getVariantStyles()} ${interactiveStyles} ${className}`}
      {...props}
    >
      {/* Upper Specular Sheen (simulates top light reflection on bevelled glass) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {children}
    </div>
  );
};
