import React, { useState, useMemo } from 'react';
import { Match } from '../types/prediction';
import { Search, X, Crosshair, ArrowRight, Calendar } from 'lucide-react';

export type LeagueFilterId = 'ALL' | 135 | 39 | 78 | 140;

interface TeamExactScoreSearchProps {
  matches: Match[];
  selectedLeague: LeagueFilterId;
  onSelectLeague: (league: LeagueFilterId) => void;
  onSelectMatchForTicket: (match: Match) => void;
}

export const LEAGUE_OPTIONS: { id: LeagueFilterId; label: string; flag: string }[] = [
  { id: 'ALL', label: 'Tutti', flag: '🌍' },
  { id: 135, label: 'Serie A', flag: '🇮🇹' },
  { id: 39, label: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 78, label: 'Bundesliga', flag: '🇩🇪' },
  { id: 140, label: 'La Liga', flag: '🇪🇸' },
];

export const TeamExactScoreSearch: React.FC<TeamExactScoreSearchProps> = ({
  matches,
  selectedLeague,
  onSelectLeague,
  onSelectMatchForTicket,
}) => {
  const [query, setQuery] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState<string | number | null>(null);

  // Filter matches based on search query
  const filteredMatches = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return matches.filter(
      (m) =>
        m.homeTeam.name.toLowerCase().includes(trimmed) ||
        m.awayTeam.name.toLowerCase().includes(trimmed) ||
        m.league.name.toLowerCase().includes(trimmed)
    );
  }, [matches, query]);

  // The active match to display in the exact score card
  const activeMatch = useMemo(() => {
    if (selectedMatchId) {
      const found = matches.find((m) => m.id === selectedMatchId);
      if (found) return found;
    }
    if (filteredMatches.length > 0) {
      return filteredMatches[0];
    }
    return null;
  }, [selectedMatchId, filteredMatches, matches]);

  const quickTeams = ['Inter', 'Arsenal', 'Real Madrid', 'Bayern Munich', 'Juventus', 'Barcelona'];

  return (
    <section className="w-full max-w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#111827] to-[#0D131F] border border-slate-800 p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-3.5">
      {/* Search Header */}
      <div className="w-full max-w-full overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden">
          <div className="p-1 sm:p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
              Ricerca Squadra & Risultato Esatto (xG)
            </h3>
            <p className="text-[9px] sm:text-xs text-slate-400 truncate">
              Simulazione metrica HT & FT basata su gol attesi
            </p>
          </div>
        </div>

        {/* Quick select buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 text-xs no-scrollbar w-full sm:w-auto shrink-0">
          <span className="text-slate-500 text-[9px] sm:text-[10px] whitespace-nowrap shrink-0">
            Suggeriti:
          </span>
          {quickTeams.map((team) => (
            <button
              key={team}
              onClick={() => {
                setQuery(team);
                setSelectedMatchId(null);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition cursor-pointer whitespace-nowrap shrink-0 text-[9px] sm:text-[11px]"
            >
              {team}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full max-w-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedMatchId(null);
          }}
          placeholder="Cerca squadra nelle 192 ore (es. Inter, Arsenal, Real Madrid, Bayern)..."
          className="w-full max-w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition truncate"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSelectedMatchId(null);
            }}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {/* 1. FILTRO E SELEZIONE PER CAMPIONATO (Sotto la barra di ricerca) */}
      <div className="w-full max-w-full overflow-hidden space-y-1 pt-0.5 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 truncate">Filtro Campionato:</span>
          <span className="font-mono text-[9px] sm:text-[10px] text-slate-400 shrink-0">
            {selectedLeague === 'ALL'
              ? 'Tutti (Top 5 Pronostici)'
              : 'Top 3 Pronostici Campionato'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full max-w-full">
          {LEAGUE_OPTIONS.map((opt) => {
            const isActive = selectedLeague === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onSelectLeague(opt.id)}
                className={`min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
                title={`Filtra pronostici per ${opt.label}`}
              >
                <span>{opt.flag}</span>
                <span className="truncate">{opt.label}</span>
                {isActive && (
                  <span className="text-[9px] px-1 rounded bg-slate-950/20 font-mono">
                    {opt.id === 'ALL' ? 'Top 5' : 'Top 3'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Multiple matches matched in query */}
      {filteredMatches.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar w-full max-w-full">
          <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0">Trovati:</span>
          {filteredMatches.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMatchId(m.id)}
              className={`px-2 py-0.5 text-[10px] sm:text-xs rounded-lg transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeMatch?.id === m.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.homeTeam.name} - {m.awayTeam.name}
            </button>
          ))}
        </div>
      )}

      {/* Active Match Exact Score Card */}
      {activeMatch ? (
        <div className="w-full max-w-full overflow-hidden rounded-xl bg-slate-950/90 border border-slate-800 p-2.5 sm:p-4 space-y-2.5 sm:space-y-3">
          {/* Match summary header */}
          <div className="w-full max-w-full overflow-hidden flex flex-wrap items-center justify-between pb-2 border-b border-slate-800/80 gap-1 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
              <span className="text-xs sm:text-sm shrink-0">{activeMatch.league.flag}</span>
              <span className="font-semibold text-slate-300 truncate">
                {activeMatch.league.name} · {activeMatch.round}
              </span>
            </div>

            <div className="text-slate-400 flex items-center gap-1.5 text-[10px] sm:text-xs shrink-0">
              <span className="flex items-center gap-1 truncate">
                <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">
                  {new Date(activeMatch.fixtureDate).toLocaleDateString('it-IT', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400 truncate max-w-[100px] xs:max-w-[140px]">{activeMatch.venue}</span>
            </div>
          </div>

          {/* Teams Header with xG */}
          <div className="w-full max-w-full overflow-hidden grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <img
                src={activeMatch.homeTeam.logo}
                alt={activeMatch.homeTeam.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain rounded-full bg-slate-800 p-0.5 shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="font-bold text-slate-100 text-xs sm:text-sm md:text-base block truncate break-words">
                  {activeMatch.homeTeam.name}
                </span>
                <span className="text-[9px] sm:text-[11px] text-slate-400 font-mono block truncate">
                  xG FT: <strong className="text-emerald-400">{activeMatch.stats.xgHomeFT}</strong> · HT: {activeMatch.stats.xgHomeHT}
                </span>
              </div>
            </div>

            <div className="text-[10px] sm:text-xs font-mono font-bold text-slate-500 px-1 shrink-0">
              VS
            </div>

            <div className="flex items-center justify-end gap-1.5 text-right min-w-0 overflow-hidden">
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="font-bold text-slate-100 text-xs sm:text-sm md:text-base block truncate break-words">
                  {activeMatch.awayTeam.name}
                </span>
                <span className="text-[9px] sm:text-[11px] text-slate-400 font-mono block truncate">
                  xG FT: <strong className="text-emerald-400">{activeMatch.stats.xgAwayFT}</strong> · HT: {activeMatch.stats.xgAwayHT}
                </span>
              </div>
              <img
                src={activeMatch.awayTeam.logo}
                alt={activeMatch.awayTeam.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain rounded-full bg-slate-800 p-0.5 shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Exact Score Analysis Matrix: 1° Tempo vs Finale */}
          <div className="w-full max-w-full overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 pt-0.5">
            {/* 1° TEMPO (HT) */}
            <div className="w-full max-w-full overflow-hidden rounded-xl bg-[#0F172A] border border-emerald-500/30 p-2.5 sm:p-3 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider block truncate">
                    Risultato Esatto 1° Tempo (HT)
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">
                    xG HT ({activeMatch.stats.xgHomeHT} vs {activeMatch.stats.xgAwayHT})
                  </span>
                </div>
                <span className="text-lg sm:text-xl md:text-2xl font-black font-mono text-emerald-400 tabular-nums shrink-0">
                  {activeMatch.exactScores.ht[0]?.score || '1-1'}
                </span>
              </div>

              {/* Top 3 HT Scores */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold block">
                  Top 3 Probabilità HT
                </span>
                {activeMatch.exactScores.ht.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[10px] sm:text-xs py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-lg bg-slate-900/60"
                  >
                    <span className="font-mono font-bold text-slate-200">{item.score}</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-14 sm:w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, item.probability * 3)}%` }}
                        />
                      </div>
                      <span className="font-mono text-emerald-400 tabular-nums w-11 text-right">
                        {item.probability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FINALE (FT) */}
            <div className="w-full max-w-full overflow-hidden rounded-xl bg-[#0F172A] border border-cyan-500/30 p-2.5 sm:p-3 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <span className="text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-wider block truncate">
                    Risultato Esatto Finale (FT)
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">
                    xG FT ({activeMatch.stats.xgHomeFT} vs {activeMatch.stats.xgAwayFT})
                  </span>
                </div>
                <span className="text-lg sm:text-xl md:text-2xl font-black font-mono text-cyan-400 tabular-nums shrink-0">
                  {activeMatch.exactScores.ft[0]?.score || '2-1'}
                </span>
              </div>

              {/* Top 3 FT Scores */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold block">
                  Top 3 Probabilità FT
                </span>
                {activeMatch.exactScores.ft.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[10px] sm:text-xs py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-lg bg-slate-900/60"
                  >
                    <span className="font-mono font-bold text-slate-200">{item.score}</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-14 sm:w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${Math.min(100, item.probability * 3.5)}%` }}
                        />
                      </div>
                      <span className="font-mono text-cyan-400 tabular-nums w-11 text-right">
                        {item.probability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick CTA to add to schedina */}
          <div className="w-full max-w-full overflow-hidden flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-1.5 pt-0.5 text-xs">
            <span className="text-slate-400 truncate text-[10px] sm:text-xs">
              Over 1.5 1°T: <strong className="text-emerald-400">{activeMatch.over15Market.probability}%</strong> (@ {activeMatch.over15Market.odd.toFixed(2)})
            </span>
            <button
              onClick={() => onSelectMatchForTicket(activeMatch)}
              className="font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 transition cursor-pointer self-start xs:self-auto shrink-0 text-[11px] sm:text-xs truncate"
            >
              <span className="truncate">Gioca questo evento</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </button>
          </div>
        </div>
      ) : query.trim() !== '' ? (
        <div className="p-3 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800 truncate">
          Nessuna squadra trovata con "{query}" nelle 192 ore.
        </div>
      ) : null}
    </section>
  );
};
