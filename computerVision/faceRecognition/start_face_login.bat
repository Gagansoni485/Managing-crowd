@echo off
echo ==========================================
echo Temple Face Recognition Login System
echo ==========================================
echo.
echo Starting application...
echo.

cd /d "%~dp0"
python main.py

if %errorlevel% neq 0 (
    echo.
    echo Error: Application failed to start
    echo Press any key to exit...
    pause > nul
)
