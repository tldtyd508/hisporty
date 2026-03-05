"use client";

import { useState, useEffect } from 'react';
import { Star, MapPin, Users, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/app/utils/supabase/client';

const TEAM_FLAGS: Record<string, string> = {
    '대한민국': '🇰🇷',
    '일본': '🇯🇵',
    '호주': '🇦🇺',
    '체코': '🇨🇿',
    '대만': '🇹🇼',
    '예선통과팀': '🏳️',
};

export default function ReviewFeed({ selectedDate, spoilerShield = true }: { selectedDate: Date; spoilerShield?: boolean }) {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const [games, setGames] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [revealedScores, setRevealedScores] = useState<Set<string>>(new Set());
    const supabase = createClient();

    const toggleReveal = (gameId: string) => {
        setRevealedScores(prev => {
            const next = new Set(prev);
            if (next.has(gameId)) next.delete(gameId);
            else next.add(gameId);
            return next;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: gamesData } = await supabase
                .from('games')
                .select('*')
                .eq('date', dateString);

            if (gamesData && gamesData.length > 0) {
                setGames(gamesData);
                const gameIds = gamesData.map(g => g.id);
                const { data: reviewsData } = await supabase
                    .from('reviews')
                    .select('*')
                    .in('game_id', gameIds)
                    .order('created_at', { ascending: false });
                if (reviewsData) setReviews(reviewsData);
            } else {
                setGames([]);
                setReviews([]);
            }
            setLoading(false);
        };
        fetchData();
    }, [dateString, supabase]);

    if (loading) {
        return <div className="text-center py-10 text-gray-500">데이터를 불러오는 중...</div>;
    }

    return (
        <div className="w-full max-w-md mx-auto px-4 pb-20">
            {/* Hero Section */}
            {games.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 px-1 tracking-tight">오늘의 매치업</h2>
                    <div className="space-y-4">
                        {games.map(game => (
                            <div key={`hero-${game.id}`} className={`rounded-[2rem] p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden transition-transform hover:scale-[1.02] ${game.status === '종료' ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-blue-600 to-indigo-800'}`}>
                                {/* Decorative elements */}
                                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/20 rounded-full blur-2xl"></div>

                                <div className="relative z-10 pt-2">
                                    <div className="flex justify-center items-center mb-6">
                                        <span className={`backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full border tracking-wider ${game.status === '종료' ? 'bg-white/15 text-gray-200 border-white/10' :
                                            game.status === '진행중' ? 'bg-red-500/30 text-red-100 border-red-400/30 animate-pulse' :
                                                'bg-white/10 text-blue-50 border-white/10'
                                            }`}>
                                            {game.status === '종료' ? '경기 종료' : game.status === '진행중' ? '🔴 LIVE' : `${game.stadium} • ${game.time_kst || '시간 미정'}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-center w-5/12">
                                            <div className="text-6xl sm:text-7xl mb-4 drop-shadow-lg">{TEAM_FLAGS[game.home_team] || '⚾️'}</div>
                                            <p className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md text-white/90">{game.home_team}</p>
                                        </div>
                                        <div className="w-2/12 flex flex-col items-center justify-center">
                                            {game.status === '종료' && game.home_score !== null ? (
                                                spoilerShield && !revealedScores.has(game.id) ? (
                                                    <button
                                                        onClick={() => toggleReveal(game.id)}
                                                        className="flex flex-col items-center px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 transition-all active:scale-95"
                                                    >
                                                        <Eye className="w-5 h-5 text-white/70 mb-1" />
                                                        <span className="text-[10px] font-bold text-white/60">결과 보기</span>
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <div className="flex items-center space-x-1">
                                                            <span className="text-3xl font-black">{game.home_score}</span>
                                                            <span className="text-lg text-white/50 font-bold">:</span>
                                                            <span className="text-3xl font-black">{game.away_score}</span>
                                                        </div>
                                                        {spoilerShield && (
                                                            <button onClick={() => toggleReveal(game.id)} className="mt-2 text-[10px] text-white/40 hover:text-white/60 flex items-center">
                                                                <EyeOff className="w-3 h-3 mr-1" /> 숨기기
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                                                    <span className="font-black text-xs text-white/90">VS</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-center w-5/12">
                                            <div className="text-6xl sm:text-7xl mb-4 drop-shadow-lg">{TEAM_FLAGS[game.away_team] || '⚾️'}</div>
                                            <p className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md text-white/90">{game.away_team}</p>
                                        </div>
                                    </div>
                                    {game.status !== '예정' && (
                                        <div className="flex justify-center mt-2">
                                            <span className="text-[10px] text-white/40 font-medium">{game.stadium} • {game.time_kst || ''}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Feed Section */}
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-xl font-bold font-sans text-gray-800">팬들의 소리</h3>
                {games.length > 0 && (
                    <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {games.length}경기
                    </span>
                )}
            </div>

            {games.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">해당 날짜에 예정된 경기가 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl">
                            <p className="text-gray-500 text-sm">아직 작성된 리뷰가 없어요.<br />첫 번째 리뷰를 남겨보세요!</p>
                        </div>
                    ) : (
                        reviews.map(review => {
                            const game = games.find(g => g.id === review.game_id);

                            // Generate a consistent color based on user_id
                            const colors = ['from-red-400 to-rose-500', 'from-orange-400 to-amber-500', 'from-green-400 to-emerald-500', 'from-teal-400 to-cyan-500', 'from-blue-400 to-indigo-500', 'from-violet-400 to-purple-500', 'from-fuchsia-400 to-pink-500'];
                            let hash = 0;
                            const idStr = review.user_id || review.user_nickname;
                            for (let i = 0; i < idStr.length; i++) {
                                hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
                            }
                            const colorClass = colors[Math.abs(hash) % colors.length];

                            // Display first character (except for "Guest-XXXX", we show "G")
                            const isGuest = review.user_nickname.startsWith('Guest-');
                            const initial = isGuest ? 'G' : review.user_nickname.charAt(0);

                            return (
                                <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    {/* Header: User Info & Rating */}
                                    <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-9 h-9 bg-gradient-to-tr ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm opacity-90`}>
                                                {initial}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 tracking-tight">{review.user_nickname}</p>
                                                <div className="flex items-center mt-0.5 space-x-2">
                                                    <div className="flex items-center">
                                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current mr-1" />
                                                        <span className="text-sm font-bold text-gray-700">{review.rating}</span>
                                                    </div>
                                                    {review.supporting_team && (
                                                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md border border-indigo-100/50">
                                                            {TEAM_FLAGS[review.supporting_team] || ''} {review.supporting_team} 응원
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-1">
                                                {TEAM_FLAGS[game?.home_team] || ''} {game?.home_team}
                                                {game?.status === '종료' && game?.home_score !== null && !spoilerShield ? ` ${game.home_score}:${game.away_score} ` : ' vs '}
                                                {game?.away_team} {TEAM_FLAGS[game?.away_team] || ''}
                                            </div>
                                            <p className="text-[11px] text-gray-400">{format(new Date(review.created_at), 'yyyy-MM-dd')}</p>
                                        </div>
                                    </div>

                                    {/* Content: One-line review */}
                                    {spoilerShield && game?.status === '종료' ? (
                                        <div className="relative mb-4">
                                            <p className="text-gray-900 text-lg font-black tracking-tight leading-snug blur-md select-none" aria-hidden>
                                                "{review.comment}"
                                            </p>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                                                    🔒 스포 방지 중
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-900 text-lg font-black mb-4 tracking-tight leading-snug">
                                            "{review.comment}"
                                        </p>
                                    )}

                                    {/* Footer: Meta info */}
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium text-gray-600 flex items-center">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {review.location}
                                        </span>
                                        {review.companion && (
                                            <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium text-gray-500 flex items-center">
                                                <Users className="w-3 h-3 mr-1" />
                                                {review.companion}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
