"use client";

import { MOCK_REVIEWS, MOCK_GAMES } from '../data/mockData';
import { Star, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewFeed({ selectedDate }: { selectedDate: Date }) {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const gamesToday = MOCK_GAMES.filter(g => g.date === dateString);
    const reviewsToday = MOCK_REVIEWS.filter(r => gamesToday.some(g => g.id === r.gameId));

    return (
        <div className="w-full max-w-md mx-auto px-4 pb-20">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold font-sans text-gray-800">팬들의 소리</h3>
                {gamesToday.length > 0 && (
                    <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {gamesToday.length}경기
                    </span>
                )}
            </div>

            {gamesToday.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">해당 날짜에 예정된 경기가 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviewsToday.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl">
                            <p className="text-gray-500 text-sm">아직 작성된 리뷰가 없어요.<br />첫 번째 리뷰를 남겨보세요!</p>
                        </div>
                    ) : (
                        reviewsToday.map(review => {
                            const game = MOCK_GAMES.find(g => g.id === review.gameId);
                            return (
                                <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                {review.userNickname.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{review.userNickname}</p>
                                                <div className="flex items-center text-gray-400 text-xs">
                                                    <span className="font-semibold text-blue-600 mr-1">{game?.homeTeam} vs {game?.awayTeam}</span>
                                                    • {game?.stadium}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current mr-1" />
                                            <span className="text-sm font-bold text-yellow-700">{review.rating}</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 text-sm mb-4 leading-relaxed whitespace-pre-line">
                                        "{review.comment}"
                                    </p>

                                    <div className="flex items-center space-x-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                        <div className="flex items-center">
                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                            {review.location}
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="w-3.5 h-3.5 mr-1" />
                                            {review.companion}
                                        </div>
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
