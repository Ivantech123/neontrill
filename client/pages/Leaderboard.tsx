import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/layout/MainLayout";
import { apiClient } from "@/lib/api";
import { useState } from "react";

export default function Leaderboard() {
  const [tab, setTab] = useState<"overall" | "wins" | "apr" | "ref">("overall");

  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => apiClient.getLeaderboard(100),
  });

  const entries = data?.leaderboard || [];

  const sorted = [...entries].sort((a: any, b: any) => {
    switch (tab) {
      case "wins":
        return b.totalWins - a.totalWins;
      case "apr":
        return b.stakingApr - a.stakingApr;
      case "ref":
        return b.referralEarnings - a.referralEarnings;
      default:
        return b.totalScore - a.totalScore;
    }
  });

  return (
    <MainLayout title="Leaderboard">
      <div className="p-4 space-y-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { label: "Overall", value: "overall" },
            { label: "Wins", value: "wins" },
            { label: "Staking APR", value: "apr" },
            { label: "Referrals", value: "ref" },
          ].map((t) => (
            <Button
              key={t.value}
              size="sm"
              variant="outline"
              onClick={() => setTab(t.value as any)}
              className={
                tab === t.value
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                  : "border-white/20 bg-gray-800/50 backdrop-blur-sm"
              }
            >
              {t.label}
            </Button>
          ))}
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p>Error loading leaderboard</p>}

        <div className="space-y-2">
          {sorted.map((u: any, idx: number) => (
            <Card
              key={u.userId}
              className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 text-center font-bold text-yellow-400">
                  {idx + 1}
                </div>
                <img
                  src={u.avatarUrl || "https://placehold.co/40x40"}
                  alt={u.username}
                  className="w-8 h-8 rounded-full"
                />
                <span>{u.username}</span>
              </div>
              <div className="text-right space-y-1 text-xs">
                <div>Total wins: {u.totalWins}</div>
                <div>APR: {u.stakingApr}%</div>
                <div>Referral: {u.referralEarnings} TON</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
