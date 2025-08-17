import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Users, Newspaper, Plus, X } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TermsModal } from "@/components/ui/terms-modal";
import { ApiErrorDisplay } from "@/components/ui/error-display";

// 註冊步驟枚舉
enum RegisterStep {
  ACCOUNT = 'account',
  ROLES = 'roles',
  BUSINESS_ENTITIES = 'business_entities',
  COMPLETE = 'complete'
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState<RegisterStep>(RegisterStep.ACCOUNT);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [businessEntities, setBusinessEntities] = useState<Array<{
    name: string;
    type: string;
    description: string;
    website?: string;
    portfolio_url?: string;
    content_types?: string[];
    media_type?: string;
    platform_name?: string;
    audience_size?: number;
  }>>([]);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    contact: '',
    agreeToTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    isValid: false
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 如果修改的是密碼，檢查密碼強度
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = '';
    let isValid = false;

    if (password.length === 0) {
      setPasswordStrength({ score: 0, feedback: '', isValid: false });
      return;
    }

    // 長度檢查
    if (password.length >= 6) {
      score += 1;
    } else {
      feedback = '密碼長度至少需要6個字符';
    }

    // 字母檢查
    const hasLetter = /[a-zA-Z]/.test(password);
    if (hasLetter) {
      score += 1;
    } else if (score === 1) {
      feedback = '密碼必須包含字母';
    }

    // 數字檢查
    const hasNumber = /[0-9]/.test(password);
    if (hasNumber) {
      score += 1;
    } else if (score === 1) {
      feedback = '密碼必須包含數字';
    }

    // 特殊字符檢查（可選，額外加分）
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    if (hasSpecial) {
      score += 1;
    }

    // 判斷是否有效
    isValid = score >= 2 && password.length >= 6;

    // 根據分數生成反饋
    if (score === 0) {
      feedback = '密碼太短';
    } else if (score === 1) {
      feedback = '密碼強度不足';
    } else if (score === 2) {
      feedback = '密碼強度一般';
    } else if (score === 3) {
      feedback = '密碼強度良好';
    } else {
      feedback = '密碼強度優秀';
    }

    setPasswordStrength({ score, feedback, isValid });
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const addBusinessEntity = () => {
    setBusinessEntities(prev => [...prev, {
      name: '',
      type: '',
      description: '',
      website: '',
      portfolio_url: '',
      content_types: [],
      media_type: '',
      platform_name: '',
      audience_size: 0
    }]);
  };

  const removeBusinessEntity = (index: number) => {
    setBusinessEntities(prev => prev.filter((_, i) => i !== index));
  };

  const updateBusinessEntity = (index: number, field: string, value: any) => {
    setBusinessEntities(prev => prev.map((entity, i) => 
      i === index ? { ...entity, [field]: value } : entity
    ));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case RegisterStep.ACCOUNT:
        return formData.username && formData.email && formData.password && 
               formData.confirmPassword && passwordStrength.isValid && formData.agreeToTerms;
      case RegisterStep.ROLES:
        return selectedRoles.length > 0;
      case RegisterStep.BUSINESS_ENTITIES:
        return businessEntities.length > 0 && 
               businessEntities.every(entity => entity.name && entity.type && entity.description);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep === RegisterStep.ACCOUNT) {
      setCurrentStep(RegisterStep.ROLES);
    } else if (currentStep === RegisterStep.ROLES) {
      setCurrentStep(RegisterStep.BUSINESS_ENTITIES);
    } else if (currentStep === RegisterStep.BUSINESS_ENTITIES) {
      setCurrentStep(RegisterStep.COMPLETE);
    }
  };

  const prevStep = () => {
    if (currentStep === RegisterStep.ROLES) {
      setCurrentStep(RegisterStep.ACCOUNT);
    } else if (currentStep === RegisterStep.BUSINESS_ENTITIES) {
      setCurrentStep(RegisterStep.ROLES);
    } else if (currentStep === RegisterStep.COMPLETE) {
      setCurrentStep(RegisterStep.BUSINESS_ENTITIES);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canProceedToNextStep()) {
      toast({
        title: "錯誤",
        description: "請完成當前步驟的所有必填項目",
        variant: "destructive"
      });
      return;
    }

    if (currentStep !== RegisterStep.COMPLETE) {
      nextStep();
      return;
    }

    setIsLoading(true);
    
    try {
      // 第一步：創建用戶帳號
      const userResponse = await apiService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        contact: formData.contact || undefined
      });

      if (!userResponse.success || !userResponse.data?.id) {
        throw new Error('用戶註冊失敗');
      }

      const userId = userResponse.data.id;

      // 第二步：為用戶分配角色
      for (const roleName of selectedRoles) {
        await apiService.assignUserRole({
          user_id: userId,
          role_name: roleName
        });
      }

      // 第三步：創建業務實體並分配權限
      for (const entity of businessEntities) {
        const businessEntityResponse = await apiService.createBusinessEntity({
          name: entity.name,
          type: entity.type,
          description: entity.description,
          website: entity.website,
          portfolio_url: entity.portfolio_url,
          content_types: entity.content_types,
          media_type: entity.media_type,
          platform_name: entity.platform_name,
          audience_size: entity.audience_size
        });

        if (businessEntityResponse.success && businessEntityResponse.data?.id) {
          // 為用戶分配該業務實體的管理權限
          const roleId = await getRoleIdByName(roleName);
          if (roleId) {
            await apiService.assignBusinessEntityPermission({
              user_id: userId,
              business_entity_id: businessEntityResponse.data.id,
              role_id: roleId,
              permission_level: 'manager',
              can_manage_users: true,
              can_manage_content: true,
              can_manage_finance: true,
              can_view_analytics: true,
              can_edit_profile: true
            });
          }
        }
      }

      toast({
        title: "註冊成功",
        description: "歡迎加入我們的平台！",
      });

      // 導向角色選擇頁面
      navigate('/role-selection');
      
    } catch (error: any) {
      const errorMessage = error.message || "註冊過程中發生錯誤，請稍後再試";
      setError(errorMessage);
      
      toast({
        title: "註冊失敗",
        description: errorMessage,
        variant: "destructive"
      });
      
      if (error.message && error.message.includes('密碼')) {
        checkPasswordStrength(formData.password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIdByName = async (roleName: string): Promise<string | null> => {
    try {
      const response = await apiService.getRoles();
      if (response.success) {
        const role = response.data?.find((r: any) => r.name === roleName);
        return role?.id || null;
      }
    } catch (error) {
      console.error('獲取角色ID失敗:', error);
    }
    return null;
  };

  const roleOptions = [
    {
      value: "supplier",
      label: "旅遊服務供應商",
      icon: Building2,
      description: "飯店、民宿、餐廳、旅行社、景點業者等",
      color: "text-blue-600"
    },
    {
      value: "creator",
      label: "創作者 / KOC",
      icon: Users,
      description: "部落客、網紅、攝影師、影像創作者等",
      color: "text-green-600"
    },
    {
      value: "media",
      label: "媒體通路",
      icon: Newspaper,
      description: "新聞媒體、雜誌、網路媒體、社群平台等",
      color: "text-purple-600"
    }
  ];

  const businessEntityTypes = [
    { value: "supplier", label: "供應商", description: "旅遊服務提供商" },
    { value: "koc", label: "KOC/創作者", description: "關鍵意見領袖和內容創作者" },
    { value: "media", label: "媒體", description: "媒體平台和通路" }
  ];

  const contentTypes = [
    { value: "video", label: "影片" },
    { value: "photo", label: "照片" },
    { value: "article", label: "文章" },
    { value: "live", label: "直播" }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[
          { step: RegisterStep.ACCOUNT, label: "帳號資訊", icon: "👤" },
          { step: RegisterStep.ROLES, label: "選擇角色", icon: "🎭" },
          { step: RegisterStep.BUSINESS_ENTITIES, label: "業務實體", icon: "🏢" },
          { step: RegisterStep.COMPLETE, label: "完成", icon: "✅" }
        ].map((item, index) => (
          <div key={item.step} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep === item.step 
                ? "border-primary bg-primary text-white" 
                : currentStep > item.step 
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-gray-300 bg-gray-100 text-gray-400"
            }`}>
              {currentStep > item.step ? "✓" : item.icon}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep === item.step ? "text-primary" : "text-gray-500"
            }`}>
              {item.label}
            </span>
            {index < 3 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > item.step ? "bg-green-500" : "bg-gray-300"
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAccountStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username" className="text-base font-medium">用戶名 *</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="請輸入用戶名"
            required
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-base font-medium">電子郵件 *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="請輸入電子郵件"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password" className="text-base font-medium">密碼 *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="請輸入密碼"
            required
          />
          {formData.password && (
            <div className="mt-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded ${
                      level <= passwordStrength.score
                        ? level <= 2 ? 'bg-red-500' : level <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-sm mt-1 ${
                passwordStrength.score < 2 ? 'text-red-600' : 'text-green-600'
              }`}>
                {passwordStrength.feedback}
              </p>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="text-base font-medium">確認密碼 *</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="請再次輸入密碼"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="text-base font-medium">電話號碼</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="請輸入電話號碼"
          />
        </div>
        <div>
          <Label htmlFor="contact" className="text-base font-medium">聯絡人</Label>
          <Input
            id="phone"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            placeholder="請輸入聯絡人姓名"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="agreeToTerms"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: checked }))}
        />
        <Label htmlFor="agreeToTerms" className="text-sm">
          我同意 <TermsModal /> 和隱私政策
        </Label>
      </div>
    </div>
  );

  const renderRolesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">選擇您的角色</h3>
        <p className="text-gray-600">您可以選擇多個角色，每個角色代表不同的業務能力</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roleOptions.map((role) => (
          <div
            key={role.value}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedRoles.includes(role.value)
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleRoleToggle(role.value)}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${role.color} bg-opacity-10`}>
                <role.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{role.label}</h4>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                selectedRoles.includes(role.value)
                  ? "border-primary bg-primary"
                  : "border-gray-300"
              }`}>
                {selectedRoles.includes(role.value) && (
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRoles.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">已選擇的角色：</h4>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map((role) => {
              const roleInfo = roleOptions.find(r => r.value === role);
              return (
                <span
                  key={role}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {roleInfo?.icon && <roleInfo.icon className="w-4 h-4 mr-1" />}
                  {roleInfo?.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderBusinessEntitiesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">創建業務實體</h3>
        <p className="text-gray-600">為每個角色創建對應的業務實體，這些實體將代表您的具體業務</p>
      </div>

      {businessEntities.map((entity, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">業務實體 #{index + 1}</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeBusinessEntity(index)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              移除
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">實體名稱 *</Label>
              <Input
                value={entity.name}
                onChange={(e) => updateBusinessEntity(index, 'name', e.target.value)}
                placeholder="例如：九族文化村、趙致緯工作室"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium">實體類型 *</Label>
              <Select
                value={entity.type}
                onValueChange={(value) => updateBusinessEntity(index, 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇實體類型" />
                </SelectTrigger>
                <SelectContent>
                  {businessEntityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-sm font-medium">描述 *</Label>
            <Textarea
              value={entity.description}
              onChange={(e) => updateBusinessEntity(index, 'description', e.target.value)}
              placeholder="請描述這個業務實體的主要業務和特色"
              rows={3}
              required
            />
          </div>

          {entity.type === 'koc' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="text-sm font-medium">作品集連結</Label>
                <Input
                  value={entity.portfolio_url || ''}
                  onChange={(e) => updateBusinessEntity(index, 'portfolio_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label className="text-sm font-medium">內容類型</Label>
                <Select
                  value={entity.content_types?.join(',') || ''}
                  onValueChange={(value) => updateBusinessEntity(index, 'content_types', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇內容類型" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {entity.type === 'media' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="text-sm font-medium">媒體類型</Label>
                <Input
                  value={entity.media_type || ''}
                  onChange={(e) => updateBusinessEntity(index, 'media_type', e.target.value)}
                  placeholder="例如：新聞、雜誌、社群平台"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">平台名稱</Label>
                <Input
                  value={entity.platform_name || ''}
                  onChange={(e) => updateBusinessEntity(index, 'platform_name', e.target.value)}
                  placeholder="例如：Facebook、Instagram、YouTube"
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <Label className="text-sm font-medium">網站</Label>
            <Input
              value={entity.website || ''}
              onChange={(e) => updateBusinessEntity(index, 'website', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addBusinessEntity}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        新增業務實體
      </Button>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded-full" />
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">註冊資訊確認</h3>
        <p className="text-gray-600">請確認以下資訊無誤，點擊完成註冊</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg text-left">
        <h4 className="font-semibold text-gray-900 mb-3">帳號資訊</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-600">用戶名：</span>{formData.username}</div>
          <div><span className="text-gray-600">電子郵件：</span>{formData.email}</div>
          <div><span className="text-gray-600">電話：</span>{formData.phone || '未填寫'}</div>
          <div><span className="text-gray-600">聯絡人：</span>{formData.contact || '未填寫'}</div>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3 mt-4">選擇的角色</h4>
        <div className="flex flex-wrap gap-2">
          {selectedRoles.map((role) => {
            const roleInfo = roleOptions.find(r => r.value === role);
            return (
              <span
                key={role}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {roleInfo?.icon && <roleInfo.icon className="w-4 h-4 mr-1" />}
                {roleInfo?.label}
              </span>
            );
          })}
        </div>

        <h4 className="font-semibold text-gray-900 mb-3 mt-4">業務實體</h4>
        <div className="space-y-2">
          {businessEntities.map((entity, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{entity.name}</span>
              <span className="text-gray-600"> - {entity.type} - {entity.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case RegisterStep.ACCOUNT:
        return renderAccountStep();
      case RegisterStep.ROLES:
        return renderRolesStep();
      case RegisterStep.BUSINESS_ENTITIES:
        return renderBusinessEntitiesStep();
      case RegisterStep.COMPLETE:
        return renderCompleteStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO
        title="註冊 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="選擇您的角色，加入台灣旅遊行銷生態圈"
      />

      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">加入我們的平台</h1>
          <p className="text-muted-foreground">
            建立您的帳號，選擇角色，創建業務實體，開始您的旅遊行銷之旅
          </p>
        </div>

        {renderStepIndicator()}

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>
              {currentStep === RegisterStep.ACCOUNT && "建立帳戶"}
              {currentStep === RegisterStep.ROLES && "選擇角色"}
              {currentStep === RegisterStep.BUSINESS_ENTITIES && "創建業務實體"}
              {currentStep === RegisterStep.COMPLETE && "確認註冊"}
            </CardTitle>
            <CardDescription>
              {currentStep === RegisterStep.ACCOUNT && "請填寫基本帳號資訊"}
              {currentStep === RegisterStep.ROLES && "選擇您要擔任的角色"}
              {currentStep === RegisterStep.BUSINESS_ENTITIES && "為每個角色創建對應的業務實體"}
              {currentStep === RegisterStep.COMPLETE && "確認所有資訊並完成註冊"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 錯誤顯示 */}
            <ApiErrorDisplay 
              error={error} 
              onDismiss={() => setError(null)}
              className="mb-6"
            />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderCurrentStep()}

              {/* 導航按鈕 */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === RegisterStep.ACCOUNT}
                >
                  上一步
                </Button>
                
                <div className="flex space-x-2">
                  {currentStep !== RegisterStep.COMPLETE ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceedToNextStep()}
                    >
                      下一步
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!canProceedToNextStep() || isLoading}
                    >
                      {isLoading ? "註冊中..." : "完成註冊"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            已有帳號？{" "}
            <Link to="/login" className="text-primary hover:underline">
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}