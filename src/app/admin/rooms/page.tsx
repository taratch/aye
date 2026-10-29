'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { Room } from '@/types/database.types';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Power, 
  X,
  AlertCircle
} from 'lucide-react';

export default function AdminRoomsPage() {
  const { rooms, addRoom, updateRoom, toggleRoomActive } = useBooking();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number>(10);
  const [location, setLocation] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setName('');
    setDescription('');
    setCapacity(10);
    setLocation('');
    setAmenitiesInput('');
    setImageUrl('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setDescription(room.description || '');
    setCapacity(room.capacity);
    setLocation(room.location);
    setAmenitiesInput(room.amenities.join(', '));
    setImageUrl(room.image_url || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const amenitiesArray = amenitiesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      if (editingRoom) {
        updateRoom({
          ...editingRoom,
          name,
          description: description || null,
          capacity: Number(capacity),
          location,
          amenities: amenitiesArray,
          image_url: imageUrl || null,
        });
        setSuccessMsg('แก้ไขข้อมูลห้องประชุมเรียบร้อยแล้ว');
      } else {
        addRoom({
          name,
          description: description || null,
          capacity: Number(capacity),
          location,
          amenities: amenitiesArray,
          image_url: imageUrl || null,
          is_active: true,
        });
        setSuccessMsg('เพิ่มห้องประชุมใหม่เรียบร้อยแล้ว');
      }

      setModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            จัดการห้องประชุม (Admin)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            เพิ่ม แก้ไข และกำหนดสถานะเปิด/ปิดการให้บริการของห้องประชุม
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มห้องประชุมใหม่</span>
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">รูปภาพ & ชื่อห้องประชุม</th>
                <th className="py-3.5 px-4">สถานที่</th>
                <th className="py-3.5 px-4">ความจุ</th>
                <th className="py-3.5 px-4">สิ่งอำนวยความสะดวก</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {room.image_url ? (
                          <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 leading-snug">{room.name}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{room.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{room.location}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{room.capacity} ท่าน</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {room.amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
                          {a}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-[11px] text-slate-400">+{room.amenities.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleRoomActive(room.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        room.is_active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{room.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(room)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="แก้ไขข้อมูลห้อง"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {editingRoom ? 'แก้ไขข้อมูลห้องประชุม' : 'เพิ่มห้องประชุมใหม่'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อห้องประชุม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น ห้องประชุมนวัตกรรม (Innovation Lab)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ความจุที่นั่ง (ท่าน) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานที่ / อาคาร / ชั้น <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="อาคาร C ชั้น 4"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สิ่งอำนวยความสะดวก (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  placeholder="เช่น จอสัมผัส, ไวท์บอร์ด, ระบบ VC, Wi-Fi"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL รูปภาพห้องประชุม (Optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="คำอธิบายลักษณะห้องและเงื่อนไขการใช้งาน..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
