import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../utils/auth";
import { gameState } from "../utils/gameState";

export const handleGetUserHistory: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const history = gameState.getUserHistory(req.user.address);
    res.json(history);
  } catch (error) {
    console.error("Get user history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleGetUserProfile: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const history = gameState.getUserHistory(req.user.address);
    const balance = gameState.getUserBalance(req.user.address);
    const totalGames = history.length;
    const wins = history.filter((h) => h.result === "win").length;
    const totalWinnings = history
      .filter((h) => h.result === "win")
      .reduce((sum, h) => sum + h.amount, 0);
    const totalLosses = history
      .filter((h) => h.result === "loss")
      .reduce((sum, h) => sum + Math.abs(h.amount), 0);

    res.json({
      address: req.user.address,
      totalGames,
      wins,
      losses: totalGames - wins,
      winRate: totalGames > 0 ? wins / totalGames : 0,
      totalWinnings,
      totalLosses,
      netProfit: totalWinnings - totalLosses,
      balance,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user inventory
export const handleGetUserInventory: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // TODO: Implement actual inventory logic
    const mockInventory = {
      items: [],
      stats: {
        totalItems: 0,
        legendaryCount: 0,
        portfolioGrowth: 0,
      },
    };

    res.json(mockInventory);
  } catch (error) {
    console.error("Get user inventory error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user earnings
export const handleGetUserEarnings: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { period = "7d" } = req.query;
    const balance = gameState.getUserBalance(req.user.address);
    const history = gameState.getUserHistory(req.user.address);

    const totalWinnings = history
      .filter((h) => h.result === "win")
      .reduce((sum, h) => sum + h.amount, 0);

    // TODO: Implement actual earnings logic
    const mockEarnings = {
      totalEarnings: totalWinnings,
      unclaimedEarnings: Math.max(0, totalWinnings * 0.1),
      growthPercentage: 12.5,
      canClaim: totalWinnings > 0,
      sources: {
        staking: totalWinnings * 0.3,
        stakingGrowth: 5.2,
        gaming: totalWinnings * 0.6,
        gamesWon: history.filter((h) => h.result === "win").length,
        referrals: totalWinnings * 0.1,
        referralsCount: 0,
      },
      recentTransactions: history.slice(-5),
      stats: {
        totalDaysActive: Math.min(30, Math.max(1, history.length / 5)),
        avgDailyEarnings: totalWinnings / Math.max(1, history.length / 5),
      },
    };

    res.json(mockEarnings);
  } catch (error) {
    console.error("Get user earnings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Claim earnings
export const handleClaimEarnings: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // TODO: Implement actual claim logic
    const claimAmount = 1.5; // Mock amount

    res.json({
      amount: claimAmount,
      success: true,
      message: "Earnings claimed successfully (demo)",
    });
  } catch (error) {
    console.error("Claim earnings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
