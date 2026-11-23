import React, { useState, useEffect } from 'react';
import {
  Account,
  Category,
  CurrencyCode,
  ExchangeRates,
  GeoLocation,
  Transaction,
  TransactionType,
} from '../../types/finance';
import { CURRENCIES, convertCurrency, formatCurrency } from '../../services/currencyService';
import { X, MapPin, Navigation, DollarSign, Calendar, Tag, CreditCard, FileText } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  accounts: Account[];
  categories: Category[];
  baseCurrency: CurrencyCode;
  rates: ExchangeRates;
  initialLocation?: GeoLocation | null;
}

const PRESET_LOCATIONS: GeoLocation[] = [
  { name: 'Av. Paulista, São Paulo', address: 'Bela Vista, São Paulo - SP', lat: -23.5614, lng: -46.6560, city: 'São Paulo', country: 'Brasil' },
  { name: 'Jardins / Oscar Freire, SP', address: 'Jardins, São Paulo - SP', lat: -23.5639, lng: -46.6663, city: 'São Paulo', country: 'Brasil' },
  { name: 'Times Square & Midtown, NYC', address: 'Manhattan, New York, NY', lat: 40.7580, lng: -73.9855, city: 'New York', country: 'EUA' },
  { name: 'Fifth Avenue Shopping, NYC', address: '767 5th Ave, New York, NY', lat: 40.7638, lng: -73.9729, city: 'New York', country: 'EUA' },
  { name: 'Champs-Élysées & Le Marais, Paris', address: 'Paris, France', lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'França' },
  { name: 'Soho & Covent Garden, London', address: 'London, UK', lat: 51.5136, lng: -0.1365, city: 'London', country: 'Reino Unido' },
  { name: 'Shibuya & Shinjuku, Tokyo', address: 'Tokyo, Japan', lat: 35.6595, lng: 139.7005, city: 'Tokyo', country: 'Japão' },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  categories,
  baseCurrency,
  rates,
  initialLocation,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('BRL');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>(categories[0]?.id || 'cat-food');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [includeLocation, setIncludeLocation] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    if (initialLocation) {
      setIncludeLocation(true);
      setLocationName(initialLocation.name);
      setLat(initialLocation.lat);
      setLng(initialLocation.lng);
      setCity(initialLocation.city || '');
      setCountry(initialLocation.country || '');
    }
  }, [initialLocation]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const convertedPreview = convertCurrency(numAmount, currency, baseCurrency, rates);

  const handleApplyPreset = (preset: GeoLocation) => {
    setIncludeLocation(true);
    setLocationName(preset.name);
    setLat(preset.lat);
    setLng(preset.lng);
    setCity(preset.city || '');
    setCountry(preset.country || '');
  };

  const handleGetDeviceLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIncludeLocation(true);
          setLat(Number(pos.coords.latitude.toFixed(6)));
          setLng(Number(pos.coords.longitude.toFixed(6)));
          if (!locationName) setLocationName('Minha Localização Atual');
        },
        (err) => {
          console.warn('Geolocation error:', err);
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numAmount <= 0 || !accountId) return;

    let loc: GeoLocation | undefined = undefined;
    if (includeLocation && typeof lat === 'number' && typeof lng === 'number') {
      loc = {
        name: locationName.trim() || 'Local Registrado',
        lat,
        lng,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
      };
    }

    onSave({
      title: title.trim(),
      amount: numAmount,
      currency,
      type,
      category,
      date,
      accountId,
      status: 'paid',
      notes: notes.trim() || undefined,
      location: loc,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Nova Transação
              </h3>
              <p className="text-xs text-slate-400">
                Suporte a múltiplas moedas e geolocalização
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
          {/* Type selector: Despesa / Receita */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Despesa (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Receita (+)
            </button>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-8">
              <label className="block text-slate-400 mb-1 font-medium">Valor</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-base font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="col-span-4">
              <label className="block text-slate-400 mb-1 font-medium">Moeda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c as CurrencyCode].flag} {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Currency conversion preview if different from base */}
          {currency !== baseCurrency && numAmount > 0 && (
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-indigo-300">
              <span>Equivalente na moeda base ({baseCurrency}):</span>
              <strong className="font-bold">
                {formatCurrency(convertedPreview, baseCurrency)}
              </strong>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Descrição / Estabelecimento</label>
            <input
              type="text"
              required
              placeholder="Ex: Almoço de negócios, Apple Store, Pão de Açúcar..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Carteira / Conta
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data da Transação
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Geolocation Section */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLocation}
                  onChange={(e) => setIncludeLocation(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Marcar no Google Maps
              </label>

              {includeLocation && (
                <button
                  type="button"
                  onClick={handleGetDeviceLocation}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  <Navigation className="w-3 h-3" /> Usar GPS
                </button>
              )}
            </div>

            {includeLocation && (
              <div className="space-y-2 pt-1 border-t border-slate-800">
                {/* Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <span className="text-[10px] text-slate-500 shrink-0">Atalhos:</span>
                  {PRESET_LOCATIONS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] whitespace-nowrap border border-slate-700"
                    >
                      {preset.city}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Nome do local (ex: Pão de Açúcar Jardins)"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude (ex: -23.56)"
                    value={lat}
                    onChange={(e) => setLat(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude (ex: -46.65)"
                    value={lng}
                    onChange={(e) => setLng(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Comprovante guardado, reembolso pendente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit buttons */}
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Salvar Transação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
