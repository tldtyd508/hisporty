"use client";

import { useState, useEffect, useRef } from 'react';
import { Heart, X, Check } from 'lucide-react';
import { TEAM_FLAGS } from '@/app/constants';

const STORAGE_KEY = 'hisporty_my_teams';
const DEFAULT_TEAMS = ['대한민국'];

// All 20 WBC teams grouped by pool
const POOLS = [
    { name: 'C조 (도쿄)', teams: ['대한민국', '일본', '대만', '호주', '체코'] },
    { name: 'A조 (산후안)', teams: ['푸에르토리코', '쿠바', '캐나다', '콜롬비아', '파나마'] },
    { name: 'B조 (휴스턴)', teams: ['미국', '멕시코', '이탈리아', '영국', '브라질'] },
    { name: 'D조 (마이애미)', teams: ['도미니카 공화국', '베네수엘라', '네덜란드', '니카라과', '이스라엘'] },
];

export function getMyTeams(): string[] {
    if (typeof window === 'undefined') return DEFAULT_TEAMS;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch { /* ignore */ }
    return DEFAULT_TEAMS;
}

export function saveMyTeams(teams: string[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

export default function MyTeamSetting({
    isOpen,
    onClose,
    onSave,
    currentTeams,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (teams: string[]) => void;
    currentTeams: string[];
}) {
    const [selected, setSelected] = useState<Set<string>>(new Set(currentTeams));
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) setSelected(new Set(currentTeams));
    }, [isOpen, currentTeams]);

    if (!isOpen) return null;

    const toggleTeam = (team: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(team)) {
                // Don't allow empty selection
                if (next.size <= 1) return prev;
                next.delete(team);
            } else {
                next.add(team);
            }
            return next;
        });
    };

    const handleSave = () => {
        const teams = Array.from(selected);
        saveMyTeams(teams);
        onSave(teams);
        onClose();
    };

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
        >
            <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out animate-slide-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                        <h2 className="text-lg font-bold text-gray-800">마이팀 설정</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-xs text-gray-400 font-medium mb-4">
                        마이팀 경기가 상단에 우선 표시됩니다. 복수 선택 가능해요.
                    </p>

                    {POOLS.map(pool => (
                        <div key={pool.name} className="mb-5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{pool.name}</p>
                            <div className="flex flex-wrap gap-2">
                                {pool.teams.map(team => {
                                    const isSelected = selected.has(team);
                                    return (
                                        <button
                                            key={team}
                                            onClick={() => toggleTeam(team)}
                                            className={`flex items-center px-3 py-2 rounded-xl text-sm font-bold border transition-all ${isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="mr-1.5 text-lg">{TEAM_FLAGS[team] || '⚾️'}</span>
                                            {team}
                                            {isSelected && <Check className="w-3.5 h-3.5 ml-1.5" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 pb-8">
                    <button
                        onClick={handleSave}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                    >
                        저장하기 ({selected.size}팀 선택)
                    </button>
                </div>
            </div>
        </div>
    );
}
