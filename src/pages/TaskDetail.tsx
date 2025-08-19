import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, User, Calendar, MapPin, Clock, FileText, Send } from "lucide-react";

export default function TaskDetail() {
  const [isApplying, setIsApplying] = useState(false);

  // 模擬任務數據
  const task = {
    id: "1",
    title: "台東秋季觀光活動宣傳",
    status: "徵集中",
    description: "需要為台東秋季觀光活動製作宣傳素材，包含風景攝影、美食攝影、影片製作。希望能突出台東當地的特色，吸引年輕族群關注。",
    reward: 15000,
    deadline: "2024-12-31",
    location: "台東縣",
    publisher: "台東縣政府觀光處",
    publishDate: "2024-11-15",
    requirements: ["攝影技巧", "影片製作", "攝影"],
    mediaTypes: ["照片", "影片", "攝影"],
    applicantCount: 5,
    maxApplicants: 10
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "徵集中": return "bg-green-100 text-green-800";
      case "審核中": return "bg-yellow-100 text-yellow-800";
      case "進行中": return "bg-blue-100 text-blue-800";
      case "已完成": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    // 模擬申請過程
    setTimeout(() => {
      setIsApplying(false);
      alert("申請已提交！");
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEO 
        title={`${task.title} - 委託任務詳情`}
        description={task.description}
      />

      <div className="grid gap-6">
        {/* 主要任務資料 */}
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
            {/* 基本資料 */}
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
                <span>發布日期：{task.publishDate}</span>
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

            {/* 申請狀態 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-800">
                    已申請：{task.applicantCount} / {task.maxApplicants}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    還有 {task.maxApplicants - task.applicantCount} 個名額
                  </p>
                </div>
                <Button 
                  onClick={handleApply}
                  disabled={isApplying || task.applicantCount >= task.maxApplicants}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isApplying ? "申請中..." : "立即申請"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
