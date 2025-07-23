import * as crypto from "crypto";

export const generateServerSeed = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashSeed = (seed: string) => {
  return crypto.createHash("sha256").update(seed).digest("hex");
};

export const calculateResult = (
  serverSeed: string,
  clientSeed: string,
  nonce: number,
): number => {
  const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}`;
  const hmac = crypto.createHmac("sha512", serverSeed);
  hmac.update(combinedSeed);
  const hex = hmac.digest("hex");

  // Используем первые 8 символов (32 бита) для получения числа
  const subHex = hex.substring(0, 8);
  const result = parseInt(subHex, 16);

  return result;
};
