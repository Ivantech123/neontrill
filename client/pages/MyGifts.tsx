import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Gift,
  Star,
  Sparkles,
  Crown,
  TrendingUp,
  Filter,
  MoreVertical,
  Send,
  Trash2,
} from "lucide-react";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { useTonConnectUI } from "@tonconnect/ui-react";

export default function MyGifts() {
  const { isAuthenticated } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const connectWallet = () => tonConnectUI.openModal();
  const queryClient = useQueryClient();
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Fetch user inventory
  const { data: inventory, isLoading } = useQuery({
    queryKey: ["userInventory"],
    queryFn: () => apiClient.getUserInventory(),
    enabled: isAuthenticated,
  });

  // Sell item mutation
  const sellItemMutation = useMutation({
    mutationFn: (itemId: string) => apiClient.sellItem(itemId),
    onSuccess: (data) => {
      toast.success(`Sold item for ${data.price} TON!`);
      queryClient.invalidateQueries({ queryKey: ["userInventory"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to sell item");
    },
  });

  const handleSellItem = (itemId: string) => {
    sellItemMutation.mutate(itemId);
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return <Star className="h-3 w-3 text-gray-400" />;
      case "Rare":
        return <Star className="h-3 w-3 text-blue-400" />;
      case "Epic":
        return <Sparkles className="h-3 w-3 text-purple-400" />;
      case "Legendary":
        return <Crown className="h-3 w-3 text-yellow-400" />;
      default:
        return <Star className="h-3 w-3 text-gray-400" />;
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "border-gray-400/50";
      case "Rare":
        return "border-blue-400/50 shadow-blue-400/20";
      case "Epic":
        return "border-purple-400/50 shadow-purple-400/20";
      case "Legendary":
        return "border-yellow-400/50 shadow-yellow-400/30";
      default:
        return "border-gray-400/50";
    }
  };

  const filteredItems =
    inventory?.items.filter((item: any) => {
      if (selectedFilter === "all") return true;
      return item.rarity.toLowerCase() === selectedFilter;
    }) || [];

  const totalValue =
    inventory?.items.reduce(
      (sum: number, item: any) => sum + item.currentPrice,
      0,
    ) || 0;

  if (!isAuthenticated) {
    return (
      <MainLayout title="My Gifts">
        <div className="p-4 text-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your gift collection
          </p>
          <Button onClick={connectWallet} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl px-8 py-3">
            Connect Wallet
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout title="My Gifts">
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
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
    <MainLayout title="My Gifts">
      <div className="p-4 space-y-6">
        {/* Portfolio Overview */}
        <Card
          className={`card-glass p-5 rounded-3xl ${animateCards ? "bounce-in" : "opacity-0"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">My Collection</h3>
                <p className="text-sm text-gray-400">
                  {filteredItems.length} items
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {totalValue.toFixed(2)} TON
              </div>
              <div className="text-xs text-gray-400">Total Value</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {inventory?.stats.totalItems || 0}
              </div>
              <div className="text-xs text-gray-400">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {inventory?.stats.legendaryCount || 0}
              </div>
              <div className="text-xs text-gray-400">Legendary</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                +{inventory?.stats.portfolioGrowth.toFixed(1) || 0}%
              </div>
              <div className="text-xs text-gray-400">24h Growth</div>
            </div>
          </div>
        </Card>

        {/* Filter Buttons */}
        <div
          className={`flex items-center space-x-3 overflow-x-auto pb-2 ${animateCards ? "bounce-in" : "opacity-0"}`}
          style={{ animationDelay: "0.1s" }}
        >
          {["all", "common", "rare", "epic", "legendary"].map((filter) => (
            <Button
              key={filter}
              variant="outline"
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className={`whitespace-nowrap rounded-2xl transition-all duration-300 hover:scale-105 capitalize ${
                selectedFilter === filter
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg"
                  : "border-white/20 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50"
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item: any, index: number) => (
              <Card
                key={item.id}
                className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border p-4 rounded-3xl hover:scale-105 transition-all duration-300 group relative overflow-hidden ${getRarityBorder(item.rarity)} ${animateCards ? "bounce-in" : "opacity-0"}`}
                style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
              >
                <div className="flex items-center space-x-4">
                  {/* Item Image */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-2xl relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm rounded-full w-5 h-5 flex items-center justify-center">
                      {getRarityIcon(item.rarity)}
                    </div>
                    <div className="transform transition-transform duration-300 group-hover:scale-110">
                      {item.emoji}
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">
                        {item.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-xl hover:bg-white/10"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 capitalize">
                          {item.rarity} • Owned since{" "}
                          {new Date(item.acquiredAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-bold text-yellow-400">
                              {item.currentPrice.toFixed(2)} TON
                            </span>
                            <span className="text-xs text-gray-400">
                              Current
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp
                              className={`h-3 w-3 ${item.priceChange >= 0 ? "text-green-400" : "text-red-400"}`}
                            />
                            <span
                              className={`text-xs font-medium ${item.priceChange >= 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {item.priceChange >= 0 ? "+" : ""}
                              {item.priceChange.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Send
                        </Button>
                        <Button
                          onClick={() => handleSellItem(item.id)}
                          disabled={sellItemMutation.isPending}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Sell
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-bold mb-2">No gifts yet</h3>
            <p className="text-gray-400 mb-6">
              Start playing and spinning to collect amazing gifts!
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl px-8 py-3">
              Go to Rolls
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
