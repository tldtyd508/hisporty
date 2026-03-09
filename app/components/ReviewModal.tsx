"use client";

import { useState, useMemo } from 'react';
import { X, Star, MapPin, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/app/utils/supabase/client';
import { useEffect } from 'react';
import { TEAM_FLAGS } from '@/app/constants';

export default function ReviewModal({
    isOpen,
    onClose,
    selectedDate,
    onReviewSubmitted,
    preSelectedGameId
}: {
    isOpen: boolean,
    onClose: () => void,
    selectedDate: Date,
    onReviewSubmitted?: () => void,
    preSelectedGameId?: string | null
}) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [location, setLocation] = useState("");
    const [companion, setCompanion] = useState("");
    const [supportingTeam, setSupportingTeam] = useState("");

    const [games, setGames] = useState<any[]>([]);
    const [selectedGame, setSelectedGame] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            setLoading(true);
            const dateString = format(selectedDate, 'yyyy-MM-dd');
            const { data } = await supabase.from('games').select('*').eq('date', dateString);

            if (data && data.length > 0) {
                setGames(data);
                
                if (preSelectedGameId) {
                    const match = data.find(g => g.id === preSelectedGameId);
                    if (match) {
                        setSelectedGame(match);
                    } else {
                        setSelectedGame(null);
                    }
                } else if (data.length === 1) {
                    // Auto-select if only one game
                    setSelectedGame(data[0]);
                } else {
                    setSelectedGame(null); // Force user to pick
                }
            } else {
                setGames([]);
                setSelectedGame(null);
            }
            setLoading(false);

            const { data: userData } = await supabase.auth.getUser();
            setUser(userData.user);
        };
        init();
    }, [isOpen, selectedDate, preSelectedGameId, supabase]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setRating(0);
            setComment("");
            setLocation("");
            setCompanion("");
            setSupportingTeam("");
            setSelectedGame(null);
            setGames([]);
        }
    }, [isOpen]);

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
            game_id: selectedGame?.id,
            supporting_team: supportingTeam,
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
            setRating(0);
            setComment("");
            setLocation("");
            setCompanion("");
            setSupportingTeam("");
            setSelectedGame(null);
            onReviewSubmitted?.();
            onClose();
        }
    };

    // Game selection step (when multiple games exist)
    const renderGameSelection = () => (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium mb-2">리뷰를 남길 경기를 선택해 주세요</p>
            {games.map(game => (
                <button
                    key={game.id}
                    type="button"
                    onClick={() => setSelectedGame(game)}
                    className="w-full text-left bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">{TEAM_FLAGS[game.home_team] || '⚾️'}</span>
                            <div>
                                <p className="text-sm font-bold text-gray-800">
                                    {game.home_team} vs {game.away_team}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                    {game.time_kst || '시간 미정'} • {game.stadium}
                                </p>
                            </div>
                            <span className="text-2xl">{TEAM_FLAGS[game.away_team] || '⚾️'}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                </button>
            ))}
        </div>
    );

    // Review form (existing, but now uses selectedGame)
    const renderReviewForm = () => (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Game Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-600 bg-white px-2 py-1 rounded-full shadow-sm inline-block">
                        {format(selectedDate, 'yyyy년 M월 d일')}
                    </span>
                    {/* Show "change game" button if multiple games */}
                    {games.length > 1 && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedGame(null);
                                setSupportingTeam("");
                            }}
                            className="text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors"
                        >
                            경기 변경
                        </button>
                    )}
                </div>

                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 ml-1">응원하는 팀 선택</p>
                <div className="flex justify-between items-stretch gap-3">
                    <button
                        type="button"
                        onClick={() => setSupportingTeam(selectedGame.home_team)}
                        className={`flex-1 flex flex-col items-center p-3 rounded-2xl border transition-all ${supportingTeam === selectedGame.home_team ? 'bg-white border-blue-500 shadow-md scale-[1.02]' : 'bg-white/50 border-transparent hover:bg-white'}`}
                    >
                        <span className="text-4xl mb-2">{TEAM_FLAGS[selectedGame.home_team] || '⚾️'}</span>
                        <span className={`text-xs font-bold ${supportingTeam === selectedGame.home_team ? 'text-blue-600' : 'text-gray-500'}`}>{selectedGame.home_team}</span>
                    </button>

                    <div className="flex flex-col items-center justify-center px-1">
                        <span className="text-[10px] font-black text-gray-300 italic">VS</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSupportingTeam(selectedGame.away_team)}
                        className={`flex-1 flex flex-col items-center p-3 rounded-2xl border transition-all ${supportingTeam === selectedGame.away_team ? 'bg-white border-blue-500 shadow-md scale-[1.02]' : 'bg-white/50 border-transparent hover:bg-white'}`}
                    >
                        <span className="text-4xl mb-2">{TEAM_FLAGS[selectedGame.away_team] || '⚾️'}</span>
                        <span className={`text-xs font-bold ${supportingTeam === selectedGame.away_team ? 'text-blue-600' : 'text-gray-500'}`}>{selectedGame.away_team}</span>
                    </button>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-100/30 flex justify-center space-x-4">
                    <span className="text-[10px] text-blue-600 font-bold">{selectedGame.time_kst || '시간 미정'}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{selectedGame.stadium}</span>
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
                    <div className="grid grid-cols-3 gap-2">
                        {['직관', '집관', '펍/식당'].map(loc => (
                            <button
                                key={loc}
                                type="button"
                                onClick={() => setLocation(loc)}
                                className={`py-2 text-sm font-bold rounded-xl border transition-all ${location === loc ? 'bg-gray-800 text-white border-gray-800 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
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
                    disabled={rating === 0 || !location || !comment.trim() || !supportingTeam}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                    ${rating === 0 || !location || !comment.trim() || !supportingTeam
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/25'
                        }`}
                >
                    기록 저장하기
                </button>
            </div>
        </form>
    );

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
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-gray-400 text-sm">경기 정보를 불러오는 중...</p>
                        </div>
                    ) : games.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">선택하신 날짜({format(selectedDate, 'MM/dd')}) 에는<br />경기 일정이 없습니다.</p>
                            <button onClick={onClose} className="mt-6 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">닫기</button>
                        </div>
                    ) : !selectedGame ? (
                        // Step 1: Game Selection (only when multiple games)
                        renderGameSelection()
                    ) : (
                        // Step 2: Review Form
                        renderReviewForm()
                    )}
                </div>
            </div>
        </div>
    );
}
