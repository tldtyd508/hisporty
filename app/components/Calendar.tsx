"use client";

import { useState, useEffect, useMemo } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';

export default function Calendar({ onSelectDate, selectedDate }: { onSelectDate: (date: Date) => void, selectedDate: Date }) {
    const [currentWeek, setCurrentWeek] = useState(selectedDate);
    const [games, setGames] = useState<any[]>([]);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const fetchGames = async () => {
            const { data } = await supabase
                .from('games')
                .select('id, date');
            if (data) setGames(data);
        };
        fetchGames();
    }, [supabase]);

    const nextWeek = () => setCurrentWeek(addDays(currentWeek, 7));
    const prevWeek = () => setCurrentWeek(subDays(currentWeek, 7));

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4 px-2">
                <button onClick={prevWeek} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h2 className="text-lg font-bold text-gray-800">
                    {format(currentWeek, 'yyyy년 MM월')}
                </h2>
                <button onClick={nextWeek} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return (
            <div className="grid grid-cols-7 gap-1 mb-2">
                {days.map((day, i) => (
                    <div key={i} className="text-center text-xs font-semibold text-gray-500 py-1">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const startDate = startOfWeek(currentWeek);
        const endDate = endOfWeek(currentWeek);

        const dateFormat = "d";
        const days = [];
        let day = startDate;

        while (day <= endDate) {
            const formattedDate = format(day, dateFormat);
            const cloneDay = day;

            // Check if there's a game on this day
            const dayString = format(day, 'yyyy-MM-dd');
            const hasGame = games.some(g => g.date === dayString);

            days.push(
                <div
                    className={`p-1 flex flex-col items-center justify-center cursor-pointer min-h-[50px]
              ${isSameMonth(day, currentWeek) ? "text-gray-800 bg-white" : "text-gray-400 bg-gray-50"}
              ${isSameDay(day, selectedDate) ? "border-2 border-blue-500 rounded-lg shadow-sm" : "border border-gray-100 rounded-lg"}
              hover:bg-blue-50 transition-colors
            `}
                    key={day.toISOString()}
                    onClick={() => onSelectDate(cloneDay)}
                >
                    <span className={`text-sm ${isSameDay(day, selectedDate) ? "font-bold text-blue-600" : ""}`}>
                        {formattedDate}
                    </span>
                    {hasGame && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 animate-pulse"></div>
                    )}
                </div>
            );
            day = addDays(day, 1);
        }

        return <div className="bg-gray-50 p-2 rounded-xl grid grid-cols-7 gap-1">{days}</div>;
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-4 shadow-sm rounded-2xl border border-gray-100 mb-6">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
}
