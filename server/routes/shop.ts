import { Router } from "express";
import { gameItems } from "../../shared/gameItems";
import { telegramGiftsService } from "../services/telegramGifts";

const router = Router();

// Get all shop items (Telegram gifts + local items)
router.get("/", async (req, res) => {
  try {
    // Get real Telegram gifts
    const telegramGifts = await telegramGiftsService.getStarGifts();
    const convertedGifts = telegramGifts.map(gift => telegramGiftsService.convertToGameItem(gift));
    
    // Combine with local items (optional)
    const allItems = [...convertedGifts, ...gameItems];
    
    res.json(allItems);
  } catch (error) {
    console.error("Failed to get shop items:", error);
    // Fallback to local items if Telegram API fails
    res.json(gameItems);
  }
});

// Get shop items (alternative endpoint)
router.get("/items", async (req, res) => {
  try {
    // Get real Telegram gifts
    const telegramGifts = await telegramGiftsService.getStarGifts();
    const convertedGifts = telegramGifts.map(gift => telegramGiftsService.convertToGameItem(gift));
    
    // Combine with local items (optional)
    const allItems = [...convertedGifts, ...gameItems];
    
    res.json(allItems);
  } catch (error) {
    console.error("Failed to get shop items:", error);
    // Fallback to local items if Telegram API fails
    res.json(gameItems);
  }
});

// Purchase item endpoint
router.post("/purchase/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Check if it's a Telegram gift
    const telegramGift = await telegramGiftsService.getGiftById(itemId);
    if (telegramGift) {
      // Check availability
      const isAvailable = await telegramGiftsService.isGiftAvailable(itemId);
      if (!isAvailable) {
        return res.status(400).json({ error: "Gift is sold out or unavailable" });
      }
      
      // Convert to our format
      const item = telegramGiftsService.convertToGameItem(telegramGift);
      
      // TODO: Implement actual Telegram gift purchase logic
      // This would involve calling Telegram's payments API
      res.json({ 
        item, 
        success: true,
        message: "Telegram gift purchase successful (demo)",
        type: "telegram_gift"
      });
      return;
    }
    
    // Fallback to local items
    const item = gameItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json({ 
      item, 
      success: true,
      message: "Purchase successful (demo)",
      type: "local_item"
    });
  } catch (error) {
    console.error("Failed to purchase item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Sell item endpoint
router.post("/sell/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Check if it's a Telegram gift
    const telegramGift = await telegramGiftsService.getGiftById(itemId);
    if (telegramGift) {
      // Telegram gifts cannot be sold, only converted to stars
      return res.status(400).json({ 
        error: "Telegram gifts cannot be sold. They can be converted to Stars instead.",
        canConvert: true,
        stars: telegramGift.stars
      });
    }
    
    // Fallback to local items
    const item = gameItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    const sellPrice = item.basePrice * 0.8; // 80% of base price
    res.json({ 
      price: sellPrice, 
      success: true,
      message: "Sell successful (demo)",
      type: "local_item"
    });
  } catch (error) {
    console.error("Failed to sell item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Telegram gifts only
router.get("/telegram-gifts", async (req, res) => {
  try {
    const telegramGifts = await telegramGiftsService.getStarGifts();
    const convertedGifts = telegramGifts.map(gift => telegramGiftsService.convertToGameItem(gift));
    res.json(convertedGifts);
  } catch (error) {
    console.error("Failed to get Telegram gifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
