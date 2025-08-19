import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
    ArrowRight,
    BarChart3,
    Building2,
    FileText,
    LayoutDashboard,
    Newspaper,
    PlusCircle,
    Shield,
    Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 角色導向的儀表板入口組件
 * 為不同角色的用戶提供清晰的功能入口
 */
export default function RoleDashboardEntry() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user?.role) {
    return null;
  }

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'supplier':
        return {
          title: '供應商工作台',
          description: '管理您的任務發布、追蹤進度並與創作者協作',
          icon: Building2,
          color: 'from-blue-500 to-blue-600',
          features: [
            { path: '/supplier/dashboard', label: '儀表板總覽', icon: LayoutDashboard, description: '查看任務統計和最新動態' },
            { path: '/supplier/create-task', label: '發布新任務', icon: PlusCircle, description: '創建新的行銷委託案' },
            { path: '/supplier/tasks', label: '任務管理', icon: FileText, description: '管理進行中和已完成的任務' },
            { path: '/supplier/analytics', label: '數據分析', icon: BarChart3, description: '查看詳細的績效報告' }
          ]
        };
      case 'creator':
        return {
          title: '創作者工作台',
          description: '探索任務機會、展示作品並與供應商合作',
          icon: Users,
          color: 'from-green-500 to-green-600',
          features: [
            { path: '/creator/dashboard', label: '儀表板總覽', icon: LayoutDashboard, description: '查看申請狀態和收入統計' },
            { path: '/tasks', label: '瀏覽任務', icon: FileText, description: '尋找適合的創作機會' },
            { path: '/creator/portfolio', label: '作品集管理', icon: PlusCircle, description: '管理和展示您的作品' },
            { path: '/creator/applications', label: '申請記錄', icon: BarChart3, description: '追蹤任務申請狀態' }
          ]
        };
      case 'media':
        return {
          title: '媒體工作台',
          description: '管理媒體資產、發布內容並分析效果',
          icon: Newspaper,
          color: 'from-purple-500 to-purple-600',
          features: [
            { path: '/media/dashboard', label: '儀表板總覽', icon: LayoutDashboard, description: '查看發布統計和互動數據' },
            { path: '/media/assets', label: '媒體資產', icon: FileText, description: '管理圖片、影片等媒體內容' },
            { path: '/media/publications', label: '發布管理', icon: PlusCircle, description: '規劃和管理內容發布' },
            { path: '/media/analytics', label: '效果分析', icon: BarChart3, description: '分析內容表現和受眾反應' }
          ]
        };
      case 'admin':
        return {
          title: '管理員控制台',
          description: '全面管理平台用戶、任務和系統設定',
          icon: Shield,
          color: 'from-red-500 to-red-600',
          features: [
            { path: '/admin/dashboard', label: '系統總覽', icon: LayoutDashboard, description: '查看平台整體運營狀況' },
            { path: '/admin/users', label: '用戶管理', icon: Users, description: '管理平台所有用戶' },
            { path: '/admin/tasks', label: '任務監控', icon: FileText, description: '監控和管理所有任務' },
            { path: '/admin/analytics', label: '數據中心', icon: BarChart3, description: '深度分析平台數據' }
          ]
        };
      default:
        return null;
    }
  };

  const roleConfig = getRoleConfig(user.role);

  if (!roleConfig) {
    return null;
  }

  const IconComponent = roleConfig.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 歡迎標題 */}
      <div className="text-center mb-8">
        <div className={`w-20 h-20 bg-gradient-to-r ${roleConfig.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <IconComponent className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          歡迎回來，{user.username}！
        </h1>
        <p className="text-lg text-gray-600 mb-4">{roleConfig.title}</p>
        <Badge variant="outline" className="text-sm">
          {roleConfig.description}
        </Badge>
      </div>

      {/* 功能卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roleConfig.features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${roleConfig.color} rounded-lg flex items-center justify-center`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg">{feature.label}</span>
                <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-primary transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <Link to={feature.path}>
                <Button className="w-full" variant="outline">
                  進入 {feature.label}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快速動作 */}
      <div className="mt-8 text-center">
        <Link to={`/${user.role}/dashboard`}>
          <Button size="lg" className={`bg-gradient-to-r ${roleConfig.color} hover:opacity-90`}>
            <LayoutDashboard className="w-5 h-5 mr-2" />
            進入我的儀表板
          </Button>
        </Link>
      </div>
    </div>
  );
}
