import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, CheckCircle, Loader2, Settings, Shield, User, XCircle } from "lucide-react";
import { useState } from "react";

export default function BackendTest() {
  const { user, isAuthenticated } = useAuth();
  const [backendUrl, setBackendUrl] = useState("http://localhost:8000");
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const testBackendConnection = async () => {
    setIsTesting(true);
    setTestResults([]);

    const tests = [
      {
        name: "根路徑測試",
        url: `${backendUrl}/`,
        method: 'GET',
        description: "測試後端服務是否響應"
      },
      {
        name: "健康檢查",
        url: `${backendUrl}/api/health`,
        method: 'GET',
        description: "測試API健康狀態"
      },
      {
        name: "註冊API測試 (GET)",
        url: `${backendUrl}/api/auth/register`,
        method: 'GET',
        description: "測試註冊API端點 (GET方法)"
      },
      {
        name: "註冊API測試 (POST)",
        url: `${backendUrl}/api/auth/register`,
        method: 'POST',
        body: JSON.stringify({
          username: "test_user",
          email: "test@example.com",
          password: "test123456"
        }),
        description: "測試註冊API端點 (POST方法)"
      }
    ];

    for (const test of tests) {
      try {
        console.log(`🧪 測試: ${test.name}`);
        console.log(`📍 URL: ${test.url}`);
        console.log(`📝 方法: ${test.method}`);

        const startTime = Date.now();

        const requestOptions: RequestInit = {
          method: test.method,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        if (test.body) {
          requestOptions.body = test.body;
        }

        const response = await fetch(test.url, requestOptions);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        let responseData;
        try {
          responseData = await response.text();
          // 嘗試解析JSON
          try {
            responseData = JSON.parse(responseData);
          } catch {
            // 如果不是JSON，保持原文本
          }
        } catch {
          responseData = "無法讀取響應內容";
        }

        const result = {
          name: test.name,
          url: test.url,
          method: test.method,
          description: test.description,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          responseData: responseData,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toLocaleTimeString()
        };

        console.log(`✅ 測試完成:`, result);
        setTestResults(prev => [...prev, result]);

      } catch (error: any) {
        console.error(`❌ 測試失敗: ${test.name}`, error);

        const result = {
          name: test.name,
          url: test.url,
          method: test.method || 'GET',
          description: test.description,
          status: 'error',
          statusCode: 'N/A',
          statusText: 'Connection Failed',
          responseTime: 'N/A',
          responseData: error.message,
          headers: {},
          timestamp: new Date().toLocaleTimeString(),
          error: error
        };

        setTestResults(prev => [...prev, result]);
      }
    }

    setIsTesting(false);
  };

  const testSupplierFlow = () => {
    const results = [];

    // 测试1: 检查用户是否已登录
    if (isAuthenticated) {
      results.push({
        name: "用戶登入狀態",
        status: 'success',
        message: `用戶已登入: ${user?.username} (角色: ${user?.role})`,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    } else {
      results.push({
        name: "用戶登入狀態",
        status: 'error',
        message: "用戶未登入",
        icon: <XCircle className="h-4 w-4 text-red-500" />
      });
    }

    // 测试2: 检查用户角色
    if (user?.role === 'supplier') {
      results.push({
        name: "用戶角色檢查",
        status: 'success',
        message: "用戶角色為供應商，可以訪問供應商功能",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    } else if (user?.role) {
      results.push({
        name: "用戶角色檢查",
        status: 'warning',
        message: `用戶角色為 ${user.role}，不是供應商`,
        icon: <AlertCircle className="h-4 w-4 text-yellow-500" />
      });
    } else {
      results.push({
        name: "用戶角色檢查",
        status: 'error',
        message: "無法獲取用戶角色",
        icon: <XCircle className="h-4 w-4 text-red-500" />
      });
    }

    // 测试3: 检查路由访问权限
    const supplierRoutes = [
      '/supplier/dashboard',
      '/supplier/create-task',
      '/supplier/tasks'
    ];

    supplierRoutes.forEach(route => {
      results.push({
        name: `路由訪問測試: ${route}`,
        status: 'info',
        message: `路由 ${route} 需要供應商權限`,
        icon: <Shield className="h-4 w-4 text-blue-500" />
      });
    });

    setTestResults(results);
  };

  const testPermissionControl = () => {
    const results = [];

    // 测试1: 检查管理后台权限
    if (user?.role === 'admin') {
      results.push({
        name: "管理後台權限",
        status: 'success',
        message: "用戶為管理員，可以訪問管理後台",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    } else {
      results.push({
        name: "管理後台權限",
        status: 'warning',
        message: `用戶角色為 ${user?.role || '未設定'}，無法訪問管理後台`,
        icon: <AlertCircle className="h-4 w-4 text-yellow-500" />
      });
    }

    // 测试2: 检查导航栏权限控制
    const hasAdminButton = user?.role === 'admin';
    results.push({
      name: "導航欄權限控制",
      status: hasAdminButton ? 'success' : 'info',
      message: hasAdminButton
        ? "導航欄顯示管理後台按鈕"
        : "導航欄隱藏管理後台按鈕（權限控制正常）",
      icon: hasAdminButton ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Shield className="h-4 w-4 text-blue-500" />
    });

    // 测试3: 检查角色功能权限
    if (user?.role) {
      const roleFeatures = getRoleFeatures(user.role);
      results.push({
        name: "角色功能權限",
        status: 'success',
        message: `用戶可以訪問 ${roleFeatures.length} 個角色專用功能`,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    }

    setTestResults(results);
  };

  // 获取角色功能的辅助函数
  const getRoleFeatures = (role: string) => {
    switch (role) {
      case 'supplier':
        return [
          { path: '/supplier/dashboard', label: '供應商儀表板' },
          { path: '/supplier/create-task', label: '發布任務' },
          { path: '/supplier/tasks', label: '我的任務' }
        ];
      case 'creator':
        return [
          { path: '/creator/dashboard', label: '創作者儀表板' },
          { path: '/creator/portfolio', label: '作品集' },
          { path: '/creator/tasks', label: '可接任務' }
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: '管理後台' },
          { path: '/admin/users', label: '用戶管理' },
          { path: '/admin/tasks', label: '任務管理' }
        ];
      default:
        return [];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : 'destructive';
    const label = status === 'success' ? '成功' : '失敗';
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🔧 後端連接測試工具</h1>
          <p className="text-muted-foreground">
            測試後端服務連接狀態，診斷API問題
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>連接配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="backendUrl">後端服務地址</Label>
                <Input
                  id="backendUrl"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={testBackendConnection}
                  disabled={isTesting}
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      測試中...
                    </>
                  ) : (
                    '開始測試'
                  )}
                </Button>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTestResults([]);
                    console.clear();
                  }}
                >
                  清除結果
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>測試結果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status)}
                        <h3 className="font-medium">{result.name}</h3>
                        {getStatusBadge(result.status)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {result.timestamp}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {result.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="font-medium">URL:</Label>
                        <p className="font-mono text-xs bg-muted p-2 rounded mt-1">
                          {result.url}
                        </p>
                      </div>
                      <div>
                        <Label className="font-medium">HTTP方法:</Label>
                        <p className="font-mono">{result.method}</p>
                      </div>
                      <div>
                        <Label className="font-medium">狀態碼:</Label>
                        <p className="font-mono">{result.statusCode}</p>
                      </div>
                      <div>
                        <Label className="font-medium">響應時間:</Label>
                        <p className="font-mono">{result.responseTime}</p>
                      </div>
                      <div>
                        <Label className="font-medium">狀態描述:</Label>
                        <p className="font-mono">{result.statusText}</p>
                      </div>
                    </div>

                    {result.responseData && (
                      <div className="mt-3">
                        <Label className="font-medium">響應內容:</Label>
                        <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto max-h-32">
                          {typeof result.responseData === 'object'
                            ? JSON.stringify(result.responseData, null, 2)
                            : result.responseData
                          }
                        </pre>
                      </div>
                    )}

                    {result.error && (
                      <div className="mt-3">
                        <Label className="font-medium text-red-600">錯誤詳情:</Label>
                        <pre className="text-xs bg-red-50 p-3 rounded mt-1 overflow-auto max-h-32 text-red-600">
                          {result.error.stack || result.error.message || result.error}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">💡 故障排除指南</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">如果所有測試都失敗:</h4>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>檢查後端服務是否啟動</li>
                  <li>確認端口號是否正確 (預設: 8000)</li>
                  <li>檢查防火牆設置</li>
                  <li>確認後端服務沒有崩潰</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">如果部分測試失敗:</h4>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>檢查API路由配置</li>
                  <li>確認資料庫連接</li>
                  <li>檢查後端日誌</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">常見解決方案:</h4>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>重啟後端服務</li>
                  <li>檢查環境變數配置</li>
                  <li>確認依賴包已安裝</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">後端測試與供應商流程測試</h1>
          <p className="text-gray-600">測試後端連接和供應商功能流程</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 後端測試 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                後端連接測試
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="backendUrl">後端URL</Label>
                <Input
                  id="backendUrl"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                />
              </div>

              <Button
                onClick={testBackendConnection}
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    測試中...
                  </>
                ) : (
                  "測試後端連接"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 供應商流程測試 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                供應商流程測試
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">當前用戶狀態</h4>
                <div className="space-y-2 text-sm">
                  <div>登入狀態: {isAuthenticated ? '已登入' : '未登入'}</div>
                  {user && (
                    <>
                      <div>用戶名: {user.username}</div>
                      <div>角色: {user.role || '未設定'}</div>
                      <div>業務實體ID: {user.business_entity_id || '未設定'}</div>
                    </>
                  )}
                </div>
              </div>

              <Button
                onClick={testSupplierFlow}
                className="w-full"
              >
                測試供應商流程
              </Button>

              <Button
                onClick={testPermissionControl}
                className="w-full"
                variant="outline"
              >
                測試權限控制
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 測試結果 */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>測試結果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    {result.icon}
                    <div className="flex-1">
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                    </div>
                    <Badge
                      variant={
                        result.status === 'success' ? 'default' :
                        result.status === 'error' ? 'destructive' :
                        result.status === 'warning' ? 'secondary' : 'outline'
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 供應商流程說明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>供應商流程說明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. 登入流程</h4>
                <p className="text-sm text-gray-600">
                  供應商用戶登入後，系統會自動重定向到 <code className="bg-gray-100 px-1 rounded">/supplier/dashboard</code>
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. 儀表板功能</h4>
                <p className="text-sm text-gray-600">
                  供應商儀表板提供任務管理、統計數據、通知等功能
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. 創建任務</h4>
                <p className="text-sm text-gray-600">
                  點擊「創建新任務」按鈕進入任務創建頁面，填寫任務詳情後提交
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">4. 常見問題</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 確保已選擇至少一種內容類型</li>
                  <li>• 填寫必填欄位（標題、描述、截止日期等）</li>
                  <li>• 根據報酬類型填寫相應的詳情</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
