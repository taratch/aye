'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { Booking } from '@/types/database.types';
import { formatThaiDate, formatTimeRange } from '@/lib/utils';
import { 
  Clock, 
  Calendar, 
  Building2, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Bell, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function MyBookingsPage() {
  const { bookings, notifications, cancelBooking, markNotificationAsRead, markAllNotificationsAsRead } = useBooking();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'notifications'>('upcoming');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;

    const result = cancelBooking(cancelModalBooking.id);
    if (result.success) {
      setFeedbackMsg({ type: 'success', text: result.message });
      setCancelModalBooking(null);
    } else {
      setFeedbackMsg({ type: 'error', text: result.message });
    }
  };

  const nowIso = new Date().toISOString();
  const upcomingBookings = bookings.filter((b) => b.end_time >= nowIso && b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.end_time < nowIso || b.status !== 'confirmed');
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            รายการจองห้องประชุม
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            จัดการและตรวจสอบประวัติการจองห้องประชุมทั้งหมดในระบบ
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Building2 className="w-4 h-4" />
          <span>จองห้องประชุมใหม่</span>
        </Link>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-semibold hover:underline"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'upcoming'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>การจองที่กำลังจะถึง ({upcomingBookings.length})</span>
          {activeTab === 'upcoming' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'past'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>ประวัติการจอง ({pastBookings.length})</span>
          {activeTab === 'past' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-sm font-semibold relative transition-colors flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>การแจ้งเตือน</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
              {unreadCount}
            </span>
          )}
          {activeTab === 'notifications' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'upcoming' ? (
        /* UPCOMING BOOKINGS */
        upcomingBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">ไม่มีรายการจองที่กำลังจะมาถึง</h3>
            <p className="text-sm text-slate-500 mt-1">คุณสามารถเลือกห้องและจองการประชุมล่วงหน้าได้ทันที</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100"
            >
              <span>ไปที่หน้ารายการห้อง</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ยืนยันแล้ว
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {formatThaiDate(b.start_time)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-1">
                    {b.title}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-600 mt-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-slate-800">{b.rooms?.name || 'ห้องประชุม'}</span>
                      <span className="text-slate-400">({b.rooms?.location})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{formatTimeRange(b.start_time, b.end_time)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>ผู้จอง: <span className="font-semibold text-slate-800">{b.profiles?.full_name || 'ผู้ใช้งาน'}</span> ({b.profiles?.department || '-'}) • {b.participant_count} ท่าน</span>
                    </div>
                  </div>

                  {b.description && (
                    <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                      {b.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => setCancelModalBooking(b)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ยกเลิกการจอง</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'past' ? (
        /* PAST BOOKINGS */
        pastBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 text-sm">
            ไม่มีประวัติการจองเดิม
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">หัวข้อการประชุม</th>
                    <th className="py-3.5 px-4">ห้องประชุม</th>
                    <th className="py-3.5 px-4">ผู้จอง</th>
                    <th className="py-3.5 px-4">วันที่ & เวลา</th>
                    <th className="py-3.5 px-4">จำนวนคน</th>
                    <th className="py-3.5 px-4">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {b.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {b.rooms?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {b.profiles?.full_name || 'ผู้ใช้งาน'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{formatThaiDate(b.start_time)}</div>
                        <div className="text-xs text-slate-400">{formatTimeRange(b.start_time, b.end_time)}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {b.participant_count} ท่าน
                      </td>
                      <td className="py-3 px-4">
                        {b.status === 'cancelled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700">
                            <XCircle className="w-3.5 h-3.5" />
                            ยกเลิกแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            เสร็จสิ้นแล้ว
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* NOTIFICATIONS TAB */
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500">
              การแจ้งเตือนทั้งหมด ({notifications.length})
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 text-sm">
              ไม่มีการแจ้งเตือนในขณะนี้
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markNotificationAsRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    !n.is_read
                      ? 'bg-blue-50/60 border-blue-200'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-xl flex-shrink-0 ${!n.is_read ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[11px] text-slate-400">
                        {formatThaiDate(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Cancellation */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              ยืนยันการยกเลิกการจองห้องประชุม?
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              คุณต้องการยกเลิกการจอง <span className="font-semibold text-slate-800">"{cancelModalBooking.title}"</span> ในวันที่ <span className="font-semibold text-slate-800">{formatThaiDate(cancelModalBooking.start_time)}</span> ใช่หรือไม่? เมื่อยกเลิกแล้วห้องนี้จะเปิดให้ผู้อื่นสามารถจองได้ทันที
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันยกเลิกการจอง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
