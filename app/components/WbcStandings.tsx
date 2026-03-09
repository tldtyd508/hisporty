// app/components/WbcStandings.tsx
"use client";

import { TEAM_FLAGS } from '@/app/constants';
import { Trophy, ChevronRight, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

// Hardcoded standings for all Pools
const POOLS_DATA: Record<string, { venue: string, teams: any[] }> = {
    A: {
        venue: '히람 비손 스타디움 (산후안)',
        teams: [
            { rank: 1, team: '쿠바', w: 3, l: 1, pct: '.750', streak: 'W2', diff: '+12', status: 'Q' },
            { rank: 2, team: '파나마', w: 3, l: 1, pct: '.750', streak: 'W1', diff: '+5', status: 'Q' },
            { rank: 3, team: '푸에르토리코', w: 2, l: 2, pct: '.500', streak: 'L1', diff: '-2', status: 'E' },
            { rank: 4, team: '캐나다', w: 1, l: 3, pct: '.250', streak: 'W1', diff: '-8', status: 'E' },
            { rank: 5, team: '영국', w: 1, l: 3, pct: '.250', streak: 'L3', diff: '-7', status: 'E' },
        ]
    },
    B: {
        venue: '미닛메이드 파크 (휴스턴)',
        teams: [
            { rank: 1, team: '베네수엘라', w: 3, l: 1, pct: '.750', streak: 'W2', diff: '+8', status: 'Q' },
            { rank: 2, team: '멕시코', w: 3, l: 1, pct: '.750', streak: 'W1', diff: '+6', status: 'Q' },
            { rank: 3, team: '이탈리아', w: 2, l: 2, pct: '.500', streak: 'L1', diff: '+2', status: 'E' },
            { rank: 4, team: '콜롬비아', w: 2, l: 2, pct: '.500', streak: 'W1', diff: '-3', status: 'E' },
            { rank: 5, team: '니카라과', w: 0, l: 4, pct: '.000', streak: 'L4', diff: '-13', status: 'E' },
        ]
    },
    C: {
        venue: '도쿄돔 (도쿄)',
        teams: [
            { rank: 1, team: '일본', w: 4, l: 0, pct: '1.000', streak: 'W4', diff: '+25', status: 'Q' },
            { rank: 2, team: '대한민국', w: 2, l: 2, pct: '.500', streak: 'W1', diff: '+4', status: 'Q' },
            { rank: 3, team: '호주', w: 2, l: 2, pct: '.500', streak: 'L2', diff: '-2', status: 'E' },
            { rank: 4, team: '대만', w: 2, l: 2, pct: '.500', streak: 'W1', diff: '+5', status: 'E' },
            { rank: 5, team: '체코', w: 0, l: 4, pct: '.000', streak: 'L4', diff: '-32', status: 'E' },
        ]
    },
    D: {
        venue: '론디포 파크 (마이애미)',
        teams: [
            { rank: 1, team: '미국', w: 4, l: 0, pct: '1.000', streak: 'W4', diff: '+18', status: 'Q' },
            { rank: 2, team: '도미니카공화국', w: 3, l: 1, pct: '.750', streak: 'W1', diff: '+10', status: 'Q' },
            { rank: 3, team: '네덜란드', w: 2, l: 2, pct: '.500', streak: 'L1', diff: '-4', status: 'E' },
            { rank: 4, team: '이스라엘', w: 1, l: 3, pct: '.250', streak: 'W1', diff: '-9', status: 'E' },
            { rank: 5, team: '중국', w: 0, l: 4, pct: '.000', streak: 'L4', diff: '-15', status: 'E' },
        ]
    }
};

export default function WbcStandings({ spoilerShield }: { spoilerShield: boolean }) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [activePool, setActivePool] = useState<string>('C');
    const [localReveal, setLocalReveal] = useState(false);

    useEffect(() => {
        // Reset local reveal when global shield or active pool changes
        setLocalReveal(false);
    }, [spoilerShield, activePool]);

    const isHidden = spoilerShield && !localReveal;

    useEffect(() => {
        // Only show confetti if spoiler shield is OFF (either globally or locally bypassed)
        if (!isHidden && activePool === 'C') {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 3000); // Stop animation class after 3s
            return () => clearTimeout(timer);
        }
    }, [isHidden, activePool]);

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 overflow-hidden relative">
            {/* Celebration Banner (only visible if spoiler is off and Pool C is active) */}
            {!isHidden && activePool === 'C' && (
                <div className="absolute top-0 left-0 right-0 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-center">
                    <p className="text-white font-black text-xs tracking-widest animate-pulse">
                        🎉 대한민국 8강 진출 확정! 🎉
                    </p>
                </div>
            )}

            <div className={`flex justify-between items-end mb-4 ${!isHidden && activePool === 'C' ? 'mt-6' : ''}`}>
                <div>
                    <h2 className="text-lg font-black text-gray-800 flex items-center tracking-tight">
                        <Trophy className="w-4 h-4 mr-1.5 text-yellow-500" />
                        WBC Pool {activePool} 순위
                    </h2>
                    <p className="text-[10px] text-gray-400 mt-1">{POOLS_DATA[activePool].venue} • 최종 결과</p>
                </div>
            </div>

            {/* Pool Tabs */}
            <div className="flex space-x-2 mb-4">
                {['A', 'B', 'C', 'D'].map(pool => (
                    <button
                        key={pool}
                        onClick={() => setActivePool(pool)}
                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                            activePool === pool 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        Pool {pool}
                    </button>
                ))}
            </div>

            {/* Standings Table with Reveal Overlay */}
            <div className="relative">
                <div className={`overflow-x-auto ${isHidden ? 'filter blur-[4px] select-none pointer-events-none' : ''} transition-all duration-300`}>
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] uppercase text-gray-400 bg-gray-50/50 rounded-lg">
                            <tr>
                                <th className="px-2 py-2 font-bold rounded-l-lg">순위</th>
                                <th className="px-2 py-2 font-bold">팀</th>
                                <th className="px-2 py-2 font-bold text-center">승</th>
                                <th className="px-2 py-2 font-bold text-center">패</th>
                                <th className="px-2 py-2 font-bold text-center">승률</th>
                                <th className="px-2 py-2 font-bold text-center hidden sm:table-cell">연속</th>
                                <th className="px-2 py-2 font-bold text-center rounded-r-lg">비고</th>
                            </tr>
                        </thead>
                        <tbody>
                            {POOLS_DATA[activePool].teams.map((row, idx) => {
                                const isKorea = row.team === '대한민국';
                                const isQualified = row.status === 'Q';

                                return (
                                    <tr key={row.team} className={`border-b border-gray-50 last:border-0 ${isKorea && !isHidden ? 'bg-blue-50/30' : ''}`}>
                                        <td className="px-2 py-3 font-black text-gray-500">
                                            {row.rank}
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xl">{TEAM_FLAGS[row.team] || '⚾️'}</span>
                                                <span className={`font-bold ${isKorea ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {row.team}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center font-medium text-gray-700">{row.w}</td>
                                        <td className="px-2 py-3 text-center font-medium text-gray-700">{row.l}</td>
                                        <td className="px-2 py-3 text-center font-medium text-gray-500">{row.pct}</td>
                                        <td className="px-2 py-3 text-center font-medium text-gray-500 hidden sm:table-cell">{row.streak}</td>
                                        <td className="px-2 py-3 text-center">
                                            {isQualified ? (
                                                <span className={`text-[10px] font-black px-2 py-1 rounded border ${isKorea ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                    8강 진출
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 px-2 py-1">
                                                    탈락
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Local Reveal Button Overlay */}
                {isHidden && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 rounded-lg">
                        <button
                            onClick={() => setLocalReveal(true)}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-gray-800 hover:bg-black text-white rounded-full text-xs font-bold transition-all shadow-lg"
                        >
                            <Eye className="w-4 h-4" />
                            <span>순위표 확인하기</span>
                        </button>
                    </div>
                )}
                
                {isHidden && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start">
                        <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                            🔒 스포 방지 모드가 켜져 있어 순위가 가려졌습니다. '순위표 확인하기' 버튼을 눌러 순위를 확인하세요!
                        </p>
                    </div>
                )}
                {!isHidden && activePool === 'C' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start">
                        <p className="text-[11px] text-blue-700 font-bold leading-relaxed space-y-1">
                            <span>* 대한민국은 호주, 대만과 2승 2패 동률을 이뤘으나, 타이브레이커 규정(상대 전적 간 이닝당 최소 실점률)에 따라 극적으로 조 2위를 차지했습니다!</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
