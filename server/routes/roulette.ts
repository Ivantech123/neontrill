import { Router, RequestHandler } from "express";
import { authenticateToken, AuthenticatedRequest } from "../utils/auth";
import { gameItems, GameItem } from "../../shared/gameItems";
import {
  generateServerSeed,
  hashSeed,
  calculateResult,
} from "../utils/provablyFair";
import { gameState } from "../utils/gameState";

// Session types are defined in server/types/express.d.ts

const router = Router();

const handleGetSeed: RequestHandler = (req, res) => {
  const serverSeed = generateServerSeed();
  const seedHash = hashSeed(serverSeed);

  req.session.serverSeed = serverSeed;
  req.session.nonce = 0; // Инициализируем счетчик ставок

  res.json({ seedHash });
};

const handleSpin: RequestHandler = (req: AuthenticatedRequest, res) => {
  try {
    const { serverSeed, nonce } = req.session;
    const { clientSeed, rollCount } = req.body;

    if (!serverSeed || !clientSeed || nonce === undefined) {
      return res.status(400).json({ error: "Seed not set. Call /seed first." });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const costPerRoll = 0.1;
    const totalCost = costPerRoll * rollCount;
    const currentBalance = gameState.getUserBalance(req.user.address);

    if (currentBalance < totalCost) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Списываем стоимость
    gameState.updateUserBalance(req.user.address, -totalCost);

    const randomNumber = calculateResult(serverSeed, clientSeed, nonce);

    // Определяем выигрышный предмет
    const totalWeight = gameItems.reduce(
      (sum, item) => sum + item.dropChance,
      0,
    );
    const winningWeight = randomNumber % totalWeight;

    let currentWeight = 0;
    let winningItem: GameItem | null = null;
    for (const item of gameItems) {
      currentWeight += item.dropChance;
      if (winningWeight < currentWeight) {
        winningItem = item;
        break;
      }
    }

    if (!winningItem) {
      // Fallback
      winningItem = gameItems[gameItems.length - 1];
    }

    // Добавляем выигрыш в историю и на баланс
    if (req.user) {
      gameState.addHistoryEntry(
        req.user.address,
        `roulette-${req.session.id}`,
        "win",
        winningItem.basePrice,
      );
    }

    // Увеличиваем nonce для следующей ставки
    req.session.nonce = (req.session.nonce || 0) + 1;

    res.json({
      item: winningItem,
      serverSeed: serverSeed, // Возвращаем сид для верификации
    });
  } catch (error) {
    console.error("Spin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

router.get("/seed", authenticateToken, handleGetSeed);
router.post("/spin", authenticateToken, handleSpin);

export default router;
