# ☁️ Облачное хранилище My Cloud

Полноценное SPA-приложение для облачного хранения файлов. Реализовано в архитектуре клиент-сервер с разделением на бэкенд (Django/PostgreSQL) и фронтенд (React/TypeScript). Включает систему аутентификации, управление файлами, административную панель и генерацию обезличенных ссылок для внешнего доступа.

**Разработчик:** Сулейманов Руслан (asasxa)

---

## 🚀 Развёртывание проекта

Инструкция предназначена для запуска приложения с нуля после клонирования репозитория. Все статические ресурсы и API обслуживаются единым Django-сервером.

### 1. Клонирование репозитория
```bash
git clone https://github.com/asasxa/fry-diplom-project.git
cd fry-diplom-project
```
2. Настройка базы данных PostgreSQL
Создайте базу данных и выделенного пользователя:

```SQL
CREATE DATABASE mycloud_db;
CREATE USER mycloud_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mycloud_db TO mycloud_user;
ALTER DATABASE mycloud_db OWNER TO mycloud_user;
```

3. Настройка и запуск Бэкенда
Перейдите в директорию бэкенда:
cd fry-dip-backend

Создайте и активируйте виртуальное окружение:
# Windows (Git Bash / CMD)
python -m venv venv
venv\Scripts\activate.bat

# Linux / macOS
python3 -m venv venv
source venv/bin/activate

Установите зависимости:
```bash
pip install -r requirements.txt
```

Откройте файл mycloud/config.py и укажите данные вашей БД:

DB_CONFIG = {
    'NAME': 'mycloud_db',
    'USER': 'mycloud_user',
    'PASSWORD': 'your_secure_password',
    'HOST': 'localhost',
    'PORT': '5432',
}

Создайте папку для сборки фронтенда, примените миграции и создайте учётную запись администратора:

mkdir staticfiles
python manage.py migrate
python manage.py createsuperuser

4. Сборка Фронтенда
Откройте новый терминал и перейдите в директорию фронтенда:

cd fry-dip-frontend
npm install
npm run build

Скопируйте собранные артефакты в папку статики бэкенда:
# PowerShell (Windows)
Copy-Item -Path "dist\*" -Destination "..\fry-dip-backend\staticfiles\" -Recurse -Force

# Linux / macOS / Git Bash
cp -r dist/* ../fry-dip-backend/staticfiles/# PowerShell (Windows)
Copy-Item -Path "dist\*" -Destination "..\fry-dip-backend\staticfiles\" -Recurse -Force

# Linux / macOS / Git Bash
cp -r dist/* ../fry-dip-backend/staticfiles/

5. Настройка отдачи SPA в Django
Чтобы маршрутизация React работала при обновлении страницы, добавьте fallback-вид в корневой роутинг.
Откройте mycloud/urls.py и добавьте маршрут в конец списка urlpatterns:


from django.views.generic import TemplateView
# другие импорты

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/files/', include('files.urls')),
    # Fallback для SPA: отдаёт index.html для всех не-API запросов
    path('', TemplateView.as_view(template_name='index.html'), name='spa'),
]


Убедитесь, что в mycloud/settings.py указаны пути к статике:

import os
STATICFILES_DIRS = [BASE_DIR / "staticfiles"]
STATIC_ROOT = BASE_DIR / "static"

6. Запуск приложения
Вернитесь в папку бэкенда и запустите сервер:

cd fry-dip-backend
python manage.py runserver

Структура проекта
fry-diplom-project/
├── README.md                  # Документация
├── fry-dip-backend/           # Серверная часть
│   ├── files/                 # Приложение управления файлами
│   ├── users/                 # Приложение пользователей и аутентификации
│   ├── mycloud/               # Глобальные настройки и роутинг
│   ├── staticfiles/           # Собранный фронтенд (копируется после сборки)
│   ├── storage/               # Физическое хранилище файлов пользователей
│   ├── manage.py
│   └── requirements.txt
└── fry-dip-frontend/          # Клиентская часть
    ├── src/                   # Исходный код React/TypeScript
    ├── package.json
    └── vite.config.ts


Реализованный функционал
Пользовательский интерфейс (SPA)
Регистрация и вход с валидацией полей (логин, email, пароль)
Динамическое навигационное меню в зависимости от статуса аутентификации
Сохранение сессии при обновлении страницы (localStorage + cookie)
Защищённые маршруты с редиректом на страницу входа
Файловое хранилище
Загрузка файлов с комментарием (multipart/form-data)
Просмотр списка файлов с метаданными (имя, размер, даты, комментарий)
Переименование файлов и изменение комментария (inline-редактирование)
Скачивание файлов через авторизованную сессию
Генерация и копирование обезличенных ссылок (/api/files/special/<uuid>/)
Скачивание по спецссылке без аутентификации с сохранением оригинального имени
Административная панель
Список всех пользователей с признаком is_admin
Изменение прав доступа (назначение/снятие роли администратора)
Удаление пользователей (с защитой от самоудаления)
Просмотр статистики хранилищ пользователей
