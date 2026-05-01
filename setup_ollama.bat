@echo off
echo ========================================
echo Ollama LLM Setup for Windows
echo ========================================
echo.

echo Checking if Ollama is installed...
where ollama >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ollama is installed
    goto :check_running
) else (
    echo [NOT FOUND] Ollama is not installed
    echo.
    echo To install Ollama:
    echo 1. Go to: https://ollama.com/download
    echo 2. Download Ollama for Windows
    echo 3. Run the installer
    echo 4. Restart this script
    echo.
    pause
    exit /b 1
)

:check_running
echo.
echo Checking if Ollama is running...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ollama is running
    goto :check_model
) else (
    echo [NOT RUNNING] Starting Ollama...
    start "" ollama serve
    timeout /t 5 /nobreak >nul
    echo [OK] Ollama started
)

:check_model
echo.
echo Checking for llama2 model...
ollama list | findstr llama2 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] llama2 model is installed
    goto :done
) else (
    echo [NOT FOUND] Downloading llama2 model...
    echo This may take a few minutes (4GB download)...
    ollama pull llama2
    if %errorlevel% equ 0 (
        echo [OK] llama2 model downloaded
    ) else (
        echo [ERROR] Failed to download model
        pause
        exit /b 1
    )
)

:done
echo.
echo ========================================
echo Ollama Setup Complete!
echo ========================================
echo.
echo Ollama is running at: http://localhost:11434
echo Model: llama2
echo.
echo Your backend will now use Ollama for better answers!
echo.
echo To test Ollama:
echo   ollama run llama2 "Hello, how are you?"
echo.
pause
