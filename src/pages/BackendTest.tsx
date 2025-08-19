import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function BackendTest() {
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
      </div>
    </div>
  );
}
