/**
 * 登入功能調試測試
 */

const API_BASE_URL = 'http://localhost:8000/api';

async function testLogin() {
    console.log('🔐 調試登入功能...\n');

    const testUsers = [
        { email: 'pittchao@gmail.com', password: 'admin123', role: 'admin' },
        { email: 'supplier@test.com', password: 'supplier123', role: 'supplier' },
        { email: 'creator@test.com', password: 'creator123', role: 'creator' }
    ];

    for (const user of testUsers) {
        console.log(`\n📝 測試用戶: ${user.email}`);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password
                })
            });

            const responseText = await response.text();
            console.log(`📊 HTTP狀態: ${response.status} ${response.statusText}`);
            console.log(`📄 響應內容: ${responseText}`);

            if (response.ok) {
                try {
                    const data = JSON.parse(responseText);
                    if (data.success && data.data?.token) {
                        console.log(`✅ ${user.role} 登入成功`);
                        console.log(`🔑 令牌: ${data.data.token.substring(0, 20)}...`);

                        // 測試令牌驗證
                        const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
                            headers: {
                                'Authorization': `Bearer ${data.data.token}`
                            }
                        });

                        const profileText = await profileResponse.text();
                        console.log(`👤 個人資料API: ${profileResponse.status} - ${profileText.substring(0, 100)}...`);

                    } else {
                        console.log(`❌ ${user.role} 登入失敗: ${data.message || '未知錯誤'}`);
                    }
                } catch (parseError) {
                    console.log(`❌ JSON解析失敗: ${parseError.message}`);
                }
            } else {
                console.log(`❌ HTTP錯誤: ${response.status} - ${responseText}`);
            }

        } catch (error) {
            console.log(`❌ 網路錯誤: ${error.message}`);
        }

        console.log('-'.repeat(50));
    }
}

testLogin().catch(console.error);

