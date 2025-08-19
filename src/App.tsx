import AuthGuard from "@/components/auth/AuthGuard";
import DashboardRedirect from "@/components/auth/DashboardRedirect";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import RoleDashboardEntry from "@/components/layout/RoleDashboardEntry";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminLayout from "@/pages/admin/AdminLayout";
import AssetsAdmin from "@/pages/admin/Assets";
import BusinessEntitiesAdmin from "@/pages/admin/BusinessEntities";
import CreatorsAdmin from "@/pages/admin/Creators";
import Dashboard from "@/pages/admin/Dashboard";
import MediaAdmin from "@/pages/admin/Media";
import PermissionsAdmin from "@/pages/admin/Permissions";
import SuppliersAdmin from "@/pages/admin/Suppliers";
import TasksAdmin from "@/pages/admin/Tasks";
import UsersAdmin from "@/pages/admin/Users";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import BackendTest from "./pages/BackendTest";
import BusinessEntityManagement from "./pages/BusinessEntityManagement";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import CreatorPortfolio from "./pages/creator/CreatorPortfolio";
import CreatorTasks from "./pages/creator/CreatorTasks";
import CreatorDetail from "./pages/CreatorDetail";
import CreatorsList from "./pages/CreatorsList";
import FAQ from "./pages/FAQ";
import Index from "./pages/Index";
import MediaAssets from "./pages/media/MediaAssets";
import MediaDashboard from "./pages/media/MediaDashboard";
import MediaDetail from "./pages/MediaDetail";
import MediaList from "./pages/MediaList";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Portfolio from "./pages/Portfolio";
import Pricing from "./pages/Pricing";
import Rating from "./pages/Rating";
import CreatorsLanding from "./pages/roles/CreatorsLanding";
import MediaLanding from "./pages/roles/MediaLanding";
import SuppliersLanding from "./pages/roles/SuppliersLanding";
import RoleSelection from "./pages/RoleSelection";
import CreateTask from "./pages/supplier/CreateTask";
import EditTask from "./pages/supplier/EditTask";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierTaskManagement from "./pages/supplier/SupplierTaskManagement";
import SupplierTaskDetail from "./pages/supplier/TaskDetail";
import SupplierDetail from "./pages/SupplierDetail";
import SuppliersList from "./pages/SuppliersList";
import TaskApplication from "./pages/TaskApplication";
import TaskDetail from "./pages/TaskDetail";
import TaskWorkflowDetail from "./pages/TaskWorkflowDetail";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <SiteHeader />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/my-workspace" element={<RoleDashboardEntry />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/faq" element={<FAQ />} />

              {/* 角色選擇頁面 */}
              <Route path="/role-selection" element={<RoleSelection />} />

              {/* Role landing pages */}
              <Route path="/for-suppliers" element={<SuppliersLanding />} />
              <Route path="/for-creators" element={<CreatorsLanding />} />
              <Route path="/for-media" element={<MediaLanding />} />

              {/* Directories */}
              <Route path="/suppliers" element={<SuppliersList />} />
              <Route path="/suppliers/:id" element={<SupplierDetail />} />
              <Route path="/creators" element={<CreatorsList />} />
              <Route path="/creators/:id" element={<CreatorDetail />} />
              <Route path="/media" element={<MediaList />} />
              <Route path="/media/:id" element={<MediaDetail />} />

              {/* Task related pages */}
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/tasks/:id/workflow" element={<TaskWorkflowDetail />} />
              <Route path="/tasks/:id/apply" element={<TaskApplication />} />
              <Route path="/tasks/:id/rating/:type" element={<Rating />} />

              {/* User dashboard pages */}
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/business-entities" element={<BusinessEntityManagement />} />

              {/* Supplier management - 需要供應商權限 */}
              <Route path="/supplier/tasks" element={
                <AuthGuard requiredRole="supplier">
                  <SupplierTaskManagement />
                </AuthGuard>
              } />
              <Route path="/supplier/dashboard" element={
                <AuthGuard requiredRole="supplier">
                  <SupplierDashboard />
                </AuthGuard>
              } />
              <Route path="/supplier/create-task" element={
                <AuthGuard requiredRole="supplier">
                  <CreateTask />
                </AuthGuard>
              } />
              <Route path="/supplier/edit-task/:id" element={
                <AuthGuard requiredRole="supplier">
                  <EditTask />
                </AuthGuard>
              } />
              <Route path="/supplier/tasks/:id" element={
                <AuthGuard requiredRole="supplier">
                  <SupplierTaskDetail />
                </AuthGuard>
              } />

              {/* Creator management - 需要創作者權限 */}
              <Route path="/creator/dashboard" element={
                <AuthGuard requiredRole="creator">
                  <CreatorDashboard />
                </AuthGuard>
              } />
              <Route path="/creator/tasks" element={
                <AuthGuard requiredRole="creator">
                  <CreatorTasks />
                </AuthGuard>
              } />
              <Route path="/creator/portfolio" element={
                <AuthGuard requiredRole="creator">
                  <CreatorPortfolio />
                </AuthGuard>
              } />

              {/* Media management - 需要媒體權限 */}
              <Route path="/media/dashboard" element={
                <AuthGuard requiredRole="media">
                  <MediaDashboard />
                </AuthGuard>
              } />
              <Route path="/media/assets" element={
                <AuthGuard requiredRole="media">
                  <MediaAssets />
                </AuthGuard>
              } />

              {/* Admin - 需要登入權限 */}
              <Route path="/admin" element={
                <AuthGuard requiredRole="admin">
                  <AdminLayout />
                </AuthGuard>
              }>
                <Route index element={<Dashboard />} />
                <Route path="suppliers" element={<SuppliersAdmin />} />
                <Route path="creators" element={<CreatorsAdmin />} />
                <Route path="media" element={<MediaAdmin />} />
                <Route path="tasks" element={<TasksAdmin />} />
                <Route path="assets" element={<AssetsAdmin />} />
                <Route path="permissions" element={<PermissionsAdmin />} />
                <Route path="users" element={<UsersAdmin />} />
                <Route path="business-entities" element={<BusinessEntitiesAdmin />} />
              </Route>

              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/backend-test" element={<BackendTest />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SiteFooter />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
</ErrorBoundary>
);

export default App;
