import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { Star, ThumbsUp, ThumbsDown, Send, CheckCircle } from "lucide-react";

interface RatingCategory {
  id: string;
  name: string;
  rating: number;
}

export default function Rating() {
  const { id: taskId, type } = useParams(); // type: 'supplier' or 'creator'
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ratings, setRatings] = useState<RatingCategory[]>([
    { id: "quality", name: "作品品質", rating: 0 },
    { id: "communication", name: "溝通效率", rating: 0 },
    { id: "timeline", name: "時程掌握", rating: 0 },
    { id: "professional", name: "專業度", rating: 0 }
  ]);
  
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 模擬任務和合作對象資料
  const taskInfo = {
    title: "台東秋季活動宣傳",
    completedDate: "2024-11-20",
    collaborator: type === "supplier" ? "安妮太太" : "台東縣政府觀光處",
    role: type === "supplier" ? "創作者" : "委託方"
  };

  const handleRatingChange = (categoryId: string, rating: number) => {
    setRatings(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, rating } : cat
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (averageRating === 0) {
      toast({
        title: "錯誤",
        description: "請至少評分一個項目",
        variant: "destructive"
      });
      return;
    }

    if (recommend === null) {
      toast({
        title: "錯誤",
        description: "請選擇是否推薦",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 準備API資料，確保與後端規格一致
      const apiData = {
        rating: Math.round(averageRating),
        feedback: comment,
        recommend: recommend,
        category_ratings: ratings.map(cat => ({
          category: cat.name,
          rating: cat.rating
        }))
      };

      // 調用API提交評分
      const response = await apiService.rateTask(taskId, apiData);
      
      if (response.success) {
        toast({
          title: "評分成功",
          description: "您的評價已成功提交，感謝您的回饋",
        });
        
        // 導航到任務列表頁面
        navigate("/dashboard/tasks");
      } else {
        throw new Error(response.message || "評分失敗");
      }
    } catch (error: any) {
      // 保留用戶填寫的資料，顯示詳細錯誤訊息
      toast({
        title: "評分失敗",
        description: error.message || "評分過程中發生錯誤，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = ratings.reduce((sum, cat) => sum + cat.rating, 0) / ratings.length;
  const isFormValid = ratings.every(cat => cat.rating > 0) && recommend !== null;

  const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className={`text-2xl transition-colors ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          } hover:text-yellow-400`}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <SEO 
        title={`評分 - ${taskInfo.title}`}
        description={`為${taskInfo.collaborator}的${taskInfo.title}任務進行評分`}
      />

      <div className="space-y-6">
        {/* 任務資訊 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">任務評分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{taskInfo.title}</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  合作對象：{taskInfo.collaborator} ({taskInfo.role})
                </div>
                <div className="text-sm text-muted-foreground">
                  完成日期：{taskInfo.completedDate}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 評分表單 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">評分表單</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 各項評分 */}
              <div className="space-y-4">
                {ratings.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <Label className="text-base font-medium">{category.name}</Label>
                    <StarRating 
                      rating={category.rating} 
                      onRatingChange={(rating) => handleRatingChange(category.id, rating)} 
                    />
                  </div>
                ))}
              </div>

              <Separator />

              {/* 推薦選擇 */}
              <div>
                <Label className="text-base font-medium">您會推薦這個合作夥伴嗎？</Label>
                <div className="flex gap-4 mt-3">
                  <Button
                    type="button"
                    variant={recommend === true ? "default" : "outline"}
                    onClick={() => setRecommend(true)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    推薦
                  </Button>
                  <Button
                    type="button"
                    variant={recommend === false ? "default" : "outline"}
                    onClick={() => setRecommend(false)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    不推薦
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 評論 */}
              <div>
                <Label htmlFor="comment" className="text-base font-medium">
                  額外評論（選填）
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="請分享您的合作體驗和建議"
                  rows={4}
                  className="mt-2"
                />
              </div>

              <Separator />

              {/* 總評分顯示 */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                </div>
                <div className="text-sm text-muted-foreground">平均評分</div>
              </div>

              {/* 提交按鈕 */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      提交評分
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
