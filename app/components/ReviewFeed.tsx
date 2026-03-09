"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Star, MapPin, Users, Eye, EyeOff, Heart, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/app/utils/supabase/client';
import { TEAM_FLAGS } from '@/app/constants';

type SortMode = 'latest' | 'oldest' | 'popular';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
    { value: 'oldest', label: '오래된 순' },
];

export default function ReviewFeed({ selectedDate, spoilerShield = true, refreshKey = 0, myTeams = ['대한민국'] }: { selectedDate: Date; spoilerShield?: boolean; refreshKey?: number; myTeams?: string[] }) {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const [games, setGames] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [revealedScores, setRevealedScores] = useState<Set<string>>(new Set());
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null); // null = 전체
    const [sortMode, setSortMode] = useState<SortMode>('latest');
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
    const [likedByMe, setLikedByMe] = useState<Set<string>>(new Set());
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(new Set());
    const [showAllGames, setShowAllGames] = useState(false);
    const supabase = useMemo(() => createClient(), []);

    const toggleReveal = (gameId: string) => {
        setRevealedScores(prev => {
            const next = new Set(prev);
            if (next.has(gameId)) next.delete(gameId);
            else next.add(gameId);
            return next;
        });
    };

    // Fetch user session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setCurrentUserId(session?.user?.id ?? null);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUserId(session?.user?.id ?? null);
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    // Fetch games, reviews, and likes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: gamesData } = await supabase
                .from('games')
                .select('*')
                .eq('date', dateString)
                .order('time_kst', { ascending: true });

            if (gamesData && gamesData.length > 0) {
                setGames(gamesData);
                // Reset game filter when games change
                setSelectedGameId(null);

                const gameIds = gamesData.map(g => g.id);
                const { data: reviewsData } = await supabase
                    .from('reviews')
                    .select('*')
                    .in('game_id', gameIds)
                    .order('created_at', { ascending: false });

                if (reviewsData) {
                    setReviews(reviewsData);

                    // Fetch like counts for all reviews
                    const reviewIds = reviewsData.map(r => r.id);
                    if (reviewIds.length > 0) {
                        const { data: likesData } = await supabase
                            .from('review_likes')
                            .select('review_id')
                            .in('review_id', reviewIds);

                        if (likesData) {
                            const counts: Record<string, number> = {};
                            likesData.forEach(like => {
                                counts[like.review_id] = (counts[like.review_id] || 0) + 1;
                            });
                            setLikeCounts(counts);
                        }

                        // Fetch my likes
                        if (currentUserId) {
                            const { data: myLikes } = await supabase
                                .from('review_likes')
                                .select('review_id')
                                .in('review_id', reviewIds)
                                .eq('user_id', currentUserId);

                            if (myLikes) {
                                setLikedByMe(new Set(myLikes.map(l => l.review_id)));
                            }
                        }
                    }
                }
            } else {
                setGames([]);
                setReviews([]);
                setLikeCounts({});
                setLikedByMe(new Set());
            }
            setLoading(false);
        };
        fetchData();
    }, [dateString, supabase, refreshKey, currentUserId]);

    // Toggle like
    const handleToggleLike = useCallback(async (reviewId: string) => {
        if (!currentUserId) {
            alert('좋아요를 누르려면 로그인이 필요합니다.');
            return;
        }

        const isLiked = likedByMe.has(reviewId);

        // Optimistic update
        setLikedByMe(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(reviewId);
            else next.add(reviewId);
            return next;
        });
        setLikeCounts(prev => ({
            ...prev,
            [reviewId]: (prev[reviewId] || 0) + (isLiked ? -1 : 1)
        }));

        // Animate heart
        if (!isLiked) {
            setAnimatingHearts(prev => new Set(prev).add(reviewId));
            setTimeout(() => {
                setAnimatingHearts(prev => {
                    const next = new Set(prev);
                    next.delete(reviewId);
                    return next;
                });
            }, 300);
        }

        // DB sync
        if (isLiked) {
            await supabase
                .from('review_likes')
                .delete()
                .eq('review_id', reviewId)
                .eq('user_id', currentUserId);
        } else {
            await supabase
                .from('review_likes')
                .insert({ review_id: reviewId, user_id: currentUserId });
        }
    }, [currentUserId, likedByMe, supabase]);

    // Helper: check if game involves my team
    const isMyTeamGame = useCallback((game: any) => {
        return myTeams.some(t => t === game.home_team || t === game.away_team);
    }, [myTeams]);

    // Sort games: my team first, then by time_kst
    const sortedGames = useMemo(() => {
        return [...games].sort((a, b) => {
            const aIsMy = isMyTeamGame(a) ? 0 : 1;
            const bIsMy = isMyTeamGame(b) ? 0 : 1;
            if (aIsMy !== bIsMy) return aIsMy - bIsMy;
            return (a.time_kst || '').localeCompare(b.time_kst || '');
        });
    }, [games, isMyTeamGame]);

    // Split into myTeam games and other games
    const myTeamGames = useMemo(() => sortedGames.filter(isMyTeamGame), [sortedGames, isMyTeamGame]);
    const otherGames = useMemo(() => sortedGames.filter(g => !isMyTeamGame(g)), [sortedGames, isMyTeamGame]);
    const displayedGames = useMemo(() => showAllGames ? sortedGames : myTeamGames, [showAllGames, sortedGames, myTeamGames]);

    // Reset showAllGames when date changes
    useEffect(() => { setShowAllGames(false); }, [dateString]);

    // Filter reviews by selected game
    const filteredReviews = useMemo(() => {
        let filtered = selectedGameId
            ? reviews.filter(r => r.game_id === selectedGameId)
            : reviews;

        // Sort
        if (sortMode === 'popular') {
            filtered = [...filtered].sort((a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0));
        } else if (sortMode === 'oldest') {
            filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }
        // 'latest' is default order from DB

        return filtered;
    }, [reviews, selectedGameId, sortMode, likeCounts]);

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
                        {displayedGames.map(game => {
                            const isMy = isMyTeamGame(game);
                            const isSelected = selectedGameId === game.id;
                            return (
                                <div
                                    key={`hero-${game.id}`}
                                    onClick={(e) => {
                                        // Don't toggle when clicking score reveal buttons
                                        if ((e.target as HTMLElement).closest('button')) return;
                                        setSelectedGameId(prev => prev === game.id ? null : game.id);
                                    }}
                                    className={`rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden transition-all cursor-pointer hover:scale-[1.01] ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 scale-[1.01]' : ''
                                        } ${isMy
                                            ? (game.status === '종료'
                                                ? 'bg-gradient-to-br from-slate-700 via-blue-900 to-indigo-950 shadow-blue-900/20'
                                                : 'bg-gradient-to-br from-blue-500 via-blue-700 to-indigo-900 shadow-blue-800/30')
                                            : (game.status === '종료'
                                                ? 'bg-gradient-to-br from-gray-300 to-gray-400 shadow-gray-400/10 text-gray-700'
                                                : 'bg-gradient-to-br from-gray-200 to-gray-350 shadow-gray-300/10 text-gray-700')
                                        }`}
                                >
                                    <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl ${isMy ? 'bg-white/10' : 'bg-white/5'}`}></div>
                                    <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl ${isMy ? 'bg-black/20' : 'bg-black/5'}`}></div>

                                    <div className="relative z-10 pt-2">
                                        <div className="flex justify-center items-center mb-6 space-x-2">
                                            {isSelected && <span className="text-[9px] font-black text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-400/30">✓ 선택됨</span>}
                                            {isMy && !isSelected && <span className="text-[9px] font-black text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-400/30">MY</span>}
                                            <span className={`backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full border tracking-wider ${isMy
                                                ? (game.status === '종료' ? 'bg-white/15 text-gray-200 border-white/10' :
                                                    game.status === '진행중' ? 'bg-red-500/30 text-red-100 border-red-400/30 animate-pulse' :
                                                        'bg-white/10 text-blue-50 border-white/10')
                                                : (game.status === '종료' ? 'bg-gray-500/20 text-gray-600 border-gray-400/30' :
                                                    game.status === '진행중' ? 'bg-red-500/20 text-red-600 border-red-400/30 animate-pulse' :
                                                        'bg-gray-500/15 text-gray-600 border-gray-400/20')
                                                }`}>
                                                {game.status === '종료' ? '경기 종료' : game.status === '진행중' ? '🔴 LIVE' : `${game.stadium} • ${game.time_kst || '시간 미정'}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-center w-5/12">
                                                <div className={`text-6xl sm:text-7xl mb-4 ${isMy ? 'drop-shadow-lg' : 'drop-shadow-sm'}`}>{TEAM_FLAGS[game.home_team] || '⚾️'}</div>
                                                <p className={`text-xl sm:text-2xl font-black tracking-tight drop-shadow-md ${isMy ? 'text-white/90' : 'text-gray-700'}`}>{game.home_team}</p>
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
                                                <div className={`text-6xl sm:text-7xl mb-4 ${isMy ? 'drop-shadow-lg' : 'drop-shadow-sm'}`}>{TEAM_FLAGS[game.away_team] || '⚾️'}</div>
                                                <p className={`text-xl sm:text-2xl font-black tracking-tight drop-shadow-md ${isMy ? 'text-white/90' : 'text-gray-700'}`}>{game.away_team}</p>
                                            </div>
                                        </div>
                                        {game.status !== '예정' && (
                                            <div className="flex justify-center mt-2">
                                                <span className={`text-[10px] font-medium ${isMy ? 'text-white/40' : 'text-gray-500'}`}>{game.stadium} • {game.time_kst || ''}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Show more / collapse button */}
                    {otherGames.length > 0 && (
                        <button
                            onClick={() => setShowAllGames(prev => !prev)}
                            className="w-full mt-3 py-2.5 flex items-center justify-center text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            {showAllGames ? (
                                <><ChevronUp className="w-4 h-4 mr-1" /> 마이팀 경기만 보기</>
                            ) : (
                                <><ChevronDown className="w-4 h-4 mr-1" /> 다른 {otherGames.length}경기 더 보기</>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Feed Section Header + Sort + Game Filter */}
            <div className="mb-4 px-1">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold font-sans text-gray-800">팬들의 소리</h3>
                    {games.length > 0 && (
                        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {filteredReviews.length}개 리뷰
                        </span>
                    )}
                </div>

                {/* Selected Game Indicator */}
                {selectedGameId && (() => {
                    const game = games.find(g => g.id === selectedGameId);
                    return game ? (
                        <div className="flex items-center space-x-2 mb-3">
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                                {TEAM_FLAGS[game.home_team] || ''} {game.home_team} vs {game.away_team} {TEAM_FLAGS[game.away_team] || ''} 리뷰만
                            </span>
                            <button
                                onClick={() => setSelectedGameId(null)}
                                className="text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-full transition-colors"
                            >
                                ✕ 전체 보기
                            </button>
                        </div>
                    ) : null;
                })()}

                {/* Sort Chips */}
                {reviews.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        {SORT_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setSortMode(opt.value)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${sortMode === opt.value
                                    ? 'bg-gray-800 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {games.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">해당 날짜에 예정된 경기가 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl">
                            <p className="text-gray-500 text-sm">아직 작성된 리뷰가 없어요.<br />첫 번째 리뷰를 남겨보세요!</p>
                        </div>
                    ) : (
                        filteredReviews.map(review => {
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
                            const isLiked = likedByMe.has(review.id);
                            const likeCount = likeCounts[review.id] || 0;
                            const isAnimating = animatingHearts.has(review.id);

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
                                    {spoilerShield && game?.status === '종료' && !revealedScores.has(review.id) ? (
                                        <div 
                                            className="relative mb-4 cursor-pointer group"
                                            onClick={() => {
                                                setRevealedScores(prev => {
                                                    const next = new Set(prev);
                                                    next.add(review.id);
                                                    return next;
                                                });
                                            }}
                                            title="클릭해서 리뷰 보기"
                                        >
                                            <p className="text-gray-900 text-lg font-black tracking-tight leading-snug blur-md select-none opacity-40 group-hover:opacity-60 transition-opacity" aria-hidden>
                                                &ldquo;{review.comment}&rdquo;
                                            </p>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200 group-hover:bg-white group-hover:text-blue-600 group-hover:border-blue-200 transition-all flex items-center">
                                                    <Eye className="w-4 h-4 mr-1.5" /> 스포 방지 중 (클릭해서 보기)
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-900 text-lg font-black mb-4 tracking-tight leading-snug">
                                            &ldquo;{review.comment}&rdquo;
                                            {spoilerShield && game?.status === '종료' && revealedScores.has(review.id) && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setRevealedScores(prev => {
                                                            const next = new Set(prev);
                                                            next.delete(review.id);
                                                            return next;
                                                        });
                                                    }}
                                                    className="block mt-2 text-[10px] text-gray-400 hover:text-gray-600 flex items-center"
                                                >
                                                    <EyeOff className="w-3 h-3 mr-1" /> 다시 숨기기
                                                </button>
                                            )}
                                        </p>
                                    )}

                                    {/* Footer: Meta info + Like */}
                                    <div className="flex items-center justify-between">
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

                                        {/* Like Button */}
                                        <button
                                            onClick={() => handleToggleLike(review.id)}
                                            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full transition-all ${isLiked
                                                ? 'bg-red-50 text-red-500 border border-red-100'
                                                : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-red-50 hover:text-red-400'
                                                }`}
                                        >
                                            <Heart
                                                className={`w-3.5 h-3.5 transition-transform duration-300 ${isLiked ? 'fill-current' : ''} ${isAnimating ? 'scale-125' : 'scale-100'}`}
                                            />
                                            {likeCount > 0 && (
                                                <span className="text-[11px] font-bold">{likeCount}</span>
                                            )}
                                        </button>
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
