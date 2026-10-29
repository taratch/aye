'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { formatThaiDate, formatThaiTime, formatTimeRange } from '@/lib/utils';
import { 
  FileSpreadsheet, 
  Download, 
  Filter
} from 'lucide-react';
import { differenceInMinutes, parseISO } from 'date-fns';

export default function AdminReportsPage() {
  const { rooms, bookings } = useBooking();

  // Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of this month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedRoomId, setSelectedRoomId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const bDate = b.start_time.split('T')[0];
    const matchesDate = bDate >= startDate && bDate <= endDate;
    const matchesRoom = selectedRoomId === 'all' || b.room_id === selectedRoomId;
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;

    return matchesDate && matchesRoom && matchesStatus;
  });

  // Calculate Metrics
  const totalBookingsCount = filteredBookings.length;
  const confirmedCount = filteredBookings.filter((b) => b.status === 'confirmed').length;
  const cancelledCount = filteredBookings.filter((b) => b.status === 'cancelled').length;

  const totalMinutes = filteredBookings
    .filter((b) => b.status === 'confirmed')
    .reduce((acc, curr) => {
      const mins = differenceInMinutes(parseISO(curr.end_time), parseISO(curr.start_time));
      return acc + (mins > 0 ? mins : 0);
    }, 0);

  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalParticipants = filteredBookings.reduce((acc, curr) => acc + curr.participant_count, 0);

  // CSV Export with UTF-8 BOM for Microsoft Excel Compatibility
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก CSV');
      return;
    }

    const headers = [
      'ลำดับ',
      'รหัสการจอง',
      'วันที่',
      'เวลาเริ่ม',
      'เวลาสิ้นสุด',
      'ระยะเวลา (นาที)',
      'ห้องประชุม',
      'สถานที่',
      'หัวข้อการประชุม',
      'ชื่อผู้จอง',
      'แผนก/ฝ่าย',
      'จำนวนผู้เข้าร่วม (คน)',
      'สถานะการจอง',
      'วันที่ทำรายการ'
    ];

    const rows = filteredBookings.map((b, index) => {
      const s = parseISO(b.start_time);
      const e = parseISO(b.end_time);
      const durationMins = differenceInMinutes(e, s);

      return [
        index + 1,
        `"${b.id}"`,
        `"${formatThaiDate(b.start_time)}"`,
        `"${formatThaiTime(b.start_time)}"`,
        `"${formatThaiTime(b.end_time)}"`,
        durationMins,
        `"${(b.rooms?.name || '').replace(/"/g, '""')}"`,
        `"${(b.rooms?.location || '').replace(/"/g, '""')}"`,
        `"${b.title.replace(/"/g, '""')}"`,
        `"${(b.profiles?.full_name || 'ผู้ใช้งาน').replace(/"/g, '""')}"`,
        `"${(b.profiles?.department || '').replace(/"/g, '""')}"`,
        b.participant_count,
        b.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว',
        `"${formatThaiDate(b.created_at)}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\r\n');

    // UTF-8 BOM prefix (\uFEFF)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานการจองห้องประชุม_${startDate}_ถึง_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            รายงานการใช้งานห้องประชุม
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            สรุปข้อมูลสถิติการใช้งาน กรองตามช่วงวันที่ และส่งออกไฟล์ CSV
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredBookings.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>ส่งออกรายงานเป็น CSV</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 mb-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>กำหนดเงื่อนไขการค้นหาและรายงาน</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ตั้งแต่วันที่
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ถึงวันที่
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Room Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ห้องประชุม
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              aria-label="ตัวกรองห้องประชุม"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ห้องประชุมทั้งหมด</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              สถานะการจอง
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="ตัวกรองสถานะ"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="confirmed">ยืนยันแล้ว (Confirmed)</option>
              <option value="cancelled">ยกเลิกแล้ว (Cancelled)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">รายการจองตามเงื่อนไข</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalBookingsCount} ครั้ง</div>
          <div className="text-xs text-slate-500 mt-1">
            ยืนยัน {confirmedCount} / ยกเลิก {cancelledCount}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">เวลารวมที่ใช้งาน</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">{totalHours} ชม.</div>
          <div className="text-xs text-slate-500 mt-1">
            รวม {totalMinutes.toLocaleString()} นาที
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">ผู้เข้าร่วมประชุมรวม</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">{totalParticipants} ท่าน</div>
          <div className="text-xs text-slate-500 mt-1">
            เฉลี่ย {(totalBookingsCount > 0 ? totalParticipants / totalBookingsCount : 0).toFixed(1)} ท่าน/ครั้ง
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">สถานะความสำเร็จ</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {totalBookingsCount > 0 ? ((confirmedCount / totalBookingsCount) * 100).toFixed(0) : 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            อัตราการใช้งานที่ไม่ถูกยกเลิก
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            รายละเอียดข้อมูลการจอง ({filteredBookings.length} รายการ)
          </h3>
          <span className="text-xs text-slate-400">
            รองรับการส่งออกภาษาไทย UTF-8 BOM สำหรับ Microsoft Excel
          </span>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            ไม่พบข้อมูลการจองที่ตรงกับช่วงเวลาหรือเงื่อนไขที่เลือก
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">วันที่</th>
                  <th className="py-3 px-4">เวลา</th>
                  <th className="py-3 px-4">ห้องประชุม</th>
                  <th className="py-3 px-4">หัวข้อการประชุม</th>
                  <th className="py-3 px-4">ผู้จอง & แผนก</th>
                  <th className="py-3 px-4 text-center">คน</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {formatThaiDate(b.start_time)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatTimeRange(b.start_time, b.end_time)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {b.rooms?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold">
                      {b.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{b.profiles?.full_name || 'ผู้ใช้งาน'}</div>
                      <div className="text-[10px] text-slate-400">{b.profiles?.department || '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 font-semibold">
                      {b.participant_count}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {b.status === 'confirmed' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          ยืนยันแล้ว
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                          ยกเลิกแล้ว
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
