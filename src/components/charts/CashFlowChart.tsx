import React, { useState } from 'react';
import { CurrencyCode, ExchangeRates } from '../../types/finance';
import { convertCurrency, formatCurrency } from '../../services/currencyService';

interface CashFlowMonthData {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
}

interface CashFlowChartProps {
  data: CashFlowMonthData[];
  baseCurrency: CurrencyCode;
  rates: ExchangeRates;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data, baseCurrency, rates }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute maximum value for scaling
  const maxVal = Math.max(
    ...data.flatMap((d) => [
      convertCurrency(d.income, 'BRL', baseCurrency, rates),
      convertCurrency(d.expense, 'BRL', baseCurrency, rates),
    ]),
    1000
  );

  const chartHeight = 220;
  const paddingBottom = 30;
  const usableHeight = chartHeight - paddingBottom - 20;

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            Fluxo de Caixa Mensal
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Receitas vs Despesas
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Convertido na sua moeda base ({baseCurrency})
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-slate-300">Receitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500 shadow-sm shadow-rose-500/50"></span>
            <span className="text-slate-300">Despesas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
            <span className="text-slate-400">Saldo Líquido</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${Math.max(data.length * 90, 480)} ${chartHeight}`}
          className="w-full h-56 select-none"
        >
          {/* Subtle grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = chartHeight - paddingBottom - pct * usableHeight;
            const val = maxVal * pct;
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                  opacity="0.5"
                />
                <text
                  x="8"
                  y={y - 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {formatCurrency(val, baseCurrency)}
                </text>
              </g>
            );
          })}

          {/* Bars and Data points */}
          {data.map((item, index) => {
            const totalItems = data.length;
            const step = (100 / totalItems);
            const slotWidth = 70;
            const xCenter = (index + 0.5) * (Math.max(data.length * 90, 480) / totalItems);

            const convertedIncome = convertCurrency(item.income, 'BRL', baseCurrency, rates);
            const convertedExpense = convertCurrency(item.expense, 'BRL', baseCurrency, rates);
            const net = convertedIncome - convertedExpense;

            const incomeHeight = Math.max((convertedIncome / maxVal) * usableHeight, 4);
            const expenseHeight = Math.max((convertedExpense / maxVal) * usableHeight, 4);

            const isHovered = hoveredIdx === index;

            return (
              <g
                key={item.month}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* Background highlight on hover */}
                {isHovered && (
                  <rect
                    x={xCenter - slotWidth / 2 - 4}
                    y={10}
                    width={slotWidth + 8}
                    height={chartHeight - paddingBottom}
                    fill="#3b82f6"
                    fillOpacity="0.08"
                    rx="8"
                  />
                )}

                {/* Income Bar */}
                <rect
                  x={xCenter - 22}
                  y={chartHeight - paddingBottom - incomeHeight}
                  width="18"
                  height={incomeHeight}
                  fill={isHovered ? '#10b981' : '#059669'}
                  rx="4"
                  className="transition-all duration-200"
                />

                {/* Expense Bar */}
                <rect
                  x={xCenter + 4}
                  y={chartHeight - paddingBottom - expenseHeight}
                  width="18"
                  height={expenseHeight}
                  fill={isHovered ? '#f43f5e' : '#e11d48'}
                  rx="4"
                  className="transition-all duration-200"
                />

                {/* Net indicator dot */}
                <circle
                  cx={xCenter}
                  cy={chartHeight - paddingBottom - ((convertedIncome - convertedExpense) / maxVal) * usableHeight}
                  r={isHovered ? 5 : 3.5}
                  fill="#818cf8"
                  stroke="#1e1b4b"
                  strokeWidth="2"
                />

                {/* Month label */}
                <text
                  x={xCenter}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fill={isHovered ? '#f1f5f9' : '#94a3b8'}
                  fontSize="11"
                  fontWeight={isHovered ? '600' : '400'}
                >
                  {item.monthLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover detail card */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="mt-3 p-3 bg-slate-800/90 border border-slate-700/80 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
            <span className="font-semibold text-slate-200">
              {data[hoveredIdx].monthLabel}:
            </span>
            <div className="flex items-center gap-4">
              <span className="text-emerald-400 font-medium">
                Receita: {formatCurrency(convertCurrency(data[hoveredIdx].income, 'BRL', baseCurrency, rates), baseCurrency)}
              </span>
              <span className="text-rose-400 font-medium">
                Despesa: {formatCurrency(convertCurrency(data[hoveredIdx].expense, 'BRL', baseCurrency, rates), baseCurrency)}
              </span>
              <span className={`font-semibold ${data[hoveredIdx].income >= data[hoveredIdx].expense ? 'text-indigo-400' : 'text-amber-400'}`}>
                Líquido: {formatCurrency(convertCurrency(data[hoveredIdx].income - data[hoveredIdx].expense, 'BRL', baseCurrency, rates), baseCurrency, true)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
