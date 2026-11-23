import React from 'react';
import {
  Budget,
  BudgetAlert,
  Category,
  CurrencyCode,
  ExchangeRates,
  Transaction,
} from '../../types/finance';
import { CURRENCIES, convertCurrency, formatCurrency } from '../../services/currencyService';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Edit3,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react';

interface BudgetAlertsSectionProps {
  budgets: Budget[];
  alerts: BudgetAlert[];
  transactions: Transaction[];
  categories: Category[];
  baseCurrency: CurrencyCode;
  rates: ExchangeRates;
  selectedMonth: string;
  onAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetAlertsSection: React.FC<BudgetAlertsSectionProps> = ({
  budgets,
  alerts,
  transactions,
  categories,
  baseCurrency,
  rates,
  selectedMonth,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
}) => {
  const monthBudgets = budgets.filter((b) => b.month === selectedMonth);

  const getCategorySpentInBase = (categoryId: string, month: string) => {
    return transactions
      .filter((t) => t.type === 'expense' && t.category === categoryId && t.date.startsWith(month))
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, baseCurrency, rates), 0);
  };

  const exceededAlerts = alerts.filter((a) => a.severity === 'exceeded');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  const totalBudgetedInBase = monthBudgets.reduce(
    (sum, b) => sum + convertCurrency(b.amount, b.currency, baseCurrency, rates),
    0
  );
  const totalSpentInBudgetedInBase = monthBudgets.reduce(
    (sum, b) => sum + getCategorySpentInBase(b.categoryId, b.month),
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Orçamentos & Alertas Mensais
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {selectedMonth}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Defina tetos mensais por categoria e receba notificações automáticas ao se aproximar ou ultrapassar o limite.
          </p>
        </div>

        <button
          onClick={onAddBudget}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Limite de Categoria</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Orçamento Total ({selectedMonth})
          </span>
          <div className="text-xl font-extrabold text-slate-100 font-mono mt-1">
            {formatCurrency(totalBudgetedInBase, baseCurrency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Gasto acumulado nas categorias: <strong className="text-slate-200">{formatCurrency(totalSpentInBudgetedInBase, baseCurrency)}</strong>
          </p>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-rose-400 font-semibold">
              Limites Ultrapassados
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1">
            {exceededAlerts.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {exceededAlerts.length > 0
              ? `${exceededAlerts.map((a) => a.categoryName).join(', ')}`
              : 'Nenhuma categoria estourou o limite'}
          </p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
              Em Zona de Atenção
            </span>
            <BellRing className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            {warningAlerts.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {warningAlerts.length > 0
              ? `${warningAlerts.map((a) => a.categoryName).join(', ')}`
              : 'Todas as demais categorias estão saudáveis'}
          </p>
        </div>
      </div>

      {/* Active Alerts Center */}
      {alerts.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Alertas Orçamentários Ativos ({alerts.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert) => {
              const isExceeded = alert.severity === 'exceeded';
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    isExceeded
                      ? 'bg-rose-950/35 border-rose-500/40'
                      : 'bg-amber-950/30 border-amber-500/40'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isExceeded ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {isExceeded ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <BellRing className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {alert.categoryName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isExceeded
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isExceeded ? 'Limite Excedido' : 'Atenção'} ({alert.percentage.toFixed(0)}%)
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1">
                      {isExceeded ? (
                        <>
                          Você ultrapassou o limite mensal em{' '}
                          <strong className="text-rose-400 font-mono">
                            {formatCurrency(alert.excessInBase, baseCurrency)}
                          </strong>
                          .
                        </>
                      ) : (
                        <>
                          Gasto atingiu{' '}
                          <strong className="text-amber-300 font-mono">
                            {alert.percentage.toFixed(1)}%
                          </strong>{' '}
                          do teto mensal definido.
                        </>
                      )}
                    </p>

                    <div className="mt-2 text-[11px] text-slate-400 font-mono">
                      Gasto: {formatCurrency(alert.spentInBase, baseCurrency)} / Limite:{' '}
                      {formatCurrency(alert.limitInBase, baseCurrency)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monthBudgets.map((budget) => {
          const cat = categories.find((c) => c.id === budget.categoryId);
          const limitInBase = convertCurrency(budget.amount, budget.currency, baseCurrency, rates);
          const spentInBase = getCategorySpentInBase(budget.categoryId, budget.month);
          const percentage = limitInBase > 0 ? (spentInBase / limitInBase) * 100 : 0;
          const remaining = limitInBase - spentInBase;

          const isExceeded = percentage > 100;
          const isWarning = !isExceeded && percentage >= budget.alertThreshold;

          return (
            <div
              key={budget.id}
              className={`p-5 rounded-2xl bg-slate-900 border shadow-xl flex flex-col justify-between transition-all ${
                isExceeded
                  ? 'border-rose-500/60 shadow-rose-950/20'
                  : isWarning
                  ? 'border-amber-500/50 shadow-amber-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat?.color || '#3b82f6' }}
                    />
                    <h4 className="text-sm font-bold text-slate-100 truncate">
                      {cat?.name || budget.categoryId}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditBudget(budget)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Editar Limite"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(budget.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Remover Orçamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between text-[11px] mb-3">
                  <span className="text-slate-400">
                    Alerta a partir de <strong className="text-slate-200">{budget.alertThreshold}%</strong>
                  </span>

                  {isExceeded ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Ultrapassado
                    </span>
                  ) : isWarning ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
                      <BellRing className="w-3 h-3" /> Atenção
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Dentro do Limite
                    </span>
                  )}
                </div>

                {/* Amounts */}
                <div className="flex items-baseline justify-between mt-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                      Gasto Atual
                    </span>
                    <strong
                      className={`text-lg font-extrabold font-mono ${
                        isExceeded ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-100'
                      }`}
                    >
                      {formatCurrency(spentInBase, baseCurrency)}
                    </strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                      Teto ({CURRENCIES[budget.currency]?.flag} {budget.currency})
                    </span>
                    <span className="text-sm font-bold text-slate-300 font-mono">
                      {formatCurrency(limitInBase, baseCurrency)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Threshold Marker */}
                <div className="relative mt-3 w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                  {/* Threshold vertical indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/60"
                    style={{ left: `${budget.alertThreshold}%` }}
                    title={`Limiar de aviso: ${budget.alertThreshold}%`}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-300">
                  {percentage.toFixed(1)}% utilizado
                </span>
                <span className={remaining < 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {remaining < 0
                    ? `Excedeu ${formatCurrency(Math.abs(remaining), baseCurrency)}`
                    : `Restam ${formatCurrency(remaining, baseCurrency)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
