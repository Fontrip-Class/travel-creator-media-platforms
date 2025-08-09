import { Link, useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import { SEO } from "@/components/SEO";
import heroImage from "@/assets/hero-travel.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  const title = "觀光署旅遊服務與行銷創作資源平台 | 名錄與媒合"; // <60 chars
  const description = "觀光署一站整合供應商、KOC 創作者、媒體與素材授權的資源管理與媒合平台"; // <160 chars
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const stats = [
    { label: "KOC 創作者數量", value: "15,000+" },
    { label: "創作者影音素材數量", value: "120,000+" },
    { label: "媒體通路曝光數量", value: "80,000+" },
  ];
  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/creators?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <SEO
        title={title}
        description={description}
        image={heroImage}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "觀光署旅遊服務與行銷創作資源平台",
          url: origin || undefined,
          potentialAction: {
            "@type": "SearchAction",
            target: `${origin}/creators?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-hero" aria-hidden />
          <div className="container relative grid lg:grid-cols-2 gap-10 py-20 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                觀光署旅遊服務與行銷創作資源管理與媒合平台
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                集中管理供應商、KOC 創作者、媒體通路與素材授權，搜尋、媒合到曝光一站完成。
              </p>
              <form onSubmit={onSearch} className="mt-6 flex w-full max-w-xl items-center gap-2">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="輸入關鍵字（景點、主題、平台）"
                  aria-label="站內搜尋"
                  className="h-12 flex-1"
                />
                <Button type="submit" size="lg">
                  AI 搜尋
                </Button>
              </form>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="secondary">
                  <Link to="/suppliers">瀏覽供應商</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/creators">找創作者</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/media">找媒體曝光</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-elegant">
              <img src={heroImage} alt="觀光署旅遊行銷資源平台—示意圖" loading="lazy" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container py-12">
          <div className="grid gap-8 text-center md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-bold">{s.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Case studies */}
        <section className="container py-16">
          <h2 className="text-2xl font-semibold mb-6">案例精選</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <article key={i} className="relative overflow-hidden rounded-xl border hover:shadow-elegant transition-shadow">
                <img
                  src={heroImage}
                  alt={`旅遊行銷案例圖片 ${i}`}
                  loading="lazy"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/0" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-semibold">旅遊行銷案例 {i}</h3>
                  <p className="text-xs text-muted-foreground">示意圖，可替換為真實案例圖片與連結</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
