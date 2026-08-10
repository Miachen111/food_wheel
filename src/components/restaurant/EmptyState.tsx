interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4" role="img" aria-label="餐廳">
        🍽️
      </span>
      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        還沒有收藏任何餐廳
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        點擊下方按鈕新增你的第一間餐廳吧！
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="min-w-[44px] min-h-[44px] px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
      >
        新增餐廳
      </button>
    </div>
  );
}
