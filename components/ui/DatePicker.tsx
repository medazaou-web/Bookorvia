'use client';

import { useState, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  disabled?: boolean;
  theme?: {
    input: string;
    label: string;
  };
}

export default function DatePicker({
  value,
  onChange,
  minDate,
  disabled = false,
  theme,
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const defaultTheme = {
    input: 'bg-white border-slate-300 text-slate-900',
    label: 'text-slate-900',
  };
  
  const t = theme || defaultTheme;

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Format date for display
  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Check if date is available
  const isDateAvailable = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    
    // Check against minDate
    if (minDate && dateString < minDate) {
      return false;
    }
    
    return true;
  };

  // Format date to YYYY-MM-DD
  const formatDateString = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const days = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setShowCalendar(!showCalendar)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border-2 transition-all font-semibold shadow-sm hover:shadow-md focus:shadow-lg appearance-none cursor-pointer ${
          t.input
        } ${
          value 
            ? 'border-indigo-400 dark:border-indigo-500' 
            : 'border-slate-300 dark:border-slate-600'
        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30 disabled:opacity-50 disabled:cursor-not-allowed text-left`}
      >
        <div className="flex items-center justify-between">
          <span>{value ? formatDate(value) : 'Select a date'}</span>
          <span className="text-slate-400">📅</span>
        </div>
      </button>

      {/* Calendar Popup */}
      {showCalendar && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              ←
            </button>
            <span className="font-bold text-slate-900 dark:text-white">{monthName}</span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }

              const dateString = formatDateString(day);
              const isSelected = value === dateString;
              const isAvailable = isDateAvailable(day);
              const isToday = new Date().toISOString().split('T')[0] === dateString;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onChange(dateString);
                    setShowCalendar(false);
                  }}
                  disabled={!isAvailable}
                  className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : isToday
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-300 dark:border-indigo-700'
                      : isAvailable
                      ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200'
                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Close on outside click */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setShowCalendar(false)}
          />
        </div>
      )}
    </div>
  );
}
