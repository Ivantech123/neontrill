import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coins, Users, Clock, Trophy, Plus } from "lucide-react";
import { apiClient, Game, GameStats } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Gaming() {
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [newGame, setNewGame] = useState({
    minBet: 0.1,
    maxBet: 1.0,
    maxPlayers: 4,
  });

  const { isConnected, lastMessage, error, createGame, joinGame } =
    useWebSocket();

  // Load initial data
  useEffect(() => {
    loadGames();
    loadStats();
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "games:list":
        setGames(lastMessage.data);
        break;
      case "game:created":
      case "game:updated":
        setGames((prev) => {
          const existing = prev.find((g) => g.id === lastMessage.data.id);
          if (existing) {
            return prev.map((g) =>
              g.id === lastMessage.data.id ? lastMessage.data : g,
            );
          } else {
            return [...prev, lastMessage.data];
          }
        });
        break;
      case "game:result":
        // Refresh stats after game ends
        loadStats();
        break;
    }
  }, [lastMessage]);

  const loadGames = async () => {
    try {
      const gamesData = await apiClient.getGames();
      setGames(gamesData);
    } catch (error) {
      console.error("Failed to load games:", error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await apiClient.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleCreateGame = () => {
    createGame([newGame.minBet, newGame.maxBet], newGame.maxPlayers);
    setShowCreateGame(false);
  };

  const handleJoinGame = (game: Game) => {
    const betAmount = game.betRange[0]; // Use minimum bet
    joinGame(game.id, betAmount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-blue-500";
      case "starting":
        return "bg-yellow-500";
      case "active":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "Waiting for players";
      case "starting":
        return "Starting soon";
      case "active":
        return "In progress";
      case "finished":
        return "Finished";
      default:
        return status;
    }
  };

  if (!apiClient.isAuthenticated()) {
    return (
      <div className="p-4">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-lg font-semibold mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground text-sm">
            Please connect your TON wallet to access gaming features
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">PvP Gaming</h1>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}

      {/* Stats */}
      {stats && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Global Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-ton-gold">
                {stats.totalBets24h.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Bets 24h
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {stats.biggestWin24h.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Biggest Win</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.activePlayers}</div>
              <div className="text-xs text-muted-foreground">
                Active Players
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {(stats.winRate * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
          </div>
        </Card>
      )}

      {/* Create Game Button */}
      <Button
        onClick={() => setShowCreateGame(!showCreateGame)}
        className="w-full bg-primary hover:bg-primary/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Game
      </Button>

      {/* Create Game Form */}
      {showCreateGame && (
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Create New Game</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Min Bet</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={newGame.minBet}
                onChange={(e) =>
                  setNewGame({ ...newGame, minBet: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Max Bet</label>
              <Input
                type="number"
                step="0.1"
                min={newGame.minBet}
                value={newGame.maxBet}
                onChange={(e) =>
                  setNewGame({ ...newGame, maxBet: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">
                Max Players
              </label>
              <Input
                type="number"
                min="2"
                max="10"
                value={newGame.maxPlayers}
                onChange={(e) =>
                  setNewGame({
                    ...newGame,
                    maxPlayers: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateGame} className="flex-1">
                Create Game
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateGame(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Active Games */}
      <div className="space-y-3">
        <h3 className="font-semibold">Active Games</h3>
        {games.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">🎮</div>
            <p className="text-muted-foreground">No active games</p>
            <p className="text-xs text-muted-foreground mt-2">
              Create a game to get started!
            </p>
          </Card>
        ) : (
          games.map((game) => (
            <Card key={game.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(game.status)}>
                    {getStatusText(game.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    #{game.id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-ton-gold">
                  <Coins className="h-4 w-4" />
                  <span className="font-medium">{game.pot.toFixed(2)} TON</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">
                      {game.players}/{game.maxPlayers}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Players</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{game.timeLeft}s</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Time Left</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {game.betRange[0]}-{game.betRange[1]}
                  </div>
                  <div className="text-xs text-muted-foreground">Bet Range</div>
                </div>
              </div>

              {game.status === "waiting" && game.players < game.maxPlayers && (
                <Button
                  onClick={() => handleJoinGame(game)}
                  className="w-full"
                  size="sm"
                >
                  Join Game ({game.betRange[0]} TON)
                </Button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
