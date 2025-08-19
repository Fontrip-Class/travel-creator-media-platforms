import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const typeAccept = {
  image: "image/*",
  video: "video/*"
};

export default function Assets() {
  const [assetType, setAssetType] = useState<string>("image");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">素材清單</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="搜尋標題/上傳者" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">圖片</SelectItem>
                <SelectItem value="video">影音</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="審核狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待審</SelectItem>
                <SelectItem value="approved">通過</SelectItem>
                <SelectItem value="rejected">拒絕</SelectItem>
              </SelectContent>
            </Select>
            <Button>搜尋</Button>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>標題</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>格式</TableHead>
                  <TableHead>狀態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>花蓮海岸日出</TableCell>
                  <TableCell>圖片</TableCell>
                  <TableCell>image/webp</TableCell>
                  <TableCell>待審</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">上架素材（格式規範）</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>素材類型</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger>
                <SelectValue placeholder="圖片/影音" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">圖片（{typeAccept.image}）</SelectItem>
                <SelectItem value="video">影音（{typeAccept.video}）</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-title">標題</Label>
            <Input id="a-title" placeholder="素材標題" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="a-desc">說明</Label>
            <Input id="a-desc" placeholder="簡述內容、版權、授權條件" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="a-file">檔案（依類型限制大小）</Label>
            <Input id="a-file" type="file" accept={`${typeAccept.image}, ${typeAccept.video}`} />
          </div>
          <div className="space-y-2">
            <Label>審核狀態</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="待審/通過/拒絕" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待審</SelectItem>
                <SelectItem value="approved">通過</SelectItem>
                <SelectItem value="rejected">拒絕</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button>提交審核</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
