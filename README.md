# ☁️ Облачное хранилище My Cloud

**Дипломный проект по профессии «Fullstack-разработчик на Python»**  
**Разработчик:** Сулейманов Руслан ([asasxa](https://github.com/asasxa))
**Сервер и приложение в сборке** https://194.67.121.233/

---

## 📝 Описание
Веб-приложение для облачного хранения и управления файлами. Реализовано в архитектуре SPA (Single Page Application) с разделением на клиентскую (React) и серверную (Django) части. Приложение позволяет пользователям загружать файлы, управлять ими (переименование, удаление, предпросмотр), делиться обезличенными ссылками и управлять правами доступа через административную панель.

---

## 🛠 Технологический стек

| Уровень | Технологии |
|---------|------------|
| **Backend** | Python 3.10+, Django 5.x, Django REST Framework, PostgreSQL, Gunicorn |
| **Frontend** | TypeScript, React 18, Redux Toolkit, React Router v6, Vite, Axios |
| **DevOps** | Git, pip, npm, Virtualenv, Supervisor, Nginx, python-dotenv |
| **Server** | Ubuntu 26.04 LTS, reg.ru VPS |

---

## 📂 Структура проекта

```text
fry-diplom-project/                  # Корень репозитория
├── README.md                        # Документация (этот файл)
├── TZ_README.md                     # Техническое задание
├── generate_readme.py               # Скрипт генерации README
├── deploy.sh                        # Скрипт автоматического обновления
│
├── fry-dip-backend/                 # Серверная часть (Django)
│   ├── files/                       # Приложение: управление файлами
│   │   ├── models.py, views.py, serializers.py, urls.py
│   ├── users/                       # Приложение: пользователи и аутентификация
│   ├── mycloud/                     # Глобальные настройки проекта
│   │   ├── settings.py, config.py, urls.py, wsgi.py
│   ├── staticfiles/                 # Собранный фронтенд (для продакшена)
│   ├── storage/                     # Физическое хранилище файлов пользователей
│   ├── logs/                        # Логи приложения
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example                 # Шаблон переменных окружения
│
└── fry-dip-frontend/                # Клиентская часть (React + TypeScript)
    ├── src/
    │   ├── api/                     # Axios-клиент с CSRF-интерцептором
    │   ├── components/              # Переиспользуемые UI-компоненты
    │   ├── pages/                   # Страницы: Login, Storage, Admin
    │   ├── store/                   # Redux Toolkit: slices, hooks
    │   ├── utils/                   # Вспомогательные функции
    │   ├── App.tsx, main.tsx
    │   └── types.ts                 # TypeScript-интерфейсы
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

## Инструкция по развёртыванию
### Вариант А: Локальная разработка
1. Клонирование репозитория
```bash
git clone https://github.com/asasxa/fry-diplom-project.git
cd fry-diplom-project
``` 
2. Настройка Бэкенда
```bash
cd fry-dip-backend

# Создаём виртуальное окружение
python -m venv venv

# Активируем (Linux/macOS/Git Bash)
source venv/bin/activate
# Или для Windows CMD:
# venv\\Scripts\\activate

# Устанавливаем зависимости
pip install -r requirements.txt

# Создаём .env из шаблона и редактируем
cp .env.example .env
nano .env  
```
Пример .env для локальной разработки:
```
DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-me
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=mycloud_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

STORAGE_BASE_DIR=./storage
```

3. Миграции и суперпользователь
```bash
python manage.py migrate
python manage.py createsuperuser 
```
После создания пользователя зайдите в админку (/admin/) и установите флаг is_admin=True,
чтобы открыть доступ к панели управления на фронтенде.

4. Сборка и запуск Фронтенда  (в новом терминале)
```bash
cd fry-dip-frontend

npm install
npm run dev  
```

Приложение доступно по адресу: http://localhost:5173 (фронтенд) → API: http://localhost:8000/api/

### Вариант Б: Продакшен-развёртывание на сервере (reg.ru / Ubuntu)
Предварительные требования на сервере:
Установлены: python3, python3-venv, postgresql, nginx, supervisor, nodejs, npm
Создан пользователь с правами sudo
Настроена база данных PostgreSQL и пользователь mycloud_user
Сгенерирован самоподписанный или доверенный SSL-сертификат (опционально, но рекомендуется)

В README.md представлен пример с моим ником (asasxa), по анологии создаем пользователя на сервере и заменяем на созданного пользователя

1. Клонирование и базовая настройка
# Подключаемся к серверу
```bash
ssh asasxa@194.67.121.233 

# Клонируем проект
git clone https://github.com/asasxa/fry-diplom-project.git
cd fry-diplom-project
```
2. Настройка окружения
```bash
cd fry-dip-backend

# Создаём .env с продакшен-настройками
cp .env.example .env
nano .env 
```

Пример .env для продакшена:
```
DEBUG=False
SECRET_KEY=ваш_надёжный_ключ_минимум_50_символов
ALLOWED_HOSTS=194.67.121.233,localhost

DB_NAME=mycloud_db
DB_USER=mycloud_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432

STORAGE_BASE_DIR=/home/asasxa/fpy-diplom/fry-dip-backend/storage
```

3. Установка зависимостей и миграции
```bash
# Бэкенд
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Фронтенд
cd ../fry-dip-frontend
npm ci --silent
npm run build

# Копируем сборку в папку для Nginx
sudo mkdir -p /var/www/mycloud
sudo cp -r dist/* /var/www/mycloud/
sudo chown -R www-data:www-data /var/www/mycloud 
```

4. Настройка Supervisor (Gunicorn)
Создайте файл /etc/supervisor/conf.d/mycloud.conf:
```bash
[program:mycloud]
command=/home/asasxa/fpy-diplom/fry-dip-backend/venv/bin/gunicorn \\
        --access-logfile - \\
        --workers 3 \\
        --bind unix:/home/asasxa/fpy-diplom/fry-dip-backend/mycloud.sock \\
        --umask 000 \\
        mycloud.wsgi:application
directory=/home/asasxa/fpy-diplom/fry-dip-backend
user=asasxa
group=asasxa
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/mycloud/out.log
stderr_logfile=/var/log/mycloud/err.log
environment=PATH="/home/asasxa/fpy-diplom/fry-dip-backend/venv/bin",\\
DJANGO_SETTINGS_MODULE="mycloud.settings",\\
PYTHONPATH="/home/asasxa/fpy-diplom/fry-dip-backend",\\
DEBUG="False",\\
SECRET_KEY="your_secret_key",\\
ALLOWED_HOSTS="194.67.121.233,localhost",\\
DB_NAME="mycloud_db",\\
DB_USER="mycloud_user",\\
DB_PASSWORD="secure_password",\\
DB_HOST="localhost",\\
DB_PORT="5432",\\
STORAGE_BASE_DIR="/home/asasxa/fpy-diplom/fry-dip-backend/storage"

```

Примените конфигурацию:
```bash
sudo mkdir -p /var/log/mycloud
sudo chown asasxa:asasxa /var/log/mycloud
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start mycloud
```

5. Настройка Nginx
Создайте /etc/nginx/sites-available/mycloud:
```
server {
    listen 80;
    server_name 194.67.121.233;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name 194.67.121.233;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    location / {
        root /var/www/mycloud;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://unix:/home/asasxa/fpy-diplom/fry-dip-backend/mycloud.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        proxy_pass http://unix:/home/asasxa/fpy-diplom/fry-dip-backend/mycloud.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /media/ {
        alias /home/asasxa/fpy-diplom/fry-dip-backend/media/;
    }
}
```

Активируйте конфиг:
```bash
sudo ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Автоматическое обновление (скрипт deploy.sh)
Проект включает скрипт deploy.sh для быстрого обновления кода на сервере после пуша в репозиторий.
#### Использование:

```bash
# Перейти в папку проекта
cd ~/fpy-diplom
```
Дайте права на выполнение
```bash
chmod +x deploy.sh
```
```bash
# На сервере, в корне проекта:
./deploy.sh
```
Если вы находитесь не в папке со скриптом, укажите полный путь:
```bash
~/fpy-diplom/deploy.sh
```

Что делает скрипт:
✅ Забирает последние изменения из GitHub (git pull)
✅ Обновляет зависимости бэкенда (pip install)
✅ Применяет миграции БД и собирает статику
✅ Собирает фронтенд (npm run build) и копирует в /var/www/mycloud
✅ Перезапускает Gunicorn (через Supervisor) и Nginx
Требования к скрипту:
Пользователь asasxa имеет права sudo без пароля для команд:
supervisorctl, systemctl restart nginx, cp, chown, rm
Настроены права на папку /var/www/mycloud

Права доступа
Папка storage/ должна быть доступна для чтения/записи пользователю, от имени которого запущен Gunicorn.
Сокет mycloud.sock создаётся с правами 777 (--umask 000) для доступа Nginx.
Файлы в /var/www/mycloud/ должны принадлежать www-data.
HTTPS
Для работы Clipboard API и безопасной передачи данных рекомендуется использовать HTTPS. 
В инструкции выше приведён пример настройки с самоподписанным сертификатом.

Проверка работоспособности:
Откройте https://194.67.121.233 в браузере.
Зарегистрируйте нового пользователя.
Загрузите файл, проверьте предпросмотр и скачивание.
Скопируйте специальную ссылку — она должна работать без авторизации.
Войдите под администратором и проверьте панель управления пользователями.
Логи для отладки:
```bash
# Логи Gunicorn / Django
sudo tail -f /var/log/mycloud/err.log

# Логи Nginx
sudo tail -f /var/log/nginx/error.log

# Статус сервисов
sudo supervisorctl status mycloud
sudo systemctl status nginx
```

Дополнительные команды
```bash
# Создать миграции после изменения моделей
python manage.py makemigrations

# Проверить настройки проекта
python manage.py check --deploy

# Очистить кэш статики
python manage.py collectstatic --clear --noinput

```