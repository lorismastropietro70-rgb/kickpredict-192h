import React from 'react';
import { TicketSelection } from '../types/prediction';
import { Ticket, Sparkles, Printer, TrendingUp, Flame, Layers, FileDown, Loader2 } from 'lucide-react';

interface CinquinaBoxProps {
  selections: TicketSelection[];
  stake: number;
  onStakeChange: (newStake: number) => void;
  onOpenTicketModal: () => void;
  onPrintTicket: () => void;
  onDownloadPDF?: () => void;
  isDownloadingPdf?: boolean;
  onSelectAllTop5: () => void;
  activeTab: 'OVER_15_HT' | 'COMBO_HT';
  onTabChange: (tab: 'OVER_15_HT' | 'COMBO_HT') => void;
}

export const CinquinaBox: React.FC<CinquinaBoxProps> = ({
  selections,
  stake,
  onStakeChange,
  onOpenTicketModal,
  onPrintTicket,
  onDownloadPDF,
  isDownloadingPdf = false,
  onSelectAllTop5,
  activeTab,
  onTabChange,
}) => {
  // Total multiplier
  const totalMultiplier = selections.reduce((acc, curr) => acc * (curr.odd || 1), 1);
  const roundedMultiplier = selections.length > 0 ? Math.round(totalMultiplier * 100) / 100 : 1;

  // Average probability
  const avgProbability =
    selections.length > 0
      ? Math.round(
          (selections.reduce((acc, curr) => acc + curr.probability, 0) / selections.length) * 10
        ) / 10
      : 0;

  // 5-match bonus multiplier (+5%)
  const bonusMultiplier = selections.length >= 5 ? 1.05 : 1.0;
  const potentialWin = Math.round(stake * roundedMultiplier * bonusMultiplier * 100) / 100;

  return (
    <section className="relative w-full max-w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0B0F19] border border-emerald-500/30 p-3 sm:p-5 md:p-6 shadow-xl shadow-emerald-950/20">
      {/* Background neon ambient aura */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-full overflow-hidden space-y-3 sm:space-y-4">
        {/* Top Header Row: Title on Left, Segmented Tab Controls Aligned on Right */}
        <div className="w-full max-w-full overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Left Title and Selection Counter */}
          <div className="space-y-0.5 min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono shrink-0">
                Schedina Cinquina 192h
              </span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-medium truncate">
                {selections.length} di 5 eventi
              </span>
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-white truncate break-words block">
              Cinquina Algoritmica Consigliata
            </h2>
          </div>

          {/* Right: Tab Selector Bar aligned horizontally with title */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full md:w-auto shrink-0 overflow-hidden">
            <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl shrink-0 shadow-inner max-w-full overflow-hidden">
              <button
                onClick={() => onTabChange('OVER_15_HT')}
                className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-4 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 sm:gap-1.5 ${
                  activeTab === 'OVER_15_HT'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Seleziona la scheda Over 1.5 1° Tempo"
              >
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Over 1.5 1°T</span>
              </button>

              <button
                onClick={() => onTabChange('COMBO_HT')}
                className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-4 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 sm:gap-1.5 ${
                  activeTab === 'COMBO_HT'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Seleziona la scheda Combo HT + Over 2.5 1° Tempo"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Combo HT + Over 2.5 1°T</span>
              </button>
            </div>

            {/* Quick Select All Top Match Button */}
            {selections.length < 5 && (
              <button
                onClick={onSelectAllTop5}
                className="text-[10px] sm:text-xs font-semibold px-2.5 py-1.5 sm:py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer shrink-0 truncate"
                title="Seleziona automaticamente i match consigliati per completare la schedina"
              >
                Seleziona Top
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="w-full max-w-full overflow-hidden grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3">
          {/* Moltiplicatore Totale */}
          <div className="w-full max-w-full overflow-hidden p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800 space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium flex items-center justify-between">
              <span className="truncate">Moltiplicatore</span>
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
            </span>
            <div className="text-lg sm:text-xl md:text-2xl font-extrabold font-mono text-white tabular-nums truncate">
              {selections.length > 0 ? `${roundedMultiplier.toFixed(2)}x` : '-'}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">
              Quote Sisal/Matchpoint
            </div>
          </div>

          {/* Probabilità Media */}
          <div className="w-full max-w-full overflow-hidden p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800 space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium flex items-center justify-between">
              <span className="truncate">Prob. Media</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
            </span>
            <div className="text-lg sm:text-xl md:text-2xl font-extrabold font-mono text-emerald-400 tabular-nums truncate">
              {selections.length > 0 ? `${avgProbability}%` : '-'}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">
              Media pesata Poisson
            </div>
          </div>

          {/* Vincita Potenziale */}
          <div className="w-full max-w-full overflow-hidden p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-300 truncate">
                Vincita Potenziale
              </span>
              {/* Inline Stake changer */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">Puntata:</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={stake}
                  onChange={(e) => onStakeChange(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-11 sm:w-13 bg-slate-900 border border-slate-700 rounded-lg px-1 py-0.2 text-xs text-slate-100 font-mono font-bold text-center focus:outline-none focus:border-emerald-400 tabular-nums"
                  title="Modifica puntata"
                  aria-label="Importo puntata in euro"
                />
                <span className="text-xs text-slate-300 font-bold">€</span>
              </div>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-black font-mono text-emerald-300 tabular-nums truncate">
              {selections.length > 0 ? `${potentialWin.toFixed(2)} €` : '0.00 €'}
            </div>
            <div className="text-[9px] sm:text-[10px] text-emerald-400/80 truncate">
              {selections.length >= 5 ? '+5% Bonus Cinquina' : 'Completa con 5 gare'}
            </div>
          </div>
        </div>

        {/* Action Controls: Visualizza Schedina + Dedicated Stampa Schedina Button */}
        <div className="w-full max-w-full overflow-hidden pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="text-[10px] sm:text-xs text-slate-400 min-w-0 flex-1 truncate">
            {selections.length === 5 ? (
              <span className="text-emerald-400 font-medium truncate block">
                Cinquina completa pronta per la giocata e la stampa.
              </span>
            ) : (
              <span className="truncate block">
                {selections.length} gare selezionate. Aggiungi o rimuovi match.
              </span>
            )}
          </div>

          <div className="flex flex-col xs:flex-row items-stretch gap-2 shrink-0 w-full sm:w-auto">
            {/* Visualizza Schedina Button */}
            <button
              onClick={onOpenTicketModal}
              disabled={selections.length === 0}
              className="w-full xs:w-auto min-h-[42px] sm:min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-slate-700 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed truncate"
              title="Visualizza e gestisci la schedina"
            >
              <Ticket className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">Visualizza Schedina</span>
            </button>

            {/* Scarica PDF Button */}
            {onDownloadPDF && (
              <button
                onClick={onDownloadPDF}
                disabled={selections.length === 0 || isDownloadingPdf}
                className="w-full xs:w-auto min-h-[42px] sm:min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed truncate"
                title="Scarica la schedina in formato PDF (Schedina_192h_KickPredict.pdf)"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-cyan-400" />
                    <span className="truncate">Creazione PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">Scarica PDF</span>
                  </>
                )}
              </button>
            )}

            {/* Dedicated Stampa Schedina Button */}
            <button
              onClick={onPrintTicket}
              disabled={selections.length === 0}
              className="w-full xs:w-auto min-h-[42px] sm:min-h-[44px] px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed truncate"
              title="Stampa subito la schedina con layout ottimizzato"
            >
              <Printer className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Stampa Schedina</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
