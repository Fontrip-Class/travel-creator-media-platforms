import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Users, Newspaper } from "lucide-react";

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const roleOptions = [
    {
      value: "supplier",
      label: "旅遊服務供應商",
      icon: Building2,
      description: "飯店、民宿、餐廳、旅行社、景點業者等"
    },
    {
      value: "creator",
      label: "創作者 / KOC",
      icon: Users,
      description: "部落客、網紅、攝影師、影像創作者等"
    },
    {
      value: "media",
      label: "媒體通路",
      icon: Newspaper,
      description: "新聞媒體、雜誌、網路媒體、社群平台等"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO
        title="註冊 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="選擇您的角色，加入台灣旅遊行銷生態圈"
      />

      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">加入我們的平台</h1>
          <p className="text-muted-foreground">
            選擇您的角色身分，開始您的旅遊行銷之旅
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>建立帳戶</CardTitle>
            <CardDescription>
              請選擇您的角色並填寫基本資料
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">選擇您的角色</Label>
              <div className="grid grid-cols-1 gap-3">
                {roleOptions.map((role) => (
                  <div
                    key={role.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedRole === role.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedRole(role.value)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedRole === role.value
                          ? "bg-primary text-white"
                          : "bg-muted"
                      }`}>
                        <role.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{role.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedRole === role.value
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}>
                        {selectedRole === role.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">
                  {selectedRole === "creator" ? "姓名或品牌名稱" : "公司/機構名稱"}
                </Label>
                <Input id="company" placeholder="請輸入名稱" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">聯絡人姓名</Label>
                <Input id="contact" placeholder="請輸入聯絡人姓名" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="example@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">聯絡電話</Label>
                <Input id="phone" placeholder="09xx-xxx-xxx" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <Input id="password" type="password" placeholder="請輸入密碼" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">確認密碼</Label>
                <Input id="confirmPassword" type="password" placeholder="請再次輸入密碼" />
              </div>
            </div>

            {/* Role-specific fields */}
            {selectedRole === "supplier" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>業者類別</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇業者類別" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accommodation">住宿業</SelectItem>
                      <SelectItem value="restaurant">餐飲業</SelectItem>
                      <SelectItem value="attraction">景點業</SelectItem>
                      <SelectItem value="transport">交通業</SelectItem>
                      <SelectItem value="travel">旅行社</SelectItem>
                      <SelectItem value="activity">活動業</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">主要營業地區</Label>
                  <Input id="region" placeholder="縣市/區域" />
                </div>
              </div>
            )}

            {selectedRole === "creator" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specialties">專長領域（用逗號分隔）</Label>
                  <Input 
                    id="specialties" 
                    placeholder="例：旅遊攝影, 美食評論, 影音創作, 文字撰寫" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="followers">主要平台粉絲數</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇粉絲數範圍" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1k-5k">1K - 5K</SelectItem>
                        <SelectItem value="5k-10k">5K - 10K</SelectItem>
                        <SelectItem value="10k-50k">10K - 50K</SelectItem>
                        <SelectItem value="50k-100k">50K - 100K</SelectItem>
                        <SelectItem value="100k+">100K+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform">主要創作平台</Label>
                    <Input id="platform" placeholder="Instagram, YouTube, 部落格等" />
                  </div>
                </div>
              </div>
            )}

            {selectedRole === "media" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>媒體類型</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇媒體類型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">新聞媒體</SelectItem>
                      <SelectItem value="magazine">雜誌出版</SelectItem>
                      <SelectItem value="online">網路媒體</SelectItem>
                      <SelectItem value="social">社群平台</SelectItem>
                      <SelectItem value="broadcast">廣播電視</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">官方網站</Label>
                  <Input id="website" placeholder="https://" />
                </div>
              </div>
            )}

            {/* Terms and Submit */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  我同意{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    服務條款
                  </Link>{" "}
                  和{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    隱私政策
                  </Link>
                </Label>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                disabled={!selectedRole}
              >
                建立帳戶
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                已有帳戶？{" "}
                <Link to="/login" className="text-primary hover:underline">
                  立即登入
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}