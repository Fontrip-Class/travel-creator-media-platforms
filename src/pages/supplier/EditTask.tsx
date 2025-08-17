import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function EditTask() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "台東季節活動宣傳影片製作",
    summary: "製作台東季節活動的宣傳影片",
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
      // 準備API數據，確保與後端規格一致
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
          description: "任務資訊已成功更新！",
        });
        navigate("/supplier/dashboard");
      } else {
        throw new Error(response.message || "更新失敗");
      }
    } catch (error: any) {
      // 保留用戶填寫的數據，顯示詳細錯誤訊息
      toast({
        title: "更新失敗",
        description: error.message || "任務更新過程中發生錯誤，請稍後重試",
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
              <p className="text-gray-600 mt-2">更新任務資訊，管理任務狀態和進度</p>
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
              <Badge variant="outline">{formData.status}</Badge>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">任務標題 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    標題長度：5-200字符，請簡潔明瞭地描述任務
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="summary">任務摘要</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">詳細描述 *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    描述長度：10-2000字符，請詳細說明任務需求和目標
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                更新任務
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
