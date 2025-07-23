const API_BASE = "/api/v1";

export interface Game {
  id: string;
  pot: number;
  betRange: [number, number];
  players: number;
  maxPlayers: number;
  timeLeft: number;
  status: "waiting" | "starting" | "active" | "finished";
}

export interface GameStats {
  totalBets24h: number;
  biggestWin24h: number;
  winRate: number;
  totalGamesPlayed: number;
  activePlayers: number;
}

export interface GameHistory {
  gameId: string;
  result: "win" | "loss";
  amount: number;
  timestamp: string;
}

export interface GameItem {
  id: string;
  name: string;
  emoji: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
  basePrice: number;
  gradient: string;
  dropChance: number;
  description: string;
}

export interface UserProfile {
  address: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWinnings: number;
  totalLosses: number;
  netProfit: number;
  balance: number;
}

export interface TonProof {
  timestamp: number;
  domain: {
    lengthBytes: number;
    value: string;
  };
  payload: string;
  signature: string;
}

export interface TONWalletAuth {
  address: string;
  publicKey: string;
  walletStateInit: string;
  proof: TonProof;
}

class ApiClient {
  private token: string | null = null;
  private initialized = false;

  constructor() {
    // Don't access localStorage in constructor to avoid SSR issues
  }

  private initialize() {
    if (!this.initialized && typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken");
      this.initialized = true;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("authToken", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("authToken");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    this.initialize(); // Ensure we're initialized before making requests

    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async getChallenge(): Promise<{ payload: string }> {
    return this.request("/auth/challenge");
  }

  async verifyWallet(data: TONWalletAuth): Promise<{ token: string }> {
    const result = await this.request<{ token: string }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  // Games
  async getGames(): Promise<Game[]> {
    return this.request("/games");
  }

  async getStats(): Promise<GameStats> {
    return this.request("/stats");
  }

  // User
  async getUserHistory(): Promise<GameHistory[]> {
    return this.request("/user/history");
  }

  async getUserProfile(): Promise<UserProfile> {
    return this.request("/user/profile");
  }

  // Shop & Inventory
  async getShopItems(): Promise<GameItem[]> {
    return this.request("/shop/items");
  }

  async purchaseItem(itemId: string): Promise<{ item: any; success: boolean }> {
    return this.request(`/shop/purchase/${itemId}`, {
      method: "POST",
    });
  }

  async getUserInventory(): Promise<{
    items: any[];
    stats: {
      totalItems: number;
      legendaryCount: number;
      portfolioGrowth: number;
    };
  }> {
    return this.request("/user/inventory");
  }

  async sellItem(itemId: string): Promise<{ price: number; success: boolean }> {
    return this.request(`/shop/sell/${itemId}`, {
      method: "POST",
    });
  }

  // Roulette
  async getRouletteSeed(): Promise<{ seedHash: string }> {
    return this.request("/roulette/seed");
  }

  async spinRoulette(
    clientSeed: string,
    rollCount: number,
  ): Promise<{ item: GameItem; serverSeed: string }> {
    return this.request("/roulette/spin", {
      method: "POST",
      body: JSON.stringify({ clientSeed, rollCount }),
    });
  }

  // Earnings
  async getEarnings(period: string): Promise<{
    totalEarnings: number;
    unclaimedEarnings: number;
    growthPercentage: number;
    canClaim: boolean;
    sources: {
      staking: number;
      stakingGrowth: number;
      gaming: number;
      gamesWon: number;
      referrals: number;
      referralsCount: number;
    };
    recentTransactions: any[];
    stats: {
      totalDaysActive: number;
      avgDailyEarnings: number;
    };
  }> {
    return this.request(`/user/earnings?period=${period}`);
  }

  async claimEarnings(): Promise<{ amount: number; success: boolean }> {
    return this.request("/user/claim-earnings", {
      method: "POST",
    });
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiClient = new ApiClient();
