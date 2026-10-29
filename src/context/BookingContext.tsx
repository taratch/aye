'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Booking, Notification } from '@/types/database.types';
import { formatThaiDate } from '@/lib/utils';

// ==========================================
// SEED DATA
// ==========================================
const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'ห้องประชุมเพชรไพลิน (Executive Boardroom)',
    description: 'ห้องประชุมผู้บริหารขนาดใหญ่ พร้อมโต๊ะประชุมไม้สักและระบบ Video Conference ความละเอียดสูง 4K สำหรับการประชุมระดับบอร์ดบริหารหรือต้อนรับลูกค้าระดับ VIP',
    capacity: 20,
    location: 'อาคาร A ชั้น 5',
    amenities: ['จอสัมผัสอัจฉริยะ 85 นิ้ว', 'ระบบ Video Conference 4K', 'ไมโครโฟนตั้งโต๊ะรายบุคคล', 'ระบบตัดเสียงรบกวน', 'ไวท์บอร์ดอิเล็กทรอนิกส์', 'Wi-Fi ความเร็วสูง'],
    image_url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'room-2',
    name: 'ห้องประชุมมรกต (Smart Meeting Room A)',
    description: 'ห้องประชุมขนาดกลาง เหมาะสำหรับการประชุมทีม การนำเสนอผลงาน หรือการประชุมวางแผนงานประจำสัปดาห์',
    capacity: 12,
    location: 'อาคาร A ชั้น 3',
    amenities: ['สมาร์ททีวี 65 นิ้ว', 'กล้อง Web Conference', 'กระดานไวท์บอร์ดแม่เหล็ก', 'ปลั๊กไฟและพอร์ตชาร์จหัวโต๊ะ', 'Wi-Fi'],
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'room-3',
    name: 'ห้องประชุมทับทิม (Brainstorming Room)',
    description: 'ห้องประชุมระดมความคิด บรรยากาศสบาย โซฟานุ่ม มีผนังกระจกสำหรับเขียนไอเดียและการออกแบบร่วมกันอย่างสร้างสรรค์',
    capacity: 8,
    location: 'อาคาร B ชั้น 2',
    amenities: ['หน้าจอดิจิทัล 55 นิ้ว', 'ผนังกระจกเขียนได้รอบทิศ', 'โซฟาปรับระดับได้', 'โพสต์อิทและอุปกรณ์เวิร์กช็อป', 'ลำโพงบลูทูธ'],
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'room-4',
    name: 'ห้องประชุมบุษราคัม (Focus & Interview Room)',
    description: 'ห้องประชุมขนาดกะทัดรัด เหมาะสำหรับการสัมภาษณ์งาน การประชุมแบบตัวต่อตัว (1-on-1) หรือการโทรคุยงานส่วนตัวที่ต้องการความเงียบสงบ',
    capacity: 4,
    location: 'อาคาร B ชั้น 2',
    amenities: ['จอคอมพิวเตอร์ต่อพ่วง Type-C/HDMI', 'กระจกฉนวนกันเสียงสองชั้น', 'เก้าอี้ Ergonomic เพื่อสุขภาพ', 'Wi-Fi'],
    image_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const getSampleBookings = (): Booking[] => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${yyyy}-${mm}-${dd}`;

  return [
    {
      id: 'book-1',
      room_id: 'room-1',
      user_id: 'user-default',
      title: 'ประชุมคณะกรรมการบริหารประจำไตรมาส',
      description: 'สรุปผลประกอบการและวางแผนกลยุทธ์ทางธุรกิจสำหรับปีหน้า',
      start_time: `${datePrefix}T09:30:00+07:00`,
      end_time: `${datePrefix}T11:30:00+07:00`,
      participant_count: 15,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'user-default',
        email: 'somchai@company.com',
        full_name: 'คุณสมชาย มั่นคง',
        department: 'ฝ่ายบริหารจัดการ',
        role: 'user',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    {
      id: 'book-2',
      room_id: 'room-2',
      user_id: 'user-2',
      title: 'Sprint Planning ประจำสัปดาห์ (Dev Team)',
      description: 'วางแผนงานพัฒนาฟีเจอร์และทบทวนความคืบหน้าระบบ',
      start_time: `${datePrefix}T13:30:00+07:00`,
      end_time: `${datePrefix}T15:00:00+07:00`,
      participant_count: 8,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'user-2',
        email: 'nattawut@company.com',
        full_name: 'ณัฐวุฒิ นวัตกรรม',
        department: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)',
        role: 'user',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    {
      id: 'book-3',
      room_id: 'room-3',
      user_id: 'user-3',
      title: 'Brainstorm ไอเดียแคมเปญการตลาดปีใหม่',
      description: 'ระดมความคิดและจัดเตรียม Concept Art สำหรับเปิดตัวสินค้าใหม่',
      start_time: `${datePrefix}T15:30:00+07:00`,
      end_time: `${datePrefix}T17:00:00+07:00`,
      participant_count: 6,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'user-3',
        email: 'wipha@company.com',
        full_name: 'วิภา พัฒนาการ',
        department: 'ฝ่ายการตลาดและประชาสัมพันธ์',
        role: 'user',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
  ];
};

interface CurrentUser {
  name: string;
  department: string;
  email: string;
  phone: string;
}

interface BookingContextType {
  rooms: Room[];
  bookings: Booking[];
  notifications: Notification[];
  isAdminMode: boolean;
  currentUser: CurrentUser;
  setIsAdminMode: (val: boolean) => void;
  updateCurrentUser: (user: Partial<CurrentUser>) => void;
  checkAvailability: (roomId: string, startIso: string, endIso: string, excludeId?: string) => boolean;
  bookRoom: (data: {
    roomId: string;
    title: string;
    description?: string;
    startIso: string;
    endIso: string;
    participantCount: number;
    bookerName: string;
    bookerDepartment: string;
    bookerEmail?: string;
  }) => { success: boolean; message: string; booking?: Booking };
  cancelBooking: (bookingId: string) => { success: boolean; message: string };
  addRoom: (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => void;
  updateRoom: (room: Room) => void;
  toggleRoomActive: (roomId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  ROOMS: 'smr_rooms_v1',
  BOOKINGS: 'smr_bookings_v1',
  NOTIFICATIONS: 'smr_notifications_v1',
  IS_ADMIN: 'smr_is_admin_v1',
  CURRENT_USER: 'smr_current_user_v1',
};

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    name: 'คุณสมชาย มั่นคง',
    department: 'ฝ่ายพัฒนาธุรกิจ',
    email: 'somchai@company.com',
    phone: '081-234-5678',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
      const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const storedAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

      if (storedRooms) {
        setRooms(JSON.parse(storedRooms));
      } else {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
      }

      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      } else {
        const samples = getSampleBookings();
        setBookings(samples);
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(samples));
      }

      if (storedNotifs) {
        setNotifications(JSON.parse(storedNotifs));
      } else {
        const initialNotif: Notification[] = [
          {
            id: 'notif-1',
            user_id: 'user-default',
            booking_id: 'book-1',
            title: 'ยินดีต้อนรับสู่ระบบจองห้องประชุม',
            message: 'ระบบพร้อมใช้งาน ตรวจสอบห้องว่างและสร้างรายการจองได้ทันทีโดยไม่ต้องล็อกอิน',
            type: 'system',
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ];
        setNotifications(initialNotif);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotif));
      }

      if (storedAdmin !== null) {
        setIsAdminMode(JSON.parse(storedAdmin));
      }

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to LocalStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications, isLoaded]);

  const handleSetAdminMode = (val: boolean) => {
    setIsAdminMode(val);
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, JSON.stringify(val));
  };

  const updateCurrentUser = (userUpdate: Partial<CurrentUser>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...userUpdate };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
      return updated;
    });
  };

  // Check Availability / Anti-Overlap
  const checkAvailability = (roomId: string, startIso: string, endIso: string, excludeId?: string) => {
    const s1 = new Date(startIso).getTime();
    const e1 = new Date(endIso).getTime();

    if (s1 >= e1) return false;

    const hasConflict = bookings.some((b) => {
      if (b.status !== 'confirmed') return false;
      if (b.room_id !== roomId) return false;
      if (excludeId && b.id === excludeId) return false;

      const s2 = new Date(b.start_time).getTime();
      const e2 = new Date(b.end_time).getTime();

      // Overlap formula: (start1 < end2) && (end1 > start2)
      return s1 < e2 && e1 > s2;
    });

    return !hasConflict;
  };

  // Book Room
  const bookRoom = ({
    roomId,
    title,
    description,
    startIso,
    endIso,
    participantCount,
    bookerName,
    bookerDepartment,
    bookerEmail,
  }: {
    roomId: string;
    title: string;
    description?: string;
    startIso: string;
    endIso: string;
    participantCount: number;
    bookerName: string;
    bookerDepartment: string;
    bookerEmail?: string;
  }) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) {
      return { success: false, message: 'ไม่พบห้องประชุมที่ระบุ' };
    }

    if (!targetRoom.is_active) {
      return { success: false, message: 'ห้องประชุมนี้ปิดให้บริการชั่วคราว' };
    }

    if (!checkAvailability(roomId, startIso, endIso)) {
      return { success: false, message: 'ช่วงเวลานี้มีผู้อื่นจองแล้ว กรุณาเลือกช่วงเวลาอื่น' };
    }

    const newBookingId = `book-${Date.now()}`;
    const newBooking: Booking = {
      id: newBookingId,
      room_id: roomId,
      user_id: 'local-user',
      title,
      description: description || null,
      start_time: startIso,
      end_time: endIso,
      participant_count: participantCount,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rooms: targetRoom,
      profiles: {
        id: 'local-user',
        email: bookerEmail || currentUser.email || 'user@company.com',
        full_name: bookerName || currentUser.name || 'ผู้ใช้งาน',
        department: bookerDepartment || currentUser.department || 'ทั่วไป',
        role: 'user',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Create Notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      user_id: 'local-user',
      booking_id: newBookingId,
      title: 'จองห้องประชุมสำเร็จ',
      message: `คุณได้ทำการจอง ${targetRoom.name} สำหรับวันที่ ${formatThaiDate(startIso)} เรียบร้อยแล้ว`,
      type: 'booking_created',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Update remembered user
    updateCurrentUser({
      name: bookerName,
      department: bookerDepartment,
      email: bookerEmail || currentUser.email,
    });

    return { success: true, message: 'จองห้องประชุมสำเร็จ', booking: newBooking };
  };

  // Cancel Booking
  const cancelBooking = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return { success: false, message: 'ไม่พบรายการจอง' };

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );

    // Add Cancellation Notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      user_id: 'local-user',
      booking_id: bookingId,
      title: 'ยกเลิกการจองสำเร็จ',
      message: `รายการจอง "${target.title}" ได้รับการยกเลิกเรียบร้อยแล้ว`,
      type: 'booking_cancelled',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return { success: true, message: 'ยกเลิกการจองห้องประชุมเรียบร้อยแล้ว' };
  };

  // Room Management
  const addRoom = (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRooms((prev) => [...prev, newRoom]);
  };

  const updateRoom = (updatedRoom: Room) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === updatedRoom.id ? { ...updatedRoom, updated_at: new Date().toISOString() } : r))
    );
  };

  const toggleRoomActive = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // Populate relations on bookings if rooms change
  const populatedBookings = bookings.map((b) => {
    const r = rooms.find((rm) => rm.id === b.room_id);
    return {
      ...b,
      rooms: r || b.rooms,
    };
  });

  return (
    <BookingContext.Provider
      value={{
        rooms,
        bookings: populatedBookings,
        notifications,
        isAdminMode,
        currentUser,
        setIsAdminMode: handleSetAdminMode,
        updateCurrentUser,
        checkAvailability,
        bookRoom,
        cancelBooking,
        addRoom,
        updateRoom,
        toggleRoomActive,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}
