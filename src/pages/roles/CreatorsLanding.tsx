import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/hero-travel.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Gift, CalendarClock, ShieldCheck, UserPlus, Search, CheckCircle2 } from "lucide-react";

const CreatorsLanding = () => {
  const title = "內容創作者方案｜旅遊體驗與接案機會";
  const description = "申請成為創作者，瀏覽任務並提案，以你的內容影響力獲得旅遊體驗與報酬。";

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
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">釋放你的創作潛力，把熱情變現，成為旅遊界的影響力人物。</h1>
          <p className="mt-3 text-muted-foreground">用你的專長與作品，連結更多旅遊任務與品牌合作。</p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg">
              <Link to="/register" aria-label="申請成為創作者">申請成為創作者</Link>
            </Button>
          </div>
        </div>
        <div>
          <img src={heroImg} alt="創作者旅遊體驗拍攝情境" className="w-full rounded-xl border shadow-elegant" loading="eager" />
        </div>
      </header>

      {/* 誘因區塊 */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">享受獨家旅遊體驗，發揮你的影響力</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Gift, title: "獨家體驗", desc: "優先體驗在地旅遊與活動，創作更有感的內容。" },
            { icon: Sparkles, title: "透明任務資訊", desc: "清楚顯示預算、截止日與素材規格，接案更放心。" },
            { icon: CalendarClock, title: "彈性接案", desc: "依你的時程與專長選擇最適合的任務。" },
            { icon: ShieldCheck, title: "授權有保障", desc: "標準授權條款清楚可見，確保內容使用權益。" },
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
        <h2 className="text-2xl font-semibold">加入我們的簡單三步驟</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: UserPlus, title: "註冊並建立檔案", desc: "填寫專長與作品集，建立你的個人頁。" },
            { icon: Search, title: "瀏覽並申請任務", desc: "透過篩選找到感興趣的合作機會。" },
            { icon: CheckCircle2, title: "執行任務並獲得報酬", desc: "創造內容，交付素材並獲得酬勞。" },
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
        <h2 className="text-2xl font-semibold">你的作品，值得被更多人看見</h2>
        <p className="text-muted-foreground mt-2">立即申請，開始承接旅遊相關任務。</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg"><Link to="/register">申請成為創作者</Link></Button>
        </div>
      </section>
    </main>
  );
};

export default CreatorsLanding;
