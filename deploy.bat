@echo off

echo ================================
echo Deploying Code Learning with Isaac
echo ================================

git add .

git commit -m "Updated website"

git push origin main

echo.
echo ================================
echo Code pushed successfully!
echo Vercel will automatically deploy.
echo ================================

pause
