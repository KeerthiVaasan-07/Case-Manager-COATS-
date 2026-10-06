@echo off
title Re-Seed COATS Database
echo Re-seeding COATS database with official sample cases...
cd /d "%~dp0server"
node seed.js
echo.
echo Database re-seeded. New passwords are in server\data\INITIAL_CREDENTIALS.txt
pause
