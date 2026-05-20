import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DB_CONFIG = {
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': 'mycloud_db',
    'USER': 'mycloud_user',
    'PASSWORD': 'secure_pass_123',
    'HOST': 'localhost',
    'PORT': '5432',
}

# Параметры хранилища и статики
STORAGE_BASE_DIR = os.environ.get('STORAGE_BASE_DIR', str(BASE_DIR / 'storage'))
MEDIA_URL = '/media/'
MEDIA_ROOT = str(BASE_DIR / 'media')
STATIC_URL = 'static/'

# Секретный ключ и режим отладки
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-change-me-in-production')
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')