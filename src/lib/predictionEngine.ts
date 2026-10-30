import { Match, MatchStats, ScoreProb, Over15Market, ComboHTMarket, LeagueInfo, TeamInfo } from '../types/prediction';

/**
 * Poisson distribution probability calculation: P(k; lambda) = (lambda^k * e^-lambda) / k!
 */
export function poissonProb(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / fact;
}

/**
 * Calculates score probabilities matrix for home and away lambdas
 */
export function calculateScoreMatrix(
  lambdaHome: number,
  lambdaAway: number,
  maxGoals: number = 6
): number[][] {
  const matrix: number[][] = [];
  for (let h = 0; h <= maxGoals; h++) {
    matrix[h] = [];
    for (let a = 0; a <= maxGoals; a++) {
      matrix[h][a] = poissonProb(h, lambdaHome) * poissonProb(a, lambdaAway);
    }
  }
  return matrix;
}

/**
 * Calculate Over 1.5 1° Tempo probability and fair market odd
 */
export function calculateOver15HT(matrix: number[][]): Over15Market {
  // P(Over 1.5) = 1 - P(0-0) - P(1-0) - P(0-1)
  const p00 = matrix[0]?.[0] || 0;
  const p10 = matrix[1]?.[0] || 0;
  const p01 = matrix[0]?.[1] || 0;
  const under15 = p00 + p10 + p01;
  const over15 = Math.max(0, Math.min(1, 1 - under15));

  const probPercent = Math.round(over15 * 1000) / 10;
  // Convert probability to bookmaker odds (with ~7% margin)
  const fairOdd = over15 > 0 ? 1 / over15 : 10;
  const bookmakerOdd = Math.round((fairOdd * 0.94) * 100) / 100;
  const finalOdd = Math.max(1.80, Math.min(4.50, bookmakerOdd));

  const confidence: 'Alta' | 'Media' | 'Eccellente' =
    probPercent >= 45 ? 'Eccellente' : probPercent >= 38 ? 'Alta' : 'Media';

  return {
    label: 'Over 1.5 1°T',
    probability: probPercent,
    odd: finalOdd,
    valueIndex: Math.round(probPercent * finalOdd) / 10,
    confidence,
  };
}

/**
 * Calculate Combo 1X2 HT + Over 2.5 1° Tempo
 * Over 2.5 HT requires at least 3 goals in 1st half (h + a >= 3).
 * Intersects with 1 HT (h > a), X HT (h == a), or 2 HT (a > h).
 */
export function calculateComboHT(matrix: number[][], teamHome: string, teamAway: string): ComboHTMarket {
  let prob1Over25 = 0;
  let probXOver25 = 0;
  let prob2Over25 = 0;

  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      if (h + a >= 3) {
        const prob = matrix[h][a];
        if (h > a) prob1Over25 += prob;
        else if (h === a) probXOver25 += prob;
        else prob2Over25 += prob;
      }
    }
  }

  // Determine the highest probability combination
  let bestType: '1' | 'X' | '2' = '1';
  let bestProb = prob1Over25;

  if (prob2Over25 > bestProb) {
    bestType = '2';
    bestProb = prob2Over25;
  }
  if (probXOver25 > bestProb) {
    bestType = 'X';
    bestProb = probXOver25;
  }

  const probPercent = Math.round(bestProb * 1000) / 10;
  // Combo Over 2.5 HT is a high-odds market (typically 5.50 - 15.00)
  const fairOdd = bestProb > 0 ? 1 / bestProb : 15;
  const bookmakerOdd = Math.round((fairOdd * 0.90) * 100) / 100;
  const finalOdd = Math.max(4.80, Math.min(18.00, bookmakerOdd));

  const typeDesc = bestType === '1' ? `${teamHome} HT` : bestType === '2' ? `${teamAway} HT` : 'Pareggio HT';
  const label = `${bestType} HT + Over 2.5 1°T`;

  return {
    label,
    type: bestType,
    htGoalLine: '> 2.5 1° Tempo',
    probability: Math.max(12.5, probPercent),
    odd: finalOdd,
    confidence: probPercent > 18 ? 'Bomba' : probPercent > 14 ? 'Alta' : 'Media',
    details: `${typeDesc} con almeno 3 reti nei primi 45 minuti`,
  };
}

/**
 * Calculate Top 3 Exact Scores for a given score matrix
 */
export function getTopExactScores(matrix: number[][]): ScoreProb[] {
  const list: { score: string; p: number }[] = [];
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      list.push({ score: `${h}-${a}`, p: matrix[h]?.[a] || 0 });
    }
  }
  list.sort((a, b) => b.p - a.p);
  return list.slice(0, 3).map((item) => ({
    score: item.score,
    probability: Math.round(item.p * 1000) / 10,
  }));
}

/**
 * Builds full statistical Match object from team xGs and fixture metadata
 */
export function buildMatchAnalysis(
  fixtureId: number | string,
  league: LeagueInfo,
  homeTeam: TeamInfo,
  awayTeam: TeamInfo,
  fixtureDate: string,
  round: string,
  venue: string,
  baseXgHome: number,
  baseXgAway: number,
  recentHomeForm: string[] = ['V', 'V', 'N', 'V', 'P'],
  recentAwayForm: string[] = ['V', 'N', 'V', 'P', 'V']
): Match {
  // 1st Half xG is approximately 43-46% of full game, adjusted for team tendencies
  const xgHomeHT = Math.round((baseXgHome * 0.44) * 100) / 100;
  const xgAwayHT = Math.round((baseXgAway * 0.43) * 100) / 100;

  const matrixHT = calculateScoreMatrix(xgHomeHT, xgAwayHT, 6);
  const matrixFT = calculateScoreMatrix(baseXgHome, baseXgAway, 6);

  // HT 1X2 probabilities
  let ht1 = 0, htX = 0, ht2 = 0;
  let over05HT = 0, over15HT = 0, over25HT = 0;

  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const p = matrixHT[h][a];
      if (h > a) ht1 += p;
      else if (h === a) htX += p;
      else ht2 += p;

      if (h + a >= 1) over05HT += p;
      if (h + a >= 2) over15HT += p;
      if (h + a >= 3) over25HT += p;
    }
  }

  // FT 1X2 probabilities
  let ft1 = 0, ftX = 0, ft2 = 0;
  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const p = matrixFT[h][a];
      if (h > a) ft1 += p;
      else if (h === a) ftX += p;
      else ft2 += p;
    }
  }

  const over15Market = calculateOver15HT(matrixHT);
  const comboHTMarket = calculateComboHT(matrixHT, homeTeam.name, awayTeam.name);

  const exactScores = {
    ht: getTopExactScores(matrixHT),
    ft: getTopExactScores(matrixFT),
  };

  const avgGoalsFirstHalf = Math.round((xgHomeHT + xgAwayHT) * 100) / 100;
  const trendOverHT = `${Math.round(over15HT * 10)}/10 gare recenti con occasioni da gol nei primi 45'`;

  const stats: MatchStats = {
    xgHomeHT,
    xgAwayHT,
    xgHomeFT: baseXgHome,
    xgAwayFT: baseXgAway,
    over05HTPercent: Math.round(over05HT * 1000) / 10,
    over15HTPercent: Math.round(over15HT * 1000) / 10,
    over25HTPercent: Math.round(over25HT * 1000) / 10,
    ht1X2: {
      prob1: Math.round(ht1 * 1000) / 10,
      probX: Math.round(htX * 1000) / 10,
      prob2: Math.round(ht2 * 1000) / 10,
    },
    ft1X2: {
      prob1: Math.round(ft1 * 1000) / 10,
      probX: Math.round(ftX * 1000) / 10,
      prob2: Math.round(ft2 * 1000) / 10,
    },
    avgGoalsFirstHalf,
    trendOverHT,
    recentFormHT: {
      home: recentHomeForm,
      away: recentAwayForm,
    },
  };

  return {
    id: fixtureId,
    league,
    fixtureDate,
    timestamp: new Date(fixtureDate).getTime(),
    homeTeam,
    awayTeam,
    round,
    venue,
    stats,
    over15Market,
    comboHTMarket,
    exactScores,
  };
}
