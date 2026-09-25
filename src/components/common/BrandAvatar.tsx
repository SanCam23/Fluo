import React from 'react';
import type { Brand } from '../../types/finance';

interface BrandAvatarProps {
  brand?: Brand;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandAvatar: React.FC<BrandAvatarProps> = ({
  brand,
  fallbackText = 'FL',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }[size];

  const brandColor = brand?.brandColor || '#6366F1';
  const initial = brand?.name?.charAt(0) || fallbackText.charAt(0);

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl border border-white/20 shadow-md font-bold text-white overflow-hidden backdrop-blur-md ${sizeClasses}`}
      style={{
        background: `linear-gradient(135deg, ${brandColor}40, ${brandColor}15)`,
        borderColor: `${brandColor}60`,
      }}
    >
      {/* Specular edge */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      <span style={{ color: '#FFFFFF', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
        {initial}
      </span>
    </div>
  );
};
