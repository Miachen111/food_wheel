import { describe, it, expect } from 'vitest';
import { calculateTargetAngle, easeOutCubic, DEFAULT_SPIN_CONFIG } from './useRouletteWheel';
import type { SpinConfig } from './useRouletteWheel';

describe('easeOutCubic', () => {
  it('should return 0 when t = 0', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('should return 1 when t = 1', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('should return values between 0 and 1 for inputs between 0 and 1', () => {
    const midpoints = [0.1, 0.25, 0.5, 0.75, 0.9];
    for (const t of midpoints) {
      const result = easeOutCubic(t);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    }
  });

  it('should be monotonically increasing', () => {
    let prev = 0;
    for (let t = 0.1; t <= 1.0; t += 0.1) {
      const result = easeOutCubic(t);
      expect(result).toBeGreaterThan(prev);
      prev = result;
    }
  });

  it('should produce ease-out curve (faster at start, slower at end)', () => {
    // First half progress should cover more than half the distance
    const halfProgress = easeOutCubic(0.5);
    expect(halfProgress).toBeGreaterThan(0.5);
  });
});

describe('calculateTargetAngle', () => {
  const config: SpinConfig = { minDuration: 3000, maxDuration: 6000, minRotations: 5 };

  it('should return selectedIndex within valid range', () => {
    for (let i = 0; i < 50; i++) {
      const { selectedIndex } = calculateTargetAngle(5, config);
      expect(selectedIndex).toBeGreaterThanOrEqual(0);
      expect(selectedIndex).toBeLessThan(5);
    }
  });

  it('should return targetAngle greater than minRotations * 2π', () => {
    for (let i = 0; i < 50; i++) {
      const { targetAngle } = calculateTargetAngle(4, config);
      expect(targetAngle).toBeGreaterThanOrEqual(config.minRotations * 2 * Math.PI);
    }
  });

  it('should return targetAngle less than (minRotations + 3) * 2π + sectorAngle', () => {
    const candidateCount = 4;
    const maxRotations = config.minRotations + 3; // 0, 1, or 2 extra
    const maxAngle = maxRotations * 2 * Math.PI + 2 * Math.PI; // full circle for sector
    for (let i = 0; i < 50; i++) {
      const { targetAngle } = calculateTargetAngle(candidateCount, config);
      expect(targetAngle).toBeLessThan(maxAngle);
    }
  });

  it('should work with candidateCount of 2', () => {
    const { selectedIndex, targetAngle } = calculateTargetAngle(2, config);
    expect(selectedIndex).toBeGreaterThanOrEqual(0);
    expect(selectedIndex).toBeLessThan(2);
    expect(targetAngle).toBeGreaterThan(0);
  });

  it('should work with candidateCount of 20', () => {
    const { selectedIndex, targetAngle } = calculateTargetAngle(20, config);
    expect(selectedIndex).toBeGreaterThanOrEqual(0);
    expect(selectedIndex).toBeLessThan(20);
    expect(targetAngle).toBeGreaterThan(0);
  });
});

describe('DEFAULT_SPIN_CONFIG', () => {
  it('should have minDuration of 3000', () => {
    expect(DEFAULT_SPIN_CONFIG.minDuration).toBe(3000);
  });

  it('should have maxDuration of 6000', () => {
    expect(DEFAULT_SPIN_CONFIG.maxDuration).toBe(6000);
  });

  it('should have minRotations of 5', () => {
    expect(DEFAULT_SPIN_CONFIG.minRotations).toBe(5);
  });
});
