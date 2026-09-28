import React, { useState } from 'react';
import { Landmark, Wallet } from 'lucide-react';
import type { SourceAccount } from '../../types/finance';
import { getSourceLogoUrls } from '../../utils/brandLogo';

interface SourceAvatarProps {
  source?: Pick<SourceAccount, 'name' | 'type' | 'institution' | 'color'> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

// Module-level in-memory cache to prevent flickering across renders
const resolvedSourceLogoCache = new Map<string, string>();
const failedSourceLogoSources = new Set<string>();

export const SourceAvatar: React.FC<SourceAvatarProps> = ({
  source,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 rounded-lg p-1',
    sm: 'h-8 w-8 rounded-xl p-1.5',
    md: 'h-10 w-10 rounded-2xl p-2',
    lg: 'h-12 w-12 rounded-2xl p-2.5',
  }[size];

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size];

  const isCash = source?.type === 'cash';
  const defaultColor = isCash ? '#34d399' : '#818cf8';
  const sourceColor = source?.color || defaultColor;

  const sourceKey = source
    ? `${source.type || 'bank'}_${source.institution || ''}_${source.name}`.toLowerCase()
    : undefined;

  const logoCandidates = source && !isCash ? getSourceLogoUrls(source) : [];
  const [failedSources, setFailedSources] = useState<Record<string, boolean>>({});

  const cachedUrl = sourceKey ? resolvedSourceLogoCache.get(sourceKey) : undefined;
  const currentSource =
    cachedUrl ||
    logoCandidates.find((src) => !failedSourceLogoSources.has(src) && !failedSources[src]);

  const handleImageError = () => {
    if (currentSource) {
      failedSourceLogoSources.add(currentSource);
      if (sourceKey && resolvedSourceLogoCache.get(sourceKey) === currentSource) {
        resolvedSourceLogoCache.delete(sourceKey);
      }
      setFailedSources((prev) => ({ ...prev, [currentSource]: true }));
    }
  };

  const handleImageLoad = () => {
    if (sourceKey && currentSource) {
      resolvedSourceLogoCache.set(sourceKey, currentSource);
    }
  };

  // Case 1: Cash Wallet
  if (isCash) {
    return (
      <div
        className={`relative flex-shrink-0 flex items-center justify-center border border-emerald-500/25 bg-emerald-500/10 shadow-lg shadow-black/40 overflow-hidden backdrop-blur-md transition-transform duration-200 text-emerald-400 ${sizeClasses} ${className}`}
        style={{
          boxShadow: `0 4px 14px ${sourceColor}25`,
        }}
      >
        <Wallet className={iconSizes} />
      </div>
    );
  }

  // Case 2: Bank with Logo (Vector/High-res raster from verified CDNs)
  if (currentSource) {
    return (
      <div
        className={`relative flex-shrink-0 flex items-center justify-center bg-[#111726] border border-white/15 shadow-lg shadow-black/40 overflow-hidden backdrop-blur-md transition-transform duration-200 ${sizeClasses} ${className}`}
        style={{
          boxShadow: `0 4px 16px ${sourceColor}25`,
        }}
      >
        <img
          src={currentSource}
          alt={source?.institution || source?.name || 'Banco'}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className="w-full h-full object-contain filter drop-shadow-sm select-none"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  // Case 3: Bank fallback (Landmark glyph)
  return (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center border border-white/15 shadow-lg overflow-hidden backdrop-blur-md transition-transform duration-200 ${sizeClasses} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${sourceColor}30, ${sourceColor}10)`,
        borderColor: `${sourceColor}40`,
        color: sourceColor,
        boxShadow: `0 4px 14px ${sourceColor}20`,
      }}
    >
      <Landmark className={iconSizes} />
    </div>
  );
};
