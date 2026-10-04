@echo off
echo ========================================================
echo STARTING FULL STACK SMART INTERNSHIP ^& JOB MATCHER
echo ========================================================

netstat -ano | findstr 3307 >nul
if errorlevel 1 (
    echo Starting MySQL on port 3307...
    start "Smart Matcher MySQL Server" cmd /k "%~dp0start_mysql.bat"
    timeout /t 3 /nobreak >nul
) else (
    echo MySQL is already running on port 3307.
)

start "Smart Matcher Backend (Flask)" cmd /k "%~dp0start_backend.bat"
start "Smart Matcher Frontend (React)" cmd /k "%~dp0start_frontend.bat"
echo Applications launched in separate windows!
echo Frontend: http://localhost:3000
echo Backend:  http://127.0.0.1:5000

