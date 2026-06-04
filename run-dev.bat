@echo off
title HEM▲ Blood Management System Launcher
echo 🩸 Starting HEM▲ Blood Management System...

:: Verify backend node_modules
if not exist "backend\node_modules\" (
    echo [SYS] Installing backend dependencies...
    call npm install --prefix backend
)

:: Verify frontend node_modules
if not exist "frontend\node_modules\" (
    echo [SYS] Installing frontend dependencies...
    call npm install --prefix frontend
)

:: Launch Backend
echo [SYS] Launching Backend API...
start cmd /k "title BMS Backend API && cd backend && npm run dev"

:: Launch Frontend
echo [SYS] Launching Frontend Server...
start cmd /k "title BMS Frontend Client && cd frontend && npm run dev"

echo [SYS] Project successfully launched! Close the spawned terminals to stop the servers.
pause
