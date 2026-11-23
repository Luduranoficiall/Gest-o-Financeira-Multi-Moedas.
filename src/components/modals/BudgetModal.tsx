import React, { useState, useEffect } from 'react';
import { Budget, Category, CurrencyCode } from '../../types/finance';
import { CURRENCIES } from '../../services/currencyService';
import { X, BellRing, ShieldAlert, Tag, Calendar } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id'>, existingId?: string) => void;
  categories: Category[];
  baseCurrency: CurrencyCode;
  defaultMonth: string;
  editingBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  baseCurrency,
  defaultMonth,
  editingBudget,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  const [categoryId, setCategoryId] = useState<string>(expenseCategories[0]?.id || 'cat-food');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>(baseCurrency);
  const [month, setMonth] = useState<string>(defaultMonth);
  const [alertThreshold, setAlertThreshold] = useState<number>(80);

  useEffect(() => {
    if (editingBudget) {
      setCategoryId(editingBudget.categoryId);
      setAmount(String(editingBudget.amount));
      setCurrency(editingBudget.currency);
      setMonth(editingBudget.month);
      setAlertThreshold(editingBudget.alertThreshold);
    } else {
      setCategoryId(expenseCategories[0]?.id || 'cat-food');
      setAmount('');
      setCurrency(baseCurrency);
      setMonth(defaultMonth);
      setAlertThreshold(80);
    }
  }, [editingBudget, isOpen, baseCurrency, defaultMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    onSave(
      {
        categoryId,
        amount: numAmount,
        currency,
        month,
        alertThreshold,
      },
      editingBudget?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BellRing className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingBudget ? 'Editar Limite Orçamentário' : 'Novo Limite de Orçamento'}
              </h3>
              <p className="text-xs text-slate-400">
                Receba alertas quando a categoria atingir o teto mensal
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-400" /> Categoria de Despesa
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-8">
              <label className="block text-slate-400 mb-1 font-medium">Limite Mensal</label>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="Ex: 2500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-base font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="col-span-4">
              <label className="block text-slate-400 mb-1 font-medium">Moeda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c as CurrencyCode].flag} {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Mês de Referência
            </label>
            <input
              type="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Alerta Preventivo
              </label>
              <span className="font-mono font-bold text-amber-400">{alertThreshold}% do limite</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Você será notificado com aviso prévio ao atingir {alertThreshold}% e alerta crítico ao ultrapassar 100%.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-medium hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-600/30 transition-all"
            >
              {editingBudget ? 'Atualizar Limite' : 'Salvar Orçamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
