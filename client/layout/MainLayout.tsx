import React from "react";
import { Header } from "./Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Toaster } from "react-hot-toast";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  hideNavigation?: boolean;
}

export function MainLayout({
  children,
  title,
  showBackButton,
  onBack,
  hideNavigation = false,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-ton-gold-glow/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-accent/20 rounded-full animate-bounce"></div>
      </div>

      {/* Header */}
      <Header title={title} showBackButton={showBackButton} onBack={onBack} />

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto relative z-10 pb-24 min-h-screen">
        <div className="relative z-20">{children}</div>
      </main>

      {/* Bottom Navigation */}
      {!hideNavigation && <BottomNavigation />}

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "hsl(220 25% 18%)",
            color: "hsl(0 0% 100%)",
            border: "1px solid hsl(220 30% 25%)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "hsl(158 100% 60%)",
              secondary: "hsl(220 25% 18%)",
            },
          },
          error: {
            iconTheme: {
              primary: "hsl(0 84% 60%)",
              secondary: "hsl(220 25% 18%)",
            },
          },
        }}
      />
    </div>
  );
}
