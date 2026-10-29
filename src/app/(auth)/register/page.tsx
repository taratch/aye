'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            ระบบพร้อมใช้งานทันที
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            ท่านสามารถเข้าใช้งาน เลือกล็อตห้อง และทำการจองได้ทันทีโดยไม่ต้องสร้างบัญชีผู้ใช้งาน
          </p>
        </div>

        <Link
          href="/"
          className="w-full inline-flex justify-center items-center gap-2 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
        >
          <span>ไปที่หน้ารายการห้องประชุม</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
