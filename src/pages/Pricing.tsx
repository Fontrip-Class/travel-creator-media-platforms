import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
  return (
    <main className="min-h-screen">
      <SEO
        title="定價方案 | 觀光署旅遊行銷媒合平台"
        description="平台完全免費使用；創作費用由任務發布者與供應商自行協商"
      />

      <header className="bg-hero text-white">
        <div className="container py-14">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">定價方案</h1>
          <p className="opacity-90 max-w-2xl">平台本身不收費，不抽成。創作費用由任務發布者與供應商自行協商。</p>
        </div>
      </header>

      <section className="container py-12 grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Free（免費版）</CardTitle>
            <CardDescription>供應商、創作者和媒體自由媒合</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>註冊和登入，角色管理</li>
              <li>任務瀏覽和申請，查看任務規格和預算</li>
              <li>素材上傳和搜尋，條件篩選 UI 優化</li>
              <li>管理素材和任務列表、篩選器</li>
              <li>通知和創作展示，終端 UI</li>
            </ul>
          </CardContent>
        </Card>
        <aside className="rounded-lg border p-6 shadow-card">
          <h2 className="font-semibold mb-2">計價說明</h2>
          <p className="text-sm text-muted-foreground mb-4">
            平台不收取任何費用，不抽成，清楚顯示在任務卡片詳情中
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">不抽成</Badge>
            <Badge variant="secondary">完全免費</Badge>
            <Badge variant="secondary">自由媒合</Badge>
          </div>
        </aside>
      </section>
    </main>
  );
}
