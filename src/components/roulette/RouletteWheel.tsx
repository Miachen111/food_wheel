import { useRef, useEffect, useCallback } from 'react';
import { truncateText } from '../../utils/formatUtils';

// === Types ===

export interface RouletteWheelProps {
  candidates: { id: string; name: string }[];
  currentAngle: number;
  isSpinning: boolean;
  onSpin: () => void;
}

// === Constants ===

const COLOR_PALETTE: string[] = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

const MIN_DIAMETER = 280;
const TEXT_MAX_LENGTH = 6;

// === Component ===

export default function RouletteWheel({
  candidates,
  currentAngle,
  isSpinning,
  onSpin,
}: RouletteWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const containerWidth = container.clientWidth;
    const size = Math.max(containerWidth, MIN_DIAMETER);

    // Set canvas size accounting for devicePixelRatio
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10; // Small padding

    const count = candidates.length;
    if (count === 0) {
      // Draw empty state
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('無候選餐廳', centerX, centerY);
      return;
    }

    const sectorAngle = (2 * Math.PI) / count;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw sectors
    for (let i = 0; i < count; i++) {
      const startAngle = i * sectorAngle + currentAngle;
      const endAngle = startAngle + sectorAngle;

      // Draw sector arc
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLOR_PALETTE[i % COLOR_PALETTE.length]!;
      ctx.fill();

      // Draw sector border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sectorAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1f2937';
      ctx.font = `bold ${Math.max(12, Math.min(14, radius / 10))}px sans-serif`;

      const candidate = candidates[i];
      if (candidate) {
        const displayName = truncateText(candidate.name, TEXT_MAX_LENGTH);
        ctx.fillText(displayName, radius - 20, 0);
      }
      ctx.restore();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.12, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw fixed pointer at top center (does NOT rotate)
    const pointerSize = 16;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX - pointerSize, pointerSize * 1.5);
    ctx.lineTo(centerX + pointerSize, pointerSize * 1.5);
    ctx.closePath();
    ctx.fillStyle = '#4f46e5';
    ctx.fill();
    ctx.strokeStyle = '#3730a3';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [candidates, currentAngle]);

  // Redraw when candidates or angle changes
  useEffect(() => {
    draw();
  }, [draw]);

  // ResizeObserver for responsive behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      draw();
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        ref={containerRef}
        className="w-full max-w-[calc(100vw-32px)]"
        style={{ minWidth: `${MIN_DIAMETER}px`, minHeight: `${MIN_DIAMETER}px` }}
      >
        <canvas
          ref={canvasRef}
          className="block mx-auto"
          role="img"
          aria-label="餐廳轉盤"
        />
      </div>
      <button
        type="button"
        onClick={onSpin}
        disabled={isSpinning || candidates.length < 2}
        className={`
          w-full px-6 py-3 rounded-lg font-bold text-white
          bg-indigo-600 hover:bg-indigo-700
          min-w-[44px] min-h-[44px]
          transition-colors duration-200
          ${isSpinning || candidates.length < 2 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label="旋轉轉盤"
      >
        旋轉！
      </button>
    </div>
  );
}
