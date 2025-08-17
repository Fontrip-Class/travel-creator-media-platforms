import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, Upload, TrendingUp, Users, Calendar, DollarSign, 
  Radio, Eye, Share2, BarChart3, FileText, Image, Video
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

const MOCK_ASSETS: Asset[] = [
  {
    id: "asset_001",
    title: "台東熱氣球節宣傳海報",
    type: "image",
    supplier: "台東旅遊局",
    downloadCount: 45,
    publishCount: 12,
    status: "active",
    tags: ["台東", "熱氣球", "宣傳", "海報"],
    createdAt: "2024-01-10"
  },
  {
    id: "asset_002",
    title: "花蓮海岸線攝影集",
    type: "image",
    supplier: "花蓮觀光處",
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
    title: "台東熱氣球節宣傳海報",
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
    platform: "YouTube",
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
    console.log(`執行操作: ${action} ID: ${id}`);
    
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
        console.log(`未處理的操作: ${action}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "published": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "活躍";
      case "pending": return "待審核";
      case "published": return "已發布";
      case "scheduled": return "已排程";
      default: return status;
    }
  };

  const getPublicationStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-purple-100 text-purple-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPublicationStatusText = (status: string) => {
    switch (status) {
      case "published": return "已發布";
      case "scheduled": return "已排程";
      case "draft": return "草稿";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">媒體儀表板</h1>
          <p className="text-gray-600">管理素材下載、內容發布和效果追蹤</p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">下載素材</p>
                  <p className="text-2xl font-bold text-blue-600">105</p>
                </div>
                <Download className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">發布內容</p>
                  <p className="text-2xl font-bold text-green-600">35</p>
                </div>
                <Upload className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總瀏覽量</p>
                  <p className="text-2xl font-bold text-purple-600">45.2K</p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">互動率</p>
                  <p className="text-2xl font-bold text-orange-600">8.5%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => handleAction("browse_assets", "")}
                className="h-20 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <Download className="h-6 w-6" />
                <span>瀏覽素材</span>
              </Button>
              
              <Button
                onClick={() => navigate("/media/upload")}
                className="h-20 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <Upload className="h-6 w-6" />
                <span>上傳內容</span>
              </Button>
              
              <Button
                onClick={() => handleAction("view_analytics", "")}
                className="h-20 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <BarChart3 className="h-6 w-6" />
                <span>效果分析</span>
              </Button>
              
              <Button
                onClick={() => navigate("/media/settings")}
                className="h-20 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <Users className="h-6 w-6" />
                <span>平台設定</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 標籤頁 */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {["overview", "assets", "publications", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "overview" && "總覽"}
                {tab === "assets" && "我的素材"}
                {tab === "publications" && "發布記錄"}
                {tab === "analytics" && "效果分析"}
              </button>
            ))}
          </div>
        </div>

        {/* 內容區域 */}
        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 熱門素材 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  熱門素材
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets.slice(0, 3).map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getAssetTypeIcon(asset.type)}
                          <h3 className="font-medium text-gray-900 line-clamp-2">{asset.title}</h3>
                        </div>
                        <Badge className={getStatusColor(asset.status)}>
                          {getStatusText(asset.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">供應商: {asset.supplier}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>下載: {asset.downloadCount}</span>
                        <span>發布: {asset.publishCount}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {asset.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAction("download_asset", asset.id)}
                          size="sm"
                          variant="outline"
                        >
                          下載
                        </Button>
                        <Button
                          onClick={() => handleAction("publish_content", asset.id)}
                          size="sm"
                        >
                          發布
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 最新發布 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  最新發布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publications.slice(0, 3).map((publication) => (
                    <div key={publication.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{publication.title}</h3>
                        <Badge className={getPublicationStatusColor(publication.status)}>
                          {getPublicationStatusText(publication.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">平台: {publication.platform}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>瀏覽: {publication.views.toLocaleString()}</span>
                        <span>互動: {publication.engagement}</span>
                      </div>
                      <p className="text-xs text-gray-400">發布時間: {publication.publishedAt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "assets" && (
          <Card>
            <CardHeader>
              <CardTitle>我的素材</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAssetTypeIcon(asset.type)}
                        <h3 className="font-medium text-gray-900 line-clamp-2">{asset.title}</h3>
                      </div>
                      <Badge className={getStatusColor(asset.status)}>
                        {getStatusText(asset.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">供應商: {asset.supplier}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>下載: {asset.downloadCount}</span>
                      <span>發布: {asset.publishCount}</span>
                      <span>創建: {asset.createdAt}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {asset.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAction("download_asset", asset.id)}
                        size="sm"
                        variant="outline"
                      >
                        下載
                      </Button>
                      <Button
                        onClick={() => handleAction("publish_content", asset.id)}
                        size="sm"
                      >
                        發布
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "publications" && (
          <Card>
            <CardHeader>
              <CardTitle>發布記錄</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publications.map((publication) => (
                  <div key={publication.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{publication.title}</h3>
                      <Badge className={getPublicationStatusColor(publication.status)}>
                        {getPublicationStatusText(publication.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">平台: {publication.platform}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>瀏覽: {publication.views.toLocaleString()}</span>
                      <span>互動: {publication.engagement}</span>
                    </div>
                    <p className="text-xs text-gray-400">發布時間: {publication.publishedAt}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "analytics" && (
          <Card>
            <CardHeader>
              <CardTitle>效果分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">效果分析功能開發中</p>
                <Button onClick={() => navigate("/media/analytics")}>
                  查看詳細分析
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
