import React, { useState, useEffect } from 'react';
import { Match } from '../types/prediction';
import { Check, ChevronDown, ChevronUp, Save, BarChart3, Clock, MapPin } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  activeTab: 'OVER_15_HT' | 'COMBO_HT';
  isSelected: boolean;
  onToggleSelect: (match: Match) => void;
  onUpdateOdd: (matchId: string | number, newOdd: number) => void;
  index: number;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  activeTab,
  isSelected,
  onToggleSelect,
  onUpdateOdd,
  index,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editOddInput, setEditOddInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Storage key for client custom Sisal / Matchpoint odds
  const storageKey = `sisal_odd_${match?.id}_${activeTab}`;

  const defaultOdd =
    activeTab === 'OVER_15_HT'
      ? match?.over15Market?.odd || 1.0
      : match?.comboHTMarket?.odd || 1.0;

  const currentProbability =
    activeTab === 'OVER_15_HT'
      ? match?.over15Market?.probability || 0
      : match?.comboHTMarket?.probability || 0;

  // Initialize odd from localStorage or match default
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 1.0) {
          setEditOddInput(parsed.toFixed(2));
          if (match?.id) onUpdateOdd(match.id, parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setEditOddInput(defaultOdd.toFixed(2));
  }, [match?.id, activeTab, defaultOdd, storageKey, onUpdateOdd]);

  const handleSaveOdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(editOddInput);
    if (!isNaN(parsed) && parsed >= 1.01 && parsed <= 99.0) {
      try {
        localStorage.setItem(storageKey, parsed.toString());
      } catch {
        // ignore
      }
      if (match?.id) onUpdateOdd(match.id, parsed);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleResetOdd = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setEditOddInput(defaultOdd.toFixed(2));
    if (match?.id) onUpdateOdd(match.id, defaultOdd);
  };

  // Format date in Italian locale safely
  const fixtureDateVal = match?.fixtureDate || match?.date || new Date().toISOString();
  const matchDate = new Date(fixtureDateVal);
  const formattedDate = !isNaN(matchDate.getTime())
    ? matchDate.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'Oggi';
  const formattedTime = !isNaN(matchDate.getTime())
    ? matchDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    : '20:45';

  // Calculate hours until match safely
  const timestampVal = match?.timestamp || matchDate.getTime() || Date.now();
  const hoursRemaining = Math.max(
    0,
    Math.round((timestampVal - Date.now()) / (3600 * 1000))
  );

  const leagueFlag = match?.league?.flag || '⚽';
  const leagueName = match?.league?.name || 'Campionato';
  const leagueCountry = match?.league?.country || '';
  const roundName = match?.round || '1ª Giornata';
  const homeName = match?.homeTeam?.name || 'Casa';
  const awayName = match?.awayTeam?.name || 'Ospite';
  const homeLogo = match?.homeTeam?.logo || '';
  const awayLogo = match?.awayTeam?.logo || '';
  const xgHomeHT = match?.stats?.xgHomeHT ?? match?.xgHomeHT ?? 1.2;
  const xgAwayHT = match?.stats?.xgAwayHT ?? match?.xgAwayHT ?? 1.0;
  const avgGoals = match?.stats?.avgGoalsFirstHalf || 1.5;
  const trendOverHT = match?.stats?.trendOverHT || 'Ottimo trend over 1.5 primo tempo';
  const comboDetails = match?.comboHTMarket?.details || 'Combo statistica favorevole';
  const comboConfidence = match?.comboHTMarket?.confidence || 'Alta';

  return (
    <article
      className={`relative w-full max-w-full overflow-hidden rounded-2xl border transition-all duration-200 ${
        isSelected
          ? 'bg-slate-900/95 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
          : 'bg-[#111827]/90 border-slate-800/80 hover:border-slate-700 hover:bg-[#111827]'
      }`}
    >
      {/* Top Bar with League & Kick-off metadata */}
      <div className="w-full max-w-full overflow-hidden flex flex-wrap items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-950/60 border-b border-slate-800/60 text-[10px] sm:text-xs text-slate-400 gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
          <span className="text-xs sm:text-sm shrink-0" aria-label={leagueCountry}>
            {leagueFlag}
          </span>
          <span className="font-semibold text-slate-200 truncate">{leagueName}</span>
          <span aria-hidden="true" className="text-slate-600 shrink-0">·</span>
          <span className="text-slate-400 truncate max-w-[75px] xs:max-w-[120px]">{roundName}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 tabular-nums text-[10px] sm:text-xs">
          <span className="flex items-center gap-1 text-slate-300 truncate">
            <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">{formattedDate}, {formattedTime}</span>
          </span>
          <span aria-hidden="true" className="text-slate-600 shrink-0">·</span>
          <span className="text-emerald-400 font-medium font-mono shrink-0">+{hoursRemaining}h</span>
        </div>
      </div>

      <div className="w-full max-w-full overflow-hidden p-2.5 sm:p-4 space-y-3 sm:space-y-4">
        {/* Teams and Matchup Header */}
        <div className="w-full max-w-full overflow-hidden grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Home Team */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 overflow-hidden">
            {homeLogo ? (
              <img
                src={homeLogo}
                alt={homeName}
                referrerPolicy="no-referrer"
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain shrink-0 rounded-full bg-slate-800/50 p-0.5 border border-slate-700/50"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                {homeName.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
              <h4 className="text-xs sm:text-sm md:text-base font-semibold text-slate-100 truncate break-words block">
                {homeName}
              </h4>
              <div className="text-[9px] sm:text-[11px] text-slate-400 flex items-center gap-1 truncate block">
                <span>xG HT: <strong className="text-slate-200 font-mono">{xgHomeHT}</strong></span>
              </div>
            </div>
          </div>

          {/* VS / Rank Indicator */}
          <div className="flex flex-col items-center justify-center px-1 sm:px-2 shrink-0">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-500 tracking-wider">VS</span>
            <span className="text-[8px] sm:text-[10px] font-mono text-emerald-400 mt-0.5 whitespace-nowrap">#{index + 1} TOP</span>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 min-w-0 text-right overflow-hidden">
            <div className="min-w-0 flex-1 overflow-hidden">
              <h4 className="text-xs sm:text-sm md:text-base font-semibold text-slate-100 truncate break-words block">
                {awayName}
              </h4>
              <div className="text-[9px] sm:text-[11px] text-slate-400 flex items-center justify-end gap-1 truncate block">
                <span>xG HT: <strong className="text-slate-200 font-mono">{xgAwayHT}</strong></span>
              </div>
            </div>
            {awayLogo ? (
              <img
                src={awayLogo}
                alt={awayName}
                referrerPolicy="no-referrer"
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain shrink-0 rounded-full bg-slate-800/50 p-0.5 border border-slate-700/50"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                {awayName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Prediction Target Highlight Box */}
        <div className="w-full max-w-full overflow-hidden rounded-xl p-2.5 sm:p-3.5 bg-slate-900/80 border border-slate-800 space-y-1.5 sm:space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5 w-full max-w-full overflow-hidden">
            <div className="space-y-0.5 min-w-0 flex-1 overflow-hidden">
              <div className="text-[9px] sm:text-xs text-slate-400 truncate">
                {activeTab === 'OVER_15_HT'
                  ? 'Pronostico Primo Tempo'
                  : 'Pronostico Combo Primo Tempo'}
              </div>
              <div className="text-xs sm:text-sm md:text-base font-bold text-slate-100 flex items-center gap-1.5 flex-wrap truncate">
                <span className={`truncate ${activeTab === 'OVER_15_HT' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {activeTab === 'OVER_15_HT'
                    ? (match?.over15Market?.label || 'Over 1.5 HT')
                    : (match?.comboHTMarket?.label || 'Combo HT')}
                </span>
                {activeTab === 'COMBO_HT' && (
                  <span className="text-[8px] sm:text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shrink-0">
                    {comboConfidence}
                  </span>
                )}
              </div>
            </div>

            {/* Probability Percentage */}
            <div className="text-right shrink-0">
              <div className="text-[9px] sm:text-xs text-slate-400 truncate">Probabilità</div>
              <div className="text-base sm:text-lg md:text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {currentProbability}%
              </div>
            </div>
          </div>

          {/* Animated Probability Bar */}
          <div className="w-full max-w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                activeTab === 'OVER_15_HT'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, currentProbability)}%` }}
            />
          </div>

          {/* Statistical Context Insight */}
          <div className="w-full max-w-full overflow-hidden text-[9px] sm:text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-1 pt-0.5 break-words">
            <span className="truncate max-w-[190px] xs:max-w-none">
              {activeTab === 'OVER_15_HT' ? trendOverHT : comboDetails}
            </span>
            <span className="font-mono text-slate-300 tabular-nums shrink-0">
              xG Tot 1°T: {avgGoals}
            </span>
          </div>
        </div>

        {/* Sisal / Matchpoint Editable Odds Control & Cinquina Toggle */}
        <div className="w-full max-w-full overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
          <form
            onSubmit={handleSaveOdd}
            className="w-full sm:w-auto max-w-full overflow-hidden flex items-center justify-between sm:justify-start gap-1.5 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5"
          >
            <div className="flex flex-col min-w-0 overflow-hidden">
              <label
                htmlFor={`odd-${match?.id || index}`}
                className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate"
              >
                Quota Sisal / Bookmaker
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id={`odd-${match?.id || index}`}
                  type="number"
                  step="0.01"
                  min="1.01"
                  max="99.00"
                  value={editOddInput}
                  onChange={(e) => setEditOddInput(e.target.value)}
                  className="w-14 sm:w-16 bg-transparent text-emerald-400 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:ring-0 tabular-nums"
                  title="Modifica manualmente la quota Sisal o del tuo bookmaker"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition cursor-pointer shrink-0"
                  title="Salva quota nel browser"
                  aria-label="Salva quota"
                >
                  {isSaved ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                </button>
                {editOddInput !== defaultOdd.toFixed(2) && (
                  <button
                    type="button"
                    onClick={handleResetOdd}
                    className="text-[9px] sm:text-[10px] text-slate-500 hover:text-slate-300 underline ml-0.5 shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            {isSaved && (
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-medium shrink-0">
                Salvata!
              </span>
            )}
          </form>

          {/* Schedina Toggle Button */}
          <button
            onClick={() => onToggleSelect(match)}
            className={`w-full sm:w-auto min-h-[42px] sm:min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isSelected
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95'
                : 'border border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:border-slate-600 active:scale-95'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 stroke-[3] shrink-0" />
                <span className="truncate">In Schedina ({editOddInput || defaultOdd.toFixed(2)})</span>
              </>
            ) : (
              <>
                <span className="truncate">Aggiungi a Schedina @ {editOddInput || defaultOdd.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Stats & Exact Score Drawer Trigger */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full max-w-full overflow-hidden flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] sm:text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5 truncate">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Matrice Probabilità HT/FT & Risultato Esatto stimato</span>
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          )}
        </button>

        {/* Expanded Detailed Breakdown */}
        {isExpanded && (
          <div className="w-full max-w-full overflow-hidden pt-2 space-y-2 text-[10px] sm:text-xs border-t border-slate-800/80 animate-in fade-in duration-200">
            <div className="w-full max-w-full overflow-hidden grid grid-cols-2 gap-1.5 sm:gap-3 bg-slate-950/60 p-2 sm:p-3 rounded-xl border border-slate-800/70">
              <div className="min-w-0 overflow-hidden">
                <span className="text-[9px] sm:text-[11px] font-semibold text-slate-300 block mb-1 truncate">
                  1X2 1° Tempo (HT)
                </span>
                <div className="flex flex-wrap items-center justify-between text-slate-400 font-mono text-[9px] sm:text-xs gap-1">
                  <span>1: <strong className="text-slate-200">{match?.stats?.ht1X2?.prob1 || 45}%</strong></span>
                  <span>X: <strong className="text-slate-200">{match?.stats?.ht1X2?.probX || 35}%</strong></span>
                  <span>2: <strong className="text-slate-200">{match?.stats?.ht1X2?.prob2 || 20}%</strong></span>
                </div>
              </div>

              <div className="min-w-0 overflow-hidden">
                <span className="text-[9px] sm:text-[11px] font-semibold text-slate-300 block mb-1 truncate">
                  1X2 Finale (FT)
                </span>
                <div className="flex flex-wrap items-center justify-between text-slate-400 font-mono text-[9px] sm:text-xs gap-1">
                  <span>1: <strong className="text-slate-200">{match?.stats?.ft1X2?.prob1 || 50}%</strong></span>
                  <span>X: <strong className="text-slate-200">{match?.stats?.ft1X2?.probX || 30}%</strong></span>
                  <span>2: <strong className="text-slate-200">{match?.stats?.ft1X2?.prob2 || 20}%</strong></span>
                </div>
              </div>
            </div>

            {/* Estimated Exact Scores */}
            <div className="w-full max-w-full overflow-hidden grid grid-cols-2 gap-1.5 sm:gap-3">
              <div className="w-full max-w-full overflow-hidden bg-slate-900/60 p-2 sm:p-2.5 rounded-xl border border-slate-800 min-w-0">
                <span className="text-[9px] sm:text-[11px] font-medium text-emerald-400 block mb-1 truncate">
                  Ris. Esatto 1°T (HT)
                </span>
                <div className="space-y-1">
                  {(match?.exactScores?.ht || [{ score: '1-0', probability: 35 }, { score: '0-0', probability: 30 }]).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[9px] sm:text-xs text-slate-300 font-mono"
                    >
                      <span className="truncate">{item.score}</span>
                      <span className="text-emerald-400 shrink-0">{item.probability}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full max-w-full overflow-hidden bg-slate-900/60 p-2 sm:p-2.5 rounded-xl border border-slate-800 min-w-0">
                <span className="text-[9px] sm:text-[11px] font-medium text-cyan-400 block mb-1 truncate">
                  Ris. Esatto Finale (FT)
                </span>
                <div className="space-y-1">
                  {(match?.exactScores?.ft || [{ score: '2-1', probability: 25 }, { score: '1-1', probability: 22 }]).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[9px] sm:text-xs text-slate-300 font-mono"
                    >
                      <span className="truncate">{item.score}</span>
                      <span className="text-cyan-400 shrink-0">{item.probability}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Venue & Form info */}
            <div className="w-full max-w-full overflow-hidden flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-[9px] sm:text-[11px] text-slate-500 pt-0.5 break-words">
              <span className="flex items-center gap-1 truncate min-w-0">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{match?.venue || 'Stadio Principale'}</span>
              </span>
              <span className="truncate shrink-0">
                Forma HT: {(match?.stats?.recentFormHT?.home || ['W', 'D', 'W']).join('')} vs {(match?.stats?.recentFormHT?.away || ['L', 'W', 'D']).join('')}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};