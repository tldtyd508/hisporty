"use client";

import { useState, useEffect, useMemo } from 'react';
import { createClient, getURL } from '../utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Trophy, MessageCircle, Star, ArrowRight } from 'lucide-react';

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [wins, setWins] = useState(0);
    const [losses, setLosses] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            if (session?.user) {
                const { count, error } = await supabase
                    .from('reviews')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', session.user.id);

                if (!error) setReviewCount(count || 0);
                await fetchWinLoss(session.user.id);
            }
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase
                    .from('reviews')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', session.user.id)
                    .then(({ count }) => setReviewCount(count || 0));
                fetchWinLoss(session.user.id);
            } else {
                setReviewCount(0);
                setWins(0);
                setLosses(0);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const fetchWinLoss = async (userId: string) => {
        // Fetch user's reviews with their game data
        const { data: userReviews } = await supabase
            .from('reviews')
            .select('supporting_team, game_id')
            .eq('user_id', userId)
            .not('supporting_team', 'is', null);

        if (!userReviews || userReviews.length === 0) {
            setWins(0);
            setLosses(0);
            return;
        }

        // Fetch finished games
        const gameIds = [...new Set(userReviews.map(r => r.game_id))];
        const { data: gamesData } = await supabase
            .from('games')
            .select('id, home_team, away_team, home_score, away_score, status')
            .in('id', gameIds)
            .eq('status', '종료');

        if (!gamesData) return;

        let w = 0, l = 0;
        for (const review of userReviews) {
            const game = gamesData.find(g => g.id === review.game_id);
            if (!game || game.home_score === null) continue;

            const supportedHome = review.supporting_team === game.home_team;
            const homeWon = game.home_score > game.away_score;

            if ((supportedHome && homeWon) || (!supportedHome && !homeWon)) {
                w++;
            } else {
                l++;
            }
        }
        setWins(w);
        setLosses(l);
    };

    const handleStartLogin = async () => {
        // Sign out first to clear the guest session
        await supabase.auth.signOut();
        // Trigger Google Login
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${getURL()}auth/callback`,
            },
        });
    };

    if (loading) {
        return (
            <div className="w-full max-w-md mx-auto mb-6 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-50 rounded w-full mb-2"></div>
                <div className="h-8 bg-gray-50 rounded w-full"></div>
            </div>
        );
    }

    if (!user || user.is_anonymous) {
        return (
            <div className="w-full max-w-md mx-auto mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] transform transition-transform group-hover:scale-[1.01]"></div>
                <div className="relative p-6 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-black mb-1">나만의 직관 기록장 📔</h3>
                            <p className="text-xs text-indigo-100 opacity-90">로그인하고 '패배 요정' 탈출하세요!</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            <Trophy className="w-5 h-5 text-yellow-300" />
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs bg-black/10 p-2 rounded-lg">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                            평생 소장 가능한 직관 일기장
                        </div>
                        <div className="flex items-center text-xs bg-black/10 p-2 rounded-lg">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                            팀별/구장별 개인 승률 통계 (업데이트 예정)
                        </div>
                    </div>

                    <button
                        onClick={handleStartLogin}
                        className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm flex items-center justify-center transition-colors hover:bg-indigo-50"
                    >
                        지금 바로 시작하기 <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto mb-6 bg-white border border-gray-100 shadow-sm rounded-[2rem] overflow-hidden">
            <div className="bg-gray-50/50 p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Star className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold mb-0.5">베테랑 팬</p>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">
                                {user.user_metadata?.name || '익명님'}
                            </h3>
                        </div>
                    </div>
                    <div className="text-right">
                        {(wins + losses) > 0 ? (
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${wins >= losses ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                승요 지수 {Math.round((wins / (wins + losses)) * 100)}%
                            </div>
                        ) : (
                            <div className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black">
                                데이터 부족
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 group transition-hover hover:border-indigo-200">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">내 리뷰</p>
                            <p className="text-xl font-black text-gray-900">{reviewCount}개</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 group transition-hover hover:border-yellow-200">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">통산 전적</p>
                            {(wins + losses) > 0 ? (
                                <p className="text-xl font-black text-gray-900">{wins}승 {losses}패</p>
                            ) : (
                                <p className="text-sm font-black text-gray-400">데이터 수집 중</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
