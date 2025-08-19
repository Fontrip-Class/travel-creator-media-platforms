import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Eye, 
  Download, 
  Share2, 
  BarChart3, 
  Calendar, 
  Users, 
  Clock, 
  Star,
  TrendingUp,
  Image,
  Video,
  FileText,
  Globe,
  Facebook,
  Instagram,
  Youtube
} from "lucide-react";

interface Asset {
  id: string;
  title: string;
  type: string;
  supplier: string;
  downloadCount: number;
  publishCount: number;
  status: string;
  tags: string[];
  createdAt: string;
}

interface Publication {
  id: string;
  title: string;
  platform: string;
  status: string;
  views: number;
  engagement: number;
  publishedAt: string;
}

// 模擬數據
const MOCK_ASSETS: Asset[] = [
  {
    id: "asset_001",
    title: "台東秋季活動宣傳海報",
    type: "image",
    supplier: "台東縣政府",
    downloadCount: 45,
    publishCount: 12,
    status: "active",
    tags: ["台東", "秋季", "活動", "海報"],
    createdAt: "2024-01-10"
  },
  {
    id: "asset_002",
    title: "花蓮海岸線攝影集",
    type: "image",
    supplier: "花蓮觀光局",
    downloadCount: 32,
    publishCount: 8,
    status: "active",
    tags: ["花蓮", "海岸", "攝影", "自然"],
    createdAt: "2024-01-08"
  },
  {
    id: "asset_003",
    title: "阿里山日出影片",
    type: "video",
    supplier: "嘉義縣政府",
    downloadCount: 28,
    publishCount: 15,
    status: "active",
    tags: ["阿里山", "日出", "影片", "風景"],
    createdAt: "2024-01-05"
  }
];

const MOCK_PUBLICATIONS: Publication[] = [
  {
    id: "pub_001",
    title: "台東秋季活動宣傳海報",
    platform: "Facebook",
    status: "published",
    views: 2500,
    engagement: 156,
    publishedAt: "2024-01-15"
  },
  {
    id: "pub_002",
    title: "花蓮海岸線攝影集",
    platform: "Instagram",
    status: "published",
    views: 1800,
    engagement: 89,
    publishedAt: "2024-01-12"
  },
  {
    id: "pub_003",
    title: "阿里山日出影片",
            platform: "Youtube",
    status: "scheduled",
    views: 0,
    engagement: 0,
    publishedAt: "2024-01-20"
  }
];

export default function MediaDashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [publications, setPublications] = useState<Publication[]>(MOCK_PUBLICATIONS);

  const handleAction = (action: string, id: string) => {
    console.log(`執行動作: ${action} ID: ${id}`);
    
    switch (action) {
      case "browse_assets":
        navigate("/media/assets");
        break;
      case "download_asset":
        navigate(`/media/download/${id}`);
        break;
      case "publish_content":
        navigate(`/media/publish/${id}`);
        break;
      case "view_analytics":
        navigate("/media/analytics");
        break;
      default:
        console.log(`未知動作: ${action}`);
    }
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook": return <Facebook className="h-4 w-4" />;
      case "instagram": return <Instagram className="h-4 w-4" />;
      case "youtube": return <Youtube className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "inactive": return "bg-gray-500";
      case "published": return "bg-blue-500";
      case "scheduled": return "bg-yellow-500";
      case "draft": return "bg-gray-400";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "活躍";
      case "inactive": return "非活躍";
      case "published": return "已發布";
      case "scheduled": return "已排程";
      case "draft": return "草稿";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="媒體儀表板 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="管理您的媒體資源和發布內容"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">媒體儀表板</h1>
          <p className="text-gray-600 mt-2">管理您的媒體資源和發布內容</p>
        </div>

        {/* 統計概覽 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總資源數</p>
                  <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總下載數</p>
                  <p className="text-2xl font-bold text-green-600">
                    {assets.reduce((sum, asset) => sum + asset.downloadCount, 0)}
                  </p>
                </div>
                <Download className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總發布數</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {assets.reduce((sum, asset) => sum + asset.publishCount, 0)}
                  </p>
                </div>
                <Share2 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活躍資源</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {assets.filter(asset => asset.status === "active").length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要內容區域 */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">概覽</TabsTrigger>
            <TabsTrigger value="assets">資源管理</TabsTrigger>
            <TabsTrigger value="publications">發布管理</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6">
              {/* 最近活動 */}
              <Card>
                <CardHeader>
                  <CardTitle>最近活動</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assets.slice(0, 3).map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getAssetTypeIcon(asset.type)}
                          <div>
                            <p className="font-medium">{asset.title}</p>
                            <p className="text-sm text-gray-600">{asset.supplier}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">下載: {asset.downloadCount}</p>
                          <p className="text-sm text-gray-600">發布: {asset.publishCount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 快速操作 */}
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleAction("browse_assets", "")}>
                      <Eye className="h-6 w-6" />
                      <span>瀏覽資源</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleAction("publish_content", "")}>
                      <Share2 className="h-6 w-6" />
                      <span>發布內容</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleAction("view_analytics", "")}>
                      <BarChart3 className="h-6 w-6" />
                      <span>查看分析</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>資源管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getAssetTypeIcon(asset.type)}
                        <div>
                          <p className="font-medium">{asset.title}</p>
                          <p className="text-sm text-gray-600">{asset.supplier}</p>
                          <div className="flex gap-2 mt-1">
                            {asset.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">下載: {asset.downloadCount}</p>
                          <p className="text-sm text-gray-600">發布: {asset.publishCount}</p>
                          <Badge className={getStatusColor(asset.status)}>
                            {getStatusText(asset.status)}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAction("download_asset", asset.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            下載
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAction("publish_content", asset.id)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            發布
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>發布管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publications.map((publication) => (
                    <div key={publication.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(publication.platform)}
                        <div>
                          <p className="font-medium">{publication.title}</p>
                          <p className="text-sm text-gray-600">{publication.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">瀏覽: {publication.views}</p>
                          <p className="text-sm text-gray-600">互動: {publication.engagement}</p>
                          <Badge className={getStatusColor(publication.status)}>
                            {getStatusText(publication.status)}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            查看
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            分析
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
