import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/lib/api';
import {
    Clock,
    DollarSign,
    FileText,
    Link as LinkIcon,
    Send
} from 'lucide-react';
import React, { useState } from 'react';

interface TaskApplicationFormProps {
  task: any;
  onApplicationSubmitted?: () => void;
  onCancel?: () => void;
}

/**
 * 任務申請表單組件
 * 創作者用來申請任務的表單
 */
export function TaskApplicationForm({ task, onApplicationSubmitted, onCancel }: TaskApplicationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    proposal: '',
    proposed_budget: task.budget_min || 0,
    estimated_duration: '',
    portfolio_samples: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.proposal.trim()) {
      toast({
        title: '表單錯誤',
        description: '請填寫申請提案',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.request(`/workflow/tasks/${task.id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          proposal: formData.proposal,
          proposed_budget: formData.proposed_budget,
          estimated_duration: formData.estimated_duration,
          portfolio_samples: formData.portfolio_samples.filter(link => link.trim())
        })
      });

      if (response.success) {
        toast({
          title: '申請成功',
          description: '您的申請已提交，請等待供應商審核'
        });
        onApplicationSubmitted?.();
      } else {
        throw new Error(response.message || '申請提交失敗');
      }

    } catch (error: any) {
      toast({
        title: '申請失敗',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPortfolioLink = () => {
    setFormData(prev => ({
      ...prev,
      portfolio_samples: [...prev.portfolio_samples, '']
    }));
  };

  const updatePortfolioLink = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      portfolio_samples: prev.portfolio_samples.map((link, i) => i === index ? value : link)
    }));
  };

  const removePortfolioLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio_samples: prev.portfolio_samples.filter((_, i) => i !== index)
    }));
  };

  if (user?.role !== 'creator') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">只有創作者可以申請任務</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          申請任務
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 任務概覽 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>預算: NT$ {task.budget_min?.toLocaleString()} - {task.budget_max?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>截止: {new Date(task.deadline).toLocaleDateString('zh-TW')}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span>類型: {task.content_types?.join(', ')}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 申請提案 */}
          <div className="space-y-2">
            <Label htmlFor="proposal">申請提案 *</Label>
            <Textarea
              id="proposal"
              value={formData.proposal}
              onChange={(e) => setFormData(prev => ({ ...prev, proposal: e.target.value }))}
              placeholder="請詳細說明您的創作計劃、執行方式、預期成果等..."
              rows={6}
              required
            />
            <p className="text-xs text-gray-500">
              建議包含：創作理念、執行計劃、時程安排、預期成果等
            </p>
          </div>

          {/* 預算報價 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposed_budget">預算報價 (NT$) *</Label>
              <Input
                id="proposed_budget"
                type="number"
                value={formData.proposed_budget}
                onChange={(e) => setFormData(prev => ({ ...prev, proposed_budget: parseInt(e.target.value) || 0 }))}
                min={task.budget_min}
                max={task.budget_max}
                required
              />
              <p className="text-xs text-gray-500">
                預算範圍: NT$ {task.budget_min?.toLocaleString()} - {task.budget_max?.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_duration">預估工作時間</Label>
              <Input
                id="estimated_duration"
                value={formData.estimated_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                placeholder="例如：7-10個工作天"
              />
            </div>
          </div>

          {/* 作品集連結 */}
          <div className="space-y-2">
            <Label>相關作品集連結</Label>
            {formData.portfolio_samples.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={link}
                  onChange={(e) => updatePortfolioLink(index, e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                {formData.portfolio_samples.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePortfolioLink(index)}
                  >
                    移除
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPortfolioLink}
              className="w-full"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              新增作品集連結
            </Button>
          </div>

          {/* 提交按鈕 */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
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
                  提交申請
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
