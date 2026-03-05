"use client";

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { User } from '@supabase/supabase-js';

export default function AuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

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
            console.error('Guest login error:', error.message);
            alert('게스트 로그인에 실패했습니다. 관리자에게 문의해주세요.');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) {
        return <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse"></div>;
    }

    if (user) {
        const isAnonymous = user.is_anonymous;
        const initial = isAnonymous ? 'G' : (user.user_metadata?.name?.charAt(0) || 'U');

        return (
            <div className="flex items-center space-x-3">
                <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                    로그아웃
                </button>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 shadow-sm">
                    {initial}
                </div>
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
