# Requirements Document

## Introduction

本功能為「想去清單 (WISH_LIST)」餐廳補上每人平均消費的呈現，使其與「已造訪 (VISITED)」餐廳一致地顯示預算資訊。想去清單的預算來源為 Google Maps Places API 的價位等級 (price level)，以 `$`/`$$`/`$$$`/`$$$$` 符號呈現；已造訪的預算則由使用者手動輸入台幣金額。兩種預算資訊皆需顯示於餐廳卡片。為支援 Google 的四級價位，系統的預算等級由三級擴充為四級，並同步更新型別、篩選器、分組模式與資料庫約束。

## Glossary

- **System (系統)**: FoodWheel 餐廳管理與探索應用程式的前端與資料存取層。
- **Restaurant (餐廳)**: 使用者建立的餐廳資料實體，包含狀態、預算等資訊。
- **WISH_LIST (想去清單狀態)**: 餐廳狀態之一，代表尚未造訪、想去的餐廳。
- **VISITED (已造訪狀態)**: 餐廳狀態之一，代表已造訪的餐廳。
- **BudgetLevel (預算等級)**: 以 `$` 符號表示的價位等級型別，值為 `$`、`$$`、`$$$`、`$$$$` 之一，或 `null`。
- **avgCost (每人平均消費)**: 使用者為 VISITED 餐廳輸入的每人平均台幣金額，正整數，最大 99999。
- **Google_Price_Level (Google 價位等級)**: Google Places API 回傳的價位列舉字串，值為 `PRICE_LEVEL_INEXPENSIVE`、`PRICE_LEVEL_MODERATE`、`PRICE_LEVEL_EXPENSIVE`、`PRICE_LEVEL_VERY_EXPENSIVE` 之一。
- **PlaceSearch (地點搜尋元件)**: 搜尋 Google 地點並選取的表單元件。
- **ReviewForm (餐廳表單)**: 新增/編輯餐廳資料的表單。
- **RestaurantCard (餐廳卡片)**: 清單中呈現單一餐廳摘要的卡片元件。
- **BudgetFilter (預算篩選器)**: 依預算等級篩選餐廳的篩選狀態。
- **Budget_Group_Mode (預算分組模式)**: 依預算等級將餐廳分組的分組模式 (`GroupMode` 的 `'budget'`)。
- **DataService (資料服務)**: 負責 `budget_level` 與 `budgetLevel` 欄位對應、與資料庫讀寫的服務層。

## Requirements

### Requirement 1: 預算等級擴充為四級

**User Story:** As a 使用者, I want 系統支援四級價位等級, so that 系統能完整對應 Google 的四級價位資訊。

#### Acceptance Criteria

1. THE System SHALL 定義 BudgetLevel 型別的有效值為 `$`、`$$`、`$$$`、`$$$$` 或 `null`。
2. THE System SHALL 定義 BudgetFilter 型別的有效值為 `ALL`、`$`、`$$`、`$$$`、`$$$$`。
3. WHERE Budget_Group_Mode 啟用，THE System SHALL 依 `$`、`$$`、`$$$`、`$$$$` 四個等級將餐廳分組。
4. WHERE 餐廳的 BudgetLevel 為 `null`，THE System SHALL 將該餐廳歸入無預算等級的分組。

### Requirement 2: Google 價位等級對應為符號

**User Story:** As a 使用者, I want 系統將 Google 的價位列舉轉換為 `$` 符號, so that 我能以熟悉的符號檢視價位。

#### Acceptance Criteria

1. WHEN 系統接收到 Google_Price_Level 為 `PRICE_LEVEL_INEXPENSIVE`，THE System SHALL 將其對應為 BudgetLevel `$`。
2. WHEN 系統接收到 Google_Price_Level 為 `PRICE_LEVEL_MODERATE`，THE System SHALL 將其對應為 BudgetLevel `$$`。
3. WHEN 系統接收到 Google_Price_Level 為 `PRICE_LEVEL_EXPENSIVE`，THE System SHALL 將其對應為 BudgetLevel `$$$`。
4. WHEN 系統接收到 Google_Price_Level 為 `PRICE_LEVEL_VERY_EXPENSIVE`，THE System SHALL 將其對應為 BudgetLevel `$$$$`。
5. IF Google_Price_Level 為 `null` 或不屬於已定義的四個列舉值，THEN THE System SHALL 將對應結果設為 `null`。

### Requirement 3: 將 priceLevel 串接至地點選取流程

**User Story:** As a 使用者, I want 選取 Google 地點時帶入其價位資訊, so that 想去清單餐廳能自動取得預算等級。

#### Acceptance Criteria

1. WHEN 使用者於 PlaceSearch 選取一個 Google 地點，THE System SHALL 於選取回呼中包含該地點的 priceLevel 值。
2. WHEN ReviewForm 處理地點選取結果，THE System SHALL 將 priceLevel 對應為 BudgetLevel 並帶入表單的預算等級欄位。
3. THE System SHALL 於 RestaurantFormData 中提供 budgetLevel 欄位以承載預算等級資料。

### Requirement 4: 想去清單預算自動帶入與手動修改

**User Story:** As a 使用者, I want 想去清單餐廳自動帶入 Google 價位並可手動調整, so that 我能在無資料或資料不符時自行設定。

#### Acceptance Criteria

1. WHILE 餐廳狀態為 WISH_LIST，THE ReviewForm SHALL 顯示提供 `$`、`$$`、`$$$`、`$$$$` 選項的預算等級選擇器。
2. WHEN 地點選取帶入非 `null` 的 BudgetLevel，THE ReviewForm SHALL 將該預算等級選擇器預設為帶入的等級。
3. WHEN 使用者於 WISH_LIST 的預算等級選擇器變更選項，THE System SHALL 以使用者選取的等級作為該餐廳的 budgetLevel。
4. IF 地點無價位資料且使用者未手動選擇等級，THEN THE System SHALL 將該餐廳的 budgetLevel 設為 `null`。

### Requirement 5: 已造訪預算手動輸入台幣金額

**User Story:** As a 使用者, I want 已造訪餐廳輸入每人平均台幣消費, so that 我能記錄實際的花費金額。

#### Acceptance Criteria

1. WHILE 餐廳狀態為 VISITED，THE ReviewForm SHALL 顯示每人平均消費 (avgCost) 的台幣數值輸入欄位。
2. WHEN 使用者於 VISITED 的 avgCost 欄位輸入數值，THE System SHALL 接受 1 至 99999 之間的正整數。
3. IF 使用者於 VISITED 的 avgCost 欄位輸入的數值小於 1 或大於 99999，THEN THE System SHALL 拒絕該輸入並提示有效範圍。

### Requirement 6: 餐廳卡片顯示預算

**User Story:** As a 使用者, I want 餐廳卡片顯示預算資訊, so that 我瀏覽清單時能直接看到每人平均消費。

#### Acceptance Criteria

1. WHILE 餐廳狀態為 WISH_LIST 且 budgetLevel 非 `null`，THE RestaurantCard SHALL 以 `$` 符號等級 (`$`/`$$`/`$$$`/`$$$$`) 顯示預算。
2. WHILE 餐廳狀態為 VISITED 且 avgCost 非 `null`，THE RestaurantCard SHALL 以台幣金額格式顯示每人平均消費。
3. IF 餐廳的預算資訊為 `null`（WISH_LIST 的 budgetLevel 或 VISITED 的 avgCost），THEN THE RestaurantCard SHALL 不顯示預算區塊。

### Requirement 7: 資料庫約束相容四級預算

**User Story:** As a 系統維運者, I want 資料庫接受四級預算等級, so that 第四級預算資料能正確儲存。

#### Acceptance Criteria

1. THE System SHALL 使資料庫 `budget_level` 欄位的約束允許 `$`、`$$`、`$$$`、`$$$$` 或 `null`。
2. WHEN DataService 儲存餐廳資料，THE DataService SHALL 將 budgetLevel 對應為資料庫的 `budget_level` 欄位值。
3. WHEN DataService 讀取餐廳資料，THE DataService SHALL 將資料庫的 `budget_level` 欄位對應為 budgetLevel。
