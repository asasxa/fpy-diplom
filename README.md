# ☁️ Облачное хранилище My Cloud

**Дипломный проект по профессии «Fullstack-разработчик на Python»**  
**Разработчик:** Сулейманов Руслан ([asasxa](https://github.com/asasxa))

## 📝 Описание
Веб-приложение для облачного хранения и управления файлами. Реализовано в архитектуре SPA (Single Page Application) с разделением на клиентскую (React) и серверную (Django) части. Приложение позволяет пользователям загружать файлы, управлять ими (переименовывание, удаление, предпросмотр), делиться обезличенными ссылками и управлять правами доступа через административную панель.

## 🛠 Технологический стек
| Уровень | Технологии |
|---------|------------|
| **Backend** | Python 3.10+, Django 5.x, Django REST Framework, PostgreSQL |
| **Frontend** | TypeScript, React 18, Redux Toolkit, React Router v6, Vite, Axios |
| **DevOps / Tools** | Git, pip, npm, Virtualenv, python-dotenv |

## 📂 Структура проекта
```text
fry-diplom-project/                  # Корень репозитория
├── README.md                        # Документация
├── TZ_README.md                     # ТЗ
├── fry-dip-backend/                 # Серверная часть
│   ├── files/                       # Приложение управления файлами
│   ├── users/                       # Приложение пользователей и аутентификации
│   ├── mycloud/                     # Глобальные настройки (settings, config, urls)
│   ├── staticfiles/                 # Собранный фронтенд (для продакшена)
│   ├── storage/                     # Физическое хранилище файлов пользователей
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example                 # Шаблон переменных окружения
└── fry-dip-frontend/                # Клиентская часть
    ├── src/                         # Исходный код (Components, Pages, Store)
    ├── package.json
    └── vite.config.ts
```

## 🚀 Инструкция по развёртыванию и запуску
### 1. Клонирование репозитория
```bash
git clone https://github.com/asasxa/fry-diplom-project.git
```
```bash
cd fry-diplom-project
```

### 2. Настройка Бэкенда
```bash
cd fry-dip-backend
```
#### Переменные окружения
Создайте файл .env в папке fry-dip-backend и заполните его данными вашей БД и секретным ключом:

#### ⚠️ Важно: В продакшене установите DEBUG=False и сгенерируйте надёжный SECRET_KEY.
#### Виртуальное окружение и зависимости

```bash
# Windows
python -m venv venv
```
```bash
# Windows
venv\Scripts\activate.bat
```
```bash
# Если через GIT Bash, то слеш в другую сторону
venv/Scripts/activate.bat
```

```bash
# Linux / macOS
python3 -m venv venv
```
```bash
# Linux / macOS
source venv/bin/activate
```
```bash
# Установка зависимостей
pip install -r requirements.txt
```
#### Миграции и суперпользователь
```bash
python manage.py migrate
```
```bash
python manage.py createsuperuser
```
##### После создания войдите в "админку" Django и поставьте галочку is_admin у пользователя, чтобы ему была доступна панель управления на фронтенде

## Сборка Фронтенда
##### В новом терминале выполните:
```bash
cd fry-dip-frontend
```
```bash
npm install
```
```bash
npm run build
```
### Интеграция и запуск
##### Скопируйте собранные файлы в папку статики бэкенда:
# PowerShell (Windows)
Copy-Item -Path "dist\*" -Destination "..\fry-dip-backend\staticfiles\" -Recurse -Force

# Linux / macOS / Git Bash
cp -r dist/* ../fry-dip-backend/staticfiles/

##### Убедитесь, что в fry-dip-backend/mycloud/urls.py добавлен SPA-fallback (обязательно для работы роутинга React):
``` python 
from django.views.generic import TemplateView
...
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/files/', include('files.urls')),
    path('', TemplateView.as_view(template_name='index.html'), name='spa'),
]
```

## Запустите сервер:
```bash 
python manage.py runserver
```
```bash 
python manage.py runserver
```