import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CreatorsAdmin() {
  return (
    <div className="grid gap-6">
      <SEO title="創作者管理" description="管理創作者基本資料與專長領域" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">搜尋與清單</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="搜尋名稱/領域" />
            <Button>搜尋</Button>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名稱</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>主要領域</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>優尼太太</TableCell>
                  <TableCell>hello@creator.com</TableCell>
                  <TableCell>旅遊、美食</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">新增/編輯創作者</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-name">名稱/品牌名</Label>
            <Input id="c-name" placeholder="Creator Name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-email">Email</Label>
            <Input id="c-email" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="c-focus">行銷領域（逗號分隔）</Label>
            <Input id="c-focus" placeholder="旅遊, 美食, 生活風格" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="c-skill">專長</Label>
            <Input id="c-skill" placeholder="短影音、攝影、長文撰寫" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yt">YouTube</Label>
            <Input id="yt" placeholder="https://youtube.com/@..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ig">Instagram</Label>
            <Input id="ig" placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tt">TikTok</Label>
            <Input id="tt" placeholder="https://tiktok.com/@..." />
          </div>
          <div className="md:col-span-2">
            <Button>儲存</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
