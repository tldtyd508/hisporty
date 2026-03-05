"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '../utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon, Settings, X, Check } from 'lucide-react';

export default function AuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [newNickname, setNewNickname] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const handleGuestLogin = async () => {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
            console.error('Guest login error:', error.code, error.message);
            alert(`게스트 로그인에 실패했습니다. (Error: ${error.message})\nSupabase 설정에서 Anonymous Auth가 활성화되어 있는지 확인해 주세요.`);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsDropdownOpen(false);
    };

    const handleUpdateNickname = async () => {
        if (!newNickname.trim()) return;
        setIsUpdating(true);
        const { error } = await supabase.auth.updateUser({
            data: { name: newNickname.trim() }
        });

        if (error) {
            alert('닉네임 수 정에 실패했습니다: ' + error.message);
        } else {
            setIsProfileModalOpen(false);
            // Local state will be updated via onAuthStateChange
        }
        setIsUpdating(false);
    };

    if (loading) {
        return <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse"></div>;
    }

    if (user) {
        const isAnonymous = user.is_anonymous;
        const currentNickname = user.user_metadata?.name || (isAnonymous ? `Guest-${user.id.substring(0, 4)}` : '익명 사용자');
        const initial = isAnonymous ? 'G' : currentNickname.charAt(0);

        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white shadow-md hover:scale-105 transition-transform active:scale-95"
                >
                    {initial}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">내 계정</p>
                            <p className="text-sm font-black text-gray-800 truncate">{currentNickname}</p>
                        </div>

                        {!isAnonymous && (
                            <button
                                onClick={() => {
                                    setNewNickname(currentNickname);
                                    setIsProfileModalOpen(true);
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center"
                            >
                                <Settings className="w-4 h-4 mr-2 text-gray-400" />
                                프로필 설정
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center"
                        >
                            <LogOut className="w-4 h-4 mr-2 text-red-400" />
                            로그아웃
                        </button>
                    </div>
                )}

                {/* Nickname Modal */}
                {isProfileModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2rem] w-full max-w-xs p-6 shadow-2xl animate-scale-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-gray-900">프로필 수 정</h3>
                                <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">닉네임</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newNickname}
                                        onChange={(e) => setNewNickname(e.target.value)}
                                        placeholder="새 닉네임을 입력하세요"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                        maxLength={15}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 ml-1">최대 15자까지 입력 가능합니다.</p>
                            </div>

                            <button
                                onClick={handleUpdateNickname}
                                disabled={isUpdating || !newNickname.trim()}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400"
                            >
                                {isUpdating ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-1" /> 저장하기
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex bg-gray-100 rounded-full p-1 shadow-inner">
            <button
                onClick={handleGoogleLogin}
                className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-white rounded-full transition-colors flex items-center shadow-sm"
            >
                <img src="https://www.google.com/favicon.ico" className="w-3 h-3 mr-1" alt="Google" />
                구글
            </button>
            <button
                onClick={handleGuestLogin}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-white rounded-full transition-colors"
            >
                게스트
            </button>
        </div>
    );
}
