import React from 'react';
import { ToastNotification } from '../../types/finance';
import { AlertTriangle, BellRing, CheckCircle2, X } from 'lucide-react';

interface AlertToastStackProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  onInspectBudgets?: () => void;
}

export const AlertToastStack: React.FC<AlertToastStackProps> = ({
  toasts,
  onDismiss,
  onInspectBudgets,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isExceeded = toast.severity === 'exceeded';
        const isWarning = toast.severity === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-4 border shadow-2xl backdrop-blur-xl flex items-start gap-3 animate-fadeIn ${
              isExceeded
                ? 'bg-rose-950/95 border-rose-500/50 text-rose-100'
                : isWarning
                ? 'bg-amber-950/95 border-amber-500/50 text-amber-100'
                : 'bg-slate-900/95 border-emerald-500/40 text-slate-100'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isExceeded
                  ? 'bg-rose-500/20 text-rose-400'
                  : isWarning
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {isExceeded ? (
                <AlertTriangle className="w-5 h-5" />
              ) : isWarning ? (
                <BellRing className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold tracking-tight">{toast.title}</h4>
              <p className="text-[11px] opacity-90 mt-1 leading-relaxed">{toast.message}</p>

              {onInspectBudgets && (isExceeded || isWarning) && (
                <button
                  onClick={() => {
                    onInspectBudgets();
                    onDismiss(toast.id);
                  }}
                  className="mt-2 text-[11px] font-bold underline underline-offset-2 hover:opacity-80"
                >
                  Ver detalhes do orçamento →
                </button>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
