#!/bin/bash
set -e

echo "Обновление кода"
cd ~/fpy-diplom && git pull origin main

echo "Обновление бэкенда"
cd fry-dip-backend
source venv/bin/activate
pip install -r requirements.txt -q
python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo "Сборка фронтенда"
cd ../fry-dip-frontend
npm ci --silent
npm run build
sudo rm -rf /var/www/mycloud/*
sudo cp -r dist/* /var/www/mycloud/
sudo chown -R www-data:www-data /var/www/mycloud

echo "Перезапуск сервисов"
cd ../fry-dip-backend
sudo supervisorctl restart mycloud
sudo systemctl restart nginx

echo "Обновление завершено!"
deactivate