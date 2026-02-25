"use client";

import { useState } from 'react';
import Calendar from './components/Calendar';
import ReviewFeed from './components/ReviewFeed';
import ReviewModal from './components/ReviewModal';
import { PenSquare, Trophy } from 'lucide-react';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

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

          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors">
            JG
          </div>
        </header>

        {/* Calendar Section */}
        <section className="px-4 animate-fade-in-up">
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </section>

        {/* Feed Section */}
        <section className="mt-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <ReviewFeed selectedDate={selectedDate} />
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
