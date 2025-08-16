<?php

namespace App\Services;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class FileUploadService
{
    private string $uploadPath;
    private array $allowedImageTypes;
    private array $allowedDocumentTypes;
    private int $maxFileSize;
    private ImageManager $imageManager;

    public function __construct()
    {
        $this->uploadPath = $_ENV['UPLOAD_PATH'] ?? 'uploads/';
        $this->allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $this->allowedDocumentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        $this->maxFileSize = (int)($_ENV['MAX_FILE_SIZE'] ?? 10 * 1024 * 1024); // 10MB
        
        $this->imageManager = new ImageManager(new Driver());
        
        // 確保上傳目錄存在
        $this->ensureUploadDirectories();
    }

    public function uploadImage(array $file, array $options = []): array
    {
        // 驗證文件
        $this->validateFile($file, $this->allowedImageTypes);
        
        // 生成唯一文件名
        $fileName = $this->generateUniqueFileName($file['name'], 'images');
        $filePath = $this->uploadPath . 'images/' . $fileName;
        
        // 處理圖片
        $image = $this->imageManager->read($file['tmp_name']);
        
        // 調整尺寸（如果指定）
        if (isset($options['max_width']) || isset($options['max_height'])) {
            $maxWidth = $options['max_width'] ?? 1920;
            $maxHeight = $options['max_height'] ?? 1080;
            $image->scaleDown($maxWidth, $maxHeight);
        }
        
        // 調整品質
        $quality = $options['quality'] ?? 85;
        
        // 保存圖片
        $image->save($filePath, quality: $quality);
        
        // 生成縮略圖（如果需要）
        $thumbnailPath = null;
        if (isset($options['generate_thumbnail'])) {
            $thumbnailPath = $this->generateThumbnail($image, $fileName);
        }
        
        return [
            'success' => true,
            'file_id' => $this->generateFileId(),
            'original_name' => $file['name'],
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => filesize($filePath),
            'mime_type' => $file['type'],
            'thumbnail_path' => $thumbnailPath,
            'uploaded_at' => date('Y-m-d H:i:s')
        ];
    }

    public function uploadDocument(array $file, array $options = []): array
    {
        // 驗證文件
        $this->validateFile($file, $this->allowedDocumentTypes);
        
        // 生成唯一文件名
        $fileName = $this->generateUniqueFileName($file['name'], 'documents');
        $filePath = $this->uploadPath . 'documents/' . $fileName;
        
        // 移動文件
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new \Exception('文件上傳失敗');
        }
        
        return [
            'success' => true,
            'file_id' => $this->generateFileId(),
            'original_name' => $file['name'],
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => filesize($filePath),
            'mime_type' => $file['type'],
            'uploaded_at' => date('Y-m-d H:i:s')
        ];
    }

    public function uploadMultipleFiles(array $files, string $type = 'images', array $options = []): array
    {
        $results = [];
        
        foreach ($files as $file) {
            try {
                if ($type === 'images') {
                    $results[] = $this->uploadImage($file, $options);
                } else {
                    $results[] = $this->uploadDocument($file, $options);
                }
            } catch (\Exception $e) {
                $results[] = [
                    'success' => false,
                    'original_name' => $file['name'],
                    'error' => $e->getMessage()
                ];
            }
        }
        
        return $results;
    }

    public function deleteFile(string $filePath): bool
    {
        if (file_exists($filePath) && is_file($filePath)) {
            return unlink($filePath);
        }
        return false;
    }

    public function getFileInfo(string $filePath): ?array
    {
        if (!file_exists($filePath)) {
            return null;
        }
        
        $fileInfo = pathinfo($filePath);
        $stat = stat($filePath);
        
        return [
            'name' => $fileInfo['basename'],
            'path' => $filePath,
            'size' => $stat['size'],
            'modified' => date('Y-m-d H:i:s', $stat['mtime']),
            'mime_type' => mime_content_type($filePath)
        ];
    }

    public function resizeImage(string $filePath, int $width, int $height, string $outputPath = null): string
    {
        if (!file_exists($filePath)) {
            throw new \Exception('源文件不存在');
        }
        
        $image = $this->imageManager->read($filePath);
        $image->cover($width, $height);
        
        if (!$outputPath) {
            $outputPath = $this->uploadPath . 'resized/' . basename($filePath);
        }
        
        $image->save($outputPath);
        
        return $outputPath;
    }

    public function cropImage(string $filePath, int $x, int $y, int $width, int $height, string $outputPath = null): string
    {
        if (!file_exists($filePath)) {
            throw new \Exception('源文件不存在');
        }
        
        $image = $this->imageManager->read($filePath);
        $image->crop($width, $height, $x, $y);
        
        if (!$outputPath) {
            $outputPath = $this->uploadPath . 'cropped/' . basename($filePath);
        }
        
        $image->save($outputPath);
        
        return $outputPath;
    }

    public function addWatermark(string $filePath, string $watermarkPath, string $position = 'bottom-right', string $outputPath = null): string
    {
        if (!file_exists($filePath) || !file_exists($watermarkPath)) {
            throw new \Exception('源文件或水印文件不存在');
        }
        
        $image = $this->imageManager->read($filePath);
        $watermark = $this->imageManager->read($watermarkPath);
        
        // 計算水印位置
        $imageWidth = $image->width();
        $imageHeight = $image->height();
        $watermarkWidth = $watermark->width();
        $watermarkHeight = $watermark->height();
        
        $x = $y = 0;
        switch ($position) {
            case 'top-left':
                $x = 10;
                $y = 10;
                break;
            case 'top-right':
                $x = $imageWidth - $watermarkWidth - 10;
                $y = 10;
                break;
            case 'bottom-left':
                $x = 10;
                $y = $imageHeight - $watermarkHeight - 10;
                break;
            case 'bottom-right':
            default:
                $x = $imageWidth - $watermarkWidth - 10;
                $y = $imageHeight - $watermarkHeight - 10;
                break;
            case 'center':
                $x = ($imageWidth - $watermarkWidth) / 2;
                $y = ($imageHeight - $watermarkHeight) / 2;
                break;
        }
        
        $image->place($watermark, $x, $y);
        
        if (!$outputPath) {
            $outputPath = $this->uploadPath . 'watermarked/' . basename($filePath);
        }
        
        $image->save($outputPath);
        
        return $outputPath;
    }

    private function validateFile(array $file, array $allowedTypes): void
    {
        // 檢查上傳錯誤
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors = [
                UPLOAD_ERR_INI_SIZE => '文件大小超過PHP配置限制',
                UPLOAD_ERR_FORM_SIZE => '文件大小超過表單限制',
                UPLOAD_ERR_PARTIAL => '文件上傳不完整',
                UPLOAD_ERR_NO_FILE => '沒有文件被上傳',
                UPLOAD_ERR_NO_TMP_DIR => '缺少臨時目錄',
                UPLOAD_ERR_CANT_WRITE => '寫入文件失敗',
                UPLOAD_ERR_EXTENSION => '文件上傳被擴展阻止'
            ];
            throw new \Exception($errors[$file['error']] ?? '文件上傳失敗');
        }
        
        // 檢查文件大小
        if ($file['size'] > $this->maxFileSize) {
            throw new \Exception('文件大小超過限制：' . $this->formatFileSize($this->maxFileSize));
        }
        
        // 檢查文件類型
        if (!in_array($file['type'], $allowedTypes)) {
            throw new \Exception('不支持的文件類型：' . $file['type']);
        }
        
        // 檢查文件內容（防止偽裝文件類型）
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            throw new \Exception('文件內容類型不匹配');
        }
    }

    private function generateUniqueFileName(string $originalName, string $directory): string
    {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        
        // 清理文件名
        $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName);
        $baseName = substr($baseName, 0, 50); // 限制長度
        
        $fileName = $baseName . '_' . uniqid() . '.' . $extension;
        
        // 確保文件名唯一
        $counter = 1;
        while (file_exists($this->uploadPath . $directory . '/' . $fileName)) {
            $fileName = $baseName . '_' . uniqid() . '_' . $counter . '.' . $extension;
            $counter++;
        }
        
        return $fileName;
    }

    private function generateFileId(): string
    {
        return uniqid('file_', true);
    }

    private function generateThumbnail($image, string $fileName): string
    {
        $thumbnailPath = $this->uploadPath . 'thumbnails/' . $fileName;
        
        // 創建縮略圖
        $thumbnail = $image->scaleDown(300, 300);
        $thumbnail->save($thumbnailPath, quality: 80);
        
        return $thumbnailPath;
    }

    private function ensureUploadDirectories(): void
    {
        $directories = [
            $this->uploadPath,
            $this->uploadPath . 'images/',
            $this->uploadPath . 'documents/',
            $this->uploadPath . 'thumbnails/',
            $this->uploadPath . 'resized/',
            $this->uploadPath . 'cropped/',
            $this->uploadPath . 'watermarked/'
        ];
        
        foreach ($directories as $directory) {
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }
        }
    }

    private function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    public function getAllowedTypes(): array
    {
        return [
            'images' => $this->allowedImageTypes,
            'documents' => $this->allowedDocumentTypes
        ];
    }

    public function getMaxFileSize(): int
    {
        return $this->maxFileSize;
    }

    public function getUploadPath(): string
    {
        return $this->uploadPath;
    }
}
