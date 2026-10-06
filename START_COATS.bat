@echo off
title COATS - Cases of Anti Terrorism Squad
echo ============================================================
echo   COATS - CASES OF ANTI TERRORISM SQUAD (TAMIL NADU POLICE)
echo   Initializing Backend Server and Frontend Command Center...
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo Install the LTS version from https://nodejs.org then run this file again.
  pause
  exit /b 1
)

if not exist "%~dp0server\node_modules" (
  echo Installing backend dependencies - first run only...
  pushd "%~dp0server"
  call npm install
  popd
)
if not exist "%~dp0client\node_modules\.bin\vite.cmd" (
  set NEEDINSTALL=1
)
if exist "%~dp0client\node_modules\@tailwindcss\postcss" (
  echo Wrong Tailwind version detected - repairing...
  rmdir /s /q "%~dp0client\node_modules"
  set NEEDINSTALL=1
)
if defined NEEDINSTALL (
  echo Installing frontend dependencies - first run only, may take a few minutes...
  pushd "%~dp0client"
  call npm install
  popd
)

if not exist "%~dp0server\data\coats.db" (
  echo Creating database with sample cases and unique officer passwords - first run only...
  pushd "%~dp0server"
  call npm run seed
  popd
  echo.
  echo *** Officer passwords: server\data\INITIAL_CREDENTIALS.txt - hand them out, then DELETE the file ***
  echo.
)

set DEMO_MODE=true
echo [DEMO MODE] Password-less officer switching enabled for this PC only.
start "COATS Backend API (Port 5000)" cmd /k "cd /d "%~dp0server" && npm start"
timeout /t 2 /nobreak >nul

start "COATS Frontend Client (Port 3000)" cmd /k "cd /d "%~dp0client" && npm run dev"
timeout /t 5 /nobreak >nul

start http://localhost:3000

echo.
echo COATS is now live at: http://localhost:3000
echo Backend API active at: http://localhost:5000
echo.
pause
