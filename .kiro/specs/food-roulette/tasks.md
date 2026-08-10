# 實作計畫：Food Roulette Phase 1

## 概述

本計畫將 Food Roulette Phase 1 的設計拆解為可依序執行的編碼任務。技術棧為 React (Vite) + TypeScript + Tailwind CSS + Canvas，使用 React Context + useReducer 管理狀態，localStorage 持久化資料，Vitest + fast-check + React Testing Library 進行測試。所有任務皆為純前端實作，無後端相依。

## Tasks

- [x] 1. 專案初始化與核心型別定義
  - [x] 1.1 初始化 Vite + React + TypeScript 專案，安裝 Tailwind CSS、Vitest、fast-check、React Testing Library 等套件，設定 `tsconfig.json`、`vite.config.ts`、`tailwind.config.js` 及測試環境
    - 建立 `src/styles/index.css` 作為 Tailwind 進入點
    - 設定 Vitest 支援 React Testing Library（含 jsdom）
    - 安裝 `fast-check` 與 `@testing-library/react`
    - _需求: 全域技術架構_

  - [x] 1.2 建立 `src/types/index.ts`，定義所有核心 TypeScript 型別
    - 包含 `Restaurant`、`Tag`、`RestaurantStatus`、`BudgetLevel`、`FilterState`、`AppState`、`AppAction`、`RestaurantFormData`、`StorageSchema` 等型別
    - 定義 `DEFAULT_FILTER` 常數
    - _需求: 2.2, 5.1, 設計文件資料模型_

  - [x] 1.3 建立 `src/utils/formatUtils.ts`，實作格式化工具函數
    - 實作 `truncateText(text, maxLength)` 文字截斷函數
    - 實作 `deriveBudgetLevel(avgCost)` 預算等級衍生函數
    - 實作 `formatCurrency(amount)` 金額格式化
    - _需求: 6.5, 設計文件預算等級對應規則_

  - [x] 1.4 建立 `src/utils/validationUtils.ts`，實作表單驗證工具函數
    - 實作 `validateRestaurantName(name)` 餐廳名稱驗證
    - 實作 `validateTagName(name, existingTags)` Tag 名稱驗證
    - 實作 `validateAvgCost(cost)` 平均消費驗證
    - 實作 `validateDishName(name)` 推薦菜色驗證
    - 實作 `validateNotes(notes)` 筆記驗證
    - _需求: 2.4, 4.1, 4.2, 4.3_

  - [x] 1.5 建立 `src/utils/filterUtils.ts`，實作篩選邏輯
    - 實作 `filterCandidates(restaurants, filters)` 函數
    - 包含狀態篩選、預算篩選、Tag 篩選（AND 組合邏輯）
    - _需求: 5.2, 5.3_

  - [x]* 1.6 撰寫 Property Test：篩選邏輯正確性
    - **Property 1: 篩選邏輯正確性（AND 組合）**
    - **驗證: 需求 5.2, 5.3**
    - 使用 `fc.array(restaurantArb)` 與 `fc.record(filterArb)` 產生隨機資料
    - 驗證篩選結果中的每間餐廳皆同時滿足所有啟用的篩選條件

  - [x]* 1.7 撰寫 Property Test：餐廳名稱空白驗證
    - **Property 4: 餐廳名稱空白驗證**
    - **驗證: 需求 2.4**
    - 使用 `fc.string()` 過濾出僅含空白字元的字串
    - 驗證驗證函數對空白字串回傳錯誤

  - [x]* 1.8 撰寫 Property Test：Tag 驗證規則
    - **Property 5: Tag 驗證規則**
    - **驗證: 需求 4.1, 4.2, 4.3**
    - 驗證長度、空白、重複、上限等規則

  - [x]* 1.9 撰寫 Property Test：文字截斷規則
    - **Property 14: 文字截斷規則**
    - **驗證: 需求 6.5**
    - 使用 `fc.string()` 任意長度字串驗證截斷邏輯

- [x] 2. 狀態管理與資料層
  - [x] 2.1 建立 `src/context/appReducer.ts`，實作所有 Reducer 邏輯
    - 處理 `ADD_RESTAURANT`、`UPDATE_RESTAURANT`、`DELETE_RESTAURANT`、`ADD_TAG`、`SET_FILTERS`、`RESET_FILTERS`、`NAVIGATE`、`SET_UI`、`LOAD_DATA` action
    - 新增餐廳時自動產生 UUID、createdAt、updatedAt
    - 狀態從 VISITED 變更為 WISH_LIST 時自動清除 rating、avgCost、recommendedDishes
    - _需求: 2.3, 3.2, 3.3, 3.5, 4.4, 4.5_

  - [x] 2.2 建立 `src/services/dataService.ts`，封裝 localStorage 讀寫
    - 實作 `loadData()` 從 localStorage 讀取資料
    - 實作 `saveData(restaurants, tags)` 寫入資料
    - 實作 `isInitialized()` 檢查是否已初始化
    - 處理 `QuotaExceededError` 與 `JSON.parse` 失敗等錯誤
    - _需求: 10.3, 10.4, 設計文件錯誤處理_

  - [x] 2.3 建立 `src/data/dummyData.ts`，定義獨立 Dummy Data 模組
    - 至少 8 筆餐廳：2 筆 WISH_LIST、4+ 筆 VISITED
    - 涵蓋全部三種消費等級（$、$$、$$$）
    - VISITED 評分分佈含低（1.0-2.5）、中（3.0-3.5）、高（4.0-5.0）
    - 至少 6 種不同 Tag
    - 每筆餐廳至少 1 個 Tag，至少 2 筆有 3+ 個 Tag
    - _需求: 10.1, 10.2, 10.5_

  - [x] 2.4 建立 `src/context/AppContext.tsx`，實作 Context Provider
    - 提供 AppContext 與 AppProvider 元件
    - 首次載入時判斷 localStorage 是否有資料，無則載入 Dummy Data
    - 每次 state 變更後自動呼叫 dataService 持久化
    - 匯出 `useAppContext()` custom hook
    - _需求: 10.3, 10.4_

  - [x]* 2.5 撰寫 Property Test：新增餐廳增長清單
    - **Property 6: 新增餐廳增長清單**
    - **驗證: 需求 2.3**
    - 驗證新增後清單長度 +1 且包含匹配名稱的餐廳

  - [x]* 2.6 撰寫 Property Test：刪除餐廳縮減清單
    - **Property 7: 刪除餐廳縮減清單**
    - **驗證: 需求 3.5**
    - 驗證刪除後清單長度 -1 且該 ID 不再存在

  - [x]* 2.7 撰寫 Property Test：狀態轉換欄位清除
    - **Property 9: 狀態轉換欄位清除**
    - **驗證: 需求 3.3**
    - 驗證 VISITED → WISH_LIST 時 rating、avgCost、recommendedDishes 被清除

  - [x]* 2.8 撰寫 Property Test：Tag 移除局部性
    - **Property 10: Tag 移除局部性**
    - **驗證: 需求 4.4**
    - 驗證移除 Tag 後餐廳 tagIds -1，全域 Tag 列表不變

  - [x]* 2.9 撰寫 Property Test：Tag 去重複使用
    - **Property 11: Tag 去重複使用**
    - **驗證: 需求 4.5**
    - 驗證重複 Tag 名稱不會增加全域 Tag 列表長度

  - [x]* 2.10 撰寫 Property Test：清單排序不變量
    - **Property 12: 清單排序不變量**
    - **驗證: 需求 1.1**
    - 驗證清單以 createdAt 由新到舊排序

- [x] 3. 檢查點 - 核心邏輯驗證
  - 確認所有測試通過，如有問題請詢問使用者。

- [x] 4. 共用元件與佈局
  - [x] 4.1 建立 `src/App.tsx` 根元件，整合 AppProvider 與頁面路由
    - 根據 `currentPage` state 條件渲染 RestaurantListPage 或 RoulettePage
    - _需求: 9.1_

  - [x] 4.2 建立 `src/components/layout/Layout.tsx` 主佈局框架
    - 處理響應式容器佈局
    - 預留 NavigationBar 位置
    - _需求: 8.1_

  - [x] 4.3 建立 `src/components/layout/NavigationBar.tsx` 導航列
    - 底部導航列包含「餐廳清單」與「美食轉盤」
    - 視覺標示當前頁面（高亮/底線）
    - 切換時 dispatch NAVIGATE action
    - 當 Modal 或 Form 開啟時禁用導航
    - _需求: 9.1, 9.2, 9.4_

  - [x] 4.4 建立 `src/components/shared/ConfirmDialog.tsx` 確認對話框
    - 接收 title、message、onConfirm、onCancel props
    - 包含「確認」與「取消」按鈕
    - _需求: 3.4, 3.6_

  - [x] 4.5 建立 `src/components/shared/TagBadge.tsx` 與 `src/components/shared/TagList.tsx`
    - TagBadge：單一 Tag pill/badge 樣式元件
    - TagList：顯示 Tag 列表，超過 5 個時收合並顯示「+N」
    - _需求: 1.2, 4.6_

  - [x]* 4.6 撰寫 Property Test：Tag 顯示截斷規則
    - **Property 3: Tag 顯示截斷規則**
    - **驗證: 需求 1.2, 4.6**
    - 驗證 N > 5 時顯示 5 個 + 剩餘提示，N ≤ 5 時顯示全部

- [x] 5. 餐廳清單頁面
  - [x] 5.1 建立 `src/components/restaurant/RestaurantCard.tsx` 餐廳卡片
    - 顯示名稱、Status 標籤、評分（星級）、平均消費、Tag 列表
    - WISH_LIST 狀態隱藏評分與消費欄位
    - 點擊可展開/收合詳情
    - _需求: 1.2, 1.3, 1.5_

  - [x] 5.2 建立 `src/components/restaurant/RestaurantDetail.tsx` 餐廳詳情
    - 展開後顯示推薦菜色、個人筆記完整內容
    - 提供編輯、刪除按鈕
    - _需求: 1.3_

  - [x] 5.3 建立 `src/components/restaurant/EmptyState.tsx` 空狀態
    - 清單為空時顯示引導訊息與新增按鈕
    - _需求: 1.4_

  - [x] 5.4 建立 `src/components/restaurant/RestaurantListPage.tsx` 清單頁面
    - 整合 RestaurantCard 列表渲染
    - 響應式佈局：< 768px 單欄、768-1023px 雙欄、≥ 1024px 三欄
    - 新增按鈕觸發表單開啟
    - 由 Context 取得 restaurants，依 createdAt 由新到舊排序
    - _需求: 1.1, 8.2, 8.3_

  - [x]* 5.5 撰寫 Property Test：WISH_LIST 欄位隱藏不變量
    - **Property 2: WISH_LIST 欄位隱藏不變量**
    - **驗證: 需求 1.5, 2.5, 7.2**
    - 驗證 WISH_LIST 餐廳的 rating 為 null、avgCost 為 null、recommendedDishes 為空陣列

- [x] 6. 表單元件
  - [x] 6.1 建立 `src/components/form/StarRating.tsx` 星級評分元件
    - 支援 1.0-5.0、0.5 級距的互動式評分
    - 觸控目標 ≥ 44×44px
    - _需求: 2.2_

  - [x] 6.2 建立 `src/components/form/DishInput.tsx` 推薦菜色輸入元件
    - 多筆輸入，每筆最多 50 字元，最多 10 筆
    - 超過上限時隱藏新增按鈕
    - _需求: 2.2_

  - [x] 6.3 建立 `src/components/form/TagInput.tsx` Tag 輸入元件
    - 支援從既有全域 Tag 列表選擇或自訂新 Tag
    - 自動完成建議
    - 驗證：名稱 1-20 字、不重複、上限 10 個
    - _需求: 4.1, 4.2, 4.3, 4.5_

  - [x] 6.4 建立 `src/components/form/ReviewForm.tsx` 新增/編輯表單
    - 支援 `mode: 'create' | 'edit'`
    - 欄位：名稱（必填）、Status、評分、平均消費、推薦菜色、Tag、筆記
    - WISH_LIST 時隱藏評分、消費、推薦菜色欄位
    - 失焦驗證 + 提交驗證雙重機制
    - 提交成功 dispatch ADD_RESTAURANT 或 UPDATE_RESTAURANT
    - 取消按鈕捨棄未儲存變更
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.7_

  - [x]* 6.5 撰寫 Property Test：編輯資料往返一致性
    - **Property 8: 編輯資料往返一致性**
    - **驗證: 需求 3.1, 3.2**
    - 驗證將餐廳填入表單再不修改提交後，資料應與原始一致（除 updatedAt）

- [x] 7. 檢查點 - 清單與表單功能
  - 確認所有測試通過，如有問題請詢問使用者。

- [x] 8. 轉盤頁面與動畫
  - [x] 8.1 建立 `src/hooks/useRouletteWheel.ts` 轉盤動畫邏輯 hook
    - 實作 `calculateTargetAngle(candidateCount, config)` 隨機目標角度計算
    - 實作 `easeOutCubic(t)` 緩動函數
    - 管理動畫狀態（Idle → Spinning → Stopped）
    - 使用 `requestAnimationFrame` 驅動動畫
    - cleanup 時取消 `requestAnimationFrame`
    - _需求: 6.2, 6.3_

  - [x] 8.2 建立 `src/components/roulette/RouletteWheel.tsx` Canvas 轉盤元件
    - 使用 Canvas 繪製圓形轉盤，扇區均勻分佈餐廳名稱
    - 處理 `devicePixelRatio` 高 DPI 支援
    - 名稱超過 6 字元時截斷 + 省略號
    - 固定指針繪製於轉盤上方
    - 根據容器寬度自適應，最小直徑 280px
    - 支援 2-20 間候選餐廳
    - _需求: 6.1, 6.5, 8.4_

  - [x] 8.3 建立 `src/components/roulette/FilterPanel.tsx` 篩選面板
    - 狀態篩選（全部/想去清單/已造訪）
    - 預算篩選（不限/$/$$/$$​$）
    - Tag 多選篩選
    - 即時顯示候選餐廳數量
    - 一鍵重置按鈕
    - 候選為 0 時顯示提示並禁用旋轉按鈕
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 8.4 建立 `src/components/roulette/ResultModal.tsx` 結果彈窗
    - 顯示選中餐廳完整資訊（名稱、Status、評分、消費、Tag、菜色、筆記）
    - WISH_LIST 時隱藏評分、消費、推薦菜色
    - 「關閉」按鈕回到轉盤頁面
    - 「再轉一次」按鈕重新啟動旋轉
    - 開啟時鎖定背景滾動
    - 點擊外部區域或 Escape 關閉
    - < 768px 全螢幕，≥ 768px 置中彈窗最大寬度 560px
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.5_

  - [x] 8.5 建立 `src/components/roulette/RoulettePage.tsx` 轉盤頁面
    - 整合 FilterPanel、RouletteWheel、ResultModal
    - 候選僅 1 間時跳過動畫直接顯示結果
    - 旋轉結束後 500ms 開啟 ResultModal
    - 旋轉中禁用旋轉按鈕
    - _需求: 6.2, 6.3, 6.4, 6.6_

  - [x]* 8.6 撰寫 Property Test：轉盤選擇均勻性
    - **Property 13: 轉盤選擇均勻性**
    - **驗證: 需求 6.2**
    - 使用統計取樣驗證選擇函數對 N 個候選的索引分佈接近均勻

- [x] 9. 導航與整合
  - [x] 9.1 整合導航切換邏輯
    - 確保切換頁面時保留篩選條件與捲動位置
    - 切換動作在 300ms 內完成
    - _需求: 9.2, 9.3_

  - [x] 9.2 更新 `src/main.tsx` 入口，整合完整應用
    - 引入 `index.css`、掛載 `App` 元件
    - 確保首次載入 Dummy Data 初始化流程正確
    - _需求: 10.3_

- [x] 10. 最終檢查點 - 完整功能驗證
  - 確認所有測試通過，如有問題請詢問使用者。

## Notes

- 標記 `*` 的子任務為選擇性任務，可跳過以加快 MVP 進度
- 每個任務皆參照具體需求編號，確保可追溯性
- 檢查點用於確認階段性成果的正確性
- Property Test 驗證通用正確性屬性，Unit Test 驗證特定範例與邊界情況
- 所有元件皆須遵循 Mobile-first 響應式設計原則
- 觸控目標尺寸不小於 44×44px（無障礙要求）

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5"] },
    { "id": 3, "tasks": ["1.6", "1.7", "1.8", "1.9", "2.1", "2.2", "2.3"] },
    { "id": 4, "tasks": ["2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10"] },
    { "id": 5, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 6, "tasks": ["5.1", "5.2", "5.3", "6.1", "6.2", "6.3"] },
    { "id": 7, "tasks": ["5.4", "5.5", "6.4"] },
    { "id": 8, "tasks": ["6.5", "8.1"] },
    { "id": 9, "tasks": ["8.2", "8.3", "8.4"] },
    { "id": 10, "tasks": ["8.5", "8.6"] },
    { "id": 11, "tasks": ["9.1", "9.2"] }
  ]
}
```
