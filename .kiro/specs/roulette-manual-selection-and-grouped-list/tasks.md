# Implementation Plan: Roulette Manual Selection & Grouped List

## Overview

將轉盤頁面的篩選機制替換為手動勾選模式，並將清單頁面改為分類分組顯示。實作分為四大區塊：型別與 Reducer 擴展、分組工具函式、清單頁面改造、轉盤頁面改造。

## Tasks

- [x] 1. Extend types and state management
  - [x] 1.1 Add GroupMode type, extend AppState and AppAction in src/types/index.ts
    - Add `GroupMode = 'status' | 'budget' | 'tag'` type export
    - Add `selectedRestaurantIds: string[]` field to `AppState`
    - Add `TOGGLE_RESTAURANT_SELECTION` and `CLEAR_SELECTION` action types to `AppAction`
    - _Requirements: 1.1, 3.2, 3.3_

  - [x] 1.2 Extend appReducer with new action handlers in src/context/appReducer.ts
    - Implement `TOGGLE_RESTAURANT_SELECTION` case: toggle ID in/out of selectedRestaurantIds
    - Implement `CLEAR_SELECTION` case: reset selectedRestaurantIds to empty array
    - Modify `DELETE_RESTAURANT` case to also remove deleted ID from selectedRestaurantIds
    - _Requirements: 1.2, 1.3, 1.6_

  - [x] 1.3 Update AppContext initial state in src/context/AppContext.tsx
    - Add `selectedRestaurantIds: []` to initialState
    - _Requirements: 1.1, 1.5_

- [x] 2. Implement grouping utility functions
  - [x] 2.1 Create src/utils/groupUtils.ts with grouping logic
    - Define `RestaurantGroup` interface (`key`, `label`, `restaurants`)
    - Implement `groupByStatus` function
    - Implement `groupByBudget` function
    - Implement `groupByTag` function
    - Implement `groupRestaurants` dispatcher function
    - _Requirements: 3.4, 3.5, 3.6, 3.7_

  - [ ]* 2.2 Write property tests for groupByStatus (Property 4)
    - **Property 4: Group by status correctness**
    - **Validates: Requirements 3.4**

  - [ ]* 2.3 Write property tests for groupByBudget (Property 5)
    - **Property 5: Group by budget correctness**
    - **Validates: Requirements 3.5**

  - [ ]* 2.4 Write property tests for groupByTag (Property 6)
    - **Property 6: Group by tag correctness**
    - **Validates: Requirements 3.6, 3.7**

- [x] 3. Checkpoint - Ensure types and utilities compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Refactor RestaurantListPage with grouped display and checkboxes
  - [x] 4.1 Rewrite RestaurantListPage to use grouped display with checkboxes
    - Replace `sortedRestaurants` logic with `groupRestaurants()` call
    - Add `useState<GroupMode>('status')` for local group mode
    - Add `<select>` dropdown to switch group mode with options: 依狀態分組、依預算分組、依標籤分組
    - Render restaurants in grouped sections with `<h2>` headers
    - Add checkbox before each RestaurantCard, wired to `TOGGLE_RESTAURANT_SELECTION`
    - Ensure checkbox has min 44x44px touch target and accessible label
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.8_

  - [ ]* 4.2 Write unit tests for RestaurantListPage grouped display
    - Test group mode switching renders correct groups
    - Test checkbox toggles dispatch correct action
    - Test accessible labels on checkboxes
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.4, 3.5, 3.6_

- [x] 5. Refactor RoulettePage to use selection-based candidates
  - [x] 5.1 Update RoulettePage to remove FilterPanel and use selectedRestaurantIds
    - Remove `FilterPanel` import and rendering
    - Remove `filterCandidates` import and usage
    - Replace candidates with `state.restaurants.filter(r => state.selectedRestaurantIds.includes(r.id))`
    - Display selected count: "已選取 N 間餐廳"
    - Show guidance message when selection is empty
    - Disable spin button when candidates.length === 0
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2_

  - [ ]* 5.2 Write unit tests for RoulettePage selection behavior
    - Test empty selection shows guidance message and disabled button
    - Test single selection skips animation
    - Test candidate list matches selectedRestaurantIds
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Property tests for state management
  - [ ]* 7.1 Write property test for selection toggle round-trip (Property 1)
    - **Property 1: Selection toggle round-trip**
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 7.2 Write property test for navigation preserves selection (Property 2)
    - **Property 2: Navigation preserves selection**
    - **Validates: Requirements 1.4**

  - [ ]* 7.3 Write property test for delete cleans up selection (Property 3)
    - **Property 3: Delete cleans up selection**
    - **Validates: Requirements 1.6**

  - [ ]* 7.4 Write property test for roulette candidates match selection (Property 7)
    - **Property 7: Roulette candidates match selection**
    - **Validates: Requirements 4.2**

  - [ ]* 7.5 Write property test for spin result membership (Property 8)
    - **Property 8: Spin result membership**
    - **Validates: Requirements 4.7**

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The design specifies `selectedRestaurantIds` is NOT persisted to localStorage (Requirement 1.5)
- FilterPanel component and filterUtils module are retained in the codebase but no longer referenced from RoulettePage (Requirement 5.2)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "4.1", "5.1"] },
    { "id": 4, "tasks": ["4.2", "5.2", "7.1", "7.2", "7.3", "7.4", "7.5"] }
  ]
}
```
