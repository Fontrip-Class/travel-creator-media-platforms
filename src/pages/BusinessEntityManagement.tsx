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
import apiService from "@/lib/api";
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
              
              // 載入權限資料
              const permissionsResponse = await apiService.getBusinessEntityPermissions(entity.id);
              if (permissionsResponse.success) {
                entity.permissions = permissionsResponse.data;
              }

              // 載入相關檔案
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
    } catch (error) {
      console.error('載入業務實體失敗:', error);
      setError('載入業務實體時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setCreateForm({
      name: '',
      type: 'supplier',
      description: '',
      contact_email: '',
      contact_phone: '',
      website: '',
      address: '',
      status: 'active'
    });
  };

  const handleEdit = (entity: BusinessEntityWithPermissions) => {
    setSelectedEntity(entity);
    setEditForm({
      name: entity.name,
      type: entity.type,
      description: entity.description,
      contact_email: entity.contact_email,
      contact_phone: entity.contact_phone,
      website: entity.website,
      address: entity.address,
      status: entity.status
    });
    setIsEditing(true);
  };

  const handleDelete = async (entityId: string) => {
    if (window.confirm('確定要刪除這個業務實體嗎？此操作無法撤銷。')) {
      try {
        const response = await apiService.deleteBusinessEntity(entityId);
        if (response.success) {
          toast({
            title: "刪除成功",
            description: "業務實體已成功刪除",
          });
          loadBusinessEntities();
        } else {
          setError(response.message || '刪除失敗');
        }
      } catch (error) {
        console.error('刪除業務實體失敗:', error);
        setError('刪除業務實體時發生錯誤');
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedEntity) return;

    try {
      const response = await apiService.updateBusinessEntity(selectedEntity.id, editForm);
      if (response.success) {
        toast({
          title: "更新成功",
          description: "業務實體已成功更新",
        });
        setIsEditing(false);
        setSelectedEntity(null);
        loadBusinessEntities();
      } else {
        setError(response.message || '更新失敗');
      }
    } catch (error) {
      console.error('更新業務實體失敗:', error);
      setError('更新業務實體時發生錯誤');
    }
  };

  const handleSaveCreate = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('用戶未登入');
        return;
      }

      const response = await apiService.createBusinessEntity(createForm);
      if (response.success) {
        toast({
          title: "創建成功",
          description: "業務實體已成功創建",
        });
        setIsCreating(false);
        setCreateForm({});
        loadBusinessEntities();
      } else {
        setError(response.message || '創建失敗');
      }
    } catch (error) {
      console.error('創建業務實體失敗:', error);
      setError('創建業務實體時發生錯誤');
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
        return <Badge variant="default" className="bg-green-100 text-green-800">啟用</Badge>;
      case 'inactive':
        return <Badge variant="secondary">停用</Badge>;
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
        description="管理您的業務實體，包括供應商、創作者、媒體等"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">業務實體管理</h1>
            <p className="text-muted-foreground mt-2">
              管理您的業務實體，包括供應商、創作者、媒體等
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            創建業務實體
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
                  {entity.description || '暫無描述'}
                </p>
                
                <div className="space-y-2 mb-4">
                  {entity.contact_email && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">聯絡郵箱:</span> {entity.contact_email}
                    </div>
                  )}
                  {entity.contact_phone && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">聯絡電話:</span> {entity.contact_phone}
                    </div>
                  )}
                  {entity.website && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">網站:</span> 
                      <a href={entity.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline ml-1">
                        {entity.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(entity)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    編輯
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedEntity(entity)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    查看
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(entity.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    刪除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 創建業務實體對話框 */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">創建業務實體</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsCreating(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">名稱</Label>
                    <Input
                      id="name"
                      value={createForm.name || ''}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      placeholder="業務實體名稱"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type" className="text-sm font-medium">類型</Label>
                    <Select 
                      value={createForm.type || 'supplier'} 
                      onValueChange={(value) => setCreateForm({...createForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier">供應商</SelectItem>
                        <SelectItem value="koc">KOC/創作者</SelectItem>
                        <SelectItem value="media">媒體</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">描述</Label>
                  <Textarea
                    id="description"
                    value={createForm.description || ''}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    placeholder="業務實體描述"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email" className="text-sm font-medium">聯絡郵箱</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={createForm.contact_email || ''}
                      onChange={(e) => setCreateForm({...createForm, contact_email: e.target.value})}
                      placeholder="聯絡郵箱"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone" className="text-sm font-medium">聯絡電話</Label>
                    <Input
                      id="contact_phone"
                      value={createForm.contact_phone || ''}
                      onChange={(e) => setCreateForm({...createForm, contact_phone: e.target.value})}
                      placeholder="聯絡電話"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website" className="text-sm font-medium">網站</Label>
                    <Input
                      id="website"
                      value={createForm.website || ''}
                      onChange={(e) => setCreateForm({...createForm, website: e.target.value})}
                      placeholder="網站網址"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">狀態</Label>
                    <Select 
                      value={createForm.status || 'active'} 
                      onValueChange={(value) => setCreateForm({...createForm, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">啟用</SelectItem>
                        <SelectItem value="inactive">停用</SelectItem>
                        <SelectItem value="pending">待審核</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium">地址</Label>
                  <Textarea
                    id="address"
                    value={createForm.address || ''}
                    onChange={(e) => setCreateForm({...createForm, address: e.target.value})}
                    placeholder="業務實體地址"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button onClick={handleSaveCreate} className="flex-1">
                  創建業務實體
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 編輯業務實體對話框 */}
        {isEditing && selectedEntity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">編輯業務實體</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name" className="text-sm font-medium">名稱</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="業務實體名稱"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-type" className="text-sm font-medium">類型</Label>
                    <Select 
                      value={editForm.type || 'supplier'} 
                      onValueChange={(value) => setEditForm({...editForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier">供應商</SelectItem>
                        <SelectItem value="koc">KOC/創作者</SelectItem>
                        <SelectItem value="media">媒體</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description" className="text-sm font-medium">描述</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="業務實體描述"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-contact_email" className="text-sm font-medium">聯絡郵箱</Label>
                    <Input
                      id="edit-contact_email"
                      type="email"
                      value={editForm.contact_email || ''}
                      onChange={(e) => setEditForm({...editForm, contact_email: e.target.value})}
                      placeholder="聯絡郵箱"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-contact_phone" className="text-sm font-medium">聯絡電話</Label>
                    <Input
                      id="edit-contact_phone"
                      value={editForm.contact_phone || ''}
                      onChange={(e) => setEditForm({...editForm, contact_phone: e.target.value})}
                      placeholder="聯絡電話"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-website" className="text-sm font-medium">網站</Label>
                    <Input
                      id="edit-website"
                      value={editForm.website || ''}
                      onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                      placeholder="網站網址"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status" className="text-sm font-medium">狀態</Label>
                    <Select 
                      value={editForm.status || 'active'} 
                      onValueChange={(value) => setEditForm({...editForm, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">啟用</SelectItem>
                        <SelectItem value="inactive">停用</SelectItem>
                        <SelectItem value="pending">待審核</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-address" className="text-sm font-medium">地址</Label>
                  <Textarea
                    id="edit-address"
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    placeholder="業務實體地址"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button onClick={handleSaveEdit} className="flex-1">
                  保存更改
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 業務實體詳情對話框 */}
        {selectedEntity && !isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedEntity.name}</h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(selectedEntity)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    編輯
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedEntity(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">基本資訊</TabsTrigger>
                  <TabsTrigger value="permissions">權限管理</TabsTrigger>
                  <TabsTrigger value="profiles">詳細檔案</TabsTrigger>
                  <TabsTrigger value="settings">設定</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">名稱</Label>
                      <p className="text-sm text-gray-900">{selectedEntity.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">類型</Label>
                      <p className="text-sm text-gray-900">{getEntityTypeLabel(selectedEntity.type)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">狀態</Label>
                      <div>{getStatusBadge(selectedEntity.status)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">創建時間</Label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedEntity.created_at).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">描述</Label>
                    <p className="text-sm text-gray-900">{selectedEntity.description || '暫無描述'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">聯絡郵箱</Label>
                      <p className="text-sm text-gray-900">{selectedEntity.contact_email || '暫無'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">聯絡電話</Label>
                      <p className="text-sm text-gray-900">{selectedEntity.contact_phone || '暫無'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">網站</Label>
                      <p className="text-sm text-gray-900">
                        {selectedEntity.website ? (
                          <a href={selectedEntity.website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">
                            {selectedEntity.website}
                          </a>
                        ) : '暫無'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">地址</Label>
                      <p className="text-sm text-gray-900">{selectedEntity.address || '暫無'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">權限管理</h3>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      新增權限
                    </Button>
                  </div>

                  {selectedEntity.permissions && selectedEntity.permissions.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEntity.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">用戶 ID: {permission.user_id}</p>
                              <p className="text-sm text-gray-600">權限等級: {permission.permission_level}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">暫無權限設定</p>
                  )}
                </TabsContent>

                <TabsContent value="profiles" className="space-y-4">
                  {selectedEntity.type === 'supplier' && selectedEntity.supplierProfile && (
                    <div>
                      <h3 className="text-lg font-medium">供應商詳細資料</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">公司名稱</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.supplierProfile.company_name || '暫無'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">產業類型</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.supplierProfile.industry_type || '暫無'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">營業執照</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.supplierProfile.business_license || '暫無'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">年營業額</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.supplierProfile.annual_revenue || '暫無'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEntity.type === 'koc' && selectedEntity.creatorProfile && (
                    <div>
                      <h3 className="text-lg font-medium">創作者詳細資料</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">個人品牌</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.creatorProfile.personal_brand || '暫無'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">專長領域</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.creatorProfile.expertise_areas || '暫無'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">粉絲數量</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.creatorProfile.follower_count || '暫無'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">作品集網址</Label>
                          <p className="text-sm text-gray-900">
                            {selectedEntity.creatorProfile.portfolio_url ? (
                              <a href={selectedEntity.creatorProfile.portfolio_url} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-600 hover:underline">
                                {selectedEntity.creatorProfile.portfolio_url}
                              </a>
                            ) : '暫無'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEntity.type === 'media' && selectedEntity.mediaProfile && (
                    <div>
                      <h3 className="text-lg font-medium">媒體詳細資料</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">媒體類型</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.mediaProfile.media_type || '暫無'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">覆蓋範圍</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.mediaProfile.coverage_area || '暫無'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">受眾群體</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.mediaProfile.target_audience || '暫無'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">合作案例</Label>
                          <p className="text-sm text-gray-900">{selectedEntity.mediaProfile.collaboration_cases || '暫無'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!selectedEntity.supplierProfile && !selectedEntity.creatorProfile && !selectedEntity.mediaProfile && (
                    <p className="text-gray-500 text-center py-8">暫無詳細檔案</p>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">進階設定</h3>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      設定
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">自動備份</p>
                        <p className="text-sm text-gray-600">定期備份業務實體資料</p>
                      </div>
                      <Button variant="outline" size="sm">啟用</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">通知設定</p>
                        <p className="text-sm text-gray-600">接收重要事件通知</p>
                      </div>
                      <Button variant="outline" size="sm">設定</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">資料匯出</p>
                        <p className="text-sm text-gray-600">匯出業務實體資料</p>
                      </div>
                      <Button variant="outline" size="sm">匯出</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

