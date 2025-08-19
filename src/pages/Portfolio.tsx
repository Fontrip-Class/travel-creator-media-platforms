import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Heart, Star, Download, Share2, Filter, Search, Grid3X3, List } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  type: "image" | "video" | "article" | "design";
  category: string;
  tags: string[];
  thumbnail: string;
  views: number;
  likes: number;
  createdDate: string;
  taskRelated?: string;
  description: string;
  rating?: number;
}

export default function Portfolio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  // 模擬作品集資料
  const portfolioItems: PortfolioItem[] = [
    {
      id: "1",
      title: "台東海岸風景攝影",
      type: "image",
      category: "攝影",
      tags: ["風景攝影", "海岸", "台東"],
      thumbnail: "/api/placeholder/300/200",
      views: 1520,
      likes: 89,
      createdDate: "2024-11-15",
      taskRelated: "台東秋季活動宣傳",
      description: "捕捉台東美麗的海岸線，展現自然之美",
      rating: 4.8
    },
    {
      id: "2",
      title: "美食攝影系列",
      type: "video",
      category: "影音製作",
      tags: ["美食", "攝影", "TikTok"],
      thumbnail: "/api/placeholder/300/200",
      views: 3200,
      likes: 156,
      createdDate: "2024-11-10",
      taskRelated: "阿里山美食探索",
      description: "製作吸引人的美食攝影內容",
      rating: 4.9
    },
    {
      id: "3",
      title: "旅遊攻略撰寫",
      type: "article",
      category: "文章撰寫",
      tags: ["旅遊", "攻略", "部落"],
      thumbnail: "/api/placeholder/300/200",
      views: 890,
      likes: 45,
      createdDate: "2024-11-05",
      description: "深度旅遊攻略撰寫，提供實用資訊"
    },
    {
      id: "4",
      title: "品牌形象攝影",
      type: "image",
      category: "攝影",
      tags: ["商業攝影", "品牌", "人物"],
      thumbnail: "/api/placeholder/300/200",
      views: 1100,
      likes: 78,
      createdDate: "2024-10-28",
      taskRelated: "花蓮海岸風景攝影",
      description: "專業品牌形象攝影作品",
      rating: 4.7
    }
  ];

  const categories = ["all", "攝影", "影音製作", "文章撰寫", "設計"];

  const filteredItems = portfolioItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return "📷";
      case "video": return "🎥";
      case "article": return "📝";
      default: return "🎨";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image": return "bg-blue-100 text-blue-800";
      case "video": return "bg-red-100 text-red-800";
      case "article": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const PortfolioCard = ({ item }: { item: PortfolioItem }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute top-2 left-2">
          <Badge className={getTypeColor(item.type)}>
            {getTypeIcon(item.type)} {item.type === "image" ? "攝影" : item.type === "video" ? "影音" : "文章"}
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {item.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {item.likes}
              </span>
              {item.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {item.rating}
                </span>
              )}
            </div>
            <span>{item.createdDate}</span>
          </div>
          
          {item.taskRelated && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                相關任務：<span className="text-primary">{item.taskRelated}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const PortfolioListItem = ({ item }: { item: PortfolioItem }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="flex gap-4 p-4">
        <div className="relative flex-shrink-0">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-32 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
          />
          <div className="absolute top-2 left-2">
            <Badge className={getTypeColor(item.type)}>
              {getTypeIcon(item.type)}
            </Badge>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {item.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {item.likes}
                </span>
                {item.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {item.rating}
                  </span>
                )}
                <span>{item.createdDate}</span>
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                下載
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-1" />
                分享
              </Button>
            </div>
          </div>
          
          {item.taskRelated && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                相關任務：<span className="text-primary">{item.taskRelated}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="作品集 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="展示您的創作作品，吸引更多合作機會"
      />

      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">作品集</h1>
          <p className="text-muted-foreground">
            展示您的創作作品，吸引更多合作機會
          </p>
        </div>

        {/* 搜尋和篩選工具列 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋作品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="選擇類別" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "全部類別" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新發布</SelectItem>
              <SelectItem value="oldest">最早發布</SelectItem>
              <SelectItem value="popular">最受歡迎</SelectItem>
              <SelectItem value="rating">評分最高</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 檢視模式切換 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              網格檢視
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-1" />
              列表檢視
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            共 {filteredItems.length} 個作品
          </p>
        </div>

        {/* 作品列表 */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-medium mb-2">沒有找到作品</h3>
              <p className="text-muted-foreground">
                嘗試調整搜尋條件或篩選器
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
            {filteredItems.map((item) => (
              viewMode === "grid" ? (
                <PortfolioCard key={item.id} item={item} />
              ) : (
                <PortfolioListItem key={item.id} item={item} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
