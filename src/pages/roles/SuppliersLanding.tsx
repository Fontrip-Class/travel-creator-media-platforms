import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/hero-travel.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Target, TrendingUp, CheckCircle2, Search, FileText } from "lucide-react";

const SuppliersLanding = () => {
  const title = "觀光旅遊供應商方案｜精選媒體通路追蹤";
  const description = "發布任務吸引創作者並掌握平台零成本，費用由供應商自主提供並在任務中顯示";

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
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">任務驅動行銷建立品牌影響力</h1>
          <p className="mt-3 text-muted-foreground">透過創作者內容行銷，精準觸及目標受眾，提升品牌知名度</p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg">
              <Link to="/register" aria-label="立即成為觀光供應商">立即成為觀光供應商</Link>
            </Button>
          </div>
        </div>
        <div>
          <img src={heroImg} alt="觀光旅遊供應商視覺" className="w-full rounded-xl border shadow-elegant" loading="eager" />
        </div>
      </header>

      {/* 核心優勢 */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">平台核心優勢，讓您事半功倍</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Building2, title: "活躍供應商", desc: "豐富經驗，值得信賴的旅遊相關供應商大核心，讓您掌握資源掌握大優勢" },
            { icon: Users, title: "創作者社群", desc: "龐大的創作者網絡，多樣化內容風格，滿足不同行銷需求" },
            { icon: Target, title: "精準媒合", desc: "智能推薦系統，精準匹配供應商需求與創作者專長" },
            { icon: TrendingUp, title: "效果追蹤", desc: "完整的數據分析，追蹤行銷效果，優化投放策略" },
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
        <h2 className="text-2xl font-semibold">三步驟開始您的行銷之旅</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: FileText, title: "發布任務需求", desc: "詳細描述您的行銷目標、預算和期望效果" },
            { icon: Search, title: "選擇創作者", desc: "瀏覽創作者作品集，選擇最適合的合作夥伴" },
            { icon: CheckCircle2, title: "驗收和推廣", desc: "審核內容品質，開始推廣您的品牌和服務" },
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
        <h2 className="text-2xl font-semibold">現在就開始建立您的品牌影響力</h2>
        <p className="text-muted-foreground mt-2">加入平台，讓創作者為您打造專業的行銷內容</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg"><Link to="/register">立即成為觀光供應商</Link></Button>
        </div>
      </section>
    </main>
  );
};

export default SuppliersLanding;
