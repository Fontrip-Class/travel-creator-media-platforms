import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  Newspaper, 
  Edit, 
  Plus, 
  Trash2, 
  Settings, 
  Eye,
  Shield,
  UserCheck,
  FileText,
  DollarSign,
  BarChart3
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ApiErrorDisplay } from "@/components/ui/error-display";
import type { 
  BusinessEntity, 
  UserBusinessPermission, 
  SupplierProfile, 
  CreatorProfile, 
  MediaProfile,
  BusinessManagementSummary 
} from "@/types/database";

interface BusinessEntityWithPermissions extends BusinessEntity {
  permissions?: UserBusinessPermission[];
  supplierProfile?: SupplierProfile;
  creatorProfile?: CreatorProfile;
  mediaProfile?: MediaProfile;
}

export default function BusinessEntityManagement() {
  const [businessEntities, setBusinessEntities] = useState<BusinessEntityWithPermissions[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<BusinessEntityWithPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<BusinessEntity>>({});
  const [createForm, setCreateForm] = useState<Partial<BusinessEntity>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadBusinessEntities();
  }, []);

  const loadBusinessEntities = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        navigate('/login');
        return;
      }

      const response = await apiService.getBusinessManagementSummary(userId);
      if (response.success && response.data) {
        const entities = await Promise.all(
          response.data.map(async (summary: BusinessManagementSummary) => {
            const entityResponse = await apiService.getBusinessEntity(summary.business_entity_id);
            if (entityResponse.success && entityResponse.data) {
              const entity = entityResponse.data as BusinessEntityWithPermissions;
              
              // 載入權限資訊
              const permissionsResponse = await apiService.getBusinessEntityPermissions(entity.id);
              if (permissionsResponse.success) {
                entity.permissions = permissionsResponse.data;
              }

              // 載入詳細資訊
              if (entity.type === 'supplier') {
                const profileResponse = await apiService.getSupplierProfile(entity.id);
                if (profileResponse.success) {
                  entity.supplierProfile = profileResponse.data;
                }
              } else if (entity.type === 'koc') {
                const profileResponse = await apiService.getCreatorProfile(entity.id);
                if (profileResponse.success) {
                  entity.creatorProfile = profileResponse.data;
                }
              } else if (entity.type === 'media') {
                const profileResponse = await apiService.getMediaProfile(entity.id);
                if (profileResponse.success) {
                  entity.mediaProfile = profileResponse.data;
                }
              }

              return entity;
            }
            return null;
          })
        );

        setBusinessEntities(entities.filter(Boolean) as BusinessEntityWithPermissions[]);
      }
    } catch (error: any) {
      setError(error.message || "載入業務實體失敗");
      toast({
        title: "載入失敗",
        description: error.message || "無法載入業務實體",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (entity: BusinessEntityWithPermissions) => {
    setSelectedEntity(entity);
    setEditForm({
      name: entity.name,
      description: entity.description,
      website: entity.website,
      status: entity.status
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCreateForm({
      name: '',
      type: '',
      description: '',
      website: '',
      status: 'active'
    });
    setIsCreating(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEntity) return;

    try {
      const response = await apiService.updateBusinessEntity(selectedEntity.id, editForm);
      if (response.success) {
        toast({
          title: "更新成功",
          description: "業務實體已更新",
        });
        
        // 重新載入資料
        await loadBusinessEntities();
        setIsEditing(false);
        setSelectedEntity(null);
      }
    } catch (error: any) {
      toast({
        title: "更新失敗",
        description: error.message || "無法更新業務實體",
        variant: "destructive"
      });
    }
  };

  const handleSaveCreate = async () => {
    try {
      const response = await apiService.createBusinessEntity(createForm);
      if (response.success) {
        toast({
          title: "創建成功",
          description: "業務實體已創建",
        });
        
        // 重新載入資料
        await loadBusinessEntities();
        setIsCreating(false);
        setCreateForm({});
      }
    } catch (error: any) {
      toast({
        title: "創建失敗",
        description: error.message || "無法創建業務實體",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (entityId: string) => {
    if (!confirm("確定要刪除這個業務實體嗎？此操作無法撤銷。")) {
      return;
    }

    try {
      const response = await apiService.deleteBusinessEntity(entityId);
      if (response.success) {
        toast({
          title: "刪除成功",
          description: "業務實體已刪除",
        });
        
        // 重新載入資料
        await loadBusinessEntities();
      }
    } catch (error: any) {
      toast({
        title: "刪除失敗",
        description: error.message || "無法刪除業務實體",
        variant: "destructive"
      });
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'supplier':
        return <Building2 className="w-6 h-6 text-blue-600" />;
      case 'koc':
        return <Users className="w-6 h-6 text-green-600" />;
      case 'media':
        return <Newspaper className="w-6 h-6 text-purple-600" />;
      default:
        return <Building2 className="w-6 h-6 text-gray-600" />;
    }
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'supplier':
        return '供應商';
      case 'koc':
        return 'KOC/創作者';
      case 'media':
        return '媒體';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">啟用中</Badge>;
      case 'inactive':
        return <Badge variant="secondary">停用中</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">待審核</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'can_manage_users':
        return <UserCheck className="w-4 h-4" />;
      case 'can_manage_content':
        return <FileText className="w-4 h-4" />;
      case 'can_manage_finance':
        return <DollarSign className="w-4 h-4" />;
      case 'can_view_analytics':
        return <BarChart3 className="w-4 h-4" />;
      case 'can_edit_profile':
        return <Edit className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="業務實體管理 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="管理您的業務實體、權限和設定"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">業務實體管理</h1>
            <p className="text-muted-foreground mt-2">
              管理您的所有業務實體，包括供應商、創作者和媒體通路
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新增業務實體
          </Button>
        </div>

        {/* 錯誤顯示 */}
        <ApiErrorDisplay 
          error={error} 
          onDismiss={() => setError(null)}
          className="mb-6"
        />

        {/* 業務實體列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {businessEntities.map((entity) => (
            <Card key={entity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getEntityIcon(entity.type)}
                    <div>
                      <CardTitle className="text-lg">{entity.name}</CardTitle>
                      <CardDescription>
                        {getEntityTypeLabel(entity.type)}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(entity.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {entity.description}
                </p>

                {entity.website && (
                  <div className="mb-4">
                    <Label className="text-xs text-gray-500">網站</Label>
                    <p className="text-sm text-blue-600 hover:underline cursor-pointer">
                      {entity.website}
                    </p>
                  </div>
                )}

                {/* 權限顯示 */}
                {entity.permissions && entity.permissions.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-xs text-gray-500 mb-2 block">權限</Label>
                    <div className="flex flex-wrap gap-1">
                      {entity.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-1">
                          {permission.permission_level === 'manager' ? (
                            <Badge variant="default" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              管理者
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <UserCheck className="w-3 h-3 mr-1" />
                              使用者
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按鈕 */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEntity(entity)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    查看
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(entity)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    編輯
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(entity.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {businessEntities.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有業務實體</h3>
            <p className="text-gray-600 mb-6">
              開始創建您的第一個業務實體，管理您的供應商、創作者或媒體通路
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              創建業務實體
            </Button>
          </div>
        )}
      </div>

      {/* 編輯對話框 */}
      {isEditing && selectedEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>編輯業務實體</CardTitle>
              <CardDescription>
                更新 {selectedEntity.name} 的資訊
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-name">名稱</Label>
                <Input
                  id="edit-name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">描述</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-website">網站</Label>
                <Input
                  id="edit-website"
                  value={editForm.website || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status">狀態</Label>
                <Select
                  value={editForm.status || 'active'}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">啟用中</SelectItem>
                    <SelectItem value="inactive">停用中</SelectItem>
                    <SelectItem value="pending">待審核</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1">
                  儲存變更
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 創建對話框 */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>創建新業務實體</CardTitle>
              <CardDescription>
                建立新的業務實體來管理您的業務
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="create-name">名稱 *</Label>
                <Input
                  id="create-name"
                  value={createForm.name || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：九族文化村、趙致緯工作室"
                />
              </div>
              
              <div>
                <Label htmlFor="create-type">類型 *</Label>
                <Select
                  value={createForm.type || ''}
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇業務實體類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">供應商</SelectItem>
                    <SelectItem value="koc">KOC/創作者</SelectItem>
                    <SelectItem value="media">媒體</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="create-description">描述 *</Label>
                <Textarea
                  id="create-description"
                  value={createForm.description || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="請描述這個業務實體的主要業務和特色"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="create-website">網站</Label>
                <Input
                  id="create-website"
                  value={createForm.website || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button 
                  onClick={handleSaveCreate} 
                  className="flex-1"
                  disabled={!createForm.name || !createForm.type || !createForm.description}
                >
                  創建
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 詳細資訊對話框 */}
      {selectedEntity && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getEntityIcon(selectedEntity.type)}
                  <div>
                    <CardTitle className="text-2xl">{selectedEntity.name}</CardTitle>
                    <CardDescription>
                      {getEntityTypeLabel(selectedEntity.type)} • {getStatusBadge(selectedEntity.status)}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEntity(null)}
                >
                  關閉
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">概覽</TabsTrigger>
                  <TabsTrigger value="permissions">權限</TabsTrigger>
                  <TabsTrigger value="profile">詳細資料</TabsTrigger>
                  <TabsTrigger value="settings">設定</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">描述</Label>
                    <p className="text-gray-900 mt-1">{selectedEntity.description}</p>
                  </div>
                  
                  {selectedEntity.website && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">網站</Label>
                      <a 
                        href={selectedEntity.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline mt-1 block"
                      >
                        {selectedEntity.website}
                      </a>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">創建時間</Label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedEntity.created_at).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">權限管理</h3>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      管理權限
                    </Button>
                  </div>
                  
                  {selectedEntity.permissions && selectedEntity.permissions.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEntity.permissions.map((permission) => (
                        <div key={permission.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {permission.permission_level === 'manager' ? (
                                <Badge variant="default">
                                  <Shield className="w-4 h-4 mr-1" />
                                  管理者
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  使用者
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(permission.granted_at).toLocaleDateString('zh-TW')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {Object.entries({
                              'can_manage_users': '管理用戶',
                              'can_manage_content': '管理內容',
                              'can_manage_finance': '管理財務',
                              'can_view_analytics': '查看分析',
                              'can_edit_profile': '編輯資料'
                            }).map(([key, label]) => (
                              <div key={key} className="flex items-center gap-1">
                                {getPermissionIcon(key)}
                                <span className="text-sm text-gray-600">{label}</span>
                                <div className={`w-2 h-2 rounded-full ${
                                  permission[key as keyof UserBusinessPermission] ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      還沒有設定權限
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="profile" className="space-y-4">
                  {selectedEntity.type === 'supplier' && selectedEntity.supplierProfile && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">供應商詳細資料</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">公司名稱</Label>
                          <p className="text-gray-900 mt-1">{selectedEntity.supplierProfile.company_name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">業務類型</Label>
                          <p className="text-gray-900 mt-1">{selectedEntity.supplierProfile.business_type}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">執照號碼</Label>
                          <p className="text-gray-900 mt-1">{selectedEntity.supplierProfile.license_number}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedEntity.type === 'koc' && selectedEntity.creatorProfile && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">創作者詳細資料</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">作品集連結</Label>
                          {selectedEntity.creatorProfile.portfolio_url ? (
                            <a 
                              href={selectedEntity.creatorProfile.portfolio_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline mt-1 block"
                            >
                              {selectedEntity.creatorProfile.portfolio_url}
                            </a>
                          ) : (
                            <p className="text-gray-500 mt-1">未設定</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">內容類型</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedEntity.creatorProfile.content_types?.map((type) => (
                              <Badge key={type} variant="secondary">{type}</Badge>
                            )) || <span className="text-gray-500">未設定</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedEntity.type === 'media' && selectedEntity.mediaProfile && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">媒體詳細資料</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">媒體類型</Label>
                          <p className="text-gray-900 mt-1">{selectedEntity.mediaProfile.media_type}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">平台名稱</Label>
                          <p className="text-gray-900 mt-1">{selectedEntity.mediaProfile.platform_name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">受眾規模</Label>
                          <p className="text-gray-900 mt-1">{selectedEntity.mediaProfile.audience_size?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <h3 className="text-lg font-medium">設定選項</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">通知設定</h4>
                        <p className="text-sm text-gray-600">管理業務實體相關的通知</p>
                      </div>
                      <Button variant="outline" size="sm">
                        設定
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">資料匯出</h4>
                        <p className="text-sm text-gray-600">匯出業務實體的資料</p>
                      </div>
                      <Button variant="outline" size="sm">
                        匯出
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-600">危險區域</h4>
                        <p className="text-sm text-gray-600">刪除業務實體（此操作無法撤銷）</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(selectedEntity.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        刪除
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
