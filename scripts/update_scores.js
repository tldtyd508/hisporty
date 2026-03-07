#!/usr/bin/env node

/**
 * 종료된 경기 스코어 업데이트 스크립트
 * 
 * Usage:
 *   node scripts/update_scores.js --date 2026-03-05 --home 체코 --away 대한민국 --score 2:14
 *   node scripts/update_scores.js --date 2026-03-05  (해당일 전경기 목록 조회)
 */

const { Client } = require('pg');

// Load DB URL from .env.local
const fs = require('fs');
const envPath = require('path').join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const DATABASE_URL = envContent.match(/DATABASE_URL=(.+)/)?.[1]?.trim();

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
}

function parseArgs() {
    const args = process.argv.slice(2);
    const params = {};
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        params[key] = args[i + 1];
    }
    return params;
}

async function main() {
    const params = parseArgs();
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    if (!params.date) {
        console.log('Usage:');
        console.log('  조회: node scripts/update_scores.js --date 2026-03-05');
        console.log('  설정: node scripts/update_scores.js --date 2026-03-05 --home 체코 --away 대한민국 --score 2:14');
        await client.end();
        return;
    }

    // List mode: show games for date
    if (!params.score) {
        const { rows } = await client.query(
            `SELECT id, home_team, away_team, home_score, away_score, status, time_kst, stadium 
             FROM public.games WHERE date = $1 ORDER BY time_kst`,
            [params.date]
        );

        if (rows.length === 0) {
            console.log(`📅 ${params.date}: 경기 없음`);
        } else {
            console.log(`📅 ${params.date} — ${rows.length}경기:`);
            rows.forEach((g, i) => {
                const score = g.home_score !== null ? `${g.home_score}:${g.away_score}` : '미입력';
                console.log(`  ${i + 1}. ${g.time_kst || '??:??'} | ${g.home_team} vs ${g.away_team} | ${score} | ${g.status} | ${g.stadium}`);
            });
        }
        await client.end();
        return;
    }

    // Update mode
    const [homeScore, awayScore] = params.score.split(':').map(Number);

    if (isNaN(homeScore) || isNaN(awayScore)) {
        console.error('❌ 올바른 스코어 형식: --score 2:14');
        await client.end();
        return;
    }

    const { rowCount } = await client.query(
        `UPDATE public.games 
         SET home_score = $1, away_score = $2, status = '종료'
         WHERE date = $3 AND home_team = $4 AND away_team = $5`,
        [homeScore, awayScore, params.date, params.home, params.away]
    );

    if (rowCount === 0) {
        console.error(`❌ 경기를 찾을 수 없습니다: ${params.date} ${params.home} vs ${params.away}`);
    } else {
        console.log(`✅ 업데이트 완료: ${params.home} ${homeScore} : ${awayScore} ${params.away}`);
    }

    await client.end();
}

main().catch(console.error);
