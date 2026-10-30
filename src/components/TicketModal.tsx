import React, { useState } from 'react';
import { TicketSelection } from '../types/prediction';
import { Printer, Copy, Check, X, FileDown, Loader2 } from 'lucide-react';
import { downloadTicketPDF, printTicketNative } from '../lib/pdfGenerator';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  selections: TicketSelection[];
  onRemoveSelection: (matchId: string | number) => void;
  stake: number;
  onStakeChange: (newStake: number) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  selections,
  onRemoveSelection,
  stake,
  onStakeChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isOpen) return null;

  // Calculate combined multiplier: product of all odds
  const totalMultiplier = selections.reduce((acc, curr) => acc * (curr.odd || 1), 1);
  const roundedMultiplier = Math.round(totalMultiplier * 100) / 100;

  // Calculate average probability
  const avgProbability =
    selections.length > 0
      ? Math.round(
          (selections.reduce((acc, curr) => acc + curr.probability, 0) / selections.length) * 10
        ) / 10
      : 0;

  // Multipla Bonus: +5% if 5 matches
  const bonusMultiplier = selections.length >= 5 ? 1.05 : 1.0;
  const potentialWin = Math.round(stake * roundedMultiplier * bonusMultiplier * 100) / 100;

  // Ticket serial code simulation
  const ticketCode = `KP192-${Math.abs(
    selections.reduce((acc, s) => acc + String(s.matchId).charCodeAt(0), 192847)
  ).toString(36).toUpperCase()}-IT`;

  const handlePrint = () => {
    printTicketNative();
  };

  const handleDownloadPDF = async () => {
    if (selections.length === 0 || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await downloadTicketPDF(
        'printable-ticket',
        selections,
        stake,
        roundedMultiplier,
        potentialWin,
        ticketCode
      );
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCopy = () => {
    const text = [
      `⚽ KICKPREDICT 192H - SCHEDINA CINQUINA`,
      `Codice: ${ticketCode}`,
      `-----------------------------------------`,
      ...selections.map(
        (s, idx) =>
          `${idx + 1}. ${s.match.homeTeam.name} vs ${s.match.awayTeam.name}\n   Pronostico: ${s.betLabel} @ ${s.odd.toFixed(2)}`
      ),
      `-----------------------------------------`,
      `📊 Moltiplicatore: ${roundedMultiplier.toFixed(2)}`,
      `🎯 Probabilità Media: ${avgProbability}%`,
      `💶 Puntata: ${stake.toFixed(2)} €`,
      `🏆 Vincita Potenziale: ${potentialWin.toFixed(2)} €`,
      `Generato con KickPredict 192h`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const quickStakes = [5, 10, 20, 50, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-full sm:max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-2xl overflow-hidden my-auto text-slate-100 mx-1 xs:mx-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Screen view only */}
        <div className="w-full max-w-full overflow-hidden flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-800 bg-slate-900/60 no-print shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <h3 className="text-xs sm:text-base font-bold text-slate-100 truncate">
              Riepilogo Schedina Cinquina (192h)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Chiudi modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* PRINTABLE TICKET CONTAINER (White background on print with crisp black text) */}
        <div id="printable-ticket" className="w-full max-w-full overflow-hidden p-3 sm:p-6 space-y-3.5 sm:space-y-5 overflow-y-auto flex-1">
          {/* Ticket Header & Branding */}
          <div className="w-full max-w-full overflow-hidden text-center pb-2.5 sm:pb-4 border-b border-slate-800 border-dashed space-y-0.5 sm:space-y-1">
            <div className="text-[9px] sm:text-xs tracking-widest font-mono text-emerald-400 uppercase font-bold truncate">
              KICKPREDICT 192H · ANALYTICS SPORTS
            </div>
            <h2 className="text-base sm:text-xl font-extrabold tracking-tight text-white break-words truncate">
              TICKET SCOMMESSE · TOP 4 LEGHE
            </h2>
            <div className="text-[10px] sm:text-xs text-slate-400 font-mono flex items-center justify-center gap-2 flex-wrap truncate">
              <span>COD: {ticketCode}</span>
              <span>·</span>
              <span>DATA: {new Date().toLocaleDateString('it-IT')}</span>
            </div>
          </div>

          {/* List of Selections */}
          <div className="w-full max-w-full overflow-hidden space-y-2 sm:space-y-2.5">
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Eventi Selezionati ({selections.length})</span>
              <span>Quota Sisal</span>
            </div>

            {selections.length === 0 ? (
              <div className="p-4 sm:p-5 text-center text-xs text-slate-400 border border-slate-800 rounded-xl bg-slate-950/40 truncate">
                Nessun incontro selezionato nella schedina. Seleziona almeno una partita.
              </div>
            ) : (
              selections.map((item) => {
                const date = new Date(item.match.fixtureDate);
                const timeStr = date.toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const dayStr = date.toLocaleDateString('it-IT', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });

                return (
                  <div
                    key={item.matchId}
                    className="w-full max-w-full overflow-hidden p-2 sm:p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-2 text-xs sm:text-sm min-w-0 print-page-break-avoid"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5 overflow-hidden">
                      <div className="text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-1 truncate">
                        <span>{item.match.league.flag}</span>
                        <span className="truncate">{item.match.league.name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{dayStr}, {timeStr}</span>
                      </div>
                      <div className="font-semibold text-slate-100 truncate break-words block text-xs sm:text-sm">
                        {item.match.homeTeam.name} vs {item.match.awayTeam.name}
                      </div>
                      <div className="text-[10px] sm:text-xs font-medium text-emerald-400 flex items-center gap-1 truncate">
                        <span className="truncate">{item.betLabel}</span>
                        <span className="text-slate-400 font-mono text-[9px] shrink-0">
                          ({item.probability}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className="font-mono font-bold text-xs sm:text-base text-emerald-400 tabular-nums">
                        {item.odd.toFixed(2)}
                      </span>
                      <button
                        onClick={() => onRemoveSelection(item.matchId)}
                        className="no-print p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition cursor-pointer shrink-0"
                        title="Rimuovi da schedina"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Stake & Calculation Section */}
          <div className="w-full max-w-full overflow-hidden pt-1.5 border-t border-slate-800 border-dashed space-y-2.5 sm:space-y-3.5">
            {/* Stake selector (interactive) */}
            <div className="no-print space-y-1 w-full max-w-full overflow-hidden">
              <label htmlFor="modal-stake" className="text-[10px] sm:text-xs font-semibold text-slate-300 block truncate">
                Importo Giocata (€)
              </label>
              <div className="flex items-center gap-1.5 flex-wrap w-full max-w-full overflow-hidden">
                <div className="relative flex-1 min-w-[80px]">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold text-xs sm:text-sm">€</span>
                  <input
                    id="modal-stake"
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={stake}
                    onChange={(e) => onStakeChange(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full max-w-full bg-slate-900 border border-slate-700 rounded-xl pl-6 pr-2 py-1 sm:py-1.5 text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500 tabular-nums text-xs sm:text-sm truncate"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
                  {quickStakes.map((val) => (
                    <button
                      key={val}
                      onClick={() => onStakeChange(val)}
                      className={`px-2 py-1 text-[11px] font-mono font-semibold rounded-lg border transition cursor-pointer shrink-0 ${
                        stake === val
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {val}€
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Math Summary Cards (Screen view) */}
            <div className="w-full max-w-full overflow-hidden grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 print:hidden">
              <div className="w-full max-w-full overflow-hidden bg-slate-950/70 p-2 sm:p-2.5 rounded-xl border border-slate-800 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">Moltiplicatore</span>
                <span className="text-sm sm:text-base font-bold font-mono text-slate-100 tabular-nums truncate block">
                  {roundedMultiplier.toFixed(2)}x
                </span>
              </div>

              <div className="w-full max-w-full overflow-hidden bg-slate-950/70 p-2 sm:p-2.5 rounded-xl border border-slate-800 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">Puntata</span>
                <span className="text-sm sm:text-base font-bold font-mono text-slate-200 tabular-nums truncate block">
                  {stake.toFixed(2)} €
                </span>
              </div>

              <div className="w-full max-w-full overflow-hidden bg-slate-950/70 p-2 sm:p-2.5 rounded-xl border border-slate-800 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">Prob. Media</span>
                <span className="text-sm sm:text-base font-bold font-mono text-cyan-400 tabular-nums truncate block">
                  {avgProbability}%
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 w-full max-w-full overflow-hidden bg-gradient-to-br from-emerald-950/60 to-slate-950 p-2 sm:p-2.5 rounded-xl border border-emerald-500/40 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold block truncate">
                  Vincita Potenziale
                </span>
                <span className="text-base sm:text-lg font-extrabold font-mono text-emerald-300 tabular-nums truncate block">
                  {potentialWin.toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Print-specific clean betting shop receipt table */}
            <div className="hidden print:block w-full border-t border-black pt-3 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center py-0.5 border-b border-gray-300">
                <span className="font-semibold text-black">MOLTIPLICATORE TOTALE:</span>
                <span className="font-bold text-black">{roundedMultiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-gray-300">
                <span className="font-semibold text-black">PROBABILITÀ MEDIA:</span>
                <span className="font-bold text-black">{avgProbability}%</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-gray-300">
                <span className="font-semibold text-black">IMPORTO GIOCATO (PUNTATA):</span>
                <span className="font-bold text-black">{stake.toFixed(2)} EUR</span>
              </div>
              {selections.length >= 5 && (
                <div className="flex justify-between items-center py-0.5 border-b border-gray-300">
                  <span className="font-semibold text-black">BONUS CINQUINA (+5%):</span>
                  <span className="font-bold text-black">INCLUSO</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 text-sm font-bold border-t-2 border-black">
                <span className="text-black">VINCITA POTENZIALE:</span>
                <span className="text-black font-extrabold text-base">{potentialWin.toFixed(2)} EUR</span>
              </div>
            </div>

            {selections.length >= 5 && (
              <div className="text-[9px] sm:text-[10px] text-emerald-400/90 flex items-center justify-between print:hidden">
                <span className="truncate">Bonus Cinquina applicato (+5%)</span>
                <span className="font-mono shrink-0">Incluso</span>
              </div>
            )}
          </div>

          {/* Simulated Barcode for Sisal receipt feel */}
          <div className="w-full max-w-full overflow-hidden pt-2 border-t border-slate-800 border-dashed text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1 tracking-widest font-mono text-[7px] sm:text-[8px] text-slate-500 select-none truncate">
              ||||| | |||| || | |||||| |||| | ||| |||| | |||||| || |
            </div>
            <div className="text-[8px] sm:text-[9px] text-slate-500 break-words truncate">
              * Gioca responsabilmente (+18). Quote indicative verificabili su Sisal/Matchpoint.
            </div>
          </div>
        </div>

        {/* Action Controls - Screen only (No print) */}
        <div className="w-full max-w-full overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 sm:p-3.5 border-t border-slate-800 bg-slate-900/70 no-print shrink-0">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto min-h-[42px] px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-700 transition active:scale-95 cursor-pointer truncate"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 truncate">Copiata!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Copia Testo</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* 2. AGGIUNTA TASTO "SCARICA PDF" */}
            <button
              onClick={handleDownloadPDF}
              disabled={selections.length === 0 || isDownloadingPdf}
              className="flex-1 sm:flex-none min-h-[42px] px-3.5 sm:px-4 py-2 rounded-xl border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50 truncate"
              title="Scarica la schedina in formato PDF (Schedina_192h_KickPredict.pdf)"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span className="truncate">Creazione PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">Scarica PDF</span>
                </>
              )}
            </button>

            {/* 1. PULSANTE STAMPA SCHEDINA */}
            <button
              onClick={handlePrint}
              disabled={selections.length === 0}
              className="flex-1 sm:flex-none min-h-[42px] px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer disabled:opacity-50 truncate"
              title="Stampa la schedina con layout ottimizzato"
            >
              <Printer className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Stampa Schedina</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
