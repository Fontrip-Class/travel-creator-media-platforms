import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";

export default function About() {
  return (
    <main className="min-h-screen">
      <SEO
        title="關於我們 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="我們致力於為旅遊產業提供全方位的服務，協助供應商、創作者和媒體建立合作關係"
      />
      <header className="bg-hero text-white">
        <div className="container py-14">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">關於我們的平台</h1>
          <p className="opacity-90 max-w-2xl">
            我們是一個專注於旅遊產業的綜合平台，致力於連接供應商、創作者和媒體，創造更多合作機會
          </p>
        </div>
      </header>

      <section className="container py-12 grid gap-10 md:grid-cols-2">
        <article>
          <h2 className="text-2xl font-semibold mb-3">我們的使命與願景</h2>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>建立旅遊產業的生態系統，促進各方合作</li>
            <li>提供優質的媒合服務，提升合作效率</li>
            <li>支持創作者發展，豐富旅遊內容</li>
            <li>協助供應商推廣，擴大市場影響</li>
            <li>推動產業創新，促進可持續發展</li>
          </ol>
        </article>
        <article>
          <h2 className="text-2xl font-semibold mb-3">我們的核心價值</h2>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>誠信合作，建立長期穩定的合作關係</li>
            <li>創新服務，持續改進平台功能和體驗</li>
            <li>專業品質，提供高標準的服務品質</li>
            <li>用戶至上，以用戶需求為導向</li>
            <li>產業共贏，促進整個產業的發展</li>
          </ol>
        </article>
      </section>

      <section className="container pb-14">
        <h2 className="text-2xl font-semibold mb-4">服務對象</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-6 shadow-card">
            <h3 className="font-semibold mb-2">旅遊供應商</h3>
            <p className="text-sm text-muted-foreground mb-4">提供旅遊服務、景點門票、住宿等服務的企業和機構</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">景點門票</Badge>
              <Badge variant="secondary">住宿服務</Badge>
              <Badge variant="secondary">交通服務</Badge>
            </div>
          </div>
          <div className="rounded-lg border p-6 shadow-card">
            <h3 className="font-semibold mb-2">內容創作者 / KOC</h3>
            <p className="text-sm text-muted-foreground mb-4">創作旅遊內容，分享旅遊經驗和推薦的個人或團隊</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">旅遊攻略</Badge>
              <Badge variant="secondary">景點推薦</Badge>
              <Badge variant="secondary">美食分享</Badge>
            </div>
          </div>
          <div className="rounded-lg border p-6 shadow-card">
            <h3 className="font-semibold mb-2">媒體平台</h3>
            <p className="text-sm text-muted-foreground mb-4">協助品牌與創作者建立合作關係的媒體機構</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">內容推廣</Badge>
              <Badge variant="secondary">品牌合作</Badge>
              <Badge variant="secondary">市場推廣</Badge>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

