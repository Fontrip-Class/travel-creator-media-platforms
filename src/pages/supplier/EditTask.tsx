import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { ArrowLeft, Eye, Edit, Save, X } from "lucide-react";

export default function EditTask() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "台東秋季活動宣傳影片製作",
    summary: "製作台東秋季活動的宣傳影片",
    description: "詳細描述任務需求",
    budget: 15000,
    deadline: "2024-02-15",
    location: "台東縣",
    status: "collecting"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        title: "錯誤",
        description: "請填寫所有必填欄位",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 準備API資料，確保與後端規格一致
      const apiData = {
        title: formData.title,
        description: formData.description,
        summary: formData.summary,
        location: formData.location,
        status: formData.status
      };

      // 調用API更新任務
      const response = await apiService.updateTask(taskId, apiData);
      
      if (response.success) {
        toast({
          title: "更新成功",
          description: "任務資料已成功更新",
        });
        navigate("/supplier/dashboard");
      } else {
        throw new Error(response.message || "更新失敗");
      }
    } catch (error: any) {
      // 保留用戶填寫的資料，顯示詳細錯誤訊息
      toast({
        title: "更新失敗",
        description: error.message || "任務更新過程中發生錯誤，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/supplier/dashboard")}
            className="mb-4 p-0 h-auto font-normal text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回儀表板
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">編輯行銷任務</h1>
              <p className="text-gray-600 mt-2">更新任務資料，管理任務進度和狀態</p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "編輯模式" : "預覽模式"}
            </Button>
          </div>
        </div>

        {previewMode ? (
          <Card>
            <CardHeader>
              <CardTitle>任務預覽</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">{formData.title}</h3>
              <p className="text-gray-600 mb-3">{formData.summary}</p>
              <p className="text-gray-700 mb-4">{formData.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">預算：</span>
                  <span>NT$ {formData.budget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">截止日期：</span>
                  <span>{formData.deadline}</span>
                </div>
                <div>
                  <span className="font-medium">地點：</span>
                  <span>{formData.location}</span>
                </div>
                <div>
                  <span className="font-medium">狀態：</span>
                  <span className="capitalize">{formData.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>編輯任務</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 任務標題 */}
                <div>
                  <Label htmlFor="title" className="text-base font-medium">
                    任務標題 *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="請輸入任務標題"
                    required
                  />
                </div>

                {/* 任務摘要 */}
                <div>
                  <Label htmlFor="summary" className="text-base font-medium">
                    任務摘要
                  </Label>
                  <Input
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="請輸入任務摘要"
                  />
                </div>

                {/* 任務描述 */}
                <div>
                  <Label htmlFor="description" className="text-base font-medium">
                    任務描述 *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="請詳細描述任務需求、目標和期望成果"
                    rows={6}
                    required
                  />
                </div>

                {/* 預算和截止日期 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget" className="text-base font-medium">
                      預算
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">NT$</span>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                        className="pl-12"
                        placeholder="請輸入預算"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deadline" className="text-base font-medium">
                      截止日期
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 地點和狀態 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location" className="text-base font-medium">
                      地點
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="請輸入任務地點"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-base font-medium">
                      任務狀態
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇狀態" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">草稿</SelectItem>
                        <SelectItem value="open">開放申請</SelectItem>
                        <SelectItem value="collecting">收集中</SelectItem>
                        <SelectItem value="evaluating">評估中</SelectItem>
                        <SelectItem value="in_progress">進行中</SelectItem>
                        <SelectItem value="reviewing">審核中</SelectItem>
                        <SelectItem value="publishing">發布中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="cancelled">已取消</SelectItem>
                        <SelectItem value="expired">已過期</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/supplier/dashboard")}
                  >
                    <X className="h-4 w-4 mr-2" />
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        更新中...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        更新任務
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
