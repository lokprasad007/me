@echo off
title NEXUS 3.0 Instant Online Deployment
echo ===================================================================
echo  NEXUS 3.0 STUDY HUB - INSTANT ONLINE LAUNCHER
echo ===================================================================
echo.
echo Starting local web server...
start /B python serve.py

timeout /t 2 >nul

echo Starting secure cloud tunnel...
echo.
echo Your public link will be: https://vtu-study-nexus.loca.lt
echo If prompted for a password on your phone, enter your IP:
curl -s https://api.ipify.org
echo.
echo.
echo ===================================================================
npx --yes localtunnel --port 8080 --subdomain vtu-study-nexus
pause
