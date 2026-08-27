import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { RestaurantCard } from './RestaurantCard';
import { RestaurantDetail } from './RestaurantDetail';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { ExploreOverlay } from './ExploreOverlay';
import { groupRestaurants } from '../../utils/groupUtils';
import { GroupMode } from '../../types';

export function RestaurantListPage() {
  const { state, dispatch } = useAppContext();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [groupMode, setGroupMode] = useState<GroupMode>('status');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  // 關鍵字搜尋：比對名稱、備註、推薦菜色、標籤名稱（不分大小寫）
  const filteredRestaurants = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return state.restaurants;

    return state.restaurants.filter((restaurant) => {
      // Match name
      if (restaurant.name.toLowerCase().includes(keyword)) return true;
      // Match notes
      if (restaurant.notes.toLowerCase().includes(keyword)) return true;
      // Match recommended dishes
      if (
        restaurant.recommendedDishes.some((dish) =>
          dish.toLowerCase().includes(keyword)
        )
      )
        return true;
      // Match tag names
      const tagNames = restaurant.tagIds
        .map((id) => state.tags.find((t) => t.id === id)?.name || '')
        .filter(Boolean);
      if (tagNames.some((name) => name.toLowerCase().includes(keyword)))
        return true;

      return false;
    });
  }, [state.restaurants, state.tags, searchKeyword]);

  const groups = groupRestaurants(filteredRestaurants, groupMode, state.tags);

  const handleAdd = () => {
    dispatch({
      type: 'SET_UI',
      payload: { isFormOpen: true, editingRestaurantId: null },
    });
  };

  const handleToggle = (id: string) => {
    dispatch({
      type: 'SET_UI',
      payload: {
        expandedCardId: state.ui.expandedCardId === id ? null : id,
      },
    });
  };

  const handleEdit = (id: string) => {
    dispatch({
      type: 'SET_UI',
      payload: { isFormOpen: true, editingRestaurantId: id },
    });
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      dispatch({ type: 'DELETE_RESTAURANT', payload: { id: deleteTargetId } });
      setDeleteTargetId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTargetId(null);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">我的美食清單</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExploreOpen(true)}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center px-3 py-2 border border-indigo-600 text-indigo-600 font-medium rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              aria-label="探索餐廳"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              探索
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              aria-label="新增餐廳"
            >
              新增
            </button>
          </div>
        </div>
        <select
          value={groupMode}
          onChange={(e) => setGroupMode(e.target.value as GroupMode)}
          aria-label="分組方式"
          className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="status">依狀態分組</option>
          <option value="budget">依預算分組</option>
          <option value="tag">依標籤分組</option>
          <option value="district">依地區分組</option>
        </select>
      </div>

      {/* 關鍵字搜尋 */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="搜尋餐廳名稱、備註、菜色、標籤..."
          className="w-full border border-gray-300 rounded-md pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="搜尋餐廳"
        />
        {searchKeyword && (
          <button
            type="button"
            onClick={() => setSearchKeyword('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[28px] min-h-[28px] inline-flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="清除搜尋"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-gray-400"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {state.restaurants.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">
            找不到符合「{searchKeyword}」的餐廳
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {state.selectedRestaurantIds.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                已選取 <span className="font-medium">{state.selectedRestaurantIds.length}</span> 間
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                清空選取
              </button>
            </div>
          )}
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`group-${group.key}`}>
              <div className="flex items-center justify-between mb-3">
                <h2
                  id={`group-${group.key}`}
                  className="text-lg font-semibold text-gray-800"
                >
                  {group.label}
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SELECT_GROUP', payload: { ids: group.restaurants.map(r => r.id) } })}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors min-h-[32px] px-2"
                  >
                    全選
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'DESELECT_GROUP', payload: { ids: group.restaurants.map(r => r.id) } })}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors min-h-[32px] px-2"
                  >
                    取消全選
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {group.restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={state.selectedRestaurantIds.includes(restaurant.id)}
                      onChange={() =>
                        dispatch({
                          type: 'TOGGLE_RESTAURANT_SELECTION',
                          payload: { id: restaurant.id },
                        })
                      }
                      aria-label={`選取 ${restaurant.name}`}
                      className="min-w-[20px] min-h-[20px] w-5 h-5 mt-3 cursor-pointer accent-indigo-600 shrink-0"
                    />
                    <div className="flex-1">
                      <RestaurantCard
                        restaurant={restaurant}
                        tags={state.tags}
                        isExpanded={state.ui.expandedCardId === restaurant.id}
                        onToggle={() => handleToggle(restaurant.id)}
                      />
                      {state.ui.expandedCardId === restaurant.id && (
                        <RestaurantDetail
                          restaurant={restaurant}
                          onEdit={() => handleEdit(restaurant.id)}
                          onDelete={() => handleDeleteRequest(restaurant.id)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {deleteTargetId && (
        <ConfirmDialog
          title="刪除餐廳"
          message="確定要刪除這間餐廳嗎？此操作無法復原。"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {isExploreOpen && (
        <ExploreOverlay onClose={() => setIsExploreOpen(false)} />
      )}
    </div>
  );
}
