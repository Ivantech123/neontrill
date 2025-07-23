import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Filter,
  Search,
  Star,
  Gem,
  Sparkles,
  Crown,
  Zap,
  ChevronDown,
  Wallet,
} from "lucide-react";

import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { gameItems } from "@/data/gameItems";
import { useTonConnectUI } from "@tonconnect/ui-react";
import toast from "react-hot-toast";

const filters = [
  { label: "Все", value: "all", active: true },
  { label: "Common", value: "common", active: false },
  { label: "Rare", value: "rare", active: false },
  { label: "Epic", value: "epic", active: false },
  { label: "Legendary", value: "legendary", active: false },
];

export default function Shop() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [tonConnectUI] = useTonConnectUI();
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch shop items from the API with fallback to local data
  const {
    data: apiShopItems,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shopItems"],
    queryFn: () => apiClient.getShopItems(),
    retry: 1,
  });

  // Use API data if available, otherwise fallback to local gameItems
  const shopItems = apiShopItems || gameItems;

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Purchase item mutation
  const purchaseItemMutation = useMutation({
    mutationFn: (itemId: string) => apiClient.purchaseItem(itemId),
    onSuccess: (data) => {
      toast.success(`Successfully purchased ${data.item.name}!`);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userInventory"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to purchase item");
    },
  });

  const handlePurchase = (itemId: string) => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet first");
      return;
    }
    purchaseItemMutation.mutate(itemId);
  };

  const filteredItems = (shopItems || []).filter((item) => {
    const matchesFilter =
      selectedFilter === "all" ||
      item.rarity.toLowerCase() === selectedFilter.toLowerCase();
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "shadow-yellow-400/25 animate-pulse";
      case "Epic":
        return "shadow-purple-400/20";
      case "Rare":
        return "shadow-blue-400/15";
      default:
        return "";
    }
  };

  return (
    <MainLayout title="Gift Shop">
      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className={`relative ${animateCards ? "bounce-in" : "opacity-0"}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div
          className={`flex items-center space-x-3 overflow-x-auto pb-2 ${animateCards ? "bounce-in" : "opacity-0"}`}
          style={{ animationDelay: "0.1s" }}
        >
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant="outline"
              size="sm"
              onClick={() => setSelectedFilter(filter.value)}
              className={`whitespace-nowrap rounded-2xl transition-all duration-300 hover:scale-105 ${
                selectedFilter === filter.value
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg"
                  : "border-white/20 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50"
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        {isLoading && <p>Loading items...</p>}
        {error && <p>Error loading items: {error.message}</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <Card
              key={item.id}
              className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border p-4 space-y-3 rounded-3xl hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden ${getRarityBorder(item.rarity)} ${getRarityGlow(item.rarity)} ${animateCards ? "bounce-in" : "opacity-0"}`}
              style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
            >
              {/* Drop Chance Badge */}
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-xl">
                {(item.dropChance * 100).toFixed(1)}%
              </div>

              {/* Item Image Container */}
              <div
                className={`w-full h-28 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center text-4xl relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="transform transition-transform duration-300 group-hover:scale-110 relative z-10">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-contain mx-auto"
                    />
                  ) : (
                    <span className="text-4xl">{item.emoji}</span>
                  )}
                </div>

                {/* Rarity indicator in corner */}
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center">
                  {getRarityIcon(item.rarity)}
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
              </div>

              {/* Item Info */}
              <div className="space-y-2">
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 capitalize">
                    {item.rarity}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Gem className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-bold text-blue-400">
                      {item.basePrice}
                    </span>
                    <span className="text-xs text-gray-400">TON</span>
                  </div>
                  {item.rarity === "Legendary" && (
                    <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                  )}
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchase(item.id)}
                  disabled={purchaseItemMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs rounded-xl py-2 disabled:opacity-50"
                >
                  {purchaseItemMutation.isPending ? "Buying..." : "Buy Now"}
                </Button>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"></div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-bold mb-2">No items found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Connect Wallet Button */}
        {!isAuthenticated && (
          <div
            className={`pt-4 ${animateCards ? "bounce-in" : "opacity-0"}`}
            style={{ animationDelay: "0.6s" }}
          >
            <Button
              onClick={() => tonConnectUI.openModal()}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-600 text-white py-6 text-lg font-bold rounded-3xl flex items-center justify-center space-x-3 h-16 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <Wallet className="h-6 w-6 relative z-10" />
              <span className="relative z-10">Connect Wallet to Shop</span>
              <Sparkles className="h-6 w-6 relative z-10 animate-pulse" />
            </Button>
          </div>
        )}

        {/* Stats Bar */}
        <div
          className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-4 border border-white/10 ${animateCards ? "bounce-in" : "opacity-0"}`}
          style={{ animationDelay: "0.7s" }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {gameItems.length}
              </div>
              <div className="text-xs text-gray-400">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {gameItems.filter((item) => item.rarity === "Legendary").length}
              </div>
              <div className="text-xs text-gray-400">Legendary</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {filteredItems.length}
              </div>
              <div className="text-xs text-gray-400">Showing</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
