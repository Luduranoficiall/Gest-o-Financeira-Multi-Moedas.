import React, { useState } from 'react';
import { Category, CurrencyCode, ExchangeRates, Transaction } from '../../types/finance';
import { convertCurrency, formatCurrency } from '../../services/currencyService';

interface CategoryDonutChartProps {
  transactions: Transaction[];
  categories: Category[];
  baseCurrency: CurrencyCode;
  rates: ExchangeRates;
  selectedMonth?: string;
  onSelectCategory?: (categoryId: string | null) => void;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  transactions,
  categories,
  baseCurrency,
  rates,
  selectedMonth,
  onSelectCategory,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Filter only expenses and optionally by month
  const expenseTransactions = transactions.filter((tx) => {
    if (tx.type !== 'expense') return false;
    if (selectedMonth && !tx.date.startsWith(selectedMonth)) return false;
    return true;
  });

  // Calculate totals by category
  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;

  expenseTransactions.forEach((tx) => {
    const amountInBase = convertCurrency(tx.amount, tx.currency, baseCurrency, rates);
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amountInBase;
    grandTotal += amountInBase;
  });

  const categoryData = categories
    .map((cat) => ({
      category: cat,
      amount: categoryTotals[cat.id] || 0,
      percentage: grandTotal > 0 ? ((categoryTotals[cat.id] || 0) / grandTotal) * 100 : 0,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // SVG Donut calculations
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const handleCategoryClick = (catId: string) => {
    const next = activeCategoryId === catId ? null : catId;
    setActiveCategoryId(next);
    if (onSelectCategory) {
      onSelectCategory(next);
    }
  };

  const activeItem = activeCategoryId
    ? categoryData.find((d) => d.category.id === activeCategoryId)
    : null;

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Gastos por Categoria
          </h3>
          <p className="text-xs text-slate-400">
            Total: {formatCurrency(grandTotal, baseCurrency)}
          </p>
        </div>
        {activeCategoryId && (
          <button
            onClick={() => handleCategoryClick(activeCategoryId)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20"
          >
            Limpar Filtro
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut graphic */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth={strokeWidth}
            />

            {grandTotal === 0 ? (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#334155"
                strokeWidth={strokeWidth}
                strokeDasharray="4 4"
              />
            ) : (
              categoryData.map((item) => {
                const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                accumulatedPercent += item.percentage;
                const isSelected = activeCategoryId === item.category.id;

                return (
                  <circle
                    key={item.category.id}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={item.category.color}
                    strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer hover:opacity-90"
                    onClick={() => handleCategoryClick(item.category.id)}
                    style={{
                      filter: isSelected ? 'drop-shadow(0px 0px 8px rgba(255,255,255,0.4))' : undefined,
                    }}
                  />
                );
              })
            )}
          </svg>

          {/* Center text in donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {activeItem ? (
              <>
                <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
                  {activeItem.category.name}
                </span>
                <span className="text-sm font-bold text-slate-100 mt-0.5">
                  {formatCurrency(activeItem.amount, baseCurrency)}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {activeItem.percentage.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Despesas
                </span>
                <span className="text-sm font-bold text-slate-100 mt-0.5">
                  {formatCurrency(grandTotal, baseCurrency)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {categoryData.length} categorias
                </span>
              </>
            )}
          </div>
        </div>

        {/* Categories list with progress bars */}
        <div className="md:col-span-7 flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
          {categoryData.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              Nenhuma despesa registrada para o período.
            </p>
          ) : (
            categoryData.map((item) => {
              const isSelected = activeCategoryId === item.category.id;
              return (
                <div
                  key={item.category.id}
                  onClick={() => handleCategoryClick(item.category.id)}
                  className={`p-2 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/50 shadow-md'
                      : 'hover:bg-slate-800/50 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.category.color }}
                      ></span>
                      <span className="text-slate-200 font-medium truncate">
                        {item.category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-300 font-semibold">
                        {formatCurrency(item.amount, baseCurrency)}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.category.color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
