import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
  return (
    <main className="min-h-screen">
      <SEO
        title="服務與價格｜旅遊行銷媒合平台"
        description="平台目前免費使用；合作預算由任務內標示，供應商與創作者自行媒合。"
      />

      <header className="bg-hero text-white">
        <div className="container py-14">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">服務與價格</h1>
          <p className="opacity-90 max-w-2xl">平台目前不收費，不抽成。所有合作費用由任務內標示與雙方協議。</p>
        </div>
      </header>

      <section className="container py-12 grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Free（免費）</CardTitle>
            <CardDescription>適合供應商、創作者與媒體自由媒合</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>註冊、登入與角色管理</li>
              <li>任務發佈與申請（含「行銷素材類型與規格」欄位）</li>
              <li>素材上傳與搜尋（授權條件 UI 預留）</li>
              <li>熱門素材與任務列表、篩選器</li>
              <li>通知與操作提示（前端 UI）</li>
            </ul>
          </CardContent>
        </Card>
        <aside className="rounded-lg border p-6 shadow-card">
          <h2 className="font-semibold mb-2">計價說明</h2>
          <p className="text-sm text-muted-foreground mb-4">
            平台不收取任何費用；若供應商提供合作預算，將清楚顯示於任務卡與詳情中。
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">不抽成</Badge>
            <Badge variant="secondary">透明預算</Badge>
            <Badge variant="secondary">自由媒合</Badge>
          </div>
        </aside>
      </section>
    </main>
  );
}
