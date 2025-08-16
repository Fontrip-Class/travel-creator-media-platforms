import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
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
import SuppliersLanding from "@/pages/roles/SuppliersLanding";
import CreatorsLanding from "@/pages/roles/CreatorsLanding";
import MediaLanding from "@/pages/roles/MediaLanding";
import TaskDetail from "@/pages/TaskDetail";
import TaskApplication from "@/pages/TaskApplication";
import Rating from "@/pages/Rating";
import Notifications from "@/pages/Notifications";
import Portfolio from "@/pages/Portfolio";
import SupplierTaskManagement from "@/pages/supplier/SupplierTaskManagement";
const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
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
            <Route path="/tasks/:id/apply" element={<TaskApplication />} />
            <Route path="/tasks/:id/rating/:type" element={<Rating />} />
            
            {/* User dashboard pages */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/portfolio" element={<Portfolio />} />
            
            {/* Supplier management */}
            <Route path="/supplier/tasks" element={<SupplierTaskManagement />} />

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
</ErrorBoundary>
);

export default App;
