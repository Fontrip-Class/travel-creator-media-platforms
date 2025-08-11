import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SuppliersList from "./pages/SuppliersList";
import SupplierDetail from "./pages/SupplierDetail";
import CreatorsList from "./pages/CreatorsList";
import CreatorDetail from "./pages/CreatorDetail";
import MediaList from "./pages/MediaList";
import MediaDetail from "./pages/MediaDetail";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import SuppliersAdmin from "@/pages/admin/Suppliers";
import CreatorsAdmin from "@/pages/admin/Creators";
import MediaAdmin from "@/pages/admin/Media";
import TasksAdmin from "@/pages/admin/Tasks";
import AssetsAdmin from "@/pages/admin/Assets";
import PermissionsAdmin from "@/pages/admin/Permissions";
import Register from "@/pages/auth/Register";
import Login from "@/pages/auth/Login";
import About from "@/pages/About";
import Pricing from "@/pages/Pricing";
import FAQ from "@/pages/FAQ";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HelmetProvider>
        <BrowserRouter>
          <SiteHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/suppliers" element={<SuppliersList />} />
            <Route path="/suppliers/:id" element={<SupplierDetail />} />
            <Route path="/creators" element={<CreatorsList />} />
            <Route path="/creators/:id" element={<CreatorDetail />} />
            <Route path="/media" element={<MediaList />} />
            <Route path="/media/:id" element={<MediaDetail />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="suppliers" element={<SuppliersAdmin />} />
              <Route path="creators" element={<CreatorsAdmin />} />
              <Route path="media" element={<MediaAdmin />} />
              <Route path="tasks" element={<TasksAdmin />} />
              <Route path="assets" element={<AssetsAdmin />} />
              <Route path="permissions" element={<PermissionsAdmin />} />
            </Route>

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SiteFooter />
        </BrowserRouter>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
