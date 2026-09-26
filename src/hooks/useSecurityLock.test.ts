import { describe, it, expect } from 'vitest';
import { hashPin } from './useSecurityLock';

describe('useSecurityLock - SHA-256 PIN Cryptographic Hashing', () => {
  it('should generate consistent SHA-256 hex string for identical PINs', async () => {
    const pin = '1234';
    const hash1 = await hashPin(pin);
    const hash2 = await hashPin(pin);

    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('string');
    expect(hash1.length).toBe(64); // 256 bits = 64 hex characters
  });

  it('should produce distinct hashes for different PINs', async () => {
    const hashA = await hashPin('1234');
    const hashB = await hashPin('4321');
    const hashC = await hashPin('0000');

    expect(hashA).not.toBe(hashB);
    expect(hashA).not.toBe(hashC);
    expect(hashB).not.toBe(hashC);
  });

  it('should incorporate internal salt to prevent rainbow table attacks', async () => {
    const hash = await hashPin('9876');
    // Direct unsalted SHA-256 of '9876' is 9741e411efcf9cf9be816b8fb7b75f8f533bebe53f2e1c9df6b5c00f13a07677
    // With 'fluo_salt_v1_9876' it must differ completely
    expect(hash).not.toBe('9741e411efcf9cf9be816b8fb7b75f8f533bebe53f2e1c9df6b5c00f13a07677');
  });
});
