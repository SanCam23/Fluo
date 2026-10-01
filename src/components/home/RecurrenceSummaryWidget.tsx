import { CalendarClock, Trash2 } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency } from '../../utils/currency';
import { getDaysUntil } from '../../utils/dates';
import { BrandAvatar } from '../common/BrandAvatar';

export const RecurrenceSummaryWidget: React.FC = () => {
  const recurrences = useFinanceStore((state) => state.recurrences);
  const deleteRecurrence = useFinanceStore((state) => state.deleteRecurrence);
  const getBrandById = useFinanceStore((state) => state.getBrandById);
  const getCategoryById = useFinanceStore((state) => state.getCategoryById);

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        `¿Deseas cancelar la recurrencia "${title}"?\nNo se generarán más movimientos automáticos en las próximas fechas.`
      )
    ) {
      deleteRecurrence(id);
    }
  };

  // Filter only active recurrences sorted by nextDueDate
  const activeRecurrences = recurrences
    .filter((r) => r.isActive)
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, 3); // show top 3 upcoming

  if (activeRecurrences.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <CalendarClock className="h-3.5 w-3.5 text-indigo-400" />
          <span>Próximos Pagos y Cobros Recurrentes</span>
        </div>
        <span className="text-[10px] text-slate-500">Automatizado</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto lg:overflow-x-visible lg:flex-wrap pb-1 no-scrollbar">
        {activeRecurrences.map((rule) => {
          const daysLeft = getDaysUntil(rule.nextDueDate);
          const brand = getBrandById(rule.brandId);
          const category = getCategoryById(rule.categoryId);
          const isIncome = rule.pillar === 'income';
          const isInvest = rule.pillar === 'invest';

          return (
            <div
              key={rule.id}
              className="flex-shrink-0 w-52 rounded-2xl bg-white/[0.07] hover:bg-white/[0.11] backdrop-blur-xl border border-white/[0.18] p-3 flex flex-col justify-between transition-all duration-200 shadow-sm group"
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <BrandAvatar
                    brand={brand}
                    fallbackText={rule.title}
                    categoryIcon={category?.icon}
                    categoryColor={category?.color}
                    size="sm"
                  />
                  <span className="text-xs font-semibold text-white truncate max-w-[85px]">
                    {rule.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      daysLeft <= 3
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `en ${daysLeft} d`}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, rule.id, rule.title)}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                    title="Cancelar recurrencia"
                    aria-label="Cancelar recurrencia"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <span
                  className={`text-sm font-bold ${
                    isIncome
                      ? 'text-emerald-400'
                      : isInvest
                      ? 'text-indigo-300'
                      : 'text-rose-400'
                  }`}
                >
                  {isIncome ? '+' : '-'}{formatCurrency(rule.amount)}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {rule.frequency === 'monthly' ? 'Mensual' : rule.frequency}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
