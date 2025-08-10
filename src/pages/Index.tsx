import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Newspaper, Search, MapPin, Calendar, Star, TrendingUp, Camera, FileText } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";

export default function Index() {
  return (
    <div className="min-h-screen">
      <SEO
        title="觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="連結旅遊服務供應商、創作者與媒體的專業媒合平台，提供任務驅動與素材驅動的行銷合作模式。"
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
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            觀光署旅遊服務與<br />
            行銷創作資源管理與媒合平台
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            連結供應商、創作者與媒體，打造台灣旅遊行銷生態圈
          </p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="搜尋旅遊服務、創作者或媒體通路..."
                className="pl-12 py-6 text-lg bg-white/90 backdrop-blur-sm border-0 shadow-lg"
              />
              <Button size="lg" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                搜尋
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
              <div className="text-3xl font-bold mb-2">1,250+</div>
              <div className="text-lg opacity-90">KOC創作者數量</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
              <div className="text-3xl font-bold mb-2">8,500+</div>
              <div className="text-lg opacity-90">創作者影音素材數量</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
              <div className="text-3xl font-bold mb-2">15.2M</div>
              <div className="text-lg opacity-90">媒體通路曝光數量</div>
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
              根據您的身分，進入專屬的服務區域
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Supplier Card */}
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
              <div className="absolute inset-0 bg-gradient-supplier opacity-5 group-hover:opacity-10 transition-opacity" />
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="w-16 h-16 bg-gradient-supplier rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">旅遊服務供應商</CardTitle>
                <CardDescription className="text-base">
                  上架旅遊產品，發布行銷任務，尋找創作者合作
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    管理旅遊產品與介紹資料
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    發布行銷任務與需求
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    搜尋素材與聯繫創作者
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/login">
                    <Button className="w-full bg-gradient-supplier hover:opacity-90 text-white border-0">
                      供應商登入
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Creator Card */}
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300 border-2 hover:border-secondary/20">
              <div className="absolute inset-0 bg-gradient-creator opacity-5 group-hover:opacity-10 transition-opacity" />
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="w-16 h-16 bg-gradient-creator rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">創作者 / KOC</CardTitle>
                <CardDescription className="text-base">
                  申請行銷任務，上傳創作素材，展示專業作品
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-2" />
                    瀏覽並申請行銷任務
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-2" />
                    上傳創作成果與素材
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-2" />
                    管理作品集與專長領域
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/login">
                    <Button className="w-full bg-gradient-creator hover:opacity-90 text-white border-0">
                      創作者登入
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Media Card */}
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300 border-2 hover:border-purple-200">
              <div className="absolute inset-0 bg-gradient-media opacity-5 group-hover:opacity-10 transition-opacity" />
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="w-16 h-16 bg-gradient-media rounded-full flex items-center justify-center mx-auto mb-4">
                  <Newspaper className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">媒體通路</CardTitle>
                <CardDescription className="text-base">
                  搜尋授權素材，下載旅遊內容，聯繫供應商與創作者
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                    搜尋與預覽旅遊素材
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                    下載授權素材內容
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                    聯繫供應商與創作者
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/login">
                    <Button className="w-full bg-gradient-media hover:opacity-90 text-white border-0">
                      媒體登入
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Tasks */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">熱門行銷任務</h2>
              <p className="text-muted-foreground">最新發布的優質行銷合作機會</p>
            </div>
            <Link to="/tasks">
              <Button variant="outline">查看全部任務</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "台東海岸線深度體驗",
                description: "需要旅遊部落客製作深度旅遊內容，包含圖文與短影音",
                reward: "NT$ 15,000",
                deadline: "2024-03-20",
                location: "台東縣",
                tags: ["旅遊", "影音", "部落格"]
              },
              {
                title: "花蓮溫泉季宣傳",
                description: "製作溫泉體驗相關的社群媒體內容",
                reward: "NT$ 8,000",
                deadline: "2024-03-15",
                location: "花蓮縣",
                tags: ["溫泉", "社群", "攝影"]
              },
              {
                title: "澎湖夏日活動推廣",
                description: "水上活動與美食體驗的綜合性內容創作",
                reward: "NT$ 20,000",
                deadline: "2024-04-01",
                location: "澎湖縣",
                tags: ["水上活動", "美食", "綜合"]
              }
            ].map((task, index) => (
              <Card key={index} className="hover:shadow-card transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      {task.reward}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {task.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin size={14} className="mr-1" />
                    {task.location}
                    <Calendar size={14} className="ml-4 mr-1" />
                    {task.deadline}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Assets */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">精選創作素材</h2>
              <p className="text-muted-foreground">高品質的旅遊行銷素材，立即取得授權使用</p>
            </div>
            <Link to="/assets">
              <Button variant="outline">瀏覽素材庫</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              {
                title: "花蓮海岸日出攝影",
                type: "圖片",
                creator: "小明攝影",
                downloads: 156,
                rating: 4.8
              },
              {
                title: "台南古蹟巡禮短片",
                type: "影片",
                creator: "旅遊達人Amy",
                downloads: 89,
                rating: 4.9
              },
              {
                title: "墾丁夏日風情",
                type: "圖片",
                creator: "海洋攝手",
                downloads: 234,
                rating: 4.7
              },
              {
                title: "阿里山雲海縮時",
                type: "影片",
                creator: "山景工作室",
                downloads: 178,
                rating: 4.9
              }
            ].map((asset, index) => (
              <Card key={index} className="group hover:shadow-card transition-shadow cursor-pointer">
                <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    {asset.type === "圖片" ? (
                      <Camera size={32} className="text-white" />
                    ) : (
                      <FileText size={32} className="text-white" />
                    )}
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/50 text-white">
                    {asset.type}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">{asset.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{asset.creator}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <TrendingUp size={12} className="mr-1" />
                      {asset.downloads} 下載
                    </div>
                    <div className="flex items-center">
                      <Star size={12} className="mr-1 fill-yellow-400 text-yellow-400" />
                      {asset.rating}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-hero">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            立即加入台灣旅遊行銷生態圈
          </h2>
          <p className="text-xl mb-8 opacity-90">
            無論您是旅遊業者、創作者或媒體，都能在這裡找到最佳的合作夥伴
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                立即註冊
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                了解更多
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}