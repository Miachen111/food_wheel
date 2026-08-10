import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { RestaurantCard } from './RestaurantCard';
import { RestaurantDetail } from './RestaurantDetail';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from '../shared/ConfirmDialog';

export function RestaurantListPage() {
  const { state, dispatch } = useAppContext();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const sortedRestaurants = [...state.restaurants].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">我的美食清單</h1>
        <button
          type="button"
          onClick={handleAdd}
          className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          aria-label="新增餐廳"
        >
          新增
        </button>
      </div>

      {sortedRestaurants.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <div className="flex flex-col gap-4">
          {sortedRestaurants.map((restaurant) => (
            <div key={restaurant.id}>
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
    </div>
  );
}
