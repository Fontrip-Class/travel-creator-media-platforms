# 開發團隊交接文件

## 專案概況
**專案名稱**: Travel Creator Media Hub - 台灣觀光創作者媒合平台  
**技術棧**: React + TypeScript + Tailwind CSS + Vite  
**設計系統**: 參考台灣觀光署官網配色  
**後端整合**: Supabase (待啟用)

## 📁 專案架構

### 核心目錄結構
```
src/
├── components/
│   ├── ui/              # 可重用UI組件
│   │   ├── status-badge.tsx     # 狀態徽章組件
│   │   ├── loading-skeleton.tsx # 載入骨架組件
│   │   └── ...
│   ├── layout/          # 版面布局組件
│   │   ├── ErrorBoundary.tsx    # 錯誤邊界
│   │   ├── SiteHeader.tsx       # 網站標頭
│   │   └── SiteFooter.tsx       # 網站頁尾
│   └── admin/           # 管理後台組件
├── hooks/               # 自定義React Hooks
│   └── use-task-status.ts       # 任務狀態管理
├── pages/               # 頁面組件
│   ├── admin/           # 管理後台頁面
│   ├── auth/            # 認證相關頁面
│   ├── supplier/        # 供應商專用頁面
│   └── ...
├── lib/                 # 工具函數
└── data/                # 靜態資料和類型定義
```

## 🎨 設計系統

### 色彩令牌 (index.css)
```css
/* 台灣觀光署配色 */
--primary: 211 100% 35%;        /* Taiwan Tourism Blue */
--secondary: 142 69% 40%;       /* Taiwan Green */
--accent: 45 93% 47%;           /* Taiwan Gold */
```

### 使用規範
✅ **正確使用**:
```tsx
<div className="bg-primary text-primary-foreground">
<Badge className="bg-success text-success-foreground">
```

❌ **禁止使用**:
```tsx
<div className="bg-blue-500 text-white">
<Badge className="bg-green-500 text-white">
```

## 🧩 核心組件使用指南

### 1. StatusBadge 組件
```tsx
import { StatusBadge } from "@/components/ui/status-badge";

<StatusBadge status="open">公開招募</StatusBadge>
<StatusBadge status="cancelled">已取消</StatusBadge>
```

### 2. LoadingSkeleton 組件
```tsx
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

<LoadingSkeleton variant="text" lines={3} />
<LoadingSkeleton variant="card" />
<LoadingSkeleton variant="avatar" />
```

### 3. useTaskStatus Hook
```tsx
import { useTaskStatus } from "@/hooks/use-task-status";

const { getStatusLabel, getStatusColor, getAvailableActions } = useTaskStatus();
const label = getStatusLabel("open");        // "公開招募"
const color = getStatusColor("open");        // "open"
const actions = getAvailableActions("open"); // ["pause", "cancel"]
```

## 🔧 開發流程規範

### 新增功能時
1. **檢查現有組件**: 優先使用現有的 UI 組件
2. **遵循設計系統**: 使用語意化顏色令牌
3. **更新類型定義**: 如涉及新狀態，更新 TaskStatus 類型
4. **撰寫變更記錄**: 在 DEVELOPMENT_CHANGELOG.md 記錄

### 變更記錄格式
```markdown
## YYYY-MM-DD - 變更標題

**範圍**: 影響的檔案
**緣由**: 為什麼需要這個變更
**內容**: 具體變更內容
**影響**: 對系統的影響
**測試**: 需要驗證的功能點
```

## 🚀 後續開發重點

### Phase 2 - 後端整合
- [ ] 啟用 Supabase 整合
- [ ] 實作用戶認證系統
- [ ] 資料庫 CRUD 操作
- [ ] 檔案上傳功能

### Phase 3 - 功能完善
- [ ] 表單驗證 (Zod + React Hook Form)
- [ ] 即時通知系統
- [ ] 搜尋和篩選功能
- [ ] 媒合算法實作

### Phase 4 - 優化提升
- [ ] 效能優化 (Code Splitting)
- [ ] SEO 優化
- [ ] PWA 功能
- [ ] 國際化支援

## 📞 技術支援

### 常見問題
1. **顏色顯示異常**: 檢查是否使用了直接顏色類別
2. **TypeScript 錯誤**: 確認 TaskStatus 類型定義
3. **組件樣式問題**: 檢查 tailwind.config.ts 配置

### 除錯工具
- React DevTools
- Tailwind CSS IntelliSense
- TypeScript Error Lens
- Console.log 已整合到 ErrorBoundary

## 🔗 相關資源
- [Tailwind CSS 文件](https://tailwindcss.com/)
- [React 文件](https://react.dev/)
- [Supabase 文件](https://supabase.com/docs)
- [台灣觀光署官網](https://www.taiwan.net.tw/) (設計參考)