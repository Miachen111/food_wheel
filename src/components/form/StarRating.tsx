import React, { useCallback, useRef } from 'react';

interface StarRatingProps {
  value: number | null;
  onChange: (value: number) => void;
}

function StarRating({ value, onChange }: StarRatingProps) {
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const halfWidth = rect.width / 2;

      if (clickX <= halfWidth) {
        onChange(starIndex + 0.5);
      } else {
        onChange(starIndex + 1.0);
      }
    },
    [onChange]
  );

  const getFillType = (starIndex: number): 'full' | 'half' | 'empty' => {
    if (value === null) return 'empty';
    const starValue = starIndex + 1;
    if (value >= starValue) return 'full';
    if (value >= starIndex + 0.5) return 'half';
    return 'empty';
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex" role="group" aria-label="星級評分">
        {[0, 1, 2, 3, 4].map((starIndex) => {
          const fillType = getFillType(starIndex);
          return (
            <button
              key={starIndex}
              ref={(el) => { starRefs.current[starIndex] = el; }}
              type="button"
              className="relative w-11 h-11 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
              onClick={(e) => handleClick(e, starIndex)}
              aria-label={`${starIndex + 1} 星`}
            >
              <StarIcon fillType={fillType} />
            </button>
          );
        })}
      </div>
      {value !== null && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-medium min-w-[2rem]">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface StarIconProps {
  fillType: 'full' | 'half' | 'empty';
}

function StarIcon({ fillType }: StarIconProps) {
  const starId = React.useId();

  if (fillType === 'full') {
    return (
      <svg
        className="w-7 h-7 text-amber-400"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  if (fillType === 'half') {
    return (
      <svg
        className="w-7 h-7"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`half-fill-${starId}`}>
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#d1d5db" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={`url(#half-fill-${starId})`}
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-7 h-7 text-gray-300 dark:text-gray-600"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default StarRating;
