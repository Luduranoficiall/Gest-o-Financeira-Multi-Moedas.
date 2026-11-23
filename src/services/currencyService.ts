import { CurrencyCode, CurrencyInfo, ExchangeRates } from '../types/finance';

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Real Brasileiro',
    flag: '🇧🇷',
    decimals: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dólar Americano',
    flag: '🇺🇸',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'Libra Esterlina',
    flag: '🇬🇧',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Iene Japonês',
    flag: '🇯🇵',
    decimals: 0,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Dólar Canadense',
    flag: '🇨🇦',
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Dólar Australiano',
    flag: '🇦🇺',
    decimals: 2,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Franco Suíço',
    flag: '🇨🇭',
    decimals: 2,
  },
};

// Rates relative to 1 USD
export const DEFAULT_RATES: ExchangeRates = {
  base: 'USD',
  rates: {
    USD: 1.0,
    BRL: 5.65,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 154.2,
    CAD: 1.38,
    AUD: 1.52,
    CHF: 0.88,
  },
  lastUpdated: new Date().toISOString(),
};

/**
 * Converts an amount from one currency to another using the provided rates.
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates = DEFAULT_RATES
): number {
  if (from === to) return amount;
  if (!amount || isNaN(amount)) return 0;

  // Convert to USD first (pivot currency)
  const fromRate = rates.rates[from] || 1;
  const toRate = rates.rates[to] || 1;

  const inUSD = amount / fromRate;
  const inTarget = inUSD * toRate;

  return inTarget;
}

/**
 * Formats a currency amount nicely with appropriate symbol and decimals.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  showSign: boolean = false
): string {
  const info = CURRENCIES[currency] || CURRENCIES.BRL;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = absAmount.toLocaleString('pt-BR', {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  });

  if (currency === 'JPY') {
    formatted = Math.round(absAmount).toLocaleString('pt-BR');
  }

  const sign = isNegative ? '- ' : showSign && amount > 0 ? '+ ' : '';
  return `${sign}${info.symbol} ${formatted}`;
}

/**
 * Get direct exchange rate between two currencies (e.g. 1 USD = 5.65 BRL, 1 EUR = 6.14 BRL)
 */
export function getExchangeRate(
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates = DEFAULT_RATES
): number {
  return convertCurrency(1, from, to, rates);
}
