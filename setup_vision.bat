@echo off
echo ========================================
echo Vision Model (LLaVA) Setup
echo ========================================
echo.

echo Checking if Ollama is installed...
where ollama >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Ollama is not installed
    echo Please install Ollama first from: https://ollama.com/download
    pause
    exit /b 1
)

echo [OK] Ollama is installed
echo.

echo Checking if LLaVA model is installed...
ollama list | findstr llava >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] LLaVA model is already installed
    goto :rebuild
)

echo [NOT FOUND] Downloading LLaVA model...
echo This will download ~4.7GB. It may take 5-10 minutes.
echo.
ollama pull llava
if %errorlevel% neq 0 (
    echo [ERROR] Failed to download LLaVA
    pause
    exit /b 1
)

echo [OK] LLaVA model downloaded successfully
echo.

:rebuild
echo Rebuilding backend with vision support...
docker-compose up -d --build backend

echo.
echo ========================================
echo Vision Model Setup Complete!
echo ========================================
echo.
echo LLaVA is now available for image understanding!
echo.
echo Test it:
echo 1. Go to http://localhost:3000
echo 2. Upload an image (JPG, PNG, etc.)
echo 3. Ask: "What do you see in this image?"
echo 4. Ask: "What colors are in this image?"
echo.
pause
