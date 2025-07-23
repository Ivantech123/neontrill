import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Coins,
  Calendar,
  Download,
  Trophy,
  Users,
  Target,
  Clock,
  DollarSign,
  Gift,
} from "lucide-react";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { useTonConnectUI } from "@tonconnect/ui-react";

export default function Earnings() {
  const { isAuthenticated } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const connectWallet = () => tonConnectUI.openModal();
  const queryClient = useQueryClient();
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Fetch earnings data
  const { data: earnings, isLoading } = useQuery({
    queryKey: ["earnings", selectedPeriod],
    queryFn: () => apiClient.getEarnings(selectedPeriod),
    enabled: isAuthenticated,
  });

  // Claim earnings mutation
  const claimEarningsMutation = useMutation({
    mutationFn: () => apiClient.claimEarnings(),
    onSuccess: (data) => {
      toast.success(`Claimed ${data.amount} TON!`);
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to claim earnings");
    },
  });

  const handleClaimEarnings = () => {
    claimEarningsMutation.mutate();
  };

  const periods = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "All Time", value: "all" },
  ];

  if (!isAuthenticated) {
    return (
      <MainLayout title="Earnings">
        <div className="p-4 text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your earnings
          </p>
          <Button
            onClick={connectWallet}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl px-8 py-3"
          >
            Connect Wallet
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout title="Earnings">
        <div className="p-4 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-800/50 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Earnings">
      <div className="p-4 space-y-6">
        {/* Period Selector */}
        <div
          className={`flex items-center space-x-3 overflow-x-auto pb-2 ${animateCards ? "bounce-in" : "opacity-0"}`}
        >
          {periods.map((period) => (
            <Button
              key={period.value}
              variant="outline"
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className={`whitespace-nowrap rounded-2xl transition-all duration-300 hover:scale-105 ${
                selectedPeriod === period.value
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg"
                  : "border-white/20 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50"
              }`}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Main Earnings Card */}
        <Card
          className={`card-glass p-6 rounded-3xl relative overflow-hidden ${animateCards ? "bounce-in" : "opacity-0"}`}
          style={{ animationDelay: "0.1s" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5"></div>
          <div className="relative space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Total Earnings</h2>
                  <p className="text-sm text-gray-400">
                    {selectedPeriod === "all"
                      ? "All time"
                      : `Last ${selectedPeriod}`}
                  </p>
                </div>
              </div>
              {earnings?.canClaim && (
                <Button
                  onClick={handleClaimEarnings}
                  disabled={claimEarningsMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-2xl px-6 py-2"
                >
                  {claimEarningsMutation.isPending ? "Claiming..." : "Claim"}
                </Button>
              )}
            </div>

            <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              {earnings?.totalEarnings.toFixed(4) || "0.0000"} TON
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-1">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-400">Unclaimed</span>
                </div>
                <div className="text-lg font-bold text-yellow-400">
                  {earnings?.unclaimedEarnings.toFixed(4) || "0.0000"} TON
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-400">Growth</span>
                </div>
                <div className="text-lg font-bold text-green-400">
                  +{earnings?.growthPercentage.toFixed(1) || "0.0"}%
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Earnings Sources */}
        <div
          className={`space-y-4 ${animateCards ? "bounce-in" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="text-lg font-bold">Earnings Sources</h3>

          {/* Staking Rewards */}
          <Card className="card-glass p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Staking Rewards</h4>
                  <p className="text-xs text-gray-400">
                    From holding gifts • 58% APR
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-400">
                  {earnings?.sources.staking.toFixed(4) || "0.0000"} TON
                </div>
                <div className="text-xs text-gray-400">
                  +{earnings?.sources.stakingGrowth.toFixed(1) || "0.0"}%
                </div>
              </div>
            </div>
          </Card>

          {/* Gaming Wins */}
          <Card className="card-glass p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Gaming Wins</h4>
                  <p className="text-xs text-gray-400">
                    From rolls and games • {earnings?.sources.gamesWon || 0}{" "}
                    wins
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-400">
                  {earnings?.sources.gaming.toFixed(4) || "0.0000"} TON
                </div>
                <div className="text-xs text-gray-400">
                  {earnings?.sources.gamesWon || 0} games
                </div>
              </div>
            </div>
          </Card>

          {/* Referral Commissions */}
          <Card className="card-glass p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Referral Commissions</h4>
                  <p className="text-xs text-gray-400">
                    10% from friends • {earnings?.sources.referralsCount || 0}{" "}
                    referrals
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">
                  {earnings?.sources.referrals.toFixed(4) || "0.0000"} TON
                </div>
                <div className="text-xs text-gray-400">
                  {earnings?.sources.referralsCount || 0} friends
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div
          className={`space-y-4 ${animateCards ? "bounce-in" : "opacity-0"}`}
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Transactions</h3>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {earnings?.recentTransactions?.length > 0 ? (
            <div className="space-y-3">
              {earnings.recentTransactions.map((tx: any, index: number) => (
                <Card
                  key={tx.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 p-4 rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          tx.type === "staking"
                            ? "bg-blue-500/20"
                            : tx.type === "gaming"
                              ? "bg-purple-500/20"
                              : "bg-green-500/20"
                        }`}
                      >
                        {tx.type === "staking" ? (
                          <Gift className="h-4 w-4 text-blue-400" />
                        ) : tx.type === "gaming" ? (
                          <Trophy className="h-4 w-4 text-purple-400" />
                        ) : (
                          <Users className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{tx.description}</div>
                        <div className="text-xs text-gray-400 flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(tx.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400">
                        +{tx.amount.toFixed(4)} TON
                      </div>
                      <div className="text-xs text-gray-400">
                        ${tx.usdValue}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-400">No transactions yet</p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <Card
          className={`card-glass p-4 rounded-2xl ${animateCards ? "bounce-in" : "opacity-0"}`}
          style={{ animationDelay: "0.4s" }}
        >
          <h3 className="text-lg font-bold mb-4 text-center">📈 Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {earnings?.stats.totalDaysActive || 0}
              </div>
              <div className="text-xs text-gray-400">Days Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {earnings?.stats.avgDailyEarnings.toFixed(4) || "0.0000"}
              </div>
              <div className="text-xs text-gray-400">Avg Daily (TON)</div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
