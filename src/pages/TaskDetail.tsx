import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, DollarSign, User, Clock, FileText } from "lucide-react";

export default function TaskDetail() {
  const { id } = useParams();

  // 模擬任務數據
  const task = {
    id: id,
    title: "台東季節活動宣傳",
    status: "公開招募",
    description: "需要為台東秋季觀光活動製作宣傳素材，包含風景攝影、美食拍攝及短影音製作。希望能突出台東在地文化特色，吸引年輕族群關注。",
    reward: 15000,
    deadline: "2024-12-31",
    location: "台東縣",
    publisher: "台東縣政府觀光處",
    publishDate: "2024-11-15",
    requirements: ["圖文創作", "短影音製作", "攝影"],
    mediaTypes: ["圖片", "影片", "文案"],
    applicantCount: 5,
    maxApplicants: 10
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "公開招募": return "bg-green-100 text-green-800";
      case "審核中": return "bg-yellow-100 text-yellow-800";
      case "進行中": return "bg-blue-100 text-blue-800";
      case "已完成": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEO 
        title={`${task.title} - 委託任務詳情`}
        description={task.description}
      />

      <div className="grid gap-6">
        {/* 主要任務資訊 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{task.title}</h1>
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="text-2xl font-bold text-primary">NT$ {task.reward.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 基本資訊 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center text-muted-foreground">
                <User className="w-4 h-4 mr-2" />
                <span>發布者：{task.publisher}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                <span>截止日期：{task.deadline}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                <span>地點：{task.location}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                <span>發布時間：{task.publishDate}</span>
              </div>
            </div>

            <Separator />

            {/* 任務說明 */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                任務說明
              </h3>
              <p className="text-muted-foreground leading-relaxed">{task.description}</p>
            </div>

            <Separator />

            {/* 需求詳情 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">需求技能</h4>
                <div className="flex flex-wrap gap-2">
                  {task.requirements.map((req, index) => (
                    <Badge key={index} variant="secondary">{req}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">素材類型</h4>
                <div className="flex flex-wrap gap-2">
                  {task.mediaTypes.map((type, index) => (
                    <Badge key={index} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* 申請狀況 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                目前申請人數：{task.applicantCount} / {task.maxApplicants}
              </div>
              <div className="space-x-3">
                <Button variant="outline">收藏任務</Button>
                <Button>立即申請</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 相關任務推薦 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">相關推薦任務</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <h4 className="font-semibold mb-2">花蓮海岸風景攝影</h4>
                <p className="text-sm text-muted-foreground mb-2">拍攝花蓮七星潭、太魯閣等知名景點</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-green-100 text-green-800">公開招募</Badge>
                  <span className="text-sm font-semibold">NT$ 12,000</span>
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <h4 className="font-semibold mb-2">南投山區美食探索</h4>
                <p className="text-sm text-muted-foreground mb-2">製作南投在地美食短影音內容</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-green-100 text-green-800">公開招募</Badge>
                  <span className="text-sm font-semibold">NT$ 18,000</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}