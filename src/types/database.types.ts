export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin';

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export type NotificationType = 
  | 'booking_created' 
  | 'booking_updated' 
  | 'booking_cancelled' 
  | 'reminder' 
  | 'system';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  department: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  location: string;
  amenities: string[];
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  room_id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  participant_count: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  rooms?: Room;
  profiles?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  booking_id: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  bookings?: Booking;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          department?: string;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          department?: string;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: Room;
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          capacity: number;
          location: string;
          amenities?: string[];
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          capacity?: number;
          location?: string;
          amenities?: string[];
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          participant_count: number;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          participant_count?: number;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: {
          id?: string;
          user_id: string;
          booking_id?: string | null;
          title: string;
          message: string;
          type: NotificationType;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          booking_id?: string | null;
          title?: string;
          message?: string;
          type?: NotificationType;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      check_booking_availability: {
        Args: {
          p_room_id: string;
          p_start_time: string;
          p_end_time: string;
          p_exclude_booking_id?: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      booking_status: BookingStatus;
      notification_type: NotificationType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
