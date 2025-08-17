#!/usr/bin/env node

/**
 * 後端API測試腳本
 * 檢查後端服務狀態和API端點
 */

const API_BASE_URL = 'http://localhost:8000/api';

async function testBackend() {
  console.log('🧪 開始測試後端服務...\n');

  // 測試健康檢查
  console.log('1. 測試健康檢查端點...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log(`   狀態碼: ${healthResponse.status}`);
    console.log(`   響應:`, healthData);
    console.log('   ✅ 健康檢查通過\n');
  } catch (error) {
    console.log(`   ❌ 健康檢查失敗: ${error.message}\n`);
  }

  // 測試註冊端點
  console.log('2. 測試註冊端點...');
  try {
    const testUserData = {
      username: 'test_user',
      email: 'test@example.com',
      password: 'test123456',
      role: 'creator'
    };

    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData)
    });

    const registerData = await registerResponse.json();
    console.log(`   狀態碼: ${registerResponse.status}`);
    console.log(`   響應:`, registerData);
    
    if (registerResponse.ok) {
      console.log('   ✅ 註冊端點正常\n');
    } else {
      console.log(`   ⚠️ 註冊端點返回錯誤: ${registerData.message || '未知錯誤'}\n`);
    }
  } catch (error) {
    console.log(`   ❌ 註冊端點測試失敗: ${error.message}\n`);
  }

  // 測試登入端點
  console.log('3. 測試登入端點...');
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'test123456'
    };

    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const loginResponseData = await loginResponse.json();
    console.log(`   狀態碼: ${loginResponse.status}`);
    console.log(`   響應:`, loginResponseData);
    
    if (loginResponse.ok) {
      console.log('   ✅ 登入端點正常\n');
    } else {
      console.log(`   ⚠️ 登入端點返回錯誤: ${loginResponseData.message || '未知錯誤'}\n`);
    }
  } catch (error) {
    console.log(`   ❌ 登入端點測試失敗: ${error.message}\n`);
  }

  // 測試數據庫連接
  console.log('4. 測試數據庫連接...');
  try {
    const dbResponse = await fetch(`${API_BASE_URL}/test`);
    const dbData = await dbResponse.json();
    console.log(`   狀態碼: ${dbResponse.status}`);
    console.log(`   響應:`, dbData);
    
    if (dbResponse.ok) {
      console.log('   ✅ 數據庫連接正常\n');
    } else {
      console.log(`   ❌ 數據庫連接失敗: ${dbData.message || '未知錯誤'}\n`);
    }
  } catch (error) {
    console.log(`   ❌ 數據庫連接測試失敗: ${error.message}\n`);
  }

  console.log('🎯 後端測試完成！');
}

// 執行測試
testBackend().catch(console.error);
