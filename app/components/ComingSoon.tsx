"use client";

import { Rocket, Camera, BarChart3, Trophy, Share2, MessageSquare, Repeat, Heart } from 'lucide-react';

const COMING_SOON_ITEMS = [
    { icon: Repeat, label: '종목 전환', color: 'text-indigo-500 bg-indigo-50' },
    { icon: Heart, label: '응원팀 설정', color: 'text-red-500 bg-red-50' },
    { icon: Camera, label: '직관 사진 업로드', color: 'text-pink-500 bg-pink-50' },
    { icon: BarChart3, label: '구장별 승률 통계', color: 'text-emerald-500 bg-emerald-50' },
    { icon: Trophy, label: '유저 랭킹', color: 'text-amber-500 bg-amber-50' },
    { icon: Share2, label: '카카오 공유', color: 'text-blue-500 bg-blue-50' },
    { icon: MessageSquare, label: '리뷰 댓글', color: 'text-violet-500 bg-violet-50' },
];

export default function ComingSoon() {
    return (
        <div className="w-full max-w-md mx-auto mb-6 px-4">
            <div className="flex items-center mb-3 px-1">
                <Rocket className="w-4 h-4 text-indigo-500 mr-1.5" />
                <h3 className="text-sm font-black text-gray-800">Coming Soon</h3>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {COMING_SOON_ITEMS.map((item) => (
                    <div
                        key={item.label}
                        className="flex-shrink-0 flex items-center px-3 py-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className={`p-1.5 rounded-lg mr-2 ${item.color}`}>
                            <item.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-gray-600 whitespace-nowrap">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
