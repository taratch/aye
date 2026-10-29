@echo off
chcp 65001 > nul
title ระบบจองห้องประชุมออนไลน์ (Smart Meeting Room)
echo ===================================================
echo   กำลังเริ่มต้นระบบจองห้องประชุมออนไลน์...
echo ===================================================
echo.

set PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%

echo กำลังเปิดเซิร์ฟเวอร์ กรุณารอสักครู่...
start "" http://localhost:3000
npm run start

pause
