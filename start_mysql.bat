@echo off
echo ========================================================
echo STARTING MYSQL SERVER (PORT 3307)
echo ========================================================
cd /d "%~dp0"
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --no-defaults --port=3307 --datadir="%~dp0mysql_data" --console
pause
