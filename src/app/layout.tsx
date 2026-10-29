import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookingProvider } from '@/context/BookingContext';

export const metadata: Metadata = {
  title: 'ระบบจองห้องประชุมออนไลน์ | Smart Meeting Room Booking',
  description: 'ระบบจองห้องประชุมออนไลน์ที่ทันสมัย ตรวจสอบห้องว่างแบบเรียลไทม์ ป้องกันเวลาทับซ้อน พร้อมใช้งานได้ทันที',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <BookingProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </BookingProvider>
      </body>
    </html>
  );
}
