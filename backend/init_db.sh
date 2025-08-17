#!/bin/bash

# 旅遊平台資料庫初始化腳本

echo "========================================"
echo "旅遊平台資料庫初始化腳本"
echo "========================================"
echo

# 檢查PHP是否安裝
if ! command -v php &> /dev/null; then
    echo "❌ 錯誤: 未找到PHP，請先安裝PHP"
    echo "請訪問: https://www.php.net/downloads"
    exit 1
fi

echo "✓ PHP已安裝"
echo

# 檢查composer依賴
if [ ! -f "vendor/autoload.php" ]; then
    echo "📦 安裝Composer依賴..."
    composer install --no-dev --optimize-autoloader
    if [ $? -ne 0 ]; then
        echo "❌ 錯誤: Composer依賴安裝失敗"
        exit 1
    fi
    echo "✓ Composer依賴安裝完成"
    echo
fi

# 檢查環境變數文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到.env文件，將使用默認配置"
    echo "建議創建.env文件以自定義資料庫配置"
    echo
fi

# 執行資料庫初始化
echo "🚀 開始初始化資料庫..."
echo

php database/init_database.php

if [ $? -ne 0 ]; then
    echo
    echo "❌ 資料庫初始化失敗"
    echo "請檢查錯誤信息並修復問題"
    exit 1
else
    echo
    echo "✅ 資料庫初始化成功！"
    echo
    echo "📋 下一步操作:"
    echo "1. 檢查資料庫表結構是否正確"
    echo "2. 更新前後台程式以匹配新的資料庫結構"
    echo "3. 執行測試以驗證功能正常"
    echo
fi
