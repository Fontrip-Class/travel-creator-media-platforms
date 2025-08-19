import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
}

export default function AuthGuard({ children, requiredRole, requiredPermissions }: AuthGuardProps) {
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (user?.id && requiredPermissions && requiredPermissions.length > 0) {
        try {
          const permissionsResponse = await apiService.getUserPermissions(user.id);
          if (permissionsResponse.success) {
            setUserPermissions(permissionsResponse.data || []);
          }
        } catch (error) {
          console.error('獲取用戶權限失敗:', error);
        }
      }
    };

    fetchUserPermissions();
  }, [user, requiredPermissions]);

  // 檢查角色權限
  const hasRequiredRole = () => {
    if (!requiredRole) return true;
    return user?.role === requiredRole;
  };

  // 檢查具體權限
  const hasRequiredPermissions = () => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>驗證中...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">正在檢查您的身份和權限</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole() || !hasRequiredPermissions()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>權限不足</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              您沒有權限訪問此頁面
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.history.back()} variant="outline" className="w-full">
                返回上一頁
              </Button>
              <Button onClick={() => window.location.href = '/'} className="w-full">
                回到首頁
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
