import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, Users, Newspaper, ClipboardList, Images, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import apiService from "@/lib/api";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  requiredPermission?: string;
}

export default function AdminSidebar() {
  const location = useLocation();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const userResponse = await apiService.getCurrentUser();
          if (userResponse.success && userResponse.data?.id) {
            const permissionsResponse = await apiService.getUserPermissions(userResponse.data.id);
            if (permissionsResponse.success) {
              setUserPermissions(permissionsResponse.data || []);
            }
          }
        }
      } catch (error) {
        console.error('獲取用戶權限失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPermissions();
  }, []);

  const allMenuItems: MenuItem[] = [
    { title: "總覽儀表板", url: "/admin", icon: LayoutDashboard },
    { 
      title: "用戶管理", 
      url: "/admin/users", 
      icon: Users,
      requiredPermission: "manage_users"
    },
    { 
      title: "業務實體管理", 
      url: "/admin/business-entities", 
      icon: Building2,
      requiredPermission: "manage_business_entities"
    },
    { 
      title: "供應商管理", 
      url: "/admin/suppliers", 
      icon: Building2,
      requiredPermission: "manage_suppliers"
    },
    { 
      title: "創作者管理", 
      url: "/admin/creators", 
      icon: Users,
      requiredPermission: "manage_creators"
    },
    { 
      title: "媒體管理", 
      url: "/admin/media", 
      icon: Newspaper,
      requiredPermission: "manage_media"
    },
    { 
      title: "委託任務", 
      url: "/admin/tasks", 
      icon: ClipboardList,
      requiredPermission: "manage_tasks"
    },
    { 
      title: "素材管理", 
      url: "/admin/assets", 
      icon: Images,
      requiredPermission: "manage_assets"
    },
    { 
      title: "權限管理", 
      url: "/admin/permissions", 
      icon: ShieldCheck,
      requiredPermission: "manage_permissions"
    },
  ];

  // 根據用戶權限過濾選單項目
  const filteredMenuItems = allMenuItems.filter(item => {
    if (!item.requiredPermission) return true;
    return userPermissions.includes(item.requiredPermission);
  });

  const isActive = (path: string) => (path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path));

  if (isLoading) {
    return (
      <Sidebar className="w-60">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>管理後台</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="p-4 text-center text-sm text-muted-foreground">
                載入中...
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="w-60" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>管理後台</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
