# Design Document: Roulette Manual Selection & Grouped List

## Architecture Overview

本功能涉及三大改動：(1) 新增全域勾選狀態管理；(2) 清單頁面改為分組顯示並支援 checkbox 勾選；(3) 轉盤頁面移除 FilterPanel，改用 selectedRestaurantIds 作為候選來源。

整體架構遵循現有的 `useContext + useReducer` 模式，所有狀態變更通過 dispatch action 完成。分組邏輯提取為純函式放在 `utils/` 下方便測試。

---

## Components & Interfaces

### 1. 型別擴展（src/types/index.ts）

```typescript
// 新增分組模式列舉
export type GroupMode = 'status' | 'budget' | 'tag';

// 擴展 AppState
export interface AppState {
  // ... existing fields
  selectedRestaurantIds: string[]; // 勾選的餐廳 ID 集合
}

// 新增 Action Types
export type AppAction =
  | // ... existing actions
  | { type: 'TOGGLE_RESTAURANT_SELECTION'; payload: { id: string } }
  | { type: 'CLEAR_SELECTION' };
```

### 2. Reducer 擴展（src/context/appReducer.ts）

```typescript
case 'TOGGLE_RESTAURANT_SELECTION': {
  const { id } = action.payload;
  const isSelected = state.selectedRestaurantIds.includes(id);
  return {
    ...state,
    selectedRestaurantIds: isSelected
      ? state.selectedRestaurantIds.filter(rid => rid !== id)
      : [...state.selectedRestaurantIds, id],
  };
}

case 'CLEAR_SELECTION': {
  return {
    ...state,
    selectedRestaurantIds: [],
  };
}

// 修改 DELETE_RESTAURANT case，同時清理 selectedRestaurantIds
case 'DELETE_RESTAURANT': {
  const deleteId = action.payload.id;
  return {
    ...state,
    restaurants: state.restaurants.filter(r => r.id !== deleteId),
    selectedRestaurantIds: state.selectedRestaurantIds.filter(id => id !== deleteId),
  };
}
```

### 3. 初始狀態（src/context/AppContext.tsx）

```typescript
const initialState: AppState = {
  // ... existing fields
  selectedRestaurantIds: [],
};
```

### 4. 分組工具函式（src/utils/groupUtils.ts）— 新增檔案

```typescript
import { Restaurant, Tag, GroupMode } from '../types';

export interface RestaurantGroup {
  key: string;
  label: string;
  restaurants: Restaurant[];
}

export function groupByStatus(restaurants: Restaurant[]): RestaurantGroup[] {
  const wishList = restaurants.filter(r => r.status === 'WISH_LIST');
  const visited = restaurants.filter(r => r.status === 'VISITED');
  const groups: RestaurantGroup[] = [];
  if (wishList.length > 0) groups.push({ key: 'WISH_LIST', label: '想去清單', restaurants: wishList });
  if (visited.length > 0) groups.push({ key: 'VISITED', label: '已造訪', restaurants: visited });
  return groups;
}

export function groupByBudget(restaurants: Restaurant[]): RestaurantGroup[] {
  const buckets: Record<string, Restaurant[]> = { '$': [], '$$': [], '$$$': [], 'null': [] };
  for (const r of restaurants) {
    const key = r.budgetLevel ?? 'null';
    buckets[key].push(r);
  }
  const labels: Record<string, string> = { '$': '$', '$$': '$$', '$$$': '$$$', 'null': '未設定' };
  return Object.entries(buckets)
    .filter(([, list]) => list.length > 0)
    .map(([key, list]) => ({ key, label: labels[key], restaurants: list }));
}

export function groupByTag(restaurants: Restaurant[], tags: Tag[]): RestaurantGroup[] {
  const tagMap = new Map(tags.map(t => [t.id, t.name]));
  const groups: Map<string, Restaurant[]> = new Map();
  const noTag: Restaurant[] = [];

  for (const r of restaurants) {
    if (r.tagIds.length === 0) {
      noTag.push(r);
    } else {
      for (const tagId of r.tagIds) {
        if (!groups.has(tagId)) groups.set(tagId, []);
        groups.get(tagId)!.push(r);
      }
    }
  }

  const result: RestaurantGroup[] = [];
  for (const [tagId, list] of groups) {
    result.push({ key: tagId, label: tagMap.get(tagId) ?? tagId, restaurants: list });
  }
  if (noTag.length > 0) {
    result.push({ key: 'no-tag', label: '無標籤', restaurants: noTag });
  }
  return result;
}

export function groupRestaurants(
  restaurants: Restaurant[],
  mode: GroupMode,
  tags: Tag[]
): RestaurantGroup[] {
  switch (mode) {
    case 'status': return groupByStatus(restaurants);
    case 'budget': return groupByBudget(restaurants);
    case 'tag': return groupByTag(restaurants, tags);
  }
}
```

### 5. RestaurantListPage 改動

- 新增 `useState<GroupMode>('status')` 作為本地分組模式狀態
- 移除 `sortedRestaurants` 邏輯，改用 `groupRestaurants(state.restaurants, groupMode, state.tags)`
- 在標題列旁邊加入 `<select>` 下拉選單切換 groupMode
- 每張 RestaurantCard 前方加入 checkbox，checked 來源為 `state.selectedRestaurantIds.includes(r.id)`
- checkbox 點擊時 dispatch `TOGGLE_RESTAURANT_SELECTION`

```typescript
// RestaurantListPage 結構概要
function RestaurantListPage() {
  const { state, dispatch } = useAppContext();
  const [groupMode, setGroupMode] = useState<GroupMode>('status');
  const groups = groupRestaurants(state.restaurants, groupMode, state.tags);

  return (
    <div className="p-4">
      {/* Header with group selector */}
      <div className="flex items-center justify-between mb-4">
        <h1>我的美食清單</h1>
        <select value={groupMode} onChange={e => setGroupMode(e.target.value as GroupMode)}
                aria-label="分組方式">
          <option value="status">依狀態分組</option>
          <option value="budget">依預算分組</option>
          <option value="tag">依標籤分組</option>
        </select>
        <button onClick={handleAdd} aria-label="新增餐廳">新增</button>
      </div>

      {/* Grouped list with checkboxes */}
      {groups.map(group => (
        <section key={group.key} aria-labelledby={`group-${group.key}`}>
          <h2 id={`group-${group.key}`}>{group.label}</h2>
          {group.restaurants.map(r => (
            <div key={r.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.selectedRestaurantIds.includes(r.id)}
                onChange={() => dispatch({ type: 'TOGGLE_RESTAURANT_SELECTION', payload: { id: r.id } })}
                aria-label={`選取 ${r.name}`}
                className="min-w-[44px] min-h-[44px] ..."
              />
              <RestaurantCard restaurant={r} tags={state.tags} ... />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
```

### 6. RoulettePage 改動

- 移除 `FilterPanel` 引入及渲染
- 移除 `filterCandidates` 引入
- 候選來源改為：`state.restaurants.filter(r => state.selectedRestaurantIds.includes(r.id))`
- 新增已勾選數量顯示
- 空候選時顯示引導訊息並禁用轉動按鈕

```typescript
function RoulettePage() {
  const { state, dispatch } = useAppContext();
  const candidates = state.restaurants.filter(
    r => state.selectedRestaurantIds.includes(r.id)
  );

  // ... existing spin logic using candidates

  return (
    <div>
      <p>已選取 {candidates.length} 間餐廳</p>
      {candidates.length === 0 && (
        <p>尚未勾選任何餐廳，請前往清單頁面勾選想加入轉盤的餐廳。</p>
      )}
      <RouletteWheel
        candidates={candidates.map(r => ({ id: r.id, name: r.name }))}
        ...
      />
      <button disabled={candidates.length === 0} onClick={handleSpin}>轉！</button>
    </div>
  );
}
```

---

## Data Model Changes

| Field | Location | Type | Description |
|-------|----------|------|-------------|
| `selectedRestaurantIds` | `AppState` | `string[]` | 已勾選的餐廳 ID 陣列 |
| `GroupMode` | `types/index.ts` | `'status' \| 'budget' \| 'tag'` | 分組模式列舉 |
| `RestaurantGroup` | `utils/groupUtils.ts` | `interface` | 分組結果資料結構 |

**注意**：`selectedRestaurantIds` 不持久化到 localStorage，每次啟動初始化為空陣列。這符合需求 1.5。

---

## Error Handling

| 場景 | 處理方式 |
|------|----------|
| selectedRestaurantIds 包含已刪除餐廳 ID | DELETE_RESTAURANT reducer 自動清理 |
| 標籤被刪除後 groupByTag 找不到名稱 | 使用 tagId 作為 fallback label |
| 轉盤候選為空 | 禁用轉動按鈕，顯示引導訊息 |
| 轉盤僅一間候選 | 跳過動畫直接顯示結果 |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Selection toggle round-trip

*For any* restaurant ID and any initial state where that ID is not in selectedRestaurantIds, toggling selection twice (select then deselect) SHALL produce a state where selectedRestaurantIds equals the original.

**Validates: Requirements 1.2, 1.3**

### Property 2: Navigation preserves selection

*For any* AppState with a non-empty selectedRestaurantIds, dispatching a NAVIGATE action to any page SHALL produce a state where selectedRestaurantIds is identical to the original.

**Validates: Requirements 1.4**

### Property 3: Delete cleans up selection

*For any* AppState where a restaurant ID exists in both `restaurants` and `selectedRestaurantIds`, dispatching DELETE_RESTAURANT with that ID SHALL produce a state where that ID is absent from selectedRestaurantIds.

**Validates: Requirements 1.6**

### Property 4: Group by status correctness

*For any* list of restaurants, `groupByStatus` SHALL place every restaurant into exactly one group, and each restaurant's group key SHALL equal its `status` field value.

**Validates: Requirements 3.4**

### Property 5: Group by budget correctness

*For any* list of restaurants, `groupByBudget` SHALL place every restaurant into exactly one group, where the group key equals the restaurant's `budgetLevel` (or `'null'` when budgetLevel is null).

**Validates: Requirements 3.5**

### Property 6: Group by tag correctness

*For any* list of restaurants and tags, `groupByTag` SHALL place a restaurant with K tags (K > 0) into exactly K groups matching its tagIds, and a restaurant with 0 tags into exactly the "無標籤" group.

**Validates: Requirements 3.6, 3.7**

### Property 7: Roulette candidates match selection

*For any* AppState, the roulette candidate list SHALL equal exactly the subset of `restaurants` whose IDs appear in `selectedRestaurantIds`, preserving identity (same IDs, same count).

**Validates: Requirements 4.2**

### Property 8: Spin result membership

*For any* set of 2 or more selected restaurants, the spin result SHALL always be a member of the selectedRestaurantIds set.

**Validates: Requirements 4.7**
