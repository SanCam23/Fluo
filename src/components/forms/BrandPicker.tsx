import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check, Building2, Globe, Plus, Loader2 } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { BrandAvatar } from '../common/BrandAvatar';
import {
  searchGlobalBrands,
  createBrandFromSuggestion,
  type GlobalBrandSuggestion,
} from '../../services/companySearchService';
import type { Brand } from '../../types/finance';

interface BrandPickerProps {
  selectedBrandId: string;
  onSelectBrand: (brandId: string, suggestedCategoryId?: string) => void;
  categoryId?: string;
}

export const BrandPicker: React.FC<BrandPickerProps> = ({
  selectedBrandId,
  onSelectBrand,
  categoryId,
}) => {
  const brands = useFinanceStore((state) => state.brands);
  const getBrandById = useFinanceStore((state) => state.getBrandById);
  const addBrand = useFinanceStore((state) => state.addBrand);

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [globalSuggestions, setGlobalSuggestions] = useState<GlobalBrandSuggestion[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
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

  // Filtered local brands by search query
  const filteredLocalBrands = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return brands.slice(0, 16);
    }
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.domain && b.domain.toLowerCase().includes(q))
    );
  }, [brands, searchQuery]);

  // Visible global suggestions only when query >= 2 chars
  const visibleGlobalSuggestions = useMemo(() => {
    return searchQuery.trim().length >= 2 ? globalSuggestions : [];
  }, [searchQuery, globalSuggestions]);

  // Debounced live global search (Clearbit API indexing 25M+ companies)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true);
      try {
        const results = await searchGlobalBrands(q, controller.signal);
        // Exclude suggestions that already match existing local brands by domain or slug
        const filtered = results.filter((res) => {
          const resDomain = res.domain.toLowerCase();
          const resName = res.name.toLowerCase();
          return !brands.some(
            (b) =>
              (b.domain && b.domain.toLowerCase() === resDomain) ||
              b.name.toLowerCase() === resName
          );
        });
        setGlobalSuggestions(filtered);
      } catch {
        setGlobalSuggestions([]);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, brands]);

  // Quick popular pills to suggest
  const quickPillBrands = useMemo(() => {
    if (categoryId) {
      const catBrands = brands.filter((b) => b.categoryId === categoryId);
      if (catBrands.length > 0) return catBrands.slice(0, 6);
    }
    return brands.filter((b) => b.isPopular).slice(0, 6);
  }, [brands, categoryId]);

  // Handler for picking a global brand
  const handleSelectGlobalSuggestion = (suggestion: GlobalBrandSuggestion) => {
    const newBrand = createBrandFromSuggestion(suggestion, categoryId);
    const saved = addBrand(newBrand);
    onSelectBrand(saved.id, saved.categoryId);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handler for creating custom user brand
  const handleCreateCustomBrand = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Check if input looks like a domain (e.g. "miempresa.es")
    const isDomain = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(trimmed);
    const brandName = isDomain
      ? trimmed.split('.')[0].charAt(0).toUpperCase() + trimmed.split('.')[0].slice(1)
      : trimmed;

    const customBrand: Omit<Brand, 'id'> = {
      name: brandName,
      slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      domain: isDomain ? trimmed : undefined,
      categoryId: categoryId || 'cat-shopping',
      isPopular: false,
    };

    const saved = addBrand(customBrand);
    onSelectBrand(saved.id, saved.categoryId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span>Marca o Comercio</span>
          <span className="text-[10px] text-indigo-400 font-normal bg-indigo-500/10 px-1.5 py-0.5 rounded-full border border-indigo-500/20">
            Global
          </span>
        </span>
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
              placeholder="Escribe cualquier marca (Mercadona, Zara, Airbnb, Steam...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full rounded-xl bg-white/[0.07] border border-white/15 pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 backdrop-blur-md transition-all"
            />
            {isSearchingGlobal ? (
              <Loader2 className="absolute right-3 h-3.5 w-3.5 text-indigo-400 animate-spin" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-0.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Quick Popular Pills when search is empty */}
          {!isOpen && !searchQuery && (
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickPillBrands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onSelectBrand(b.id, b.categoryId);
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
            <div className="absolute top-full left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-2xl bg-[#0F1626]/98 border border-white/20 shadow-2xl backdrop-blur-2xl z-50 p-1.5 flex flex-col gap-1">
              {/* Option to clear / Generic transaction */}
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
                <div>
                  <span className="font-semibold block text-slate-300">Sin marca comercial</span>
                  <span className="text-[10px] text-slate-500">Transacción genérica</span>
                </div>
              </button>

              {/* 1. Local catalog matches */}
              {filteredLocalBrands.length > 0 && (
                <>
                  <div className="px-2 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Marcas catalogadas ({filteredLocalBrands.length})</span>
                  </div>

                  {filteredLocalBrands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        onSelectBrand(b.id, b.categoryId);
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
                </>
              )}

              {/* 2. Global Live Results (Clearbit 25M+ database) */}
              {visibleGlobalSuggestions.length > 0 && (
                <>
                  <div className="px-2 pt-2.5 pb-1 text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 border-t border-white/10 mt-1">
                    <Globe className="h-3 w-3" />
                    <span>Directorio global en vivo</span>
                  </div>

                  {visibleGlobalSuggestions.map((sug) => {
                    const tempBrand: Brand = {
                      id: `temp-${sug.domain}`,
                      name: sug.name,
                      slug: sug.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      domain: sug.domain,
                      logoUrl: sug.logoUrl,
                      categoryId: sug.suggestedCategoryId,
                    };

                    return (
                      <button
                        key={sug.domain}
                        type="button"
                        onClick={() => handleSelectGlobalSuggestion(sug)}
                        className="flex items-center justify-between p-2 rounded-xl bg-indigo-500/[0.04] hover:bg-indigo-500/[0.15] border border-indigo-500/15 text-white text-xs transition-all cursor-pointer text-left active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-2.5">
                          <BrandAvatar brand={tempBrand} size="sm" />
                          <div>
                            <span className="font-semibold block text-indigo-100">{sug.name}</span>
                            <span className="text-[10px] text-indigo-300/70">{sug.domain}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                          Añadir
                        </span>
                      </button>
                    );
                  })}
                </>
              )}

              {/* 3. Option to create custom brand if typing */}
              {searchQuery.trim().length >= 2 && (
                <div className="pt-1.5 border-t border-white/10 mt-1">
                  <button
                    type="button"
                    onClick={handleCreateCustomBrand}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-xs text-slate-300 hover:text-white transition-all cursor-pointer text-left"
                  >
                    <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold block text-white">
                        Crear &quot;{searchQuery.trim()}&quot;
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Guardar como marca personalizada en tu catálogo
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {/* Empty state when searching and nothing at all */}
              {filteredLocalBrands.length === 0 &&
                visibleGlobalSuggestions.length === 0 &&
                !isSearchingGlobal && (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No se encontró &quot;{searchQuery}&quot;. Puedes crearla con el botón superior.
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
