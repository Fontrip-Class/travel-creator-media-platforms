import { useParams, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { medias } from "@/data/sample";

const MediaDetail = () => {
  const { id } = useParams();
  const media = medias.find((m) => m.id === id);

  if (!media) {
    return (
      <main className="container py-10">
        <h1 className="text-2xl font-bold">找不到媒體</h1>
        <Link to="/media" className="text-sm text-primary mt-2 inline-block">返回名錄</Link>
      </main>
    );
  }

  const title = `${media.name} | 媒體詳情`;
  const description = `${media.type}｜觸及：${media.reach}｜聯絡：${media.contact}`;

  return (
    <main className="container py-10">
      <SEO
        title={title}
        description={description}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: media.name,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          description: media.description,
        }}
      />

      <header className="mb-6">
        <h1 className="text-3xl font-bold">{media.name}</h1>
        <p className="text-muted-foreground mt-2">{media.type} · 觸及：{media.reach}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="md:col-span-2 p-6 rounded-xl border">
          <h2 className="font-semibold mb-2">簡介</h2>
          <p className="text-sm leading-7">{media.description}</p>
        </article>
        <aside className="p-6 rounded-xl border">
          <h3 className="font-semibold mb-2">聯絡</h3>
          <p className="text-sm">Email：{media.contact}</p>
          <Link to="/media" className="text-sm text-primary mt-4 inline-block">返回名錄</Link>
        </aside>
      </section>
    </main>
  );
};

export default MediaDetail;
