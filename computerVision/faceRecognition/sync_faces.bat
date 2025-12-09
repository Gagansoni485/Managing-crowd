@echo off
echo ==========================================
echo Syncing Face Encodings from Database
echo ==========================================
echo.

cd /d "%~dp0"
python sync_faces.py

echo.
echo Press any key to exit...
pause > nul
