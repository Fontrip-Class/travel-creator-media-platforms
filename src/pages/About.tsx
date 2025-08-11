import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";

export default function About() {
  return (
    <main className="min-h-screen">
      <SEO
        title="平台介紹與運作機制｜旅遊行銷媒合平台"
        description="了解任務驅動與素材驅動兩大合作模式，連結旅遊供應商、創作者與媒體的運作方式。"
      />
      <header className="bg-hero text-white">
        <div className="container py-14">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">平台介紹與運作機制</h1>
          <p className="opacity-90 max-w-2xl">
            以「任務驅動」與「素材驅動」兩大模式，促成旅遊品牌與創作者、媒體之間的高效率合作。
          </p>
        </div>
      </header>

      <section className="container py-12 grid gap-10 md:grid-cols-2">
        <article>
          <h2 className="text-2xl font-semibold mb-3">任務驅動（供應商 → 創作者）</h2>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>供應商建立任務（名稱、目標、預算、時程、交付）</li>
            <li>系統通知符合條件之創作者</li>
            <li>創作者申請並提交提案與過往作品</li>
            <li>雙方確認合作（線上審核與溝通）</li>
            <li>創作者執行並上傳素材，完成驗收</li>
          </ol>
        </article>
        <article>
          <h2 className="text-2xl font-semibold mb-3">素材驅動（創作者 → 媒體/供應商）</h2>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>創作者上傳並設定素材標籤與授權條件</li>
            <li>媒體/供應商以關鍵字與條件搜尋</li>
            <li>預覽素材詳情與授權條款</li>
            <li>確認授權條件後進行下載</li>
            <li>平台記錄下載與使用情況</li>
          </ol>
        </article>
      </section>

      <section className="container pb-14">
        <h2 className="text-2xl font-semibold mb-4">三大角色</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-6 shadow-card">
            <h3 className="font-semibold mb-2">旅遊服務供應商</h3>
            <p className="text-sm text-muted-foreground mb-4">上架旅遊產品、發佈任務、尋找合作創作者與媒體。</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">任務發佈</Badge>
              <Badge variant="secondary">素材搜尋</Badge>
              <Badge variant="secondary">品牌曝光</Badge>
            </div>
          </div>
          <div className="rounded-lg border p-6 shadow-card">
            <h3 className="font-semibold mb-2">內容創作者 / KOC</h3>
            <p className="text-sm text-muted-foreground mb-4">申請任務、上傳成果素材、管理作品集與專長。</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">任務申請</Badge>
              <Badge variant="secondary">素材上傳</Badge>
              <Badge variant="secondary">作品管理</Badge>
            </div>
          </div>
          <div className="rounded-lg border p-6 shadow-card">
            <h3 className="font-semibold mb-2">媒體通路</h3>
            <p className="text-sm text-muted-foreground mb-4">搜尋授權素材、快速下載、聯繫供應商或創作者。</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">素材授權</Badge>
              <Badge variant="secondary">搜尋篩選</Badge>
              <Badge variant="secondary">合作洽談</Badge>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
