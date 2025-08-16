import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TaskApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    proposal: "",
    experience: "",
    timeline: "",
    budget: "",
    portfolio: [] as File[],
    terms: false
  });

  // 模擬任務數據
  const task = {
    id: id,
    title: "台東季節活動宣傳",
    reward: 15000,
    requirements: ["圖文創作", "短影音製作", "攝影"],
    deadline: "2024-12-31"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 這裡會連接到後端API提交申請
    console.log("提交申請:", formData);
    // 模擬提交成功
    navigate("/dashboard/applications");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, portfolio: [...prev.portfolio, ...files] }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <SEO 
        title={`申請任務 - ${task.title}`}
        description={`申請承接${task.title}委託任務`}
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
            <CardTitle>申請資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 提案說明 */}
              <div className="space-y-2">
                <Label htmlFor="proposal">提案說明 *</Label>
                <Textarea
                  id="proposal"
                  placeholder="請說明您的創作理念、執行方式和預期成果..."
                  value={formData.proposal}
                  onChange={(e) => setFormData(prev => ({ ...prev, proposal: e.target.value }))}
                  className="min-h-[120px]"
                  required
                />
              </div>

              {/* 相關經驗 */}
              <div className="space-y-2">
                <Label htmlFor="experience">相關經驗 *</Label>
                <Textarea
                  id="experience"
                  placeholder="請分享您在類似項目的經驗和成果..."
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="min-h-[100px]"
                  required
                />
              </div>

              {/* 執行時程 */}
              <div className="space-y-2">
                <Label htmlFor="timeline">預計執行時程</Label>
                <Input
                  id="timeline"
                  placeholder="例如：2週完成拍攝，1週後製"
                  value={formData.timeline}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                />
              </div>

              {/* 預算說明 */}
              <div className="space-y-2">
                <Label htmlFor="budget">預算配置說明</Label>
                <Textarea
                  id="budget"
                  placeholder="請說明預算如何分配（交通、設備、後製等）..."
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                />
              </div>

              <Separator />

              {/* 作品集上傳 */}
              <div className="space-y-4">
                <Label>作品集展示</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    上傳相關作品集（圖片、影片或文件）
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="max-w-xs"
                  />
                </div>
                {formData.portfolio.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">已上傳檔案：</p>
                    {formData.portfolio.map((file, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* 注意事項 */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  申請前請確認您有能力在指定時間內完成任務，並同意遵守平台的服務條款。
                </AlertDescription>
              </Alert>

              {/* 同意條款 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.terms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, terms: checked as boolean }))
                  }
                />
                <Label htmlFor="terms" className="text-sm">
                  我同意平台服務條款，並確認提供的資訊真實有效
                </Label>
              </div>

              {/* 提交按鈕 */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  取消
                </Button>
                <Button type="submit" disabled={!formData.terms || !formData.proposal.trim()}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  提交申請
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}