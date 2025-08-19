/**
 * 用戶管理與任務管理整合測試腳本
 * 測試優化後的API端點和功能整合
 */

const API_BASE_URL = 'http://localhost:8000/api';

class IntegrationTester {
    constructor() {
        this.authToken = null;
        this.testResults = [];
    }

    /**
     * 執行完整的整合測試
     */
    async runFullIntegrationTest() {
        console.log('🚀 開始用戶管理與任務管理整合測試');
        console.log('='.repeat(50));

        try {
            // 1. 測試用戶認證
            await this.testUserAuthentication();

            // 2. 測試用戶管理API
            await this.testUserManagementAPI();

            // 3. 測試任務管理API
            await this.testTaskManagementAPI();

            // 4. 測試角色專用儀表板
            await this.testRoleDashboards();

            // 5. 測試權限檢查
            await this.testPermissionSystem();

            // 6. 測試數據整合
            await this.testDataIntegration();

            this.printTestSummary();

        } catch (error) {
            console.error('❌ 測試執行失敗:', error);
        }
    }

    /**
     * 測試用戶認證
     */
    async testUserAuthentication() {
        console.log('\n📝 測試用戶認證...');

        try {
                    // 測試登入 - 使用實際存在的測試用戶
        const loginResponse = await this.makeRequest('/auth/login', 'POST', {
            email: 'supplier@test.com',
            password: 'supplier123'
        });

            if (loginResponse.success && loginResponse.data?.token) {
                this.authToken = loginResponse.data.token;
                this.addTestResult('用戶登入', true, '登入成功，獲得認證令牌');
            } else {
                this.addTestResult('用戶登入', false, '登入失敗或未獲得令牌');
            }

            // 測試令牌驗證
            const validateResponse = await this.makeRequest('/users/profile', 'GET');

            this.addTestResult('令牌驗證', validateResponse.success,
                validateResponse.success ? '令牌驗證成功' : '令牌驗證失敗');

        } catch (error) {
            this.addTestResult('用戶認證', false, `認證測試失敗: ${error.message}`);
        }
    }

    /**
     * 測試用戶管理API
     */
    async testUserManagementAPI() {
        console.log('\n👥 測試用戶管理API...');

        if (!this.authToken) {
            this.addTestResult('用戶管理API', false, '無認證令牌，跳過測試');
            return;
        }

        try {
            // 測試獲取用戶列表
            const usersResponse = await this.makeRequest('/users', 'GET');

            this.addTestResult('獲取用戶列表', usersResponse.success,
                usersResponse.success ? `獲取到 ${usersResponse.data?.length || 0} 個用戶` : '獲取用戶列表失敗');

            // 測試用戶詳情
            if (usersResponse.success && usersResponse.data?.length > 0) {
                const firstUserId = usersResponse.data[0].id;
                const userDetailResponse = await this.makeRequest(`/users/${firstUserId}`, 'GET');

                this.addTestResult('獲取用戶詳情', userDetailResponse.success,
                    userDetailResponse.success ? '用戶詳情獲取成功' : '用戶詳情獲取失敗');
            }

            // 測試創建用戶
            const createUserResponse = await this.makeRequest('/users', 'POST', {
                username: `test_user_${Date.now()}`,
                email: `test_${Date.now()}@example.com`,
                password: 'test123456',
                role: 'creator'
            });

            this.addTestResult('創建用戶', createUserResponse.success,
                createUserResponse.success ? '用戶創建成功' : '用戶創建失敗');

        } catch (error) {
            this.addTestResult('用戶管理API', false, `用戶管理API測試失敗: ${error.message}`);
        }
    }

    /**
     * 測試任務管理API
     */
    async testTaskManagementAPI() {
        console.log('\n📋 測試任務管理API...');

        if (!this.authToken) {
            this.addTestResult('任務管理API', false, '無認證令牌，跳過測試');
            return;
        }

        try {
            // 測試獲取任務列表
            const tasksResponse = await this.makeRequest('/tasks', 'GET');

            this.addTestResult('獲取任務列表', tasksResponse.success,
                tasksResponse.success ? `獲取到 ${tasksResponse.data?.length || 0} 個任務` : '獲取任務列表失敗');

            // 測試創建任務
            const createTaskResponse = await this.makeRequest('/tasks', 'POST', {
                title: `測試任務_${Date.now()}`,
                description: '這是一個測試任務',
                content_types: ['article', 'photo'],
                budget_min: 5000,
                budget_max: 10000,
                deadline: '2024-12-31'
            });

            this.addTestResult('創建任務', createTaskResponse.success,
                createTaskResponse.success ? '任務創建成功' : '任務創建失敗');

        } catch (error) {
            this.addTestResult('任務管理API', false, `任務管理API測試失敗: ${error.message}`);
        }
    }

    /**
     * 測試角色專用儀表板
     */
    async testRoleDashboards() {
        console.log('\n📊 測試角色專用儀表板...');

        if (!this.authToken) {
            this.addTestResult('角色儀表板', false, '無認證令牌，跳過測試');
            return;
        }

        const dashboards = [
            { name: '供應商儀表板', endpoint: '/supplier/dashboard' },
            { name: '創作者儀表板', endpoint: '/creator/dashboard' },
            { name: '媒體儀表板', endpoint: '/media/dashboard' },
            { name: '管理員儀表板', endpoint: '/admin/dashboard' }
        ];

        for (const dashboard of dashboards) {
            try {
                const response = await this.makeRequest(dashboard.endpoint, 'GET');

                this.addTestResult(dashboard.name, response.success,
                    response.success ? '儀表板數據獲取成功' : `儀表板訪問失敗: ${response.message}`);

            } catch (error) {
                this.addTestResult(dashboard.name, false, `儀表板測試失敗: ${error.message}`);
            }
        }
    }

    /**
     * 測試權限系統
     */
    async testPermissionSystem() {
        console.log('\n🔐 測試權限系統...');

        if (!this.authToken) {
            this.addTestResult('權限系統', false, '無認證令牌，跳過測試');
            return;
        }

        try {
            // 測試獲取當前用戶權限
            const permissionsResponse = await this.makeRequest('/users/profile', 'GET');

            this.addTestResult('獲取用戶權限', permissionsResponse.success,
                permissionsResponse.success ? '權限獲取成功' : '權限獲取失敗');

        } catch (error) {
            this.addTestResult('權限系統', false, `權限系統測試失敗: ${error.message}`);
        }
    }

    /**
     * 測試數據整合
     */
    async testDataIntegration() {
        console.log('\n🔗 測試數據整合...');

        try {
            // 測試用戶與任務關聯
            const integrationTests = [
                { name: '健康檢查', endpoint: '/health' },
                { name: '系統狀態', endpoint: '/test' }
            ];

            for (const test of integrationTests) {
                try {
                    const response = await this.makeRequest(test.endpoint, 'GET');
                    this.addTestResult(test.name, response.success || response.status === 'running',
                        '系統狀態正常');
                } catch (error) {
                    this.addTestResult(test.name, false, `測試失敗: ${error.message}`);
                }
            }

        } catch (error) {
            this.addTestResult('數據整合', false, `數據整合測試失敗: ${error.message}`);
        }
    }

    /**
     * 發送HTTP請求
     */
    async makeRequest(endpoint, method = 'GET', body = null, headers = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        // 自動添加認證標頭
        if (this.authToken) {
            config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, config);

            // 一次性讀取響應文本
            const responseText = await response.text();

            let data;
            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch {
                data = { message: responseText || 'Invalid response' };
            }

            return {
                success: response.ok && (data.success !== false),
                status: response.status,
                data: data.data || data,
                message: data.message || response.statusText
            };
        } catch (error) {
            return {
                success: false,
                message: `請求失敗: ${error.message}`
            };
        }
    }

    /**
     * 添加測試結果
     */
    addTestResult(testName, success, message) {
        const result = {
            test: testName,
            success,
            message,
            timestamp: new Date().toLocaleTimeString()
        };

        this.testResults.push(result);

        const icon = success ? '✅' : '❌';
        console.log(`${icon} ${testName}: ${message}`);
    }

    /**
     * 打印測試摘要
     */
    printTestSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 測試結果摘要');
        console.log('='.repeat(50));

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        console.log(`總測試數: ${totalTests}`);
        console.log(`✅ 通過: ${passedTests}`);
        console.log(`❌ 失敗: ${failedTests}`);
        console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        if (failedTests > 0) {
            console.log('\n❌ 失敗的測試:');
            this.testResults
                .filter(r => !r.success)
                .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
        }

        console.log('\n🎯 建議後續步驟:');
        if (passedTests === totalTests) {
            console.log('  ✅ 所有測試通過！系統整合成功');
            console.log('  📝 可以開始生產環境部署準備');
        } else if (passedTests >= totalTests * 0.8) {
            console.log('  ⚠️  大部分功能正常，建議修復失敗的測試');
            console.log('  🔧 檢查後端服務和資料庫連接');
        } else {
            console.log('  🚨 系統存在重大問題，需要全面檢查');
            console.log('  🔍 建議檢查服務配置和依賴');
        }
    }
}

// 執行測試
async function runTests() {
    const tester = new IntegrationTester();
    await tester.runFullIntegrationTest();
}

// 如果直接執行此腳本
if (typeof window === 'undefined') {
    runTests().catch(console.error);
}

// 瀏覽器環境下的導出
if (typeof window !== 'undefined') {
    window.IntegrationTester = IntegrationTester;
    window.runIntegrationTests = runTests;
}
