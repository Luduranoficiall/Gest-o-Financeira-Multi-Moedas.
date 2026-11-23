import React, { useState } from 'react';
import { Account, AccountType, CurrencyCode } from '../../types/finance';
import { CURRENCIES } from '../../services/currencyService';
import { X, CreditCard, Building2, Wallet, Landmark } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'>) => void;
}

const ACCOUNT_TYPES: { type: AccountType; label: string }[] = [
  { type: 'checking', label: 'Conta Corrente' },
  { type: 'investment', label: 'Investimentos' },
  { type: 'digital', label: 'Conta Global / Digital' },
  { type: 'cash', label: 'Dinheiro em Espécie' },
  { type: 'crypto', label: 'Criptoativos' },
];

const COLORS = [
  '#820AD1', // Nubank purple
  '#0284c7', // Blue
  '#16a34a', // Wise Green
  '#f59e0b', // Amber / Gold
  '#dc2626', // Red
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      institution: institution.trim() || 'Banco / Carteira',
      type,
      currency,
      balance: parseFloat(balance) || 0,
      color,
      icon: 'CreditCard',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Landmark className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Nova Carteira / Conta Multi-Moeda
              </h3>
              <p className="text-xs text-slate-400">
                Adicione contas nacionais ou globais (Wise, Nomad, Revolut, etc.)
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
          {/* Account Name */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Nome da Conta / Carteira</label>
            <input
              type="text"
              required
              placeholder="Ex: Wise Dólar, Nomad EUA, Santander Brasil..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Instituição Financeira</label>
            <input
              type="text"
              placeholder="Ex: Wise, Nomad, Nubank, Interactive Brokers..."
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Moeda Nativa</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c as CurrencyCode].flag} {c} ({CURRENCIES[c as CurrencyCode].symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Saldo Inicial na Moeda da Conta</label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-base font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Cor de Identificação</label>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30 transition-all"
            >
              Criar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
