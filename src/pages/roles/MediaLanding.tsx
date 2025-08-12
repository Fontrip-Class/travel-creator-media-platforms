import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/hero-travel.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Images, FileCheck2, Download, Shield, UserCheck, Search, CheckCircle2 } from "lucide-react";

const MediaLanding = () => {
  const title = "合作媒體方案｜高品質旅遊素材下載";
  const description = "註冊為合作媒體，透過關鍵字與多重篩選，快速找到並下載符合授權條件的行銷素材。";

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
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">掌握最即時、最豐富的旅遊內容，輕鬆提升平台流量。</h1>
          <p className="mt-3 text-muted-foreground">高品質素材庫搭配清楚授權條款與下載紀錄，安全且高效。</p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg">
              <Link to="/register" aria-label="申請成為合作媒體">申請成為合作媒體</Link>
            </Button>
          </div>
        </div>
        <div>
          <img src={heroImg} alt="旅遊素材拼貼視覺" className="w-full rounded-xl border shadow-elegant" loading="eager" />
        </div>
      </header>

      {/* 誘因區塊 */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">平台優勢，助您創造更多價值</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Images, title: "海量素材庫", desc: "多主題、多地點的高品質旅遊圖片與影片。" },
            { icon: Shield, title: "清楚授權", desc: "商用/編輯用、期限與範圍一目了然。" },
            { icon: Search, title: "多重篩選", desc: "依地點、主題、授權條件快速鎖定素材。" },
            { icon: Download, title: "快速下載", desc: "確認授權後即可下載，系統自動保存紀錄。" },
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

      {/* 流程區塊 */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">如何開始合作？</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: UserCheck, title: "註冊並認證媒體身分", desc: "提供基本資料完成認證。" },
            { icon: Search, title: "搜尋與預覽素材", desc: "透過關鍵字與條件篩選，查看授權條件。" },
            { icon: FileCheck2, title: "確認授權並下載", desc: "勾選授權條款後下載，下載紀錄自動保存。" },
          ].map((step, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <step.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">{`${idx + 1}. ${step.title}`}</CardTitle>
                <CardDescription>{step.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA 區塊 */}
      <section className="mt-12 rounded-xl border p-8 text-center">
        <h2 className="text-2xl font-semibold">現在就加入，擴充您的內容軍火庫。</h2>
        <p className="text-muted-foreground mt-2">註冊並認證媒體身分，開始下載高品質旅遊素材。</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg"><Link to="/register">立即申請成為合作媒體</Link></Button>
        </div>
      </section>
    </main>
  );
};

export default MediaLanding;
