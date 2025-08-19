import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

const roles = [
  { key: "admin", name: "管理員" },
  { key: "tourism", name: "觀光署" },
  { key: "supplier", name: "供應商/景點供應商" },
  { key: "creator", name: "創作者" },
  { key: "media", name: "媒體" },
];

const permissions = [
  { key: "manage_suppliers", name: "供應商管理" },
  { key: "manage_creators", name: "創作者管理" },
  { key: "manage_media", name: "媒體管理" },
  { key: "manage_tasks", name: "委託任務管理" },
  { key: "manage_assets", name: "素材管理/審核" },
];

export default function PermissionsAdmin() {
  return (
    <div className="grid gap-6">
      <SEO title="權限管理" description="設定各角色於後台可執行的功能" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">角色權限矩陣（示範）</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>權限/角色</TableHead>
                {roles.map((r) => (
                  <TableHead key={r.key}>{r.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((p) => (
                <TableRow key={p.key}>
                  <TableCell>{p.name}</TableCell>
                  {roles.map((r) => (
                    <TableCell key={`${p.key}-${r.key}`}>
                      <Checkbox />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
