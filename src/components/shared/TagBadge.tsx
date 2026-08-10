import React from 'react';

interface TagBadgeProps {
  name: string;
  onRemove?: () => void;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ name, onRemove }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200 focus:outline-none"
          aria-label={`移除 ${name}`}
        >
          ×
        </button>
      )}
    </span>
  );
};
