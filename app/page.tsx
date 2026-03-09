"use client";

import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import ReviewFeed from './components/ReviewFeed';
import ReviewModal from './components/ReviewModal';
import AuthButton from './components/AuthButton';
import Dashboard from './components/Dashboard';
import ComingSoon from './components/ComingSoon';
import MyTeamSetting, { getMyTeams } from './components/MyTeamSetting';
import WbcStandings from './components/WbcStandings';
import WbcBracket from './components/WbcBracket';
import { PenSquare, Trophy, Eye, EyeOff, Heart, CalendarDays, ListOrdered, GitMerge } from 'lucide-react';
import confetti from 'canvas-confetti';

type ViewMode = 'calendar' | 'standings' | 'bracket';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamSettingOpen, setIsTeamSettingOpen] = useState(false);
  const [spoilerShield, setSpoilerShield] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [myTeams, setMyTeams] = useState<string[]>(['대한민국']);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hisporty_spoiler_shield');
    if (saved !== null) setSpoilerShield(saved === 'true');
    setMyTeams(getMyTeams());
  }, []);

  // Trigger celebration when spoiler shield is turned off
  useEffect(() => {
    if (!spoilerShield) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.3 },
        colors: ['#2563EB', '#ffffff', '#DB2777'],
        zIndex: 100
      });
    }
  }, [spoilerShield]);

  const toggleSpoilerShield = () => {
    setSpoilerShield(prev => {
      const next = !prev;
      localStorage.setItem('hisporty_spoiler_shield', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans sm:bg-gray-100 flex justify-center">
      {/* Mobile container constraint for desktop viewing */}
      <main className="w-full max-w-md bg-gray-50 sm:shadow-2xl sm:min-h-screen relative overflow-x-hidden">

        {/* App Header */}
        <header className="bg-white px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-sm mb-6 flex justify-between items-center sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              <Trophy className="w-6 h-6 mr-2 text-blue-600" />
              Hisporty
            </h1>
            <p className="text-xs font-medium text-gray-500 mt-1 ml-8 tracking-wide">나만의 스포츠 연대기</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* My Team Setting Button */}
            <button
              onClick={() => setIsTeamSettingOpen(true)}
              className="flex items-center px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              title="마이팀 설정"
            >
              <Heart className="w-3.5 h-3.5 mr-1 fill-current" />
              마이팀
            </button>
            <button
              onClick={toggleSpoilerShield}
              className={`flex items-center px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${spoilerShield ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
              title={spoilerShield ? '스포 방지 ON' : '스포 방지 OFF'}
            >
              {spoilerShield ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
              {spoilerShield ? '스포방지' : '결과공개'}
            </button>
            <AuthButton />
          </div>
        </header>

        {/* Dashboard Section */}
        <section className="px-4 animate-fade-in-up">
          <Dashboard />
        </section>

        {/* Coming Soon */}
        <section className="animate-fade-in-up" style={{ animationDelay: '30ms' }}>
          <ComingSoon />
        </section>

        {/* View Mode Tabs */}
        <div className="px-4 mb-6 flex justify-center mt-6">
          <div className="bg-gray-200/50 p-1 rounded-2xl flex space-x-1 shadow-inner border border-gray-200 w-full">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl text-[11px] font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <CalendarDays className="w-4 h-4 mb-1" />
              일정/결과
            </button>
            <button
              onClick={() => setViewMode('standings')}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl text-[11px] font-bold transition-all ${viewMode === 'standings' ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ListOrdered className="w-4 h-4 mb-1" />
              조별 순위
            </button>
            <button
              onClick={() => setViewMode('bracket')}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl text-[11px] font-bold transition-all ${viewMode === 'bracket' ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <GitMerge className="w-4 h-4 mb-1 transform rotate-90" />
              대진표
            </button>
          </div>
        </div>

        {/* Dynamic Content View */}
        <div className="animate-fade-in-up transition-opacity duration-300">
          {viewMode === 'calendar' && (
            <>
              {/* Calendar Section */}
              <section className="px-4 mb-8">
                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </section>

              {/* Feed Section */}
              <section>
                <ReviewFeed
                  selectedDate={selectedDate}
                  spoilerShield={spoilerShield}
                  refreshKey={refreshKey}
                  myTeams={myTeams}
                  selectedGameId={selectedGameId}
                  onSelectGame={setSelectedGameId}
                />
              </section>
            </>
          )}

          {viewMode === 'standings' && (
            <section className="px-4 pb-20">
              <WbcStandings spoilerShield={spoilerShield} />
            </section>
          )}

          {viewMode === 'bracket' && (
            <section className="px-4 pb-20">
              <WbcBracket spoilerShield={spoilerShield} />
            </section>
          )}
        </div>

        {/* Floating Action Button (FAB) */}
        {viewMode === 'calendar' && (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedGameId}
            className={`fixed bottom-8 right-1/2 translate-x-[9rem] sm:translate-x-[11rem] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-40 ${
              selectedGameId 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/40 hover:scale-110 active:scale-95 cursor-pointer' 
                : 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-50 shadow-none'
            }`}
          >
            <PenSquare className="w-6 h-6" />
          </button>
        )}

        {/* Modal */}
        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedDate}
          onReviewSubmitted={() => setRefreshKey(k => k + 1)}
          preSelectedGameId={selectedGameId}
        />

        {/* My Team Setting */}
        <MyTeamSetting
          isOpen={isTeamSettingOpen}
          onClose={() => setIsTeamSettingOpen(false)}
          onSave={setMyTeams}
          currentTeams={myTeams}
        />

      </main>
    </div>
  );
}
