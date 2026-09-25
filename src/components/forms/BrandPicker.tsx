import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check, Building2 } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { BrandAvatar } from '../common/BrandAvatar';

interface BrandPickerProps {
  selectedBrandId: string;
  onSelectBrand: (brandId: string) => void;
  categoryId?: string;
}

export const BrandPicker: React.FC<BrandPickerProps> = ({
  selectedBrandId,
  onSelectBrand,
  categoryId,
}) => {
  const brands = useFinanceStore((state) => state.brands);
  const getBrandById = useFinanceStore((state) => state.getBrandById);

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedBrand = getBrandById(selectedBrandId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered brands by search and optionally category
  const filteredBrands = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      // Prioritize popular brands and matching category
      return brands.slice(0, 14);
    }
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.domain && b.domain.toLowerCase().includes(q))
    );
  }, [brands, searchQuery]);

  // Quick popular pills to suggest
  const quickPillBrands = useMemo(() => {
    if (categoryId) {
      const catBrands = brands.filter((b) => b.categoryId === categoryId);
      if (catBrands.length > 0) return catBrands.slice(0, 5);
    }
    return brands.filter((b) => b.isPopular).slice(0, 5);
  }, [brands, categoryId]);

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
        <span>Marca o Establecimiento</span>
        {selectedBrand && (
          <button
            type="button"
            onClick={() => onSelectBrand('')}
            className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
          >
            Quitar marca
          </button>
        )}
      </label>

      {/* If a brand is selected: Show Selected Brand Glass Card */}
      {selectedBrand ? (
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/20 shadow-sm">
          <div className="flex items-center gap-2.5">
            <BrandAvatar brand={selectedBrand} size="sm" />
            <div>
              <span className="text-sm font-bold text-white block leading-tight">
                {selectedBrand.name}
              </span>
              <span className="text-[10px] text-slate-400">
                {selectedBrand.domain || 'Marca vinculada'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectBrand('')}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Cambiar marca"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* If no brand selected: Search Input */
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar marca (Mercadona, Netflix, Uber, Zara...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full rounded-xl bg-white/[0.07] border border-white/15 pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 backdrop-blur-md transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-0.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Popular Pills when search is empty */}
          {!isOpen && !searchQuery && (
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickPillBrands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onSelectBrand(b.id);
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-medium text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer flex-shrink-0 active:scale-95"
                >
                  <BrandAvatar brand={b} size="sm" />
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Interactive Search Results Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-2xl bg-[#0F1626]/98 border border-white/20 shadow-2xl backdrop-blur-2xl z-50 p-1.5 flex flex-col gap-1">
              {/* Option to clear */}
              <button
                type="button"
                onClick={() => {
                  onSelectBrand('');
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer text-left"
              >
                <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <span>Sin marca específica</span>
              </button>

              {filteredBrands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onSelectBrand(b.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 text-white text-xs transition-all cursor-pointer text-left active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <BrandAvatar brand={b} size="sm" />
                    <div>
                      <span className="font-semibold block">{b.name}</span>
                      <span className="text-[10px] text-slate-400">{b.domain}</span>
                    </div>
                  </div>
                  {selectedBrandId === b.id && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                </button>
              ))}

              {filteredBrands.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400">
                  No se encontraron marcas para &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
