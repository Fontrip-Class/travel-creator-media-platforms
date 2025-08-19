import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';

export interface ErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
  variant?: 'default' | 'destructive' | 'warning';
  showIcon?: boolean;
  className?: string;
}

export function ErrorDisplay({
  error,
  onDismiss,
  variant = 'destructive',
  showIcon = true,
  className = ''
}: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <Alert variant={variant} className={`mb-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          {showIcon && <AlertCircle className="h-4 w-4 mt-0.5" />}
          <div className="flex-1">
            <AlertTitle className="text-sm font-medium">
              發生錯誤
            </AlertTitle>
            <AlertDescription className="text-sm mt-1">
              {error}
            </AlertDescription>
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}

// 專門用於API錯誤處理
export function ApiErrorDisplay({
  error,
  onDismiss,
  className = ''
}: Omit<ErrorDisplayProps, 'variant'>) {
  if (!error) return null;

  // 根據錯誤類型選擇不同樣式
  let variant: 'default' | 'destructive' | 'warning' = 'destructive';
  let title = '發生錯誤';

  if (error.includes('網絡連接失敗') || error.includes('Connection')) {
    variant = 'warning';
    title = '連接失敗';
  } else if (error.includes('驗證') || error.includes('Validation')) {
    variant = 'default';
    title = '輸入驗證錯誤';
  } else if (error.includes('權限') || error.includes('Unauthorized')) {
    variant = 'destructive';
    title = '權限不足';
  }

  return (
    <ErrorDisplay
      error={error}
      onDismiss={onDismiss}
      variant={variant}
      className={className}
    />
  );
}

// 專門用於表單驗證錯誤處理
export function ValidationErrorDisplay({
  errors,
  onDismiss,
  className = ''
}: {
  errors: Record<string, string> | null;
  onDismiss?: () => void;
  className?: string;
}) {
  if (!errors || Object.keys(errors).length === 0) return null;

  const errorMessages = Object.values(errors).filter(Boolean);

  if (errorMessages.length === 0) return null;

  return (
    <Alert variant="default" className={`mb-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <div className="flex-1">
            <AlertTitle className="text-sm font-medium">
              請修正以下錯誤
            </AlertTitle>
            <AlertDescription className="text-sm mt-1">
              <ul className="list-disc list-inside space-y-1">
                {errorMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </AlertDescription>
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}
