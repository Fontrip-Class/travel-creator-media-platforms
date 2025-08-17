# 旅遊平台資料一致性檢查和修正指南

## 概述
本文檔詳細說明了前端、後端、資料庫三個層面的資料需求和欄位格式一致性問題，以及相應的修正方案。

## 發現的主要不一致問題

### 1. 任務狀態字段不一致

**問題描述**：
- 資料庫schema_v4：支援10種狀態（draft, open, collecting, evaluating, in_progress, reviewing, publishing, completed, cancelled, expired）
- 前端API：只期望5種狀態（open, in_progress, completed, cancelled, expired）
- 後端TaskService：使用'open'作為默認狀態

**修正方案**：
- 統一使用10種狀態值
- 更新前端TypeScript類型定義
- 確保後端支援所有狀態值

### 2. 地理位置字段類型不一致

**問題描述**：
- 資料庫：使用PostGIS的POINT類型
- 前端：期望{lat: number, lng: number}格式
- 不同資料庫驅動的支援程度不同

**修正方案**：
- 資料庫層：統一使用適當的地理位置類型
- API層：處理座標格式轉換
- 前端：保持{lat, lng}格式

### 3. JSON和陣列欄位處理不一致

**問題描述**：
- PostgreSQL：支援JSONB和TEXT[]
- MySQL：支援JSON
- SQLite：只支援TEXT

**修正方案**：
- 根據資料庫驅動選擇適當的欄位類型
- 在應用層處理序列化/反序列化
- 確保跨資料庫的兼容性

## 修正後的統一資料結構

### 任務狀態定義
```typescript
export type TaskStatus = 
  | 'draft'           // 草稿
  | 'open'            // 開放申請
  | 'collecting'      // 收集中
  | 'evaluating'      // 評估中
  | 'in_progress'     // 進行中
  | 'reviewing'       // 審核中
  | 'publishing'      // 發布中
  | 'completed'       // 已完成
  | 'cancelled'       // 已取消
  | 'expired';        // 已過期
```

### 地理位置處理
```typescript
// 前端格式
export interface GeoLocation {
  lat: number;
  lng: number;
}

// API轉換
function convertLocationToDB(location: GeoLocation): string {
  if (driver === 'postgresql') {
    return `POINT(${location.lng} ${location.lat})`;
  } else {
    return JSON.stringify(location);
  }
}

function convertLocationFromDB(dbLocation: string): GeoLocation {
  if (driver === 'postgresql') {
    // 解析PostGIS POINT格式
    const match = dbLocation.match(/POINT\(([^)]+)\)/);
    if (match) {
      const [lng, lat] = match[1].split(' ');
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
  }
  // 解析JSON格式
  return JSON.parse(dbLocation);
}
```

### JSON欄位處理
```typescript
// 統一使用JSON格式
export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  website?: string;
}

// 資料庫存儲
// PostgreSQL: JSONB
// MySQL: JSON
// SQLite: TEXT (JSON格式)
```

## 實施步驟

### 第一階段：類型定義統一
1. ✅ 創建統一的TypeScript類型定義文件 (`src/types/database.ts`)
2. ✅ 更新前端API服務使用統一類型
3. 🔄 修正資料庫初始化腳本

### 第二階段：資料庫結構統一
1. 使用修正後的初始化腳本創建資料庫
2. 驗證所有欄位類型和約束
3. 測試跨資料庫驅動的兼容性

### 第三階段：API層面統一
1. 更新後端服務使用統一資料結構
2. 實現資料格式轉換邏輯
3. 添加資料驗證規則

### 第四階段：前端組件更新
1. 更新UI組件使用統一類型
2. 實現資料格式轉換
3. 添加錯誤處理和驗證

## 資料庫欄位類型對照表

| 欄位類型 | PostgreSQL | MySQL | SQLite | 前端類型 |
|---------|------------|-------|--------|----------|
| UUID | UUID | CHAR(36) | TEXT | string |
| 地理位置 | POINT | POINT | TEXT | {lat: number, lng: number} |
| JSON | JSONB | JSON | TEXT | object |
| 陣列 | TEXT[] | JSON | TEXT | string[] |
| 時間戳 | TIMESTAMP | TIMESTAMP | TEXT | string |
| 布林值 | BOOLEAN | BOOLEAN | INTEGER | boolean |
| 小數 | DECIMAL | DECIMAL | REAL | number |

## 驗證檢查清單

### 資料庫層面
- [ ] 所有表結構正確創建
- [ ] 外鍵約束正確設置
- [ ] 索引正確創建
- [ ] 觸發器正常工作
- [ ] 資料類型與預期一致

### 後端API層面
- [ ] 資料驗證規則正確
- [ ] 資料格式轉換正常
- [ ] 錯誤處理完善
- [ ] API響應格式一致

### 前端層面
- [ ] TypeScript類型定義正確
- [ ] API調用使用正確類型
- [ ] 資料顯示格式一致
- [ ] 錯誤處理完善

## 常見問題和解決方案

### Q: 如何處理不同資料庫的JSON欄位？
A: 在應用層統一使用JSON格式，資料庫層根據驅動選擇適當類型。

### Q: 地理位置欄位如何跨資料庫兼容？
A: 使用API層的轉換函數，統一前端格式，資料庫層根據驅動選擇類型。

### Q: 陣列欄位在不同資料庫中如何處理？
A: PostgreSQL使用原生陣列，MySQL和SQLite使用JSON格式存儲。

### Q: UUID欄位如何確保唯一性？
A: 使用資料庫原生的UUID函數，確保跨資料庫的兼容性。

## 測試建議

1. **單元測試**：測試所有資料轉換函數
2. **整合測試**：測試完整的API流程
3. **跨資料庫測試**：在不同資料庫驅動下測試功能
4. **前端測試**：測試UI組件的資料顯示
5. **端到端測試**：測試完整的用戶流程

## 監控和維護

1. **日誌記錄**：記錄所有資料轉換操作
2. **性能監控**：監控資料庫查詢性能
3. **錯誤追蹤**：追蹤資料不一致的錯誤
4. **定期檢查**：定期檢查資料完整性
5. **版本控制**：記錄所有資料結構變更

## 結論

通過實施這些修正方案，可以確保前端、後端、資料庫三個層面的資料結構完全一致，提高系統的穩定性和可維護性。建議按照實施步驟逐步進行，每個階段都要充分測試，確保系統的正常運行。
