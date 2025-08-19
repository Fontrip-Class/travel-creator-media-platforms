import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { BusinessEntity } from "@/types/database";
import apiService from "@/lib/api";

const BusinessEntitiesAdmin: React.FC = () => {
  const [entities, setEntities] = useState<BusinessEntity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<BusinessEntity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>("");
  const [verificationFilter, setVerificationFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 表單資料
  const [formData, setFormData] = useState<Partial<BusinessEntity>>({
    name: "",
    business_type: "supplier",
    description: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
    website: "",
    address: "",
    business_hours: "",
    tags: [],
    verification_status: "pending",
  });

  // 當前操作的實體
  const [currentEntity, setCurrentEntity] = useState<BusinessEntity | null>(null);
  const [verificationReason, setVerificationReason] = useState("");

  // 載入資料
  useEffect(() => {
    loadEntities();
  }, []);

  // 篩選資料
  useEffect(() => {
    let filtered = entities;

    if (searchTerm) {
      filtered = filtered.filter(
        (entity) =>
          entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entity.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entity.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (businessTypeFilter) {
      filtered = filtered.filter(
        (entity) => entity.business_type === businessTypeFilter
      );
    }

    if (verificationFilter) {
      filtered = filtered.filter(
        (entity) => entity.verification_status === verificationFilter
      );
    }

    setFilteredEntities(filtered);
  }, [entities, searchTerm, businessTypeFilter, verificationFilter]);

  const loadEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAdminBusinessEntities();
      if (response.success) {
        setEntities(response.data || []);
      } else {
        setError(response.message || "載入資料失敗");
      }
    } catch (err) {
      setError("載入資料時發生錯誤");
      console.error("載入業務實體失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntity = async () => {
    try {
      const response = await apiService.createBusinessEntity(formData);
      if (response.success) {
        setCreateDialogOpen(false);
        resetForm();
        loadEntities();
      } else {
        setError(response.message || "創建失敗");
      }
    } catch (err) {
      setError("創建業務實體時發生錯誤");
      console.error("創建失敗:", err);
    }
  };

  const handleEditEntity = async () => {
    if (!currentEntity) return;

    try {
      const response = await apiService.updateAdminBusinessEntity(
        currentEntity.id,
        formData
      );
      if (response.success) {
        setEditDialogOpen(false);
        resetForm();
        loadEntities();
      } else {
        setError(response.message || "更新失敗");
      }
    } catch (err) {
      setError("更新業務實體時發生錯誤");
      console.error("更新失敗:", err);
    }
  };

  const handleDeleteEntity = async () => {
    if (!currentEntity) return;

    try {
      const response = await apiService.deleteAdminBusinessEntity(
        currentEntity.id
      );
      if (response.success) {
        setDeleteDialogOpen(false);
        loadEntities();
      } else {
        setError(response.message || "刪除失敗");
      }
    } catch (err) {
      setError("刪除業務實體時發生錯誤");
      console.error("刪除失敗:", err);
    }
  };

  const handleVerifyEntity = async (status: "verified" | "rejected") => {
    if (!currentEntity) return;

    try {
      const response = await apiService.verifyBusinessEntity(
        currentEntity.id,
        status,
        verificationReason
      );
      if (response.success) {
        setVerifyDialogOpen(false);
        setVerificationReason("");
        loadEntities();
      } else {
        setError(response.message || "驗證狀態更新失敗");
      }
    } catch (err) {
      setError("更新驗證狀態時發生錯誤");
      console.error("驗證失敗:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      business_type: "supplier",
      description: "",
      contact_person: "",
      contact_phone: "",
      contact_email: "",
      website: "",
      address: "",
      business_hours: "",
      tags: [],
      verification_status: "pending",
    });
    setCurrentEntity(null);
    setVerificationReason("");
  };

  const openEditDialog = (entity: BusinessEntity) => {
    setCurrentEntity(entity);
    setFormData({
      name: entity.name,
      business_type: entity.business_type,
      description: entity.description,
      contact_person: entity.contact_person,
      contact_phone: entity.contact_phone,
      contact_email: entity.contact_email,
      website: entity.website,
      address: entity.address,
      business_hours: entity.business_hours,
      tags: entity.tags || [],
      verification_status: entity.verification_status,
    });
    setEditDialogOpen(true);
  };

  const openViewDialog = (entity: BusinessEntity) => {
    setCurrentEntity(entity);
    setViewDialogOpen(true);
  };

  const openVerifyDialog = (entity: BusinessEntity) => {
    setCurrentEntity(entity);
    setVerifyDialogOpen(true);
  };

  const openDeleteDialog = (entity: BusinessEntity) => {
    setCurrentEntity(entity);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "待驗證", variant: "secondary" as const },
      verified: { label: "已驗證", variant: "default" as const },
      rejected: { label: "已拒絕", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBusinessTypeLabel = (type: string) => {
    const typeLabels = {
      supplier: "供應商",
      creator: "創作者",
      media: "媒體",
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">載入中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">業務實體管理</h1>
          <p className="text-muted-foreground">
            管理平台上的供應商、創作者和媒體實體
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新增業務實體
        </Button>
      </div>

      {/* 搜尋和篩選 */}
      <Card>
        <CardHeader>
          <CardTitle>搜尋與篩選</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">搜尋</Label>
              <Input
                id="search"
                placeholder="搜尋名稱、聯絡人、郵箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">業務類型</Label>
              <Select
                value={businessTypeFilter}
                onValueChange={setBusinessTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇業務類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部類型</SelectItem>
                  <SelectItem value="supplier">供應商</SelectItem>
                  <SelectItem value="creator">創作者</SelectItem>
                  <SelectItem value="media">媒體</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification">驗證狀態</Label>
              <Select
                value={verificationFilter}
                onValueChange={setVerificationFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇驗證狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部狀態</SelectItem>
                  <SelectItem value="pending">待驗證</SelectItem>
                  <SelectItem value="verified">已驗證</SelectItem>
                  <SelectItem value="rejected">已拒絕</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={loadEntities}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重新載入
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 錯誤提示 */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 資料表格 */}
      <Card>
        <CardHeader>
          <CardTitle>業務實體列表</CardTitle>
          <CardDescription>
            共 {filteredEntities.length} 個業務實體
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>實體名稱</TableHead>
                <TableHead>業務類型</TableHead>
                <TableHead>聯絡人</TableHead>
                <TableHead>聯絡郵箱</TableHead>
                <TableHead>驗證狀態</TableHead>
                <TableHead>創建時間</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        沒有找到業務實體
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntities.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell className="font-medium">{entity.name}</TableCell>
                    <TableCell>
                      {getBusinessTypeLabel(entity.business_type)}
                    </TableCell>
                    <TableCell>{entity.contact_person}</TableCell>
                    <TableCell>{entity.contact_email}</TableCell>
                    <TableCell>{getStatusBadge(entity.verification_status)}</TableCell>
                    <TableCell>
                      {new Date(entity.created_at).toLocaleDateString("zh-TW")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(entity)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(entity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openVerifyDialog(entity)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(entity)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 創建對話框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增業務實體</DialogTitle>
            <DialogDescription>
              填寫業務實體的基本資訊
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">實體名稱 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="輸入實體名稱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">業務類型 *</Label>
              <Select
                value={formData.business_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, business_type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier">供應商</SelectItem>
                  <SelectItem value="creator">創作者</SelectItem>
                  <SelectItem value="media">媒體</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="輸入業務實體描述"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">聯絡人 *</Label>
              <Input
                id="contactPerson"
                value={formData.contact_person}
                onChange={(e) =>
                  setFormData({ ...formData, contact_person: e.target.value })
                }
                placeholder="輸入聯絡人姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">聯絡電話</Label>
              <Input
                id="contactPhone"
                value={formData.contact_phone}
                onChange={(e) =>
                  setFormData({ ...formData, contact_phone: e.target.value })
                }
                placeholder="輸入聯絡電話"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">聯絡郵箱 *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contact_email}
                onChange={(e) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
                placeholder="輸入聯絡郵箱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">官方網站</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="輸入網站URL"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">地址</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="輸入營業地址"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="businessHours">營業時間</Label>
              <Input
                id="businessHours"
                value={formData.business_hours}
                onChange={(e) =>
                  setFormData({ ...formData, business_hours: e.target.value })
                }
                placeholder="輸入營業時間"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateEntity}>創建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編輯對話框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>編輯業務實體</DialogTitle>
            <DialogDescription>
              修改業務實體的資訊
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editName">實體名稱 *</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="輸入實體名稱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBusinessType">業務類型 *</Label>
              <Select
                value={formData.business_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, business_type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier">供應商</SelectItem>
                  <SelectItem value="creator">創作者</SelectItem>
                  <SelectItem value="media">媒體</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="editDescription">描述 *</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="輸入業務實體描述"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editContactPerson">聯絡人 *</Label>
              <Input
                id="editContactPerson"
                value={formData.contact_person}
                onChange={(e) =>
                  setFormData({ ...formData, contact_person: e.target.value })
                }
                placeholder="輸入聯絡人姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editContactPhone">聯絡電話</Label>
              <Input
                id="editContactPhone"
                value={formData.contact_phone}
                onChange={(e) =>
                  setFormData({ ...formData, contact_phone: e.target.value })
                }
                placeholder="輸入聯絡電話"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editContactEmail">聯絡郵箱 *</Label>
              <Input
                id="editContactEmail"
                type="email"
                value={formData.contact_email}
                onChange={(e) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
                placeholder="輸入聯絡郵箱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editWebsite">官方網站</Label>
              <Input
                id="editWebsite"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="輸入網站URL"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="editAddress">地址</Label>
              <Input
                id="editAddress"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="輸入營業地址"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="editBusinessHours">營業時間</Label>
              <Input
                id="editBusinessHours"
                value={formData.business_hours}
                onChange={(e) =>
                  setFormData({ ...formData, business_hours: e.target.value })
                }
                placeholder="輸入營業時間"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditEntity}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看詳情對話框 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>業務實體詳情</DialogTitle>
            <DialogDescription>
              查看業務實體的完整資訊
            </DialogDescription>
          </DialogHeader>
          {currentEntity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">實體名稱</Label>
                  <p className="text-sm text-muted-foreground">
                    {currentEntity.name}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">業務類型</Label>
                  <p className="text-sm text-muted-foreground">
                    {getBusinessTypeLabel(currentEntity.business_type)}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">聯絡人</Label>
                  <p className="text-sm text-muted-foreground">
                    {currentEntity.contact_person}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">聯絡電話</Label>
                  <p className="text-sm text-muted-foreground">
                    {currentEntity.contact_phone || "未提供"}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">聯絡郵箱</Label>
                  <p className="text-sm text-muted-foreground">
                    {currentEntity.contact_email}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">官方網站</Label>
                  <p className="text-sm text-muted-foreground">
                    {currentEntity.website || "未提供"}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="font-medium">描述</Label>
                  <p className="text-sm text-muted-foreground">
                    {currentEntity.description}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="font-medium">地址</Label>
                  <p className="text-sm text-muted-foreground">
                    {currentEntity.address || "未提供"}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="font-medium">營業時間</Label>
                  <p className="text-sm text-muted-foreground">
                    {currentEntity.business_hours || "未提供"}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="font-medium">驗證狀態</Label>
                  <div className="mt-1">
                    {getStatusBadge(currentEntity.verification_status)}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">創建時間</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentEntity.created_at).toLocaleString("zh-TW")}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">更新時間</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentEntity.updated_at).toLocaleString("zh-TW")}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 驗證狀態對話框 */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更新驗證狀態</DialogTitle>
            <DialogDescription>
              選擇新的驗證狀態並提供原因
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>驗證狀態</Label>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleVerifyEntity("verified")}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  通過驗證
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerifyEntity("rejected")}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  拒絕驗證
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationReason">原因說明</Label>
              <Textarea
                id="verificationReason"
                value={verificationReason}
                onChange={(e) => setVerificationReason(e.target.value)}
                placeholder="輸入驗證通過或拒絕的原因"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              確定要刪除業務實體 "{currentEntity?.name}" 嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteEntity}>
              確認刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessEntitiesAdmin;
