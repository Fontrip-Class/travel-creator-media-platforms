# 權限管理系統測試腳本
# 需要以管理員權限運行

param(
    [string]$BaseUrl = "http://localhost:8000",
    [switch]$Cleanup
)

# 設置控制台編碼和顏色
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "權限管理系統測試"

# 顏色定義
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Show-Header {
    Clear-Host
    Write-ColorText "╔══════════════════════════════════════════════════════════════╗" $Colors.Header
    Write-ColorText "║                權限管理系統測試腳本                          ║" $Colors.Header
    Write-ColorText "║                                                              ║" $Colors.Header
    Write-ColorText "║  測試旅遊創作者媒體平台的權限管理功能                        ║" $Colors.Header
    Write-ColorText "║  包括：註冊、登入、編輯、停用、啟用                        ║" $Colors.Header
    Write-ColorText "╚══════════════════════════════════════════════════════════════╝" $Colors.Header
    Write-ColorText ""
}

function Test-API {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = "",
        [string]$Token = ""
    )
    
    $headers = @{"Content-Type" = "application/json"}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri "$BaseUrl$Endpoint" -Method $Method -Headers $headers
        } else {
            $response = Invoke-WebRequest -Uri "$BaseUrl$Endpoint" -Method $Method -Headers $headers -Body $Body
        }
        
        $result = $response.Content | ConvertFrom-Json
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Data = $result
        }
    } catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse) {
            $statusCode = [int]$errorResponse.StatusCode
            $errorContent = $_.Exception.Message
            try {
                $errorData = $errorContent | ConvertFrom-Json
            } catch {
                $errorData = @{message = $errorContent}
            }
        } else {
            $statusCode = 500
            $errorData = @{message = $_.Exception.Message}
        }
        
        return @{
            Success = $false
            StatusCode = $statusCode
            Error = $errorData
        }
    }
}

function Test-Registration {
    Write-ColorText "🧪 測試用戶註冊功能..." $Colors.Info
    Write-ColorText ""
    
    # 測試數據
    $testUsers = @(
        @{
            Role = "admin"
            Username = "AdminUser"
            Email = "admin@example.com"
            Password = "AdminPassword123!"
            Data = @{
                username = "AdminUser"
                email = "admin@example.com"
                password = "AdminPassword123!"
                confirmPassword = "AdminPassword123!"
                role = "admin"
            }
        },
        @{
            Role = "supplier"
            Username = "SupplierCompany"
            Email = "supplier@example.com"
            Password = "SupplierPassword123!"
            Data = @{
                username = "SupplierCompany"
                email = "supplier@example.com"
                password = "SupplierPassword123!"
                confirmPassword = "SupplierPassword123!"
                role = "supplier"
                phone = "0912345678"
                company_name = "旅遊供應商A"
                business_type = "accommodation"
            }
        },
        @{
            Role = "creator"
            Username = "TravelCreator"
            Email = "creator@example.com"
            Password = "CreatorPassword123!"
            Data = @{
                username = "TravelCreator"
                email = "creator@example.com"
                password = "CreatorPassword123!"
                confirmPassword = "CreatorPassword123!"
                role = "creator"
                phone = "0987654321"
                first_name = "小明"
                last_name = "李"
                portfolio_url = "https://example.com/portfolio"
            }
        },
        @{
            Role = "media"
            Username = "TravelMedia"
            Email = "media@example.com"
            Password = "MediaPassword123!"
            Data = @{
                username = "TravelMedia"
                email = "media@example.com"
                password = "MediaPassword123!"
                confirmPassword = "MediaPassword123!"
                role = "media"
                phone = "0900112233"
                media_type = "online"
                platform_name = "旅遊資訊網"
            }
        }
    )
    
    $registeredUsers = @{}
    
    foreach ($user in $testUsers) {
        Write-ColorText "📝 註冊 $($user.Role) 用戶: $($user.Username)" $Colors.Info
        
        $body = $user.Data | ConvertTo-Json -Depth 10
        $result = Test-API -Method "POST" -Endpoint "/api/auth/register" -Body $body
        
        if ($result.Success) {
            Write-ColorText "✅ $($user.Role) 用戶註冊成功" $Colors.Success
            Write-ColorText "   User ID: $($result.Data.user_id)" $Colors.Success
            Write-ColorText "   Token: $($result.Data.token.Substring(0, 20))..." $Colors.Success
            
            $registeredUsers[$user.Role] = @{
                UserId = $result.Data.user_id
                Token = $result.Data.token
                Username = $user.Username
                Email = $user.Email
                Password = $user.Password
                Data = $user.Data
            }
        } else {
            Write-ColorText "❌ $($user.Role) 用戶註冊失敗" $Colors.Error
            Write-ColorText "   狀態碼: $($result.StatusCode)" $Colors.Error
            Write-ColorText "   錯誤: $($result.Error.message)" $Colors.Error
        }
        Write-ColorText ""
    }
    
    return $registeredUsers
}

function Test-Login {
    param($RegisteredUsers)
    
    Write-ColorText "🔐 測試用戶登入功能..." $Colors.Info
    Write-ColorText ""
    
    $loggedInUsers = @{}
    
    foreach ($role in $registeredUsers.Keys) {
        $user = $registeredUsers[$role]
        Write-ColorText "🔑 登入 $role 用戶: $($user.Username)" $Colors.Info
        
        $loginData = @{
            email = $user.Email
            password = $user.Password
        }
        $body = $loginData | ConvertTo-Json
        
        $result = Test-API -Method "POST" -Endpoint "/api/auth/login" -Body $body
        
        if ($result.Success) {
            Write-ColorText "✅ $role 用戶登入成功" $Colors.Success
            Write-ColorText "   Token: $($result.Data.token.Substring(0, 20))..." $Colors.Success
            
            $loggedInUsers[$role] = @{
                UserId = $user.UserId
                Token = $result.Data.token
                Username = $user.Username
                Role = $role
            }
        } else {
            Write-ColorText "❌ $role 用戶登入失敗" $Colors.Error
            Write-ColorText "   狀態碼: $($result.StatusCode)" $Colors.Error
            Write-ColorText "   錯誤: $($result.Error.message)" $Colors.Error
        }
        Write-ColorText ""
    }
    
    return $loggedInUsers
}

function Test-ProfileUpdate {
    param($LoggedInUsers)
    
    Write-ColorText "✏️ 測試用戶資料編輯功能..." $Colors.Info
    Write-ColorText ""
    
    foreach ($role in $LoggedInUsers.Keys) {
        $user = $LoggedInUsers[$role]
        Write-ColorText "📝 編輯 $role 用戶資料: $($user.Username)" $Colors.Info
        
        # 根據角色準備不同的更新數據
        $updateData = switch ($role) {
            "supplier" { @{ company_name = "更新後的供應商名稱"; phone = "0911223344" } }
            "creator" { @{ first_name = "小華"; bio = "這是一個更新的創作者簡介" } }
            "media" { @{ platform_name = "更新後的媒體平台"; phone = "0900112233" } }
            "admin" { @{ bio = "這是一個更新的管理員簡介" } }
        }
        
        $body = $updateData | ConvertTo-Json
        
        $result = Test-API -Method "PUT" -Endpoint "/api/users/$($user.UserId)" -Body $body -Token $user.Token
        
        if ($result.Success) {
            Write-ColorText "✅ $role 用戶資料更新成功" $Colors.Success
        } else {
            Write-ColorText "❌ $role 用戶資料更新失敗" $Colors.Error
            Write-ColorText "   狀態碼: $($result.StatusCode)" $Colors.Error
            Write-ColorText "   錯誤: $($result.Error.message)" $Colors.Error
        }
        Write-ColorText ""
    }
}

function Test-UserSuspension {
    param($LoggedInUsers)
    
    Write-ColorText "⏸️ 測試用戶帳戶停用功能..." $Colors.Info
    Write-ColorText ""
    
    # 測試用戶停用自己的帳戶
    $mediaUser = $LoggedInUsers["media"]
    Write-ColorText "⏸️ 媒體用戶停用自己的帳戶: $($mediaUser.Username)" $Colors.Info
    
    $suspendData = @{
        reason = "暫時不使用平台"
        suspension_until = "2026-12-31T23:59:59Z"
    }
    $body = $suspendData | ConvertTo-Json
    
    $result = Test-API -Method "POST" -Endpoint "/api/users/$($mediaUser.UserId)/suspend" -Body $body -Token $mediaUser.Token
    
    if ($result.Success) {
        Write-ColorText "✅ 媒體用戶帳戶停用成功" $Colors.Success
    } else {
        Write-ColorText "❌ 媒體用戶帳戶停用失敗" $Colors.Error
        Write-ColorText "   狀態碼: $($result.StatusCode)" $Colors.Error
        Write-ColorText "   錯誤: $($result.Error.message)" $Colors.Error
    }
    Write-ColorText ""
    
    # 測試管理員停用其他用戶帳戶
    $adminUser = $LoggedInUsers["admin"]
    $supplierUser = $LoggedInUsers["supplier"]
    Write-ColorText "⏸️ 管理員停用供應商帳戶: $($supplierUser.Username)" $Colors.Info
    
    $suspendData = @{
        reason = "違反平台政策"
        suspension_until = $null
    }
    $body = $suspendData | ConvertTo-Json
    
    $result = Test-API -Method "POST" -Endpoint "/api/users/$($supplierUser.UserId)/suspend" -Body $body -Token $adminUser.Token
    
    if ($result.Success) {
        Write-ColorText "✅ 管理員停用供應商帳戶成功" $Colors.Success
    } else {
        Write-ColorText "❌ 管理員停用供應商帳戶失敗" $Colors.Error
        Write-ColorText "   狀態碼: $($result.StatusCode)" $Colors.Error
        Write-ColorText "   錯誤: $($result.Error.message)" $Colors.Error
    }
    Write-ColorText ""
}

function Test-UserActivation {
    param($LoggedInUsers)
    
    Write-ColorText "▶️ 測試用戶帳戶啟用功能..." $Colors.Info
    Write-ColorText ""
    
    $adminUser = $LoggedInUsers["admin"]
    
    # 測試管理員啟用媒體用戶帳戶
    $mediaUser = $LoggedInUsers["media"]
    Write-ColorText "▶️ 管理員啟用媒體用戶帳戶: $($mediaUser.Username)" $Colors.Info
    
    $result = Test-API -Method "POST" -Endpoint "/api/users/$($mediaUser.UserId)/activate" -Body "{}" -Token $adminUser.Token
    
    if ($result.Success) {
        Write-ColorText "✅ 管理員啟用媒體用戶帳戶成功" $Colors.Success
    } else {
        Write-ColorText "❌ 管理員啟用媒體用戶帳戶失敗" $Colors.Error
        Write-ColorText "   狀態碼: $($result.StatusCode)" $Colors.Error
        Write-ColorText "   錯誤: $($result.Error.message)" $Colors.Error
    }
    Write-ColorText ""
    
    # 測試管理員啟用供應商用戶帳戶
    $supplierUser = $LoggedInUsers["supplier"]
    Write-ColorText "▶️ 管理員啟用供應商用戶帳戶: $($supplierUser.Username)" $Colors.Info
    
    $result = Test-API -Method "POST" -Endpoint "/api/users/$($supplierUser.UserId)/activate" -Body "{}" -Token $adminUser.Token
    
    if ($result.Success) {
        Write-ColorText "✅ 管理員啟用供應商用戶帳戶成功" $Colors.Success
    } else {
        Write-ColorText "❌ 管理員啟用供應商用戶帳戶失敗" $Colors.Error
        Write-ColorText "   狀態碼: $($result.StatusCode)" $Colors.Error
        Write-ColorText "   錯誤: $($result.Error.message)" $Colors.Error
    }
    Write-ColorText ""
}

function Test-PermissionChecks {
    param($LoggedInUsers)
    
    Write-ColorText "🔒 測試權限檢查功能..." $Colors.Info
    Write-ColorText ""
    
    # 測試普通用戶嘗試編輯其他用戶資料（應該失敗）
    $creatorUser = $LoggedInUsers["creator"]
    $supplierUser = $LoggedInUsers["supplier"]
    Write-ColorText "🚫 創作者嘗試編輯供應商資料（應該失敗）" $Colors.Warning
    
    $updateData = @{ phone = "0999887766" }
    $body = $updateData | ConvertTo-Json
    
    $result = Test-API -Method "PUT" -Endpoint "/api/users/$($supplierUser.UserId)" -Body $body -Token $creatorUser.Token
    
    if (-not $result.Success -and $result.StatusCode -eq 403) {
        Write-ColorText "✅ 權限檢查正確：創作者無法編輯其他用戶資料" $Colors.Success
    } else {
        Write-ColorText "❌ 權限檢查失敗：創作者不應該能夠編輯其他用戶資料" $Colors.Error
    }
    Write-ColorText ""
    
    # 測試普通用戶嘗試停用其他用戶帳戶（應該失敗）
    Write-ColorText "🚫 創作者嘗試停用供應商帳戶（應該失敗）" $Colors.Warning
    
    $suspendData = @{ reason = "惡意行為" }
    $body = $suspendData | ConvertTo-Json
    
    $result = Test-API -Method "POST" -Endpoint "/api/users/$($supplierUser.UserId)/suspend" -Body $body -Token $creatorUser.Token
    
    if (-not $result.Success -and $result.StatusCode -eq 403) {
        Write-ColorText "✅ 權限檢查正確：創作者無法停用其他用戶帳戶" $Colors.Success
    } else {
        Write-ColorText "❌ 權限檢查失敗：創作者不應該能夠停用其他用戶帳戶" $Colors.Error
    }
    Write-ColorText ""
}

function Show-TestSummary {
    param($RegisteredUsers, $LoggedInUsers)
    
    Write-ColorText "📊 測試結果摘要" $Colors.Header
    Write-ColorText "══════════════════════════════════════════════════════════════" $Colors.Header
    Write-ColorText ""
    
    Write-ColorText "註冊用戶數量: $($RegisteredUsers.Count)" $Colors.Info
    Write-ColorText "登入成功數量: $($LoggedInUsers.Count)" $Colors.Info
    
    Write-ColorText ""
    Write-ColorText "用戶詳情:" $Colors.Info
    foreach ($role in $RegisteredUsers.Keys) {
        $user = $RegisteredUsers[$role]
        Write-ColorText "  $role`: $($user.Username) - $($user.Email)" $Colors.Info
    }
    
    Write-ColorText ""
    Write-ColorText "測試完成！請檢查上述結果以確認權限管理系統功能正常。" $Colors.Success
}

# 主程序
Show-Header

Write-ColorText "🚀 開始權限管理系統測試..." $Colors.Header
Write-ColorText ""

# 檢查後端服務
Write-ColorText "🔍 檢查後端服務狀態..." $Colors.Info
$healthResult = Test-API -Method "GET" -Endpoint "/api/health"
if ($healthResult.Success) {
    Write-ColorText "✅ 後端服務正常運行" $Colors.Success
} else {
    Write-ColorText "❌ 後端服務無法連接" $Colors.Error
    Write-ColorText "   請確保後端服務在 $BaseUrl 運行" $Colors.Error
    pause
    exit 1
}
Write-ColorText ""

# 執行測試
$registeredUsers = Test-Registration
$loggedInUsers = Test-Login -RegisteredUsers $registeredUsers

if ($loggedInUsers.Count -gt 0) {
    Test-ProfileUpdate -LoggedInUsers $loggedInUsers
    Test-UserSuspension -LoggedInUsers $loggedInUsers
    Test-UserActivation -LoggedInUsers $loggedInUsers
    Test-PermissionChecks -LoggedInUsers $loggedInUsers
}

Show-TestSummary -RegisteredUsers $registeredUsers -LoggedInUsers $loggedInUsers

Write-ColorText ""
Write-ColorText "按任意鍵退出..." $Colors.Info
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
