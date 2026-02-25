"use client";

import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_GAMES } from '@/app/data/mockData';

export default function Calendar({ onSelectDate, selectedDate }: { onSelectDate: (date: Date) => void, selectedDate: Date }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4 px-2">
                <button onClick={prevMonth} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h2 className="text-lg font-bold text-gray-800">
                    {format(currentMonth, 'yyyy년 MM월')}
                </h2>
                <button onClick={nextMonth} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
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
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                // Check if there's a game on this day
                const dayString = format(day, 'yyyy-MM-dd');
                const hasGame = MOCK_GAMES.some(g => g.date === dayString);

                days.push(
                    <div
                        className={`p-1 flex flex-col items-center justify-center cursor-pointer min-h-[50px]
              ${!isSameMonth(day, monthStart) ? "text-gray-300 bg-gray-50" : "text-gray-800 bg-white"}
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
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1"></div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-1 mb-1" key={day.toISOString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="bg-gray-50 p-2 rounded-xl">{rows}</div>;
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-4 shadow-sm rounded-2xl border border-gray-100 mb-6">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
}
