import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { medias } from "@/data/sample";

const MediaList = () => {
  const title = "媒體列表 | 旅遊創作者平台";
  const description = "探索媒體資源，管理創作行銷素材";

  return (
    <main className="container py-10">
      <SEO
        title={title}
        description={description}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: medias.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: m.name,
            url: `/media/${m.id}`,
          })),
        }}
      />

      <header className="mb-6">
        <h1 className="text-3xl font-bold">媒體列表</h1>
        <p className="text-muted-foreground mt-2">探索媒體資源，管理創作素材</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {medias.map((m) => (
          <article key={m.id} className="p-5 rounded-xl border hover:shadow-elegant transition-shadow">
            <h2 className="font-semibold text-lg">
              <Link to={`/media/${m.id}`}>{m.name}</Link>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{m.type} · 觸及：{m.reach}</p>
            <p className="text-sm mt-2 line-clamp-3">{m.description}</p>
            <div className="mt-3 text-sm text-muted-foreground">聯絡：{m.contact}</div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default MediaList;
