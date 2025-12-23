'use client';

import { useMemo } from 'react';

interface DateTimePickerProps {
  scheduledTime: Date | null;
  onScheduledTimeChange: (time: Date | null) => void;
  isScheduled: boolean;
  onIsScheduledChange: (isScheduled: boolean) => void;
}

export default function DateTimePicker({
  scheduledTime,
  onScheduledTimeChange,
  isScheduled,
  onIsScheduledChange,
}: DateTimePickerProps) {
  const { minDate, minTime, minDateTime } = useMemo(() => {
    const now = new Date();
    const minDT = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    const year = minDT.getFullYear();
    const month = String(minDT.getMonth() + 1).padStart(2, '0');
    const day = String(minDT.getDate()).padStart(2, '0');
    const hours = String(minDT.getHours()).padStart(2, '0');
    const minutes = String(minDT.getMinutes()).padStart(2, '0');

    return {
      minDate: `${year}-${month}-${day}`,
      minTime: `${hours}:${minutes}`,
      minDateTime: minDT,
    };
  }, []);

  const handleNowClick = () => {
    onIsScheduledChange(false);
    onScheduledTimeChange(null);
  };

  const handleScheduleClick = () => {
    onIsScheduledChange(true);
    if (!scheduledTime) {
      onScheduledTimeChange(minDateTime);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (!dateValue) return;

    const currentTime = scheduledTime || minDateTime;
    const [year, month, day] = dateValue.split('-').map(Number);

    const newDate = new Date(currentTime);
    newDate.setFullYear(year, month - 1, day);

    // Ensure the new date is not in the past
    if (newDate < minDateTime) {
      onScheduledTimeChange(minDateTime);
    } else {
      onScheduledTimeChange(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (!timeValue) return;

    const currentDate = scheduledTime || minDateTime;
    const [hours, minutes] = timeValue.split(':').map(Number);

    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);

    // Ensure the new time is at least 1 hour from now
    if (newDate < minDateTime) {
      onScheduledTimeChange(minDateTime);
    } else {
      onScheduledTimeChange(newDate);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  return (
    <div className="w-full bg-white rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">როდის გჭირდებათ?</h3>

      {/* Toggle Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleNowClick}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
                     ${
                       !isScheduled
                         ? 'bg-blue-500 text-white shadow-md'
                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                     }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>ახლავე</span>
          </div>
        </button>

        <button
          onClick={handleScheduleClick}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
                     ${
                       isScheduled
                         ? 'bg-blue-500 text-white shadow-md'
                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                     }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>დაგეგმვა</span>
          </div>
        </button>
      </div>

      {/* Date/Time Inputs */}
      {isScheduled && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-2 gap-4">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">თარიღი</label>
              <input
                type="date"
                value={scheduledTime ? formatDateForInput(scheduledTime) : minDate}
                min={minDate}
                onChange={handleDateChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2
                         focus:ring-blue-500 focus:border-transparent outline-none transition-all
                         text-gray-900 bg-white"
              />
            </div>

            {/* Time Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">დრო</label>
              <input
                type="time"
                value={scheduledTime ? formatTimeForInput(scheduledTime) : minTime}
                min={scheduledTime && isToday(scheduledTime) ? minTime : undefined}
                onChange={handleTimeChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2
                         focus:ring-blue-500 focus:border-transparent outline-none transition-all
                         text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Selected Time Display */}
          {scheduledTime && (
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">დაგეგმილი დრო:</p>
              <p className="text-lg font-semibold text-blue-700">
                {scheduledTime.toLocaleDateString('ka-GE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {', '}
                {scheduledTime.toLocaleTimeString('ka-GE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
