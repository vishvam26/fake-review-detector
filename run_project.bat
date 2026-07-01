@echo off
echo Starting Fake Review Detector Project...
echo.

:: Start Backend
echo Starting FastAPI Backend Server in a new terminal...
start "Backend Server - FastAPI" cmd /k "cd backend && ..\venv\Scripts\python.exe -m uvicorn main:app --reload"

:: Start Frontend
echo Starting Frontend React/Vite Server in a new terminal...
start "Frontend Server - Vite" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo You can check those windows for server logs.
echo.
pause
