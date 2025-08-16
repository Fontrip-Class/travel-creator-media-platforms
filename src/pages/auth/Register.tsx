import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Users, Newspaper } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    contact: '',
    businessType: '',
    region: '',
    specialties: '',
    followers: '',
    platform: '',
    mediaType: '',
    website: '',
    agreeToTerms: false
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
    
    if (!selectedRole) {
      toast({
        title: "錯誤",
        description: "請選擇您的角色",
        variant: "destructive"
      });
      return;
    }

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "錯誤",
        description: "請填寫所有必填欄位",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "錯誤",
        description: "密碼確認不一致",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "錯誤",
        description: "請同意服務條款和隱私政策",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        phone: formData.phone || undefined,
        contact: formData.contact || undefined,
        businessType: formData.businessType || undefined,
        region: formData.region || undefined,
        specialties: formData.specialties || undefined,
        followers: formData.followers || undefined,
        platform: formData.platform || undefined,
        mediaType: formData.mediaType || undefined,
        website: formData.website || undefined
      });

      if (response.success) {
        toast({
          title: "註冊成功",
          description: "歡迎加入我們的平台！",
        });

        // 如果有token，保存並導向登入頁面
        if (response.data?.token) {
          localStorage.setItem('auth_token', response.data.token);
          if (response.data.user_id) {
            localStorage.setItem('user_id', response.data.user_id);
          }
          if (response.data.role) {
            localStorage.setItem('user_role', response.data.role);
          }
          
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
        } else {
          // 沒有token，導向登入頁面
          navigate('/login');
        }
      }
    } catch (error: any) {
      toast({
        title: "註冊失敗",
        description: error.message || "註冊過程中發生錯誤，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="username">
                  {selectedRole === "creator" ? "姓名或品牌名稱" : "公司/機構名稱"}
                </Label>
                <Input 
                  id="username" 
                  name="username"
                  placeholder="請輸入名稱" 
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">聯絡人姓名</Label>
                <Input 
                  id="contact" 
                  name="contact"
                  placeholder="請輸入聯絡人姓名" 
                  value={formData.contact || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="phone">聯絡電話</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  placeholder="09xx-xxx-xxx" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">確認密碼</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  placeholder="請再次輸入密碼" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {selectedRole === "supplier" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>業者類別</Label>
                  <Select 
                    value={formData.businessType || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                  >
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
                  <Input 
                    id="region" 
                    name="region"
                    placeholder="縣市/區域" 
                    value={formData.region || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {selectedRole === "creator" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specialties">專長領域（用逗號分隔）</Label>
                  <Input 
                    id="specialties" 
                    name="specialties"
                    placeholder="例：旅遊攝影, 美食評論, 影音創作, 文字撰寫" 
                    value={formData.specialties || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="followers">主要平台粉絲數</Label>
                    <Select 
                      value={formData.followers || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, followers: value }))}
                    >
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
                    <Input 
                      id="platform" 
                      name="platform"
                      placeholder="Instagram, YouTube, 部落格等" 
                      value={formData.platform || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedRole === "media" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>媒體類型</Label>
                  <Select 
                    value={formData.mediaType || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, mediaType: value }))}
                  >
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
                  <Input 
                    id="website" 
                    name="website"
                    placeholder="https://" 
                    value={formData.website || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Terms and Submit */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                  }
                />
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
                type="submit"
                className="w-full" 
                size="lg"
                disabled={!selectedRole || isLoading}
              >
                {isLoading ? "註冊中..." : "建立帳戶"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                已有帳戶？{" "}
                <Link to="/login" className="text-primary hover:underline">
                  立即登入
                </Link>
              </div>
            </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}