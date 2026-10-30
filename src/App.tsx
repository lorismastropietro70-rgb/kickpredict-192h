import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PredictionsData, Match, TicketSelection } from './types/prediction';
import { MatchCard } from './components/MatchCard';
import { TicketModal } from './components/TicketModal';
import { CinquinaBox } from './components/CinquinaBox';
import { TeamExactScoreSearch, LeagueFilterId, LEAGUE_OPTIONS } from './components/TeamExactScoreSearch';
import { PWAInstallButton } from './components/PWAInstallButton';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { downloadTicketPDF, printTicketNative } from './lib/pdfGenerator';
import {
  RotateCw,
  Clock,
  Key,
  ShieldCheck,
  HelpCircle,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<'OVER_15_HT' | 'COMBO_HT'>('OVER_15_HT');
  const [selectedLeague, setSelectedLeague] = useState<LeagueFilterId>('ALL');
  const [data, setData] = useState<PredictionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected matches in the Schedina / Ticket
  const [selections, setSelections] = useState<TicketSelection[]>([]);
  const [stake, setStake] = useState<number>(10);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [customOddsMap, setCustomOddsMap] = useState<Record<string, number>>({});

  // Settings / API Key modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [savedKeyMessage, setSavedKeyMessage] = useState(false);

  // Load API key from localStorage if saved
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('api_sports_key');
      if (savedKey) setCustomApiKey(savedKey);
    } catch {
      // ignore
    }
  }, []);

  // Fetch predictions from /api/predictions
  const fetchPredictions = useCallback(
    async (forceRefresh = false) => {
      try {
        if (forceRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (forceRefresh) params.append('refresh', 'true');
        const storedKey = customApiKey || (typeof window !== 'undefined' ? localStorage.getItem('api_sports_key') : null);
        if (storedKey) params.append('key', storedKey);

        const res = await fetch(`/api/predictions?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Errore server: ${res.statusText}`);
        }

        const json: PredictionsData = await res.json();
        setData(json);

        // Auto-select the Top 5 for the initial tab if ticket is empty (Fully Safe)
        const initialList = (activeTab === 'OVER_15_HT' ? json?.topOver15HT : json?.topComboHT) || [];
        setSelections((prev) => {
          const prevSafe = prev || [];
          if (prevSafe.length === 0 && Array.isArray(initialList) && initialList.length > 0) {
            return initialList.slice(0, 5).map((m) => ({
              matchId: m?.id,
              match: m,
              betType: activeTab,
              betLabel: activeTab === 'OVER_15_HT' ? m?.over15Market?.label : m?.comboHTMarket?.label,
              odd: activeTab === 'OVER_15_HT' ? m?.over15Market?.odd : m?.comboHTMarket?.odd,
              probability:
                activeTab === 'OVER_15_HT'
                  ? m?.over15Market?.probability
                  : m?.comboHTMarket?.probability,
            }));
          }
          return prevSafe;
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Impossibile caricare i dati delle previsioni sulle 192 ore. Riprova tra poco.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, customApiKey]
  );

  useEffect(() => {
    fetchPredictions(false);
  }, [fetchPredictions]);

  // Handle Tab Switch (Fully Safe)
  const handleTabChange = (tab: 'OVER_15_HT' | 'COMBO_HT') => {
    setActiveTab(tab);
    if (!data) return;

    // Refresh default selections to match the active tab's top 5 securely
    const targetList = (tab === 'OVER_15_HT' ? data?.topOver15HT : data?.topComboHT) || [];
    if (!Array.isArray(targetList) || targetList.length === 0) return;

    setSelections(
      targetList.slice(0, 5).map((m) => {
        const odd = customOddsMap[`${m?.id}_${tab}`] || (tab === 'OVER_15_HT' ? m?.over15Market?.odd : m?.comboHTMarket?.odd) || 1.0;
        return {
          matchId: m?.id,
          match: m,
          betType: tab,
          betLabel: tab === 'OVER_15_HT' ? m?.over15Market?.label : m?.comboHTMarket?.label,
          odd,
          probability: tab === 'OVER_15_HT' ? m?.over15Market?.probability : m?.comboHTMarket?.probability,
        };
      })
    );
  };

  // Toggle match in ticket
  const handleToggleSelect = (match: Match) => {
    setSelections((prev) => {
      const prevSafe = prev || [];
      const exists = prevSafe.some((s) => s?.matchId === match?.id);
      if (exists) {
        return prevSafe.filter((s) => s?.matchId !== match?.id);
      } else {
        const odd =
          customOddsMap[`${match?.id}_${activeTab}`] ||
          (activeTab === 'OVER_15_HT' ? match?.over15Market?.odd : match?.comboHTMarket?.odd) || 1.0;
        const newSel: TicketSelection = {
          matchId: match?.id,
          match,
          betType: activeTab,
          betLabel: activeTab === 'OVER_15_HT' ? match?.over15Market?.label : match?.comboHTMarket?.label,
          odd,
          probability:
            activeTab === 'OVER_15_HT'
              ? match?.over15Market?.probability
              : match?.comboHTMarket?.probability,
        };
        return [...prevSafe, newSel];
      }
    });
  };

  // Remove selection from ticket
  const handleRemoveSelection = (matchId: string | number) => {
    setSelections((prev) => (prev || []).filter((s) => s?.matchId !== matchId));
  };

  // Update odd when user edits input
  const handleUpdateOdd = (matchId: string | number, newOdd: number) => {
    setCustomOddsMap((prev) => ({
      ...prev,
      [`${matchId}_${activeTab}`]: newOdd,
    }));
    setSelections((prev) =>
      (prev || []).map((s) => (s?.matchId === matchId ? { ...s, odd: newOdd } : s))
    );
  };

  // FILTRO E SELEZIONE PER CAMPIONATO:
  const displayedMatches = useMemo(() => {
    if (!data) return [];

    if (selectedLeague === 'ALL') {
      return (activeTab === 'OVER_15_HT' ? data?.topOver15HT : data?.topComboHT) || [];
    }

    // Filter allMatches by specific league safely
    const allMatches = Array.isArray(data?.allMatches) ? data.allMatches : [];
    const leagueMatches = allMatches.filter((m) => m?.league?.id === selectedLeague);

    // Sort by active tab metric safely
    const sorted = [...leagueMatches].sort((a, b) => {
      if (activeTab === 'OVER_15_HT') {
        return (b?.over15Market?.probability || 0) - (a?.over15Market?.probability || 0);
      } else {
        return (b?.comboHTMarket?.probability || 0) - (a?.comboHTMarket?.probability || 0);
      }
    });

    // Top 3 specific predictions for the league
    return sorted.slice(0, 3);
  }, [data, activeTab, selectedLeague]);

  // Select all displayed matches for the ticket
  const handleSelectAllTop = () => {
    if (!Array.isArray(displayedMatches) || displayedMatches.length === 0) return;
    setSelections(
      displayedMatches.map((m) => {
        const odd =
          customOddsMap[`${m?.id}_${activeTab}`] ||
          (activeTab === 'OVER_15_HT' ? m?.over15Market?.odd : m?.comboHTMarket?.odd) || 1.0;
        return {
          matchId: m?.id,
          match: m,
          betType: activeTab,
          betLabel: activeTab === 'OVER_15_HT' ? m?.over15Market?.label : m?.comboHTMarket?.label,
          odd,
          probability:
            activeTab === 'OVER_15_HT'
              ? m?.over15Market?.probability
              : m?.comboHTMarket?.probability,
        };
      })
    );
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDirectPrint = () => {
    setIsTicketModalOpen(true);
    setTimeout(() => {
      printTicketNative();
    }, 150);
  };

  const handleDirectDownloadPDF = async () => {
    if (!Array.isArray(selections) || selections.length === 0 || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const totalMultiplier = selections.reduce((acc, curr) => acc * (curr?.odd || 1), 1);
      const roundedMultiplier = Math.round(totalMultiplier * 100) / 100;
      const bonusMultiplier = selections.length >= 5 ? 1.05 : 1.0;
      const potentialWin = Math.round(stake * roundedMultiplier * bonusMultiplier * 100) / 100;
      const ticketCode = `KP192-${Math.abs(
        selections.reduce((acc, s) => acc + String(s?.matchId || '').charCodeAt(0), 192847)
      ).toString(36).toUpperCase()}-IT`;

      await downloadTicketPDF(
        'printable-ticket',
        selections,
        stake,
        roundedMultiplier,
        potentialWin,
        ticketCode
      );
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('api_sports_key', customApiKey.trim());
      setSavedKeyMessage(true);
      setTimeout(() => setSavedKeyMessage(false), 2000);
      fetchPredictions(true);
    } catch {
      // ignore
    }
  };

  const currentLeagueLabel = useMemo(() => {
    const found = LEAGUE_OPTIONS.find((l) => l?.id === selectedLeague);
    return found ? found.label : 'Tutti';
  }, [selectedLeague]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0B0F19] text-slate-100 flex flex-col antialiased">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="w-full max-w-full bg-amber-500/90 text-slate-950 px-3 py-1.5 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 overflow-hidden">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">Sei in modalità offline. Vengono visualizzati i dati salvati nella cache PWA.</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <span className="font-mono font-black text-[10px] sm:text-xs text-emerald-400">192h</span>
            </div>
          </div>
          <span className="text-xs sm:text-base md:text-lg font-extrabold tracking-tight text-white truncate">
            KickPredict <span className="text-emerald-400">192h</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-3 lg:gap-4 text-xs font-medium text-slate-400">
          {LEAGUE_OPTIONS.filter((l) => l.id !== 'ALL').map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLeague(l.id)}
              className={`hover:text-emerald-400 transition-colors cursor-pointer whitespace-nowrap text-xs ${
                selectedLeague === l.id ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              {l.label} {l.flag}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <PWAInstallButton />
          <button
            onClick={() => fetchPredictions(true)}
            disabled={refreshing}
            className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition cursor-pointer active:scale-95 disabled:opacity-60 whitespace-nowrap"
            title="Aggiorna dati e ricalcola le 192 ore"
          >
            <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">192h</span>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Impostazioni API-Sports Key"
            aria-label="Impostazioni API"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 w-full max-w-full sm:max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-5 space-y-3 sm:space-y-5 overflow-hidden">
        <div className="w-full max-w-full overflow-hidden flex flex-wrap items-center justify-between text-[9px] sm:text-xs text-slate-400 gap-1 pb-0.5">
          <div className="flex items-center gap-1 truncate min-w-0 flex-1">
            <span className="flex items-center gap-1 text-slate-300 truncate">
              <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">Finestra: <strong className="text-white">192h (8 Giorni)</strong></span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="truncate">
              {data?.dateRange ? `${data.dateRange.from} → ${data.dateRange.to}` : 'Calcolo in corso...'}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px] shrink-0">
            <span className="text-slate-500">Motore:</span>
            <span className="text-emerald-400 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>
                {data?.source === 'api-sports'
                  ? 'API-Football'
                  : data?.source === 'cache'
                  ? 'Server Cache'
                  : 'Poisson xG'}
              </span>
            </span>
          </div>
        </div>

        <CinquinaBox
          selections={selections}
          stake={stake}
          onStakeChange={setStake}
          onOpenTicketModal={() => setIsTicketModalOpen(true)}
          onPrintTicket={handleDirectPrint}
          onDownloadPDF={handleDirectDownloadPDF}
          isDownloadingPdf={isDownloadingPdf}
          onSelectAllTop5={handleSelectAllTop}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {data && (
          <TeamExactScoreSearch
            matches={data?.allMatches || []}
            selectedLeague={selectedLeague}
            onSelectLeague={setSelectedLeague}
            onSelectMatchForTicket={(match) => {
              handleToggleSelect(match);
              setIsTicketModalOpen(true);
            }}
          />
        )}

        <section className="w-full max-w-full overflow-hidden space-y-2.5 sm:space-y-3.5">
          <div className="w-full max-w-full overflow-hidden border-b border-slate-800 pb-2">
            <h3 className="text-xs sm:text-base md:text-lg font-bold text-slate-100 flex items-center gap-1.5 flex-wrap truncate">
              <span className="truncate">
                {selectedLeague === 'ALL'
                  ? 'Top 5 Incontri Selezionati (Generale 192h)'
                  : `Top 3 Incontri Selezionati — ${currentLeagueLabel} (192h)`}
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-normal text-slate-400 shrink-0">
                ({displayedMatches.length} match)
              </span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              {activeTab === 'OVER_15_HT'
                ? `Migliori selezioni Over 1.5 1° Tempo per ${currentLeagueLabel}`
                : `Migliori selezioni Combo HT + Over 2.5 1° Tempo per ${currentLeagueLabel}`}
            </p>
          </div>

          <div className="w-full max-w-full overflow-hidden p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[10px] sm:text-xs text-slate-300 flex items-start gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 overflow-hidden break-words">
              {activeTab === 'OVER_15_HT' ? (
                <span className="break-words">
                  <strong>Scheda Attiva:</strong>{' '}
                  <span className="text-emerald-400 font-semibold">Over 1.5 nel 1° Tempo</span>{' '}
                  (almeno 2 gol totali segnati nei primi 45'), stimato tramite xG offensivo, vulnerabilità difensiva e trend storico.
                </span>
              ) : (
                <span className="break-words">
                  <strong>Scheda Attiva:</strong>{' '}
                  <span className="text-cyan-400 font-semibold">Combo 1° Tempo (1X2 HT) + Over 2.5 1° Tempo</span>{' '}
                  (esito dei primi 45' incrociato con oltre 2.5 gol ESCLUSIVAMENTE nel 1° tempo).
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-12 sm:py-16 text-center space-y-2.5 w-full max-w-full overflow-hidden">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs sm:text-sm font-semibold text-slate-200">
                Elaborazione pronostici 192 ore in corso...
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-mono truncate">
                Analisi Poisson, xG e quote per Serie A, Premier League, Bundesliga e La Liga
              </div>
            </div>
          ) : error ? (
            <div className="p-4 sm:p-6 rounded-2xl bg-rose-950/30 border border-rose-800 text-center space-y-2.5 w-full max-w-full overflow-hidden">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-rose-400 mx-auto" />
              <p className="text-xs sm:text-sm text-rose-200 break-words">{error}</p>
              <button
                onClick={() => fetchPredictions(true)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Riprova il caricamento
              </button>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden grid grid-cols-1 gap-2.5 sm:gap-3.5">
              {displayedMatches.map((match, index) => {
                const isSelected = (selections || []).some((s) => s?.matchId === match?.id);
                return (
                  <MatchCard
                    key={`${match?.id || index}_${activeTab}_${selectedLeague}`}
                    match={match}
                    activeTab={activeTab}
                    isSelected={isSelected}
                    onToggleSelect={handleToggleSelect}
                    onUpdateOdd={handleUpdateOdd}
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-8 border-t border-slate-800 bg-[#070B13] px-3 py-5 text-center text-xs text-slate-500 space-y-1 w-full max-w-full overflow-hidden">
        <p className="truncate text-[11px] sm:text-xs">
          KickPredict 192h · PWA Football Analytics · Serie A, Premier League, Bundesliga, La Liga
        </p>
        <p className="text-[9px] sm:text-[10px] text-slate-600 truncate">
          I pronostici e le probabilità sono calcolati tramite modelli statistici Poisson e xG. Il gioco è riservato ai maggiorenni.
        </p>
      </footer>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        selections={selections}
        onRemoveSelection={handleRemoveSelection}
        stake={stake}
        onStakeChange={setStake}
      />

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-700 p-4 sm:p-6 space-y-3 sm:space-y-4 text-slate-100 shadow-2xl overflow-hidden max-w-[95vw]">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base">Configurazione API-Sports</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed break-words">
              Puoi inserire la tua chiave gratuita di <strong>API-Football</strong> (v3.football.api-sports.io).
              Il sistema include una <strong>cache intelligente</strong> per non consumare il limite
              di 100 chiamate/giorno del piano gratuito.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-2.5">
              <div>
                <label className="text-[10px] sm:text-xs font-semibold text-slate-300 block mb-1">
                  API Key (Header: x-apisports-key)
                </label>
                <input
                  type="text"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Inserisci la tua API-Sports Key..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 truncate"
                />
              </div>

              {savedKeyMessage && (
                <div className="text-[11px] sm:text-xs text-emerald-400 font-medium truncate">
                  Chiave salvata! Ricarica dati in corso...
                </div>
              )}

              <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                <a
                  href="https://dashboard.api-football.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] sm:text-xs text-cyan-400 hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">Registrati gratis su API-Sports</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition cursor-pointer truncate"
                >
                  Salva & Applica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}