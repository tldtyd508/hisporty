"use client";

import { useState } from 'react';
import { X, Star, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/app/utils/supabase/client';
import { useEffect } from 'react';

export default function ReviewModal({
    isOpen,
    onClose,
    selectedDate
}: {
    isOpen: boolean,
    onClose: () => void,
    selectedDate: Date
}) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [location, setLocation] = useState("");
    const [companion, setCompanion] = useState("");

    const [game, setGame] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            setLoading(true);
            const dateString = format(selectedDate, 'yyyy-MM-dd');
            const { data } = await supabase.from('games').select('*').eq('date', dateString).limit(1).single();
            setGame(data || null);
            setLoading(false);

            const { data: userData } = await supabase.auth.getUser();
            setUser(userData.user);
        };
        init();
    }, [isOpen, selectedDate, supabase]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        const nickname = user.user_metadata?.name || (user.is_anonymous ? `Guest-${user.id.substring(0, 4).toUpperCase()}` : '익명 사용자');

        const { error } = await supabase.from('reviews').insert({
            user_id: user.id,
            user_nickname: nickname,
            game_id: game?.id,
            rating,
            comment,
            location,
            companion
        });

        if (error) {
            console.error(error);
            alert("리뷰 저장에 실패했습니다.");
        } else {
            alert("리뷰가 등록되었습니다!");
            // Reset form
            setRating(0);
            setComment("");
            setLocation("");
            setCompanion("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 transition-opacity">
            <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out">

                {/* Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center rounded-t-3xl sm:rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">리뷰 남기기</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {!game ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">선택하신 날짜({format(selectedDate, 'MM/dd')}) 에는<br />KBO 경기 일정이 없습니다.</p>
                            <button onClick={onClose} className="mt-6 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">닫기</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Game Info Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50">
                                <span className="text-xs font-bold text-blue-600 bg-white px-2 py-1 rounded-full shadow-sm mb-2 inline-block">
                                    {format(selectedDate, 'yyyy년 M월 d일')}
                                </span>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-lg font-black text-gray-800">{game.home_team}</span>
                                    <div className="flex flex-col items-center px-4">
                                        <span className="text-xs text-gray-500 mb-1">{game.stadium}</span>
                                        <span className="text-sm font-bold bg-gray-800 text-white px-3 py-1 rounded-full">vs</span>
                                    </div>
                                    <span className="text-lg font-black text-gray-800">{game.away_team}</span>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 flex items-center">
                                    <Star className="w-4 h-4 mr-1 text-yellow-500" /> 별점
                                </label>
                                <div className="flex justify-center space-x-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <div key={star} className="relative w-10 h-10 transition-transform hover:scale-110 active:scale-95">
                                            {/* Background / Full fill */}
                                            <Star
                                                className={`w-10 h-10 ${star <= Math.ceil(rating) ? 'text-yellow-400' : 'text-gray-200'} ${star <= rating ? 'fill-current' : ''} transition-colors duration-200`}
                                            />
                                            {/* Half star fill overlay */}
                                            {star === Math.ceil(rating) && rating % 1 !== 0 && (
                                                <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                                                    <Star className="w-10 h-10 text-yellow-400 fill-current" />
                                                </div>
                                            )}
                                            {/* Click areas */}
                                            <button type="button" className="absolute top-0 left-0 w-1/2 h-full z-10" onClick={() => setRating(star - 0.5)} aria-label={`${star - 0.5}점`} />
                                            <button type="button" className="absolute top-0 right-0 w-1/2 h-full z-10" onClick={() => setRating(star)} aria-label={`${star}점`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Location & Companion (Row) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 text-gray-400" /> 관람 장소
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['직관(홈)', '직관(원정)', '집관', '펍/식당'].map(loc => (
                                            <button
                                                key={loc}
                                                type="button"
                                                onClick={() => setLocation(loc)}
                                                className={`py-2 text-sm font-bold rounded-xl border transition-colors ${location === loc ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 flex items-center">
                                        <Users className="w-4 h-4 mr-1 text-gray-400" /> 함께 본 사람
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="예: 가족, 친구, 혼자"
                                        value={companion}
                                        onChange={(e) => setCompanion(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm placeholder-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">한줄평</label>
                                <input
                                    type="text"
                                    placeholder="오늘 경기의 주인공은 누구였나요?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    maxLength={100}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm placeholder-gray-400"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 pb-8 sm:pb-0">
                                <button
                                    type="submit"
                                    disabled={rating === 0 || !location || !comment.trim()}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                    ${rating === 0 || !location || !comment.trim()
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/25'
                                        }`}
                                >
                                    기록 저장하기
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
