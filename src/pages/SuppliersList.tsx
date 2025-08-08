import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { suppliers } from "@/data/sample";

const SuppliersList = () => {
  const title = "供應商名錄 | 旅遊合作平台";
  const description = "瀏覽旅遊服務供應商，查看合作/體驗方案與聯絡方式";

  return (
    <main className="container py-10">
      <SEO
        title={title}
        description={description}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: suppliers.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.name,
            url: `/suppliers/${s.id}`,
          })),
        }}
      />

      <header className="mb-6">
        <h1 className="text-3xl font-bold">供應商名錄</h1>
        <p className="text-muted-foreground mt-2">精選旅遊品牌與在地體驗</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => (
          <article key={s.id} className="p-5 rounded-xl border hover:shadow-elegant transition-shadow">
            <h2 className="font-semibold text-lg">
              <Link to={`/suppliers/${s.id}`}>{s.name}</Link>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{s.category} · {s.location}</p>
            <p className="text-sm mt-2 line-clamp-3">{s.description}</p>
            <div className="mt-3 text-sm text-muted-foreground">聯絡：{s.contact}</div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default SuppliersList;
