export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  decimals: number;
}

export interface ExchangeRates {
  base: CurrencyCode; // usually USD
  rates: Record<CurrencyCode, number>;
  lastUpdated: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionStatus = 'paid' | 'pending';

export interface GeoLocation {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number; // in original transaction currency
  currency: CurrencyCode;
  type: TransactionType;
  category: string;
  date: string; // ISO format YYYY-MM-DD
  accountId: string;
  targetAccountId?: string; // for transfers
  status: TransactionStatus;
  location?: GeoLocation;
  notes?: string;
  paymentMethod?: string;
}

export type AccountType = 'checking' | 'investment' | 'credit' | 'cash' | 'crypto' | 'digital';

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: number;
  color: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: CurrencyCode;
  month: string; // YYYY-MM
  alertThreshold: number; // e.g., 80 for 80%
}

export type AlertSeverity = 'warning' | 'exceeded';

export interface BudgetAlert {
  id: string;
  budgetId: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  spentInBase: number;
  limitInBase: number;
  percentage: number;
  excessInBase: number;
  severity: AlertSeverity;
  month: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity | 'info';
  categoryId?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  deadline: string;
  category: string;
  color: string;
}
