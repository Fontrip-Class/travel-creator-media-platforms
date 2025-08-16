import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  return (
    <div className="grid gap-6">
      <SEO title="委託任務" description="由觀光署或供應商提出的行銷/曝光任務" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">搜尋與清單</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            <Input placeholder="搜尋標題/需求" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="狀態" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>搜尋</Button>
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
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="t-title">標題</Label>
            <Input id="t-title" placeholder="行銷任務標題" />
          </div>
          <div className="space-y-2">
            <Label>狀態</Label>
            <Select>
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
            <Label htmlFor="t-desc">說明</Label>
            <Input id="t-desc" placeholder="簡述目標與需求" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-reward">報酬（可選）</Label>
            <Input id="t-reward" type="number" placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-deadline">截止日期</Label>
            <Input id="t-deadline" type="date" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="t-types">需求素材類型（逗號分隔）</Label>
            <Input id="t-types" placeholder="圖文, 影音" />
          </div>
          <div className="md:col-span-2">
            <Button>儲存/發布</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
