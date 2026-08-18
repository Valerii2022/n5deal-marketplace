import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

/**
 * Hash a password using Node.js crypto.scrypt with a random salt.
 * Returns a self-contained hash string in the format: salt.hash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}.${derivedKey.toString("hex")}`;
}

/**
 * Verify a password against a stored hash.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, hash] = storedHash.split(".");
  
  if (!salt || !hash) {
    return false;
  }

  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const storedKeyBuffer = Buffer.from(hash, "hex");

  // Use timing-safe comparison
  return timingSafeEqual(derivedKey, storedKeyBuffer);
}
