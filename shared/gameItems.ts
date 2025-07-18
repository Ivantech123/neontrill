export interface GameItem {
  id: string;
  name: string;
  emoji: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
  basePrice: number; // in TON
  gradient: string;
  dropChance: number; // percentage
  description: string;
  imageUrl?: string;
}

export const gameItems: GameItem[] = [
  // Common items (50% total chance)
  {
    id: "bunny_muffin",
    name: "Bunny Muffin",
    emoji: "🧁",
    rarity: "Common",
    basePrice: 0.5,
    gradient: "from-pink-400 to-rose-500",
    dropChance: 15,
    description: "Sweet treat for gaming sessions",
  },
  {
    id: "lucky_paw",
    name: "Lucky Paw",
    emoji: "🐾",
    rarity: "Common",
    basePrice: 0.3,
    gradient: "from-amber-400 to-orange-500",
    dropChance: 15,
    description: "Brings good fortune",
  },
  {
    id: "mystery_gift",
    name: "Mystery Gift",
    emoji: "🎁",
    rarity: "Common",
    basePrice: 0.8,
    gradient: "from-purple-400 to-pink-500",
    dropChance: 10,
    description: "What's inside? Nobody knows!",
  },
  {
    id: "game_coin",
    name: "Game Coin",
    emoji: "🪙",
    rarity: "Common",
    basePrice: 0.2,
    gradient: "from-yellow-400 to-amber-500",
    dropChance: 10,
    description: "Basic currency for trades",
  },

  // Rare items (30% total chance)
  {
    id: "neon_crystal",
    name: "Neon Crystal",
    emoji: "💎",
    rarity: "Rare",
    basePrice: 2.5,
    gradient: "from-cyan-400 to-blue-500",
    dropChance: 12,
    description: "Glowing crystal with mysterious powers",
  },
  {
    id: "golden_ticket",
    name: "Golden Ticket",
    emoji: "🎫",
    rarity: "Rare",
    basePrice: 3.0,
    gradient: "from-yellow-400 to-orange-500",
    dropChance: 10,
    description: "Access to exclusive games",
  },
  {
    id: "magic_potion",
    name: "Magic Potion",
    emoji: "🧪",
    rarity: "Rare",
    basePrice: 1.8,
    gradient: "from-green-400 to-emerald-500",
    dropChance: 8,
    description: "Enhances your gaming abilities",
  },

  // Epic items (15% total chance)
  {
    id: "cyber_helmet",
    name: "Cyber Helmet",
    emoji: "⚡",
    rarity: "Epic",
    basePrice: 8.0,
    gradient: "from-indigo-400 to-purple-500",
    dropChance: 8,
    description: "Advanced gaming gear",
  },
  {
    id: "rainbow_gem",
    name: "Rainbow Gem",
    emoji: "🌈",
    rarity: "Epic",
    basePrice: 12.0,
    gradient: "from-pink-400 via-purple-500 to-indigo-500",
    dropChance: 4,
    description: "Rare multicolored gemstone",
  },
  {
    id: "time_crystal",
    name: "Time Crystal",
    emoji: "⏰",
    rarity: "Epic",
    basePrice: 15.0,
    gradient: "from-blue-400 to-cyan-500",
    dropChance: 3,
    description: "Manipulates time in games",
  },

  // Legendary items (4% total chance)
  {
    id: "dragon_egg",
    name: "Dragon Egg",
    emoji: "🥚",
    rarity: "Legendary",
    basePrice: 50.0,
    gradient: "from-red-500 to-orange-600",
    dropChance: 2,
    description: "Legendary creature waiting to hatch",
  },
  {
    id: "phoenix_feather",
    name: "Phoenix Feather",
    emoji: "🪶",
    rarity: "Legendary",
    basePrice: 75.0,
    gradient: "from-orange-500 to-red-600",
    dropChance: 1.5,
    description: "Grants resurrection powers",
  },
  {
    id: "cosmic_orb",
    name: "Cosmic Orb",
    emoji: "🌌",
    rarity: "Legendary",
    basePrice: 100.0,
    gradient: "from-purple-600 to-indigo-700",
    dropChance: 0.5,
    description: "Contains the power of the universe",
  },

  // Mythic items (1% total chance)
  {
    id: "infinity_stone",
    name: "Infinity Stone",
    emoji: "💫",
    rarity: "Mythic",
    basePrice: 500.0,
    gradient: "from-purple-700 via-pink-600 to-red-600",
    dropChance: 0.5,
    description: "Ultimate power source",
  },
  {
    id: "reality_shard",
    name: "Reality Shard",
    emoji: "✨",
    rarity: "Mythic",
    basePrice: 1000.0,
    gradient: "from-indigo-700 via-purple-700 to-pink-700",
    dropChance: 0.3,
    description: "Fragment of reality itself",
  },
  {
    id: "god_tier_crown",
    name: "God Tier Crown",
    emoji: "👑",
    rarity: "Mythic",
    basePrice: 2000.0,
    gradient: "from-yellow-500 via-orange-500 to-red-600",
    dropChance: 0.2,
    description: "Crown of the gaming gods",
  },
];

// Helper functions
export const getItemsByRarity = (rarity: GameItem["rarity"]): GameItem[] => {
  return gameItems.filter(item => item.rarity === rarity);
};

export const getItemById = (id: string): GameItem | undefined => {
  return gameItems.find(item => item.id === id);
};

export const getTotalDropChance = (): number => {
  return gameItems.reduce((total, item) => total + item.dropChance, 0);
};

export const getRandomItem = (): GameItem => {
  const totalChance = getTotalDropChance();
  const random = Math.random() * totalChance;
  
  let currentChance = 0;
  for (const item of gameItems) {
    currentChance += item.dropChance;
    if (random <= currentChance) {
      return item;
    }
  }
  
  // Fallback to first item if something goes wrong
  return gameItems[0];
};
