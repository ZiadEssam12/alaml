@echo off
cd /d "g:\New folder\alaml"
rmdir /s /q src\generated\prisma 2>nul
npx prisma generate
pause
