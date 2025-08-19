import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    BarChart3,
    Building2,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    Newspaper,
    Plus,
    PlusCircle,
    Settings,
    Shield,
    User,
    Users,
    X
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast({
        title: "登出成功",
        description: "您已成功登出",
      });
    } catch (error) {
      toast({
        title: "登出失敗",
        description: "請重新嘗試",
        variant: "destructive"
      });
    }
  };

  // 獲取用戶角色對應的儀表板路徑
  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'supplier':
        return '/supplier/dashboard';
      case 'creator':
        return '/creator/dashboard';
      case 'media':
        return '/media/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  // 獲取用戶角色對應的主要功能
  const getRoleFeatures = (role: string) => {
    switch (role) {
      case 'supplier':
        return [
          { path: '/supplier/dashboard', label: '供應商儀表板', icon: LayoutDashboard },
          { path: '/supplier/create-task', label: '發布任務', icon: PlusCircle },
          { path: '/supplier/tasks', label: '我的任務', icon: FileText },
          { path: '/supplier/analytics', label: '數據分析', icon: BarChart3 }
        ];
      case 'creator':
        return [
          { path: '/creator/dashboard', label: '創作者儀表板', icon: LayoutDashboard },
          { path: '/creator/portfolio', label: '作品集', icon: FileText },
          { path: '/creator/tasks', label: '可接任務', icon: PlusCircle },
          { path: '/creator/applications', label: '我的申請', icon: BarChart3 }
        ];
      case 'media':
        return [
          { path: '/media/dashboard', label: '媒體儀表板', icon: LayoutDashboard },
          { path: '/media/assets', label: '媒體資產', icon: FileText },
          { path: '/media/publications', label: '發布管理', icon: PlusCircle },
          { path: '/media/analytics', label: '數據分析', icon: BarChart3 }
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: '管理後台', icon: Shield },
          { path: '/admin/users', label: '用戶管理', icon: Users },
          { path: '/admin/tasks', label: '任務管理', icon: FileText },
          { path: '/admin/analytics', label: '系統分析', icon: BarChart3 }
        ];
      default:
        return [];
    }
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
        return '用戶';
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

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
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-sm font-medium ${isActiveRoute('/') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              首頁
            </Link>

            {/* 根據用戶角色顯示主要功能 */}
            {isAuthenticated && user?.role && (
              <>
                <Link
                  to={getDashboardPath(user.role)}
                  className={`text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    location.pathname.startsWith(getDashboardPath(user.role))
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {getRoleIcon(user.role)}
                  我的工作台
                </Link>

                {/* 快速功能入口 */}
                {user.role === 'supplier' && (
                  <Link
                    to="/supplier/create-task"
                    className="text-sm font-medium text-gray-700 hover:text-primary flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    發布任務
                  </Link>
                )}

                {user.role === 'creator' && (
                  <Link
                    to="/tasks"
                    className="text-sm font-medium text-gray-700 hover:text-primary flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    瀏覽任務
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-primary flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    管理後台
                  </Link>
                )}
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link to="/suppliers" className={`text-sm font-medium ${isActiveRoute('/suppliers') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                  供應商
                </Link>
                <Link to="/creators" className={`text-sm font-medium ${isActiveRoute('/creators') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                  創作者
                </Link>
                <Link to="/media" className={`text-sm font-medium ${isActiveRoute('/media') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                  媒體
                </Link>
              </>
            )}
          </div>

          {/* 用戶選單 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* 用戶下拉選單 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium">{user?.username || '用戶'}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getRoleLabel(user?.role || '')}
                        </Badge>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      {getRoleIcon(user?.role || '')}
                      {user?.username || '用戶'}
                      <Badge variant="outline" className="ml-auto text-xs">
                        {getRoleLabel(user?.role || '')}
                      </Badge>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

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
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* 通用功能 */}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        個人資料
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        設定
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
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveRoute('/') ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                首頁
              </Link>

              {/* 已登入用戶的角色功能 */}
              {isAuthenticated && user?.role ? (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    我的工作區
                  </div>
                  {getRoleFeatures(user.role).map((feature, index) => (
                    <Link
                      key={index}
                      to={feature.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                        isActiveRoute(feature.path) ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <feature.icon className="w-4 h-4" />
                      {feature.label}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  {/* 未登入用戶的一般導航 */}
                  <Link
                    to="/suppliers"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActiveRoute('/suppliers') ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    供應商
                  </Link>
                  <Link
                    to="/creators"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActiveRoute('/creators') ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    創作者
                  </Link>
                  <Link
                    to="/media"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActiveRoute('/media') ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    媒體
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
