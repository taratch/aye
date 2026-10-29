'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { Booking } from '@/types/database.types';
import { formatThaiDate, formatTimeRange } from '@/lib/utils';
import { 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert
} from 'lucide-react';

export default function AdminBookingsPage() {
  const { bookings, cancelBooking } = useBooking();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  const handleAdminCancel = () => {
    if (!cancelModalBooking) return;
    cancelBooking(cancelModalBooking.id);
    setCancelModalBooking(null);
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.rooms?.name && b.rooms.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.profiles?.full_name && b.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            จัดการรายการจองทั้งหมด (Admin)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ตรวจสอบ ค้นหา และยกเลิกรายการจองของพนักงานในระบบ
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อการประชุม, ห้อง, หรือผู้จอง..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="ตัวกรองสถานะการจอง"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="confirmed">ยืนยันแล้ว (Confirmed)</option>
            <option value="cancelled">ยกเลิกแล้ว (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">หัวข้อการประชุม</th>
                <th className="py-3.5 px-4">ห้องประชุม</th>
                <th className="py-3.5 px-4">ผู้จอง & แผนก</th>
                <th className="py-3.5 px-4">วันและเวลา</th>
                <th className="py-3.5 px-4">ผู้เข้าร่วม</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    <div>{b.title}</div>
                    {b.description && (
                      <div className="text-xs text-slate-400 font-normal line-clamp-1">{b.description}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {b.rooms?.name || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-semibold text-slate-800">{b.profiles?.full_name || 'ผู้ใช้งาน'}</div>
                    <div className="text-xs text-slate-400">{b.profiles?.department || '-'}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{formatThaiDate(b.start_time)}</div>
                    <div className="text-xs text-slate-400">{formatTimeRange(b.start_time, b.end_time)}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {b.participant_count} ท่าน
                  </td>
                  <td className="py-3 px-4 text-center">
                    {b.status === 'confirmed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ยืนยันแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                        <XCircle className="w-3.5 h-3.5" />
                        ยกเลิกแล้ว
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ยกเลิก</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              ยกเลิกการจองในฐานะผู้ดูแลระบบ?
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              คุณต้องการยกเลิกการจอง "{cancelModalBooking.title}" ของคุณ {cancelModalBooking.profiles?.full_name} หรือไม่? ระบบจะบันทึกสถานะการยกเลิกทันที
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                ปิด
              </button>
              <button
                onClick={handleAdminCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-500/20"
              >
                ยืนยันยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
