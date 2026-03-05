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
            <div className="flex justify-between items-center mb-4">
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
                            return (
                                <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    {/* Header: User Info & Rating */}
                                    <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm opacity-90">
                                                {review.user_nickname.charAt(0)}
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
