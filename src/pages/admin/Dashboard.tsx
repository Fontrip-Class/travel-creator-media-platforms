import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="grid gap-6">
      <SEO title="後台總覽" description="後台關鍵數據與捷徑" />
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{label:'待審素材', value:'12'}, {label:'公開招募中任務', value:'5'}, {label:'新申請', value:'23'}].map((m) => (
          <Card key={m.label}>
            <CardHeader>
              <CardTitle className="text-sm">{m.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
