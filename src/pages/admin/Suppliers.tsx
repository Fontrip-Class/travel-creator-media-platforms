import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SuppliersAdmin() {
  return (
    <div className="grid gap-6">
      <SEO title="供應商管理" description="新增、編輯旅遊服務供應商資料與上架" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">搜尋與清單</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="搜尋名稱/地區" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="類別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="旅宿">旅宿</SelectItem>
                <SelectItem value="餐飲">餐飲</SelectItem>
                <SelectItem value="景點">景點</SelectItem>
                <SelectItem value="活動">活動</SelectItem>
                <SelectItem value="交通">交通</SelectItem>
                <SelectItem value="其他">其他</SelectItem>
              </SelectContent>
            </Select>
            <Button>搜尋</Button>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名稱</TableHead>
                  <TableHead>類別</TableHead>
                  <TableHead>地區</TableHead>
                  <TableHead>聯絡人</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>台北旅宿示例</TableCell>
                  <TableCell>旅宿</TableCell>
                  <TableCell>台北市</TableCell>
                  <TableCell>王小明</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">新增/編輯供應商</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">名稱</Label>
            <Input id="name" placeholder="供應商名稱" />
          </div>
          <div className="space-y-2">
            <Label>類別</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="選擇類別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="旅宿">旅宿</SelectItem>
                <SelectItem value="餐飲">餐飲</SelectItem>
                <SelectItem value="景點">景點</SelectItem>
                <SelectItem value="活動">活動</SelectItem>
                <SelectItem value="交通">交通</SelectItem>
                <SelectItem value="其他">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">地區</Label>
            <Input id="region" placeholder="縣市/區" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="desc">簡介</Label>
            <Input id="desc" placeholder="一句話描述" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">聯絡人</Label>
            <Input id="contact" placeholder="姓名" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="contact@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">電話</Label>
            <Input id="phone" placeholder="09xx-xxx-xxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">官方網站</Label>
            <Input id="website" placeholder="https://" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="image">展示圖片URL</Label>
            <Input id="image" placeholder="https://example.com/cover.jpg" />
          </div>
          <div className="md:col-span-2">
            <Button>儲存</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
