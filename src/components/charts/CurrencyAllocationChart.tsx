import React from 'react';
import { Account, CurrencyCode, ExchangeRates } from '../../types/finance';
import { CURRENCIES, convertCurrency, formatCurrency } from '../../services/currencyService';

interface CurrencyAllocationChartProps {
  accounts: Account[];
  baseCurrency: CurrencyCode;
  rates: ExchangeRates;
}

const CURRENCY_COLORS: Record<CurrencyCode, string> = {
  BRL: '#10b981', // emerald
  USD: '#3b82f6', // blue
  EUR: '#6366f1', // indigo
  GBP: '#ec4899', // pink
  JPY: '#f43f5e', // rose
  CAD: '#f97316', // orange
  AUD: '#eab308', // amber
  CHF: '#06b6d4', // cyan
};

export const CurrencyAllocationChart: React.FC<CurrencyAllocationChartProps> = ({
  accounts,
  baseCurrency,
  rates,
}) => {
  // Aggregate balance by currency
  const currencyTotals: Record<CurrencyCode, number> = {
    BRL: 0,
    USD: 0,
    EUR: 0,
    GBP: 0,
    JPY: 0,
    CAD: 0,
    AUD: 0,
    CHF: 0,
  };

  accounts.forEach((acc) => {
    currencyTotals[acc.currency] = (currencyTotals[acc.currency] || 0) + acc.balance;
  });

  // Calculate total converted into base currency
  let totalNetWorthInBase = 0;
  const items = (Object.keys(currencyTotals) as CurrencyCode[])
    .map((code) => {
      const rawBalance = currencyTotals[code] || 0;
      const converted = convertCurrency(rawBalance, code, baseCurrency, rates);
      totalNetWorthInBase += converted;
      return {
        code,
        info: CURRENCIES[code],
        rawBalance,
        convertedInBase: converted,
        color: CURRENCY_COLORS[code] || '#94a3b8',
      };
    })
    .filter((item) => item.rawBalance > 0)
    .map((item) => ({
      ...item,
      percentage: totalNetWorthInBase > 0 ? (item.convertedInBase / totalNetWorthInBase) * 100 : 0,
    }))
    .sort((a, b) => b.convertedInBase - a.convertedInBase);

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            Distribuição de Moedas & Patrimônio
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Multi-Moeda
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Patrimônio Líquido Total:{' '}
            <strong className="text-slate-100">{formatCurrency(totalNetWorthInBase, baseCurrency)}</strong>
          </p>
        </div>
      </div>

      {/* Segmented Bar */}
      <div className="w-full h-4 rounded-xl overflow-hidden flex bg-slate-800 mb-5 p-0.5 shadow-inner">
        {items.map((item) => (
          <div
            key={item.code}
            className="h-full first:rounded-l-lg last:rounded-r-lg transition-all duration-500 hover:opacity-90 relative group"
            style={{
              width: `${Math.max(item.percentage, 1)}%`,
              backgroundColor: item.color,
            }}
            title={`${item.info.flag} ${item.code}: ${item.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Grid of currency cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.code}
            className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between hover:bg-slate-800/70 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl shrink-0">{item.info.flag}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200">{item.code}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700/60 text-slate-300">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-[110px]">
                  {formatCurrency(item.rawBalance, item.code)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-100">
                {formatCurrency(item.convertedInBase, baseCurrency)}
              </span>
              <p className="text-[10px] text-slate-400">em {baseCurrency}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
