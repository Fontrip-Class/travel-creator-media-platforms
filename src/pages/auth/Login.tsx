import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Login() {
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="example@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input id="password" type="password" placeholder="請輸入密碼" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="rounded" />
                <Label htmlFor="remember">記住我</Label>
              </div>
              <Link to="/forgot-password" className="text-primary hover:underline">
                忘記密碼？
              </Link>
            </div>

            <Button className="w-full" size="lg">
              登入
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}