import heroImage from "@/assets/hero-travel.jpg";
import RoleDashboardEntry from "@/components/layout/RoleDashboardEntry";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Newspaper, Search, Shield, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

function getRoleLabel(role: string): string {
  switch (role) {
    case 'supplier':
      return '供應商';
    case 'creator':
      return '創作者';
    case 'media':
      return '媒體';
    case 'admin':
      return '管理員';
    default:
      return '用戶';
  }
}

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  // 如果用戶已登入，顯示角色導向的工作台入口
  if (isAuthenticated && user?.role) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO
          title={`${getRoleLabel(user.role)}工作台 - 旅遊創作者平台`}
          description="您的專屬工作區，管理任務、查看數據、協作創作"
        />
        <RoleDashboardEntry />
      </div>
    );
  }

  // 未登入用戶顯示原始首頁
  return (
    <div className="min-h-screen">
      <SEO
        title="觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="台灣旅遊相關供應商、創作者、媒體的專業平台，任務驅動的行銷創作媒合模式"
      />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-hero overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="台灣旅遊風景"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40" />
        </div>

        <div className="relative z-10 text-center text-primary-foreground px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            觀光署旅遊服務<br />
            行銷創作資源管理與媒合平台
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            為供應商、創作者、媒體，提供專業的任務驅動媒合平台
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="搜尋旅遊相關創作者、媒體、通路..."
                className="pl-12 py-6 text-lg glass border-0 shadow-lg"
              />
              <Button size="lg" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                搜尋
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-primary-foreground">1,250+</div>
              <div className="text-lg text-primary-foreground/90">KOC創作者數量</div>
            </div>
            <div className="glass rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-primary-foreground">8,500+</div>
              <div className="text-lg text-primary-foreground/90">旅遊影響力數量</div>
            </div>
            <div className="glass rounded-lg p-6">
              <div className="text-3xl font-bold mb-2 text-primary-foreground">15.2M</div>
              <div className="text-lg text-primary-foreground/90">媒體通路覆蓋</div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Entry Points */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">選擇您的角色</h2>
            <p className="text-xl text-muted-foreground">
              根據您的身份，進入專屬的解決方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Supplier Card */}
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
              <div className="absolute inset-0 bg-gradient-supplier opacity-5 group-hover:opacity-10 transition-opacity" />
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="w-16 h-16 bg-gradient-supplier rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">旅遊相關供應商</CardTitle>
                <CardDescription className="text-base">
                  上架旅遊任務，發布行銷任務，尋找創作者
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    管理旅遊相關介紹資料
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    發布行銷任務需求
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    素材下載聯繫創作者
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/login">
                    <Button className="w-full bg-gradient-supplier hover:opacity-90 text-primary-foreground border-0">
                      供應商登入
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Creator Card */}
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
              <div className="absolute inset-0 bg-gradient-creator opacity-5 group-hover:opacity-10 transition-opacity" />
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="w-16 h-16 bg-gradient-creator rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">內容創作者</CardTitle>
                <CardDescription className="text-base">
                  接取創作任務，展示作品集，建立合作關係
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    瀏覽創作任務需求
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    上傳作品集展示
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    與供應商直接聯繫
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/login">
                    <Button className="w-full bg-gradient-creator hover:opacity-90 text-primary-foreground border-0">
                      創作者登入
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Media Card */}
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
              <div className="absolute inset-0 bg-gradient-media opacity-5 group-hover:opacity-10 transition-opacity" />
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="w-16 h-16 bg-gradient-media rounded-full flex items-center justify-center mx-auto mb-4">
                  <Newspaper className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">媒體通路</CardTitle>
                <CardDescription className="text-base">
                  素材下載使用，內容傳播推廣，擴大影響力
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    下載高品質素材
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    內容傳播推廣
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    覆蓋廣大媒體平台
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/login">
                    <Button className="w-full bg-gradient-media hover:opacity-90 text-primary-foreground border-0">
                      媒體登入
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">平台特色</h2>
            <p className="text-xl text-muted-foreground">
              專業的旅遊行銷媒合平台，為產業提供最佳的合作夥伴
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">智能媒合</h3>
              <p className="text-muted-foreground">AI驅動的智能媒合系統，精準匹配需求與供給</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">數據分析</h3>
              <p className="text-muted-foreground">完整的數據分析工具，追蹤合作效果與ROI</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">品質保證</h3>
              <p className="text-muted-foreground">嚴格的品質審核機制，確保合作內容品質</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">社群支持</h3>
              <p className="text-muted-foreground">活躍的創作者社群，持續學習與成長</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">開始您的旅遊行銷之旅</h2>
          <p className="text-xl mb-8 opacity-90">
            無論您是旅遊業者、創作者或媒體，都能在這裡找到最佳的合作伙伴
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/register">立即註冊</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/about">了解更多</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
