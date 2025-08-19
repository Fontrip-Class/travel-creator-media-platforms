import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
    Building2,
    CheckCircle,
    Clock,
    Newspaper,
    Shield,
    TrendingUp,
    Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 角色導向的歡迎橫幅組件
 * 在儀表板頂部顯示，提供快速導航和狀態概覽
 */
export default function WelcomeBanner() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user?.role) {
    return null;
  }

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'supplier':
        return {
          title: '供應商控制中心',
          subtitle: '管理您的任務發布和創作者協作',
          icon: Building2,
          color: 'from-blue-500 to-blue-600',
          quickActions: [
            { path: '/supplier/create-task', label: '發布新任務', primary: true },
            { path: '/supplier/tasks', label: '管理任務' },
            { path: '/supplier/analytics', label: '查看數據' }
          ],
          stats: [
            { label: '進行中任務', value: '3', icon: Clock },
            { label: '已完成任務', value: '12', icon: CheckCircle },
            { label: '本月收益', value: '↗ 15%', icon: TrendingUp }
          ]
        };
      case 'creator':
        return {
          title: '創作者工作室',
          subtitle: '探索機會，展示才華，創造價值',
          icon: Users,
          color: 'from-green-500 to-green-600',
          quickActions: [
            { path: '/tasks', label: '瀏覽任務', primary: true },
            { path: '/creator/portfolio', label: '管理作品集' },
            { path: '/creator/applications', label: '查看申請' }
          ],
          stats: [
            { label: '待處理申請', value: '2', icon: Clock },
            { label: '完成項目', value: '8', icon: CheckCircle },
            { label: '成功率', value: '85%', icon: TrendingUp }
          ]
        };
      case 'media':
        return {
          title: '媒體管理中心',
          subtitle: '管理內容資產，優化發布效果',
          icon: Newspaper,
          color: 'from-purple-500 to-purple-600',
          quickActions: [
            { path: '/media/assets', label: '管理資產', primary: true },
            { path: '/media/publications', label: '發布內容' },
            { path: '/media/analytics', label: '效果分析' }
          ],
          stats: [
            { label: '待發布內容', value: '5', icon: Clock },
            { label: '本月發布', value: '24', icon: CheckCircle },
            { label: '互動增長', value: '↗ 32%', icon: TrendingUp }
          ]
        };
      case 'admin':
        return {
          title: '系統管理控制台',
          subtitle: '全面監控平台運營和用戶活動',
          icon: Shield,
          color: 'from-red-500 to-red-600',
          quickActions: [
            { path: '/admin/dashboard', label: '系統總覽', primary: true },
            { path: '/admin/users', label: '用戶管理' },
            { path: '/admin/tasks', label: '任務監控' }
          ],
          stats: [
            { label: '活躍用戶', value: '156', icon: Users },
            { label: '進行中任務', value: '23', icon: Clock },
            { label: '系統健康度', value: '98%', icon: TrendingUp }
          ]
        };
      default:
        return null;
    }
  };

  const config = getRoleConfig(user.role);

  if (!config) {
    return null;
  }

  const IconComponent = config.icon;

  return (
    <Card className={`bg-gradient-to-r ${config.color} text-white border-0 mb-6`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{config.title}</h1>
              <p className="text-white/90">{config.subtitle}</p>
              <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                歡迎回來，{user.username}
              </Badge>
            </div>
          </div>

          {/* 快速統計 */}
          <div className="hidden md:flex gap-6">
            {config.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg mb-1">
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 快速操作按鈕 */}
        <div className="flex gap-3 mt-6">
          {config.quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <Button
                variant={action.primary ? "secondary" : "outline"}
                size="sm"
                className={action.primary ?
                  "bg-white text-gray-900 hover:bg-white/90" :
                  "border-white/30 text-white hover:bg-white/10"
                }
              >
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
