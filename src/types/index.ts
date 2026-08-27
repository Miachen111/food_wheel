// === 核心實體 ===

export type RestaurantStatus = 'WISH_LIST' | 'VISITED';

export type BudgetLevel = '$' | '$$' | '$$$';

export interface Tag {
  id: string;        // UUID v4
  name: string;      // 1-20 字元，去除前後空白
}

export interface Restaurant {
  id: string;                    // UUID v4
  name: string;                  // 1-100 字元，必填
  status: RestaurantStatus;
  rating: number | null;         // 1.0-5.0，0.5 級距；WISH_LIST 時為 null
  avgCost: number | null;        // 正整數，最大 99999；WISH_LIST 時為 null
  budgetLevel: BudgetLevel | null; // 由 avgCost 衍生或手動設定
  recommendedDishes: string[];   // 每筆最多 50 字元，最多 10 筆
  notes: string;                 // 最多 500 字元
  address: string;               // 地址，可從 Places API 帶入或手動輸入
  tagIds: string[];              // 最多 10 個 Tag ID
  latitude: number | null;       // 緯度，從 Places API location 取得
  longitude: number | null;      // 經度，從 Places API location 取得
  district: string | null;       // 行政區名稱，例如「大安區」「信義區」
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}

// === 表單相關 ===

export interface RestaurantFormData {
  name: string;
  status: RestaurantStatus;
  rating: number | null;
  avgCost: number | null;
  recommendedDishes: string[];
  notes: string;
  tagIds: string[];
  address?: string;
  // Optional location fields (from Places API)
  latitude?: number | null;
  longitude?: number | null;
  district?: string | null;
}

// === 分組模式 ===

export type GroupMode = 'status' | 'budget' | 'tag' | 'district';

// === 篩選狀態 ===

export type StatusFilter = 'ALL' | 'WISH_LIST' | 'VISITED';
export type BudgetFilter = 'ALL' | '$' | '$$' | '$$$';

export interface FilterState {
  status: StatusFilter;
  budget: BudgetFilter;
  selectedTagIds: string[];
}

export const DEFAULT_FILTER: FilterState = {
  status: 'ALL',
  budget: 'ALL',
  selectedTagIds: [],
};

// === 熱量分析相關 ===

export interface NutritionItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface CalorieResult {
  totalCalories: number;
  items: NutritionItem[];
  summary: string;
}

// === 全域狀態 ===

export interface AppState {
  restaurants: Restaurant[];
  tags: Tag[];
  filters: FilterState;
  selectedRestaurantIds: string[];
  currentPage: 'list' | 'roulette' | 'calories' | 'chat';
  ui: {
    isFormOpen: boolean;
    editingRestaurantId: string | null;
    expandedCardId: string | null;
    isSpinning: boolean;
    resultRestaurantId: string | null;
    scrollPosition: number;
  };
}

// === Action Types ===

export type AppAction =
  | { type: 'ADD_RESTAURANT'; payload: RestaurantFormData }
  | { type: 'UPDATE_RESTAURANT'; payload: { id: string; data: RestaurantFormData } }
  | { type: 'DELETE_RESTAURANT'; payload: { id: string } }
  | { type: 'ADD_TAG'; payload: { name: string } }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'RESET_FILTERS' }
  | { type: 'NAVIGATE'; payload: { page: 'list' | 'roulette' | 'calories' | 'chat' } }
  | { type: 'SET_UI'; payload: Partial<AppState['ui']> }
  | { type: 'LOAD_DATA'; payload: { restaurants: Restaurant[]; tags: Tag[] } }
  | { type: 'TOGGLE_RESTAURANT_SELECTION'; payload: { id: string } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SELECT_GROUP'; payload: { ids: string[] } }
  | { type: 'DESELECT_GROUP'; payload: { ids: string[] } };

// === Storage Schema ===

export interface StorageSchema {
  'food-roulette:restaurants': Restaurant[];
  'food-roulette:tags': Tag[];
  'food-roulette:initialized': boolean;
}
