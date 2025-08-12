import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/hero-travel.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, BarChart3, Flag, CheckCircle2, Filter, Clock } from "lucide-react";

const SuppliersLanding = () => {
  const title = "旅遊服務供應商方案｜精準媒合與成效追蹤";
  const description = "發布任務、媒合創作者並掌握成效。平台零抽成，費用由供應商自主提供並於任務中顯示。";

  return (
    <main className="container py-10">
      <SEO title={title} description={description} structuredData={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
      }} />

      {/* 主視覺區 */}
      <header className="grid gap-6 lg:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">您的品牌值得被看見，我們為您精準媒合行銷資源。</h1>
          <p className="mt-3 text-muted-foreground">以任務驅動合作流程，快速找到最適合的內容創作者，放大品牌聲量。</p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg">
              <Link to="/register" aria-label="立即發佈任務">立即發佈任務</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/about">了解更多</Link>
            </Button>
          </div>
        </div>
        <div>
          <img src={heroImg} alt="台灣在地旅遊形象照" className="w-full rounded-xl border shadow-elegant" loading="eager" />
        </div>
      </header>

      {/* 核心價值區 */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">我們如何協助您？</h2>
        <p className="text-muted-foreground mt-1">您的服務，值得更多曝光。我們提供三大核心功能，讓您的行銷資源運用最大化。</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center"><Link2 className="size-5 text-primary" /></div>
              <CardTitle>精準媒合</CardTitle>
              <CardDescription>依地點、主題、行銷素材類型與規格，媒合最合適的創作者。</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center"><BarChart3 className="size-5 text-primary" /></div>
              <CardTitle>成效追蹤</CardTitle>
              <CardDescription>彙整觸及、互動等核心數據，讓成效一目了然。</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center"><Flag className="size-5 text-primary" /></div>
              <CardTitle>官方資源</CardTitle>
              <CardDescription>可申請觀光署相關資源與額外曝光機會。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 誘因區塊 */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">選擇我們的理由</h2>
        <p className="text-muted-foreground mt-1">我們不僅是平台，更是您的行銷夥伴。</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CheckCircle2, title: "零平台費用", desc: "自由設定預算與合作條件，費用於任務中透明顯示。" },
            { icon: Filter, title: "精準篩選", desc: "依主題、地點、素材規格找到最適合的創作者。" },
            { icon: Clock, title: "快速上線", desc: "3-5 分鐘完成任務建立，即刻媒合。" },
            { icon: BarChart3, title: "成果可追蹤", desc: "整合觸及與互動數據，輕鬆回顧效益。" },
          ].map((item, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <item.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA 區塊 */}
      <section className="mt-12 rounded-xl border p-8 text-center">
        <h2 className="text-2xl font-semibold">準備好讓您的品牌發光發熱了嗎？</h2>
        <p className="text-muted-foreground mt-2">現在就發布您的第一個任務，與創作者展開合作。</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg"><Link to="/register">立即發佈您的第一個任務</Link></Button>
          <Button asChild variant="secondary" size="lg"><Link to="/about">了解更多</Link></Button>
        </div>
      </section>
    </main>
  );
};

export default SuppliersLanding;
