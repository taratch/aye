'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { formatThaiDate, formatTimeRange } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Filter, 
  Plus
} from 'lucide-react';
import { 
  format, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  startOfMonth, 
  endOfMonth,
  addMonths,
  subMonths,
  isToday
} from 'date-fns';

export default function CalendarPage() {
  const { rooms, bookings } = useBooking();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');

  const activeRooms = rooms.filter((r) => r.is_active);

  // Filter bookings by selected room
  const filteredBookings = bookings.filter((b) => {
    if (b.status !== 'confirmed') return false;
    if (selectedRoomId !== 'all' && b.room_id !== selectedRoomId) return false;
    return true;
  });

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'day') setCurrentDate((d) => subDays(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => subDays(d, 7));
    else setCurrentDate((d) => subMonths(d, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate((d) => addDays(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => addDays(d, 7));
    else setCurrentDate((d) => addMonths(d, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Week Days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Month Days
  const monthStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const monthEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter((b) => isSameDay(new Date(b.start_time), day));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            ปฏิทินตารางการจองห้องประชุม
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ตรวจสอบตารางการใช้งานห้องประชุมแบบเรียลไทม์
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Room Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              aria-label="เลือกห้องประชุม"
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">ห้องประชุมทั้งหมด</option>
              {activeRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Book Action */}
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>จองห้อง</span>
          </Link>
        </div>
      </div>

      {/* Calendar Controls & View Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="ย้อนกลับ"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            วันนี้
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="ถัดไป"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="text-base sm:text-lg font-bold text-slate-800 ml-2">
            {viewMode === 'month'
              ? formatThaiDate(currentDate, false).split(' ').slice(1).join(' ')
              : viewMode === 'week'
              ? `${formatThaiDate(weekStart)} - ${formatThaiDate(weekEnd)}`
              : formatThaiDate(currentDate, false)}
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'day' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายวัน
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'week' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายสัปดาห์
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'month' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายเดือน
          </button>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* ================= WEEK VIEW ================= */}
        {viewMode === 'week' && (
          <div className="divide-y divide-slate-200">
            {/* Week Headers */}
            <div className="grid grid-cols-7 bg-slate-50 text-center py-3 text-xs font-bold text-slate-600 border-b border-slate-200">
              {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((dayName, idx) => (
                <div key={idx}>{dayName}</div>
              ))}
            </div>

            {/* Week Columns */}
            <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[480px]">
              {weekDays.map((day, idx) => {
                const dayBookings = getBookingsForDay(day);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={idx}
                    className={`p-3 flex flex-col ${
                      isCurrentDay ? 'bg-blue-50/30' : 'bg-white'
                    }`}
                  >
                    {/* Day number header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <span className="text-xs md:hidden font-bold text-slate-500">
                        {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'][idx]}
                      </span>
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isCurrentDay
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </div>

                    {/* Bookings cards */}
                    <div className="space-y-2 flex-1">
                      {dayBookings.length === 0 ? (
                        <div className="text-[11px] text-slate-400 text-center py-4">
                          ไม่มีการจอง
                        </div>
                      ) : (
                        dayBookings.map((b) => (
                          <div
                            key={b.id}
                            className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs shadow-xs hover:border-blue-400 transition-colors"
                          >
                            <div className="font-bold line-clamp-1">{b.title}</div>
                            <div className="text-[11px] text-blue-700 font-medium mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span>{formatTimeRange(b.start_time, b.end_time)}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                              🏢 {b.rooms?.name || 'ห้องประชุม'}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                              👤 {b.profiles?.full_name || 'ผู้ใช้งาน'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= DAY VIEW ================= */}
        {viewMode === 'day' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                ตารางนัดหมายวันที่ {formatThaiDate(currentDate, false)}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                ทั้งหมด {getBookingsForDay(currentDate).length} รายการ
              </span>
            </div>

            {getBookingsForDay(currentDate).length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                ไม่มีรายการจองห้องประชุมในวันนี้
              </div>
            ) : (
              <div className="space-y-3">
                {getBookingsForDay(currentDate).map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                          {formatTimeRange(b.start_time, b.end_time)}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          🏢 {b.rooms?.name}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{b.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        ผู้จอง: <span className="font-semibold text-slate-800">{b.profiles?.full_name}</span> ({b.profiles?.department})
                      </p>
                      {b.description && (
                        <p className="text-xs text-slate-500 mt-1">{b.description}</p>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-4 sm:text-right">
                      <div>
                        <div>ผู้เข้าร่วม</div>
                        <div className="font-bold text-slate-700">{b.participant_count} ท่าน</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= MONTH VIEW ================= */}
        {viewMode === 'month' && (
          <div>
            <div className="grid grid-cols-7 bg-slate-50 text-center py-3 text-xs font-bold text-slate-600 border-b border-slate-200">
              {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((dayName, idx) => (
                <div key={idx}>{dayName}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
              {monthDays.map((day, idx) => {
                const dayBookings = getBookingsForDay(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-2 flex flex-col justify-between ${
                      !isCurrentMonth
                        ? 'bg-slate-50/40 text-slate-300'
                        : isCurrentDay
                        ? 'bg-blue-50/40'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isCurrentDay
                            ? 'bg-blue-600 text-white'
                            : isCurrentMonth
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1 mt-1">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div
                          key={b.id}
                          className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold truncate"
                          title={`${b.title} (${formatTimeRange(b.start_time, b.end_time)})`}
                        >
                          {format(new Date(b.start_time), 'HH:mm')} {b.title}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-[10px] text-slate-400 text-center">
                          +{dayBookings.length - 2} รายการ
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
