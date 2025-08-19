import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/hero-travel.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Images, FileCheck2, Download, Shield, UserCheck, Search, CheckCircle2 } from "lucide-react";

const MediaLanding = () => {
  const title = "觀光媒體方案｜高品質素材下載";
  const description = "註冊後可作媒體體關鍵字和多種篩選，快速找到並下載符合條件的素材";

  return (
    <main className="container py-10">
      <SEO title={title} description={description} structuredData={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
      }} />

      {/* 主視覺 */}
      <header className="grid gap-6 lg:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">掌握觀光旅遊豐富內容的輕鬆平台流程</h1>
          <p className="mt-3 text-muted-foreground">高品質素材庫，清晰使用條款，安全且可靠</p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg">
              <Link to="/register" aria-label="立即成為觀光媒體">立即成為觀光媒體</Link>
            </Button>
          </div>
        </div>
        <div>
          <img src={heroImg} alt="觀光素材貼視覺" className="w-full rounded-xl border shadow-elegant" loading="eager" />
        </div>
      </header>

      {/* 優勢特色 */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">平台優勢，助您創造更多價值</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Images, title: "海量素材庫", desc: "多主題、高品質、多樣化的影像素材" },
            { icon: Shield, title: "清晰授權", desc: "使用/編輯權、授權範圍一目了然" },
            { icon: Search, title: "多種篩選", desc: "依地點、主題、授權條件快速定位素材" },
            { icon: Download, title: "快速下載", desc: "確認授權後即可下載，系統自動保存記錄" },
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

      {/* 使用流程 */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">如何使用平台</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: UserCheck, title: "註冊並驗證媒體身份", desc: "填寫基本資料完成認證" },
            { icon: Search, title: "瀏覽和篩選素材", desc: "使用關鍵字和條件篩選，查看授權條件" },
            { icon: FileCheck2, title: "確認授權並下載", desc: "選擇合適條款後下載，記錄自動保存" },
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

      {/* CTA 區域 */}
      <section className="mt-12 rounded-xl border p-8 text-center">
        <h2 className="text-2xl font-semibold">現在就開始建立您的內容軍火庫</h2>
        <p className="text-muted-foreground mt-2">註冊並驗證媒體身份，開始下載高品質素材</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg"><Link to="/register">立即成為觀光媒體</Link></Button>
        </div>
      </section>
    </main>
  );
};

export default MediaLanding;
