# 🚀 旅遊平台生產環境完整部署指南

## 📋 目錄
1. [系統需求](#系統需求)
2. [環境準備](#環境準備)
3. [後端部署](#後端部署)
4. [前端部署](#前端部署)
5. [資料庫配置](#資料庫配置)
6. [Web伺服器配置](#web伺服器配置)
7. [SSL證書配置](#ssl證書配置)
8. [監控和備份](#監控和備份)
9. [安全配置](#安全配置)
10. [性能優化](#性能優化)
11. [故障排除](#故障排除)

## 🖥️ 系統需求

### 最低配置
- **CPU**: 2核心
- **記憶體**: 4GB RAM
- **硬碟**: 50GB SSD
- **網路**: 100Mbps

### 推薦配置
- **CPU**: 4核心以上
- **記憶體**: 8GB RAM以上
- **硬碟**: 100GB SSD以上
- **網路**: 1Gbps

### 軟體需求
- **作業系統**: Ubuntu 20.04 LTS / CentOS 8 / Windows Server 2019
- **PHP**: 8.1+
- **PostgreSQL**: 14+
- **Redis**: 6.0+
- **Nginx**: 1.18+ / Apache: 2.4+
- **Node.js**: 18+ (前端構建)

## 🔧 環境準備

### 1. 更新系統
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y

# 安裝基本工具
sudo apt install -y curl wget git unzip software-properties-common
```

### 2. 安裝PHP 8.1
```bash
# Ubuntu/Debian
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.1 php8.1-fpm php8.1-pgsql php8.1-gd php8.1-mbstring php8.1-xml php8.1-curl php8.1-zip php8.1-bcmath

# 啟用PHP-FPM
sudo systemctl enable php8.1-fpm
sudo systemctl start php8.1-fpm
```

### 3. 安裝PostgreSQL 14
```bash
# Ubuntu/Debian
sudo apt install -y postgresql-14 postgresql-14-postgis-3

# 啟動服務
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 安裝PostGIS擴展
sudo -u postgres psql -c "CREATE EXTENSION postgis;"
sudo -u postgres psql -c "CREATE EXTENSION \"uuid-ossp\";"
sudo -u postgres psql -c "CREATE EXTENSION \"pg_trgm\";"
```

### 4. 安裝Redis
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 5. 安裝Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

## 🚀 後端部署

### 1. 下載專案
```bash
cd /var/www
sudo git clone https://github.com/your-username/travel-creator-media-platforms.git
sudo chown -R www-data:www-data travel-creator-media-platforms
cd travel-creator-media-platforms/backend
```

### 2. 安裝依賴
```bash
composer install --no-dev --optimize-autoloader --classmap-authoritative
```

### 3. 配置環境變數
```bash
cp env.production.example .env
sudo nano .env
```

### 4. 創建必要目錄
```bash
sudo mkdir -p logs uploads cache backups
sudo chown -R www-data:www-data logs uploads cache backups
sudo chmod -R 755 logs uploads cache backups
```

### 5. 設置資料庫
```bash
# 創建資料庫用戶
sudo -u postgres createuser --interactive travel_platform_user

# 創建資料庫
sudo -u postgres createdb -O travel_platform_user travel_platform_prod

# 執行資料庫結構
sudo -u postgres psql -d travel_platform_prod -f database/schema_v2.sql
```

### 6. 測試後端
```bash
# 測試健康檢查
curl http://localhost:8000/api/health

# 測試資料庫連接
php scripts/monitor.php
```

## 🎨 前端部署

### 1. 安裝Node.js
```bash
# 使用NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 驗證安裝
node --version
npm --version
```

### 2. 構建前端
```bash
cd /var/www/travel-creator-media-platforms
npm install
npm run build
```

### 3. 配置環境變數
```bash
# 創建前端環境文件
cat > .env.production << EOF
VITE_API_BASE_URL=https://your-domain.com/api
VITE_APP_NAME=旅遊創作者媒體平台
VITE_APP_VERSION=2.0.0
EOF
```

## 🗄️ 資料庫配置

### 1. 優化PostgreSQL配置
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

添加以下配置：
```ini
# 記憶體配置
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# 連接配置
max_connections = 100
max_worker_processes = 8
max_parallel_workers_per_gather = 4

# 日誌配置
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB

# 性能配置
random_page_cost = 1.1
effective_io_concurrency = 200
```

### 2. 重啟PostgreSQL
```bash
sudo systemctl restart postgresql
```

## 🌐 Web伺服器配置

### 選擇1: Nginx配置

#### 1. 安裝Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### 2. 配置Nginx
```bash
# 複製配置
sudo cp nginx.conf /etc/nginx/sites-available/travel-platform
sudo ln -s /etc/nginx/sites-available/travel-platform /etc/nginx/sites-enabled/

# 測試配置
sudo nginx -t

# 重啟Nginx
sudo systemctl restart nginx
```

### 選擇2: Apache配置

#### 1. 安裝Apache
```bash
sudo apt install -y apache2 libapache2-mod-php8.1
sudo a2enmod rewrite ssl headers expires deflate
sudo systemctl enable apache2
sudo systemctl start apache2
```

#### 2. 配置Apache
```bash
# 複製配置
sudo cp apache.conf /etc/apache2/sites-available/travel-platform.conf
sudo a2ensite travel-platform

# 測試配置
sudo apache2ctl configtest

# 重啟Apache
sudo systemctl restart apache2
```

## 🔒 SSL證書配置

### 使用Let's Encrypt

#### 1. 安裝Certbot
```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx
# 或
sudo apt install -y certbot python3-certbot-apache
```

#### 2. 獲取證書
```bash
# Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Apache
sudo certbot --apache -d your-domain.com -d www.your-domain.com
```

#### 3. 自動續期
```bash
# 測試自動續期
sudo certbot renew --dry-run

# 添加到crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 📊 監控和備份

### 1. 安裝Supervisor
```bash
sudo apt install -y supervisor
sudo systemctl enable supervisor
sudo systemctl start supervisor
```

### 2. 配置Supervisor
```bash
sudo cp supervisor.conf /etc/supervisor/conf.d/travel-platform.conf
sudo supervisorctl reread
sudo supervisorctl update
```

### 3. 設置備份
```bash
# 手動備份
php scripts/backup.php

# 自動備份 (添加到crontab)
echo "0 2 * * * cd /var/www/travel-creator-media-platforms/backend && php scripts/backup.php" | sudo crontab -
```

### 4. 設置監控
```bash
# 手動監控
php scripts/monitor.php

# 自動監控 (每5分鐘)
echo "*/5 * * * * cd /var/www/travel-creator-media-platforms/backend && php scripts/monitor.php" | sudo crontab -
```

## 🛡️ 安全配置

### 1. 防火牆配置
```bash
# 安裝UFW
sudo apt install -y ufw

# 配置規則
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 啟用防火牆
sudo ufw enable
```

### 2. 文件權限
```bash
# 設置正確的權限
sudo find /var/www/travel-creator-media-platforms -type f -exec chmod 644 {} \;
sudo find /var/www/travel-creator-media-platforms -type d -exec chmod 755 {} \;

# 設置特殊權限
sudo chmod 755 /var/www/travel-creator-media-platforms/backend/scripts/*.php
sudo chmod 644 /var/www/travel-creator-media-platforms/backend/.env
```

### 3. 安全標頭
確保Web伺服器配置中包含安全標頭：
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Strict-Transport-Security
- Content-Security-Policy

## ⚡ 性能優化

### 1. PHP-FPM優化
```bash
sudo nano /etc/php/8.1/fpm/pool.d/www.conf
```

添加以下配置：
```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 1000
```

### 2. Redis優化
```bash
sudo nano /etc/redis/redis.conf
```

添加以下配置：
```ini
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. 啟用OPcache
```bash
sudo apt install -y php8.1-opcache
sudo nano /etc/php/8.1/fpm/conf.d/10-opcache.ini
```

添加以下配置：
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
```

## 🔍 故障排除

### 1. 常見問題

#### 資料庫連接失敗
```bash
# 檢查PostgreSQL狀態
sudo systemctl status postgresql

# 檢查連接
sudo -u postgres psql -c "\l"

# 檢查日誌
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### PHP-FPM問題
```bash
# 檢查狀態
sudo systemctl status php8.1-fpm

# 檢查配置
sudo php-fpm8.1 -t

# 檢查日誌
sudo tail -f /var/log/php8.1-fpm.log
```

#### Nginx/Apache問題
```bash
# 檢查狀態
sudo systemctl status nginx
sudo systemctl status apache2

# 檢查配置
sudo nginx -t
sudo apache2ctl configtest

# 檢查日誌
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/apache2/error.log
```

### 2. 日誌查看
```bash
# 應用日誌
tail -f /var/www/travel-creator-media-platforms/backend/logs/app.log

# 錯誤日誌
tail -f /var/www/travel-creator-media-platforms/backend/logs/error.log

# 監控日誌
tail -f /var/www/travel-creator-media-platforms/backend/logs/monitor.log
```

### 3. 性能診斷
```bash
# 檢查系統資源
htop
iotop
nethogs

# 檢查網路連接
netstat -tulpn
ss -tulpn

# 檢查磁碟使用
df -h
du -sh /var/www/travel-creator-media-platforms/*
```

## 📚 維護和更新

### 1. 定期維護
```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 清理日誌
sudo find /var/log -name "*.log" -mtime +30 -delete

# 清理備份
sudo find /var/www/travel-creator-media-platforms/backend/backups -name "*.sql.gz" -mtime +90 -delete
```

### 2. 監控檢查
- 每日檢查系統狀態
- 每週檢查日誌文件
- 每月檢查性能指標
- 每季度進行安全審計

### 3. 備份策略
- 資料庫：每日備份，保留30天
- 文件：每週備份，保留12週
- 配置：每次修改後備份
- 測試：每月測試備份恢復

## 🎯 部署檢查清單

### 部署前檢查
- [ ] 系統需求滿足
- [ ] 網路配置正確
- [ ] 域名解析設置
- [ ] SSL證書準備

### 部署中檢查
- [ ] 後端服務正常
- [ ] 前端構建成功
- [ ] 資料庫連接正常
- [ ] Web伺服器配置正確

### 部署後檢查
- [ ] 所有API端點正常
- [ ] 前端頁面正常顯示
- [ ] SSL證書正常工作
- [ ] 監控系統正常運行
- [ ] 備份系統正常運行

## 🆘 緊急聯繫

### 技術支援
- 開發團隊：[開發團隊聯繫方式]
- 運維團隊：[運維團隊聯繫方式]
- 安全團隊：[安全團隊聯繫方式]

### 升級路徑
- 小版本升級：[升級流程]
- 大版本升級：[升級流程]
- 緊急修復：[修復流程]

---

**部署完成時間**: ___________  
**部署負責人**: ___________  
**檢查完成時間**: ___________  
**檢查負責人**: ___________

## 📖 相關文檔

- [快速開始指南](backend/QUICK_START_OPTIMIZED.md)
- [部署檢查清單](backend/DEPLOYMENT_CHECKLIST.md)
- [優化總結](backend/OPTIMIZATION_SUMMARY.md)
- [Windows安裝指南](backend/WINDOWS_INSTALL.md)

---

**祝您部署順利！🚀**
