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
            <Route path="/suppliers" element={<SuppliersList />} />
            <Route path="/suppliers/:id" element={<SupplierDetail />} />
            <Route path="/creators" element={<CreatorsList />} />
            <Route path="/creators/:id" element={<CreatorDetail />} />
            <Route path="/media" element={<MediaList />} />
            <Route path="/media/:id" element={<MediaDetail />} />
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
