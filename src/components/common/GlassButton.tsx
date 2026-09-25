import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'neutral' | 'prominent' | 'ghost';
  pill?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  className = '',
  variant = 'neutral',
  pill = true,
  ...props
}) => {
  const shapeStyle = pill ? 'rounded-full' : 'rounded-2xl';

  const getVariantStyles = () => {
    switch (variant) {
      case 'prominent':
        return 'bg-indigo-600/85 hover:bg-indigo-600 text-white border border-indigo-400/30 shadow-lg shadow-indigo-600/25 active:scale-[0.97]';
      case 'ghost':
        return 'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border border-transparent active:scale-[0.97]';
      case 'neutral':
      default:
        return 'bg-white/10 hover:bg-white/15 text-white border border-white/20 active:scale-[0.97] shadow-sm';
    }
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer ${shapeStyle} ${getVariantStyles()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
