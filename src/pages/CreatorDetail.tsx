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
          sameAs: creator.platforms,
          description: creator.bio,
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
        <aside className="p-6 rounded-xl border">
          <h3 className="font-semibold mb-2">聯絡</h3>
          <p className="text-sm">Email：{creator.contact}</p>
          <Link to="/creators" className="text-sm text-primary mt-4 inline-block">返回名錄</Link>
        </aside>
      </section>
    </main>
  );
};

export default CreatorDetail;
