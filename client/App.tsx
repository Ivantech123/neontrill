import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./layout/MainLayout";
import Index from "./pages/Index";
import Rolls from "./pages/Rolls";
import Shop from "./pages/Shop";
import MyGifts from "./pages/MyGifts";
import Earnings from "./pages/Earnings";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

// Configure QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// TON Connect manifest URL
const manifestUrl = "/tonconnect-manifest.json";

const App = () => (
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/rolls" element={<Rolls />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/my-gifts" element={<MyGifts />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </TonConnectUIProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
