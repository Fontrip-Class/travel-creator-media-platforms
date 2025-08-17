import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";

interface TermsModalProps {
  type: "terms" | "privacy";
  children: React.ReactNode;
}

export function TermsModal({ type, children }: TermsModalProps) {
  const [open, setOpen] = useState(false);

  const getTitle = () => {
    return type === "terms" ? "服務條款" : "隱私政策";
  };

  const getContent = () => {
    if (type === "terms") {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">旅遊創作者媒體平台服務條款</h3>
          
          <div className="space-y-3 text-sm">
            <section>
              <h4 className="font-medium">1. 服務說明</h4>
              <p className="text-muted-foreground">
                本平台提供旅遊服務供應商、創作者和媒體之間的媒合服務，促進旅遊產業的內容創作和行銷合作。
              </p>
            </section>

            <section>
              <h4 className="font-medium">2. 用戶責任</h4>
              <p className="text-muted-foreground">
                用戶應提供真實、準確的資料，遵守相關法規，不得從事違法或不當行為。
              </p>
            </section>

            <section>
              <h4 className="font-medium">3. 內容規範</h4>
              <p className="text-muted-foreground">
                用戶發布的內容應符合平台規範，不得包含違法、歧視、色情等不當內容。
              </p>
            </section>

            <section>
              <h4 className="font-medium">4. 智慧財產權</h4>
              <p className="text-muted-foreground">
                用戶保留其原創內容的智慧財產權，但授權平台在服務範圍內使用。
              </p>
            </section>

            <section>
              <h4 className="font-medium">5. 服務變更</h4>
              <p className="text-muted-foreground">
                平台保留隨時修改或終止服務的權利，將提前通知用戶。
              </p>
            </section>

            <section>
              <h4 className="font-medium">6. 免責聲明</h4>
              <p className="text-muted-foreground">
                平台不承擔因用戶行為或第三方服務造成的任何損失或損害。
              </p>
            </section>

            <section>
              <h4 className="font-medium">7. 爭議解決</h4>
              <p className="text-muted-foreground">
                因本服務產生的爭議，應優先通過協商解決，必要時可訴諸法律途徑。
              </p>
            </section>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">旅遊創作者媒體平台隱私政策</h3>
          
          <div className="space-y-3 text-sm">
            <section>
              <h4 className="font-medium">1. 資料收集</h4>
              <p className="text-muted-foreground">
                我們收集您提供的註冊資料、使用記錄、設備資訊等，用於提供服務和改善用戶體驗。
              </p>
            </section>

            <section>
              <h4 className="font-medium">2. 資料使用</h4>
              <p className="text-muted-foreground">
                您的資料主要用於帳戶管理、服務提供、客戶支援、安全防護和服務改善。
              </p>
            </section>

            <section>
              <h4 className="font-medium">3. 資料分享</h4>
              <p className="text-muted-foreground">
                除法律要求或您明確同意外，我們不會與第三方分享您的個人資料。
              </p>
            </section>

            <section>
              <h4 className="font-medium">4. 資料安全</h4>
              <p className="text-muted-foreground">
                我們採用適當的技術和組織措施保護您的資料安全，防止未經授權的存取。
              </p>
            </section>

            <section>
              <h4 className="font-medium">5. 資料保留</h4>
              <p className="text-muted-foreground">
                我們僅在必要期間內保留您的資料，超出期限的資料將被安全刪除。
              </p>
            </section>

            <section>
              <h4 className="font-medium">6. 您的權利</h4>
              <p className="text-muted-foreground">
                您有權存取、更正、刪除您的個人資料，以及反對或限制資料處理。
              </p>
            </section>

            <section>
              <h4 className="font-medium">7. Cookie使用</h4>
              <p className="text-muted-foreground">
                我們使用Cookie和類似技術改善網站功能，您可以在瀏覽器設定中管理Cookie偏好。
              </p>
            </section>

            <section>
              <h4 className="font-medium">8. 政策更新</h4>
              <p className="text-muted-foreground">
                我們可能會更新本隱私政策，重大變更將通過電子郵件或網站公告通知您。
              </p>
            </section>
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {getContent()}
        </ScrollArea>
        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)}>
            關閉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
