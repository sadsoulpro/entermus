# Muslink — Инструкция по деплою

## Технологический стек

### Backend
- **Python 3.11+**
- **FastAPI** — веб-фреймворк
- **Uvicorn** — ASGI сервер
- **Motor** — асинхронный драйвер MongoDB
- **PyJWT** — аутентификация
- **Resend** — отправка email
- **Pillow** — обработка изображений

### Frontend
- **Node.js 18+**
- **React 18** — UI библиотека
- **Vite/CRA** — сборка
- **TailwindCSS** — стили
- **Shadcn/UI** — компоненты
- **Framer Motion** — анимации

### База данных
- **MongoDB 6.0+**

### Веб-сервер
- **Caddy** — реверс-прокси с автоматическим HTTPS

---

## Требования к серверу

| Ресурс | Минимум | Рекомендуется |
|--------|---------|---------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Диск | 10 GB SSD | 20 GB SSD |
| ОС | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

---

## Переменные окружения

### Backend (`/app/backend/.env`)

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017/muslink
DB_NAME=muslink

# JWT (обязательно изменить на production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Owner account (получит роль owner при регистрации)
OWNER_EMAIL=your-email@example.com

# URLs
FRONTEND_URL=https://mus.link
MAIN_DOMAIN=mus.link
CORS_ORIGINS=https://mus.link

# Email (Resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=noreply@mus.link

# AI Cover Generation (опционально)
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxx
```

### Frontend (`/app/frontend/.env`)

```env
REACT_APP_BACKEND_URL=https://mus.link
```

---

## Пошаговая установка

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка базовых пакетов
sudo apt install -y curl git build-essential

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Установка MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Установка Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 3. Клонирование проекта

```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/muslink.git
sudo chown -R $USER:$USER /var/www/muslink
cd /var/www/muslink
```

### 4. Настройка Backend

```bash
cd /var/www/muslink/backend

# Создание виртуального окружения
python3.11 -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install --upgrade pip
pip install -r requirements.txt

# Создание .env файла
cp .env.example .env
nano .env  # Заполнить переменные
```

### 5. Настройка Frontend

```bash
cd /var/www/muslink/frontend

# Установка зависимостей
npm install  # или yarn install

# Создание .env файла
echo "REACT_APP_BACKEND_URL=https://mus.link" > .env

# Сборка production версии
npm run build  # или yarn build
```

### 6. Настройка Systemd для Backend

```bash
sudo nano /etc/systemd/system/muslink-backend.service
```

```ini
[Unit]
Description=Muslink Backend API
After=network.target mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/muslink/backend
Environment="PATH=/var/www/muslink/backend/venv/bin"
EnvironmentFile=/var/www/muslink/backend/.env
ExecStart=/var/www/muslink/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable muslink-backend
sudo systemctl start muslink-backend
```

### 7. Настройка Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

```caddyfile
mus.link {
    # Логи
    log {
        output file /var/log/caddy/muslink.log
    }

    # API запросы -> Backend
    handle /api/* {
        reverse_proxy localhost:8001
    }

    # Загруженные файлы
    handle /uploads/* {
        root * /var/www/muslink/backend
        file_server
    }

    # Статика Frontend
    handle {
        root * /var/www/muslink/frontend/build
        try_files {path} /index.html
        file_server
    }

    # Сжатие
    encode gzip zstd

    # Заголовки безопасности
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }
}

# Редирект с www
www.mus.link {
    redir https://mus.link{uri} permanent
}
```

```bash
# Создание папки для логов
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

# Проверка конфигурации
sudo caddy validate --config /etc/caddy/Caddyfile

# Перезапуск Caddy
sudo systemctl restart caddy
```

---

## Структура файлов на сервере

```
/var/www/muslink/
├── backend/
│   ├── venv/
│   ├── server.py
│   ├── requirements.txt
│   ├── .env
│   └── uploads/
├── frontend/
│   ├── build/          # Собранный React
│   ├── package.json
│   └── .env
└── DEPLOY.md
```

---

## Полезные команды

### Логи

```bash
# Backend логи
sudo journalctl -u muslink-backend -f

# Caddy логи
sudo tail -f /var/log/caddy/muslink.log

# MongoDB логи
sudo tail -f /var/log/mongodb/mongod.log
```

### Управление сервисами

```bash
# Перезапуск backend
sudo systemctl restart muslink-backend

# Статус сервисов
sudo systemctl status muslink-backend caddy mongod

# Перезагрузка Caddy без даунтайма
sudo caddy reload --config /etc/caddy/Caddyfile
```

### Обновление приложения

```bash
cd /var/www/muslink

# Получить изменения
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart muslink-backend

# Frontend
cd ../frontend
npm install
npm run build
sudo caddy reload --config /etc/caddy/Caddyfile
```

---

## Настройка OG-тегов для публичных страниц

Для корректного отображения превью в соцсетях при шаринге ссылок вида `mus.link/slug`, добавьте в Caddyfile:

```caddyfile
mus.link {
    # OG теги для публичных страниц (перед handle /api/*)
    @ogbots {
        header_regexp User-Agent (?i)(facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot)
    }
    
    handle @ogbots {
        rewrite * /api/s{uri}
        reverse_proxy localhost:8001
    }

    # ... остальная конфигурация
}
```

---

## Бэкап MongoDB

```bash
# Создание бэкапа
mongodump --db muslink --out /var/backups/mongodb/$(date +%Y%m%d)

# Восстановление
mongorestore --db muslink /var/backups/mongodb/20250117/muslink
```

---

## Firewall (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (для редиректа)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## SSL/TLS

Caddy автоматически получает и обновляет SSL-сертификаты от Let's Encrypt. Убедитесь, что:

1. Домен направлен на IP сервера (A-запись в DNS)
2. Порты 80 и 443 открыты
3. Caddy запущен от имени root или имеет capability для привязки к портам < 1024

---

## Мониторинг

Рекомендуемые инструменты:
- **htop** — мониторинг ресурсов
- **Netdata** — веб-панель мониторинга
- **UptimeRobot** — внешний мониторинг доступности

---

## Контакты

При возникновении проблем создайте issue в репозитории или напишите на email владельца.
