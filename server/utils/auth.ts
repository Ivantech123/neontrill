import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { Address, TonClient4, Cell } from "@ton/ton";
// @ton/crypto is published as CommonJS, so we must import default then destructure
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import tonCrypto from "@ton/crypto";
const { verifySignature } = tonCrypto as {
  verifySignature: typeof import("@ton/crypto").verifySignature;
};

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const APP_DOMAIN = process.env.APP_DOMAIN || "localhost"; //  ВАЖНО: Укажите ваш домен

// In-memory cache of recently used proofs to prevent replay attacks (signature base64 -> timestamp)
const usedProofCache: Map<string, number> = new Map();
// Clear old entries every 5 minutes
setInterval(() => {
  const now = Date.now() / 1000;
  for (const [sig, ts] of usedProofCache.entries()) {
    if (now - ts > 600) {
      usedProofCache.delete(sig);
    }
  }
}, 300_000);

export interface AuthenticatedRequest extends Request {
  user?: {
    address: string;
  };
}

// Структура, которую кошелек возвращает после подписи
export interface TonProof {
  timestamp: number;
  domain: {
    lengthBytes: number;
    value: string;
  };
  payload: string;
  signature: string;
}

// Полные данные для верификации
export interface TONWalletAuth {
  address: string;
  publicKey: string;
  walletStateInit: string;
  proof: TonProof;
}

// Создаем сообщение для проверки подписи
function createMessage(walletAddress: string, proof: TonProof): Buffer {
  const workchain = Address.parse(walletAddress).workChain;
  const address = Address.parse(walletAddress).hash;

  const message = Buffer.concat([
    Buffer.from("ton-proof-item-v2/"),
    Buffer.from(new Uint32Array([workchain]).buffer),
    address,
    Buffer.from(new Uint32Array([proof.domain.lengthBytes]).buffer),
    Buffer.from(proof.domain.value),
    Buffer.from(new Uint32Array([proof.timestamp]).buffer),
    Buffer.from(proof.payload),
  ]);

  const messageHash = crypto.createHash("sha256").update(message).digest();
  return Buffer.concat([
    Buffer.from([0xff, 0xff]),
    Buffer.from("ton-connect"),
    messageHash,
  ]);
}

// Верификация подписи
export async function verifyTONSignature(
  data: TONWalletAuth,
): Promise<boolean> {
  try {
    // 1. Проверка timestamp (не более 5 минут)
    if (Date.now() / 1000 - data.proof.timestamp > 300) {
      console.error("Signature timestamp is too old");
      return false;
    }

    // 2. Проверка домена
    if (data.proof.domain.value !== APP_DOMAIN) {
      console.error("Domain mismatch");
      return false;
    }

    // 3. Получаем публичный ключ из контракта
    const client = new TonClient4({
      endpoint: "https://mainnet-v4.tonhubapi.com",
    });
    const lastBlock = await client.getLastBlock();
    const result = await client.runMethod(
      lastBlock.last.seqno,
      Address.parse(data.address),
      "get_public_key",
      [],
    );
    const publicKeyFromContract = Buffer.from(
      result.reader.readBigNumber().toString(16).padStart(64, "0"),
      "hex",
    );

    // 4. Сравниваем с ключом, предоставленным клиентом
    if (!publicKeyFromContract.equals(Buffer.from(data.publicKey, "hex"))) {
      console.error("Public key mismatch");
      return false;
    }

    // 5. Собираем и проверяем подпись
    const message = createMessage(data.address, data.proof);
    const signature = Buffer.from(data.proof.signature, "base64");
    const publicKey = Buffer.from(data.publicKey, "hex");

    // 6. Проверка повторного использования подписи (replay-protection)
    const sigBase64 = data.proof.signature;
    const prevTs = usedProofCache.get(sigBase64);
    const now = Date.now() / 1000;
    if (prevTs && now - prevTs < 300) {
      console.error("Replay attack detected: signature reused");
      return false;
    }

    const isValid = verifySignature(message, signature, publicKey);
    if (isValid) {
      usedProofCache.set(sigBase64, now);
    }
    return isValid;
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

// Generate JWT token
export function generateJWT(address: string): string {
  return jwt.sign({ address }, JWT_SECRET, { expiresIn: "24h" });
}

// Verify JWT token
export function verifyJWT(token: string): { address: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { address: string };
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// Middleware to authenticate requests
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = { address: decoded.address };
  next();
}

// Generate random payload for signature challenge
export function generateSignaturePayload(): string {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString("hex");
  return `auth-${timestamp}-${nonce}`;
}
