// app/components/WbcBracket.tsx
"use client";

import { TEAM_FLAGS } from '@/app/constants';
import { Trophy, ArrowRight, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WbcBracket({ spoilerShield }: { spoilerShield: boolean }) {
    const [localReveal, setLocalReveal] = useState(false);

    useEffect(() => {
        setLocalReveal(false);
    }, [spoilerShield]);

    const isHidden = spoilerShield && !localReveal;

    // We hardcode the bracket structure based on 2026 WBC Quarterfinals
    const matchups = {
        qf1: { team1: '쿠바', t1_seed: 'A1', team2: '푸에르토리코', t2_seed: 'B2', status: 'upcoming', date: '3/13', venue: '마이애미' },
        qf2: { team1: '베네수엘라', t1_seed: 'B1', team2: '파나마', t2_seed: 'A2', status: 'upcoming', date: '3/14', venue: '휴스턴' },
        qf3: { team1: '일본', t1_seed: 'C1', team2: '도미니카공화국', t2_seed: 'D2', status: 'upcoming', date: '3/15', venue: '마이애미' },
        qf4: { team1: '미국', t1_seed: 'D1', team2: '대한민국', t2_seed: 'C2', status: 'upcoming', date: '3/14', venue: '마이애미' },
        
        sf1: { team1: 'QF1 승자', team2: 'QF3 승자', date: '3/16', venue: '마이애미' },
        sf2: { team1: 'QF2 승자', team2: 'QF4 승자', date: '3/17', venue: '마이애미' },

        final: { team1: 'SF1 승자', team2: 'SF2 승자', date: '3/18', venue: '마이애미' }
    };

    const renderMatch = (match: any, label: string) => {
        const flag1 = TEAM_FLAGS[match.team1] || '⚾️';
        const flag2 = TEAM_FLAGS[match.team2] || '⚾️';

        return (
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 w-48 shrink-0 flex flex-col justify-center transform transition-transform hover:scale-105">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{label}</span>
                    <span className="text-[9px] font-bold text-blue-500">{match.date} {match.venue}</span>
                </div>
                
                <div className="space-y-1.5">
                    {/* Team 1 */}
                    <div className="flex items-center justify-between border-b border-gray-50 pb-1.5">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">{flag1}</span>
                            <span className={`text-xs font-bold ${match.team1 === '대한민국' ? 'text-blue-700' : 'text-gray-700'}`}>
                                {match.team1}
                            </span>
                        </div>
                        {match.t1_seed && <span className="text-[8px] text-gray-400">{match.t1_seed}</span>}
                    </div>
                    {/* Team 2 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">{flag2}</span>
                            <span className={`text-xs font-bold ${match.team2 === '대한민국' ? 'text-blue-700' : 'text-gray-700'}`}>
                                {match.team2}
                            </span>
                        </div>
                        {match.t2_seed && <span className="text-[8px] text-gray-400">{match.t2_seed}</span>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-[2rem] p-6 shadow-inner border border-gray-200 overflow-hidden relative">
            
            <div className="mb-6">
                <h2 className="text-lg font-black text-gray-800 flex items-center tracking-tight">
                    <Trophy className="w-4 h-4 mr-1.5 text-blue-600" />
                    2026 WBC 결선 토너먼트
                </h2>
                <p className="text-[10px] text-gray-500 mt-1">
                    {isHidden ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">스포 방지 중: 결과가 가려졌습니다.</span>
                    ) : (
                        "대한민국, 8강 진출 확정! (vs 미국)"
                    )}
                </p>
            </div>

            {/* Scrollable Bracket Container */}
            <div className="relative">
                <div className={`overflow-x-auto pb-4 custom-scrollbar transition-all duration-300 ${isHidden ? 'filter blur-[4px] select-none pointer-events-none' : ''}`}>
                    <div className="flex items-center space-x-8 min-w-max py-4 px-2">
                    
                    {/* Quarterfinals Column */}
                    <div className="flex flex-col space-y-4">
                        <div className="text-xs font-black text-gray-400 mb-2 text-center tracking-widest">QUARTERFINALS</div>
                        {renderMatch(matchups.qf1, 'QF1')}
                        {renderMatch(matchups.qf2, 'QF2')}
                        {renderMatch(matchups.qf3, 'QF3')}
                        {renderMatch(matchups.qf4, 'QF4')}
                    </div>

                    {/* Connectors (Simulated with arrows for simplicity in mobile view) */}
                    <div className="flex flex-col space-y-24 justify-center text-gray-300">
                        <ArrowRight className="w-5 h-5" />
                        <ArrowRight className="w-5 h-5" />
                    </div>

                    {/* Semifinals Column */}
                    <div className="flex flex-col space-y-16 justify-center">
                        <div className="text-xs font-black text-gray-400 mb-2 text-center tracking-widest">SEMIFINALS</div>
                        {renderMatch(matchups.sf1, 'SF1')}
                        {renderMatch(matchups.sf2, 'SF2')}
                    </div>

                    <div className="flex flex-col space-y-0 justify-center text-gray-300">
                        <ArrowRight className="w-5 h-5" />
                    </div>

                    {/* Finals Column */}
                    <div className="flex flex-col justify-center">
                        <div className="text-xs font-black text-yellow-500 mb-2 text-center tracking-widest">FINAL</div>
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 rounded-xl blur-md opacity-30"></div>
                            <div className="relative">
                                {renderMatch(matchups.final, 'CHAMPIONSHIP')}
                            </div>
                        </div>
                    </div>

                </div>
                </div>
                
                {/* Local Reveal Button Overlay */}
                {isHidden && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 rounded-xl">
                        <button
                            onClick={() => setLocalReveal(true)}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-gray-800 hover:bg-black text-white rounded-full text-xs font-bold transition-all shadow-lg"
                        >
                            <Eye className="w-4 h-4" />
                            <span>대진표 확인하기</span>
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
