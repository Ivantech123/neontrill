import { RequestHandler } from "express";
import { gameState } from "../utils/gameState";

export const handleGetGames: RequestHandler = (req, res) => {
  try {
    const games = gameState.getAllActiveGames().map((game) => ({
      id: game.id,
      pot: game.pot,
      betRange: game.betRange,
      players: game.players.length,
      maxPlayers: game.maxPlayers,
      timeLeft: game.timeLeft,
      status: game.status,
    }));

    res.json(games);
  } catch (error) {
    console.error("Get games error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleGetStats: RequestHandler = (req, res) => {
  try {
    const stats = gameState.getGlobalStats();
    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
