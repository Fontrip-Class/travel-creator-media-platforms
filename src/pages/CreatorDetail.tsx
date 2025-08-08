import { useParams, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { creators } from "@/data/sample";

const CreatorDetail = () => {
  const { id } = useParams();
  const creator = creators.find((c) => c.id === id);

  if (!creator) {
    return (
      <main className="container py-10">
        <h1 className="text-2xl font-bold">找不到創作者</h1>
        <Link to="/creators" className="text-sm text-primary mt-2 inline-block">返回名錄</Link>
      </main>
    );
  }

  const title = `${creator.name} | 創作者詳情`;
  const description = `領域：${creator.niches.join("、")}｜平台：${creator.platforms.join("、")}`;

  return (
    <main className="container py-10">
      <SEO
        title={title}
        description={description}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: creator.name,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          sameAs: creator.links,
          description: creator.bio,
          aggregateRating: typeof creator.rating === "number"
            ? {
                "@type": "AggregateRating",
                ratingValue: creator.rating,
                reviewCount: creator.ratingCount || 0,
              }
            : undefined,
        }}
      />

      <header className="mb-6">
        <h1 className="text-3xl font-bold">{creator.name}</h1>
        <p className="text-muted-foreground mt-2">領域：{creator.niches.join("、")} · 平台：{creator.platforms.join("、")}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="md:col-span-2 p-6 rounded-xl border">
          <h2 className="font-semibold mb-2">簡介</h2>
          <p className="text-sm leading-7">{creator.bio}</p>
        </article>

        <article className="md:col-span-2 p-6 rounded-xl border">
          <h2 className="font-semibold mb-3">過往行銷素材</h2>
          {creator.assets && creator.assets.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {creator.assets.map((a) => (
                <div key={a.id} className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">{a.type}</div>
                  <div className="font-medium mt-1">{a.title}</div>
                  {a.description && <p className="text-sm mt-1 line-clamp-3">{a.description}</p>}
                  <div className="text-xs text-muted-foreground mt-2">{a.date}</div>
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary mt-2 inline-block underline">
                      查看素材
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">尚無素材資料</p>
          )}
        </article>

        <aside className="p-6 rounded-xl border">
          <h3 className="font-semibold mb-3">平台評分</h3>
          {typeof creator.rating === "number" ? (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div aria-label={`評分 ${creator.rating} / 5`} className="text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < Math.round(creator.rating) ? "★" : "☆"}</span>
                  ))}
                </div>
                <div className="text-sm">{creator.rating.toFixed(1)} / 5</div>
              </div>
              {creator.ratingCount && <div className="text-xs text-muted-foreground mt-1">來自 {creator.ratingCount} 則評分</div>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">尚未評分</p>
          )}

          <h3 className="font-semibold mb-2">聯絡</h3>
          {creator.contact.startsWith("http") ? (
            <p className="text-sm">官方網站：
              <a href={creator.contact} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">前往</a>
            </p>
          ) : (
            <p className="text-sm">Email：
              <a href={`mailto:${creator.contact}`} className="underline hover:text-primary">{creator.contact}</a>
            </p>
          )}

          <Link to="/creators" className="text-sm text-primary mt-4 inline-block">返回名錄</Link>
        </aside>
      </section>
    </main>
  );
};

export default CreatorDetail;
