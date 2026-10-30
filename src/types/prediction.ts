/**
 * Type definitions for KickPredict 192h Football Predictions
 */

export interface LeagueInfo {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
}

export interface TeamInfo {
  id: number;
  name: string;
  logo: string;
  shortName?: string;
}

export interface ScoreProb {
  score: string;
  probability: number; // Percentage 0-100
}

export interface MatchStats {
  xgHomeHT: number;
  xgAwayHT: number;
  xgHomeFT: number;
  xgAwayFT: number;
  over05HTPercent: number;
  over15HTPercent: number;
  over25HTPercent: number;
  ht1X2: {
    prob1: number;
    probX: number;
    prob2: number;
  };
  ft1X2: {
    prob1: number;
    probX: number;
    prob2: number;
  };
  avgGoalsFirstHalf: number;
  trendOverHT: string;
  recentFormHT: {
    home: string[];
    away: string[];
  };
}

export interface Over15Market {
  label: string;
  probability: number; // percentage
  odd: number; // decimal odd
  sisalOdd?: number;
  valueIndex: number;
  confidence: 'Alta' | 'Media' | 'Eccellente';
}

export interface ComboHTMarket {
  label: string; // e.g. "1 HT + Over 2.5 1°T"
  type: '1' | 'X' | '2';
  htGoalLine: string; // "> 2.5 1° Tempo"
  probability: number; // percentage
  odd: number;
  sisalOdd?: number;
  confidence: 'Alta' | 'Media' | 'Bomba';
  details: string;
}

export interface Match {
  id: number | string;
  league: LeagueInfo;
  fixtureDate: string; // ISO string
  timestamp: number;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  round: string;
  venue: string;
  stats: MatchStats;
  over15Market: Over15Market;
  comboHTMarket: ComboHTMarket;
  exactScores: {
    ht: ScoreProb[];
    ft: ScoreProb[];
  };
  customOdd?: number; // locally edited Sisal / Matchpoint odd
}

export interface PredictionsData {
  success: boolean;
  timestamp: string;
  hoursWindow: number;
  dateRange: {
    from: string;
    to: string;
  };
  source: 'api-sports' | 'cache' | 'statistical-engine';
  message?: string;
  leagues: {
    id: number;
    name: string;
    country: string;
    matchCount: number;
  }[];
  topOver15HT: Match[];
  topComboHT: Match[];
  allMatches: Match[];
}

export interface TicketSelection {
  matchId: number | string;
  match: Match;
  betType: 'OVER_15_HT' | 'COMBO_HT';
  betLabel: string;
  odd: number;
  probability: number;
}
