import React, { useState, useRef, useEffect } from 'react';
import { TagBadge } from '../shared/TagBadge';
import { validateTagName } from '../../utils/validationUtils';
import type { Tag } from '../../types';

interface TagInputProps {
  tags: string[];
  allTags: Tag[];
  onChange: (tagIds: string[]) => void;
  onAddNewTag?: (name: string) => string;
  maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  allTags,
  onChange,
  onAddNewTag,
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTagNames = tags
    .map((id) => allTags.find((t) => t.id === id)?.name)
    .filter((name): name is string => name !== undefined);

  const filteredSuggestions = allTags.filter((tag) => {
    if (tags.includes(tag.id)) return false;
    if (!inputValue.trim()) return false;
    return tag.name.toLowerCase().includes(inputValue.trim().toLowerCase());
  });

  const handleSelectTag = (tag: Tag) => {
    onChange([...tags, tag.id]);
    setInputValue('');
    setShowSuggestions(false);
    setError('');
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(tags.filter((id) => id !== tagId));
  };

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Check if it matches an existing tag (case-insensitive)
    const existingTag = allTags.find(
      (t) => t.name.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (existingTag) {
      // Already selected?
      if (tags.includes(existingTag.id)) {
        setError('此標籤已存在');
        return;
      }
      onChange([...tags, existingTag.id]);
      setInputValue('');
      setError('');
      return;
    }

    // Validate as new tag
    const validation = validateTagName(trimmed, selectedTagNames);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    // Create new tag via callback
    if (onAddNewTag) {
      const newId = onAddNewTag(trimmed);
      onChange([...tags, newId]);
      setInputValue('');
      setError('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    if (error) setError('');
  };

  const atLimit = tags.length >= maxTags;

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tagId) => {
          const tag = allTags.find((t) => t.id === tagId);
          if (!tag) return null;
          return (
            <TagBadge
              key={tagId}
              name={tag.name}
              onRemove={() => handleRemoveTag(tagId)}
            />
          );
        })}
      </div>

      {/* Input area */}
      {atLimit ? (
        <p className="text-sm text-amber-600">已達標籤上限</p>
      ) : (
        <div className="relative">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue.trim() && setShowSuggestions(true)}
              placeholder="輸入標籤名稱..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label="標籤輸入"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              新增
            </button>
          </div>

          {/* Autocomplete suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-40 overflow-y-auto">
              {filteredSuggestions.map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                  >
                    {tag.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Validation error */}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
