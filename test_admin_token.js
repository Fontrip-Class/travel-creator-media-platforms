/**
 * 測試管理員令牌內容
 */

const API_BASE_URL = 'http://localhost:8000/api';

async function testAdminToken() {
    console.log('🔍 測試管理員令牌...\n');

    try {
        // 登入獲取令牌
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'pittchao@gmail.com',
                password: 'admin123'
            })
        });

        const loginData = await loginResponse.json();
        console.log('📋 登入響應:', JSON.stringify(loginData, null, 2));

        if (loginData.success && loginData.data?.token) {
            const token = loginData.data.token;
            console.log('\n🔑 令牌獲取成功');

            // 解析JWT令牌內容（不驗證簽名）
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('📄 令牌內容:', JSON.stringify(payload, null, 2));

            // 測試個人資料API
            const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const profileData = await profileResponse.json();
            console.log('\n👤 個人資料API響應:', JSON.stringify(profileData, null, 2));

            // 測試管理員儀表板
            const dashboardResponse = await fetch(`${API_BASE_URL}/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const dashboardData = await dashboardResponse.json();
            console.log('\n📊 管理員儀表板響應:');
            console.log(`狀態: ${dashboardResponse.status}`);
            console.log('內容:', JSON.stringify(dashboardData, null, 2));

        } else {
            console.log('❌ 登入失敗:', loginData.message);
        }

    } catch (error) {
        console.log('❌ 測試失敗:', error.message);
    }
}

testAdminToken();

