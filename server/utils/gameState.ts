export interface Player {
  address: string;
  username?: string;
  betAmount: number;
  joinedAt: number;
}

export interface Game {
  id: string;
  pot: number;
  betRange: [number, number];
  players: Player[];
  maxPlayers: number;
  timeLeft: number;
  status: "waiting" | "starting" | "active" | "finished";
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  winner?: Player;
  winnings?: number;
}

export interface GameHistory {
  gameId: string;
  result: "win" | "loss";
  amount: number;
  timestamp: string;
  address: string;
}

export interface GlobalStats {
  totalBets24h: number;
  biggestWin24h: number;
  winRate: number;
  totalGamesPlayed: number;
  activePlayers: number;
}

class GameStateManager {
  private games: Map<string, Game> = new Map();
  private gameHistory: GameHistory[] = [];
  private userBalances: Map<string, number> = new Map();
  private globalStats: GlobalStats = {
    totalBets24h: 0,
    biggestWin24h: 0,
    winRate: 0.47, // Default win rate
    totalGamesPlayed: 0,
    activePlayers: 0,
  };

  generateGameId(): string {
    return crypto.randomUUID();
  }

  createGame(
    creatorAddress: string,
    betRange: [number, number],
    maxPlayers: number,
  ): Game {
    const gameId = this.generateGameId();
    const game: Game = {
      id: gameId,
      pot: 0,
      betRange,
      players: [],
      maxPlayers,
      timeLeft: 60, // 60 seconds to join
      status: "waiting",
      createdAt: Date.now(),
    };

    this.games.set(gameId, game);
    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  getAllActiveGames(): Game[] {
    return Array.from(this.games.values()).filter(
      (game) => game.status !== "finished",
    );
  }

  joinGame(gameId: string, player: Player): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;

    // Validate bet amount is within range
    if (
      player.betAmount < game.betRange[0] ||
      player.betAmount > game.betRange[1]
    ) {
      return false;
    }

    // Check if game is still accepting players
    if (game.status !== "waiting" || game.players.length >= game.maxPlayers) {
      return false;
    }

    // Check if player already joined
    if (game.players.find((p) => p.address === player.address)) {
      return false;
    }

    game.players.push(player);
    game.pot += player.betAmount;

    // Start game if max players reached
    if (game.players.length === game.maxPlayers) {
      this.startGame(gameId);
    }

    return true;
  }

  startGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game || game.status !== "waiting") return;

    game.status = "starting";
    game.startedAt = Date.now();
    game.timeLeft = 5; // 5 seconds countdown

    // Simulate game logic after countdown
    setTimeout(() => {
      this.finishGame(gameId);
    }, 5000);
  }

  finishGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game || game.status === "finished") return;

    game.status = "finished";
    game.finishedAt = Date.now();

    // Simple random winner selection
    if (game.players.length > 0) {
      const winnerIndex = Math.floor(Math.random() * game.players.length);
      game.winner = game.players[winnerIndex];
      game.winnings = game.pot * 0.9; // 90% to winner, 10% house fee

      

      // Update history and balances
      game.players.forEach((player) => {
        const isWinner = player.address === game.winner!.address;
        const amount = isWinner ? game.winnings! : -player.betAmount;
        this.addHistoryEntry(
          player.address,
          gameId,
          isWinner ? "win" : "loss",
          amount,
        );
      });

      // Update global stats
      this.updateGlobalStats(game);
    }

    // Remove game after 1 minute
    setTimeout(() => {
      this.games.delete(gameId);
    }, 60000);
  }

  private updateGlobalStats(game: Game): void {
    this.globalStats.totalGamesPlayed++;
    this.globalStats.totalBets24h += game.pot;

    if (game.winnings && game.winnings > this.globalStats.biggestWin24h) {
      this.globalStats.biggestWin24h = game.winnings;
    }

    // Update active players count
    this.globalStats.activePlayers = new Set(
      Array.from(this.games.values())
        .filter((g) => g.status !== "finished")
        .flatMap((g) => g.players.map((p) => p.address)),
    ).size;
  }

  getUserBalance(address: string): number {
    if (!this.userBalances.has(address)) {
      // Default balance for new players
      this.userBalances.set(address, 10);
    }
    return this.userBalances.get(address)!;
  }

  updateUserBalance(address: string, change: number): number {
    const currentBalance = this.getUserBalance(address);
    let newBalance = currentBalance + change;
    if (newBalance < 0) {
      // Prevent negative balances
      newBalance = 0;
    }
    this.userBalances.set(address, newBalance);
    return newBalance;
  }

  addHistoryEntry(address: string, gameId: string, result: "win" | "loss", amount: number) {
    this.gameHistory.push({
      gameId,
      result,
      amount,
      timestamp: new Date().toISOString(),
      address,
    });
    this.updateUserBalance(address, amount);
  }

  getUserHistory(address: string): GameHistory[] {
    return this.gameHistory.filter((h) => h.address === address);
  }

  

  getGlobalStats(): GlobalStats {
    // Update active players count
    this.globalStats.activePlayers = new Set(
      Array.from(this.games.values())
        .filter((g) => g.status !== "finished")
        .flatMap((g) => g.players.map((p) => p.address)),
    ).size;

    return this.globalStats;
  }

  // Timer management
  updateTimers(): void {
    this.games.forEach((game) => {
      if (game.status === "waiting" && game.timeLeft > 0) {
        game.timeLeft--;
        if (game.timeLeft === 0 && game.players.length > 1) {
          this.startGame(game.id);
        } else if (game.timeLeft === 0) {
          // Not enough players, cancel game
          game.status = "finished";
          setTimeout(() => this.games.delete(game.id), 5000);
        }
      } else if (game.status === "starting" && game.timeLeft > 0) {
        game.timeLeft--;
      }
    });
  }
}

// Singleton instance
export const gameState = new GameStateManager();

// Start timer update loop
setInterval(() => {
  gameState.updateTimers();
}, 1000);
