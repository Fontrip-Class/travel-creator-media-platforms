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

const items = [
  { title: "總覽儀表板", url: "/admin", icon: LayoutDashboard },
  { title: "供應商管理", url: "/admin/suppliers", icon: Building2 },
  { title: "創作者管理", url: "/admin/creators", icon: Users },
  { title: "媒體管理", url: "/admin/media", icon: Newspaper },
  { title: "委託任務", url: "/admin/tasks", icon: ClipboardList },
  { title: "素材管理", url: "/admin/assets", icon: Images },
  { title: "權限管理", url: "/admin/permissions", icon: ShieldCheck },
];

export default function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => (path === "/admin" ? currentPath === "/admin" : currentPath.startsWith(path));

  return (
    <Sidebar className="w-60" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>管理後台</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
