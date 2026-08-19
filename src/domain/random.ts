export interface RandomSource {
  nextInt(maxExclusive: number): number;
}

const UINT32_RANGE = 0x1_0000_0000;

export class SecureRandomSource implements RandomSource {
  nextInt(maxExclusive: number): number {
    assertRange(maxExclusive);
    const limit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
    const buffer = new Uint32Array(1);

    for (;;) {
      globalThis.crypto.getRandomValues(buffer);
      const value = buffer[0];
      if (value < limit) {
        return value % maxExclusive;
      }
    }
  }
}

export class SeededRandomSource implements RandomSource {
  private state: number;

  constructor(seed: string) {
    this.state = hashSeed(seed) || 0x9e3779b9;
  }

  nextInt(maxExclusive: number): number {
    assertRange(maxExclusive);
    // xorshift32 is intentionally deterministic and is not used for secure mode.
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return Math.floor((this.state / UINT32_RANGE) * maxExclusive);
  }
}

export function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  const bytes = new TextEncoder().encode(seed);
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function assertRange(maxExclusive: number): void {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > UINT32_RANGE) {
    throw new RangeError(`maxExclusive must be an integer between 1 and ${UINT32_RANGE}.`);
  }
}
