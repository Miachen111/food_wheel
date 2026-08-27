import { AppState, AppAction, DEFAULT_FILTER, RestaurantFormData } from '../types';
import { deriveBudgetLevel } from '../utils/formatUtils';

/**
 * 應用程式全域 Reducer
 * 處理所有狀態變更邏輯
 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_RESTAURANT': {
      const formData: RestaurantFormData = action.payload;
      const now = new Date().toISOString();
      const isWishList = formData.status === 'WISH_LIST';

      const newRestaurant = {
        id: crypto.randomUUID(),
        name: formData.name,
        status: formData.status,
        rating: isWishList ? null : formData.rating,
        avgCost: isWishList ? null : formData.avgCost,
        budgetLevel: isWishList ? null : deriveBudgetLevel(formData.avgCost),
        recommendedDishes: isWishList ? [] : formData.recommendedDishes,
        notes: formData.notes,
        address: formData.address ?? '',
        tagIds: formData.tagIds,
        latitude: formData.latitude ?? null,
        longitude: formData.longitude ?? null,
        district: formData.district ?? null,
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...state,
        restaurants: [newRestaurant, ...state.restaurants],
      };
    }

    case 'UPDATE_RESTAURANT': {
      const { id, data } = action.payload;
      const now = new Date().toISOString();

      const restaurants = state.restaurants.map((restaurant) => {
        if (restaurant.id !== id) return restaurant;

        const statusChangedToWishList =
          restaurant.status === 'VISITED' && data.status === 'WISH_LIST';

        const updated = {
          ...restaurant,
          name: data.name,
          status: data.status,
          rating: statusChangedToWishList ? null : data.rating,
          avgCost: statusChangedToWishList ? null : data.avgCost,
          budgetLevel: statusChangedToWishList
            ? null
            : deriveBudgetLevel(data.avgCost),
          recommendedDishes: statusChangedToWishList
            ? []
            : data.recommendedDishes,
          notes: data.notes,
          address: data.address ?? restaurant.address,
          tagIds: data.tagIds,
          updatedAt: now,
        };

        return updated;
      });

      return { ...state, restaurants };
    }

    case 'DELETE_RESTAURANT': {
      const deleteId = action.payload.id;
      return {
        ...state,
        restaurants: state.restaurants.filter((r) => r.id !== deleteId),
        selectedRestaurantIds: state.selectedRestaurantIds.filter(
          (id) => id !== deleteId
        ),
      };
    }

    case 'TOGGLE_RESTAURANT_SELECTION': {
      const { id } = action.payload;
      const isSelected = state.selectedRestaurantIds.includes(id);
      return {
        ...state,
        selectedRestaurantIds: isSelected
          ? state.selectedRestaurantIds.filter((rid) => rid !== id)
          : [...state.selectedRestaurantIds, id],
      };
    }

    case 'CLEAR_SELECTION': {
      return {
        ...state,
        selectedRestaurantIds: [],
      };
    }

    case 'SELECT_GROUP': {
      const newIds = action.payload.ids.filter(
        (id) => !state.selectedRestaurantIds.includes(id)
      );
      return {
        ...state,
        selectedRestaurantIds: [...state.selectedRestaurantIds, ...newIds],
      };
    }

    case 'DESELECT_GROUP': {
      const idsToRemove = new Set(action.payload.ids);
      return {
        ...state,
        selectedRestaurantIds: state.selectedRestaurantIds.filter(
          (id) => !idsToRemove.has(id)
        ),
      };
    }

    case 'ADD_TAG': {
      const trimmedName = action.payload.name.trim();
      const exists = state.tags.some(
        (tag) => tag.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (exists) {
        return state;
      }

      const newTag = {
        id: crypto.randomUUID(),
        name: trimmedName,
      };

      return {
        ...state,
        tags: [...state.tags, newTag],
      };
    }

    case 'SET_FILTERS': {
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    }

    case 'RESET_FILTERS': {
      return {
        ...state,
        filters: DEFAULT_FILTER,
      };
    }

    case 'NAVIGATE': {
      return {
        ...state,
        currentPage: action.payload.page,
      };
    }

    case 'SET_UI': {
      return {
        ...state,
        ui: { ...state.ui, ...action.payload },
      };
    }

    case 'LOAD_DATA': {
      const normalizedRestaurants = action.payload.restaurants.map(r => ({
        ...r,
        latitude: r.latitude ?? null,
        longitude: r.longitude ?? null,
        district: r.district ?? null,
        address: r.address ?? '',
      }));
      return {
        ...state,
        restaurants: normalizedRestaurants,
        tags: action.payload.tags,
      };
    }

    default:
      return state;
  }
}
