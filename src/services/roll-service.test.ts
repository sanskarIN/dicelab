import { describe, expect, it } from 'vitest';
import { extractNativeErrorCode } from './roll-service';

describe('native roll error normalization', () => {
  it('reads direct Tauri string rejections', () => {
    expect(extractNativeErrorCode('ERR_DICE_COUNT')).toBe('ERR_DICE_COUNT');
  });

  it('reads Error message codes', () => {
    expect(extractNativeErrorCode(new Error('ERR_SIDES'))).toBe('ERR_SIDES');
  });

  it('reads message-bearing object errors', () => {
    expect(extractNativeErrorCode({ message: 'ERR_MODIFIER' })).toBe('ERR_MODIFIER');
  });

  it('does not expose arbitrary object serialization', () => {
    expect(extractNativeErrorCode({ secret: 'should-not-leak' })).toBe('');
  });
});
