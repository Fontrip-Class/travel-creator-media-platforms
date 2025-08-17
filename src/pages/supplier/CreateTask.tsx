import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Users,
  FileText,
  Image,
  Video,
  Music,
  AlertCircle,
  CheckCircle,
  Gift
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskFormData {
  title: string;
  summary: string;
  description: string;
  budget: {
    min: number;
    max: number;
    type: string;
    rewardType: string;
    giftDescription?: string;
    experienceDescription?: string;
  };
  deadline: string;
  location: string;
  contentTypes: string[];
  requirements: string;
  targetAudience: string;
  examples: string;
  tags: string[];
}

const CONTENT_TYPES = [
  { id: "image", label: "圖文創作", icon: Image, description: "攝影、插畫、平面設計" },
  { id: "video", label: "影片製作", icon: Video, description: "短影片、宣傳片、紀錄片" },
  { id: "text", label: "文案撰寫", icon: FileText, description: "部落格、社群文案、新聞稿" },
  { id: "audio", label: "音頻製作", icon: Music, description: "Podcast、配樂、音效" }
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
    deadline: "",
    location: "",
    contentTypes: [],
    requirements: "",
    targetAudience: "",
    examples: "",
    tags: []
  });

  const [errors, setErrors] = useState<Partial<TaskFormData>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除錯誤
    if (errors[field as keyof TaskFormData]) {
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
          description: "最多只能添加 20 個標籤",
          variant: "destructive"
        });
        return;
      }
      
      // 檢查是否已存在相同標籤
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      } else {
        toast({
          title: "標籤已存在",
          description: "請輸入不同的標籤",
          variant: "destructive"
        });
      }
      
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "任務標題不能為空";
    }
    if (!formData.summary.trim()) {
      newErrors.summary = "任務摘要不能為空";
    }
    if (!formData.description.trim()) {
      newErrors.description = "任務描述不能為空";
    }
    if (!formData.deadline) {
      newErrors.deadline = "請選擇截止日期";
    }
    if (!formData.location.trim()) {
      newErrors.location = "請輸入任務地點";
    }
    if (formData.contentTypes.length === 0) {
      newErrors.contentTypes = "請至少選擇一種內容類型";
    }
    // 預算驗證
    if (formData.budget.rewardType === 'money') {
      if (formData.budget.min <= 0) {
        newErrors.budget = "請輸入有效的預算金額";
      }
      if (formData.budget.type === 'range' && formData.budget.max <= formData.budget.min) {
        newErrors.budget = "最高預算必須大於最低預算";
      }
    } else if (formData.budget.rewardType === 'gift') {
      if (!formData.budget.giftDescription?.trim()) {
        newErrors.budget = "請填寫贈品描述";
      }
    } else if (formData.budget.rewardType === 'experience') {
      if (!formData.budget.experienceDescription?.trim()) {
        newErrors.budget = "請填寫體驗描述";
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
      // 準備API數據，確保與後端規格一致
      const apiData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        budget_min: formData.budget.rewardType === 'money' ? formData.budget.min : undefined,
        budget_max: formData.budget.rewardType === 'money' && formData.budget.type === 'range' ? formData.budget.max : undefined,
        content_type: formData.contentTypes.length > 0 ? formData.contentTypes[0] : undefined,
        deadline: formData.deadline,
        tags: formData.tags,
        location: formData.location,
        // 自定義字段，需要後端支援
        summary: formData.summary,
        budget_type: formData.budget.type,
        reward_type: formData.budget.rewardType,
        gift_description: formData.budget.giftDescription,
        experience_description: formData.budget.experienceDescription,
        target_audience: formData.targetAudience,
        examples: formData.examples
      };

      // 調用API創建任務
      const response = await apiService.createTask(apiData);
      
      if (response.success) {
        toast({
          title: "任務創建成功",
          description: "您的行銷任務已成功發布，創作者可以開始提案了！",
        });
        
        // 導航到任務管理頁面
        navigate("/supplier/dashboard");
      } else {
        throw new Error(response.message || "創建失敗");
      }
    } catch (error: any) {
      // 保留用戶填寫的數據，顯示詳細錯誤訊息
      toast({
        title: "創建失敗",
        description: error.message || "任務創建過程中發生錯誤，請稍後重試",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    
    try {
      // 準備草稿數據
      const draftData = {
        ...formData,
        is_draft: true,
        created_at: new Date().toISOString()
      };

      // 調用API保存草稿
      const response = await apiService.saveTaskDraft(draftData);
      
      if (response.success) {
        toast({
          title: "草稿已保存",
          description: "任務草稿已成功保存",
        });
      } else {
        throw new Error(response.message || "保存失敗");
      }
    } catch (error: any) {
      toast({
        title: "保存失敗",
        description: error.message || "草稿保存失敗，請稍後重試",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本資訊 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            基本資訊
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">任務標題 *</Label>
              <Input
                id="title"
                placeholder="例如：台東季節活動宣傳影片製作"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              <p className="text-xs text-gray-500">
                標題長度：5-200字符，請簡潔明瞭地描述任務
              </p>
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">任務地點 *</Label>
              <Input
                id="location"
                placeholder="例如：台東縣"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">任務摘要 *</Label>
            <Textarea
              id="summary"
              placeholder="簡述任務目標和核心需求（100字以內）"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              maxLength={100}
              rows={3}
              className={errors.summary ? "border-red-500" : ""}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>簡潔明瞭的摘要能吸引更多創作者</span>
              <span>{formData.summary.length}/100</span>
            </div>
            {errors.summary && (
              <p className="text-sm text-red-500">{errors.summary}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">詳細描述 *</Label>
            <Textarea
              id="description"
              placeholder="詳細描述任務需求、目標、背景等資訊"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className={errors.description ? "border-red-500" : ""}
            />
            <p className="text-xs text-gray-500">
              描述長度：10-2000字符，請詳細說明任務需求和目標
            </p>
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 預算和時程 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            預算和時程
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>預算類型</Label>
              <Select
                value={formData.budget.type}
                onValueChange={(value) => handleBudgetChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>報酬類型</Label>
              <Select
                value={formData.budget.rewardType}
                onValueChange={(value) => handleBudgetChange('rewardType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget-min">最低預算 *</Label>
              <Input
                id="budget-min"
                type="number"
                placeholder="0"
                value={formData.budget.min}
                onChange={(e) => handleBudgetChange('min', parseInt(e.target.value) || 0)}
                className={errors.budget ? "border-red-500" : ""}
              />
            </div>

            {formData.budget.type === 'range' && (
              <div className="space-y-2">
                <Label htmlFor="budget-max">最高預算</Label>
                <Input
                  id="budget-max"
                  type="number"
                  placeholder="0"
                  value={formData.budget.max}
                  onChange={(e) => handleBudgetChange('max', parseInt(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          {/* 報酬描述 */}
          {formData.budget.rewardType === 'gift' && (
            <div className="space-y-2">
              <Label htmlFor="gift-description">贈品描述 *</Label>
              <Textarea
                id="gift-description"
                placeholder="請描述提供的贈品內容，例如：住宿券、餐券、紀念品等"
                value={formData.budget.giftDescription || ''}
                onChange={(e) => handleBudgetChange('giftDescription', e.target.value)}
                rows={3}
              />
            </div>
          )}

          {formData.budget.rewardType === 'experience' && (
            <div className="space-y-2">
              <Label htmlFor="experience-description">體驗描述 *</Label>
              <Textarea
                id="experience-description"
                placeholder="請描述提供的體驗內容，例如：熱氣球體驗、溫泉體驗、導覽服務等"
                value={formData.budget.experienceDescription || ''}
                onChange={(e) => handleBudgetChange('experienceDescription', e.target.value)}
                rows={3}
              />
            </div>
          )}

          {errors.budget && (
            <p className="text-sm text-red-500">{errors.budget}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="deadline">截止日期 *</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={errors.deadline ? "border-red-500" : ""}
            />
            {errors.deadline && (
              <p className="text-sm text-red-500">{errors.deadline}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 內容類型 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            內容類型
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONTENT_TYPES.map(type => (
              <div
                key={type.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.contentTypes.includes(type.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleContentTypeToggle(type.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={formData.contentTypes.includes(type.id)}
                    onChange={() => handleContentTypeToggle(type.id)}
                  />
                  <div className="flex items-center gap-2">
                    <type.icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{type.label}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 ml-7">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
          {errors.contentTypes && (
            <p className="text-sm text-red-500 mt-2">{errors.contentTypes}</p>
          )}
        </CardContent>
      </Card>

      {/* 詳細需求 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            詳細需求
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requirements">具體要求</Label>
            <Textarea
              id="requirements"
              placeholder="描述對創作者、作品風格、技術要求等具體需求"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">目標受眾</Label>
            <Input
              id="targetAudience"
              placeholder="例如：25-45歲的都市上班族、親子家庭"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examples">參考範例</Label>
            <Textarea
              id="examples"
              placeholder="提供類似的作品或風格參考，幫助創作者理解需求"
              value={formData.examples}
              onChange={(e) => handleInputChange('examples', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">標籤</Label>
            <div className="space-y-2">
              <Input
                id="tags"
                placeholder="輸入標籤後按 Enter 添加（例如：#台東熱氣球、旅遊、美食、文化）"
                onKeyDown={handleTagInput}
              />
              <p className="text-xs text-gray-500">
                提示：可以使用 hashtag 格式（如 #台東熱氣球）或直接輸入關鍵字，最多可添加 20 個標籤
              </p>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => removeTag(tag)}
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`} ×
                  </Badge>
                ))}
              </div>
            )}
            {formData.tags.length >= 20 && (
              <p className="text-xs text-amber-600">
                已達到標籤數量上限（20個）
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 操作按鈕 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          保存草稿
        </Button>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              發布中...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              發布任務
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              任務預覽
            </CardTitle>
            <Badge variant="outline">草稿</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{formData.title || "任務標題"}</h3>
            <p className="text-gray-600 mb-3">{formData.summary || "任務摘要"}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <MapPin className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                <p className="text-sm text-gray-600">地點</p>
                <p className="font-medium">{formData.location || "未設定"}</p>
              </div>
              <div className="text-center">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                <p className="text-sm text-gray-600">截止日期</p>
                <p className="font-medium">{formData.deadline || "未設定"}</p>
              </div>
              <div className="text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                <p className="text-sm text-gray-600">報酬</p>
                <p className="font-medium">
                  {formData.budget.rewardType === 'money' && formData.budget.min > 0 
                    ? `NT$ ${formData.budget.min.toLocaleString()}${formData.budget.type === 'range' && formData.budget.max > 0 ? ` - ${formData.budget.max.toLocaleString()}` : ''}`
                    : formData.budget.rewardType === 'gift' 
                    ? "贈品報酬"
                    : formData.budget.rewardType === 'experience'
                    ? "體驗報酬"
                    : "未設定"
                  }
                </p>
              </div>
              <div className="text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                <p className="text-sm text-gray-600">內容類型</p>
                <p className="font-medium">
                  {formData.contentTypes.length > 0 
                    ? formData.contentTypes.length + " 種"
                    : "未選擇"
                  }
                </p>
              </div>
            </div>

            {formData.contentTypes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">選擇的內容類型：</p>
                <div className="flex flex-wrap gap-2">
                  {formData.contentTypes.map(typeId => {
                    const type = CONTENT_TYPES.find(t => t.id === typeId);
                    return type ? (
                      <Badge key={typeId} variant="secondary">
                        {type.icon && <type.icon className="h-3 w-3 mr-1" />}
                        {type.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {formData.tags.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">標籤：</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">詳細描述</h4>
                <p className="text-gray-600 text-sm">
                  {formData.description || "尚未填寫詳細描述"}
                </p>
              </div>

              {formData.requirements && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">具體要求</h4>
                  <p className="text-gray-600 text-sm">{formData.requirements}</p>
                </div>
              )}

              {formData.targetAudience && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">目標受眾</h4>
                  <p className="text-gray-600 text-sm">{formData.targetAudience}</p>
                </div>
              )}

              {formData.examples && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">參考範例</h4>
                  <p className="text-gray-600 text-sm">{formData.examples}</p>
                </div>
              )}

              {/* 報酬描述 */}
              {formData.budget.rewardType === 'gift' && formData.budget.giftDescription && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">贈品內容</h4>
                  <p className="text-gray-600 text-sm">{formData.budget.giftDescription}</p>
                </div>
              )}

              {formData.budget.rewardType === 'experience' && formData.budget.experienceDescription && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">體驗內容</h4>
                  <p className="text-gray-600 text-sm">{formData.budget.experienceDescription}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => setPreviewMode(false)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回編輯
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <SEO 
        title="創建行銷任務 - 旅遊創作者媒體平台"
        description="發布新的行銷委託任務，尋找合適的創作者合作"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* 頁面標題 */}
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
                <p className="text-gray-600 mt-2">
                  詳細描述您的需求，吸引最適合的創作者合作
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2"
                >
                  {previewMode ? <FileText className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {previewMode ? "編輯模式" : "預覽模式"}
                </Button>
              </div>
            </div>
          </div>

          {/* 進度提示 */}
          <div className="mb-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                填寫完整的任務資訊能幫助創作者更好地理解您的需求，提高合作成功率。
                所有標記 * 的欄位都是必填項目。
              </AlertDescription>
            </Alert>
          </div>

          {/* 表單或預覽 */}
          {previewMode ? renderPreview() : renderForm()}
        </div>
      </div>
    </>
  );
}
