import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/lib/api';
import {
    AlertCircle,
    FileText,
    Image,
    Music,
    Send,
    Upload,
    Video
} from 'lucide-react';
import React, { useState } from 'react';

interface WorkSubmissionFormProps {
  taskId: string;
  task: any;
  onWorkSubmitted?: () => void;
  onCancel?: () => void;
}

/**
 * 作品提交表單組件
 * 創作者用來提交完成作品的表單
 */
export function WorkSubmissionForm({ taskId, task, onWorkSubmitted, onCancel }: WorkSubmissionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    asset_type: 'image',
    file_url: '',
    thumbnail_url: '',
    file_size: 0,
    tags: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.file_url.trim()) {
      toast({
        title: '表單錯誤',
        description: '請填寫作品標題和檔案連結',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.request(`/workflow/tasks/${taskId}/submit-work`, {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          asset_type: formData.asset_type,
          file_url: formData.file_url,
          thumbnail_url: formData.thumbnail_url,
          file_size: formData.file_size,
          tags: formData.tags.filter(tag => tag.trim())
        })
      });

      if (response.success) {
        toast({
          title: '提交成功',
          description: '作品已提交，請等待供應商審核'
        });
        onWorkSubmitted?.();
      } else {
        throw new Error(response.message || '作品提交失敗');
      }

    } catch (error: any) {
      toast({
        title: '提交失敗',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  if (user?.role !== 'creator') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">只有創作者可以提交作品</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          提交作品
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 任務資訊提醒 */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">任務要求</h3>
            <p className="text-sm text-blue-800 mb-2">{task.requirements}</p>
            <div className="flex flex-wrap gap-2">
              {task.deliverables?.map((deliverable: string, index: number) => (
                <Badge key={index} variant="outline" className="text-blue-700">
                  {deliverable}
                </Badge>
              ))}
            </div>
          </div>

          {/* 作品基本資訊 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">作品標題 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="為您的作品取一個吸引人的標題"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">作品說明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述您的創作理念、拍攝過程、技術特點等..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset_type">作品類型 *</Label>
                <select
                  id="asset_type"
                  value={formData.asset_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, asset_type: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="image">圖片</option>
                  <option value="video">影片</option>
                  <option value="audio">音頻</option>
                  <option value="document">文件</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file_size">檔案大小 (MB)</Label>
                <Input
                  id="file_size"
                  type="number"
                  value={formData.file_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_size: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* 檔案連結 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file_url">作品檔案連結 *</Label>
              <Input
                id="file_url"
                value={formData.file_url}
                onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                placeholder="https://drive.google.com/... 或其他雲端儲存連結"
                required
              />
              <p className="text-xs text-gray-500">
                請提供 Google Drive、Dropbox 或其他雲端儲存的分享連結
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">縮圖連結（選填）</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                placeholder="作品預覽圖的連結"
              />
            </div>
          </div>

          {/* 標籤 */}
          <div className="space-y-2">
            <Label>作品標籤</Label>
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                  placeholder="例如：風景攝影、台北101、夜景"
                  className="flex-1"
                />
                {formData.tags.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTag(index)}
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
              onClick={addTag}
              className="w-full"
            >
              新增標籤
            </Button>
          </div>

          {/* 提交說明 */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">提交須知：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>提交後將進入供應商審核階段</li>
                  <li>請確保作品符合任務要求</li>
                  <li>審核通過後即可獲得報酬</li>
                  <li>如需修改，供應商會提供具體建議</li>
                </ul>
              </div>
            </div>
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
                  提交作品
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
