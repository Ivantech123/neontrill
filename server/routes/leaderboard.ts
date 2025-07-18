import { Router } from "express";

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  totalWins: number;
  stakingApr: number;
  referralEarnings: number;
  totalScore: number;
}

import { prisma } from "../utils/prisma";

// Fetch leaderboard aggregated from DB
const mockUsers: LeaderboardEntry[] = Array.from({ length: 100 }).map((_, i) => {
  const wins = Math.floor(Math.random() * 1000);
  const apr = parseFloat((Math.random() * 100).toFixed(2));
  const ref = parseFloat((Math.random() * 500).toFixed(2));
  return {
    userId: `user${i + 1}`,
    username: `Player${i + 1}`,
    avatarUrl: undefined,
    totalWins: wins,
    stakingApr: apr,
    referralEarnings: ref,
    totalScore: wins + apr + ref,
  };
});

async function getLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  const rows = await prisma.user.findMany({
    take: limit,
    include: {
      gameStat: true,
      stakingStat: true,
      referralStat: true,
    },
  });
  return rows
    .map((u) => ({
      userId: u.id,
      username: u.username || u.walletAddr.slice(0, 6) + "…",
      avatarUrl: u.avatarUrl,
      totalWins: u.gameStat?.totalWins || 0,
      stakingApr: u.stakingStat?.apr || 0,
      referralEarnings: u.referralStat?.earnings || 0,
      totalScore:
        (u.gameStat?.totalWins || 0) + (u.stakingStat?.apr || 0) + (u.referralStat?.earnings || 0),
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 } as any));
}

const router = Router();

// GET /api/v1/leaderboard?limit=50
router.get("/", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const leaderboard = await getLeaderboard(limit);
  res.json({ leaderboard });
});

export default router;
