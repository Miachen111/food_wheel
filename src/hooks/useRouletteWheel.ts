import { useState, useRef, useCallback, useEffect } from 'react';

// === Exported Types ===

export interface SpinConfig {
  minDuration: number;  // 最短動畫時長 (ms)
  maxDuration: number;  // 最長動畫時長 (ms)
  minRotations: number; // 最少旋轉圈數
}

export interface UseRouletteWheelReturn {
  currentAngle: number;
  isSpinning: boolean;
  spin: (candidateCount: number) => void;
  selectedIndex: number | null;
}

// === Default Config ===

export const DEFAULT_SPIN_CONFIG: SpinConfig = {
  minDuration: 3000,
  maxDuration: 6000,
  minRotations: 5,
};

// === Exported Utility Functions ===

/**
 * 計算隨機目標角度與選中索引。
 * 確保每個候選餐廳被選中的機率相等。
 */
export function calculateTargetAngle(
  candidateCount: number,
  config: SpinConfig
): { targetAngle: number; selectedIndex: number } {
  const selectedIndex = Math.floor(Math.random() * candidateCount);
  const sectorAngle = (2 * Math.PI) / candidateCount;
  // 目標落在選中扇區的隨機位置
  const sectorOffset = Math.random() * sectorAngle;
  const baseAngle = selectedIndex * sectorAngle + sectorOffset;
  // 加上多圈旋轉（minRotations + 0~2 額外圈）
  const rotations = config.minRotations + Math.floor(Math.random() * 3);
  const targetAngle = rotations * 2 * Math.PI + baseAngle;
  return { targetAngle, selectedIndex };
}

/**
 * Cubic ease-out 緩動函數。
 * 模擬加速後減速的動畫效果。
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// === Hook ===

/**
 * 轉盤動畫邏輯 hook。
 * 管理動畫狀態（Idle → Spinning → Stopped），
 * 使用 requestAnimationFrame 驅動動畫，cleanup 時取消動畫。
 */
export function useRouletteWheel(
  config: SpinConfig = DEFAULT_SPIN_CONFIG
): UseRouletteWheelReturn {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const durationRef = useRef(0);
  const targetAngleRef = useRef(0);
  const selectedIndexRef = useRef<number | null>(null);

  // 取消目前的動畫
  const cancelAnimation = useCallback(() => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  // 動畫迴圈
  const animate = useCallback((timestamp: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / durationRef.current, 1);
    const easedProgress = easeOutCubic(progress);
    const angle = easedProgress * targetAngleRef.current;

    setCurrentAngle(angle);

    if (progress >= 1) {
      // 動畫結束
      animationFrameId.current = null;
      setIsSpinning(false);
      setSelectedIndex(selectedIndexRef.current);
    } else {
      animationFrameId.current = requestAnimationFrame(animate);
    }
  }, []);

  // 開始旋轉
  const spin = useCallback((candidateCount: number) => {
    if (candidateCount < 1) return;

    // cleanup 前一次動畫
    cancelAnimation();

    // 隨機持續時間：minDuration ~ maxDuration
    const duration = config.minDuration + Math.random() * (config.maxDuration - config.minDuration);
    durationRef.current = duration;

    // 計算目標角度
    const { targetAngle, selectedIndex: idx } = calculateTargetAngle(candidateCount, config);
    targetAngleRef.current = targetAngle;
    selectedIndexRef.current = idx;

    // 重設動畫狀態
    startTimeRef.current = null;
    setCurrentAngle(0);
    setIsSpinning(true);
    setSelectedIndex(null);

    // 啟動動畫迴圈
    animationFrameId.current = requestAnimationFrame(animate);
  }, [config, cancelAnimation, animate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  return {
    currentAngle,
    isSpinning,
    spin,
    selectedIndex,
  };
}
