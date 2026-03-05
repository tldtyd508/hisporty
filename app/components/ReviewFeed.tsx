"use client";

import { useState, useEffect } from 'react';
import { Star, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/app/utils/supabase/client';

export default function ReviewFeed({ selectedDate }: { selectedDate: Date }) {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const [games, setGames] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

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
                            <div key={`hero-${game.id}`} className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden transition-transform hover:scale-[1.02]">
                                {/* Decorative elements */}
                                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/20 rounded-full blur-2xl"></div>

                                <div className="relative z-10 pt-2">
                                    <div className="flex justify-center items-center mb-6">
                                        <span className="bg-white/10 backdrop-blur-md text-blue-50 text-xs font-bold px-3 py-1 rounded-full border border-white/10 tracking-wider">
                                            {game.stadium}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-center w-5/12">
                                            <p className="text-4xl sm:text-5xl font-black tracking-tighter drop-shadow-md text-white">{game.home_team}</p>
                                        </div>
                                        <div className="w-2/12 flex justify-center">
                                            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                                                <span className="font-black text-xs text-white/90">VS</span>
                                            </div>
                                        </div>
                                        <div className="text-center w-5/12">
                                            <p className="text-4xl sm:text-5xl font-black tracking-tighter drop-shadow-md text-white/90">{game.away_team}</p>
                                        </div>
                                    </div>
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
                                                <div className="flex items-center mt-0.5">
                                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current mr-1" />
                                                    <span className="text-sm font-bold text-gray-700">{review.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-1">
                                                {game?.home_team} vs {game?.away_team}
                                            </div>
                                            <p className="text-[11px] text-gray-400">{format(new Date(review.created_at), 'yyyy-MM-dd')}</p>
                                        </div>
                                    </div>

                                    {/* Content: One-line review */}
                                    <p className="text-gray-900 text-lg font-black mb-4 tracking-tight leading-snug">
                                        "{review.comment}"
                                    </p>

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
