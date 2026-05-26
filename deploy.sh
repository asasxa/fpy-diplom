#!/bin/bash
set -e

PROJECT_DIR="/home/asasxa/fpy-diplom"
BACKEND_DIR="$PROJECT_DIR/fry-dip-backend"
FRONTEND_DIR="$PROJECT_DIR/fry-dip-frontend"
DEPLOY_DIR="/var/www/mycloud"
BRANCH="main"

cd "$PROJECT_DIR"
git pull origin "$BRANCH"

cd "$BACKEND_DIR"
if [ -d "venv" ]; then
    source venv/bin/activate
else
    python3 -m venv venv
    source venv/bin/activate
fi

pip install -r requirements.txt -q
python manage.py migrate --noinput
python manage.py collectstatic --noinput

cd "$FRONTEND_DIR"
npm ci --silent || npm install --silent
npm run build

sudo rm -rf "$DEPLOY_DIR"/*
sudo cp -r dist/* "$DEPLOY_DIR/"
sudo chown -R www-data:www-data "$DEPLOY_DIR"

cd "$BACKEND_DIR"
sudo supervisorctl restart mycloud
sudo systemctl restart nginx

deactivate