'use client';

import React from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { formatThaiDate, formatTimeRange } from '@/lib/utils';
import { 
  Building2, 
  Users, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Layers, 
  FileSpreadsheet, 
  ArrowUpRight
} from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

export default function AdminDashboardPage() {
  const { rooms, bookings, isAdminMode, setIsAdminMode } = useBooking();

  const now = new Date();
  const nowIso = now.toISOString();

  // Metrics Calculation
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter((r) => r.is_active).length;

  // Currently In-Use Rooms
  const inUseBookings = bookings.filter(
    (b) => b.status === 'confirmed' && b.start_time <= nowIso && b.end_time >= nowIso
  );
  const inUseCount = inUseBookings.length;

  // Today's Bookings
  const todayBookings = bookings.filter(
    (b) => b.status === 'confirmed' && isToday(parseISO(b.start_time))
  );

  // Popular Rooms
  const roomUsageMap: { [key: string]: { name: string; count: number } } = {};
  rooms.forEach((r) => {
    roomUsageMap[r.id] = { name: r.name, count: 0 };
  });
  bookings.forEach((b) => {
    if (b.status === 'confirmed' && roomUsageMap[b.room_id]) {
      roomUsageMap[b.room_id].count += 1;
    }
  });
  const popularRooms = Object.values(roomUsageMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Executive Admin Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            แดชบอร์ดภาพรวมการใช้งาน
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            สรุปข้อมูลสถิติห้องประชุม รายการจองวันนี้ และสถานะการใช้งานแบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>รายงาน & CSV</span>
          </Link>
          <Link
            href="/admin/rooms"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>จัดการห้อง</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Rooms */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ห้องประชุมทั้งหมด
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {totalRooms}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              พร้อมบริการ <span className="font-semibold text-emerald-600">{activeRooms}</span> ห้อง
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Currently In Use */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              กำลังใช้งานขณะนี้
            </div>
            <div className="text-3xl font-extrabold text-amber-600 mt-2">
              {inUseCount}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{inUseCount > 0 ? 'มีการประชุมดำเนินการอยู่' : 'ห้องประชุมว่างทั้งหมด'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Today's Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              การจองวันนี้
            </div>
            <div className="text-3xl font-extrabold text-indigo-600 mt-2">
              {todayBookings.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              นัดหมายตลอดทั้งวัน
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              การจองสะสมทั้งหมด
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">
              {bookings.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              ยืนยันแล้ว {bookings.filter((b) => b.status === 'confirmed').length} รายการ
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Popular Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ตารางนัดหมายการประชุมวันนี้
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatThaiDate(now, false)}
              </p>
            </div>

            <Link
              href="/calendar"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>เปิดปฏิทินเต็ม</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              ไม่มีการประชุมในวันนี้ ห้องประชุมว่างพร้อมใช้งาน
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((b) => {
                const isNow = b.start_time <= nowIso && b.end_time >= nowIso;
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isNow
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                            isNow
                              ? 'bg-amber-200 text-amber-900 animate-pulse'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isNow ? 'กำลังประชุม' : formatTimeRange(b.start_time, b.end_time)}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {b.rooms?.name}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {b.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ผู้จอง: <span className="font-semibold text-slate-800">{b.profiles?.full_name}</span> ({b.profiles?.department})
                      </p>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 sm:text-right">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.participant_count} ท่าน</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Room Popularity & Quick Links (1 col) */}
        <div className="space-y-6">
          {/* Popular Rooms Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              ห้องประชุมยอดนิยม (สถิติการจอง)
            </h3>

            <div className="space-y-3">
              {popularRooms.map((room, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {room.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex-shrink-0">
                    {room.count} ครั้ง
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-base font-bold mb-2">
              ศูนย์ควบคุมผู้ดูแลระบบ
            </h3>
            <p className="text-xs text-indigo-200 leading-relaxed mb-4">
              ควบคุมการใช้งาน ดูแลตารางการจอง และออกรายงานสรุปสำหรับฝ่ายบริหาร
            </p>

            <div className="space-y-2">
              <Link
                href="/admin/rooms"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
              >
                <span>จัดการห้องประชุม (เพิ่ม/แก้ไข)</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-300" />
              </Link>
              <Link
                href="/admin/bookings"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
              >
                <span>จัดการและยกเลิกรายการจอง</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-300" />
              </Link>
              <Link
                href="/admin/reports"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
              >
                <span>ส่งออกรายงานเป็น CSV</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
