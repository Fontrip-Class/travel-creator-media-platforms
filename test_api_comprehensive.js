/**
 * 全面的API測試腳本
 * 測試所有關鍵API端點的功能
 */

const API_BASE_URL = 'http://localhost:8000/api';

class ComprehensiveAPITester {
    constructor() {
        this.testResults = [];
        this.authTokens = {};
    }

    /**
     * 執行全面的API測試
     */
    async runComprehensiveTests() {
        console.log('🚀 開始全面API測試');
        console.log('='.repeat(60));

        try {
            // 1. 測試基礎服務
            await this.testBasicServices();

            // 2. 測試認證系統
            await this.testAuthenticationSystem();

            // 3. 測試用戶管理
            await this.testUserManagement();

            // 4. 測試任務管理
            await this.testTaskManagement();

            // 5. 測試角色儀表板
            await this.testRoleDashboards();

            // 6. 測試工作流程
            await this.testWorkflowAPIs();

            this.printTestSummary();

        } catch (error) {
            console.error('❌ 測試執行失敗:', error);
        }
    }

    /**
     * 測試基礎服務
     */
    async testBasicServices() {
        console.log('\n🔧 測試基礎服務...');

        const basicTests = [
            { name: '健康檢查', endpoint: '/health', method: 'GET' },
            { name: '測試端點', endpoint: '/test', method: 'GET' },
            { name: '根路徑', endpoint: '', method: 'GET', baseUrl: 'http://localhost:8000' }
        ];

        for (const test of basicTests) {
            try {
                const response = await this.makeRequest(test.endpoint, test.method, null, test.baseUrl);
                this.addTestResult(test.name, response.success,
                    response.success ? '服務正常' : `服務異常: ${response.message}`);
            } catch (error) {
                this.addTestResult(test.name, false, `服務測試失敗: ${error.message}`);
            }
        }
    }

    /**
     * 測試認證系統
     */
    async testAuthenticationSystem() {
        console.log('\n🔐 測試認證系統...');

        // 測試用戶登入
        const testUsers = [
            { email: 'pittchao@gmail.com', password: 'admin123', role: 'admin' },
            { email: 'supplier@test.com', password: 'supplier123', role: 'supplier' },
            { email: 'creator@test.com', password: 'creator123', role: 'creator' },
            { email: 'media@test.com', password: 'media123', role: 'media' }
        ];

        for (const user of testUsers) {
                        try {
                const loginResponse = await this.makeRequest('/auth/login', 'POST', {
                    email: user.email,
                    password: user.password
                });

                if (loginResponse.success && loginResponse.data?.token) {
                    this.authTokens[user.role] = loginResponse.data.token;
                    this.addTestResult(`${user.role}登入`, true,
                        `${user.email} 登入成功`);

                    // 測試令牌驗證
                    const profileResponse = await this.makeRequest('/users/profile', 'GET', null, null, loginResponse.data.token);
                    this.addTestResult(`${user.role}令牌驗證`, profileResponse.success,
                        profileResponse.success ? '令牌驗證成功' : `令牌驗證失敗: ${profileResponse.message}`);

                } else {
                    this.addTestResult(`${user.role}登入`, false,
                        `${user.email} 登入失敗: ${loginResponse.message} (狀態: ${loginResponse.status})`);
                }
            } catch (error) {
                this.addTestResult(`${user.role}登入`, false,
                    `登入測試失敗: ${error.message}`);
            }
        }
    }

    /**
     * 測試用戶管理
     */
    async testUserManagement() {
        console.log('\n👥 測試用戶管理...');

        const adminToken = this.authTokens.admin;
        if (!adminToken) {
            this.addTestResult('用戶管理', false, '無管理員令牌，跳過測試');
            return;
        }

        try {
            // 測試獲取用戶列表
            const usersResponse = await this.makeRequest('/users', 'GET', null, null, adminToken);
            this.addTestResult('獲取用戶列表', usersResponse.success,
                usersResponse.success ? `獲取到 ${usersResponse.data?.length || 0} 個用戶` : '獲取失敗');

        } catch (error) {
            this.addTestResult('用戶管理', false, `用戶管理測試失敗: ${error.message}`);
        }
    }

    /**
     * 測試任務管理
     */
    async testTaskManagement() {
        console.log('\n📋 測試任務管理...');

        const supplierToken = this.authTokens.supplier;
        if (!supplierToken) {
            this.addTestResult('任務管理', false, '無供應商令牌，跳過測試');
            return;
        }

        try {
            // 測試獲取任務列表
            const tasksResponse = await this.makeRequest('/tasks', 'GET', null, null, supplierToken);
            this.addTestResult('獲取任務列表', tasksResponse.success,
                tasksResponse.success ? `獲取到 ${tasksResponse.data?.length || 0} 個任務` : '獲取失敗');

            // 測試創建任務
            const createTaskResponse = await this.makeRequest('/task-management', 'POST', {
                title: `測試任務_${Date.now()}`,
                description: '這是一個測試任務，用於驗證任務創建功能的正確性',
                requirements: '需要高品質的創作內容',
                content_types: ['article', 'photo'],
                budget_min: 5000,
                budget_max: 10000,
                reward_type: 'money',
                deadline: '2024-12-31',
                location: '台北市'
            }, null, supplierToken);

            this.addTestResult('創建任務', createTaskResponse.success,
                createTaskResponse.success ? '任務創建成功' : `創建失敗: ${createTaskResponse.message}`);

        } catch (error) {
            this.addTestResult('任務管理', false, `任務管理測試失敗: ${error.message}`);
        }
    }

    /**
     * 測試角色儀表板
     */
    async testRoleDashboards() {
        console.log('\n📊 測試角色儀表板...');

        const dashboards = [
            { role: 'supplier', endpoint: '/supplier/dashboard', name: '供應商儀表板', requireRole: 'supplier' },
            { role: 'creator', endpoint: '/creator/dashboard', name: '創作者儀表板', requireRole: 'creator' },
            { role: 'media', endpoint: '/media/dashboard', name: '媒體儀表板', requireRole: 'media' },
            { role: 'admin', endpoint: '/admin/dashboard', name: '管理員儀表板', requireRole: 'admin' }
        ];

        for (const dashboard of dashboards) {
            const token = this.authTokens[dashboard.role];
            if (!token) {
                this.addTestResult(dashboard.name, false, `無${dashboard.role}令牌`);
                continue;
            }

            try {
                const response = await this.makeRequest(dashboard.endpoint, 'GET', null, null, token);
                this.addTestResult(dashboard.name, response.success,
                    response.success ? '儀表板數據獲取成功' : `訪問失敗: ${response.message}`);
            } catch (error) {
                this.addTestResult(dashboard.name, false, `儀表板測試失敗: ${error.message}`);
            }
        }
    }

    /**
     * 測試工作流程API
     */
    async testWorkflowAPIs() {
        console.log('\n🔄 測試工作流程API...');

        const supplierToken = this.authTokens.supplier;
        if (!supplierToken) {
            this.addTestResult('工作流程', false, '無供應商令牌，跳過測試');
            return;
        }

        try {
            // 測試創建行銷任務
            const workflowTaskResponse = await this.makeRequest('/workflow/tasks', 'POST', {
                title: `工作流程測試任務_${Date.now()}`,
                description: '測試工作流程的任務創建',
                content_types: ['video'],
                budget_min: 8000,
                budget_max: 15000,
                deadline: '2024-12-31'
            }, null, supplierToken);

            this.addTestResult('工作流程任務創建', workflowTaskResponse.success,
                workflowTaskResponse.success ? '工作流程任務創建成功' : `創建失敗: ${workflowTaskResponse.message}`);

        } catch (error) {
            this.addTestResult('工作流程', false, `工作流程測試失敗: ${error.message}`);
        }
    }

    /**
     * 發送HTTP請求
     */
    async makeRequest(endpoint, method = 'GET', body = null, baseUrl = null, token = null) {
        const url = `${baseUrl || API_BASE_URL}${endpoint}`;

        const config = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, config);
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
        console.log('\n' + '='.repeat(60));
        console.log('📊 全面API測試結果摘要');
        console.log('='.repeat(60));

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;

        console.log(`總測試數: ${totalTests}`);
        console.log(`✅ 通過: ${passedTests}`);
        console.log(`❌ 失敗: ${failedTests}`);
        console.log(`成功率: ${successRate}%`);

        if (failedTests > 0) {
            console.log('\n❌ 失敗的測試:');
            this.testResults
                .filter(r => !r.success)
                .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
        }

        console.log('\n🎯 系統狀態評估:');
        if (successRate >= 80) {
            console.log('  🟢 系統狀態優秀，可以投入生產環境');
        } else if (successRate >= 60) {
            console.log('  🟡 系統基本穩定，建議修復部分問題');
        } else {
            console.log('  🔴 系統存在問題，需要進一步調試');
        }
    }
}

// 執行測試
const tester = new ComprehensiveAPITester();
tester.runComprehensiveTests().catch(console.error);
