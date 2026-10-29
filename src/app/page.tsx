'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Sparkles, 
  Search, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function HomePage() {
  const { rooms } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');
  const [amenityFilter, setAmenityFilter] = useState<string>('all');

  const activeRooms = rooms.filter((r) => r.is_active);

  const filteredRooms = activeRooms.filter((room) => {
    // Search filter
    const matchesSearch = 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Capacity filter
    let matchesCapacity = true;
    if (capacityFilter === 'small') matchesCapacity = room.capacity <= 6;
    else if (capacityFilter === 'medium') matchesCapacity = room.capacity > 6 && room.capacity <= 12;
    else if (capacityFilter === 'large') matchesCapacity = room.capacity > 12;

    // Amenity filter
    let matchesAmenity = true;
    if (amenityFilter !== 'all') {
      matchesAmenity = room.amenities.some((a) => a.toLowerCase().includes(amenityFilter.toLowerCase()));
    }

    return matchesSearch && matchesCapacity && matchesAmenity;
  });

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Smart Meeting Room System (พร้อมใช้งานทันที)
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              จองห้องประชุมออนไลน์ <br />
              <span className="text-blue-300">สะดวกรวดเร็ว ตรวจสอบได้ทันที</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-2xl">
              เลือกห้องประชุมที่ตรงกับความต้องการของทีม พร้อมระบบตรวจสอบห้องว่างและป้องกันการจองซ้อนแบบ Real-time รองรับอุปกรณ์และสิ่งอำนวยความสะดวกครบครัน
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/calendar"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-800 font-bold text-sm shadow-lg shadow-blue-900/30 hover:bg-blue-50 transition-all"
              >
                <Calendar className="w-4 h-4 text-blue-700" />
                ดูปฏิทินตารางห้องว่าง
              </Link>
              <Link
                href="/my-bookings"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600/40 border border-blue-400/30 text-white font-medium text-sm hover:bg-blue-600/60 transition-all backdrop-blur-sm"
              >
                <Clock className="w-4 h-4" />
                ดูรายการจองของฉัน
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อห้อง, ชั้น, หรืออาคาร..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Capacity Filter */}
            <div className="md:col-span-3">
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                aria-label="ตัวกรองขนาดความจุ"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="all">ขนาดความจุทั้งหมด</option>
                <option value="small">ห้องขนาดเล็ก (1 - 6 คน)</option>
                <option value="medium">ห้องขนาดกลาง (7 - 12 คน)</option>
                <option value="large">ห้องขนาดใหญ่ (13 คนขึ้นไป)</option>
              </select>
            </div>

            {/* Amenity Filter */}
            <div className="md:col-span-3">
              <select
                value={amenityFilter}
                onChange={(e) => setAmenityFilter(e.target.value)}
                aria-label="ตัวกรองอุปกรณ์ในห้อง"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="all">อุปกรณ์ทั้งหมด</option>
                <option value="Video Conference">ระบบ Video Conference</option>
                <option value="ทีวี">สมาร์ททีวี / หน้าจอ</option>
                <option value="ไวท์บอร์ด">ไวท์บอร์ด</option>
                <option value="ไมโครโฟน">ไมโครโฟน</option>
              </select>
            </div>

            {/* Result count */}
            <div className="md:col-span-1 text-right text-xs font-semibold text-slate-500">
              {filteredRooms.length} ห้อง
            </div>
          </div>
        </div>

        {/* Room Grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>รายการห้องประชุมที่พร้อมให้บริการ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
              ว่าง {filteredRooms.length}
            </span>
          </h2>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <SlidersHorizontal className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">ไม่พบห้องประชุมที่ตรงกับเงื่อนไขการค้นหา</h3>
            <p className="text-sm text-slate-500 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองความจุเพื่อค้นหาห้องอื่น</p>
            <button
              onClick={() => { setSearchTerm(''); setCapacityFilter('all'); setAmenityFilter('all'); }}
              className="mt-4 px-4 py-2 text-sm text-blue-600 bg-blue-50 font-semibold rounded-lg hover:bg-blue-100"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Room Image & Badges */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={room.image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      พร้อมใช้งาน
                    </span>
                  </div>

                  {/* Capacity Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-sm">
                      <Users className="w-3.5 h-3.5" />
                      รองรับ {room.capacity} ที่นั่ง
                    </span>
                  </div>

                  {/* Room Location Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1.5 text-xs text-blue-200 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{room.location}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white drop-shadow-sm leading-snug">
                      {room.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                    {room.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                  </p>

                  {/* Amenities Tags */}
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      สิ่งอำนวยความสะดวก:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {room.amenities.slice(0, 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-500 font-medium">
                          +{room.amenities.length - 4} เพิ่มเติม
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>จองได้ทันที</span>
                    </div>

                    <Link
                      href={`/book?roomId=${room.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 group-hover:translate-x-0.5 transition-all"
                    >
                      <span>จองห้องนี้</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
