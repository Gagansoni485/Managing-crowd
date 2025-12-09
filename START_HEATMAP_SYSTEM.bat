@echo off
echo ========================================
echo   CROWD HEATMAP SYSTEM - QUICK START
echo ========================================
echo.
echo This will start all components needed for the heatmap system:
echo 1. MongoDB (must be running)
echo 2. Backend Server (Node.js)
echo 3. Frontend (React)
echo 4. Python CV Heatmap Monitor
echo.
echo Press Ctrl+C to stop all services
echo.
pause

echo.
echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3

echo.
echo [2/3] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3

echo.
echo [3/3] Starting Python CV Heatmap Monitor...
start "CV Heatmap" cmd /k "cd computerVision\objectdetection && python heatmap_monitor.py"
timeout /t 2

echo.
echo ========================================
echo   ALL SERVICES STARTED!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo Heatmap:  http://localhost:5173/crowd-heatmap
echo.
echo To view the heatmap:
echo 1. Login as admin at http://localhost:5173
echo 2. Click "Heatmap" tab in Admin Dashboard
echo    OR go directly to http://localhost:5173/crowd-heatmap
echo.
echo The Python CV script will automatically send heatmap data
echo to the backend every 5 seconds.
echo.
echo Press any key to exit this window (services will keep running)...
pause
