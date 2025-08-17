import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, ThumbsUp, MessageSquare, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    { id: "quality", name: "作品質量", rating: 0 },
    { id: "communication", name: "溝通配合", rating: 0 },
    { id: "timeline", name: "時程掌握", rating: 0 },
    { id: "professional", name: "專業度", rating: 0 }
  ]);
  
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 模擬任務和評價對象數據
  const taskInfo = {
    title: "台東季節活動宣傳",
    completedDate: "2024-11-20",
    collaborator: type === "supplier" ? "優尼太太" : "台東縣政府觀光處",
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
      // 準備API數據，確保與後端規格一致
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
          description: "您的評價已成功提交，感謝您的回饋！",
        });
        
        // 導航到任務列表頁面
        navigate("/dashboard/tasks");
      } else {
        throw new Error(response.message || "評分失敗");
      }
    } catch (error: any) {
      // 保留用戶填寫的數據，顯示詳細錯誤訊息
      toast({
        title: "評分失敗",
        description: error.message || "評分過程中發生錯誤，請稍後重試",
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
          className="transition-colors"
        >
          <Star
            className={`w-6 h-6 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <SEO 
        title={`評價 - ${taskInfo.title}`}
        description={`為${taskInfo.title}任務進行評價`}
      />

      <div className="space-y-6">
        {/* 任務概述 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">任務評價</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{taskInfo.title}</h3>
                <p className="text-sm text-muted-foreground">完成日期：{taskInfo.completedDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">評價對象：</span>
                <Badge variant="outline">{taskInfo.role}</Badge>
                <span className="font-medium">{taskInfo.collaborator}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 評分表單 */}
        <Card>
          <CardHeader>
            <CardTitle>詳細評分</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 各項評分 */}
              <div className="space-y-4">
                {ratings.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-base">{category.name}</Label>
                      <span className="text-sm text-muted-foreground">
                        {category.rating > 0 ? `${category.rating}/5` : "未評分"}
                      </span>
                    </div>
                    <StarRating
                      rating={category.rating}
                      onRatingChange={(rating) => handleRatingChange(category.id, rating)}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              {/* 整體評價 */}
              <div className="space-y-4">
                <Label className="text-base">整體評價</Label>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary">
                    {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* 推薦度 */}
              <div className="space-y-3">
                <Label className="text-base">是否推薦其他人與此{taskInfo.role}合作？</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRecommend(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      recommend === true
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    推薦
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommend(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      recommend === false
                        ? "bg-red-50 border-red-500 text-red-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 rotate-180" />
                    不推薦
                  </button>
                </div>
              </div>

              <Separator />

              {/* 評價留言 */}
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  評價留言（選填）
                </Label>
                <Textarea
                  id="comment"
                  placeholder="分享您的合作體驗，幫助其他用戶了解..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">
                  留言長度：最多500字符，請分享您的真實體驗
                </p>
              </div>

              {/* 提交按鈕 */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  稍後評價
                </Button>
                <Button type="submit" disabled={!isFormValid}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  提交評價
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 評價說明 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• 您的評價將幫助其他用戶做出更好的選擇</p>
              <p>• 評價提交後無法修改，請仔細確認</p>
              <p>• 請客觀公正地評價，惡意評價將被處理</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}