import * as crypto from 'crypto';

/**
 * Encrypts data using AES-256-GCM.
 */
export function encryptContent(
  data: Buffer,
  key: Buffer,
): { encrypted: Buffer; iv: Buffer; authTag: Buffer } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  return { encrypted, iv, authTag };
}

/**
 * Decrypts data using AES-256-GCM.
 */
export function decryptContent(
  encrypted: Buffer,
  key: Buffer,
  iv: Buffer,
  authTag: Buffer,
): Buffer {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Generates a cryptographically secure 256-bit symmetric encryption key.
 */
export function generateEncryptionKey(): Buffer {
  return crypto.randomBytes(32);
}

/**
 * Encrypts a content encryption key with the master key using AES-256-CBC.
 */
export function encryptKey(key: Buffer, masterKey: string): Buffer {
  const masterKeyHash = crypto.createHash('sha256').update(masterKey).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', masterKeyHash, iv);
  
  const encrypted = Buffer.concat([cipher.update(key), cipher.final()]);
  // Prepend IV to the encrypted data for easy retrieval
  return Buffer.concat([iv, encrypted]);
}

/**
 * Decrypts a content encryption key with the master key.
 */
export function decryptKey(encryptedKeyWithIv: Buffer, masterKey: string): Buffer {
  const masterKeyHash = crypto.createHash('sha256').update(masterKey).digest();
  const iv = encryptedKeyWithIv.subarray(0, 16);
  const encryptedKey = encryptedKeyWithIv.subarray(16);
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', masterKeyHash, iv);
  return Buffer.concat([decipher.update(encryptedKey), decipher.final()]);
}
