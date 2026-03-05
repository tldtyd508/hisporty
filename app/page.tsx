"use client";

import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import ReviewFeed from './components/ReviewFeed';
import ReviewModal from './components/ReviewModal';
import AuthButton from './components/AuthButton';
import Dashboard from './components/Dashboard';
import ComingSoon from './components/ComingSoon';
import { PenSquare, Trophy, Eye, EyeOff } from 'lucide-react';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spoilerShield, setSpoilerShield] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('hisporty_spoiler_shield');
    if (saved !== null) setSpoilerShield(saved === 'true');
  }, []);

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

        {/* Calendar Section */}
        <section className="px-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </section>

        {/* Feed Section */}
        <section className="mt-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <ReviewFeed selectedDate={selectedDate} spoilerShield={spoilerShield} />
        </section>

        {/* Floating Action Button (FAB) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-1/2 translate-x-[9rem] sm:translate-x-[11rem] w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-40"
        >
          <PenSquare className="w-6 h-6" />
        </button>

        {/* Modal */}
        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedDate}
        />

      </main>
    </div>
  );
}
