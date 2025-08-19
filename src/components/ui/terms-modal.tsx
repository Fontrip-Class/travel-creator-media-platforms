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
          <h3 className="text-lg font-semibold">觀光署旅遊服務與行銷創作資源管理與媒合平台</h3>
          
          <div className="space-y-3 text-sm">
            <section>
              <h4 className="font-medium">1. 服務說明</h4>
              <p className="text-muted-foreground">
                本平台提供供應商、景點、創作者與媒體之媒合服務，促進觀光產業內容創作與合作
              </p>
            </section>

            <section>
              <h4 className="font-medium">2. 用戶責任</h4>
              <p className="text-muted-foreground">
                用戶應提供真實、正確的資料，遵守相關規定，不得從事違法或不當行為
              </p>
            </section>

            <section>
              <h4 className="font-medium">3. 內容規範</h4>
              <p className="text-muted-foreground">
                用戶發布內容應符合平台規範，不得包含違法、歧視、色情等不當內容
              </p>
            </section>

            <section>
              <h4 className="font-medium">4. 智慧財產權</h4>
              <p className="text-muted-foreground">
                用戶保留其創作內容的智慧財產權，但授權平台在服務範圍內使用
              </p>
            </section>

            <section>
              <h4 className="font-medium">5. 條款變更</h4>
              <p className="text-muted-foreground">
                平台保留修改或終止服務的權利，並會通知用戶
              </p>
            </section>

            <section>
              <h4 className="font-medium">6. 免責聲明</h4>
              <p className="text-muted-foreground">
                平台不承擔因用戶行為或第三方因素造成的任何損失或損害
              </p>
            </section>

            <section>
              <h4 className="font-medium">7. 爭議解決</h4>
              <p className="text-muted-foreground">
                因本條款產生的爭議應優先通過溝通協商解決，必要時可訴諸法律途徑
              </p>
            </section>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">觀光署旅遊服務與行銷創作資源管理與媒合平台隱私政策</h3>
          
          <div className="space-y-3 text-sm">
            <section>
              <h4 className="font-medium">1. 資料收集</h4>
              <p className="text-muted-foreground">
                我們收集您註冊時、使用時、設備資訊等，用於提供更好的用戶體驗
              </p>
            </section>

            <section>
              <h4 className="font-medium">2. 資料使用</h4>
              <p className="text-muted-foreground">
                這些資料主要用於帳戶管理、客戶支援、安全防護等服務
              </p>
            </section>

            <section>
              <h4 className="font-medium">3. 資料分享</h4>
              <p className="text-muted-foreground">
                除非法律要求或確實需要，我們不會與第三方分享您的個人資料
              </p>
            </section>

            <section>
              <h4 className="font-medium">4. 資料安全</h4>
              <p className="text-muted-foreground">
                我們採用適當的技術與組織措施保護您的資料安全，防止未經授權存取
              </p>
            </section>

            <section>
              <h4 className="font-medium">5. 資料保留</h4>
              <p className="text-muted-foreground">
                我們會根據需要保留您的資料，不需要時資料將被安全刪除
              </p>
            </section>

            <section>
              <h4 className="font-medium">6. 您的權利</h4>
              <p className="text-muted-foreground">
                您有權查看、更正或刪除您的個人資料，以及對資料處理的限制
              </p>
            </section>

            <section>
              <h4 className="font-medium">7. Cookie使用</h4>
              <p className="text-muted-foreground">
                我們使用Cookie等類似技術改善網站體驗，您可以在瀏覽器設定中管理Cookie偏好
              </p>
            </section>

            <section>
              <h4 className="font-medium">8. 政策更新</h4>
              <p className="text-muted-foreground">
                我們可能會更新本隱私政策，重大變更將通過電子郵件或網站公告通知
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
