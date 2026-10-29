import React from 'react';
import { Building2, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-slate-500 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-700">ระบบจองห้องประชุมออนไลน์ (Smart Meeting Room)</span>
          </div>
          
          <div className="flex items-center space-x-6 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              ความปลอดภัยระดับองค์กร (Supabase RLS)
            </span>
            <span>เขตเวลา: Asia/Bangkok (UTC+7)</span>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
