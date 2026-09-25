import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, Check, RefreshCw } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { fetchLiveQuote } from '../../services/priceFeedService';
import type { QuoteResult } from '../../services/priceFeedService';
import type { AssetType } from '../../types/finance';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose }) => {
  const addAsset = useFinanceStore((state) => state.addAsset);

  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [shares, setShares] = useState('');
  const [averageBuyPrice, setAverageBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR');
  const [platform, setPlatform] = useState('');

  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [lastQuoteResult, setLastQuoteResult] = useState<QuoteResult | null>(null);

  if (!isOpen) return null;

  const handleFetchQuote = async () => {
    if (!identifier.trim()) return;
    setIsFetchingQuote(true);
    try {
      const quote = await fetchLiveQuote(identifier);
      setLastQuoteResult(quote);
      setCurrentPrice(quote.price.toString());
      setCurrency(quote.currency);
      if (quote.name && !name) {
        setName(quote.name);
      }
      if (!averageBuyPrice) {
        setAverageBuyPrice(quote.price.toString());
      }
    } catch (e) {
      console.error('Error fetching quote:', e);
    } finally {
      setIsFetchingQuote(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numShares = parseFloat(shares);
    const numBuyPrice = parseFloat(averageBuyPrice);
    const numCurrentPrice = parseFloat(currentPrice) || numBuyPrice;

    if (!identifier.trim() || !name.trim() || isNaN(numShares) || isNaN(numBuyPrice)) {
      return;
    }

    addAsset({
      name: name.trim(),
      identifier: identifier.trim().toUpperCase(),
      assetType,
      shares: numShares,
      averageBuyPrice: numBuyPrice,
      currentPrice: numCurrentPrice,
      currency,
      platform: platform.trim() || undefined,
    });

    // Reset form
    setIdentifier('');
    setName('');
    setShares('');
    setAverageBuyPrice('');
    setCurrentPrice('');
    setPlatform('');
    setLastQuoteResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-all duration-300">
      <div
        className="w-full max-w-md bg-[#0F1626]/95 border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 className="text-base font-bold text-white">Añadir Activo de Inversión</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Ticker / ISIN with Live Quote Query Button */}
          <div>
            <label className="text-xs font-semibold text-slate-400">
              Ticker o Código ISIN
            </label>
            <div className="mt-1 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Ej. AAPL, VWCE.DE, IE00BK5BQT80, BTC..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                  className="w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-sm font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <button
                type="button"
                onClick={handleFetchQuote}
                disabled={isFetchingQuote || !identifier.trim()}
                className="px-3 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md border border-indigo-400/30 transition-all cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingQuote ? 'animate-spin' : ''}`} />
                <span>{isFetchingQuote ? 'Buscando...' : 'Cotización'}</span>
              </button>
            </div>

            {lastQuoteResult && (
              <div className="mt-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Precio detectado: <strong className="text-emerald-400">{lastQuoteResult.price} {lastQuoteResult.currency}</strong>
                </span>
                <span className="text-[10px] text-slate-400">{lastQuoteResult.lastUpdated}</span>
              </div>
            )}
          </div>

          {/* Asset Name */}
          <div>
            <label className="text-xs font-semibold text-slate-400">Nombre del Activo</label>
            <input
              type="text"
              required
              placeholder="Ej. Apple Inc., Vanguard All-World..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Asset Class */}
          <div>
            <label className="text-xs font-semibold text-slate-400">Tipo de Activo</label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              className="mt-1 w-full rounded-xl bg-[#131B2E] border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
            >
              <option value="stock">Acciones Bursátiles</option>
              <option value="etf">ETFs Cotizados</option>
              <option value="index_fund">Fondos Indexados</option>
              <option value="crypto">Criptomonedas</option>
              <option value="fixed_income">Renta Fija / Bonos</option>
              <option value="deposit">Depósitos Remunerados</option>
            </select>
          </div>

          {/* Shares and Average Buy Price */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-400">Títulos / Unidades</label>
              <input
                type="number"
                step="any"
                min="0.000001"
                required
                placeholder="10"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="mt-1 w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Precio Compra (PMCP)</label>
              <input
                type="number"
                step="any"
                min="0.0001"
                required
                placeholder="120.50"
                value={averageBuyPrice}
                onChange={(e) => setAverageBuyPrice(e.target.value)}
                className="mt-1 w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Current Price and Currency */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-400">Precio Actual</label>
              <input
                type="number"
                step="any"
                min="0.0001"
                required
                placeholder="124.80"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="mt-1 w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Divisa</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'EUR' | 'USD')}
                className="mt-1 w-full rounded-xl bg-[#131B2E] border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* Broker / Platform */}
          <div>
            <label className="text-xs font-semibold text-slate-400">Broker / Plataforma</label>
            <input
              type="text"
              placeholder="Ej. MyInvestor, Trade Republic, Degiro, Kraken..."
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-3 w-full py-3.5 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 hover:brightness-110 active:scale-[0.98] font-bold text-white text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            Guardar en Cartera
          </button>
        </form>
      </div>
    </div>
  );
};
