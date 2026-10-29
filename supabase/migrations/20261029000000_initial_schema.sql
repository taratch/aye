-- ==============================================================================
-- SMART MEETING ROOM BOOKING SYSTEM - DATABASE MIGRATION SCRIPT
-- ==============================================================================
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 1. PROFILES TABLE
-- Linked with Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    department TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location TEXT NOT NULL,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    participant_count INTEGER NOT NULL CHECK (participant_count > 0),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_booking_dates CHECK (start_time < end_time)
);

-- Database-Level Anti-Overlap Constraint (btree_gist)
-- Prevents overlapping bookings for the same room when status is 'confirmed'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_bookings'
    ) THEN
        ALTER TABLE public.bookings
        ADD CONSTRAINT no_overlapping_bookings
        EXCLUDE USING gist (
            room_id WITH =,
            tstzrange(start_time, end_time) WITH &&
        )
        WHERE (status = 'confirmed');
    END IF;
END $$;

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('booking_created', 'booking_updated', 'booking_cancelled', 'reminder', 'system')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_room_time ON public.bookings(room_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON public.rooms(is_active);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Helper function to check if the current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on auth signup
-- Automatically promotes the very first registered user to 'admin' role!
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_count INT;
  v_initial_role TEXT := 'user';
BEGIN
  SELECT COUNT(*) INTO v_user_count FROM public.profiles;
  IF v_user_count = 0 THEN
    v_initial_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_initial_role
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check conflict directly for UI validation pre-check
CREATE OR REPLACE FUNCTION public.check_booking_availability(
    p_room_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.bookings
    WHERE room_id = p_room_id
      AND status = 'confirmed'
      AND (p_exclude_booking_id IS NULL OR id <> p_exclude_booking_id)
      AND (
          (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      );

    RETURN (v_conflict_count = 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile details" ON public.profiles;
CREATE POLICY "Users can update their own profile details"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Regular users cannot alter their own role!
    AND (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) OR public.is_admin())
  );

-- 2. ROOMS POLICIES
DROP POLICY IF EXISTS "Active rooms are viewable by authenticated users" ON public.rooms;
CREATE POLICY "Active rooms are viewable by authenticated users"
  ON public.rooms FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert rooms" ON public.rooms;
CREATE POLICY "Admins can insert rooms"
  ON public.rooms FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update rooms" ON public.rooms;
CREATE POLICY "Admins can update rooms"
  ON public.rooms FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete rooms" ON public.rooms;
CREATE POLICY "Admins can delete rooms"
  ON public.rooms FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. BOOKINGS POLICIES
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON public.bookings;
CREATE POLICY "Authenticated users can view bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create bookings for themselves" ON public.bookings;
CREATE POLICY "Users can create bookings for themselves"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own upcoming bookings or Admin can update any" ON public.bookings;
CREATE POLICY "Users can update their own upcoming bookings or Admin can update any"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR
    (auth.uid() = user_id AND start_time > timezone('utc'::text, now()))
  )
  WITH CHECK (
    public.is_admin() OR
    (auth.uid() = user_id)
  );

DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4. NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications is_read" ON public.notifications;
CREATE POLICY "Users can update their own notifications is_read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System or users can insert notifications" ON public.notifications;
CREATE POLICY "System or users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
-- Enable Realtime for bookings and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ==============================================================================
-- SEED DATA: INITIAL SAMPLE ROOMS
-- ==============================================================================
INSERT INTO public.rooms (id, name, description, capacity, location, amenities, image_url, is_active)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'ห้องประชุมเพชรไพลิน (Executive Boardroom)',
    'ห้องประชุมผู้บริหารขนาดใหญ่ พร้อมโต๊ะประชุมไม้สักและระบบ Video Conference ความละเอียดสูง 4K สำหรับการประชุมระดับบอร์ดบริหารหรือต้อนรับลูกค้าระดับ VIP',
    20,
    'อาคาร A ชั้น 5',
    ARRAY['จอสัมผัสอัจฉริยะ 85 นิ้ว', 'ระบบ Video Conference 4K', 'ไมโครโฟนตั้งโต๊ะรายบุคคล', 'ระบบตัดเสียงรบกวน', 'ไวท์บอร์ดอิเล็กทรอนิกส์', 'Wi-Fi ความเร็วสูง'],
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
    true
),
(
    '00000000-0000-0000-0000-000000000002',
    'ห้องประชุมมรกต (Smart Meeting Room A)',
    'ห้องประชุมขนาดกลาง เหมาะสำหรับการประชุมทีม การนำเสนอผลงาน หรือการประชุมวางแผนงานประจำสัปดาห์',
    12,
    'อาคาร A ชั้น 3',
    ARRAY['สมาร์ททีวี 65 นิ้ว', 'กล้อง Web Conference', 'กระดานไวท์บอร์ดแม่เหล็ก', 'ปลั๊กไฟและพอร์ตชาร์จหัวโต๊ะ', 'Wi-Fi'],
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    true
),
(
    '00000000-0000-0000-0000-000000000003',
    'ห้องประชุมทับทิม (Brainstorming Room)',
    'ห้องประชุมระดมความคิด บรรยากาศสบาย โซฟานุ่ม มีผนังกระจกสำหรับเขียนไอเดียและการออกแบบร่วมกันอย่างสร้างสรรค์',
    8,
    'อาคาร B ชั้น 2',
    ARRAY['หน้าจอดิจิทัล 55 นิ้ว', 'ผนังกระจกเขียนได้รอบทิศ', 'โซฟาปรับระดับได้', 'โพสต์อิทและอุปกรณ์เวิร์กช็อป', 'ลำโพงบลูทูธ'],
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    true
),
(
    '00000000-0000-0000-0000-000000000004',
    'ห้องประชุมบุษราคัม (Focus & Interview Room)',
    'ห้องประชุมขนาดกะทัดรัด เหมาะสำหรับการสัมภาษณ์งาน การประชุมแบบตัวต่อตัว (1-on-1) หรือการโทรคุยงานส่วนตัวที่ต้องการความเงียบสงบ',
    4,
    'อาคาร B ชั้น 2',
    ARRAY['จอคอมพิวเตอร์ต่อพ่วง Type-C/HDMI', 'กระจกฉนวนกันเสียงสองชั้น', 'เก้าอี้ Ergonomic เพื่อสุขภาพ', 'Wi-Fi'],
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    true
)
ON CONFLICT (id) DO NOTHING;
