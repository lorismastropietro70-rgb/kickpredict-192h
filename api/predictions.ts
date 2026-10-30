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
        league: { id: 135, name: 'Serie A', flag: '🇮🇹' },
        homeTeam: { name: 'Inter', logo: 'https://media.api-sports.io/football/teams/505.png' },
        awayTeam: { name: 'Milan', logo: 'https://media.api-sports.io/football/teams/489.png' },
        date: new Date().toISOString(),
        xgHomeHT: 1.2,
        xgAwayHT: 0.9,
        over15Market: { label: 'Over 1.5 HT', odd: 1.40, probability: 78 },
        comboHTMarket: { label: '1 + Over 2.5 HT', odd: 2.10, probability: 65 }
      },
      {
        id: 102,
        league: { id: 39, name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
        homeTeam: { name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
        awayTeam: { name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
        date: new Date().toISOString(),
        xgHomeHT: 1.4,
        xgAwayHT: 1.1,
        over15Market: { label: 'Over 1.5 HT', odd: 1.35, probability: 82 },
        comboHTMarket: { label: '1X + Over 2.5 HT', odd: 1.95, probability: 70 }
      },
      {
        id: 103,
        league: { id: 140, name: 'La Liga', flag: '🇪🇸' },
        homeTeam: { name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' },
        awayTeam: { name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' },
        date: new Date().toISOString(),
        xgHomeHT: 1.3,
        xgAwayHT: 1.2,
        over15Market: { label: 'Over 1.5 HT', odd: 1.38, probability: 80 },
        comboHTMarket: { label: '2 + Over 2.5 HT', odd: 2.25, probability: 60 }
      },
      {
        id: 104,
        league: { id: 78, name: 'Bundesliga', flag: '🇩🇪' },
        homeTeam: { name: 'Bayern Munich', logo: 'https://media.api-sports.io/football/teams/157.png' },
        awayTeam: { name: 'Dortmund', logo: 'https://media.api-sports.io/football/teams/165.png' },
        date: new Date().toISOString(),
        xgHomeHT: 1.6,
        xgAwayHT: 1.0,
        over15Market: { label: 'Over 1.5 HT', odd: 1.30, probability: 85 },
        comboHTMarket: { label: '1 + Over 2.5 HT', odd: 1.85, probability: 75 }
      },
      {
        id: 105,
        league: { id: 135, name: 'Serie A', flag: '🇮🇹' },
        homeTeam: { name: 'Juventus', logo: 'https://media.api-sports.io/football/teams/496.png' },
        awayTeam: { name: 'Napoli', logo: 'https://media.api-sports.io/football/teams/492.png' },
        date: new Date().toISOString(),
        xgHomeHT: 1.1,
        xgAwayHT: 1.0,
        over15Market: { label: 'Over 1.5 HT', odd: 1.45, probability: 76 },
        comboHTMarket: { label: 'X2 + Over 2.5 HT', odd: 2.15, probability: 62 }
      }
    ];

    return res.status(200).json({
      success: true,
      source: 'poisson',
      dateRange: { from: 'Oggi', to: 'Tra 8 giorni' },
      topOver15HT: mockMatches,
      topComboHT: mockMatches,
      allMatches: mockMatches
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Errore interno' });
  }
}