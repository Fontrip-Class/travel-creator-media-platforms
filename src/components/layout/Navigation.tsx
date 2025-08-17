import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  Users, 
  Newspaper, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut,
  Plus,
  Shield
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { UserRolesSummary, BusinessManagementSummary } from "@/types/database";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRolesSummary[]>([]);
  const [businessEntities, setBusinessEntities] = useState<BusinessManagementSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        setIsAuthenticated(true);
        await loadUserData();
      }
    } catch (error) {
      console.error('檢查認證狀態失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return;

      // 載入用戶角色
      const rolesResponse = await apiService.getUserRolesSummary(userId);
      if (rolesResponse.success) {
        setUserRoles(rolesResponse.data);
      }

      // 載入業務實體
      const entitiesResponse = await apiService.getBusinessManagementSummary(userId);
      if (entitiesResponse.success) {
        setBusinessEntities(entitiesResponse.data);
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    setIsAuthenticated(false);
    setUserRoles([]);
    setBusinessEntities([]);
    navigate('/');
    toast({
      title: "登出成功",
      description: "您已成功登出",
    });
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'supplier':
        return <Building2 className="w-4 h-4" />;
      case 'creator':
        return <Users className="w-4 h-4" />;
      case 'media':
        return <Newspaper className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case 'supplier':
        return '供應商';
      case 'creator':
        return '創作者';
      case 'media':
        return '媒體';
      case 'admin':
        return '管理員';
      default:
        return roleName;
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">旅遊創作者平台</span>
            </Link>
          </div>

          {/* 桌面版導航 */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActiveRoute('/') ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              首頁
            </Link>
            
            <Link
              to="/suppliers"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActiveRoute('/suppliers') ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              供應商
            </Link>
            
            <Link
              to="/creators"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActiveRoute('/creators') ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              創作者
            </Link>
            
            <Link
              to="/media"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActiveRoute('/media') ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              媒體
            </Link>
            
            <Link
              to="/portfolio"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActiveRoute('/portfolio') ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              作品集
            </Link>
          </div>

          {/* 用戶選單 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* 業務實體管理按鈕 */}
                {businessEntities.length > 0 && (
                  <Link to="/business-entities">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      業務管理
                    </Button>
                  </Link>
                )}

                {/* 用戶下拉選單 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">U</span>
                      </div>
                      <span className="hidden sm:block text-sm font-medium">用戶</span>
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>用戶資訊</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* 用戶角色 */}
                    {userRoles.length > 0 && (
                      <>
                        <DropdownMenuLabel className="text-xs text-gray-500">
                          角色
                        </DropdownMenuLabel>
                        {userRoles.map((role) => (
                          <DropdownMenuItem key={role.user_role_id} className="flex items-center gap-2">
                            {getRoleIcon(role.role_name)}
                            <span>{getRoleLabel(role.role_name)}</span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* 業務實體 */}
                    {businessEntities.length > 0 && (
                      <>
                        <DropdownMenuLabel className="text-xs text-gray-500">
                          業務實體
                        </DropdownMenuLabel>
                        {businessEntities.slice(0, 3).map((entity) => (
                          <DropdownMenuItem key={entity.business_entity_id} className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span className="truncate">{entity.business_entity_name}</span>
                          </DropdownMenuItem>
                        ))}
                        {businessEntities.length > 3 && (
                          <DropdownMenuItem className="text-xs text-gray-500">
                            還有 {businessEntities.length - 3} 個業務實體...
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* 功能選單 */}
                    <DropdownMenuItem asChild>
                      <Link to="/notifications" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        通知設定
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      登出
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    登入
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    註冊
                  </Button>
                </Link>
              </div>
            )}

            {/* 手機版選單按鈕 */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* 手機版導航選單 */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveRoute('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                首頁
              </Link>
              
              <Link
                to="/suppliers"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveRoute('/suppliers') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                供應商
              </Link>
              
              <Link
                to="/creators"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveRoute('/creators') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                創作者
              </Link>
              
              <Link
                to="/media"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveRoute('/media') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                媒體
              </Link>
              
              <Link
                to="/portfolio"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveRoute('/portfolio') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                作品集
              </Link>

              {isAuthenticated && businessEntities.length > 0 && (
                <Link
                  to="/business-entities"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute('/business-entities') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  業務管理
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
