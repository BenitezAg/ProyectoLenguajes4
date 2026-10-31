@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js. Instala la version LTS desde https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules\esbuild\bin\esbuild" (
  echo Preparando el proyecto React por primera vez...
  call npm ci
  if errorlevel 1 (
    echo No se pudieron instalar las dependencias. Comprueba tu conexion a internet.
    pause
    exit /b 1
  )
)

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"
call npm start
pause
