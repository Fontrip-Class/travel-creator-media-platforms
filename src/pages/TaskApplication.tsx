import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { Upload, X, FileText, DollarSign, Calendar, CheckCircle } from "lucide-react";

export default function TaskApplication() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    proposal: "",
    budget: "",
    timeline: "",
    experience: "",
    portfolio: [] as File[]
  });

  // 模擬任務資料
  const task = {
    id: id,
    title: "台東秋季活動宣傳",
    reward: 15000,
    requirements: ["攝影技巧", "影片製作", "攝影"],
    deadline: "2024-12-31"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.proposal || !formData.experience) {
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
        proposal: formData.proposal,
        proposed_budget: formData.budget ? parseFloat(formData.budget) : undefined,
        estimated_duration: formData.timeline,
        portfolio_samples: formData.portfolio.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        }))
      };

      // 調用API提交申請
      const response = await apiService.submitApplication(taskId, apiData);
      
      if (response.success) {
        toast({
          title: "申請成功",
          description: "申請已成功提交，供應商會盡快審核",
        });
        
        // 導航到申請列表頁面
        navigate("/dashboard/applications");
      } else {
        throw new Error(response.message || "申請失敗");
      }
    } catch (error: any) {
      // 保留用戶填寫的資料，顯示詳細錯誤訊息
      toast({
        title: "申請失敗",
        description: error.message || "申請過程中發生錯誤，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, portfolio: [...prev.portfolio, ...files] }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <SEO 
        title={`申請任務 - ${task.title}`}
        description={`申請接取${task.title}委託任務`}
      />

      <div className="space-y-6">
        {/* 任務概述 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">申請任務</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>報酬：NT$ {task.reward.toLocaleString()}</span>
                  <span>截止：{task.deadline}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">需求技能</h4>
                <div className="flex flex-wrap gap-2">
                  {task.requirements.map((req, index) => (
                    <Badge key={index} variant="secondary">{req}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 申請表單 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">申請表單</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 提案說明 */}
              <div>
                <Label htmlFor="proposal" className="text-base font-medium">
                  提案說明 *
                </Label>
                <Textarea
                  id="proposal"
                  value={formData.proposal}
                  onChange={(e) => setFormData(prev => ({ ...prev, proposal: e.target.value }))}
                  placeholder="請詳細說明您的創作理念、執行方式和預期成果"
                  rows={4}
                  required
                />
              </div>

              {/* 預算和時程 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget" className="text-base font-medium">
                    預算提案
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">NT$</span>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="請輸入您的預算"
                      className="pl-12"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="timeline" className="text-base font-medium">
                    預計完成時間
                  </Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="例如：2週內"
                  />
                </div>
              </div>

              {/* 相關經驗 */}
              <div>
                <Label htmlFor="experience" className="text-base font-medium">
                  相關經驗 *
                </Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="請描述您過去的相關創作經驗和作品"
                  rows={3}
                  required
                />
              </div>

              {/* 作品集上傳 */}
              <div>
                <Label className="text-base font-medium">
                  作品集上傳
                </Label>
                <div className="mt-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('portfolio-upload')?.click()}
                      >
                        選擇檔案
                      </Button>
                      <input
                        id="portfolio-upload"
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      支援圖片、影片、PDF、Word等格式
                    </p>
                  </div>
                  
                  {/* 已上傳檔案列表 */}
                  {formData.portfolio.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.portfolio.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* 提交按鈕 */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      提交申請
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
