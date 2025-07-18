import { RequestHandler } from "express";
import {
  verifyTONSignature,
  generateJWT,
  generateSignaturePayload,
  TONWalletAuth,
} from "../utils/auth";

export const handleVerifyWallet: RequestHandler = async (req, res) => {
  try {
    const authData: TONWalletAuth = req.body;

    // Validate input
    if (!authData || !authData.address || !authData.proof) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify TON wallet signature
    const isValid = await verifyTONSignature(authData);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Generate JWT token
    const token = generateJWT(authData.address);

    res.json({ token });
  } catch (error) {
    console.error("Wallet verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleGetChallenge: RequestHandler = (req, res) => {
  try {
    const payload = generateSignaturePayload();
    res.json({ payload });
  } catch (error) {
    console.error("Challenge generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
