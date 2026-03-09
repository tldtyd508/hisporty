const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const DATABASE_URL = envContent.match(/DATABASE_URL=(.+)/)?.[1]?.trim();

const updates = [
    // Pool C
    { date: '2026-03-05', home: '대만', away: '호주', score: '0:3' },
    { date: '2026-03-05', home: '체코', away: '대한민국', score: '4:11' },
    { date: '2026-03-06', home: '호주', away: '체코', score: '6:2' },
    { date: '2026-03-06', home: '일본', away: '대만', score: '8:1' },
    { date: '2026-03-07', home: '대만', away: '체코', score: '10:1' },
    { date: '2026-03-07', home: '대한민국', away: '일본', score: '6:8' },
    { date: '2026-03-08', home: '대만', away: '대한민국', score: '5:4' },
    { date: '2026-03-08', home: '호주', away: '일본', score: '3:4' },
    { date: '2026-03-09', home: '대한민국', away: '호주', score: '7:2' },
  
    // Pool A
    { date: '2026-03-06', home: '쿠바', away: '파나마', score: '3:1' },
    { date: '2026-03-06', home: '푸에르토리코', away: '콜롬비아', score: '0:5' },
    { date: '2026-03-07', home: '콜롬비아', away: '캐나다', score: '2:8' },
    { date: '2026-03-07', home: '파나마', away: '푸에르토리코', score: '3:4' },
    { date: '2026-03-08', home: '콜롬비아', away: '쿠바', score: '4:5' },
    { date: '2026-03-08', home: '파나마', away: '캐나다', score: '4:3' },
    { date: '2026-03-09', home: '콜롬비아', away: '파나마', score: '1:3' },
    { date: '2026-03-09', home: '쿠바', away: '푸에르토리코', score: '4:2' },
  
    // Pool B
    { date: '2026-03-06', home: '멕시코', away: '영국', score: '8:2' },
    { date: '2026-03-06', home: '미국', away: '브라질', score: '15:5' },
    { date: '2026-03-07', home: '브라질', away: '이탈리아', score: '0:8' },
    { date: '2026-03-07', home: '영국', away: '미국', score: '1:9' },
    { date: '2026-03-08', home: '영국', away: '이탈리아', score: '4:7' },
    { date: '2026-03-08', home: '브라질', away: '멕시코', score: '16:0' },
    { date: '2026-03-09', home: '브라질', away: '영국', score: '5:3' },
    { date: '2026-03-09', home: '멕시코', away: '미국', score: '2:6' },
  
    // Pool D
    { date: '2026-03-06', home: '네덜란드', away: '베네수엘라', score: '2:6' },
    { date: '2026-03-06', home: '니카라과', away: '도미니카 공화국', score: '3:12' },
    { date: '2026-03-07', home: '니카라과', away: '네덜란드', score: '3:4' },
    { date: '2026-03-07', home: '이스라엘', away: '베네수엘라', score: '3:11' },
    { date: '2026-03-08', home: '네덜란드', away: '도미니카 공화국', score: '1:12' },
    { date: '2026-03-08', home: '니카라과', away: '이스라엘', score: '0:5' },
    { date: '2026-03-09', home: '도미니카 공화국', away: '이스라엘', score: '7:1' },
    { date: '2026-03-09', home: '베네수엘라', away: '니카라과', score: '8:2' }
];

async function updateDB() {
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    console.log('Starting bulk update of 2026 WBC completed games up to March 9...');

    for (const g of updates) {
        const [homeScore, awayScore] = g.score.split(':').map(Number);
        
        const { rowCount } = await client.query(
            `UPDATE public.games 
             SET home_score = $1, away_score = $2, status = '종료'
             WHERE home_team = $3 AND away_team = $4`,
            [homeScore, awayScore, g.home, g.away]
        );

        if (rowCount > 0) {
            console.log(`✅ Updated: ${g.date} ${g.home} ${g.score} ${g.away}`);
        } else {
            console.log(`⚠️ Not found/No update: ${g.date} ${g.home} vs ${g.away}`);
        }
    }

    await client.end();
    console.log('Bulk update completed.');
}

updateDB().catch(console.error);
