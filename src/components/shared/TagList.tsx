import React, { useState } from 'react';
import { TagBadge } from './TagBadge';

interface TagListProps {
  tags: { id: string; name: string }[];
  maxVisible?: number;
}

export const TagList: React.FC<TagListProps> = ({ tags, maxVisible = 5 }) => {
  const [expanded, setExpanded] = useState(false);

  if (tags.length === 0) {
    return null;
  }

  const shouldCollapse = tags.length > maxVisible;
  const visibleTags = expanded || !shouldCollapse ? tags : tags.slice(0, maxVisible);
  const remaining = tags.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visibleTags.map((tag) => (
        <TagBadge key={tag.id} name={tag.name} />
      ))}
      {shouldCollapse && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none"
        >
          +{remaining}
        </button>
      )}
      {shouldCollapse && expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none"
        >
          收合
        </button>
      )}
    </div>
  );
};
