import { useParams, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { suppliers } from "@/data/sample";

const SupplierDetail = () => {
  const { id } = useParams();
  const supplier = suppliers.find((s) => s.id === id);

  if (!supplier) {
    return (
      <main className="container py-10">
        <h1 className="text-2xl font-bold">找不到供應商</h1>
        <Link to="/suppliers" className="text-sm text-primary mt-2 inline-block">返回名錄</Link>
      </main>
    );
  }

  const title = `${supplier.name} | 供應商詳情`;
  const description = `${supplier.category}｜${supplier.location}｜聯絡：${supplier.contact}`;

  return (
    <main className="container py-10">
      <SEO
        title={title}
        description={description}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: supplier.name,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          address: supplier.location,
          email: supplier.contact,
          description: supplier.description,
        }}
      />

      <header className="mb-6">
        <h1 className="text-3xl font-bold">{supplier.name}</h1>
        <p className="text-muted-foreground mt-2">{supplier.category} · {supplier.location}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="md:col-span-2 p-6 rounded-xl border">
          <h2 className="font-semibold mb-2">介紹</h2>
          <p className="text-sm leading-7">{supplier.description}</p>
        </article>
        <aside className="p-6 rounded-xl border">
          <h3 className="font-semibold mb-2">聯絡方式</h3>
          <p className="text-sm">Email：{supplier.contact}</p>
          <Link to="/suppliers" className="text-sm text-primary mt-4 inline-block">返回名錄</Link>
        </aside>
      </section>
    </main>
  );
};

export default SupplierDetail;
