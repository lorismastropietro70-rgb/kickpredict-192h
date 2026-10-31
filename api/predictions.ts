import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const mockMatches = [
      {
        id: 101,
        league: { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy' },
        homeTeam: { name: 'Inter', logo: 'https://media.api-sports.io/football/teams/505.png' },
        awayTeam: { name: 'Milan', logo: 'https://media.api-sports.io/football/teams/489.png' },
        date: new Date().toISOString(),
        fixtureDate: new Date().toISOString(),
        timestamp: Date.now() + 3600000 * 5,
        round: '1ª Giornata',
        venue: 'Stadio Giuseppe Meazza',
        xgHomeHT: 1.2,
        xgAwayHT: 0.9,
        over15Market: { label: 'Over 1.5 HT', odd: 1.40, probability: 78 },
        comboHTMarket: { label: '1 + Over 2.5 HT', odd: 2.10, probability: 65, confidence: 'Alta', details: 'Ottimo trend offensivo nei primi 45 minuti' },
        stats: {
          xgHomeHT: 1.2,
          xgAwayHT: 0.9,
          avgGoalsFirstHalf: 1.6,
          trendOverHT: 'Ottimo trend over 1.5 primo tempo',
          ht1X2: { prob1: 45, probX: 35, prob2: 20 },
          ft1X2: { prob1: 52, probX: 28, prob2: 20 },
          recentFormHT: ['W', 'D', 'W', 'W', 'D']
        },
        exactScores: {
          ht: [{ score: '1-0', probability: 38 }, { score: '0-0', probability: 30 }, { score: '1-1', probability: 20 }],
          ft: [{ score: '2-1', probability: 28 }, { score: '1-1', probability: 25 }, { score: '2-0', probability: 20 }]
        }
      },
      {
        id: 102,
        league: { id: 39, name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
        homeTeam: { name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
        awayTeam: { name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
        date: new Date().toISOString(),
        fixtureDate: new Date().toISOString(),
        timestamp: Date.now() + 3600000 * 8,
        round: '1ª Giornata',
        venue: 'Emirates Stadium',
        xgHomeHT: 1.4,
        xgAwayHT: 1.1,
        over15Market: { label: 'Over 1.5 HT', odd: 1.35, probability: 82 },
        comboHTMarket: { label: '1X + Over 2.5 HT', odd: 1.95, probability: 70, confidence: 'Alta', details: 'Alta intensità e media gol superiore a 1.5' },
        stats: {
          xgHomeHT: 1.4,
          xgAwayHT: 1.1,
          avgGoalsFirstHalf: 1.8,
          trendOverHT: 'Frequenza elevata di reti nel primo tempo',
          ht1X2: { prob1: 50, probX: 30, prob2: 20 },
          ft1X2: { prob1: 55, probX: 25, prob2: 20 },
          recentFormHT: ['W', 'W', 'D', 'W', 'L']
        },
        exactScores: {
          ht: [{ score: '1-1', probability: 35 }, { score: '1-0', probability: 32 }, { score: '2-0', probability: 18 }],
          ft: [{ score: '2-2', probability: 26 }, { score: '2-1', probability: 24 }, { score: '3-1', probability: 20 }]
        }
      },
      {
        id: 103,
        league: { id: 78, name: 'Bundesliga', flag: '🇩🇪', country: 'Germany' },
        homeTeam: { name: 'Bayern Munich', logo: 'https://media.api-sports.io/football/teams/157.png' },
        awayTeam: { name: 'Dortmund', logo: '