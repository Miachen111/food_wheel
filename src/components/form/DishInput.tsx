import React, { useState } from 'react';
import { validateDishName } from '../../utils/validationUtils';

interface DishInputProps {
  dishes: string[];
  onChange: (dishes: string[]) => void;
}

const MAX_DISHES = 10;
const MAX_DISH_LENGTH = 50;

export const DishInput: React.FC<DishInputProps> = ({ dishes, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    const validation = validateDishName(trimmed);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    onChange([...dishes, trimmed]);
    setInputValue('');
    setError(undefined);
  };

  const handleRemove = (index: number) => {
    onChange(dishes.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_DISH_LENGTH) {
      setInputValue(value);
      if (error) {
        setError(undefined);
      }
    }
  };

  const isAtLimit = dishes.length >= MAX_DISHES;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        推薦菜色
      </label>

      {/* Dish chips */}
      {dishes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dishes.map((dish, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
            >
              {dish}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`移除 ${dish}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input + Add button or limit message */}
      {isAtLimit ? (
        <p className="text-sm text-amber-600">已達上限（最多 10 道）</p>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="輸入菜色名稱"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={MAX_DISH_LENGTH}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[44px] min-h-[44px]"
          >
            新增
          </button>
        </div>
      )}

      {/* Validation error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
