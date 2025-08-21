# 權限控制系統指南

## 🎯 系統概述

本系統實現了完整的權限控制機制，確保用戶只能訪問其角色允許的功能，提高系統安全性和用戶體驗。

## 🔐 權限控制原則

### 1. 角色基礎權限控制 (RBAC)
- **供應商 (supplier)**：可以管理任務、查看統計數據
- **創作者 (creator)**：可以瀏覽任務、管理作品集
- **媒體 (media)**：可以管理媒體資產、發布內容
- **管理員 (admin)**：可以訪問所有功能，包括管理後台

### 2. 最小權限原則
- 用戶只能看到其角色需要的功能
- 隱藏不相關的功能按鈕和選單
- 防止用戶誤操作或訪問無權限的功能

## 🛡️ 權限控制實現

### 1. 導航欄權限控制

#### 桌面版導航
```tsx
{/* 管理後台按鈕 - 嚴格權限控制 */}
{isAdmin() && (
  <Link to="/admin/dashboard" className="...">
    <Shield className="w-4 h-4" />
    管理後台
  </Link>
)}
```

#### 手機版導航
```tsx
{/* 已登入用戶的角色功能 */}
{isAuthenticated && user?.role ? (
  <>
    <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
      我的工作區
    </div>
    {getRoleFeatures(user.role).map((feature, index) => (
      <Link key={index} to={feature.path} className="...">
        <feature.icon className="w-4 h-4" />
        {feature.label}
      </Link>
    ))}
  </>
) : null}
```

### 2. 用戶下拉選單權限控制

```tsx
{/* 角色專用功能 */}
{user?.role && (
  <>
    <DropdownMenuLabel className="text-xs text-muted-foreground">
      我的工作區
    </DropdownMenuLabel>
    {getRoleFeatures(user.role).map((feature, index) => (
      <DropdownMenuItem key={index} asChild>
        <Link to={feature.path} className="flex items-center gap-2">
          <feature.icon className="w-4 h-4" />
          {feature.label}
        </Link>
      </DropdownMenuItem>
    ))}
  </>
)}
```

### 3. 權限控制組件

#### PermissionGuard 組件
```tsx
import PermissionGuard from "@/components/auth/PermissionGuard";

// 只有管理員才能看到此內容
<PermissionGuard requiredRole="admin">
  <AdminPanel />
</PermissionGuard>

// 供應商或創作者都可以看到此內容
<PermissionGuard requiredRole={['supplier', 'creator']}>
  <TaskList />
</PermissionGuard>
```

#### usePermission Hook
```tsx
import { usePermission } from "@/components/auth/PermissionGuard";

const { isAdmin, isSupplier, isCreator, hasRole } = usePermission();

if (isAdmin()) {
  // 管理員專用邏輯
}

if (hasRole(['supplier', 'creator'])) {
  // 供應商或創作者邏輯
}
```

## 📋 各角色功能權限

### 供應商 (Supplier)
- ✅ 供應商儀表板
- ✅ 發布任務
- ✅ 我的任務
- ✅ 數據分析
- ❌ 管理後台
- ❌ 用戶管理

### 創作者 (Creator)
- ✅ 創作者儀表板
- ✅ 作品集
- ✅ 可接任務
- ✅ 我的申請
- ❌ 管理後台
- ❌ 任務管理

### 媒體 (Media)
- ✅ 媒體儀表板
- ✅ 媒體資產
- ✅ 發布管理
- ✅ 數據分析
- ❌ 管理後台
- ❌ 系統管理

### 管理員 (Admin)
- ✅ 管理後台
- ✅ 用戶管理
- ✅ 任務管理
- ✅ 系統分析
- ✅ 所有其他功能

## 🔧 權限控制測試

### 測試頁面
訪問 `http://localhost:8080/backend-test` 可以測試：

1. **供應商流程測試**：檢查供應商功能是否正常
2. **權限控制測試**：驗證權限控制是否正常工作

### 手動測試步驟

#### 1. 供應商用戶測試
1. 使用供應商帳號登入
2. 確認導航欄顯示：
   - ✅ "我的工作台" 按鈕
   - ✅ "發布任務" 按鈕
   - ❌ "管理後台" 按鈕（隱藏）
3. 點擊用戶頭像，確認下拉選單顯示：
   - ✅ 供應商儀表板
   - ✅ 發布任務
   - ✅ 我的任務
   - ❌ 管理後台（隱藏）

#### 2. 管理員用戶測試
1. 使用管理員帳號登入
2. 確認導航欄顯示：
   - ✅ "我的工作台" 按鈕
   - ✅ "管理後台" 按鈕
3. 點擊用戶頭像，確認下拉選單顯示：
   - ✅ 管理後台
   - ✅ 用戶管理
   - ✅ 任務管理

#### 3. 權限控制驗證
1. 使用非管理員帳號登入
2. 嘗試直接訪問 `/admin/dashboard`
3. 確認系統會：
   - 顯示權限不足提示，或
   - 自動重定向到對應角色的儀表板

## 🚨 安全注意事項

### 1. 前端權限控制
- 隱藏無權限的功能按鈕
- 防止用戶看到不應該看到的選單
- 提供清晰的權限提示

### 2. 後端權限驗證
- 所有API端點都必須驗證權限
- 防止直接API調用繞過前端權限控制
- 記錄權限驗證失敗的日誌

### 3. 路由權限控制
- 使用 `AuthGuard` 組件保護路由
- 根據用戶角色重定向到適當頁面
- 防止未授權訪問

## 📝 自定義權限

### 添加新角色
```tsx
// 在 getRoleFeatures 函數中添加新角色
case 'new_role':
  return [
    { path: '/new-role/dashboard', label: '新角色儀表板', icon: LayoutDashboard },
    // ... 其他功能
  ];
```

### 添加新權限檢查
```tsx
// 在 usePermission Hook 中添加新方法
const isNewRole = () => hasRole('new_role');

return {
  // ... 現有方法
  isNewRole
};
```

## 🔍 故障排除

### 常見問題

#### 1. 權限按鈕不顯示
- 檢查用戶是否已登入
- 確認用戶角色是否正確設定
- 檢查權限控制邏輯是否正確

#### 2. 權限驗證失敗
- 檢查後端API權限驗證
- 確認用戶角色資料是否完整
- 檢查權限檢查邏輯

#### 3. 路由訪問被拒絕
- 確認路由是否正確保護
- 檢查 `AuthGuard` 組件設定
- 驗證用戶角色權限

### 調試方法

1. **使用測試頁面**：`/backend-test`
2. **檢查瀏覽器控制台**：查看權限相關日誌
3. **檢查用戶資料**：確認角色設定正確
4. **測試不同角色**：使用不同帳號測試權限

## 📚 相關文件

- `src/components/auth/PermissionGuard.tsx` - 權限控制組件
- `src/components/layout/Navigation.tsx` - 導航權限控制
- `src/components/auth/AuthGuard.tsx` - 路由權限保護
- `src/contexts/AuthContext.tsx` - 用戶認證上下文

## 🎉 總結

本權限控制系統提供了：

1. **完整的角色基礎權限控制**
2. **前端和後端的雙重權限驗證**
3. **清晰的用戶界面權限提示**
4. **靈活的權限擴展機制**
5. **全面的測試和調試工具**

通過這些機制，確保了系統的安全性和用戶體驗，防止用戶誤操作或訪問無權限的功能。
