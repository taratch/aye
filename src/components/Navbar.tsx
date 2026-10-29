'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { 
  Building2, 
  Calendar, 
  Clock, 
  LayoutDashboard, 
  FileSpreadsheet, 
  Layers, 
  Bell, 
  Menu, 
  X,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { notifications, isAdminMode, setIsAdminMode, currentUser } = useBooking();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'ห้องประชุม', href: '/', icon: Building2 },
    { name: 'ปฏิทินการจอง', href: '/calendar', icon: Calendar },
    { name: 'การจองของฉัน', href: '/my-bookings', icon: Clock },
  ];

  const adminLinks = [
    { name: 'แดชบอร์ด', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'จัดการห้อง', href: '/admin/rooms', icon: Layers },
    { name: 'จัดการการจอง', href: '/admin/bookings', icon: Clock },
    { name: 'รายงานสรุป & CSV', href: '/admin/reports', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-900 tracking-tight leading-tight">
                  ระบบจองห้องประชุม
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Smart Meeting Room
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Admin Links */}
            {isAdminMode && (
              <div className="relative group ml-1 border-l border-slate-200 pl-2">
                <div className="flex items-center space-x-1 px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-lg cursor-pointer">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>เมนูผู้ดูแล</span>
                </div>
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 hidden group-hover:block transition-all animate-in fade-in">
                  {adminLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 ${
                          pathname === item.href ? 'bg-blue-50/70 text-blue-700 font-medium' : ''
                        }`}
                      >
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* Right Actions: Mode Switch & Notifications */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Notification Bell */}
            <Link
              href="/my-bookings#notifications"
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              title="การแจ้งเตือน"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Admin Mode Toggle Switch */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isAdminMode
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
                title="คลิกเพื่อสลับระหว่างโหมดผู้ใช้ทั่วไปและโหมดผู้ดูแลระบบ"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAdminMode ? 'โหมดผู้ดูแล (Admin ON)' : 'สลับเป็น Admin'}</span>
              </button>
            </div>

            {/* Current Booker Info Badge */}
            <div className="flex items-center space-x-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                {currentUser.name ? currentUser.name[0] : 'U'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isAdminMode ? 'ผู้ดูแลระบบ' : currentUser.department}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`p-1.5 rounded-lg text-xs font-semibold border ${
                isAdminMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isAdminMode ? 'Admin' : 'User'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-slate-500" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {isAdminMode && (
            <div className="pt-2 border-t border-slate-100">
              <div className="px-3 py-1.5 text-xs font-bold text-indigo-600 tracking-wider uppercase">
                เมนูผู้ดูแลระบบ
              </div>
              <div className="space-y-1 mt-1">
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Icon className="w-5 h-5 text-slate-500" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
