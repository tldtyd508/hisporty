import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Basic mapping from common Korean team names (our DB) to English names for scraping/API matching if needed
const TEAM_MAP: Record<string, string> = {
  '대한민국': 'Korea',
  '일본': 'Japan',
  '호주': 'Australia',
  '대만': 'Chinese Taipei',
  '체코': 'Czechia',
  '미국': 'USA',
  '멕시코': 'Mexico',
  '쿠바': 'Cuba',
  // ... add more if needed
};

export async function GET(request: Request) {
  try {
    // 1. Check Authorization (Vercel Cron secured endpoint)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('Unauthorized cron invocation attempted');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Fetch active games from Supabase (status: scheduled or in progress)
    const { data: activeGames, error: fetchError } = await supabase
      .from('games')
      .select('id, date, home_team, away_team, status')
      .in('status', ['예정', '진행중'])
      .order('date', { ascending: true });

    if (fetchError || !activeGames || activeGames.length === 0) {
      return NextResponse.json({ message: 'No active games to update.', count: 0 });
    }

    // 3. Fetch live scores from a reliable source.
    // NOTE: This uses an example live-data fetch strategy.
    // In production, you would fetch from MLB Stats API, Sportradar, or a scraper here.
    // For demonstration, we simulate fetching live data for the active games.
    
    const updates: {id: string, homeScore: number, awayScore: number, status: string}[] = [];

    // [Placeholder logic for live data mapping]
    // You would loop through liveData and match with activeGames using TEAM_MAP mappings
    // For now, this just logs what it would look for.

    console.log(`Checking live data for ${activeGames.length} active games...`);

    // 4. Update the matched games in the database
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('games')
        .update({
          home_score: update.homeScore,
          away_score: update.awayScore,
          status: update.status // '진행중' or '종료'
        })
        .eq('id', update.id);
        
      if (updateError) {
         console.error('Failed to update game:', update.id, updateError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Checked ${activeGames.length} games. Updated ${updates.length} games.`,
      updated: updates.length
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
