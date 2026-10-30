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
        homeTeam: { name: 'Inter', logo: '' },
        awayTeam: { name: 'Milan', logo: '' },
        date: new Date().toISOString(),
        xgHomeHT: 1.2,
        xgAwayHT: 0.9,
        over15Market: { label: 'Over 1.5 HT', odd: 1.40, probability: 78 },
        comboHTMarket: { label: '1 + Over 2.5 HT', odd: 2.10, probability: 65 }
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