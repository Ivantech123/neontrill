import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Coins,
  User,
  Wallet,
  Gamepad2,
  Copy,
  TrendingUp,
  Gift,
  Star,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useGameSocket } from "@/hooks/useGameSocket";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { user, isAuthenticated } = useAuth();
  // Temporarily disable WebSocket to test render issue
  const isConnected = false;
  const navigate = useNavigate();
  const [animateCards, setAnimateCards] = useState(false);

  // Mock data to prevent rendering errors
  const userProfile = isAuthenticated
    ? {
        totalWinnings: 0,
        totalGames: 0,
        wins: 0,
        winRate: 0,
        netProfit: 0,
      }
    : null;

  const gameStats = {
    activePlayers: 0,
    totalGamesPlayed: 0,
    biggestWin24h: 0,
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimateCards(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const [tonConnectUI] = useTonConnectUI();

  const connectWallet = useCallback(() => {
    tonConnectUI.openModal();
  }, [tonConnectUI]);

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
            />
            <span className="text-xs text-gray-400">
              {isConnected ? "Online" : "Offline"}
            </span>
          </div>
          {gameStats && (
            <div className="text-xs text-gray-400">
              {gameStats?.activePlayers || 0} players online
            </div>
          )}
        </div>

        {/* User Stats Card */}
        {isAuthenticated && userProfile && (
          <Card
            className={`card-glass p-5 rounded-3xl ${animateCards ? "bounce-in" : "opacity-0"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Welcome back!</h3>
                  <p className="text-sm text-gray-400">
                    {user?.address.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">
                  {userProfile?.totalWinnings.toFixed(2) || "0.00"}
                </div>
                <div className="text-xs text-gray-400">Total Winnings</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  {userProfile?.totalGames || 0}
                </div>
                <div className="text-xs text-gray-400">Games</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  {userProfile?.wins || 0}
                </div>
                <div className="text-xs text-gray-400">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {((userProfile?.winRate || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Win Rate</div>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Staking Card */}
        <Card
          className={`card-glass p-6 rounded-3xl relative overflow-hidden ${animateCards ? "bounce-in" : "opacity-0"}`}
          style={{ animationDelay: "0.1s" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="relative space-y-5">
            <div className="flex items-center space-x-3">
              <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center pointer-events-none">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Стейкинг
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    58% APR
                  </span>
                  <Star className="h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              Мы делимся комиссией за игру с КАЖДЫМ пользователем, кто держит
              подарки в игровом инвентаре
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Твои гифты
                </p>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl px-4 py-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
                    <span className="font-bold text-lg">
                      {(userProfile?.totalWinnings || 0).toFixed(1)} TON
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Ты заработал
                </p>
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl px-4 py-4 border border-yellow-500/30 glow-effect">
                  <div className="flex items-center space-x-3">
                    <Coins className="h-6 w-6 text-yellow-400" />
                    <span className="font-bold text-lg text-yellow-400">
                      {(userProfile?.netProfit || 0).toFixed(1)} TON
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-sm text-gray-400">Твоё место -</span>
              <Button
                onClick={() => navigate("/leaderboard")}
                variant="outline"
                size="sm"
                className="h-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Лидерборд
              </Button>
            </div>
          </div>
        </Card>


        {/* Game Actions */}
        <div
          className={`grid grid-cols-2 gap-4 ${animateCards ? "bounce-in" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          <Link to="/rolls">
            <Button className="w-full h-24 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex flex-col space-y-2">
              <Gamepad2 className="h-8 w-8" />
              <div className="text-center">
                <div className="font-bold">Play Rolls</div>
                <div className="text-xs opacity-90">Spin & Win</div>
              </div>
            </Button>
          </Link>

          <Link to="/shop">
            <Button className="w-full h-24 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-3xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex flex-col space-y-2">
              <Gift className="h-8 w-8" />
              <div className="text-center">
                <div className="font-bold">Gift Shop</div>
                <div className="text-xs opacity-90">Buy Items</div>
              </div>
            </Button>
          </Link>
        </div>

        {/* Connect Wallet Button */}
        {!isAuthenticated && (
          <div
            className={`${animateCards ? "bounce-in" : "opacity-0"}`}
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              onClick={connectWallet}
              className="w-full button-premium text-black py-6 text-lg font-bold rounded-3xl h-16 relative overflow-hidden group"
            >
              <div className="absolute inset-0 shimmer pointer-events-none"></div>
              <div className="flex items-center justify-center space-x-3 relative z-10">
                <Wallet className="h-6 w-6" />
                <span>Подключи кошелек</span>
              </div>
            </Button>
          </div>
        )}



        {/* Enhanced Referral Section */}
        <div
          className={`space-y-5 ${animateCards ? "bounce-in" : "opacity-0"}`}
          style={{ animationDelay: "0.5s" }}
        >
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">@!Blog_Ivan</p>
            <h3 className="font-bold text-xl leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Приглашай друзей и получай 10% с их комиссий
            </h3>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="secondary"
              size="sm"
              className="h-14 w-14 p-0 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-gray-600 shadow-lg hover:shadow-gray-500/25 transition-all duration-300 hover:scale-110"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Referral link copied!");
              }}
            >
              <Copy className="w-6 h-6" />
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
              Пригласить друзей
            </Button>
          </div>

          <div className="flex justify-between text-sm text-gray-400 pt-2">
            <span>
              Ты пригласил: <span className="text-white font-bold">0</span>
            </span>
            <span>
              Ты заработал:{" "}
              <span className="text-yellow-400 font-bold">0 TON</span>
            </span>
          </div>
        </div>

        {/* Global Stats */}
        {gameStats && (
          <Card
            className={`card-glass p-4 rounded-2xl ${animateCards ? "bounce-in" : "opacity-0"}`}
            style={{ animationDelay: "0.6s" }}
          >
            <h3 className="text-lg font-bold mb-4 text-center">
              🌍 Global Stats
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {gameStats?.totalGamesPlayed || 0}
                </div>
                <div className="text-xs text-gray-400">Games Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {(gameStats?.biggestWin24h || 0).toFixed(1)} TON
                </div>
                <div className="text-xs text-gray-400">Biggest Win 24h</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
