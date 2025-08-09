import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MediaAdmin() {
  return (
    <div className="grid gap-6">
      <SEO title="媒體管理" description="管理媒體基本資料與聯絡方式" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">搜尋與清單</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="搜尋名稱/類型" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="新聞">新聞</SelectItem>
                <SelectItem value="雜誌">雜誌</SelectItem>
                <SelectItem value="部落格">部落格</SelectItem>
                <SelectItem value="社群">社群</SelectItem>
              </SelectContent>
            </Select>
            <Button>搜尋</Button>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名稱</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>聯絡人</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>旅遊日報</TableCell>
                  <TableCell>新聞</TableCell>
                  <TableCell>林小姐</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">新增/編輯媒體</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="m-name">名稱</Label>
            <Input id="m-name" placeholder="媒體名稱" />
          </div>
          <div className="space-y-2">
            <Label>類型</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="選擇類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="新聞">新聞</SelectItem>
                <SelectItem value="雜誌">雜誌</SelectItem>
                <SelectItem value="部落格">部落格</SelectItem>
                <SelectItem value="社群">社群</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-contact">聯絡人</Label>
            <Input id="m-contact" placeholder="姓名" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-email">Email</Label>
            <Input id="m-email" type="email" placeholder="media@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-phone">電話</Label>
            <Input id="m-phone" placeholder="02-xxxx-xxxx" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="m-site">網站</Label>
            <Input id="m-site" placeholder="https://" />
          </div>
          <div className="md:col-span-2">
            <Button>儲存</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
