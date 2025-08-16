import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Eye,
  Heart,
  Share2,
  Calendar,
  Tag,
  Star,
  Edit,
  Trash2
} from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  type: "image" | "video" | "article";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 模擬作品集數據
  const portfolioItems: PortfolioItem[] = [
    {
      id: "1",
      title: "台東海岸風光攝影集",
      type: "image",
      category: "攝影",
      tags: ["風景攝影", "海岸", "台東"],
      thumbnail: "/api/placeholder/300/200",
      views: 1520,
      likes: 89,
      createdDate: "2024-11-15",
      taskRelated: "台東季節活動宣傳",
      description: "拍攝台東美麗的海岸線，展現自然之美",
      rating: 4.8
    },
    {
      id: "2",
      title: "美食短影音系列",
      type: "video",
      category: "影音製作",
      tags: ["美食", "短影音", "TikTok"],
      thumbnail: "/api/placeholder/300/200",
      views: 3200,
      likes: 156,
      createdDate: "2024-11-10",
      taskRelated: "南投山區美食探索",
      description: "製作吸引人的美食短影音內容",
      rating: 4.9
    },
    {
      id: "3",
      title: "旅遊攻略文章",
      type: "article",
      category: "文案撰寫",
      tags: ["旅遊", "攻略", "部落格"],
      thumbnail: "/api/placeholder/300/200",
      views: 890,
      likes: 45,
      createdDate: "2024-11-05",
      description: "深度旅遊攻略文章，提供實用資訊"
    },
    {
      id: "4",
      title: "品牌形象照拍攝",
      type: "image",
      category: "攝影",
      tags: ["商業攝影", "品牌", "人像"],
      thumbnail: "/api/placeholder/300/200",
      views: 1100,
      likes: 78,
      createdDate: "2024-10-28",
      taskRelated: "花蓮海岸風景攝影",
      description: "專業品牌形象照拍攝",
      rating: 4.7
    }
  ];

  const categories = ["all", "攝影", "影音製作", "文案撰寫", "設計"];

  const filteredItems = portfolioItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return "📸";
      case "video": return "🎥";
      case "article": return "📝";
      default: return "📄";
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
            {getTypeIcon(item.type)} {item.type === "image" ? "圖片" : item.type === "video" ? "影音" : "文章"}
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold line-clamp-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>

          {item.taskRelated && (
            <div className="text-xs text-muted-foreground">
              任務相關：{item.taskRelated}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {item.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {item.likes}
              </span>
              {item.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {item.rating}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {item.createdDate}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="w-4 h-4 mr-1" />
              編輯
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PortfolioListItem = ({ item }: { item: PortfolioItem }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Badge className={getTypeColor(item.type)}>
                {getTypeIcon(item.type)} {item.type === "image" ? "圖片" : item.type === "video" ? "影音" : "文章"}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {item.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {item.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {item.createdDate}
                </span>
                {item.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {item.rating}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-1" />
                  編輯
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="我的作品集"
        description="管理和展示您的創作作品"
      />

      <div className="space-y-6">
        {/* 標題與操作 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">我的作品集</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新增作品
          </Button>
        </div>

        {/* 搜尋與篩選 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="搜尋作品標題或標籤..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "全部分類" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計概覽 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {portfolioItems.length}
              </div>
              <div className="text-sm text-muted-foreground">總作品數</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {portfolioItems.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">總瀏覽數</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {portfolioItems.reduce((sum, item) => sum + item.likes, 0)}
              </div>
              <div className="text-sm text-muted-foreground">總按讚數</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {(portfolioItems.filter(item => item.rating).reduce((sum, item) => sum + (item.rating || 0), 0) / 
                  portfolioItems.filter(item => item.rating).length).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">平均評分</div>
            </CardContent>
          </Card>
        </div>

        {/* 作品展示 */}
        <div>
          {filteredItems.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => (
                    <PortfolioCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <PortfolioListItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  {searchTerm || selectedCategory !== "all" 
                    ? "沒有找到符合條件的作品" 
                    : "還沒有上傳任何作品"
                  }
                </div>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  新增第一個作品
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}