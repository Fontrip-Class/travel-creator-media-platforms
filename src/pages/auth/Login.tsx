import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        title: "錯誤",
        description: "請填寫所有必填欄位",
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
        // 保存token
        localStorage.setItem('auth_token', response.data.token);
        if (response.data.user_id) {
          localStorage.setItem('user_id', response.data.user_id);
        }
        if (response.data.role) {
          localStorage.setItem('user_role', response.data.role);
        }

        toast({
          title: "登入成功",
          description: "歡迎回來！",
        });

        // 根據角色導向不同頁面
        const role = response.data.role;
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'supplier') {
          navigate('/supplier/dashboard');
        } else if (role === 'creator') {
          navigate('/creator/dashboard');
        } else if (role === 'media') {
          navigate('/media/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: "登入失敗",
        description: error.message || "請檢查您的帳號密碼",
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
        description="登入您的帳戶，進入專屬的服務區域"
      />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">歡迎回來</h1>
          <p className="text-muted-foreground">
            登入您的帳戶繼續使用平台服務
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>登入帳戶</CardTitle>
            <CardDescription>
              輸入您的 email 和密碼來登入
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

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    name="remember"
                    className="rounded" 
                    checked={formData.remember}
                    onChange={handleInputChange}
                  />
                  <Label htmlFor="remember">記住我</Label>
                </div>
                <Link to="/forgot-password" className="text-primary hover:underline">
                  忘記密碼？
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "登入中..." : "登入"}
              </Button>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-2">
              <Link to="/supplier/dashboard">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  供應商
                </Button>
              </Link>
              <Link to="/creator/dashboard">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  創作者
                </Button>
              </Link>
              <Link to="/media/dashboard">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  媒體
                </Button>
              </Link>
            </div>

                          <div className="text-center text-sm text-muted-foreground">
                還沒有帳戶？{" "}
                <Link to="/register" className="text-primary hover:underline">
                  立即註冊
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}