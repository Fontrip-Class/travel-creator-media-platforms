import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  // 獲取重定向路徑
  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "登入失敗",
        description: "請輸入完整的登入資訊",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.login({
        email: formData.email,
        password: formData.password
      });

      if (response.success && response.data?.token) {
        // 使用認證上下文登入
        login(response.data.token, {
          id: response.data.user_id,
          username: response.data.username || response.data.email,
          email: response.data.email,
          role: response.data.role,
          business_entity_id: response.data.business_entity_id
        }, response.data.refresh_token);

        toast({
          title: "登入成功",
          description: "歡迎回來！",
        });

        // 根據角色導向對應頁面，或重定向到原來的頁面
        const role = response.data.role;
        let targetPath = from;

        if (from === '/') {
          // 如果沒有特定目標，根據角色導向
          if (role === 'admin') {
            targetPath = '/admin';
          } else if (role === 'supplier') {
            targetPath = '/supplier/dashboard';
          } else if (role === 'creator') {
            targetPath = '/creator/dashboard';
          } else if (role === 'media') {
            targetPath = '/media/dashboard';
          }
        }

        navigate(targetPath, { replace: true });
      } else {
        throw new Error(response.message || "登入失敗");
      }
    } catch (error: any) {
      toast({
        title: "登入失敗",
        description: error.message || "網路連線異常，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO
        title="登入 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="登入您的帳號以存取平台功能"
      />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">歡迎回來！</h1>
          <p className="text-muted-foreground">
            登入您的帳號以存取平台功能
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>登入帳號</CardTitle>
            <CardDescription>
              請輸入您的 email 和密碼來登入
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="請輸入密碼"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="remember" className="text-sm">
                  記住我
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "登入中..." : "登入"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                還沒有帳號？
              </p>
              <Link
                to="/register"
                className="text-sm text-primary hover:underline"
              >
                立即註冊
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
