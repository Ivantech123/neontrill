import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MoreHorizontal,
  X,
  Star,
  Crown,
  Sparkles,
  Zap,
  Coins,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/layout/MainLayout";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useGameSocket } from "@/hooks/useGameSocket";
import {
  gameItems,
  getRandomItem,
  getRarityColor,
  getRarityGlow,
  GameItem,
} from "@/data/gameItems";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { useTonConnectUI } from "@tonconnect/ui-react";

export default function Rolls() {
  useBackendAuth();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => apiClient.getUserProfile(),
    enabled: !!localStorage.getItem("authToken"),
  });

  const isAuthenticated = !!userProfile;
  const [tonConnectUI] = useTonConnectUI();
  const connectWallet = () => tonConnectUI.openModal();
  const queryClient = useQueryClient();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [rollCount, setRollCount] = useState(1);
  const [spinDuration, setSpinDuration] = useState(4000);

  // Game server WebSocket connection
  const {
    isConnected,
    sendEvent,
    connectionError,
    reconnect,
  } = useGameSocket();

  // Provably Fair state
  const [clientSeed, setClientSeed] = useState('');
  const [serverSeedHash, setServerSeedHash] = useState<string | null>(null);
  const [lastSpinResult, setLastSpinResult] = useState<{ item: GameItem; serverSeed: string; clientSeed: string; nonce: number } | null>(null);
  const [nonce, setNonce] = useState(0);

  // Fetch game stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["gameStats"],
    queryFn: () => apiClient.getStats(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: gameItems, isLoading: isLoadingItems } = useQuery<GameItem[]>({
    queryKey: ["shopItems"],
    queryFn: () => apiClient.getShopItems(),
  });

  useEffect(() => {
    setAnimateCards(true);
    // Generate initial client seed
    setClientSeed(Math.random().toString(36).substring(2));
    // Fetch initial server seed hash
    if (isAuthenticated) {
      fetchServerSeedHash();
    }
  }, [isAuthenticated]);

  const fetchServerSeedHash = async () => {
    try {
      const { seedHash } = await apiClient.getRouletteSeed();
      setServerSeedHash(seedHash);
      setNonce(0); // Reset nonce when new server seed is fetched
    } catch (error) {
      toast.error("Could not fetch game seed. Please refresh.");
    }
  };

  const spinMutation = useMutation({
    mutationFn: (variables: { clientSeed: string; rollCount: number }) =>
      apiClient.spinRoulette(variables.clientSeed, variables.rollCount),
    onSuccess: (data, variables) => {
      const { item: winningItem, serverSeed } = data;
      if (!gameItems) return;

      // Store result for verification
      setLastSpinResult({ ...data, clientSeed: variables.clientSeed, nonce });

      // Animate wheel
      const segmentAngle = 360 / gameItems.length;
      const winningIndex = gameItems.findIndex((item) => item.id === winningItem.id);
      if (winningIndex === -1) {
        toast.error("Winning item not found!");
        setIsSpinning(false);
        return;
      }
      const baseSpins = 5 + Math.random() * 5;
      const finalSpinAmount = baseSpins * 360;
      const targetAngle = winningIndex * segmentAngle + segmentAngle / 2;
      const finalRotation = rotation + finalSpinAmount + (360 - targetAngle);
      setRotation(finalRotation);

      setTimeout(() => {
        setSelectedItem(winningItem);
        setIsSpinning(false);
        toast.success(`You won ${winningItem.name}!`);
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        refetchStats();
        // Prepare for next spin
        setNonce(nonce + 1);
        setClientSeed(Math.random().toString(36).substring(2));
      }, spinDuration);
    },
    onError: (error: any) => {
      toast.error(error.message || "Spin failed!");
      setIsSpinning(false);
      // Fetch a new server seed on error, as the sequence might be broken
      fetchServerSeedHash();
    },
  });

  const spinWheel = useCallback(() => {
    if (isSpinning || !isAuthenticated || !serverSeedHash) {
      if (!isAuthenticated) toast.error("Please connect your wallet first");
      if (!serverSeedHash) toast.error("Game server connection error. Please refresh.");
      return;
    }
    setIsSpinning(true);
    toast.loading("Spinning...", { id: "spin-toast" });
    spinMutation.mutate({ clientSeed, rollCount });
  }, [
    isSpinning,
    isAuthenticated,
    serverSeedHash,
    rollCount,
    clientSeed,
    spinMutation,
    spinDuration,
    isConnected,
    sendEvent,
  ]);

  const handleMultipleRolls = (count: number) => {
    setRollCount(count);
  };

  if (!isAuthenticated) {
    return (
      <MainLayout title="Magic Rolls">
        <div className="p-4 text-center">
          <Card className="card-glass p-8 rounded-3xl">
            <div className="text-6xl mb-4">🎰</div>
            <h2 className="text-xl font-bold mb-4">Connect Wallet to Play</h2>
            <p className="text-gray-400 mb-6">
              Connect your TON wallet to start spinning and winning amazing
              prizes!
            </p>
            <Button onClick={connectWallet} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-bold">
              Connect Wallet
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Magic Rolls">
      <div className="p-4 space-y-6">
        {/* Connection Status */}
        {connectionError && (
          <Card className="bg-red-500/20 border-red-500/50 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <X className="h-5 w-5 text-red-400" />
                <span className="text-red-400">Connection Error</span>
              </div>
              <Button
                onClick={reconnect}
                size="sm"
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-500/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Game Stats */}
        {stats && (
          <Card className="card-glass p-4 rounded-2xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-yellow-400">
                  {stats.totalGamesPlayed}
                </div>
                <div className="text-xs text-gray-400">Games Played</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">
                  {stats.biggestWin24h.toFixed(1)} TON
                </div>
                <div className="text-xs text-gray-400">Biggest Win</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">
                  {stats.activePlayers}
                </div>
                <div className="text-xs text-gray-400">Online</div>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Wheel Section */}
        <div
          className={`space-y-6 ${animateCards ? "bounce-in" : "opacity-0"}`}
        >
          <div className="flex flex-col items-center space-y-6">
            {/* Roll Cost Display */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl px-6 py-3 border border-yellow-500/30">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-bold">
                  {rollCount} Roll{rollCount > 1 ? "s" : ""} ={" "}
                  {(rollCount * 0.1).toFixed(1)} TON
                </span>
              </div>
            </div>

            <div className="relative">
              {/* Enhanced glow effects based on rarity */}
              <div
                className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
                  isSpinning
                    ? "bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-pink-500/30 animate-pulse"
                    : "bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10"
                }`}
              ></div>

              {/* Wheel Container with improved physics */}
              <div className="relative w-80 h-80 rounded-full shadow-2xl">
                {/* Outer decorative ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-inner p-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl"></div>
                </div>

                {/* Inner spinning wheel */}
                <div
                  className="absolute inset-4 rounded-full overflow-hidden shadow-2xl"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning
                      ? `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                      : "transform 0.5s ease-out",
                  }}
                >
                  {gameItems.map((item, index) => {
                    const angle = (360 / gameItems.length) * index;
                    const nextAngle = (360 / gameItems.length) * (index + 1);
                    return (
                      <div
                        key={item.id}
                        className={`absolute inset-0 bg-gradient-to-br ${item.gradient} flex items-center justify-center group transition-all duration-300`}
                        style={{
                          clipPath: `polygon(50% 50%, 
                            ${50 + 50 * Math.cos((angle * Math.PI) / 180)}% ${
                              50 + 50 * Math.sin((angle * Math.PI) / 180)
                            }%, 
                            ${50 + 50 * Math.cos((nextAngle * Math.PI) / 180)}% ${
                              50 + 50 * Math.sin((nextAngle * Math.PI) / 180)
                            }%)`,
                        }}
                      >
                        <div
                          className="text-3xl filter drop-shadow-lg transform transition-transform duration-300"
                          style={{
                            transform: `rotate(${angle + 360 / gameItems.length / 2}deg)`,
                            transformOrigin: "center",
                          }}
                        >
                          {item.emoji}
                        </div>

                        {/* Rarity indicator */}
                        <div
                          className={`absolute top-2 left-2 w-2 h-2 rounded-full ${
                            item.rarity === "Mythic"
                              ? "bg-red-400 animate-pulse"
                              : item.rarity === "Legendary"
                                ? "bg-yellow-400 animate-pulse"
                                : item.rarity === "Epic"
                                  ? "bg-purple-400"
                                  : item.rarity === "Rare"
                                    ? "bg-blue-400"
                                    : "bg-gray-400"
                          }`}
                        ></div>
                      </div>
                    );
                  })}
                </div>

                {/* Enhanced Center Hub */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-full flex items-center justify-center border-4 border-gray-600 shadow-2xl">
                    <div className="text-center">
                      <Sparkles className="h-5 w-5 mx-auto mb-1 text-yellow-400 animate-pulse" />
                      <div className="text-xs text-white font-bold">SPIN</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Pointer */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-white shadow-lg filter drop-shadow-lg"></div>
                  <div className="w-6 h-6 bg-gradient-to-br from-white to-gray-200 rounded-full -mt-2 mx-auto shadow-lg border-2 border-gray-300"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Roll Buttons */}
            <div className="space-y-4 w-full max-w-sm">
              {/* Main Spin Button */}
              <Button
                className={`w-full py-6 text-xl font-black rounded-3xl shadow-2xl transition-all duration-300 relative overflow-hidden ${
                  isSpinning
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 hover:scale-105"
                }`}
                onClick={spinWheel}
                disabled={isSpinning || !isConnected}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  {isSpinning ? (
                    <>
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span>Spinning...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-6 w-6" />
                      <span>SPIN {rollCount > 1 ? `${rollCount}x` : ""}</span>
                      <Zap className="h-6 w-6" />
                    </>
                  )}
                </div>
              </Button>

              {/* Roll Count Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 25].map((count) => (
                  <Button
                    key={count}
                    variant={rollCount === count ? "default" : "secondary"}
                    size="sm"
                    onClick={() => handleMultipleRolls(count)}
                    className={`py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                      rollCount === count
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {count}x
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Provably Fair Section */}
        <Card className="card-glass p-4 rounded-2xl text-xs mt-4">
          <h3 className="font-bold mb-2 text-white">Provably Fair</h3>
          <div className="space-y-2 text-gray-400">
            <div>
              <p>Server Seed Hash (revealed after spin):</p>
              <p className="font-mono text-white truncate">{serverSeedHash || 'Not available'}</p>
            </div>
            <div>
              <p>Your Client Seed (you can change this):</p>
              <input 
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded p-1 font-mono text-white"
              />
            </div>
            {lastSpinResult && (
              <div className="pt-2 border-t border-gray-700/50">
                <h4 className="font-bold text-white">Last Spin Verification</h4>
                <p>Nonce: <span className="font-mono text-white">{lastSpinResult.nonce}</span></p>
                <p>Server Seed: <span className="font-mono text-white truncate">{lastSpinResult.serverSeed}</span></p>
                <p>Result: <span className="font-mono text-white">{lastSpinResult.item.name}</span></p>
                {/* TODO: Add a button to trigger client-side verification */}
              </div>
            )}
          </div>
        </Card>

        {/* Recent Items Preview */}
        <Card className="card-glass p-4 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            <span>Available Items</span>
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {gameItems.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className={`bg-gradient-to-br ${item.gradient} p-3 rounded-xl text-center group hover:scale-105 transition-all duration-300 ${getRarityGlow(item.rarity)}`}
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-xs text-white font-medium truncate">
                  {item.name}
                </div>
                <div className="text-xs text-white/80">
                  {item.basePrice} TON
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Win Result Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-sm bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-white/20 p-8 text-center space-y-6 rounded-3xl shadow-2xl">
              <div className="text-8xl animate-bounce mb-4">
                {selectedItem.emoji}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedItem.name}
                </h3>
                <p
                  className={`text-lg font-semibold ${getRarityColor(selectedItem.rarity)} mb-2`}
                >
                  {selectedItem.rarity}
                </p>
                <p className="text-gray-300 text-sm mb-4">
                  {selectedItem.description}
                </p>
                <div className="flex items-center justify-center space-x-2 text-yellow-400 text-xl font-bold">
                  <Coins className="h-6 w-6" />
                  <span>{selectedItem.basePrice} TON</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl py-4 font-bold shadow-lg"
                  onClick={() => setSelectedItem(null)}
                >
                  Claim Prize! 🎉
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 rounded-2xl py-3"
                  onClick={() => {
                    setSelectedItem(null);
                    spinWheel();
                  }}
                  disabled={isSpinning}
                >
                  Spin Again
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
