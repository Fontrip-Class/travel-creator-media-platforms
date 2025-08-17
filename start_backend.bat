@echo off 
title 後端服務 - PHP + Slim 
color 0E 
echo 🚀 啟動後端服務... 
echo 📍 地址: http://localhost:8000 
echo. 
echo 💡 按 Ctrl+C 停止服務 
echo. 
cd backend 
php -S localhost:8000 -t public 
