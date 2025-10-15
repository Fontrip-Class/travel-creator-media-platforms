import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Megaphone, FileText, Search, CheckCircle2, MessageSquare, Star, Shield } from "lucide-react";

const PlatformGuide = () => {
  return (
    <main className="container py-10 max-w-4xl">
      <SEO 
        title="平台功能說明文件" 
        description="旅遊創作者媒合平台的完整功能說明，包含平台目的、角色介紹及合作流程"
      />

      {/* 標題 */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">平台功能說明文件</h1>
        <p className="text-lg text-muted-foreground">
          旅遊創作者媒合平台 - 串聯供應商、創作者與媒體的專業服務平台
        </p>
      </header>

      {/* 1. 平台建置目的 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
            <FileText className="size-4 text-primary" />
          </div>
          一、平台建置目的
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">旅遊創作者媒合平台</strong>致力於打造台灣觀光產業的專業媒合生態系統，透過數位化服務整合三大核心角色：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-foreground">供應商</strong>：提供旅遊服務、景點、住宿等資源</li>
                <li><strong className="text-foreground">創作者</strong>：創作高品質旅遊內容、分享旅遊經驗</li>
                <li><strong className="text-foreground">媒體</strong>：聚合優質內容、進行品牌行銷推廣</li>
              </ul>
              <p>
                平台透過<strong className="text-foreground">任務驅動的合作模式</strong>，讓供應商能夠精準找到適合的創作者進行內容行銷，
                創作者獲得穩定的合作機會與收益，媒體則能取得授權素材進行推廣，形成三方共贏的商業生態。
              </p>
              <div className="bg-primary/5 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  <strong className="text-foreground">核心價值：</strong>
                  降低旅遊產業的行銷成本、提升內容品質、促進產業數位轉型，
                  同時為創作者提供專業的變現管道，推動台灣觀光產業的永續發展。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. 三個角色介紹 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Users className="size-4 text-primary" />
          </div>
          二、平台角色介紹與功能
        </h2>

        <div className="space-y-6">
          {/* 供應商 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="size-6 text-primary" />
                </div>
                <div>
                  <CardTitle>供應商（Supplier）</CardTitle>
                  <CardDescription>提供旅遊服務、產品、體驗的企業或個人</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">角色定義</h4>
                  <p className="text-sm text-muted-foreground">
                    供應商是提供旅遊相關服務、產品或體驗的業者，包含景點、主題樂園、飯店民宿、旅行社、
                    餐廳美食、紀念品店、體驗活動等各類型觀光業者。
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">核心功能</h4>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>發布行銷任務需求</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>瀏覽創作者作品集</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>選擇合作創作者</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>審核創作內容品質</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>管理合作訂單</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>查看數據分析報表</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 創作者 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Megaphone className="size-6 text-primary" />
                </div>
                <div>
                  <CardTitle>創作者（Creator）</CardTitle>
                  <CardDescription>創作旅遊內容、分享旅遊經驗的個人或團隊</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">角色定義</h4>
                  <p className="text-sm text-muted-foreground">
                    創作者是專注於旅遊內容創作的個人或團隊，包含部落客、YouTuber、攝影師、
                    社群媒體經營者等，透過文章、影片、照片等多元形式分享旅遊經驗與資訊。
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">核心功能</h4>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>瀏覽行銷任務列表</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>申請合作機會</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>管理作品集展示</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>上傳創作內容</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>追蹤合作進度</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>管理收益與分成</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 媒體 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="size-6 text-primary" />
                </div>
                <div>
                  <CardTitle>媒體（Media）</CardTitle>
                  <CardDescription>媒體平台、行銷機構、廣告代理商</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">角色定義</h4>
                  <p className="text-sm text-muted-foreground">
                    媒體包含各類媒體平台、行銷代理商、廣告公司等，負責內容聚合、品牌推廣、
                    廣告投放等業務，協助放大旅遊內容的傳播效益。
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">核心功能</h4>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>搜尋高品質素材</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>依條件篩選內容</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>確認授權條款</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>下載素材資源</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>管理品牌合作</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>追蹤下載記錄</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. 行銷委託任務合作流程 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
            <MessageSquare className="size-4 text-primary" />
          </div>
          三、行銷委託任務合作流程
        </h2>

        <div className="space-y-6">
          {/* 整體流程 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">完整合作流程</CardTitle>
              <CardDescription>從任務發布到專案完成的完整步驟</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "任務發布",
                    desc: "供應商發布行銷任務需求，設定預算、目標及期望成果",
                    icon: FileText,
                  },
                  {
                    step: 2,
                    title: "創作者申請",
                    desc: "創作者瀏覽任務列表，提交作品集與合作提案",
                    icon: Search,
                  },
                  {
                    step: 3,
                    title: "媒合確認",
                    desc: "供應商審核申請，選定合作創作者並確認合作細節",
                    icon: CheckCircle2,
                  },
                  {
                    step: 4,
                    title: "內容創作",
                    desc: "創作者執行任務，創作並上傳內容成果",
                    icon: Star,
                  },
                  {
                    step: 5,
                    title: "審核驗收",
                    desc: "供應商審核內容品質，確認符合任務需求",
                    icon: Shield,
                  },
                  {
                    step: 6,
                    title: "專案完成",
                    desc: "雙方確認完成，平台處理款項結算並釋出素材授權",
                    icon: CheckCircle2,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <item.icon className="size-5 text-primary mt-1 shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 供應商視角流程 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                供應商操作流程
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 1：</span>
                  <span>登入平台後台，點擊「發布任務」填寫行銷需求詳情（目標、預算、時程、素材規格等）</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 2：</span>
                  <span>等待創作者申請，在「任務管理」中查看申請者的作品集與提案內容</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 3：</span>
                  <span>選擇合適的創作者，進行合作確認並簽署線上合約</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 4：</span>
                  <span>追蹤專案進度，與創作者保持溝通，確保內容方向符合期望</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 5：</span>
                  <span>審核創作者上傳的成果，提出修改建議或確認驗收</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 6：</span>
                  <span>驗收完成後，平台自動處理款項並釋出素材使用權，可於後台下載所有成果檔案</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* 創作者視角流程 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="size-5 text-primary" />
                創作者操作流程
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 1：</span>
                  <span>完善個人檔案與作品集，上傳過往代表作品並設定專長領域</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 2：</span>
                  <span>在「任務市場」瀏覽供應商發布的行銷需求，使用篩選條件找到適合的任務</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 3：</span>
                  <span>提交合作提案，說明創作想法、預計交付時程及相關經驗</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 4：</span>
                  <span>獲選後與供應商確認合作細節，簽署線上合約並開始創作</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 5：</span>
                  <span>上傳創作成果至平台，等待供應商審核回饋</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground shrink-0">步驟 6：</span>
                  <span>完成修改（如需要）並通過驗收後，平台自動撥款至帳戶，同時釋出素材授權供媒體使用</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* 媒體角色說明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="size-5 text-primary" />
                媒體平台參與方式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  媒體平台在合作流程中扮演<strong className="text-foreground">內容推廣者</strong>的角色。
                  當供應商與創作者的任務完成驗收後，創作內容將自動進入素材庫供媒體使用：
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                    <span>媒體可透過關鍵字、地點、主題等條件搜尋所需素材</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                    <span>查看授權條款（使用範圍、編輯權限、註明要求等）</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                    <span>確認授權後即可下載高品質素材，系統自動記錄使用紀錄</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                    <span>遵守授權規範進行內容推廣，助力旅遊產業品牌曝光</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 平台保障 */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                平台服務保障
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">資金託管機制：</strong>
                    <p className="text-muted-foreground mt-1">
                      供應商預先託管費用於平台，確保創作者權益，驗收通過後自動撥款
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">爭議處理機制：</strong>
                    <p className="text-muted-foreground mt-1">
                      平台提供客觀第三方調解服務，保障雙方合理權益
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">身份認證系統：</strong>
                    <p className="text-muted-foreground mt-1">
                      所有用戶需通過實名認證，確保合作對象真實可靠
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">全天候客服支援：</strong>
                    <p className="text-muted-foreground mt-1">
                      提供 24/7 線上客服，協助解決合作過程中的各種問題
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default PlatformGuide;
