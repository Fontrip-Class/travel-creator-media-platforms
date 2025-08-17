import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const statuses = [
  { value: "draft", label: "草稿" },
  { value: "open", label: "公開招募" },
  { value: "review", label: "審核中" },
  { value: "doing", label: "進行中" },
  { value: "done", label: "已完成" },
  { value: "cancelled", label: "已取消" },
  { value: "paused", label: "暫停招募" },
  { value: "re-recruiting", label: "重新招募" },
  { value: "expired", label: "已過期" },
  { value: "rejected", label: "申請被拒" },
];

export default function TasksAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    status: "",
    description: "",
    reward: "",
    deadline: "",
    contentTypes: ""
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleSearch = () => {
    // 實現搜索功能
    console.log("搜索:", { searchTerm, selectedStatus });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.status || !formData.description) {
      toast({
        title: "錯誤",
        description: "請填寫所有必填欄位",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.createTask({
        title: formData.title,
        description: formData.description,
        budget_min: formData.reward ? parseFloat(formData.reward) : undefined,
        budget_max: formData.reward ? parseFloat(formData.reward) : undefined,
        deadline: formData.deadline || undefined,
        content_type: formData.contentTypes ? formData.contentTypes.split(',')[0].trim() : undefined
      });

      if (response.success) {
        toast({
          title: "成功",
          description: "任務創建成功！",
        });
        
        // 重置表單
        setFormData({
          title: "",
          status: "",
          description: "",
          reward: "",
          deadline: "",
          contentTypes: ""
        });
      }
    } catch (error: any) {
      // 保留用戶填寫的數據，只顯示錯誤訊息
      toast({
        title: "創建失敗",
        description: error.message || "任務創建過程中發生錯誤",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <SEO title="委託任務" description="由觀光署或供應商提出的行銷/曝光任務" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">搜尋與清單</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            <Input 
              placeholder="搜尋標題/需求" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="狀態" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>搜尋</Button>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>標題</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>需求素材</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>台東季節活動宣傳</TableCell>
                  <TableCell>公開招募</TableCell>
                  <TableCell>圖文、影音</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">新增/編輯任務</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">標題</Label>
              <Input 
                id="title" 
                name="title"
                placeholder="行銷任務標題" 
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>狀態</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">說明</Label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="簡述目標與需求" 
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reward">報酬（可選）</Label>
              <Input 
                id="reward" 
                name="reward"
                type="number" 
                placeholder="0" 
                value={formData.reward}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">截止日期</Label>
              <Input 
                id="deadline" 
                name="deadline"
                type="date" 
                value={formData.deadline}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contentTypes">需求素材類型（逗號分隔）</Label>
              <Input 
                id="contentTypes" 
                name="contentTypes"
                placeholder="圖文, 影音" 
                value={formData.contentTypes}
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "創建中..." : "創建任務"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
