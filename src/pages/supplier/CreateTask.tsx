import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import {
    ArrowLeft,
    DollarSign,
    Eye,
    FileText,
    Gift,
    Image,
    MapPin,
    Music,
    Save,
    Video,
    X
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TaskFormData {
  title: string;
  summary: string;
  description: string;
  budget: {
    min: number;
    max: number;
    type: string;
    rewardType: string;
  };
  reward_type: 'money' | 'gift' | 'experience';
  gift_details: string;
  deadline: string;
  location: string;
  contentTypes: string[];
  requirements: string;
  targetAudience: string;
  examples: string;
  tags: string[];
}

const CONTENT_TYPES = [
  { id: "image", label: "攝影設計", icon: Image, description: "攝影作品、平面設計" },
  { id: "video", label: "影片製作", icon: Video, description: "影片、宣傳片、廣告" },
  { id: "text", label: "文章撰寫", icon: FileText, description: "部落格、社群文案、新聞稿" },
  { id: "audio", label: "音頻製作", icon: Music, description: "Podcast、音樂、音效" }
];

const BUDGET_TYPES = [
  { value: "fixed", label: "固定預算" },
  { value: "range", label: "預算範圍" },
  { value: "negotiable", label: "可議價" }
];

const REWARD_TYPES = [
  { value: "money", label: "金錢報酬", icon: DollarSign, description: "現金支付" },
  { value: "gift", label: "贈品報酬", icon: Gift, description: "實體商品或服務" },
  { value: "experience", label: "體驗報酬", icon: MapPin, description: "旅遊體驗或活動" }
];

export default function CreateTask() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    summary: "",
    description: "",
    budget: {
      min: 0,
      max: 0,
      type: "fixed",
      rewardType: "money"
    },
    reward_type: 'money',
    gift_details: "",
    deadline: "",
    location: "",
    contentTypes: [],
    requirements: "",
    targetAudience: "",
    examples: "",
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 清除錯誤
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleBudgetChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        [field]: value
      }
    }));
  };

  const handleContentTypeToggle = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(typeId)
        ? prev.contentTypes.filter(id => id !== typeId)
        : [...prev.contentTypes, typeId]
    }));

    // 清除内容类型错误
    if (errors.contentTypes) {
      setErrors(prev => ({
        ...prev,
        contentTypes: undefined
      }));
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      let newTag = e.currentTarget.value.trim();

      // 自動添加 hashtag 前綴（如果沒有）
      if (!newTag.startsWith('#')) {
        newTag = `#${newTag}`;
      }

      // 檢查標籤數量限制
      if (formData.tags.length >= 20) {
        toast({
          title: "標籤數量已達上限",
          description: "最多只能添加20個標籤",
          variant: "destructive"
        });
        return;
      }

      // 檢查標籤是否已存在
      if (formData.tags.includes(newTag)) {
        toast({
          title: "標籤已存在",
          description: "請輸入不同的標籤",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));

      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "請輸入任務標題";
    }

    if (!formData.description.trim()) {
      newErrors.description = "請輸入任務描述";
    }

    if (!formData.deadline) {
      newErrors.deadline = "請選擇截止日期";
    }

    // 改进内容类型验证
    if (!formData.contentTypes || formData.contentTypes.length === 0) {
      newErrors.contentTypes = "請至少選擇一種內容類型";
    }

    // 根據報酬類型進行不同的驗證
    if (formData.reward_type === 'money') {
      if (formData.budget.type === "fixed" && formData.budget.min <= 0) {
        newErrors.budget = "請輸入有效的預算金額";
      }

      if (formData.budget.type === "range" && (formData.budget.min <= 0 || formData.budget.max <= formData.budget.min)) {
        newErrors.budget = "請輸入有效的預算範圍";
      }
    } else if (formData.reward_type === 'gift' || formData.reward_type === 'experience') {
      if (!formData.gift_details.trim()) {
        newErrors.gift_details = "請詳細描述提供的贈品或體驗內容";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "表單驗證失敗",
        description: "請檢查並填寫所有必填欄位",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const apiData = {
        title: formData.title,
        summary: formData.summary,
        description: formData.description,
        budget: formData.budget,
        reward_type: formData.reward_type,
        gift_details: formData.gift_details,
        deadline: formData.deadline,
        location: formData.location,
        content_types: formData.contentTypes,
        requirements: formData.requirements,
        target_audience: formData.targetAudience,
        examples: formData.examples,
        tags: formData.tags
      };

      // 注意：这里需要根据实际的API接口调整数据结构
      const response = await apiService.createTask(apiData as any);

      if (response.success) {
        toast({
          title: "任務創建成功",
          description: "您的任務已成功發布",
        });
        navigate("/supplier/dashboard");
      } else {
        throw new Error(response.message || "任務創建失敗");
      }
    } catch (error: any) {
      toast({
        title: "任務創建失敗",
        description: error.message || "創建過程中發生錯誤，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          任務預覽
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">{formData.title || "任務標題"}</h3>
          <p className="text-gray-600">{formData.summary || "任務摘要"}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">任務描述</h4>
          <p className="text-gray-700 whitespace-pre-wrap">
            {formData.description || "請填寫任務描述"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">報酬類型：</span>
            <span>
              {formData.reward_type === 'money' ? '金錢報酬' :
               formData.reward_type === 'gift' ? '贈品報酬' : '體驗報酬'}
            </span>
          </div>
          <div>
            <span className="font-medium">截止日期：</span>
            <span>{formData.deadline || "未設定"}</span>
          </div>
          <div>
            <span className="font-medium">地點：</span>
            <span>{formData.location || "未設定"}</span>
          </div>
          <div>
            <span className="font-medium">內容類型：</span>
            <span>{formData.contentTypes.length > 0 ? formData.contentTypes.join(", ") : "未選擇"}</span>
          </div>
        </div>

        {formData.reward_type === 'money' && (
          <div>
            <span className="font-medium">預算：</span>
            <span>
              {formData.budget.type === "fixed"
                ? `NT$ ${formData.budget.min.toLocaleString()}`
                : formData.budget.type === "range"
                ? `NT$ ${formData.budget.min.toLocaleString()} - ${formData.budget.max.toLocaleString()}`
                : "可議價"
              }
            </span>
          </div>
        )}

        {(formData.reward_type === 'gift' || formData.reward_type === 'experience') && formData.gift_details && (
          <div>
            <h4 className="font-semibold mb-2">
              {formData.reward_type === 'gift' ? '贈品詳情' : '體驗詳情'}
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">{formData.gift_details}</p>
          </div>
        )}

        {formData.tags.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">標籤</h4>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="創建任務 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="發布您的行銷任務，尋找合適的創作者"
      />

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
              <h1 className="text-3xl font-bold text-gray-900">創建行銷任務</h1>
              <p className="text-gray-600 mt-2">發布您的行銷需求，尋找合適的創作者</p>
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
          renderPreview()
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* 基本資訊 */}
              <Card>
                <CardHeader>
                  <CardTitle>基本資訊</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-medium">
                      任務標題 *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="請輸入任務標題"
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="summary" className="text-base font-medium">
                      任務摘要
                    </Label>
                    <Input
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => handleInputChange("summary", e.target.value)}
                      placeholder="請簡要描述任務內容"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-base font-medium">
                      任務描述 *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="請詳細描述任務需求、目標和期望成果"
                      rows={6}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 預算和時程 */}
              <Card>
                <CardHeader>
                  <CardTitle>預算和時程</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">報酬類型 *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      {REWARD_TYPES.map((type) => (
                        <div
                          key={type.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.reward_type === type.value
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleInputChange("reward_type", type.value)}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={formData.reward_type === type.value}
                              onCheckedChange={() => handleInputChange("reward_type", type.value)}
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <type.icon className="h-5 w-5 text-gray-600" />
                                <span className="font-medium">{type.label}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 金錢報酬的預算設定 */}
                  {formData.reward_type === 'money' && (
                    <>
                      <div>
                        <Label className="text-base font-medium">預算類型</Label>
                        <div className="flex gap-4 mt-2">
                          {BUDGET_TYPES.map((type) => (
                            <label key={type.value} className="flex items-center space-x-2">
                              <Checkbox
                                checked={formData.budget.type === type.value}
                                onCheckedChange={() => handleBudgetChange("type", type.value)}
                              />
                              <span className="text-sm">{type.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="budgetMin" className="text-base font-medium">
                            最低預算
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">NT$</span>
                            <Input
                              id="budgetMin"
                              type="number"
                              value={formData.budget.min}
                              onChange={(e) => handleBudgetChange("min", parseInt(e.target.value) || 0)}
                              className="pl-12"
                              placeholder="請輸入最低預算"
                            />
                          </div>
                        </div>

                        {formData.budget.type === "range" && (
                          <div>
                            <Label htmlFor="budgetMax" className="text-base font-medium">
                              最高預算
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">NT$</span>
                              <Input
                                id="budgetMax"
                                type="number"
                                value={formData.budget.max}
                                onChange={(e) => handleBudgetChange("max", parseInt(e.target.value) || 0)}
                                className="pl-12"
                                placeholder="請輸入最高預算"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* 贈品或體驗的詳情描述 */}
                  {(formData.reward_type === 'gift' || formData.reward_type === 'experience') && (
                    <div>
                      <Label htmlFor="giftDetails" className="text-base font-medium">
                        {formData.reward_type === 'gift' ? '贈品詳情' : '體驗詳情'} *
                      </Label>
                      <Textarea
                        id="giftDetails"
                        value={formData.gift_details}
                        onChange={(e) => handleInputChange("gift_details", e.target.value)}
                        placeholder={formData.reward_type === 'gift'
                          ? "請詳細描述提供的贈品內容、數量、價值等"
                          : "請詳細描述提供的體驗內容、時長、地點等"
                        }
                        rows={4}
                        className={errors.gift_details ? "border-red-500" : ""}
                      />
                      {errors.gift_details && (
                        <p className="text-sm text-red-500 mt-1">{errors.gift_details}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="deadline" className="text-base font-medium">
                      截止日期 *
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange("deadline", e.target.value)}
                      className={errors.deadline ? "border-red-500" : ""}
                    />
                    {errors.deadline && (
                      <p className="text-sm text-red-500 mt-1">{errors.deadline}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-base font-medium">
                      任務地點
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="請輸入任務地點"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 內容類型和需求 */}
              <Card>
                <CardHeader>
                  <CardTitle>內容類型和需求</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">內容類型 *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {CONTENT_TYPES.map((type) => (
                        <div
                          key={type.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.contentTypes.includes(type.id)
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleContentTypeToggle(type.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={formData.contentTypes.includes(type.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleContentTypeToggle(type.id);
                                } else {
                                  handleContentTypeToggle(type.id);
                                }
                              }}
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <type.icon className="h-5 w-5 text-gray-600" />
                                <span className="font-medium">{type.label}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.contentTypes && (
                      <p className="text-sm text-red-500 mt-1">{errors.contentTypes}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="requirements" className="text-base font-medium">
                      具體需求
                    </Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange("requirements", e.target.value)}
                      placeholder="請描述具體的創作要求和技術規格"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetAudience" className="text-base font-medium">
                      目標受眾
                    </Label>
                    <Input
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                      placeholder="請描述目標受眾的特徵"
                    />
                  </div>

                  <div>
                    <Label htmlFor="examples" className="text-base font-medium">
                      參考範例
                    </Label>
                    <Textarea
                      id="examples"
                      value={formData.examples}
                      onChange={(e) => handleInputChange("examples", e.target.value)}
                      placeholder="請提供參考範例或說明期望的風格"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 標籤 */}
              <Card>
                <CardHeader>
                  <CardTitle>標籤</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tags" className="text-base font-medium">
                      添加標籤
                    </Label>
                    <Input
                      id="tags"
                      placeholder="輸入標籤後按 Enter 鍵添加（最多20個）"
                      onKeyDown={handleTagInput}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      標籤將幫助創作者更好地理解您的需求
                    </p>
                  </div>

                  {formData.tags.length > 0 && (
                    <div>
                      <Label className="text-base font-medium">已添加的標籤</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 提交按鈕 */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/supplier/dashboard")}
                >
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
                      創建中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      創建任務
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
