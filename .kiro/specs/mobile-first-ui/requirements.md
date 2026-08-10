# 需求文件

## 簡介

將 Food Roulette 應用程式的所有 UI 介面轉換為行動優先（mobile-first）網頁設計。移除多欄格線佈局，改為單欄全寬設計；彈窗與表單改為底部滑出面板（bottom sheet）；針對 375px–428px 視窗寬度進行最佳化，並保留最少的 md: 斷點供桌面裝置使用。

## 詞彙表

- **App**：Food Roulette 應用程式整體系統
- **Layout 元件**：包裹所有頁面內容的頂層佈局元件
- **RestaurantListPage 元件**：顯示餐廳清單的頁面元件
- **RestaurantCard 元件**：呈現單一餐廳資訊的卡片元件
- **ResultModal 元件**：轉盤結果的彈窗元件
- **ReviewForm 元件**：新增或編輯餐廳的表單元件
- **RouletteWheel 元件**：轉盤畫布元件
- **FilterPanel 元件**：篩選條件面板元件
- **NavigationBar 元件**：底部導覽列元件
- **Bottom Sheet**：從螢幕底部向上滑出的面板交互模式
- **視窗寬度**：瀏覽器可視區域的水平像素寬度
- **觸控目標**：可互動元素的最小可點擊區域尺寸

## 需求

### 需求 1：佈局元件行動優先化

**使用者故事：** 身為使用者，我希望在手機上瀏覽時頁面內容能佔滿整個螢幕寬度，以獲得最大的閱讀面積。

#### 驗收條件

1. THE Layout 元件 SHALL 移除 max-w-7xl 容器寬度限制，使內容預設佔滿視窗全寬
2. THE Layout 元件 SHALL 使用適合行動裝置的內距（px-4），取代桌面端多層級響應式內距（sm:px-6 lg:px-8）
3. WHERE 視窗寬度大於 768px，THE Layout 元件 SHALL 套用 max-w-3xl 與水平置中，限制桌面端內容最大寬度

### 需求 2：餐廳清單頁面單欄化

**使用者故事：** 身為使用者，我希望在手機上看到的餐廳清單為單欄排列，方便上下滾動瀏覽。

#### 驗收條件

1. THE RestaurantListPage 元件 SHALL 使用單欄垂直排列顯示所有餐廳卡片
2. THE RestaurantListPage 元件 SHALL 移除 md:grid-cols-2 與 lg:grid-cols-3 的多欄格線佈局
3. THE RestaurantCard 元件 SHALL 佔滿父容器的完整寬度

### 需求 3：結果彈窗改為底部滑出面板

**使用者故事：** 身為使用者，我希望轉盤結果以底部滑出面板呈現，符合行動裝置的操作直覺。

#### 驗收條件

1. WHEN 轉盤停止旋轉，THE ResultModal 元件 SHALL 以 Bottom Sheet 形式從螢幕底部向上滑出顯示結果
2. THE ResultModal 元件 SHALL 使用固定定位貼齊螢幕底部，圓角設置於面板頂部（rounded-t-2xl）
3. THE ResultModal 元件 SHALL 在面板頂部中央顯示一個拖曳指示條（drag handle），寬度 40px、高度 4px、圓角
4. THE ResultModal 元件 SHALL 支援點擊背景遮罩關閉面板
5. THE ResultModal 元件 SHALL 在內容超出視窗高度 90% 時啟用內部捲動
6. WHERE 視窗寬度大於 768px，THE ResultModal 元件 SHALL 保留置中對話框樣式，最大寬度 560px

### 需求 4：評論表單改為底部滑出面板

**使用者故事：** 身為使用者，我希望新增或編輯餐廳的表單以底部面板形式出現，方便在手機上單手操作。

#### 驗收條件

1. WHEN 使用者點擊新增或編輯按鈕，THE ReviewForm 元件 SHALL 以 Bottom Sheet 形式從螢幕底部向上滑出
2. THE ReviewForm 元件 SHALL 佔滿螢幕全高（高度 100vh 或使用 dvh 單位），並設置頂部圓角（rounded-t-2xl）
3. THE ReviewForm 元件 SHALL 在面板頂部中央顯示一個拖曳指示條
4. THE ReviewForm 元件 SHALL 支援內部捲動，讓使用者能瀏覽所有表單欄位
5. THE ReviewForm 元件 SHALL 鎖定背景頁面捲動，防止表單開啟時背景內容移動
6. WHERE 視窗寬度大於 768px，THE ReviewForm 元件 SHALL 保留置中覆蓋層樣式，最大寬度 512px

### 需求 5：轉盤元件行動視窗最佳化

**使用者故事：** 身為使用者，我希望轉盤在手機螢幕上有適當的尺寸，不需左右捲動也能完整顯示。

#### 驗收條件

1. THE RouletteWheel 元件 SHALL 使轉盤直徑適應容器寬度，最大不超過視窗寬度減去左右內距（視窗寬度 - 32px）
2. THE RouletteWheel 元件 SHALL 維持最小直徑 280px
3. THE RouletteWheel 元件 SHALL 確保轉盤與旋轉按鈕之間的間距為 16px
4. THE RouletteWheel 元件 SHALL 使旋轉按鈕寬度佔滿容器全寬（width: 100%）

### 需求 6：篩選面板行動間距最佳化

**使用者故事：** 身為使用者，我希望篩選面板在手機上有合適的間距與觸控區域，方便操作。

#### 驗收條件

1. THE FilterPanel 元件 SHALL 使篩選按鈕的最小高度為 44px，確保觸控目標足夠大
2. THE FilterPanel 元件 SHALL 使各篩選區塊之間的垂直間距為 16px
3. THE FilterPanel 元件 SHALL 使標籤按鈕的最小高度為 36px，確保容易點擊

### 需求 7：維持既有行動友善元件不變

**使用者故事：** 身為開發者，我希望已經符合行動設計的元件保持不變，避免不必要的改動。

#### 驗收條件

1. THE NavigationBar 元件 SHALL 維持現有的底部導覽列設計，不進行修改
2. THE App SHALL 維持所有可互動元素的最小觸控目標尺寸為 44px × 44px

### 需求 8：行動優先響應式策略

**使用者故事：** 身為開發者，我希望整體 CSS 策略以行動為預設，僅在桌面端加入少量覆寫。

#### 驗收條件

1. THE App SHALL 以 375px–428px 視窗寬度作為預設設計基準
2. THE App SHALL 僅使用 md:（768px）斷點作為桌面端樣式覆寫的唯一響應式斷點
3. THE App SHALL 移除所有 sm:、lg:、xl: 等非必要的響應式斷點類別
