@echo off
cd backend
set FLASK_APP=app.py
start cmd /k flask run --port=5000
start cmd /k flask run --port=5001
cd ..

cd frontend
start cmd /k npm start
cd ..

start cmd /k A:/Py/python.exe load_balancer.py

echo Servers and load balancer are running...
pause
