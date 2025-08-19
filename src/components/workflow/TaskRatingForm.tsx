import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/lib/api';
import { Send, Star } from 'lucide-react';
import React, { useState } from 'react';

interface TaskRatingFormProps {
  taskId: string;
  targetUser: {
    id: string;
    username: string;
    role: string;
  };
  onRatingSubmitted?: () => void;
  onCancel?: () => void;
}

/**
 * 任務評分表單組件
 * 用於任務完成後的雙方互評
 */
export function TaskRatingForm({ taskId, targetUser, onRatingSubmitted, onCancel }: TaskRatingFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: '評分錯誤',
        description: '請選擇評分星數',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.request(`/workflow/tasks/${taskId}/rating/${targetUser.id}`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          comment: comment.trim()
        })
      });

      if (response.success) {
        toast({
          title: '評分成功',
          description: '感謝您的評分，這有助於提升平台服務品質'
        });
        onRatingSubmitted?.();
      } else {
        throw new Error(response.message || '評分提交失敗');
      }

    } catch (error: any) {
      toast({
        title: '評分失敗',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      supplier: '供應商',
      creator: '創作者',
      media: '媒體',
      admin: '管理員'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRatingDescription = (rating: number) => {
    const descriptions = {
      1: '非常不滿意',
      2: '不滿意',
      3: '普通',
      4: '滿意',
      5: '非常滿意'
    };
    return descriptions[rating as keyof typeof descriptions] || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          評分 {getRoleLabel(targetUser.role)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 評分對象資訊 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{targetUser.username}</h3>
                <p className="text-sm text-gray-600">{getRoleLabel(targetUser.role)}</p>
              </div>
            </div>
          </div>

          {/* 星級評分 */}
          <div className="space-y-3">
            <Label>整體滿意度 *</Label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {rating > 0 && `${rating}/5 - ${getRatingDescription(rating)}`}
              </span>
            </div>
          </div>

          {/* 評分說明 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">評分標準參考：</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>溝通配合度</li>
                <li>專業程度</li>
                <li>交付品質</li>
                <li>時程掌控</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">評分影響：</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>影響用戶信譽評級</li>
                <li>影響未來合作機會</li>
                <li>幫助其他用戶參考</li>
                <li>提升平台服務品質</li>
              </ul>
            </div>
          </div>

          {/* 評價留言 */}
          <div className="space-y-2">
            <Label htmlFor="comment">詳細評價（選填）</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="分享您的合作體驗，幫助其他用戶了解..."
              rows={4}
            />
            <p className="text-xs text-gray-500">
              您的評價將幫助其他用戶做出更好的選擇
            </p>
          </div>

          {/* 提交按鈕 */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                稍後評分
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  提交中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  提交評分
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
