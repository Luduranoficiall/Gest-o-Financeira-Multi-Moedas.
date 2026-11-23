import React, { useState, useEffect, useMemo } from 'react';
import {
  Account,
  Budget,
  BudgetAlert,
  Category,
  CurrencyCode,
  ExchangeRates,
  FinancialGoal,
  GeoLocation,
  ToastNotification,
  Transaction,
} from './types/finance';
import {
  CURRENCIES,
  DEFAULT_RATES,
  convertCurrency,
  formatCurrency,
} from './services/currencyService';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_CATEGORIES,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
} from './data/mockData';
import { CashFlowChart } from './components/charts/CashFlowChart';
import { CategoryDonutChart } from './components/charts/CategoryDonutChart';
import { CurrencyAllocationChart } from './components/charts/CurrencyAllocationChart';
import { SpendingTrendChart } from './components/charts/SpendingTrendChart';
import { ExpenseMap } from './components/maps/ExpenseMap';
import { TransactionModal } from './components/modals/TransactionModal';
import { AccountModal } from './components/modals/AccountModal';
import { CurrencyConverterModal } from './components/modals/CurrencyConverterModal';
import { GoalModal } from './components/modals/GoalModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { BudgetAlertsSection } from './components/budgets/BudgetAlertsSection';
import { AlertToastStack } from './components/budgets/AlertToastStack';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Compass,
  BarChart3,
  ListFilter,
  TrendingUp,
  Target,
  Download,
  Trash2,
  MapPin,
  Calendar,
  Search,
  ArrowRightLeft,
  ChevronRight,
  Bell,
  BellRing,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  // Quota defense state as mandated by Google Maps Platform skill
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Primary base currency for consolidated balances & reporting
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('finglobal_base_currency');
    return (saved as CurrencyCode) || 'BRL';
  });

  // Rates state
  const [rates, setRates] = useState<ExchangeRates>(() => {
    const saved = localStorage.getItem('finglobal_rates');
    return saved ? JSON.parse(saved) : DEFAULT_RATES;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'transactions' | 'map' | 'analytics' | 'accounts' | 'budgets' | 'goals'
  >('dashboard');

  // Core financial state with localStorage persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finglobal_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('finglobal_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finglobal_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('finglobal_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  // Modals & notifications state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isAlertsDropdownOpen, setIsAlertsDropdownOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [selectedLocationForTx, setSelectedLocationForTx] = useState<GeoLocation | null>(null);

  // Filters for Transactions tab
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [txCurrencyFilter, setTxCurrencyFilter] = useState<string>('all');
  const [txCategoryFilter, setTxCategoryFilter] = useState<string>('all');

  // Persist state updates
  useEffect(() => {
    localStorage.setItem('finglobal_base_currency', baseCurrency);
  }, [baseCurrency]);

  useEffect(() => {
    localStorage.setItem('finglobal_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finglobal_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('finglobal_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finglobal_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finglobal_rates', JSON.stringify(rates));
  }, [rates]);

  // Maps API Key from environment or window config
  const mapsApiKey =
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
    (window as unknown as { __GOOGLE_MAPS_API_KEY__?: string }).__GOOGLE_MAPS_API_KEY__ ||
    '';

  // Consolidated Net Worth Calculation
  const totalNetWorth = useMemo(() => {
    return accounts.reduce((acc, account) => {
      const inBase = convertCurrency(account.balance, account.currency, baseCurrency, rates);
      return acc + inBase;
    }, 0);
  }, [accounts, baseCurrency, rates]);

  // Current Month Income & Expenses (November 2026)
  const currentMonth = '2026-11';
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  const monthIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + convertCurrency(t.amount, t.currency, baseCurrency, rates), 0);
  }, [monthTransactions, baseCurrency, rates]);

  const monthExpenses = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + convertCurrency(t.amount, t.currency, baseCurrency, rates), 0);
  }, [monthTransactions, baseCurrency, rates]);

  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome) * 100 : 0;

  // Monthly Cash Flow Chart series (Last 5 months data)
  const cashFlowHistory = useMemo(() => {
    const months = [
      { key: '2026-07', label: 'Jul' },
      { key: '2026-08', label: 'Ago' },
      { key: '2026-09', label: 'Set' },
      { key: '2026-10', label: 'Out' },
      { key: '2026-11', label: 'Nov' },
    ];

    return months.map((m) => {
      const txs = transactions.filter((t) => t.date.startsWith(m.key));
      const inc = txs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, 'BRL', rates), 0);
      const exp = txs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, 'BRL', rates), 0);

      // Baseline fallback for demo months if no recorded data
      const defaultInc = m.key === '2026-11' ? inc : inc || 17800;
      const defaultExp = m.key === '2026-11' ? exp : exp || 12400;

      return {
        month: m.key,
        monthLabel: m.label,
        income: defaultInc,
        expense: defaultExp,
      };
    });
  }, [transactions, rates]);

  // Active Budget Alerts computation for current month
  const budgetAlerts: BudgetAlert[] = useMemo(() => {
    const monthBudgets = budgets.filter((b) => b.month === currentMonth);
    const list: BudgetAlert[] = [];

    monthBudgets.forEach((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      const limitInBase = convertCurrency(b.amount, b.currency, baseCurrency, rates);
      if (limitInBase <= 0) return;

      const spentInBase = transactions
        .filter((t) => t.type === 'expense' && t.category === b.categoryId && t.date.startsWith(b.month))
        .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, baseCurrency, rates), 0);

      const percentage = (spentInBase / limitInBase) * 100;

      if (percentage > 100) {
        list.push({
          id: `alert-${b.id}`,
          budgetId: b.id,
          categoryId: b.categoryId,
          categoryName: cat?.name || b.categoryId,
          categoryColor: cat?.color || '#ef4444',
          spentInBase,
          limitInBase,
          percentage,
          excessInBase: spentInBase - limitInBase,
          severity: 'exceeded',
          month: b.month,
        });
      } else if (percentage >= b.alertThreshold) {
        list.push({
          id: `alert-${b.id}`,
          budgetId: b.id,
          categoryId: b.categoryId,
          categoryName: cat?.name || b.categoryId,
          categoryColor: cat?.color || '#f59e0b',
          spentInBase,
          limitInBase,
          percentage,
          excessInBase: 0,
          severity: 'warning',
          month: b.month,
        });
      }
    });

    return list.sort((a, b) => b.percentage - a.percentage);
  }, [budgets, transactions, categories, baseCurrency, rates, currentMonth]);

  const pushToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 7000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Handler to add a new transaction and update corresponding account balance
  const handleSaveTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };

    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === newTx.accountId) {
          let change = newTx.amount;
          if (newTx.currency !== acc.currency) {
            change = convertCurrency(newTx.amount, newTx.currency, acc.currency, rates);
          }
          const updatedBalance =
            newTx.type === 'income' ? acc.balance + change : acc.balance - change;
          return { ...acc, balance: updatedBalance };
        }
        return acc;
      })
    );

    // Trigger Budget Alert Notification if expense pushes category over threshold or limit
    if (newTx.type === 'expense') {
      const txMonth = newTx.date.slice(0, 7);
      const matchingBudget = budgets.find(
        (b) => b.categoryId === newTx.category && b.month === txMonth
      );
      if (matchingBudget) {
        const cat = categories.find((c) => c.id === newTx.category);
        const catName = cat?.name || 'Categoria';
        const limitInBase = convertCurrency(matchingBudget.amount, matchingBudget.currency, baseCurrency, rates);
        const newSpentInBase = updatedTransactions
          .filter((t) => t.type === 'expense' && t.category === newTx.category && t.date.startsWith(txMonth))
          .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, baseCurrency, rates), 0);

        const pct = limitInBase > 0 ? (newSpentInBase / limitInBase) * 100 : 0;

        if (pct > 100) {
          pushToast({
            title: `Orçamento Ultrapassado: ${catName}`,
            message: `Você atingiu ${pct.toFixed(0)}% do limite mensal (${formatCurrency(newSpentInBase, baseCurrency)} de ${formatCurrency(limitInBase, baseCurrency)}).`,
            severity: 'exceeded',
            categoryId: newTx.category,
          });
        } else if (pct >= matchingBudget.alertThreshold) {
          pushToast({
            title: `Alerta de Orçamento: ${catName}`,
            message: `Categoria atingiu ${pct.toFixed(0)}% do teto mensal definido (${formatCurrency(limitInBase, baseCurrency)}).`,
            severity: 'warning',
            categoryId: newTx.category,
          });
        }
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveAccount = (newAccountData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...newAccountData,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAccount]);
  };

  const handleSaveBudget = (budgetData: Omit<Budget, 'id'>, existingId?: string) => {
    if (existingId) {
      setBudgets((prev) =>
        prev.map((b) => (b.id === existingId ? { ...budgetData, id: existingId } : b))
      );
    } else {
      const existingForCatMonth = budgets.find(
        (b) => b.categoryId === budgetData.categoryId && b.month === budgetData.month
      );
      if (existingForCatMonth) {
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === existingForCatMonth.id ? { ...budgetData, id: existingForCatMonth.id } : b
          )
        );
      } else {
        setBudgets((prev) => [...prev, { ...budgetData, id: `b-${Date.now()}` }]);
      }
    }

    // Immediate evaluation toast if newly saved budget is already exceeded
    const cat = categories.find((c) => c.id === budgetData.categoryId);
    const limitInBase = convertCurrency(budgetData.amount, budgetData.currency, baseCurrency, rates);
    const spentInBase = transactions
      .filter((t) => t.type === 'expense' && t.category === budgetData.categoryId && t.date.startsWith(budgetData.month))
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, baseCurrency, rates), 0);

    const pct = limitInBase > 0 ? (spentInBase / limitInBase) * 100 : 0;
    if (pct > 100) {
      pushToast({
        title: `Limite já excedido: ${cat?.name || 'Categoria'}`,
        message: `O gasto atual (${formatCurrency(spentInBase, baseCurrency)}) já supera o teto definido (${formatCurrency(limitInBase, baseCurrency)}).`,
        severity: 'exceeded',
        categoryId: budgetData.categoryId,
      });
    }
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveGoal = (newGoalData: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...newGoalData,
      id: `g-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleOpenMapAddTransaction = (location: GeoLocation) => {
    setSelectedLocationForTx(location);
    setIsTxModalOpen(true);
  };

  // Filtered transactions for the Extrato tab
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) return false;
      if (txCurrencyFilter !== 'all' && tx.currency !== txCurrencyFilter) return false;
      if (txCategoryFilter !== 'all' && tx.category !== txCategoryFilter) return false;
      if (txSearch.trim()) {
        const query = txSearch.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(query);
        const matchNotes = tx.notes?.toLowerCase().includes(query) || false;
        const matchLoc = tx.location?.name.toLowerCase().includes(query) || false;
        if (!matchTitle && !matchNotes && !matchLoc) return false;
      }
      return true;
    });
  }, [transactions, txTypeFilter, txCurrencyFilter, txCategoryFilter, txSearch]);

  const handleExportCSV = () => {
    const headers = ['Data', 'Título', 'Tipo', 'Valor', 'Moeda', 'Equivalente Base', 'Categoria', 'Local'];
    const rows = filteredTransactions.map((tx) => [
      tx.date,
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.type,
      tx.amount.toFixed(2),
      tx.currency,
      convertCurrency(tx.amount, tx.currency, baseCurrency, rates).toFixed(2),
      categories.find((c) => c.id === tx.category)?.name || tx.category,
      tx.location ? `"${tx.location.name.replace(/"/g, '""')}"` : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finglobal_extrato_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Quota Defense Banner (Mandatory GMP SKILL Case A) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & App title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Compass className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  FinGlobal
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Multi-Moedas & Maps
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Gestão Financeira & Mapeamento Geográfico de Despesas
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Base Currency Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm">
              <span className="text-xs text-slate-400 hidden md:inline">Moeda Base:</span>
              <span className="text-sm">{CURRENCIES[baseCurrency]?.flag}</span>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                title="Alterar moeda principal de consolidação"
              >
                {Object.keys(CURRENCIES).map((code) => (
                  <option key={code} value={code} className="bg-slate-900 text-slate-100">
                    {code} ({CURRENCIES[code as CurrencyCode].symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Alerts Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsAlertsDropdownOpen((prev) => !prev)}
                className={`relative p-2 rounded-xl border transition-all shadow-sm ${
                  budgetAlerts.some((a) => a.severity === 'exceeded')
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20'
                    : budgetAlerts.length > 0
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Alertas Orçamentários"
                aria-label="Alertas Orçamentários"
              >
                <Bell className="w-4 h-4" />
                {budgetAlerts.length > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow ${
                      budgetAlerts.some((a) => a.severity === 'exceeded')
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                  >
                    {budgetAlerts.length}
                  </span>
                )}
              </button>

              {isAlertsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Central de Alertas ({budgetAlerts.length})
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab('budgets');
                        setIsAlertsDropdownOpen(false);
                      }}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      Gerenciar Limites →
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80">
                    {budgetAlerts.length === 0 ? (
                      <div className="p-5 text-center text-xs text-slate-400">
                        Nenhuma categoria ultrapassou ou se aproximou do limite neste mês.
                      </div>
                    ) : (
                      budgetAlerts.map((alert) => {
                        const isExceeded = alert.severity === 'exceeded';
                        return (
                          <div
                            key={alert.id}
                            onClick={() => {
                              setActiveTab('budgets');
                              setIsAlertsDropdownOpen(false);
                            }}
                            className="p-3.5 hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3"
                          >
                            <span
                              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                isExceeded
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {isExceeded ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : (
                                <BellRing className="w-3.5 h-3.5" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-100 truncate">
                                  {alert.categoryName}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    isExceeded
                                      ? 'bg-rose-500/20 text-rose-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}
                                >
                                  {alert.percentage.toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {isExceeded
                                  ? `Excedeu ${formatCurrency(alert.excessInBase, baseCurrency)} acima do teto.`
                                  : `Aproximando-se do teto de ${formatCurrency(alert.limitInBase, baseCurrency)}.`}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Currency Converter Button */}
            <button
              onClick={() => setIsConverterOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Abrir Calculadora de Câmbio"
            >
              <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Câmbio</span>
            </button>

            {/* Primary Add Transaction Button */}
            <button
              onClick={() => {
                setSelectedLocationForTx(null);
                setIsTxModalOpen(true);
              }}
              className="px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Transação</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-900 py-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" /> Visão Geral
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'transactions'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-emerald-400" /> Transações & Extrato
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all relative ${
              activeTab === 'map'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-rose-400" /> Mapa de Gastos (Google Maps)
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1.5 right-1.5"></span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Gráficos & Relatórios
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'accounts'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400" /> Contas & Câmbio
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'budgets'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-amber-400" />
            <span>Orçamentos & Alertas</span>
            {budgetAlerts.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${
                  budgetAlerts.some((a) => a.severity === 'exceeded')
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              >
                {budgetAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'goals'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-pink-400" /> Metas de Poupança
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards (Always visible on top) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Patrimônio Consolidado */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Patrimônio Consolidado</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {formatCurrency(totalNetWorth, baseCurrency)}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{accounts.length} contas ativas</span>
              <span>•</span>
              <span className="truncate">Distribuídas em {Object.keys(CURRENCIES).length} moedas</span>
            </div>
          </div>

          {/* Card 2: Receitas do Mês */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Receitas de Novembro</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {formatCurrency(monthIncome, baseCurrency)}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">+12.4%</span>
              <span>vs. mês anterior</span>
            </div>
          </div>

          {/* Card 3: Despesas do Mês */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Despesas de Novembro</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
              {formatCurrency(monthExpenses, baseCurrency)}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <span className="text-slate-400">{monthTransactions.filter((t) => t.type === 'expense').length} compras registradas</span>
            </div>
          </div>

          {/* Card 4: Saldo Líquido & Poupança */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Taxa de Poupança</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono tracking-tight">
              {savingsRate.toFixed(1)}%
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <span className="text-slate-300 font-semibold">
                {formatCurrency(monthIncome - monthExpenses, baseCurrency, true)}
              </span>
              <span>guardados este mês</span>
            </div>
          </div>
        </section>

        {/* TAB 1: VISÃO GERAL (DASHBOARD) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Budget Alert Banner on Dashboard when limits are exceeded or warned */}
            {budgetAlerts.length > 0 && (
              <div
                className={`rounded-2xl p-4 border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  budgetAlerts.some((a) => a.severity === 'exceeded')
                    ? 'bg-rose-950/35 border-rose-500/40'
                    : 'bg-amber-950/30 border-amber-500/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span
                    className={`p-2.5 rounded-xl shrink-0 ${
                      budgetAlerts.some((a) => a.severity === 'exceeded')
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">
                      {budgetAlerts.filter((a) => a.severity === 'exceeded').length > 0
                        ? `Atenção: ${budgetAlerts.filter((a) => a.severity === 'exceeded').length} categoria(s) ultrapassaram o orçamento mensal!`
                        : `${budgetAlerts.length} categoria(s) próximas do limite mensal de gastos`}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {budgetAlerts
                        .slice(0, 2)
                        .map(
                          (a) =>
                            `${a.categoryName} (${a.percentage.toFixed(0)}%)`
                        )
                        .join(' • ')}
                      {budgetAlerts.length > 2 ? ` e +${budgetAlerts.length - 2}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('budgets')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-all"
                >
                  <span>Revisar Orçamentos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <CashFlowChart
                  data={cashFlowHistory}
                  baseCurrency={baseCurrency}
                  rates={rates}
                />
              </div>
              <div className="lg:col-span-5">
                <CategoryDonutChart
                  transactions={transactions}
                  categories={categories}
                  baseCurrency={baseCurrency}
                  rates={rates}
                  selectedMonth={currentMonth}
                />
              </div>
            </div>

            {/* Currency Allocation Bar & Accounts */}
            <CurrencyAllocationChart
              accounts={accounts}
              baseCurrency={baseCurrency}
              rates={rates}
            />

            {/* Map Preview Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-100">
                    Mapeamento Global de Despesas
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Suas transações registradas em São Paulo, Nova York, Paris, Londres e Tóquio estão prontas para visualização interativa com Google Maps Platform. Acompanhe despesas de viagens, compras internacionais e locais por estabelecimento.
                </p>
                <div className="flex items-center gap-4 text-xs font-medium text-indigo-300 pt-1">
                  <span>📍 {transactions.filter((t) => t.location).length} despesas geolocalizadas</span>
                  <span>•</span>
                  <span>🌎 Câmbio automático</span>
                  <span>•</span>
                  <span>⚡ Pins inteligentes</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('map')}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 whitespace-nowrap transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Explorar no Mapa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Recent Transactions Table Preview */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  Últimas Transações
                  <span className="text-xs font-normal text-slate-400">({transactions.length} total)</span>
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  Ver Extrato Completo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-800/80">
                {transactions.slice(0, 6).map((tx) => {
                  const cat = categories.find((c) => c.id === tx.category);
                  const isIncome = tx.type === 'income';
                  const inBase = convertCurrency(tx.amount, tx.currency, baseCurrency, rates);

                  return (
                    <div
                      key={tx.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
                          style={{ backgroundColor: isIncome ? '#10b981' : cat?.color || '#3b82f6' }}
                        >
                          {CURRENCIES[tx.currency]?.flag || '💵'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-slate-100">
                              {tx.title}
                            </span>
                            {tx.location && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-rose-400" />
                                {tx.location.city || tx.location.name}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {cat?.name || 'Geral'} • {tx.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-xs sm:text-sm font-bold font-mono ${
                            isIncome ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {isIncome ? '+ ' : '- '}
                          {formatCurrency(tx.amount, tx.currency)}
                        </div>
                        {tx.currency !== baseCurrency && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            ≈ {formatCurrency(inBase, baseCurrency)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSAÇÕES & EXTRATO */}
        {activeTab === 'transactions' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Filter Toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por descrição, observação ou cidade..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Filter Selects */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter */}
                <select
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value as 'all' | 'expense' | 'income')}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="expense">Apenas Despesas</option>
                  <option value="income">Apenas Receitas</option>
                </select>

                {/* Currency Filter */}
                <select
                  value={txCurrencyFilter}
                  onChange={(e) => setTxCurrencyFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="all">Todas as Moedas</option>
                  {Object.keys(CURRENCIES).map((c) => (
                    <option key={c} value={c}>
                      {CURRENCIES[c as CurrencyCode].flag} {c}
                    </option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={txCategoryFilter}
                  onChange={(e) => setTxCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Export CSV Button */}
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Exportar dados filtrados para CSV"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Exibindo <strong>{filteredTransactions.length}</strong> transações
                </span>
                <span>Convertidas na moeda base ({baseCurrency})</span>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <p className="text-sm">Nenhuma transação encontrada com os filtros selecionados.</p>
                  <button
                    onClick={() => {
                      setTxSearch('');
                      setTxTypeFilter('all');
                      setTxCurrencyFilter('all');
                      setTxCategoryFilter('all');
                    }}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    Redefinir Filtros
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {filteredTransactions.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.category);
                    const isIncome = tx.type === 'income';
                    const inBase = convertCurrency(tx.amount, tx.currency, baseCurrency, rates);

                    return (
                      <div
                        key={tx.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm mt-0.5"
                            style={{ backgroundColor: isIncome ? '#10b981' : cat?.color || '#3b82f6' }}
                          >
                            {CURRENCIES[tx.currency]?.flag || '💵'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-100">
                                {tx.title}
                              </span>
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: cat?.color || '#475569' }}
                              >
                                {cat?.name || 'Geral'}
                              </span>
                              {tx.location && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-rose-400" />
                                  {tx.location.name}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {tx.date}
                              </span>
                              {tx.notes && <span className="italic text-slate-500">&quot;{tx.notes}&quot;</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-center">
                          <div className="text-right">
                            <div
                              className={`text-base font-bold font-mono ${
                                isIncome ? 'text-emerald-400' : 'text-slate-100'
                              }`}
                            >
                              {isIncome ? '+ ' : '- '}
                              {formatCurrency(tx.amount, tx.currency)}
                            </div>
                            {tx.currency !== baseCurrency && (
                              <div className="text-xs text-slate-400 font-mono">
                                ≈ {formatCurrency(inBase, baseCurrency)}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                            title="Excluir Transação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MAPA DE GASTOS (GOOGLE MAPS PLATFORM) */}
        {activeTab === 'map' && (
          <div className="space-y-4 animate-fadeIn">
            <ExpenseMap
              transactions={transactions}
              categories={categories}
              baseCurrency={baseCurrency}
              rates={rates}
              apiKey={mapsApiKey}
              onOpenNewTransactionWithLocation={handleOpenMapAddTransaction}
            />
          </div>
        )}

        {/* TAB 4: GRÁFICOS & RELATÓRIOS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <CashFlowChart
                  data={cashFlowHistory}
                  baseCurrency={baseCurrency}
                  rates={rates}
                />
              </div>
              <div className="lg:col-span-5">
                <CategoryDonutChart
                  transactions={transactions}
                  categories={categories}
                  baseCurrency={baseCurrency}
                  rates={rates}
                  selectedMonth={currentMonth}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <SpendingTrendChart
                  transactions={transactions}
                  baseCurrency={baseCurrency}
                  rates={rates}
                />
              </div>
              <div className="lg:col-span-5">
                <CurrencyAllocationChart
                  accounts={accounts}
                  baseCurrency={baseCurrency}
                  rates={rates}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CONTAS & CÂMBIO */}
        {activeTab === 'accounts' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header with New Account button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Carteiras & Contas Multi-Moeda
                </h2>
                <p className="text-xs text-slate-400">
                  Gerencie saldos em BRL, USD, EUR, GBP, JPY e outras moedas globais
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsConverterOpen(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                  Simulador de Câmbio
                </button>
                <button
                  onClick={() => setIsAccountModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Nova Conta
                </button>
              </div>
            </div>

            {/* Accounts Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => {
                const inBase = convertCurrency(acc.balance, acc.currency, baseCurrency, rates);

                return (
                  <div
                    key={acc.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: acc.color }}
                          />
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {acc.institution}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-bold text-slate-300">
                          {CURRENCIES[acc.currency]?.flag} {acc.currency}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-100">{acc.name}</h3>

                      <div className="mt-4">
                        <span className="text-xs text-slate-400">Saldo Disponível:</span>
                        <div className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight mt-0.5">
                          {formatCurrency(acc.balance, acc.currency)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Valor em {baseCurrency}:</span>
                      <strong className="text-slate-300 font-mono font-semibold">
                        {formatCurrency(inBase, baseCurrency)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Exchange Rates Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Cotações & Câmbio de Referência
                  </h3>
                  <p className="text-xs text-slate-400">
                    Taxas de conversão relativas a 1 Dólar Americano (USD)
                  </p>
                </div>
                <button
                  onClick={() => setIsConverterOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Abrir Calculadora Completa →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.keys(CURRENCIES).map((cCode) => {
                  const code = cCode as CurrencyCode;
                  const rate = rates.rates[code] || 1;
                  const inBaseOne = convertCurrency(1, code, baseCurrency, rates);

                  return (
                    <div
                      key={code}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CURRENCIES[code].flag}</span>
                        <div>
                          <span className="font-bold text-slate-200 block">{code}</span>
                          <span className="text-[10px] text-slate-500">{CURRENCIES[code].name}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-slate-100 text-xs block">
                          {formatCurrency(inBaseOne, baseCurrency)}
                        </span>
                        <span className="text-[10px] text-slate-400">1 {code}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ORÇAMENTOS & ALERTAS */}
        {activeTab === 'budgets' && (
          <BudgetAlertsSection
            budgets={budgets}
            alerts={budgetAlerts}
            transactions={transactions}
            categories={categories}
            baseCurrency={baseCurrency}
            rates={rates}
            selectedMonth={currentMonth}
            onAddBudget={() => {
              setEditingBudget(null);
              setIsBudgetModalOpen(true);
            }}
            onEditBudget={(b) => {
              setEditingBudget(b);
              setIsBudgetModalOpen(true);
            }}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {/* TAB 7: METAS DE POUPANÇA */}
        {activeTab === 'goals' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Metas Financeiras & Sonhos
                </h2>
                <p className="text-xs text-slate-400">
                  Acompanhe seus objetivos de economia em qualquer moeda
                </p>
              </div>

              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-pink-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nova Meta
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {goals.map((goal) => {
                const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

                return (
                  <div
                    key={goal.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: goal.color }}
                        >
                          {CURRENCIES[goal.currency]?.flag} {goal.currency}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Prazo: {goal.deadline}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-100 leading-snug">
                        {goal.title}
                      </h3>

                      <div className="mt-4 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                            Guardado
                          </span>
                          <strong className="text-lg font-bold text-slate-100 font-mono">
                            {formatCurrency(goal.currentAmount, goal.currency)}
                          </strong>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                            Objetivo
                          </span>
                          <span className="text-sm font-semibold text-slate-300 font-mono">
                            {formatCurrency(goal.targetAmount, goal.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: goal.color,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-slate-200">{pct.toFixed(0)}% concluído</span>
                        <span>Faltam {formatCurrency(remaining, goal.currency)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setSelectedLocationForTx(null);
        }}
        onSave={handleSaveTransaction}
        accounts={accounts}
        categories={categories}
        baseCurrency={baseCurrency}
        rates={rates}
        initialLocation={selectedLocationForTx}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
      />

      <CurrencyConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
        rates={rates}
        baseCurrency={baseCurrency}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        baseCurrency={baseCurrency}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        categories={categories}
        baseCurrency={baseCurrency}
        defaultMonth={currentMonth}
        editingBudget={editingBudget}
      />

      {/* Real-time Budget Alert Toasts */}
      <AlertToastStack
        toasts={toasts}
        onDismiss={dismissToast}
        onInspectBudgets={() => setActiveTab('budgets')}
      />
    </div>
  );
}
