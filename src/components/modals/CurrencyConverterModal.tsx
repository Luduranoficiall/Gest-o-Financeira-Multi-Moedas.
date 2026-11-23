import React, { useState } from 'react';
import { CurrencyCode, ExchangeRates } from '../../types/finance';
import { CURRENCIES, convertCurrency, formatCurrency } from '../../services/currencyService';
import { X, ArrowRightLeft, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: ExchangeRates;
  baseCurrency: CurrencyCode;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({
  isOpen,
  onClose,
  rates,
  baseCurrency,
}) => {
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>(baseCurrency);
  const [amount, setAmount] = useState<string>('100');

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const result = convertCurrency(numAmount, fromCurrency, toCurrency, rates);
  const singleUnit = convertCurrency(1, fromCurrency, toCurrency, rates);
  const inverseUnit = convertCurrency(1, toCurrency, fromCurrency, rates);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Calculadora & Câmbio Multi-Moeda
              </h3>
              <p className="text-xs text-slate-400">
                Conversão instantânea com cotações de mercado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Amount input */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">
              Valor a Converter
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xl font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Currencies picker with swap button */}
          <div className="grid grid-cols-12 gap-2 items-center">
            {/* From */}
            <div className="col-span-5">
              <label className="block text-slate-400 mb-1 font-medium">De</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c as CurrencyCode].flag} {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap button */}
            <div className="col-span-2 flex justify-center pt-5">
              <button
                type="button"
                onClick={handleSwap}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
                title="Inverter Moedas"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="col-span-5">
              <label className="block text-slate-400 mb-1 font-medium">Para</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c as CurrencyCode].flag} {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conversion Result Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-lg text-center">
            <span className="text-slate-400 text-xs">
              {formatCurrency(numAmount, fromCurrency)} equivale a:
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2 font-mono tracking-tight">
              {formatCurrency(result, toCurrency)}
            </div>
            <div className="text-[11px] text-indigo-300 font-medium flex items-center justify-center gap-2">
              <span>1 {fromCurrency} = {formatCurrency(singleUnit, toCurrency)}</span>
              <span>•</span>
              <span>1 {toCurrency} = {formatCurrency(inverseUnit, fromCurrency)}</span>
            </div>
          </div>

          {/* Exchange Rates Reference Table */}
          <div className="pt-2">
            <span className="text-slate-400 font-semibold mb-2 block flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Cotações em Relação ao Dólar (USD)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {Object.keys(CURRENCIES)
                .filter((c) => c !== 'USD')
                .map((code) => {
                  const cCode = code as CurrencyCode;
                  const rate = rates.rates[cCode];
                  return (
                    <div
                      key={code}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <span className="text-slate-300 flex items-center gap-1">
                        <span>{CURRENCIES[cCode].flag}</span> {cCode}
                      </span>
                      <span className="font-mono font-semibold text-slate-200">
                        {rate.toFixed(cCode === 'JPY' ? 1 : 2)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all"
            >
              Fechar Calculadora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
