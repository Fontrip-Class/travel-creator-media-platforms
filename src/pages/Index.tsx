import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import heroImage from "@/assets/hero-travel.jpg";
import { Button } from "@/components/ui/button";

const Index = () => {
  const title = "旅遊合作與素材授權平台 | 供應商・創作者・媒體"; // <60 chars
  const description = "連結旅遊供應商、KOC/KOL 與媒體的名錄、媒合與素材授權平台"; // <160 chars

  return (
    <>
      <SEO
        title={title}
        description={description}
        image={heroImage}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Travel Creator Media Hub",
          url: typeof window !== 'undefined' ? window.location.origin : undefined,
        }}
      />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-hero" aria-hidden />
          <div className="container relative grid lg:grid-cols-2 gap-10 py-20 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                讓旅遊供應商 × 創作者 × 媒體 更快找到彼此
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                清楚名錄、雙向媒合、素材授權與曝光，一站完成。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="hero">
                  <Link to="/suppliers">瀏覽供應商</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/creators">找創作者</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/media">找媒體曝光</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-elegant">
              <img src={heroImage} alt="旅遊合作平台視覺，連結供應商、創作者與媒體" loading="lazy" />
            </div>
          </div>
        </section>

        {/* Three columns */}
        <section className="container py-16">
          <h2 className="text-2xl font-semibold mb-8">三方角色與價值</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="p-6 rounded-xl border glass">
              <h3 className="font-semibold">旅遊供應商</h3>
              <p className="mt-2 text-sm text-muted-foreground">瀏覽創作者名錄、釋出合作/體驗方案，快速匹配內容夥伴。</p>
            </article>
            <article className="p-6 rounded-xl border glass">
              <h3 className="font-semibold">創作者</h3>
              <p className="mt-2 text-sm text-muted-foreground">查看可合作供應商與免費體驗，產出圖文影音並在此上傳與授權。</p>
            </article>
            <article className="p-6 rounded-xl border glass">
              <h3 className="font-semibold">媒體</h3>
              <p className="mt-2 text-sm text-muted-foreground">搜尋可用的行銷素材，取得授權並回傳曝光連結。</p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
