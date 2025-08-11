import { SEO } from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <main className="min-h-screen">
      <SEO
        title="常見問題 FAQ｜旅遊行銷媒合平台"
        description="關於媒合流程、費用與授權、註冊與資料審核、下載與使用等常見問題解答。"
      />
      <header className="bg-hero text-white">
        <div className="container py-14">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">常見問題（FAQ）</h1>
          <p className="opacity-90 max-w-2xl">快速了解平台的使用方式與規則。</p>
        </div>
      </header>

      <section className="container py-10">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>平台是否收費？如何計價？</AccordionTrigger>
            <AccordionContent>
              目前平台不收取使用費或抽成。供應商若提供合作預算，會直接於任務卡與詳情中顯示，創作者可依預算與需求申請。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>如何成為創作者並提升媒合率？</AccordionTrigger>
            <AccordionContent>
              註冊後建立個人資料、專長領域與作品集，並盡量完整填寫地區、檔期、擅長內容形式等資訊，系統即可更準確推薦任務。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>任務申請與審核流程是什麼？</AccordionTrigger>
            <AccordionContent>
              創作者從任務列表進入申請，提交提案與相關作品連結；供應商於後台審核與聯繫，確認合作後即可開始執行並於系統內回傳成果。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>素材授權包含哪些條件？</AccordionTrigger>
            <AccordionContent>
              我們預設「使用性質（商用/編輯用）」、「期限（單次/30天/永久）」、「範圍（台灣/全球）」與「媒介（網路/社群/廣告/戶外）」四大選項，可於素材詳情清楚顯示。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>媒體如何下載素材？</AccordionTrigger>
            <AccordionContent>
              於素材庫以關鍵字與條件搜尋 → 進入詳情頁確認授權條件 → 按下載並同意條款，系統將記錄下載紀錄以利後續追蹤。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>資料審核與隱私如何保障？</AccordionTrigger>
            <AccordionContent>
              註冊資料與上傳內容需遵守平台規範；個資僅用於媒合與通知用途，不會對外公開。詳細條款將於正式上線前公告。
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </main>
  );
}
