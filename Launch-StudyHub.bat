@echo off
title NEXUS 3.0 Study Hub Launcher
echo Starting NEXUS Study Hub...
python serve.py
if %ERRORLEVEL% NEQ 0 (
    echo Python server failed or Python is not in PATH.
    echo Opening index.html directly in your default browser...
    start "" "index.html"
)
pause
