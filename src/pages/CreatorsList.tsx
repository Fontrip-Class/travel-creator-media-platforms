import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { creators } from "@/data/sample";

const CreatorsList = () => {
  const title = "創作者名錄 | 旅遊合作平台";
  const description = "瀏覽創作者（KOC/KOL）名單與領域、平台與聯絡方式";

  return (
    <main className="container py-10">
      <SEO
        title={title}
        description={description}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: creators.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            url: `/creators/${c.id}`,
          })),
        }}
      />

      <header className="mb-6">
        <h1 className="text-3xl font-bold">創作者名錄</h1>
        <p className="text-muted-foreground mt-2">找到合適領域與平台的合作夥伴</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {creators.map((c) => (
          <article key={c.id} className="p-5 rounded-xl border hover:shadow-elegant transition-shadow">
            <h2 className="font-semibold text-lg">
              <Link to={`/creators/${c.id}`}>{c.name}</Link>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">領域：{c.niches.join("、")} · 平台：{c.platforms.join("、")}</p>
            <p className="text-sm mt-2 line-clamp-3">{c.bio}</p>
            <div className="mt-3 text-sm text-muted-foreground">聯絡：{c.contact}</div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default CreatorsList;
