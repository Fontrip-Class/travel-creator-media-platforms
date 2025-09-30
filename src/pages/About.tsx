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

      <section className="bg-gradient-primary/5 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">完整的行銷任務服務流程</h2>
          
          <div className="max-w-6xl mx-auto">
            {/* 流程步驟 */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
              {/* 步驟 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">需求發布</h3>
                <p className="text-sm text-muted-foreground">
                  供應商發布行銷任務需求，詳細說明合作內容與預期目標
                </p>
              </div>

              {/* 步驟 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">智能媒合</h3>
                <p className="text-sm text-muted-foreground">
                  平台根據需求特性，智能推薦合適的創作者與媒體夥伴
                </p>
              </div>

              {/* 步驟 3 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">合作洽談</h3>
                <p className="text-sm text-muted-foreground">
                  雙方透過平台溝通協商，確定合作細節與執行時程
                </p>
              </div>

              {/* 步驟 4 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="font-semibold mb-2">內容產出</h3>
                <p className="text-sm text-muted-foreground">
                  創作者按照協議製作高品質內容，供應商提供必要支持
                </p>
              </div>
            </div>

            {/* 詳細流程說明 */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">供應商端流程</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">註冊並完善企業資訊</h4>
                      <p className="text-sm text-muted-foreground">建立企業檔案，上傳相關證照與服務介紹</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">發布行銷任務</h4>
                      <p className="text-sm text-muted-foreground">詳細描述合作需求、預算範圍、期望成果</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">審核創作者申請</h4>
                      <p className="text-sm text-muted-foreground">檢視申請者作品集、過往案例與粉絲數據</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">確定合作細節</h4>
                      <p className="text-sm text-muted-foreground">簽署合作協議，安排體驗時程與內容規格</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      5
                    </div>
                    <div>
                      <h4 className="font-medium">提供服務支持</h4>
                      <p className="text-sm text-muted-foreground">協助創作者體驗服務，提供相關素材與資訊</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      6
                    </div>
                    <div>
                      <h4 className="font-medium">驗收成果與結算</h4>
                      <p className="text-sm text-muted-foreground">確認內容品質，完成費用結算與效果評估</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">創作者端流程</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">完善個人檔案</h4>
                      <p className="text-sm text-muted-foreground">建立作品集，展示創作風格與專業領域</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">瀏覽並申請任務</h4>
                      <p className="text-sm text-muted-foreground">篩選符合興趣的合作機會，提交申請與企劃</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">等待審核結果</h4>
                      <p className="text-sm text-muted-foreground">供應商評估申請內容，決定是否進行合作</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">執行合作內容</h4>
                      <p className="text-sm text-muted-foreground">按約定體驗服務，創作高品質內容</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      5
                    </div>
                    <div>
                      <h4 className="font-medium">提交成果作品</h4>
                      <p className="text-sm text-muted-foreground">上傳最終內容，等待供應商確認驗收</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      6
                    </div>
                    <div>
                      <h4 className="font-medium">獲得報酬與評價</h4>
                      <p className="text-sm text-muted-foreground">完成合作獲得相應報酬，建立良好信用記錄</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 媒體平台角色 */}
            <div className="mt-16 bg-white rounded-lg border p-8">
              <h3 className="text-2xl font-semibold mb-6 text-center">媒體平台角色與服務</h3>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">專業媒合</h4>
                  <p className="text-sm text-muted-foreground">
                    協助供應商找到最適合的創作者，提供專業的合作建議
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">品質把關</h4>
                  <p className="text-sm text-muted-foreground">
                    監督合作過程，確保內容品質符合預期標準
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">數據分析</h4>
                  <p className="text-sm text-muted-foreground">
                    提供詳細的成效報告，協助優化後續合作策略
                  </p>
                </div>
              </div>
            </div>

            {/* 服務保障 */}
            <div className="mt-16">
              <h3 className="text-2xl font-semibold mb-8 text-center">平台服務保障</h3>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-6 rounded-lg border">
                  <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">資金託管</h4>
                  <p className="text-sm text-muted-foreground">
                    平台代管合作資金，確保雙方權益受到保障
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-lg border">
                  <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.012l-8.718 15.09L12 21.988l8.718-3.886L12 2.012z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">糾紛處理</h4>
                  <p className="text-sm text-muted-foreground">
                    專業客服團隊協助處理合作過程中的各種問題
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-lg border">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">身份驗證</h4>
                  <p className="text-sm text-muted-foreground">
                    嚴格的實名認證制度，確保平台用戶真實可靠
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-lg border">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">24/7 支援</h4>
                  <p className="text-sm text-muted-foreground">
                    全天候客服支援，隨時協助解決使用上的疑問
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

