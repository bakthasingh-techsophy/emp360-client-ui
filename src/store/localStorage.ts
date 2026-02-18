// src/services/localStorageService.ts
import StorageKeys from "@/constants/storageConstants";
import CryptoJS from "crypto-js";

const DEFAULT_SECRET = "BF714DB7BAF454626DAF1A61159CE";

/**
 * Utility to check for localStorage availability (SSR safe)
 */
const hasLocalStorage = (): boolean => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

/**
 * Build the real secret used for encryption.
 * You can optionally pass a secret to each call; otherwise it falls back to env var or a default.
 */
const resolveSecret = (secret?: string) => secret && secret.length ? secret : DEFAULT_SECRET;

/**
 * Generic: set encrypted JSON value in localStorage
 * - key: storage key
 * - value: any JSON-serializable value
 * - secret: optional secret; if omitted uses env var or fallback default
 */
export const setStorageItem = <T = unknown>(key: string, value: T, secret?: string): boolean => {
  if (!hasLocalStorage()) return false;
  try {
    const payload = JSON.stringify(value);
    const ciphertext = CryptoJS.AES.encrypt(payload, resolveSecret(secret)).toString();
    localStorage.setItem(key, ciphertext);
    return true;
  } catch (err) {
    // fail silently (could also log)
    return false;
  }
};

/**
 * Generic: get decrypted JSON value from localStorage
 * - returns null if key not present or decryption/parsing fails
 */
export const getStorageItem = <T = unknown>(key: string, secret?: string): T | null => {
  if (!hasLocalStorage()) return null;
  try {
    const ciphertext = localStorage.getItem(key);
    if (!ciphertext) return null;
    const bytes = CryptoJS.AES.decrypt(ciphertext, resolveSecret(secret));
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) return null;
    return JSON.parse(plaintext) as T;
  } catch {
    return null;
  }
};

/**
 * Remove a single key
 */
export const removeStorageItem = (key: string): void => {
  if (!hasLocalStorage()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

/**
 * Clear all keys (use carefully)
 */
export const clearStorage = (): void => {
  if (!hasLocalStorage()) return;
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
};


export const resolveAuth = (): { accessToken?: string | null; tenant?: string | null } => {
  try {
    const session = getStorageItem<any>(StorageKeys.SESSION);
    const tenant = getStorageItem<string>(StorageKeys.TENANT) ?? "techsophy";
    console.log("Resolved tenant from storage:", getStorageItem<string>(StorageKeys.TENANT));
    const accessToken = session?.token ?? null;
    return { accessToken, tenant };
  } catch {
    return { accessToken: null, tenant: "techsophy" };
  }
};

/**
 * Check if the stored session token has expired
 * Returns true if token is expired or doesn't exist
 */
export const isTokenExpired = (): boolean => {
  try {
    const session = getStorageItem<any>(StorageKeys.SESSION);
    if (!session) return true; // No session = token expired
    if (!session.expiresAt) return false; // No expiry info, assume valid
    return Date.now() > session.expiresAt; // Check if current time exceeds expiry
  } catch {
    return true; // On error, treat as expired
  }
};

/**
 * Get session expiry time
 */
export const getSessionExpiryTime = (): number | null => {
  try {
    const session = getStorageItem<any>(StorageKeys.SESSION);
    return session?.expiresAt ?? null;
  } catch {
    return null;
  }
};