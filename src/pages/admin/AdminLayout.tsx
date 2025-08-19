import { Outlet } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminLayout() {
  return (
    <AuthGuard requiredRole="admin">
      <SidebarProvider>
        <SEO
          title="管理後台｜觀光署旅遊服務與行銷創作資源管理與媒合平台"
          description="管理供應商、創作者、媒體、委託任務與素材上架審核系統"
        />
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <SidebarInset>
            <header className="h-12 flex items-center gap-3 border-b px-4">
              <SidebarTrigger />
              <h1 className="text-sm font-medium">管理後台</h1>
            </header>
            <main className="p-4 container">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
