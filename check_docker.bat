@echo off
echo Checking Docker status...
echo ========================================

docker --version
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    pause
    exit /b 1
)

docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop is not running
    echo.
    echo Please start Docker Desktop:
    echo 1. Press Windows key
    echo 2. Type "Docker Desktop"
    echo 3. Click to open
    echo 4. Wait for it to start (30-60 seconds)
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

echo SUCCESS: Docker is running!
echo ========================================
docker ps
echo.
echo Docker is ready to use.
pause
