@echo off
title MyShort - Video Pipeline & Web Server
cd /d "%~dp0shortify"
echo ========================================================
echo  Starting MyShort Web Server & Persistent Worker...
echo  URL: http://localhost:5173
echo ========================================================
node server.js
pause
