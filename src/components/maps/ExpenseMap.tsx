import React, { useState, useMemo } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { CurrencyCode, ExchangeRates, Transaction, Category } from '../../types/finance';
import { CURRENCIES, convertCurrency, formatCurrency } from '../../services/currencyService';
import {
  MapPin,
  Compass,
  Navigation,
  Globe2,
  Receipt,
  Calendar,
  Layers,
  Filter,
  Plus,
} from 'lucide-react';

interface ExpenseMapProps {
  transactions: Transaction[];
  categories: Category[];
  baseCurrency: CurrencyCode;
  rates: ExchangeRates;
  apiKey: string;
  onOpenNewTransactionWithLocation?: (location: { name: string; address?: string; lat: number; lng: number; city?: string; country?: string }) => void;
}

// Map Controller helper to smoothly pan/zoom to presets
const MapController: React.FC<{
  target: { lat: number; lng: number; zoom: number } | null;
}> = ({ target }) => {
  const map = useMap();

  React.useEffect(() => {
    if (map && target) {
      map.panTo({ lat: target.lat, lng: target.lng });
      map.setZoom(target.zoom);
    }
  }, [map, target]);

  return null;
};

export const ExpenseMap: React.FC<ExpenseMapProps> = ({
  transactions,
  categories,
  baseCurrency,
  rates,
  apiKey,
  onOpenNewTransactionWithLocation,
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [mapTarget, setMapTarget] = useState<{ lat: number; lng: number; zoom: number } | null>({
    lat: 20,
    lng: 0,
    zoom: 2,
  });

  // Filter transactions that have valid coordinates
  const geoTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!tx.location || typeof tx.location.lat !== 'number' || typeof tx.location.lng !== 'number') {
        return false;
      }
      if (currencyFilter !== 'ALL' && tx.currency !== currencyFilter) {
        return false;
      }
      if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, currencyFilter, categoryFilter]);

  // Compute stats
  const totalInBase = useMemo(() => {
    return geoTransactions.reduce((acc, curr) => {
      return acc + convertCurrency(curr.amount, curr.currency, baseCurrency, rates);
    }, 0);
  }, [geoTransactions, baseCurrency, rates]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set<string>();
    geoTransactions.forEach((tx) => {
      if (tx.location?.country) countries.add(tx.location.country);
    });
    return Array.from(countries);
  }, [geoTransactions]);

  const cityPresets = [
    { name: 'Visão Global', lat: 20, lng: 0, zoom: 2 },
    { name: 'São Paulo', lat: -23.5614, lng: -46.6560, zoom: 12 },
    { name: 'Nova York', lat: 40.7580, lng: -73.9855, zoom: 12 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, zoom: 12 },
    { name: 'Londres', lat: 51.5074, lng: -0.1278, zoom: 12 },
    { name: 'Tóquio', lat: 35.6762, lng: 139.6503, zoom: 12 },
  ];

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapTarget({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            zoom: 14,
          });
        },
        (err) => {
          console.warn('Geolocation error:', err);
        }
      );
    }
  };

  const getCategoryColor = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.color : '#3b82f6';
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'Outros';
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Header & Stats */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Mapa Geográfico de Despesas
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Google Maps Platform
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Visualize onde suas compras internacionais e locais foram realizadas
              </p>
            </div>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-rose-400" />
            <div>
              <span className="text-slate-400">Gastos no Mapa:</span>{' '}
              <strong className="text-slate-100">{formatCurrency(totalInBase, baseCurrency)}</strong>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-slate-400">Locais:</span>{' '}
              <strong className="text-slate-100">{geoTransactions.length} registros</strong> ({uniqueCountries.length} países)
            </div>
          </div>

          <button
            onClick={handleGetCurrentLocation}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 transition-all shadow-sm"
            title="Centralizar na minha localização"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Meu Local</span>
          </button>
        </div>
      </div>

      {/* City Presets Bar */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 flex items-center gap-1 shrink-0 font-medium mr-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" /> Cidades:
        </span>
        {cityPresets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => setMapTarget({ lat: preset.lat, lng: preset.lng, zoom: preset.zoom })}
            className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all whitespace-nowrap border border-slate-700/40"
          >
            {preset.name}
          </button>
        ))}

        {/* Currency filter */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Todas as Moedas</option>
            {Object.keys(CURRENCIES).map((c) => (
              <option key={c} value={c}>
                {c} ({CURRENCIES[c as CurrencyCode].symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[520px] bg-slate-950">
        <APIProvider apiKey={apiKey}>
          <GoogleMap
            mapId="DEMO_MAP_ID"
            defaultCenter={{ lat: 20, lng: 0 }}
            defaultZoom={2}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <MapController target={mapTarget} />

            {/* Advanced Markers for each transaction */}
            {geoTransactions.map((tx) => {
              if (!tx.location) return null;
              const catColor = getCategoryColor(tx.category);
              const isIncome = tx.type === 'income';

              return (
                <AdvancedMarker
                  key={tx.id}
                  position={{ lat: tx.location.lat, lng: tx.location.lng }}
                  onClick={() => setSelectedTx(tx)}
                  title={`${tx.title} - ${formatCurrency(tx.amount, tx.currency)}`}
                >
                  <div className="relative group cursor-pointer transition-transform hover:scale-110">
                    <div
                      className="px-2 py-1 rounded-full text-[11px] font-bold text-white shadow-lg flex items-center gap-1 border-2 border-white/90"
                      style={{
                        backgroundColor: isIncome ? '#10b981' : catColor,
                      }}
                    >
                      <span>{CURRENCIES[tx.currency]?.flag || '📍'}</span>
                      <span>{formatCurrency(tx.amount, tx.currency)}</span>
                    </div>
                    {/* Marker pointer tail */}
                    <div
                      className="w-2 h-2 mx-auto rotate-45 -mt-1 border-r-2 border-b-2 border-white/90"
                      style={{ backgroundColor: isIncome ? '#10b981' : catColor }}
                    />
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow on marker click */}
            {selectedTx && selectedTx.location && (
              <InfoWindow
                position={{
                  lat: selectedTx.location.lat,
                  lng: selectedTx.location.lng,
                }}
                onCloseClick={() => setSelectedTx(null)}
              >
                <div className="p-1 max-w-[260px] text-slate-900 font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: getCategoryColor(selectedTx.category) }}
                    >
                      {getCategoryName(selectedTx.category)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {selectedTx.date}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-tight">
                    {selectedTx.title}
                  </h4>

                  {selectedTx.location.name && (
                    <p className="text-xs text-slate-600 mt-1 font-medium flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{selectedTx.location.name}</span>
                    </p>
                  )}

                  {selectedTx.location.address && (
                    <p className="text-[11px] text-slate-500 pl-4">
                      {selectedTx.location.address}
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                        Original
                      </span>
                      <strong className="text-sm text-slate-900 font-bold">
                        {formatCurrency(selectedTx.amount, selectedTx.currency)}
                      </strong>
                    </div>

                    {selectedTx.currency !== baseCurrency && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold block">
                          Em {baseCurrency}
                        </span>
                        <strong className="text-xs text-emerald-700 font-bold">
                          {formatCurrency(
                            convertCurrency(selectedTx.amount, selectedTx.currency, baseCurrency, rates),
                            baseCurrency
                          )}
                        </strong>
                      </div>
                    )}
                  </div>

                  {selectedTx.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                      &quot;{selectedTx.notes}&quot;
                    </p>
                  )}

                  {onOpenNewTransactionWithLocation && (
                    <button
                      onClick={() => {
                        if (selectedTx.location) {
                          onOpenNewTransactionWithLocation(selectedTx.location);
                        }
                      }}
                      className="w-full mt-2 py-1 px-2 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar gasto neste local
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </APIProvider>

        {/* Floating map legend / trip list overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl max-w-xs hidden sm:block">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Viagens & Cidades Registradas
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>🇧🇷</span> São Paulo, Brasil
              </span>
              <span className="font-semibold text-emerald-400">BRL</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>🇺🇸</span> New York / San Francisco, EUA
              </span>
              <span className="font-semibold text-blue-400">USD</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>🇫🇷</span> Paris, França
              </span>
              <span className="font-semibold text-indigo-400">EUR</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>🇬🇧</span> Londres, Reino Unido
              </span>
              <span className="font-semibold text-pink-400">GBP</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>🇯🇵</span> Tóquio, Japão
              </span>
              <span className="font-semibold text-rose-400">JPY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
