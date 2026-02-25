"use client";

import { useState } from 'react';
import { X, Star, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { MOCK_GAMES } from '../data/mockData';

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

    if (!isOpen) return null;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const gamesToday = MOCK_GAMES.filter(g => g.date === dateString);
    const game = gamesToday[0]; // For MVP, assume 1 game per day for simplicity if it exists

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would save to DB. For prototype, we just close.
        alert("리뷰가 등록되었습니다! (Prototype)");
        onClose();
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
                                    <span className="text-lg font-black text-gray-800">{game.homeTeam}</span>
                                    <div className="flex flex-col items-center px-4">
                                        <span className="text-xs text-gray-500 mb-1">{game.stadium}</span>
                                        <span className="text-sm font-bold bg-gray-800 text-white px-3 py-1 rounded-full">vs</span>
                                    </div>
                                    <span className="text-lg font-black text-gray-800">{game.awayTeam}</span>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 flex items-center">
                                    <Star className="w-4 h-4 mr-1 text-yellow-500" /> 별점
                                </label>
                                <div className="flex justify-center space-x-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-10 h-10 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-200'} transition-colors duration-200`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location & Companion (Row) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 text-gray-400" /> 관람 장소
                                    </label>
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                        required
                                    >
                                        <option value="" disabled>선택해주세요</option>
                                        <option value="직관(홈석)">직관 (홈석)</option>
                                        <option value="직관(원정석)">직관 (원정석)</option>
                                        <option value="집관">집관</option>
                                        <option value="펍/식당">펍/식당</option>
                                    </select>
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
                                <label className="block text-sm font-bold text-gray-700">코멘트</label>
                                <textarea
                                    rows={4}
                                    placeholder="오늘 경기의 주인공은 누구였나요? 가장 기억에 남는 순간을 남겨보세요!"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm resize-none placeholder-gray-400"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 pb-8 sm:pb-0">
                                <button
                                    type="submit"
                                    disabled={rating === 0}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                    ${rating === 0
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
