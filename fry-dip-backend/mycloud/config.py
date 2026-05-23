import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

DB_CONFIG = {
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': os.environ.get('DB_NAME', 'mycloud_db'),
    'USER': os.environ.get('DB_USER', 'postgres'),
    'PASSWORD': os.environ.get('DB_PASSWORD'),
    'HOST': os.environ.get('DB_HOST', 'localhost'),
    'PORT': os.environ.get('DB_PORT', '5432'),
}

STORAGE_BASE_DIR = os.environ.get('STORAGE_BASE_DIR', str(BASE_DIR / 'storage'))
MEDIA_URL = '/media/'
MEDIA_ROOT = str(BASE_DIR / 'media')
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'static'

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')