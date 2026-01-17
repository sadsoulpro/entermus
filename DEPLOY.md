# Muslink — Установка на Ubuntu 24.04 LTS

## Конфигурация сервера

| Параметр | Значение |
|----------|----------|
| ОС | Ubuntu 24.04 LTS |
| CPU | 4 ядра |
| RAM | 8 GB |
| Системный диск | 80 GB NVMe SSD |
| Volume для данных | 100 GB |
| IP | 91.98.169.75 |
| Домен | mus.link |

---

## Архитектура

```
                    ┌─────────────────┐
                    │   mus.link      │
                    │   (Cloudflare)  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  91.98.169.75   │
                    │     Caddy       │
                    │   :80 / :443    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ React Build   │  │ FastAPI Backend │  │    MongoDB      │
│ /var/www/...  │  │   :8001         │  │    :27017       │
│   (статика)   │  │                 │  │  /data/mongodb  │
└───────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Шаг 1: Первичная настройка сервера

```bash
# Подключение к серверу
ssh root@91.98.169.75

# Обновление системы
apt update && apt upgrade -y

# Установка базовых пакетов
apt install -y \
    curl \
    wget \
    git \
    htop \
    nano \
    unzip \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Настройка временной зоны
timedatectl set-timezone Europe/Moscow

# Настройка hostname
hostnamectl set-hostname muslink
```

---

## Шаг 2: Подключение и монтирование Volume (100 GB)

```bash
# Проверка доступных дисков
lsblk

# Обычно volume будет /dev/vdb или /dev/sdb
# Проверка что диск пустой
sudo file -s /dev/vdb

# Форматирование в ext4 (если диск новый!)
sudo mkfs.ext4 /dev/vdb

# Создание точки монтирования
sudo mkdir -p /data

# Монтирование
sudo mount /dev/vdb /data

# Получение UUID диска
sudo blkid /dev/vdb
# Запомните UUID, например: UUID="a1b2c3d4-..."

# Добавление в fstab для автомонтирования
sudo nano /etc/fstab
```

Добавьте строку (замените UUID на ваш):
```
UUID=a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx /data ext4 defaults,nofail 0 2
```

```bash
# Проверка монтирования
sudo mount -a
df -h | grep /data

# Создание структуры директорий
sudo mkdir -p /data/mongodb
sudo mkdir -p /data/uploads
sudo mkdir -p /data/backups
```

---

## Шаг 3: Установка MongoDB 7.0

```bash
# Импорт GPG ключа MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Добавление репозитория для Ubuntu 24.04 (noble)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Установка
sudo apt update
sudo apt install -y mongodb-org

# Остановка MongoDB для настройки
sudo systemctl stop mongod
```

### Настройка MongoDB для хранения на volume

```bash
sudo nano /etc/mongod.conf
```

Замените содержимое на:

```yaml
# mongod.conf

# Хранение данных
storage:
  dbPath: /data/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2

# Логирование
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Сеть
net:
  port: 27017
  bindIp: 127.0.0.1

# Безопасность
security:
  authorization: disabled

# Процесс
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
```

```bash
# Установка прав на директорию данных
sudo chown -R mongodb:mongodb /data/mongodb

# Запуск MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Проверка статуса
sudo systemctl status mongod

# Проверка подключения
mongosh --eval "db.runCommand({ ping: 1 })"
```

---

## Шаг 4: Установка Node.js 20 LTS

```bash
# Установка Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версий
node -v   # v20.x.x
npm -v    # 10.x.x

# Установка yarn глобально
sudo npm install -g yarn
```

---

## Шаг 5: Установка Python 3.12

Ubuntu 24.04 уже содержит Python 3.12:

```bash
# Проверка версии
python3 --version   # Python 3.12.x

# Установка pip и venv
sudo apt install -y python3-pip python3-venv python3-dev

# Проверка pip
pip3 --version
```

---

## Шаг 6: Установка Caddy

```bash
# Добавление репозитория Caddy
sudo apt install -y debian-keyring debian-archive-keyring

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
   sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
   sudo tee /etc/apt/sources.list.d/caddy-stable.list

# Установка
sudo apt update
sudo apt install -y caddy

# Проверка версии
caddy version
```

---

## Шаг 7: Клонирование проекта

```bash
# Создание директории
sudo mkdir -p /var/www
cd /var/www

# Клонирование репозитория (замените на ваш)
sudo git clone https://github.com/YOUR_USERNAME/muslink.git

# Установка владельца
sudo chown -R www-data:www-data /var/www/muslink
sudo chmod -R 755 /var/www/muslink

cd /var/www/muslink
```

---

## Шаг 8: Настройка Backend

```bash
cd /var/www/muslink/backend

# Создание виртуального окружения
sudo -u www-data python3 -m venv venv

# Активация окружения
source venv/bin/activate

# Обновление pip
pip install --upgrade pip

# Установка зависимостей
pip install -r requirements.txt

# Деактивация
deactivate
```

### Создание .env файла

```bash
sudo nano /var/www/muslink/backend/.env
```

```env
# ===== DATABASE =====
MONGO_URL=mongodb://127.0.0.1:27017/muslink
DB_NAME=muslink

# ===== SECURITY =====
# Сгенерируйте: openssl rand -hex 32
JWT_SECRET=ЗАМЕНИТЕ_НА_СВОЙ_СЕКРЕТНЫЙ_КЛЮЧ_МИНИМУМ_32_СИМВОЛА

# ===== OWNER =====
# Email для получения роли owner при регистрации
OWNER_EMAIL=ваш-email@example.com

# ===== URLS =====
FRONTEND_URL=https://mus.link
MAIN_DOMAIN=mus.link
CORS_ORIGINS=https://mus.link,https://www.mus.link

# ===== EMAIL (Resend.com) =====
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
SENDER_EMAIL=noreply@mus.link

# ===== UPLOADS =====
UPLOADS_PATH=/data/uploads

# ===== AI (опционально) =====
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
```

```bash
# Установка прав
sudo chown www-data:www-data /var/www/muslink/backend/.env
sudo chmod 600 /var/www/muslink/backend/.env
```

---

## Шаг 9: Настройка Frontend

```bash
cd /var/www/muslink/frontend

# Установка зависимостей
sudo -u www-data yarn install

# Создание .env
sudo nano /var/www/muslink/frontend/.env
```

```env
REACT_APP_BACKEND_URL=https://mus.link
```

```bash
# Сборка production версии
sudo -u www-data yarn build

# Проверка сборки
ls -la /var/www/muslink/frontend/build/
```

---

## Шаг 10: Создание Systemd сервиса

```bash
sudo nano /etc/systemd/system/muslink.service
```

```ini
[Unit]
Description=Muslink Backend API
After=network.target mongod.service
Wants=mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/muslink/backend

# Окружение
Environment="PATH=/var/www/muslink/backend/venv/bin:/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=/var/www/muslink/backend/.env

# Запуск Uvicorn
ExecStart=/var/www/muslink/backend/venv/bin/uvicorn server:app \
    --host 127.0.0.1 \
    --port 8001 \
    --workers 4 \
    --loop uvloop \
    --http httptools

# Перезапуск при падении
Restart=always
RestartSec=5
StartLimitIntervalSec=60
StartLimitBurst=3

# Логирование
StandardOutput=append:/var/log/muslink/backend.log
StandardError=append:/var/log/muslink/error.log

# Лимиты
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
# Создание директории для логов
sudo mkdir -p /var/log/muslink
sudo chown www-data:www-data /var/log/muslink

# Права на uploads
sudo chown -R www-data:www-data /data/uploads

# Перезагрузка systemd
sudo systemctl daemon-reload

# Включение и запуск сервиса
sudo systemctl enable muslink
sudo systemctl start muslink

# Проверка статуса
sudo systemctl status muslink

# Проверка что API работает
curl http://127.0.0.1:8001/api/auth/login \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
```

---

## Шаг 11: Настройка Caddy

```bash
sudo nano /etc/caddy/Caddyfile
```

```caddyfile
# ============================
# Muslink - Caddy Configuration
# Domain: mus.link
# Server: 91.98.169.75
# ============================

mus.link {
    # ========== LOGGING ==========
    log {
        output file /var/log/caddy/access.log {
            roll_size 50mb
            roll_keep 10
            roll_keep_for 720h
        }
        format json
    }

    # ========== OG BOTS (для превью в соцсетях) ==========
    @ogbots {
        header_regexp User-Agent (?i)(facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|vkShare|Viber|Pinterest|Googlebot)
    }

    # Роутинг для ботов - публичные страницы
    @publicpath {
        not path /api/* /static/* /assets/* /login /register /forgot-password /reset-password/* /admin/*
    }

    handle @ogbots {
        handle @publicpath {
            rewrite * /api/s{uri}
            reverse_proxy 127.0.0.1:8001
        }
        handle {
            reverse_proxy 127.0.0.1:8001
        }
    }

    # ========== API ==========
    handle /api/* {
        reverse_proxy 127.0.0.1:8001 {
            header_up Host {host}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
            
            # Таймауты
            transport http {
                read_timeout 60s
                write_timeout 60s
            }
        }
    }

    # ========== UPLOADS ==========
    handle /uploads/* {
        root * /data
        file_server {
            precompressed gzip br
        }
        header Cache-Control "public, max-age=31536000, immutable"
    }

    # ========== FRONTEND (React) ==========
    handle {
        root * /var/www/muslink/frontend/build
        
        # SPA роутинг
        try_files {path} /index.html
        
        file_server {
            precompressed gzip br
        }
    }

    # ========== COMPRESSION ==========
    encode {
        gzip 6
        zstd
    }

    # ========== SECURITY HEADERS ==========
    header {
        # Безопасность
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        
        # Скрыть информацию о сервере
        -Server
        -X-Powered-By
    }

    # ========== STATIC CACHE ==========
    @staticFiles {
        path *.js *.css *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2 *.ttf *.eot
    }
    header @staticFiles {
        Cache-Control "public, max-age=31536000, immutable"
    }

    # ========== TLS ==========
    tls {
        protocols tls1.2 tls1.3
    }
}

# ========== WWW REDIRECT ==========
www.mus.link {
    redir https://mus.link{uri} permanent
}

# ========== HTTP REDIRECT ==========
http://mus.link, http://www.mus.link {
    redir https://mus.link{uri} permanent
}
```

```bash
# Создание директории для логов Caddy
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

# Проверка синтаксиса
sudo caddy validate --config /etc/caddy/Caddyfile

# Форматирование
sudo caddy fmt --overwrite /etc/caddy/Caddyfile

# Перезапуск Caddy
sudo systemctl restart caddy
sudo systemctl enable caddy

# Проверка статуса
sudo systemctl status caddy
```

---

## Шаг 12: Настройка DNS

В панели управления доменом mus.link добавьте A-записи:

| Тип | Имя | Значение | TTL |
|-----|-----|----------|-----|
| A | @ | 91.98.169.75 | 300 |
| A | www | 91.98.169.75 | 300 |

**Если используете Cloudflare:**
- Включите проксирование (оранжевое облако)
- SSL/TLS: Full (strict)
- Always Use HTTPS: On

---

## Шаг 13: Настройка Firewall

```bash
# Установка UFW
sudo apt install -y ufw

# Правила
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH
sudo ufw allow 22/tcp

# HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включение
sudo ufw enable

# Проверка
sudo ufw status verbose
```

---

## Шаг 14: Настройка Fail2ban

```bash
# Установка
sudo apt install -y fail2ban

# Создание локальной конфигурации
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h
```

```bash
# Запуск
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Проверка
sudo fail2ban-client status sshd
```

---

## Шаг 15: Автоматические бэкапы

```bash
sudo nano /data/backups/backup.sh
```

```bash
#!/bin/bash
# =============================================
# Muslink Backup Script
# =============================================

set -e

# Конфигурация
BACKUP_DIR="/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=14
CURRENT_BACKUP="$BACKUP_DIR/$DATE"

echo "=========================================="
echo "Starting backup: $DATE"
echo "=========================================="

# Создание директории
mkdir -p "$CURRENT_BACKUP"

# 1. Бэкап MongoDB
echo "[1/3] Backing up MongoDB..."
mongodump --db muslink --out "$CURRENT_BACKUP/mongodb" --quiet

# 2. Бэкап uploads
echo "[2/3] Backing up uploads..."
tar -czf "$CURRENT_BACKUP/uploads.tar.gz" -C /data uploads 2>/dev/null || true

# 3. Бэкап конфигов
echo "[3/3] Backing up configs..."
tar -czf "$CURRENT_BACKUP/configs.tar.gz" \
    /var/www/muslink/backend/.env \
    /var/www/muslink/frontend/.env \
    /etc/caddy/Caddyfile \
    /etc/systemd/system/muslink.service \
    2>/dev/null || true

# Удаление старых бэкапов
echo "Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true

# Размер бэкапа
BACKUP_SIZE=$(du -sh "$CURRENT_BACKUP" | cut -f1)

echo "=========================================="
echo "Backup completed!"
echo "Location: $CURRENT_BACKUP"
echo "Size: $BACKUP_SIZE"
echo "=========================================="
```

```bash
# Права на выполнение
sudo chmod +x /data/backups/backup.sh

# Тестовый запуск
sudo /data/backups/backup.sh

# Добавление в cron (каждый день в 4:00)
sudo crontab -e
```

Добавьте строку:
```
0 4 * * * /data/backups/backup.sh >> /var/log/muslink/backup.log 2>&1
```

---

## Шаг 16: Logrotate для логов

```bash
sudo nano /etc/logrotate.d/muslink
```

```
/var/log/muslink/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload muslink > /dev/null 2>&1 || true
    endscript
}
```

---

## Проверка установки

### Все сервисы

```bash
# Статус
sudo systemctl status mongod caddy muslink

# Порты
sudo ss -tlnp | grep -E "27017|8001|80|443"
```

### API

```bash
curl -s http://127.0.0.1:8001/api/health || echo "Backend не отвечает"
```

### HTTPS

```bash
curl -I https://mus.link
```

### Использование диска

```bash
df -h
du -sh /data/*
```

---

## Полезные команды

```bash
# ===== ЛОГИ =====
# Backend
sudo tail -f /var/log/muslink/backend.log
sudo tail -f /var/log/muslink/error.log

# Caddy
sudo tail -f /var/log/caddy/access.log

# MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# ===== ПЕРЕЗАПУСК =====
sudo systemctl restart muslink      # Backend
sudo systemctl restart caddy        # Веб-сервер
sudo systemctl restart mongod       # База данных

# ===== ОБНОВЛЕНИЕ КОДА =====
cd /var/www/muslink
sudo -u www-data git pull

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart muslink

# Frontend
cd ../frontend
sudo -u www-data yarn install
sudo -u www-data yarn build

# ===== МОНИТОРИНГ =====
htop                    # Процессы
df -h                   # Диски
free -h                 # Память
sudo journalctl -f      # Системные логи
```

---

## Готово! 🎉

После выполнения всех шагов:

1. Откройте https://mus.link
2. Зарегистрируйтесь с email из `OWNER_EMAIL`
3. Войдите в систему — вы получите роль owner
4. Создайте первую страницу для теста
5. Проверьте OG-теги: https://developers.facebook.com/tools/debug/

**Сервер готов к работе!**
