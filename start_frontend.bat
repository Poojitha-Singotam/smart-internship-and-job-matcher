@echo off
echo ========================================================
echo STARTING SMART INTERNSHIP ^& JOB MATCHER - REACT FRONTEND
echo ========================================================
cd /d "%~dp0frontend"
node ./node_modules/vite/bin/vite.js --port 3000 --host
pause
