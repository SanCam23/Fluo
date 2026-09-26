import { useState } from 'react';
import type { Brand } from '../../types/finance';
import { getBrandLogoSources } from '../../utils/brandLogo';
import { CategoryIcon } from './CategoryIcon';

interface BrandAvatarProps {
  brand?: Brand;
  fallbackText?: string;
  categoryIcon?: string;
  categoryColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Module-level in-memory cache to eliminate redundant network probing and fallback flickering across views
const resolvedLogoCache = new Map<string, string>();
const failedLogoSources = new Set<string>();

export const BrandAvatar: React.FC<BrandAvatarProps> = ({
  brand,
  fallbackText = 'FL',
  categoryIcon,
  categoryColor,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 rounded-xl p-1.5',
    md: 'h-10 w-10 rounded-2xl p-2',
    lg: 'h-12 w-12 rounded-2xl p-2.5',
  }[size];

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size];

  const brandColor = brand?.brandColor || categoryColor || '#6366F1';
  const initial = (brand?.name || fallbackText || 'F').charAt(0).toUpperCase();

  const brandKey = brand ? (brand.id || brand.slug || brand.domain || brand.name) : undefined;
  const logoSources = getBrandLogoSources(brand);
  const [failedSources, setFailedSources] = useState<Record<string, boolean>>({});

  // Active source: Check resolved cache first, otherwise take first non-failed candidate
  const cachedUrl = brandKey ? resolvedLogoCache.get(brandKey) : undefined;
  const currentSource = cachedUrl || logoSources.find((src) => !failedLogoSources.has(src) && !failedSources[src]);

  const handleImageError = () => {
    if (currentSource) {
      failedLogoSources.add(currentSource);
      if (brandKey && resolvedLogoCache.get(brandKey) === currentSource) {
        resolvedLogoCache.delete(brandKey);
      }
      setFailedSources((prev) => ({ ...prev, [currentSource]: true }));
    }
  };

  const handleImageLoad = () => {
    if (brandKey && currentSource) {
      resolvedLogoCache.set(brandKey, currentSource);
    }
  };

  // Case 1: Real Brand Logo (High-definition vector / raster)
  // Clean dark surface, NO white hairline / shadow cutting across the top
  if (currentSource) {
    return (
      <div
        className={`relative flex-shrink-0 flex items-center justify-center bg-[#111726] border border-white/10 shadow-lg shadow-black/40 overflow-hidden backdrop-blur-md transition-transform duration-200 ${sizeClasses}`}
        style={{
          boxShadow: `0 4px 16px ${brandColor}20`,
        }}
      >
        <img
          src={currentSource}
          alt={brand?.name || fallbackText}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className="w-full h-full object-contain filter drop-shadow-sm select-none"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  // Case 2: Transaction without brand, but with category icon
  if (categoryIcon) {
    return (
      <div
        className={`relative flex-shrink-0 flex items-center justify-center border border-white/10 shadow-lg overflow-hidden backdrop-blur-md transition-transform duration-200 ${sizeClasses}`}
        style={{
          background: `linear-gradient(135deg, ${brandColor}30, ${brandColor}10)`,
          borderColor: `${brandColor}40`,
          color: brandColor,
        }}
      >
        <CategoryIcon iconName={categoryIcon} className={iconSizes} />
      </div>
    );
  }

  // Case 3: Letter Avatar fallback
  return (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center border border-white/10 shadow-lg font-bold text-white overflow-hidden backdrop-blur-md transition-transform duration-200 ${sizeClasses}`}
      style={{
        background: `linear-gradient(135deg, ${brandColor}40, ${brandColor}15)`,
        borderColor: `${brandColor}50`,
      }}
    >
      <span
        className="font-extrabold select-none"
        style={{ color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        {initial}
      </span>
    </div>
  );
};
