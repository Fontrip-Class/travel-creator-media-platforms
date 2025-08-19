import { SEO } from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <main className="min-h-screen">
      <SEO
        title="常見問題 FAQ｜觀光署旅遊平台"
        description="關於媒體流程、費用計算、註冊資料審核、下載使用等常見問題解答"
      />
      <header className="bg-hero text-white">
        <div className="container py-14">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">常見問題（FAQ）</h1>
          <p className="opacity-90 max-w-2xl">快速了解平台使用相關問題</p>
        </div>
      </header>

      <section className="container py-10">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>平台是否收費？如何計算？</AccordionTrigger>
            <AccordionContent>
              本平台不收使用費或抽成。創作費用和預算會直接於任務詳情中顯示，創作者可依預算需求申請。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>如何成為創作者並開始媒合？</AccordionTrigger>
            <AccordionContent>
              註冊後建立個人資料，選擇創作類型並盡可能詳細填寫地區、擅長內容形式等資料，系統即能更準確推薦任務。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>任務申請的審核流程是什麼？</AccordionTrigger>
            <AccordionContent>
              創作者瀏覽任務列表，提交申請方案和創作作品；任務發布者進行審核聯繫，確認合作細節並於系統中更新狀態。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>素材包含哪些條件？</AccordionTrigger>
            <AccordionContent>
              我們設定「使用性質（商業/編輯/個人）」、「使用次數/30天/永久）」、「使用地區（台灣/全球）」、「使用媒體（網路/社群/電視/廣播）」等大選項，於素材詳情清楚顯示。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>媒體如何下載素材？</AccordionTrigger>
            <AccordionContent>
              素材庫以檔案列表形式呈現，點入詳情確認版權資訊後即可下載並同意條款，系統會記錄下載紀錄以便後續追蹤。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>資料審核和隱私如何保護？</AccordionTrigger>
            <AccordionContent>
              註冊資料和內容需符合平台規範；個人資料使用需告知用途，不會對外洩露詳細資料，有正式法律條款保護。
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </main>
  );
}
