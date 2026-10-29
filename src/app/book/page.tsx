'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { formatThaiDate, formatTimeRange } from '@/lib/utils';
import { 
  Building2, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  User,
  Briefcase,
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00"
];

function BookRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get('roomId') || '';

  const { rooms, bookings, currentUser, checkAvailability, bookRoom } = useBooking();

  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId);
  const [bookerName, setBookerName] = useState(currentUser.name || '');
  const [bookerDepartment, setBookerDepartment] = useState(currentUser.department || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [participantCount, setParticipantCount] = useState<number>(4);

  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Set default selected room if not present
  useEffect(() => {
    if (!selectedRoomId && rooms.length > 0) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  const currentRoom = rooms.find((r) => r.id === selectedRoomId);

  // Real-time Anti-Overlap Pre-check
  useEffect(() => {
    if (!selectedRoomId || !date || !startTime || !endTime) return;

    if (startTime >= endTime) {
      setConflictWarning('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      return;
    }

    const startIso = `${date}T${startTime}:00+07:00`;
    const endIso = `${date}T${endTime}:00+07:00`;

    const isAvailable = checkAvailability(selectedRoomId, startIso, endIso);

    if (!isAvailable) {
      // Find the conflicting booking to show its details
      const s1 = new Date(startIso).getTime();
      const e1 = new Date(endIso).getTime();
      const conflict = bookings.find((b) => {
        if (b.status !== 'confirmed' || b.room_id !== selectedRoomId) return false;
        const s2 = new Date(b.start_time).getTime();
        const e2 = new Date(b.end_time).getTime();
        return s1 < e2 && e1 > s2;
      });

      if (conflict) {
        setConflictWarning(
          `ช่วงเวลานี้ชนกับ "${conflict.title}" (${formatTimeRange(conflict.start_time, conflict.end_time)}) กรุณาเลือกช่วงเวลาอื่น`
        );
      } else {
        setConflictWarning('ช่วงเวลานี้มีการจองห้องประชุมแล้ว');
      }
    } else {
      setConflictWarning(null);
    }
  }, [selectedRoomId, date, startTime, endTime, bookings, checkAvailability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (startTime >= endTime) {
      setErrorMsg('เวลาเริ่มการประชุมต้องมาก่อนเวลาสิ้นสุด');
      return;
    }

    if (currentRoom && participantCount > currentRoom.capacity) {
      setErrorMsg(`จำนวนผู้เข้าร่วมเกินความจุของห้อง (สูงสุด ${currentRoom.capacity} ท่าน)`);
      return;
    }

    const startIso = `${date}T${startTime}:00+07:00`;
    const endIso = `${date}T${endTime}:00+07:00`;

    const result = bookRoom({
      roomId: selectedRoomId,
      title,
      description,
      startIso,
      endIso,
      participantCount: Number(participantCount),
      bookerName,
      bookerDepartment,
    });

    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/my-bookings');
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 sm:px-8 py-6 text-white">
        <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          แบบฟอร์มการจองห้องประชุมออนไลน์
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          กรอกรายละเอียดการจองห้องประชุม
        </h1>
        <p className="text-sm text-blue-100 mt-1">
          ระบุชื่อผู้จอง หัวข้อ และช่วงเวลา ระบบจะตรวจสอบห้องว่างให้ทันที
        </p>
      </div>

      {/* Form Body */}
      <div className="p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">ไม่สามารถทำรายการได้</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">จองห้องประชุมสำเร็จ!</p>
              <p>ระบบกำลังนำท่านไปยังหน้ารายการจองห้องประชุม...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Booker Information */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <User className="w-4 h-4 text-blue-600" />
              <span>ข้อมูลผู้จองห้องประชุม</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล ผู้จอง <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  placeholder="เช่น คุณสมชาย มั่นคง"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  แผนก / ฝ่าย <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bookerDepartment}
                  onChange={(e) => setBookerDepartment(e.target.value)}
                  placeholder="เช่น ฝ่ายพัฒนาธุรกิจ, ฝ่ายบุคคล"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Select Room */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              เลือกห้องประชุม <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      <img
                        src={room.image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80'}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {room.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>ความจุ {room.capacity} ที่นั่ง</span>
                        <span>•</span>
                        <span>{room.location}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Meeting Title & Participant Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                หัวข้อการประชุม <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ประชุมวางแผนแคมเปญประจำเดือน"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                จำนวนผู้เข้าร่วม (ท่าน) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={currentRoom ? currentRoom.capacity : 50}
                  required
                  value={participantCount}
                  onChange={(e) => setParticipantCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                {currentRoom && (
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">
                    สูงสุด {currentRoom.capacity} ท่าน
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4. Date & Time Selection (Realtime Overlap Check) */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>กำหนดวันและเวลา (เขตเวลาประเทศไทย Asia/Bangkok)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Date Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  วันที่จัดประชุม
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  เวลาเริ่มต้น
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  aria-label="เวลาเริ่มต้น"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_SLOTS.slice(0, -1).map((t) => (
                    <option key={t} value={t}>{t} น.</option>
                  ))}
                </select>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  เวลาสิ้นสุด
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  aria-label="เวลาสิ้นสุด"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_SLOTS.filter((t) => t > startTime).map((t) => (
                    <option key={t} value={t}>{t} น.</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Overlap Status Badge */}
            {conflictWarning ? (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                <span>{conflictWarning}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>ห้องว่างพร้อมใช้งานในช่วงเวลาที่เลือก</span>
              </div>
            )}
          </div>

          {/* 5. Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              รายละเอียดเพิ่มเติมหรืออุปกรณ์ที่ต้องการ (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น เตรียมสายพ่วง HDMI, ปลั๊กไฟเพิ่มเติม..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm text-center hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={Boolean(conflictWarning)}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันการจองห้องประชุม</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookRoomPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับหน้ารายการห้อง</span>
      </Link>
      <Suspense fallback={<div className="p-12 text-center text-slate-400">กำลังโหลดแบบฟอร์ม...</div>}>
        <BookRoomForm />
      </Suspense>
    </div>
  );
}
