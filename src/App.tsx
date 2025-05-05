
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DefensorDashboard from "./pages/defensor/DefensorDashboard";
import AbogadoDashboard from "./pages/abogado/AbogadoDashboard";
import MostradorDashboard from "./pages/mostrador/MostradorDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Administrador routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Defensor routes */}
            <Route path="/defensor/dashboard" element={<DefensorDashboard />} />
            
            {/* Abogado routes */}
            <Route path="/abogado/dashboard" element={<AbogadoDashboard />} />
            
            {/* Mostrador routes */}
            <Route path="/mostrador/dashboard" element={<MostradorDashboard />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
