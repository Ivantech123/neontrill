/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Gaming API Types
 */
export interface GameResponse {
  id: string;
  pot: number;
  betRange: [number, number];
  players: number;
  maxPlayers: number;
  timeLeft: number;
  status: "waiting" | "starting" | "active" | "finished";
}

export interface GameStatsResponse {
  totalBets24h: number;
  biggestWin24h: number;
  winRate: number;
  totalGamesPlayed: number;
  activePlayers: number;
}

export interface GameHistoryResponse {
  gameId: string;
  result: "win" | "loss";
  amount: number;
  timestamp: string;
}

export interface AuthRequest {
  address: string;
  signature: string;
  payload: string;
}

export interface AuthResponse {
  token: string;
}

export interface ChallengeResponse {
  payload: string;
}
