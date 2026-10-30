import { NextRequest, NextResponse } from 'next/server';
import { getPredictions } from '@/src/lib/apiFootballService';

export const revalidate = 3600; // 1 hour caching in Next.js ISR

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const clientKey = searchParams.get('key') || '1c6b466d31bde9ab2f194a8e0bf84aa5';

    const data = await getPredictions(clientKey, forceRefresh);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Next.js API route error in /api/predictions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante il recupero dei pronostici sulle 192 ore',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}