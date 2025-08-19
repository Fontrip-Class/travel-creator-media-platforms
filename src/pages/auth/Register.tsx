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
import { Building2, Users, Newspaper, Plus, X, Store } from "lucide-react";
import apiService from "@/lib/api";
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
    
    // 基本聯絡資訊
    contact_person: string;
    contact_phone: string;
    contact_email: string;
    
    // 供應商特有欄位
    business_category?: string;
    service_areas?: string[];
    special_services?: string[];
    
    // 創作者特有欄位
    portfolio_url?: string;
    content_types?: string[];
    niches?: string[];
    audience_size?: number;
    
    // 媒體特有欄位
    media_type?: string;
    platform_name?: string;
    services?: string[];
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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  
  // 測試後端連接
  const testBackendConnection = async () => {
    setDebugInfo([]);
    setBackendStatus('unknown');
    
    const addDebugInfo = (info: string) => {
      setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
    };
    
    addDebugInfo('開始測試後端連接...');
    
    try {
      // 測試基本連接
      addDebugInfo('測試基本連接...');
      const response = await fetch('http://localhost:8000/');
      addDebugInfo(`基本連接狀態: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.text();
        addDebugInfo(`後端響應: ${data.substring(0, 100)}...`);
        setBackendStatus('connected');
        addDebugInfo('✅ 後端服務正常運行');
      } else {
        setBackendStatus('error');
        addDebugInfo(`❌ 後端服務響應錯誤: ${response.status}`);
      }
    } catch (error: any) {
      setBackendStatus('error');
      addDebugInfo(`❌ 無法連接到後端服務: ${error.message}`);
      
      if (error.message.includes('Failed to fetch')) {
        addDebugInfo('💡 可能的原因:');
        addDebugInfo('   1. 後端服務未啟動');
        addDebugInfo('   2. 後端服務端口不是8000');
        addDebugInfo('   3. 防火牆阻擋連接');
      }
    }
  };

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    isValid: false
  });

  // 添加用戶名和郵箱可用性檢查狀態
  const [usernameAvailability, setUsernameAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: '' });

  const [emailAvailability, setEmailAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: '' });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 檢查密碼強度並更新狀態
    if (name === 'password') {
      checkPasswordStrength(value);
    }

    // 檢查用戶名可用性
    if (name === 'username' && value.length >= 3) {
      checkUsernameAvailability(value);
    } else if (name === 'username') {
      setUsernameAvailability({ checking: false, available: null, message: '' });
    }

    // 檢查郵箱可用性
    if (name === 'email' && value.includes('@')) {
      checkEmailAvailability(value);
    } else if (name === 'email') {
      setEmailAvailability({ checking: false, available: null, message: '' });
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
      feedback = '密碼長度不足，至少需要6個字符';
    }

    // 字母檢查
    const hasLetter = /[a-zA-Z]/.test(password);
    if (hasLetter) {
      score += 1;
    } else if (score === 1) {
      feedback = '密碼需要包含字母';
    }

    // 數字檢查
    const hasNumber = /[0-9]/.test(password);
    if (hasNumber) {
      score += 1;
    } else if (score === 1) {
      feedback = '密碼需要包含數字';
    }

    // 特殊字符檢查（可選）
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    if (hasSpecial) {
      score += 1;
    }

    // 計算總分
    isValid = score >= 2 && password.length >= 6;

    // 根據分數給出反饋
    if (score === 0) {
      feedback = '密碼太弱';
    } else if (score === 1) {
      feedback = '密碼較弱';
    } else if (score === 2) {
      feedback = '密碼中等';
    } else if (score === 3) {
      feedback = '密碼較強';
    } else {
      feedback = '密碼很強';
    }

    setPasswordStrength({ score, feedback, isValid });
  };

  // 檢查用戶名可用性
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return;
    
    setUsernameAvailability({ checking: true, available: null, message: '檢查中...' });
    
    try {
      const response = await apiService.checkUsernameAvailability(username);
      if (response.success) {
        setUsernameAvailability({
          checking: false,
          available: response.data.available,
          message: response.data.available ? '用戶名可用' : '用戶名已被使用'
        });
      } else {
        setUsernameAvailability({
          checking: false,
          available: false,
          message: '檢查失敗，請稍後再試'
        });
      }
    } catch (error) {
      setUsernameAvailability({
        checking: false,
        available: false,
        message: '檢查失敗，請稍後再試'
      });
    }
  };

  // 檢查郵箱可用性
  const checkEmailAvailability = async (email: string) => {
    if (!email.includes('@')) return;
    
    setEmailAvailability({ checking: true, available: null, message: '檢查中...' });
    
    try {
      const response = await apiService.checkEmailAvailability(email);
      if (response.success) {
        setEmailAvailability({
          checking: false,
          available: response.data.available,
          message: response.data.available ? '郵箱可用' : '郵箱已被註冊'
        });
      } else {
        setEmailAvailability({
          checking: false,
          available: false,
          message: '檢查失敗，請稍後再試'
        });
      }
    } catch (error) {
      setEmailAvailability({
        checking: false,
        available: false,
        message: '檢查失敗，請稍後再試'
      });
    }
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
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      business_category: '',
      service_areas: [],
      special_services: [],
      portfolio_url: '',
      content_types: [],
      niches: [],
      audience_size: 0,
      media_type: '',
      platform_name: '',
      services: []
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
    const result = (() => {
      switch (currentStep) {
        case RegisterStep.ACCOUNT:
          const accountValid = formData.username && formData.email && formData.password && 
                 formData.confirmPassword && passwordStrength.isValid && formData.agreeToTerms;
          console.log('Account validation:', {
            username: !!formData.username,
            email: !!formData.email,
            password: !!formData.password,
            confirmPassword: !!formData.confirmPassword,
            passwordStrength: passwordStrength.isValid,
            agreeToTerms: formData.agreeToTerms,
            result: accountValid
          });
          return accountValid;
        case RegisterStep.ROLES:
          const rolesValid = selectedRoles.length > 0;
          console.log('Roles validation:', { selectedRoles, result: rolesValid });
          return rolesValid;
        case RegisterStep.BUSINESS_ENTITIES:
          const entitiesValid = businessEntities.length > 0 && 
                 businessEntities.every(entity => entity.name && entity.type && entity.description);
          console.log('Business entities validation:', { 
            businessEntities, 
            result: entitiesValid 
          });
          return entitiesValid;
        case RegisterStep.COMPLETE:
          console.log('Complete step validation: true');
          return true; // 完成步驟應該可以提交
        default:
          console.log('Default validation: false');
          return false;
      }
    })();
    
    console.log(`Step ${currentStep} validation result:`, result);
    return result;
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
    
    console.log('=== 註冊提交開始 ===');
    console.log('當前步驟:', currentStep);
    console.log('表單數據:', formData);
    console.log('選擇的角色:', selectedRoles);
    console.log('業務實體:', businessEntities);
    
    if (!canProceedToNextStep()) {
      const errorMsg = "請檢查所有必填欄位是否已填寫";
      console.error('驗證失敗:', errorMsg);
      toast({
        title: "錯誤",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    if (currentStep !== RegisterStep.COMPLETE) {
      console.log('跳轉到下一步');
      nextStep();
      return;
    }

    console.log('開始提交註冊...');
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('1. 創建用戶帳號...');
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: selectedRoles[0] // 使用第一個選擇的角色作為主要角色
      };
      console.log('用戶數據:', userData);
      
      const userResponse = await apiService.register(userData);
      console.log('用戶創建響應:', userResponse);

      if (!userResponse.success || !userResponse.data?.id) {
        throw new Error(`用戶註冊失敗: ${userResponse.message || '未知錯誤'}`);
      }

      const userId = userResponse.data.id;
      console.log('用戶ID:', userId);

      // 為用戶分配選擇的角色
      console.log('2. 分配用戶角色...');
      for (const roleName of selectedRoles) {
        console.log(`分配角色: ${roleName}`);
        try {
          const roleResponse = await apiService.assignUserRole({
            user_id: userId,
            role_name: roleName
          });
          console.log(`角色 ${roleName} 分配結果:`, roleResponse);
        } catch (roleError) {
          console.error(`角色 ${roleName} 分配失敗:`, roleError);
          throw new Error(`角色分配失敗: ${roleError.message}`);
        }
      }

      // 創建業務實體並分配權限
      console.log('3. 創建業務實體...');
      for (const entity of businessEntities) {
        console.log('創建業務實體:', entity);
        
        const businessEntityData = {
          name: entity.name,
          business_type: entity.type as any,
          description: entity.description,
          website: entity.website,
          
          // 基本聯絡資訊
          contact_person: entity.contact_person,
          contact_phone: entity.contact_phone,
          contact_email: entity.contact_email,
          
          // 根據業務類型傳遞對應欄位
          ...(entity.type === 'supplier' && {
            business_category: entity.business_category,
            service_areas: entity.service_areas,
            special_services: entity.special_services
          }),
          
          ...(entity.type === 'creator' && {
            portfolio_url: entity.portfolio_url,
            content_types: entity.content_types,
            niches: entity.niches,
            audience_size: entity.audience_size
          }),
          
          ...(entity.type === 'media' && {
            media_type: entity.media_type,
            platform_name: entity.platform_name,
            services: entity.services
          })
        };
        
        console.log('業務實體數據:', businessEntityData);
        
        try {
          const businessEntityResponse = await apiService.createBusinessEntity(businessEntityData);
          console.log('業務實體創建響應:', businessEntityResponse);

          if (businessEntityResponse.success && businessEntityResponse.data?.id) {
            console.log('4. 分配業務實體權限...');
            // 為業務實體分配管理權限
            for (const roleName of selectedRoles) {
              const roleId = await getRoleIdByName(roleName);
              if (roleId) {
                console.log(`為角色 ${roleName} 分配權限，角色ID: ${roleId}`);
                try {
                  const permissionResponse = await apiService.assignBusinessEntityPermission({
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
                  console.log('權限分配響應:', permissionResponse);
                } catch (permissionError) {
                  console.error('權限分配失敗:', permissionError);
                  throw new Error(`權限分配失敗: ${permissionError.message}`);
                }
              } else {
                console.warn(`未找到角色 ${roleName} 的ID`);
              }
            }
          } else {
            throw new Error(`業務實體創建失敗: ${businessEntityResponse.message || '未知錯誤'}`);
          }
        } catch (entityError) {
          console.error('業務實體創建失敗:', entityError);
          throw new Error(`業務實體創建失敗: ${entityError.message}`);
        }
      }

      console.log('=== 註冊成功 ===');
      toast({
        title: "註冊成功",
        description: "您的帳號已成功創建並加入平台，請登入開始使用",
      });

      // 跳轉到登入頁面
      navigate('/login');
      
    } catch (error: any) {
      console.error('=== 註冊失敗 ===');
      console.error('錯誤詳情:', error);
      console.error('錯誤類型:', error.constructor.name);
      console.error('錯誤訊息:', error.message);
      console.error('錯誤堆疊:', error.stack);
      
      // 更新調試信息
      addDebugInfo('❌ 註冊失敗');
      addDebugInfo(`錯誤類型: ${error.constructor.name || 'Unknown'}`);
      addDebugInfo(`錯誤訊息: ${error.message || '未知錯誤'}`);
      
      // 顯示用戶友好的錯誤信息
      let errorMessage = "註冊過程中發生錯誤";
      let errorTitle = "註冊失敗";
      
      if (error.message) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "無法連接到後端服務，請檢查後端是否啟動";
          errorTitle = "連接失敗";
        } else if (error.message.includes('Internal server error')) {
          errorMessage = "後端服務錯誤，請稍後再試或聯繫技術支援";
          errorTitle = "服務錯誤";
        } else if (error.message.includes('Username already exists')) {
          errorMessage = "用戶名已被使用，請選擇其他用戶名";
          errorTitle = "用戶名重複";
        } else if (error.message.includes('Email already exists')) {
          errorMessage = "郵箱已被註冊，請使用其他郵箱或嘗試登入";
          errorTitle = "郵箱重複";
        } else if (error.message.includes('資料驗證失敗')) {
          errorMessage = "請檢查輸入的資料是否正確";
          errorTitle = "資料驗證失敗";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
      
      if (error.message && error.message.includes('密碼')) {
        checkPasswordStrength(formData.password);
      }
    } finally {
      setIsLoading(false);
      console.log('=== 註冊流程結束 ===');
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

  const roles = [
    {
      value: "supplier",
      label: "供應商",
      icon: Store,
      description: "提供旅遊服務、產品、體驗的企業或個人",
      color: "text-blue-600"
    },
    {
      value: "creator",
      label: "創作者/KOL",
      icon: Users,
      description: "創作旅遊內容、分享旅遊經驗的個人或團隊",
      color: "text-green-600"
    },
    {
      value: "media",
      label: "媒體",
      icon: Newspaper,
      description: "媒體平台、行銷機構、廣告代理商",
      color: "text-purple-600"
    }
  ];

  const businessEntityTypes = [
    { value: "supplier", label: "供應商", description: "提供旅遊相關服務、產品、體驗" },
    { value: "creator", label: "創作者/KOL", description: "創作旅遊內容、分享旅遊經驗" },
    { value: "media", label: "媒體", description: "媒體平台、行銷機構、廣告代理商" }
  ];

  const contentTypes = [
    { value: "article", label: "文章/部落格" },
    { value: "video", label: "影片/Vlog" },
    { value: "photo", label: "攝影作品" },
    { value: "live", label: "直播" },
    { value: "podcast", label: "播客" },
    { value: "social_media", label: "社群媒體" }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[
          { step: RegisterStep.ACCOUNT, label: "帳號設定", icon: "1" },
          { step: RegisterStep.ROLES, label: "選擇角色", icon: "2" },
          { step: RegisterStep.BUSINESS_ENTITIES, label: "業務實體", icon: "3" },
          { step: RegisterStep.COMPLETE, label: "完成", icon: "4" }
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
          <Label htmlFor="username" className="text-base font-medium">用戶名稱 *</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="請輸入您的用戶名稱"
            required
          />
          {usernameAvailability.checking && (
            <p className="text-sm text-gray-500 mt-1">檢查中...</p>
          )}
          {usernameAvailability.message && (
            <p className={`text-sm mt-1 ${
              usernameAvailability.available ? 'text-green-600' : 'text-red-600'
            }`}>
              {usernameAvailability.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="email" className="text-base font-medium">電子郵件 *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="請輸入您的電子郵件"
            required
          />
          {emailAvailability.checking && (
            <p className="text-sm text-gray-500 mt-1">檢查中...</p>
          )}
          {emailAvailability.message && (
            <p className={`text-sm mt-1 ${
              emailAvailability.available ? 'text-green-600' : 'text-red-600'
            }`}>
              {emailAvailability.message}
            </p>
          )}
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
            placeholder="請輸入您的密碼"
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
            placeholder="請再次輸入您的密碼"
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
            placeholder="請輸入您的電話號碼"
          />
        </div>
        <div>
          <Label htmlFor="contact" className="text-base font-medium">聯絡人</Label>
          <Input
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            placeholder="請輸入聯絡人姓名"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))}
          />
          <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
            我同意 <TermsModal type="terms">服務條款</TermsModal> 和 <TermsModal type="privacy">隱私政策</TermsModal>
          </Label>
        </div>
        <p className="text-xs text-gray-500 ml-6">
          註冊即表示您同意我們的服務條款和隱私政策，我們會保護您的個人資料安全
        </p>
      </div>
    </div>
  );

  const renderRolesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">選擇您的角色</h3>
        <p className="text-gray-600">選擇您想要的角色類型，您可以選擇多個角色</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roles.map((role) => (
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
              const roleInfo = roles.find(r => r.value === role);
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
        <p className="text-gray-600">為您選擇的角色創建對應的業務實體，這些實體將代表您的業務身份</p>
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
              刪除
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">實體名稱 *</Label>
              <Input
                value={entity.name}
                onChange={(e) => updateBusinessEntity(index, 'name', e.target.value)}
                placeholder="請輸入實體名稱，例如：公司名稱、品牌名稱等"
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
              placeholder="請簡要描述您的業務實體，包括主要業務範圍、特色等"
              rows={3}
              required
            />
          </div>

          {entity.type === 'supplier' && (
            <>
              <div className="mt-4">
                <Label className="text-sm font-medium">業務類別</Label>
                <Select
                  value={entity.business_category || ''}
                  onValueChange={(value) => updateBusinessEntity(index, 'business_category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇業務類別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tour_guide">導遊服務</SelectItem>
                    <SelectItem value="transportation">交通運輸</SelectItem>
                    <SelectItem value="accommodation">住宿</SelectItem>
                    <SelectItem value="food_and_beverage">餐飲</SelectItem>
                    <SelectItem value="attraction_ticket">景點門票</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium">服務地區</Label>
                <Select
                  value={entity.service_areas?.join(',') || ''}
                  onValueChange={(value) => updateBusinessEntity(index, 'service_areas', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇服務地區" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="taipei">台北市</SelectItem>
                    <SelectItem value="new_taipei">新北市</SelectItem>
                    <SelectItem value="taoyuan">桃園市</SelectItem>
                    <SelectItem value="taichung">台中市</SelectItem>
                    <SelectItem value="kaohsiung">高雄市</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium">特殊服務</Label>
                <Select
                  value={entity.special_services?.join(',') || ''}
                  onValueChange={(value) => updateBusinessEntity(index, 'special_services', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇特殊服務" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private_tour">私人導覽</SelectItem>
                    <SelectItem value="custom_itinerary">客製化行程</SelectItem>
                    <SelectItem value="group_tour">團體旅遊</SelectItem>
                    <SelectItem value="wheelchair_accessible">輪椅友善</SelectItem>
                    <SelectItem value="language_guide">多語導覽</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {entity.type === 'creator' && (
            <>
              <div className="mt-4">
                <Label className="text-sm font-medium">作品集連結</Label>
                <Input
                  value={entity.portfolio_url || ''}
                  onChange={(e) => updateBusinessEntity(index, 'portfolio_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium">內容類型</Label>
                <Select
                  value={entity.content_types?.join(',') || ''}
                  onValueChange={(value) => updateBusinessEntity(index, 'content_types', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇內容類型" />
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
              <div className="mt-4">
                <Label className="text-sm font-medium">利基市場</Label>
                <Select
                  value={entity.niches?.join(',') || ''}
                  onValueChange={(value) => updateBusinessEntity(index, 'niches', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇利基市場" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel_photography">旅遊攝影</SelectItem>
                    <SelectItem value="food_blog">美食部落格</SelectItem>
                    <SelectItem value="adventure_travel">冒險旅遊</SelectItem>
                    <SelectItem value="luxury_travel">奢華旅遊</SelectItem>
                    <SelectItem value="family_travel">親子旅遊</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium">目標受眾</Label>
                <Input
                  value={entity.audience_size ? `${entity.audience_size}人` : ''}
                  onChange={(e) => updateBusinessEntity(index, 'audience_size', parseInt(e.target.value) || 0)}
                  placeholder="請輸入目標受眾數量"
                />
              </div>
            </>
          )}

          {entity.type === 'media' && (
            <>
              <div className="mt-4">
                <Label className="text-sm font-medium">媒體類型</Label>
                <Input
                  value={entity.media_type || ''}
                  onChange={(e) => updateBusinessEntity(index, 'media_type', e.target.value)}
                  placeholder="請輸入媒體類型，例如：電視、廣播、網路等"
                />
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium">平台名稱</Label>
                <Input
                  value={entity.platform_name || ''}
                  onChange={(e) => updateBusinessEntity(index, 'platform_name', e.target.value)}
                  placeholder="請輸入平台名稱，例如：Facebook、Instagram、YouTube"
                />
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium">提供服務</Label>
                <Select
                  value={entity.services?.join(',') || ''}
                  onValueChange={(value) => updateBusinessEntity(index, 'services', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇提供服務" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content_creation">內容創作</SelectItem>
                    <SelectItem value="social_media_management">社群媒體管理</SelectItem>
                    <SelectItem value="digital_marketing">數位行銷</SelectItem>
                    <SelectItem value="brand_consulting">品牌諮詢</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="mt-4">
            <Label className="text-sm font-medium">網站</Label>
            <Input
              value={entity.website || ''}
              onChange={(e) => updateBusinessEntity(index, 'website', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">聯絡人姓名</Label>
              <Input
                value={entity.contact_person || ''}
                onChange={(e) => updateBusinessEntity(index, 'contact_person', e.target.value)}
                placeholder="請輸入聯絡人姓名"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">聯絡人手機</Label>
              <Input
                value={entity.contact_phone || ''}
                onChange={(e) => updateBusinessEntity(index, 'contact_phone', e.target.value)}
                placeholder="請輸入聯絡人手機號碼"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">聯絡人Email</Label>
              <Input
                value={entity.contact_email || ''}
                onChange={(e) => updateBusinessEntity(index, 'contact_email', e.target.value)}
                placeholder="請輸入聯絡人Email"
              />
            </div>
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">註冊完成！</h3>
        <p className="text-gray-600">恭喜您成功完成註冊，現在可以開始使用平台了</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg text-left">
        <h4 className="font-semibold text-gray-900 mb-3">帳號設定</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-600">用戶名：</span>{formData.username}</div>
          <div><span className="text-gray-600">電子郵件：</span>{formData.email}</div>
          <div><span className="text-gray-600">電話：</span>{formData.phone || '未填寫'}</div>
          <div><span className="text-gray-600">聯絡人：</span>{formData.contact || '未填寫'}</div>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3 mt-4">選擇角色</h4>
        <div className="flex flex-wrap gap-2">
          {selectedRoles.map((role) => {
            const roleInfo = roles.find(r => r.value === role);
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
        description="選擇您的角色，開始創建業務實體"
      />

      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">用戶註冊</h1>
          <p className="text-muted-foreground">
            創建您的帳號，選擇角色，創建業務實體，開始您的旅程
          </p>
        </div>

        {renderStepIndicator()}

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>
              {currentStep === RegisterStep.ACCOUNT && "創建帳號"}
              {currentStep === RegisterStep.ROLES && "選擇角色"}
              {currentStep === RegisterStep.BUSINESS_ENTITIES && "創建業務實體"}
              {currentStep === RegisterStep.COMPLETE && "完成註冊"}
            </CardTitle>
            <CardDescription>
              {currentStep === RegisterStep.ACCOUNT && "請填寫基本帳號資訊"}
              {currentStep === RegisterStep.ROLES && "選擇您想要的角色類型"}
              {currentStep === RegisterStep.BUSINESS_ENTITIES && "為您選擇的角色創建對應的業務實體"}
              {currentStep === RegisterStep.COMPLETE && "完成註冊，開始使用平台"}
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

        {/* 調試面板 */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">🐛 調試信息 (開發模式)</CardTitle>
              <CardDescription className="text-orange-700">
                顯示詳細的調試信息，幫助診斷問題
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium text-orange-800">當前步驟:</Label>
                  <p className="text-orange-700">{currentStep}</p>
                </div>
                <div>
                  <Label className="font-medium text-orange-800">API基礎URL:</Label>
                  <p className="text-orange-700">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}</p>
                </div>
                <div>
                  <Label className="font-medium text-orange-800">選擇的角色:</Label>
                  <p className="text-orange-700">{selectedRoles.join(', ') || '無'}</p>
                </div>
                <div>
                  <Label className="font-medium text-orange-800">業務實體數量:</Label>
                  <p className="text-orange-700">{businessEntities.length}</p>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">錯誤詳情:</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('=== 手動調試信息 ===');
                        console.log('當前步驟:', currentStep);
                        console.log('表單數據:', formData);
                        console.log('選擇的角色:', selectedRoles);
                        console.log('業務實體:', businessEntities);
                        console.log('API基礎URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api');
                      }}
                    >
                      輸出調試信息到控制台
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">調試步驟:</h4>
                <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                  <li>打開瀏覽器開發者工具 (F12)</li>
                  <li>切換到 Console 標籤</li>
                  <li>點擊"完成註冊"按鈕</li>
                  <li>查看控制台輸出的詳細錯誤信息</li>
                  <li>檢查 Network 標籤中的API請求</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

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

