import { describe, it, expect } from 'vitest';
import {
  validateRestaurantName,
  validateTagName,
  validateAvgCost,
  validateDishName,
  validateNotes,
} from './validationUtils';

describe('validateRestaurantName', () => {
  it('rejects empty string', () => {
    const result = validateRestaurantName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects whitespace-only string', () => {
    const result = validateRestaurantName('   \t\n  ');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects name exceeding 100 chars', () => {
    const result = validateRestaurantName('a'.repeat(101));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('100');
  });

  it('accepts valid name', () => {
    expect(validateRestaurantName('好吃拉麵店')).toEqual({ valid: true });
  });

  it('accepts name at exactly 100 chars', () => {
    expect(validateRestaurantName('a'.repeat(100)).valid).toBe(true);
  });
});

describe('validateTagName', () => {
  it('rejects empty string', () => {
    const result = validateTagName('', []);
    expect(result.valid).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    const result = validateTagName('   ', []);
    expect(result.valid).toBe(false);
  });

  it('rejects name exceeding 20 chars after trim', () => {
    const result = validateTagName('a'.repeat(21), []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('20');
  });

  it('rejects duplicate tag name (case-insensitive)', () => {
    const result = validateTagName('Japanese', ['japanese', 'korean']);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('已存在');
  });

  it('accepts valid tag name', () => {
    expect(validateTagName('日式', ['韓式', '中式'])).toEqual({ valid: true });
  });

  it('accepts name at exactly 20 chars', () => {
    expect(validateTagName('a'.repeat(20), []).valid).toBe(true);
  });

  it('trims whitespace before validation', () => {
    expect(validateTagName('  日式  ', []).valid).toBe(true);
  });
});

describe('validateAvgCost', () => {
  it('accepts null (optional field)', () => {
    expect(validateAvgCost(null)).toEqual({ valid: true });
  });

  it('rejects zero', () => {
    expect(validateAvgCost(0).valid).toBe(false);
  });

  it('rejects negative numbers', () => {
    expect(validateAvgCost(-100).valid).toBe(false);
  });

  it('rejects non-integer', () => {
    expect(validateAvgCost(99.5).valid).toBe(false);
  });

  it('rejects values exceeding 99999', () => {
    const result = validateAvgCost(100000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('99999');
  });

  it('accepts valid positive integer', () => {
    expect(validateAvgCost(350)).toEqual({ valid: true });
  });

  it('accepts 99999 (boundary)', () => {
    expect(validateAvgCost(99999).valid).toBe(true);
  });

  it('accepts 1 (minimum valid)', () => {
    expect(validateAvgCost(1).valid).toBe(true);
  });
});

describe('validateDishName', () => {
  it('rejects empty string', () => {
    expect(validateDishName('').valid).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(validateDishName('   ').valid).toBe(false);
  });

  it('rejects name exceeding 50 chars', () => {
    const result = validateDishName('a'.repeat(51));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('50');
  });

  it('accepts valid dish name', () => {
    expect(validateDishName('味噌拉麵')).toEqual({ valid: true });
  });

  it('accepts name at exactly 50 chars', () => {
    expect(validateDishName('a'.repeat(50)).valid).toBe(true);
  });
});

describe('validateNotes', () => {
  it('accepts empty string', () => {
    expect(validateNotes('')).toEqual({ valid: true });
  });

  it('rejects notes exceeding 500 chars', () => {
    const result = validateNotes('a'.repeat(501));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('500');
  });

  it('accepts notes at exactly 500 chars', () => {
    expect(validateNotes('a'.repeat(500)).valid).toBe(true);
  });

  it('accepts normal notes', () => {
    expect(validateNotes('這家店很好吃，推薦！')).toEqual({ valid: true });
  });
});
