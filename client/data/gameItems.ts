// Re-export from shared
export type { GameItem } from "../../shared/gameItems";
export { gameItems, getItemsByRarity, getItemById, getTotalDropChance, getRandomItem } from "../../shared/gameItems";

// Additional client-specific utility functions
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "Common":
      return "text-gray-400";
    case "Rare":
      return "text-blue-400";
    case "Epic":
      return "text-purple-400";
    case "Legendary":
      return "text-yellow-400";
    case "Mythic":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

export function getRarityGlow(rarity: string): string {
  switch (rarity) {
    case "Mythic":
      return "shadow-red-400/40 animate-pulse";
    case "Legendary":
      return "shadow-yellow-400/30 animate-pulse";
    case "Epic":
      return "shadow-purple-400/25";
    case "Rare":
      return "shadow-blue-400/20";
    default:
      return "";
  }
}
