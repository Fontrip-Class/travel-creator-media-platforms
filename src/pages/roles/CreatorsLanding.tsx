import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/hero-travel.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Gift, CalendarClock, ShieldCheck, UserPlus, Search, CheckCircle2 } from "lucide-react";

const CreatorsLanding = () => {
  const title = "內容創作者方案 | 觀光署旅遊接案平台";
  const description = "創作者為供應商瀏覽任務並接案，以創作內容影響力獲得體制內報酬";

  return (
    <main className="container py-10">
      <SEO title={title} description={description} structuredData={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
      }} />

      {/* 主要視覺 */}
      <header className="grid gap-6 lg:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">釋放你的創作潛能，實現變現，成為影響力人物</h1>
          <p className="mt-3 text-muted-foreground">創作你的作品，接取相關任務，創作作品</p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg">
              <Link to="/register" aria-label="立即成為創作者">立即成為創作者</Link>
            </Button>
          </div>
        </div>
        <div>
          <img src={heroImg} alt="旅遊創作體驗" className="w-full rounded-xl border shadow-elegant" loading="eager" />
        </div>
      </header>

      {/* 誘因說明 */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">享受體制內體制，發揮影響力</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Gift, title: "體制內體制", desc: "體制內體制的地區活動，創作內容" },
            { icon: Sparkles, title: "清楚任務資料", desc: "清楚顯示任務截止日期，讓你放心" },
            { icon: CalendarClock, title: "彈性接案", desc: "依照你的行程和專長，選擇任務" },
            { icon: ShieldCheck, title: "版權保護", desc: "標準版權條款清楚，確保內容使用" },
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

      {/* 流程說明 */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">加入我們的簡單三步</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: UserPlus, title: "註冊並建立資料", desc: "填寫專長和地區，建立你的個人資料" },
            { icon: Search, title: "瀏覽並申請任務", desc: "透過篩選找到適合的機會" },
            { icon: CheckCircle2, title: "完成任務並獲得報酬", desc: "創作內容，提交素材並獲得酬勞" },
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
        <h2 className="text-2xl font-semibold">你的創作，值得被更多人看見</h2>
        <p className="text-muted-foreground mt-2">立即加入，開始承接相關任務</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg"><Link to="/register">立即成為創作者</Link></Button>
        </div>
      </section>
    </main>
  );
};

export default CreatorsLanding;
