# Implementation Plan: budget-per-person-display

## Overview

本計畫將「想去清單 (WISH_LIST)」的每人平均消費呈現補齊，使其與「已造訪 (VISITED)」一致地在餐廳卡片顯示預算，並將預算等級由三級擴充為四級。實作順序由型別與純函式（可及早以屬性測試驗證）起手，再往上串接資料流（PlaceSearch → ReviewForm → RestaurantCard），最後更新篩選/分組與資料庫遷移。每個任務皆以 TypeScript/TSX 實作，並沿用既有 Vitest 測試框架。

屬性測試標籤格式：**Feature: budget-per-person-display, Property {number}: {property_text}**，每個屬性測試至少 100 次隨機迭代。

## Tasks

- [x] 1. 擴充型別與資料庫約束（基礎設定）
  - [x] 1.1 擴充型別為四級預算並補上表單欄位
    - 於 `src/types/index.ts` 將 `BudgetLevel` 由 `'$' | '$$' | '$$$'` 擴充為 `'$' | '$$' | '$$$' | '$$$$'`
    - 將 `BudgetFilter` 由 `'ALL' | '$' | '$$' | '$$$'` 擴充為 `'ALL' | '$' | '$$' | '$$$' | '$$$$'`
    - 於 `RestaurantFormData` 介面新增可選欄位 `budgetLevel?: BudgetLevel | null`
    - _Requirements: 1.1, 1.2, 3.3_

- [x] 2. 實作 Google 價位列舉對應函式
  - [x] 2.1 於 `src/utils/placesApi.ts` 實作 `priceLevelToBudgetLevel`
    - 新增 `PRICE_LEVEL_MAP` 常數對應 `PRICE_LEVEL_INEXPENSIVE→'$'`、`PRICE_LEVEL_MODERATE→'$$'`、`PRICE_LEVEL_EXPENSIVE→'$$$'`、`PRICE_LEVEL_VERY_EXPENSIVE→'$$$$'`
    - 實作 `priceLevelToBudgetLevel(priceLevel: string | null): BudgetLevel | null`，對 `null` 與未知字串回傳 `null`（null-safe）
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.2 撰寫有效列舉對應的屬性測試
    - **Feature: budget-per-person-display, Property 1: 有效 Google 價位列舉對應到正確符號**
    - 對四個已定義列舉值產生輸入，驗證回傳分別等於 `$`/`$$`/`$$$`/`$$$$`
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [ ]* 2.3 撰寫非法/null 對應的屬性測試
    - **Feature: budget-per-person-display, Property 2: 非法或 null 價位輸入對應為 null**
    - 對 `null` 與任意不屬於四個列舉值的字串，驗證回傳為 `null`
    - **Validates: Requirements 2.5**

- [x] 3. 於 PlaceSearch 串接 priceLevel
  - [x] 3.1 擴充 `PlaceResult` 型別並帶出 priceLevel
    - 於 `src/components/form/PlaceSearch.tsx` 的 `PlaceResult` 介面新增 `priceLevel: string | null`
    - `details` 分支：確認 `onPlaceSelect(details)` 帶出 `PlaceDetails.priceLevel`
    - fallback 分支：於 `onPlaceSelect({...})` 補上 `priceLevel: null`
    - _Requirements: 3.1_

  - [ ]* 3.2 撰寫 PlaceSearch 回呼帶出 priceLevel 的單元測試
    - 驗證選取有 details 的地點時回呼含 priceLevel，fallback 時為 `null`
    - _Requirements: 3.1_

- [x] 4. ReviewForm 表單邏輯與 UI
  - [x] 4.1 新增 budgetLevel 狀態與地點選取自動帶入
    - 於 `src/components/form/ReviewForm.tsx` 新增 `budgetLevel` 狀態，以 `initialData?.budgetLevel ?? null` 初始化
    - 於 `handlePlaceSelect` 呼叫 `priceLevelToBudgetLevel(place.priceLevel)`，僅在對應結果非 `null` 時 `setBudgetLevel`
    - `handleStatusChange` 切到 `VISITED` 時將 `budgetLevel` 設為 `null`
    - _Requirements: 3.2, 4.2_

  - [x] 4.2 新增 WISH_LIST 四級預算選擇器 UI
    - `isWishList` 為 true 時渲染 `$`/`$$`/`$$$`/`$$$$` 四個可切換按鈕
    - 再次點選同一等級可取消為 `null`
    - VISITED 維持既有 `avgCost` 數值輸入區塊
    - _Requirements: 4.1, 4.3, 4.4, 5.1_

  - [x] 4.3 更新提交組裝邏輯
    - 組裝 `RestaurantFormData` 時：WISH_LIST 用使用者/自動帶入的 `budgetLevel`、`avgCost` 設為 `null`；VISITED 以 `deriveBudgetLevel(parsedCost)` 衍生 `budgetLevel`、保留 `avgCost`
    - 沿用既有 `validateAvgCost` 進行 1–99999 驗證
    - _Requirements: 4.4, 5.1, 5.2, 5.3_

  - [ ]* 4.4 撰寫 ReviewForm 行為單元測試
    - 選取地點後自動帶入等級、WISH_LIST 顯示四級選擇器、VISITED 顯示 avgCost 輸入、切換狀態清理 budgetLevel
    - _Requirements: 3.2, 4.1, 4.2, 4.3, 5.1_

  - [ ]* 4.5 撰寫 avgCost 驗證屬性測試
    - **Feature: budget-per-person-display, Property 4: avgCost 驗證的範圍等價性**
    - 對任意整數，驗證 `validateAvgCost` 通過當且僅當介於 1–99999（含），否則失敗且回傳非空錯誤訊息
    - **Validates: Requirements 5.2, 5.3**

- [x] 5. Checkpoint - 確認型別、對應函式與表單流程
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. RestaurantCard 預算顯示
  - [x] 6.1 實作雙狀態預算呈現
    - 於 `src/components/restaurant/RestaurantCard.tsx`：WISH_LIST 且 `budgetLevel !== null` 顯示 `$` 符號等級
    - VISITED 且 `avgCost !== null` 以 `NT$` 金額格式顯示
    - 對應預算值為 `null` 時不渲染預算區塊
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 6.2 撰寫卡片預算顯示屬性測試
    - **Feature: budget-per-person-display, Property 6: 餐廳卡片預算顯示規則**
    - 對任意餐廳驗證：WISH_LIST+非 null budgetLevel 含 `$` 符號、VISITED+非 null avgCost 含台幣金額、null 時不渲染預算區塊
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 7. 篩選與分組更新為四級
  - [x] 7.1 新增 FilterPanel 第四級選項
    - 於 `src/components/roulette/FilterPanel.tsx` 的 `BUDGET_OPTIONS` 新增 `{ value: '$$$$', label: '$$$$' }`
    - 確認 `filterUtils.filterCandidates` 因型別擴充自動支援 `$$$$`（如需，補上比對）
    - _Requirements: 1.2_

  - [x] 7.2 更新 groupByBudget 支援第四級
    - 於 `src/utils/groupUtils.ts` 的 `groupByBudget` 於 `buckets` 與 `labels` 新增 `$$$$`
    - 確認 `budgetLevel` 為 `null` 的餐廳歸入「未設定」分組
    - _Requirements: 1.3, 1.4_

  - [ ]* 7.3 撰寫分組分割屬性測試
    - **Feature: budget-per-person-display, Property 3: 依預算等級分組為正確分割**
    - 對任意餐廳陣列驗證每間餐廳恰好出現於一個分組、涵蓋所有輸入、無重複無遺漏，null 落入「未設定」
    - **Validates: Requirements 1.3, 1.4**

- [ ] 8. DataService round-trip 驗證
  - [ ]* 8.1 撰寫預算欄位 round-trip 屬性測試
    - **Feature: budget-per-person-display, Property 5: DataService 預算欄位 round-trip 保值**
    - 於 `src/services/dataService.test.ts` 對任意有效 Restaurant 驗證 `restaurantToDb` 再 `dbToRestaurant` 後 `budgetLevel`（含 `$$$$`）與 `avgCost` 等欄位保值
    - **Validates: Requirements 7.2, 7.3**

- [x] 9. 資料庫遷移允許四級預算
  - [x] 9.1 新增遷移檔 `002_extend_budget_level.sql`
    - 於 `supabase/migrations/002_extend_budget_level.sql` 先 `DROP CONSTRAINT IF EXISTS restaurants_budget_level_check`
    - 再新增 `CHECK (budget_level IS NULL OR budget_level IN ('$', '$$', '$$$', '$$$$'))`
    - _Requirements: 7.1_

- [x] 10. Final checkpoint - 確認全部測試通過
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- 標記 `*` 的子任務為選用（測試），可為求快速 MVP 略過，但仍列於相依圖中。
- 每個任務標註對應的需求子項以利追溯。
- Checkpoints 用於增量驗證。
- 屬性測試驗證全稱正確性屬性；單元測試驗證具體範例與邊界。
- Task 8.1 為純測試任務（design 指出 dataService 對應無需程式變更，僅需 round-trip 測試確認）。

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "9.1"] },
    { "id": 1, "tasks": ["2.1", "7.1", "7.2"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1", "4.1", "6.1", "7.3", "8.1"] },
    { "id": 3, "tasks": ["3.2", "4.2", "6.2"] },
    { "id": 4, "tasks": ["4.3"] },
    { "id": 5, "tasks": ["4.4", "4.5"] }
  ]
}
```
