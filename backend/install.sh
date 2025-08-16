#!/bin/bash

echo "🚀 開始安裝旅遊創作者媒體平台後端..."

# 檢查PHP版本
echo "📋 檢查PHP版本..."
if ! command -v php &> /dev/null; then
    echo "❌ PHP未安裝，請先安裝PHP 8.1+"
    exit 1
fi

PHP_VERSION=$(php -r "echo PHP_VERSION;")
echo "✅ PHP版本: $PHP_VERSION"

# 檢查Composer
echo "📋 檢查Composer..."
if ! command -v composer &> /dev/null; then
    echo "❌ Composer未安裝，請先安裝Composer"
    exit 1
fi

echo "✅ Composer已安裝"

# 檢查PostgreSQL
echo "📋 檢查PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL未安裝，請先安裝PostgreSQL 14+"
    exit 1
fi

echo "✅ PostgreSQL已安裝"

# 安裝PHP依賴
echo "📦 安裝PHP依賴..."
composer install --no-dev --optimize-autoloader

# 創建必要目錄
echo "📁 創建必要目錄..."
mkdir -p logs
mkdir -p uploads
chmod 755 logs uploads

# 複製環境變數文件
if [ ! -f .env ]; then
    echo "📝 複製環境變數文件..."
    cp env.example .env
    echo "⚠️  請編輯 .env 文件，配置資料庫連接參數"
fi

# 檢查資料庫連接
echo "🔗 檢查資料庫連接..."
if [ -f .env ]; then
    source .env
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        echo "✅ 資料庫連接成功"
        
        # 執行資料庫結構腳本
        echo "🗄️  執行資料庫結構腳本..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -f database/schema.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ 資料庫結構創建成功"
        else
            echo "❌ 資料庫結構創建失敗"
        fi
    else
        echo "❌ 資料庫連接失敗，請檢查 .env 文件中的配置"
        echo "💡 請確保："
        echo "   1. PostgreSQL服務正在運行"
        echo "   2. 資料庫已創建"
        echo "   3. 用戶權限正確"
        echo "   4. PostGIS擴展已啟用"
    fi
else
    echo "❌ .env 文件不存在，請先配置環境變數"
fi

echo ""
echo "🎉 安裝完成！"
echo ""
echo "📋 下一步："
echo "   1. 編輯 .env 文件，配置資料庫連接"
echo "   2. 確保PostgreSQL和PostGIS已正確安裝"
echo "   3. 運行 'composer start' 啟動服務"
echo "   4. 訪問 http://localhost:8000/api/health 檢查服務狀態"
echo ""
echo "📚 詳細文檔請參考 README.md"
