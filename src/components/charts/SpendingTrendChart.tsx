import React from 'react';
import { CurrencyCode, ExchangeRates, Transaction } from '../../types/finance';
import { convertCurrency, formatCurrency } from '../../services/currencyService';

interface SpendingTrendChartProps {
  transactions: Transaction[];
  baseCurrency: CurrencyCode;
  rates: ExchangeRates;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  transactions,
  baseCurrency,
  rates,
}) => {
  // Sort expense transactions by date
  const expenses = transactions
    .filter((tx) => tx.type === 'expense')
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group by date
  const dailyTotals: Record<string, number> = {};
  expenses.forEach((tx) => {
    const amountInBase = convertCurrency(tx.amount, tx.currency, baseCurrency, rates);
    dailyTotals[tx.date] = (dailyTotals[tx.date] || 0) + amountInBase;
  });

  const dates = Object.keys(dailyTotals).sort();
  if (dates.length === 0) {
    return null;
  }

  // Cumulative data points
  let runningTotal = 0;
  const points = dates.map((date) => {
    runningTotal += dailyTotals[date];
    const d = new Date(date);
    const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
    return {
      date,
      dayLabel,
      daily: dailyTotals[date],
      cumulative: runningTotal,
    };
  });

  const maxCumulative = Math.max(...points.map((p) => p.cumulative), 100);
  const chartHeight = 160;
  const chartWidth = Math.max(points.length * 60, 420);
  const padBottom = 25;
  const padTop = 15;
  const usableHeight = chartHeight - padBottom - padTop;

  // Build SVG path
  const svgPoints = points.map((p, idx) => {
    const x = (idx / Math.max(points.length - 1, 1)) * (chartWidth - 60) + 30;
    const y = chartHeight - padBottom - (p.cumulative / maxCumulative) * usableHeight;
    return { x, y, ...p };
  });

  const linePath = svgPoints.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${linePath} L ${svgPoints[svgPoints.length - 1].x} ${chartHeight - padBottom} L ${svgPoints[0].x} ${chartHeight - padBottom} Z`;

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Evolução Acumulada de Despesas
          </h3>
          <p className="text-xs text-slate-400">
            Trajetória dos gastos no período ({baseCurrency})
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-rose-400">
            {formatCurrency(runningTotal, baseCurrency)}
          </span>
          <p className="text-[10px] text-slate-400">Total Acumulado</p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-40 select-none">
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((pct, i) => {
            const y = chartHeight - padBottom - pct * usableHeight;
            return (
              <line
                key={i}
                x1="20"
                y1={y}
                x2={chartWidth - 20}
                y2={y}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="0.8"
                opacity="0.4"
              />
            );
          })}

          {/* Shaded Area */}
          <path d={areaPath} fill="url(#spendingGradient)" />

          {/* Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {svgPoints.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#f43f5e"
                stroke="#1e293b"
                strokeWidth="2"
                className="transition-transform group-hover:scale-150"
              />
              <text
                x={p.x}
                y={chartHeight - 6}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
              >
                {p.dayLabel}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
