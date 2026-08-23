# Requirements Document

## Introduction

本功能將轉盤頁面的篩選機制替換為手動勾選模式，並將清單頁面從時間排序改為分類分組顯示。用戶在清單頁面透過 checkbox 勾選餐廳，勾選的餐廳成為轉盤的候選名單。清單頁面提供下拉選單讓用戶切換分組方式（依狀態、依預算、依標籤）。

## Glossary

- **App**: 食物轉盤應用程式前端系統
- **RestaurantListPage**: 餐廳清單頁面元件，負責顯示所有餐廳並提供勾選功能
- **RoulettePage**: 轉盤頁面元件，負責顯示轉盤與執行隨機選取
- **SelectionState**: 全域狀態中記錄已勾選餐廳 ID 集合的資料結構
- **GroupMode**: 清單頁面分組方式的列舉值，包含 status（依狀態）、budget（依預算）、tag（依標籤）
- **RestaurantCard**: 單間餐廳的卡片元件，顯示餐廳摘要資訊
- **FilterPanel**: 原有的轉盤篩選面板元件（將被移除）

## Requirements

### Requirement 1: 餐廳勾選狀態管理

**User Story:** As a 用戶, I want 勾選特定餐廳加入轉盤候選名單, so that 轉盤只會從我選定的餐廳中隨機抽取。

#### Acceptance Criteria

1. THE App SHALL 在全域狀態中維護一組已勾選餐廳 ID 的集合（selectedRestaurantIds）。
2. WHEN 用戶勾選一間餐廳, THE App SHALL 將該餐廳的 ID 加入 selectedRestaurantIds 集合。
3. WHEN 用戶取消勾選一間餐廳, THE App SHALL 將該餐廳的 ID 從 selectedRestaurantIds 集合中移除。
4. THE App SHALL 在頁面導航時保留 selectedRestaurantIds 的內容不變。
5. WHEN 應用程式啟動時, THE App SHALL 將 selectedRestaurantIds 初始化為空集合。
6. WHEN 一間已勾選的餐廳被刪除, THE App SHALL 自動將該餐廳的 ID 從 selectedRestaurantIds 中移除。

### Requirement 2: 清單頁面勾選介面

**User Story:** As a 用戶, I want 在清單頁面看到每間餐廳旁邊有 checkbox, so that 我可以方便地選取要加入轉盤的餐廳。

#### Acceptance Criteria

1. THE RestaurantListPage SHALL 在每張 RestaurantCard 旁顯示一個 checkbox 控制項。
2. THE checkbox SHALL 反映該餐廳目前的勾選狀態（已勾選顯示為選中，未勾選顯示為未選中）。
3. WHEN 用戶點擊 checkbox, THE RestaurantListPage SHALL 切換該餐廳的勾選狀態。
4. THE checkbox 控制項 SHALL 具備至少 44x44 像素的觸控目標區域。
5. THE checkbox SHALL 具備適當的 accessible name，供螢幕閱讀器辨識其用途。

### Requirement 3: 清單頁面分組顯示

**User Story:** As a 用戶, I want 以不同的分類方式瀏覽餐廳清單, so that 我可以更快找到想選取的餐廳。

#### Acceptance Criteria

1. THE RestaurantListPage SHALL 移除現有的時間排序顯示邏輯，改為以分組方式顯示餐廳。
2. THE RestaurantListPage SHALL 提供一個下拉選單讓用戶選擇分組方式。
3. THE 下拉選單 SHALL 包含三個選項：「依狀態分組」、「依預算分組」、「依標籤分組」。
4. WHEN 用戶選擇「依狀態分組」, THE RestaurantListPage SHALL 將餐廳分為「想去清單」和「已造訪」兩個群組顯示。
5. WHEN 用戶選擇「依預算分組」, THE RestaurantListPage SHALL 將餐廳依 budgetLevel（$、$$、$$$）分組顯示，budgetLevel 為 null 的餐廳歸入「未設定」群組。
6. WHEN 用戶選擇「依標籤分組」, THE RestaurantListPage SHALL 將餐廳依其所屬標籤分組顯示，一間餐廳擁有多個標籤時出現在每個對應的標籤群組中。
7. WHEN 用戶選擇「依標籤分組」且餐廳沒有任何標籤, THE RestaurantListPage SHALL 將該餐廳歸入「無標籤」群組。
8. THE RestaurantListPage SHALL 在每個群組上方顯示群組名稱作為標題。

### Requirement 4: 轉盤頁面使用勾選名單

**User Story:** As a 用戶, I want 轉盤只顯示我勾選的餐廳, so that 隨機結果都是我當下願意考慮的選項。

#### Acceptance Criteria

1. THE RoulettePage SHALL 移除 FilterPanel 元件及其相關的篩選邏輯。
2. THE RoulettePage SHALL 使用 selectedRestaurantIds 作為轉盤的候選名單來源。
3. THE RoulettePage SHALL 在轉盤區域顯示目前已勾選的餐廳數量。
4. WHILE selectedRestaurantIds 為空集合, THE RoulettePage SHALL 將轉動按鈕設為禁用狀態（disabled）。
5. WHILE selectedRestaurantIds 為空集合, THE RoulettePage SHALL 顯示提示訊息引導用戶前往清單頁面勾選餐廳。
6. WHEN 用戶按下轉動按鈕且 selectedRestaurantIds 中僅有一間餐廳, THE RoulettePage SHALL 直接顯示該餐廳為結果而不執行轉動動畫。
7. WHEN 用戶按下轉動按鈕且 selectedRestaurantIds 中有兩間以上餐廳, THE RoulettePage SHALL 執行轉盤動畫並隨機選出一間餐廳。

### Requirement 5: 移除舊有篩選機制

**User Story:** As a 開發者, I want 移除不再使用的篩選邏輯, so that 程式碼保持精簡且不存在無用的功能路徑。

#### Acceptance Criteria

1. THE App SHALL 不再於轉盤頁面渲染 FilterPanel 元件。
2. THE App SHALL 保留 FilterState 型別及 filterUtils 模組供未來其他用途使用，但轉盤頁面不再引用這些模組。
