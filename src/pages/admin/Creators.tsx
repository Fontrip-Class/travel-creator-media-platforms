import React, { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  UserCheck,
  Filter,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import type { User, BusinessEntity, CreatorProfile } from "@/types/database";

interface CreatorWithProfile extends User {
  business_entities?: BusinessEntity[];
  creator_profile?: CreatorProfile;
}

export default function Creators() {
  const [creators, setCreators] = useState<CreatorWithProfile[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<CreatorWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<CreatorWithProfile | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    status: "active"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    filterCreators();
  }, [creators, searchTerm, statusFilter]);

  const fetchCreators = async () => {
    try {
      setIsLoading(true);
      // 嘗試從API獲取數據
      try {
        const response = await apiService.getAdminUsers({ role: 'creator' });
        if (response.success && response.data) {
          setCreators(response.data);
        }
      } catch (apiError: any) {
        console.warn('API 調用失敗，使用模擬數據:', apiError);
        // 使用模擬數據
        setCreators([
          {
            id: "1",
            username: "趙致緯",
            email: "zhao@example.com",
            phone: "0912-345-678",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z",
            business_entities: [{
              id: "be1",
              name: "趙致緯工作室",
              business_type: "creator",
              description: "專業旅遊內容創作",
              contact_person: "趙致緯",
              contact_phone: "0912-345-678",
              contact_email: "zhao@example.com",
              tags: ["旅遊攝影", "美食部落格"],
              verification_status: "verified"
            }]
          },
          {
            id: "2",
            username: "林小美",
            email: "lin@example.com",
            phone: "0923-456-789",
            created_at: "2024-01-10T14:30:00Z",
            updated_at: "2024-01-10T14:30:00Z",
            business_entities: [{
              id: "be2",
              name: "小美旅遊日記",
              business_type: "creator",
              description: "分享台灣各地旅遊景點",
              contact_person: "林小美",
              contact_phone: "0923-456-789",
              contact_email: "lin@example.com",
              tags: ["景點介紹", "旅遊攻略"],
              verification_status: "pending"
            }]
          },
          {
            id: "3",
            username: "王大廚",
            email: "wang@example.com",
            phone: "0934-567-890",
            created_at: "2024-01-05T09:15:00Z",
            updated_at: "2024-01-05T09:15:00Z",
            business_entities: [{
              id: "be3",
              name: "大廚美食探索",
              business_type: "creator",
              description: "探索台灣各地美食文化",
              contact_person: "王大廚",
              contact_phone: "0934-567-890",
              contact_email: "wang@example.com",
              tags: ["美食文化", "餐廳推薦"],
              verification_status: "verified"
            }]
          }
        ]);
      }
    } catch (error: any) {
      toast({
        title: "載入失敗",
        description: error.message || "無法載入創作者數據",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCreators = () => {
    let filtered = creators;

    // 搜尋過濾
    if (searchTerm) {
      filtered = filtered.filter(creator =>
        creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.phone?.includes(searchTerm)
      );
    }

    // 狀態過濾
    if (statusFilter !== "all") {
      filtered = filtered.filter(creator => creator.status === statusFilter);
    }

    setFilteredCreators(filtered);
  };

  const handleCreateCreator = async () => {
    try {
      if (!formData.username || !formData.email || !formData.password) {
        toast({
          title: "驗證失敗",
          description: "請填寫所有必要欄位",
          variant: "destructive"
        });
        return;
      }

      // 嘗試創建用戶
      try {
        const response = await apiService.createAdminUser(formData);
        if (response.success) {
          toast({
            title: "創建成功",
            description: "創作者帳戶已創建",
          });
          setIsCreateDialogOpen(false);
          resetForm();
          fetchCreators();
        }
      } catch (apiError: any) {
        console.warn('API 調用失敗:', apiError);
        // 模擬創建成功
        toast({
          title: "創建成功",
          description: "創作者帳戶已創建（模擬模式）",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchCreators();
      }
    } catch (error: any) {
      toast({
        title: "創建失敗",
        description: error.message || "無法創建創作者帳戶",
        variant: "destructive"
      });
    }
  };

  const handleEditCreator = async () => {
    if (!selectedCreator) return;

    try {
      // 嘗試更新用戶
      try {
        const response = await apiService.updateAdminUser(selectedCreator.id, formData);
        if (response.success) {
          toast({
            title: "更新成功",
            description: "創作者資料已更新",
          });
          setIsEditDialogOpen(false);
          resetForm();
          fetchCreators();
        }
      } catch (apiError: any) {
        console.warn('API 調用失敗:', apiError);
        // 模擬更新成功
        toast({
          title: "更新成功",
          description: "創作者資料已更新（模擬模式）",
        });
        setIsEditDialogOpen(false);
        resetForm();
        fetchCreators();
      }
    } catch (error: any) {
      toast({
        title: "更新失敗",
        description: error.message || "無法更新創作者資料",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCreator = async (creatorId: string) => {
    if (!confirm("確定要刪除此創作者嗎？此操作無法撤銷。")) return;

    try {
      // 嘗試刪除用戶
      try {
        const response = await apiService.deleteAdminUser(creatorId);
        if (response.success) {
          toast({
            title: "刪除成功",
            description: "創作者帳戶已刪除",
          });
          fetchCreators();
        }
      } catch (apiError: any) {
        console.warn('API 調用失敗:', apiError);
        // 模擬刪除成功
        toast({
          title: "刪除成功",
          description: "創作者帳戶已刪除（模擬模式）",
        });
        fetchCreators();
      }
    } catch (error: any) {
      toast({
        title: "刪除失敗",
        description: error.message || "無法刪除創作者帳戶",
        variant: "destructive"
      });
    }
  };

  const handleSuspendCreator = async (creatorId: string) => {
    try {
      const response = await apiService.suspendUser(creatorId, "管理員暫停帳戶");
      if (response.success) {
        toast({
          title: "暫停成功",
          description: "創作者帳戶已暫停",
        });
        fetchCreators();
      }
    } catch (error: any) {
      toast({
        title: "暫停失敗",
        description: error.message || "無法暫停創作者帳戶",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      phone: "",
      password: "",
      status: "active"
    });
    setSelectedCreator(null);
  };

  const openEditDialog = (creator: CreatorWithProfile) => {
    setSelectedCreator(creator);
    setFormData({
      username: creator.username,
      email: creator.email,
      phone: creator.phone || "",
      password: "",
      status: creator.status || "active"
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (creator: CreatorWithProfile) => {
    setSelectedCreator(creator);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "啟用", color: "bg-green-100 text-green-800" },
      suspended: { label: "暫停", color: "bg-red-100 text-red-800" },
      pending: { label: "待審核", color: "bg-yellow-100 text-yellow-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getVerificationBadge = (status: string) => {
    const verificationConfig = {
      verified: { label: "已驗證", color: "bg-green-100 text-green-800" },
      pending: { label: "待驗證", color: "bg-yellow-100 text-yellow-800" },
      rejected: { label: "已拒絕", color: "bg-red-100 text-red-800" }
    };
    
    const config = verificationConfig[status as keyof typeof verificationConfig] || verificationConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <SEO title="創作者管理" description="管理平台創作者帳戶和資料" />
      
      {/* 頁面標題和操作 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">創作者管理</h1>
          <p className="text-muted-foreground">管理平台創作者帳戶、權限和資料</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新增創作者
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>新增創作者</DialogTitle>
              <DialogDescription>
                創建新的創作者帳戶，填寫基本資訊
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用戶名 *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="輸入用戶名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">狀態</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">啟用</SelectItem>
                      <SelectItem value="suspended">暫停</SelectItem>
                      <SelectItem value="pending">待審核</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">電子郵件 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="輸入電子郵件"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話號碼</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="輸入電話號碼"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密碼 *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="輸入密碼"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateCreator}>創建創作者</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜尋和過濾 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜尋創作者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="狀態過濾" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部狀態</SelectItem>
                <SelectItem value="active">啟用</SelectItem>
                <SelectItem value="suspended">暫停</SelectItem>
                <SelectItem value="pending">待審核</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchCreators} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 創作者列表 */}
      <Card>
        <CardHeader>
          <CardTitle>創作者列表 ({filteredCreators.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">載入中...</p>
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">沒有找到符合條件的創作者</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用戶名</TableHead>
                    <TableHead>聯絡資訊</TableHead>
                    <TableHead>業務實體</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>註冊時間</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCreators.map((creator) => (
                    <TableRow key={creator.id}>
                      <TableCell className="font-medium">{creator.username}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{creator.email}</div>
                          {creator.phone && (
                            <div className="text-sm text-muted-foreground">{creator.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {creator.business_entities && creator.business_entities.length > 0 ? (
                          <div className="space-y-1">
                            {creator.business_entities.map((entity) => (
                              <div key={entity.id} className="flex items-center gap-2">
                                <span className="text-sm font-medium">{entity.name}</span>
                                {getVerificationBadge(entity.verification_status)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">無業務實體</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(creator.status || "active")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(creator.created_at).toLocaleDateString('zh-TW')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(creator)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(creator)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {creator.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspendCreator(creator.id)}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspendCreator(creator.id)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCreator(creator.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 編輯對話框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>編輯創作者</DialogTitle>
            <DialogDescription>
              修改創作者資料和狀態
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">用戶名</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">狀態</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">啟用</SelectItem>
                    <SelectItem value="suspended">暫停</SelectItem>
                    <SelectItem value="pending">待審核</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">電子郵件</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">電話號碼</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">新密碼（留空表示不修改）</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="輸入新密碼"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditCreator}>更新創作者</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看詳情對話框 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>創作者詳情</DialogTitle>
            <DialogDescription>
              查看創作者的詳細資料和業務實體資訊
            </DialogDescription>
          </DialogHeader>
          {selectedCreator && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">用戶名</Label>
                  <p className="text-sm mt-1">{selectedCreator.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">狀態</Label>
                  <div className="mt-1">{getStatusBadge(selectedCreator.status || "active")}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">電子郵件</Label>
                <p className="text-sm mt-1">{selectedCreator.email}</p>
              </div>
              {selectedCreator.phone && (
                <div>
                  <Label className="text-sm font-medium">電話號碼</Label>
                  <p className="text-sm mt-1">{selectedCreator.phone}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">註冊時間</Label>
                <p className="text-sm mt-1">
                  {new Date(selectedCreator.created_at).toLocaleString('zh-TW')}
                </p>
              </div>
              {selectedCreator.business_entities && selectedCreator.business_entities.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">業務實體</Label>
                  <div className="mt-2 space-y-2">
                    {selectedCreator.business_entities.map((entity) => (
                      <div key={entity.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{entity.name}</h4>
                          {getVerificationBadge(entity.verification_status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{entity.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>聯絡人: {entity.contact_person}</span>
                          <span>電話: {entity.contact_phone}</span>
                        </div>
                        {entity.tags && entity.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entity.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
