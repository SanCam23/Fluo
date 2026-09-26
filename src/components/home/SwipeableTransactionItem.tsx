import { useState, useRef, memo } from 'react';
import { Trash2, Repeat, Pencil } from 'lucide-react';
import type { Transaction, Category, Brand } from '../../types/finance';
import { BrandAvatar } from '../common/BrandAvatar';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDate } from '../../utils/dates';

interface SwipeableTransactionItemProps {
  tx: Transaction;
  category?: Category;
  brand?: Brand;
  onDelete: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
}

export const SwipeableTransactionItem: React.FC<SwipeableTransactionItemProps> = memo(({
  tx,
  category,
  brand,
  onDelete,
  onEdit,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const currentOffset = useRef(0);
  const isMouseDown = useRef(false);

  const isIncome = tx.pillar === 'income';
  const isInvest = tx.pillar === 'invest';

  const triggerDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(tx.id);
    }, 280);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDeleting) return;
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    isHorizontal.current = null;
    currentOffset.current = 0;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDeleting) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startX.current;
    const diffY = touch.clientY - startY.current;

    // Detect gesture direction on first significant movement
    if (isHorizontal.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontal.current) {
      // Swiping to the left (Delete) or right (Edit) with elastic resistance past thresholds
      if (diffX < 0) {
        const clamped = diffX < -100 ? -100 + (diffX + 100) * 0.35 : diffX;
        currentOffset.current = clamped;
        setOffsetX(clamped);
      } else {
        const clamped = diffX > 100 ? 100 + (diffX - 100) * 0.35 : diffX;
        currentOffset.current = clamped;
        setOffsetX(clamped);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDeleting) return;
    setIsSwiping(false);
    if (currentOffset.current <= -80) {
      triggerDelete();
    } else if (currentOffset.current >= 80) {
      setOffsetX(0);
      currentOffset.current = 0;
      onEdit?.(tx);
    } else {
      setOffsetX(0);
      currentOffset.current = 0;
    }
    isHorizontal.current = null;
  };

  // Mouse handlers for desktop dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDeleting) return;
    isMouseDown.current = true;
    startX.current = e.clientX;
    currentOffset.current = 0;
    setIsSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || isDeleting) return;
    const diffX = e.clientX - startX.current;
    if (diffX < 0) {
      const clamped = diffX < -100 ? -100 + (diffX + 100) * 0.35 : diffX;
      currentOffset.current = clamped;
      setOffsetX(clamped);
    } else {
      const clamped = diffX > 100 ? 100 + (diffX - 100) * 0.35 : diffX;
      currentOffset.current = clamped;
      setOffsetX(clamped);
    }
  };

  const handleMouseUp = () => {
    if (!isMouseDown.current || isDeleting) return;
    isMouseDown.current = false;
    setIsSwiping(false);
    if (currentOffset.current <= -80) {
      triggerDelete();
    } else if (currentOffset.current >= 80) {
      setOffsetX(0);
      currentOffset.current = 0;
      onEdit?.(tx);
    } else {
      setOffsetX(0);
      currentOffset.current = 0;
    }
  };

  const handleMouseLeave = () => {
    if (isMouseDown.current) {
      handleMouseUp();
    }
  };

  const isPastDeleteThreshold = offsetX <= -80;
  const isPastEditThreshold = offsetX >= 80;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl select-none transition-all duration-300 ease-out cv-auto ${
        isDeleting
          ? 'max-h-0 opacity-0 my-0 py-0 scale-95 pointer-events-none'
          : 'max-h-28 opacity-100'
      }`}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background layer revealed ONLY when swiping RIGHT (Edit) */}
      <div
        className={`absolute inset-0 flex items-center justify-start pl-5 rounded-2xl transition-colors duration-200 pointer-events-none ${
          isPastEditThreshold ? 'bg-indigo-600/90 text-white' : 'bg-indigo-500/80 text-indigo-100'
        } backdrop-blur-xl`}
        style={{
          opacity: offsetX > 0 ? Math.min(1, Math.abs(offsetX) / 25) : 0,
          visibility: offsetX > 0 ? 'visible' : 'hidden',
        }}
      >
        <div
          className={`flex items-center gap-1.5 font-semibold text-xs transition-transform duration-150 ${
            isPastEditThreshold ? 'scale-110 font-bold' : 'scale-100'
          }`}
          style={{ opacity: Math.min(1, Math.abs(offsetX) / 35) }}
        >
          <Pencil className="h-4 w-4" />
          <span>{isPastEditThreshold ? 'Soltar para editar' : 'Editar'}</span>
        </div>
      </div>

      {/* Background layer revealed ONLY when swiping LEFT (Delete) */}
      <div
        className={`absolute inset-0 flex items-center justify-end pr-5 rounded-2xl transition-colors duration-200 pointer-events-none ${
          isPastDeleteThreshold ? 'bg-rose-600/90 text-white' : 'bg-rose-500/80 text-rose-100'
        } backdrop-blur-xl`}
        style={{
          opacity: offsetX < 0 ? Math.min(1, Math.abs(offsetX) / 25) : 0,
          visibility: offsetX < 0 ? 'visible' : 'hidden',
        }}
      >
        <div
          className={`flex items-center gap-1.5 font-semibold text-xs transition-transform duration-150 ${
            isPastDeleteThreshold ? 'scale-110 font-bold' : 'scale-100'
          }`}
          style={{ opacity: Math.min(1, Math.abs(offsetX) / 35) }}
        >
          <Trash2 className="h-4 w-4" />
          <span>{isPastDeleteThreshold ? 'Soltar para eliminar' : 'Eliminar'}</span>
        </div>
      </div>

      {/* Foreground card that slides */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          transform: isDeleting ? 'translateX(-100%)' : `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          touchAction: 'pan-y',
        }}
        className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-200 cursor-grab active:cursor-grabbing"
      >
        {/* Left side: Avatar */}
        <div className="flex-shrink-0 mr-3.5 pointer-events-none">
          <BrandAvatar
            brand={brand}
            fallbackText={category?.name || 'TX'}
            categoryIcon={category?.icon}
            categoryColor={category?.color}
            size="md"
          />
        </div>

        {/* Center: Concept + Category & Badges */}
        <div className="flex-1 min-w-0 pr-2 pointer-events-none">
          <span className="text-sm font-semibold text-white tracking-tight truncate block">
            {tx.concept}
          </span>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
            <span className="truncate max-w-[150px]">
              {category?.name || 'General'}
            </span>

            {(tx.isRecurring || tx.isRecurringGenerated) && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 ${
                  tx.isRecurringGenerated
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-white/10 text-slate-300 border-white/15'
                }`}
              >
                <Repeat className="h-2.5 w-2.5" />
                <span>{tx.isRecurringGenerated ? 'Auto' : 'Recurrente'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right side: Amount and relative date */}
        <div className="flex items-center gap-2 flex-shrink-0 text-right">
          <div className="flex flex-col items-end pointer-events-none">
            <span
              className={`text-[15px] font-bold tracking-tight block ${
                isIncome
                  ? 'text-emerald-400'
                  : isInvest
                  ? 'text-indigo-400'
                  : 'text-rose-400'
              }`}
            >
              {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">
              {formatRelativeDate(tx.date)}
            </span>
          </div>

          {/* Action buttons (accessible on group hover) */}
          <div className="flex items-center gap-0.5 -mr-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(tx);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-indigo-400 transition-opacity rounded-lg hover:bg-white/10 cursor-pointer"
              title="Editar movimiento"
              aria-label="Editar movimiento"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerDelete();
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition-opacity rounded-lg hover:bg-white/10 cursor-pointer"
              title="Eliminar movimiento"
              aria-label="Eliminar movimiento"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

SwipeableTransactionItem.displayName = 'SwipeableTransactionItem';
