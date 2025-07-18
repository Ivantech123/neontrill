import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  User,
  Coins,
  Wallet,
  LogOut,
  Settings,
  Trophy,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { TONLoginButton } from "@/components/ton-login-button/TONLoginButton";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function Header({ title, showBackButton, onBack }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast.success("Disconnected from wallet");
  };

  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-white/10">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Title or Back */}
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 w-8 p-0 rounded-xl hover:bg-white/10"
              >
                ←
              </Button>
            )}
            {title && (
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {title}
              </h1>
            )}
          </div>

          {/* Right side - User info or Connect button */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-xl hover:bg-white/10 relative"
            >
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></div>
            </Button>

            {isAuthenticated && user ? (
              <div className="relative">
                {/* User info */}
                <Button
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl px-3 py-2 border border-blue-500/30 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user.username || user.address.slice(0, 6) + "..."}
                  </span>
                  <Coins className="h-4 w-4 text-yellow-400" />
                </Button>

                {/* User menu dropdown */}
                {showUserMenu && (
                  <Card className="absolute right-0 top-full mt-2 w-64 bg-gray-800/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-50">
                    <div className="space-y-4">
                      {/* User stats */}
                      <div className="text-center pb-3 border-b border-white/10">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <p className="font-semibold text-white">
                          {user.username || "Player"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user.address.slice(0, 8)}...{user.address.slice(-6)}
                        </p>
                      </div>

                      {/* Balance */}
                      <div className="flex items-center justify-between bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-3 border border-yellow-500/30">
                        <div className="flex items-center space-x-2">
                          <Coins className="h-5 w-5 text-yellow-400" />
                          <span className="text-white font-medium">
                            Balance
                          </span>
                        </div>
                        <span className="text-yellow-400 font-bold">
                          {user.balance || 0} TON
                        </span>
                      </div>

                      {/* Menu items */}
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-xl hover:bg-white/10"
                        >
                          <Trophy className="h-4 w-4 mr-3" />
                          Leaderboard
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-xl hover:bg-white/10"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full justify-start rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Disconnect
                        </Button>
                        
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              /* Connect Button - will use TonConnect from main page */
              <TONLoginButton onDisconnect={() => setShowUserMenu(false)} />
            )}
          </div>
        </div>

        {/* Close user menu when clicking outside */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </div>
    </div>
  );
}
