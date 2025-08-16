<?php

namespace App\Services;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class FileUploadService
{
    private string $uploadPath;
    private int $maxFileSize;
    private array $allowedExtensions;
    private ImageManager $imageManager;

    public function __construct()
    {
        $this->uploadPath = $_ENV['UPLOAD_PATH'] ?? 'uploads/';
        $this->maxFileSize = (int) ($_ENV['UPLOAD_MAX_SIZE'] ?? 10485760); // 10MB
        $this->allowedExtensions = explode(',', $_ENV['ALLOWED_EXTENSIONS'] ?? 'jpg,jpeg,png,gif,mp4,mov,avi');
        $this->imageManager = new ImageManager(new Driver());
        
        // 確保上傳目錄存在
        if (!is_dir($this->uploadPath)) {
            mkdir($this->uploadPath, 0755, true);
        }
    }

    public function uploadFile(array $file, string $category = 'general'): array
    {
        // 驗證檔案
        $this->validateFile($file);
        
        // 生成唯一檔名
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        
        // 創建分類目錄
        $categoryPath = $this->uploadPath . $category . '/';
        if (!is_dir($categoryPath)) {
            mkdir($categoryPath, 0755, true);
        }
        
        $filePath = $categoryPath . $filename;
        
        // 移動上傳的檔案
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new \Exception('Failed to move uploaded file');
        }
        
        // 如果是圖片，創建縮圖
        $thumbnailPath = null;
        if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif'])) {
            $thumbnailPath = $this->createThumbnail($filePath, $categoryPath);
        }
        
        return [
            'original_name' => $file['name'],
            'file_name' => $filename,
            'file_path' => $filePath,
            'file_size' => $file['size'],
            'mime_type' => $file['type'],
            'thumbnail_path' => $thumbnailPath,
            'uploaded_at' => date('Y-m-d H:i:s')
        ];
    }

    private function validateFile(array $file): void
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \Exception('File upload error: ' . $file['error']);
        }
        
        if ($file['size'] > $this->maxFileSize) {
            throw new \Exception('File size exceeds limit: ' . $this->maxFileSize . ' bytes');
        }
        
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedExtensions)) {
            throw new \Exception('File type not allowed: ' . $extension);
        }
    }

    private function createThumbnail(string $filePath, string $categoryPath): string
    {
        try {
            $image = $this->imageManager->read($filePath);
            $thumbnail = $image->resize(300, 300, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            
            $thumbnailName = 'thumb_' . basename($filePath);
            $thumbnailPath = $categoryPath . $thumbnailName;
            
            $thumbnail->save($thumbnailPath, quality: 80);
            
            return $thumbnailPath;
        } catch (\Exception $e) {
            // 如果創建縮圖失敗，返回null
            return null;
        }
    }

    public function deleteFile(string $filePath): bool
    {
        if (file_exists($filePath)) {
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
            'size' => $stat['size'],
            'modified' => date('Y-m-d H:i:s', $stat['mtime']),
            'mime_type' => mime_content_type($filePath)
        ];
    }
}
