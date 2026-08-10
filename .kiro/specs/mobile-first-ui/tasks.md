# 實作計畫：Mobile-First UI

## 概述

將 Food Roulette 應用程式的 UI 元件重構為行動優先設計。所有變更僅涉及 Tailwind CSS 類別修改與少量 HTML 結構調整（底部滑出面板的拖曳指示條）。每個任務對應一個元件檔案的修改。

## Tasks

- [ ] 1. Layout 元件行動優先化
  - [ ] 1.1 修改 Layout 元件為行動優先佈局
    - 檔案：`src/components/layout/Layout.tsx`
    - 將 `<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">` 修改為 `<main className="px-4 pb-20 md:max-w-3xl md:mx-auto">`
    - 移除 `max-w-7xl mx-auto`，使行動端內容佔滿全寬
    - 移除 `sm:px-6 lg:px-8` 等非必要響應式斷點
    - 桌面端使用 `md:max-w-3xl md:mx-auto` 限制最大寬度並居中
    - _Requirements: 1.1, 1.2, 1.3, 8.2, 8.3_

- [ ] 2. RestaurantListPage 元件單欄化
  - [ ] 2.1 修改餐廳清單佈局為單欄垂直排列
    - 檔案：`src/components/restaurant/RestaurantListPage.tsx`
    - 將 `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">` 修改為 `<div className="flex flex-col gap-4">`
    - 移除 grid 佈局與 `md:grid-cols-2 lg:grid-cols-3` 響應式斷點
    - 使用 flexbox 單欄排列，卡片自動佔滿全寬
    - _Requirements: 2.1, 2.2, 2.3, 8.3_

- [ ] 3. ResultModal 元件改為底部滑出面板
  - [ ] 3.1 將結果彈窗重構為 Bottom Sheet 形式
    - 檔案：`src/components/roulette/ResultModal.tsx`
    - 將外層容器的 `flex items-center justify-center` 移除（行動端不需居中）
    - 將面板改為 `fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto`
    - 桌面端保留置中：加入 `md:static md:max-w-[560px] md:mx-auto md:mt-[10vh] md:rounded-2xl md:max-h-none`
    - 在面板頂部新增拖曳指示條 HTML：`<div className="flex justify-center pt-3 pb-2 md:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>`
    - 保留既有的背景遮罩點擊關閉、Escape 關閉、body scroll lock 功能
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.2_

- [ ] 4. ReviewForm 元件改為底部滑出面板
  - [ ] 4.1 將表單覆蓋層重構為 Bottom Sheet 形式
    - 檔案：`src/components/form/ReviewForm.tsx`
    - 將外層 `<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">` 修改為 `<div className="fixed inset-0 z-50 bg-black/50">`
    - 將面板 `<div className="w-full max-w-lg mx-auto my-4 sm:my-8 bg-white rounded-xl shadow-xl">` 修改為 `<div className="fixed bottom-0 left-0 right-0 h-[100dvh] bg-white rounded-t-2xl overflow-y-auto md:static md:max-w-[512px] md:mx-auto md:mt-8 md:h-auto md:max-h-[90vh] md:rounded-2xl">`
    - 在 form 開頭之前新增拖曳指示條：`<div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10 md:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>`
    - 移除 `sm:my-8` 等非必要響應式斷點
    - 保留既有的 body scroll lock 功能
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 8.2, 8.3_

- [ ] 5. RouletteWheel 元件行動視窗最佳化
  - [ ] 5.1 修改轉盤元件適應行動視窗寬度
    - 檔案：`src/components/roulette/RouletteWheel.tsx`
    - 將容器 `className="w-full"` 修改為 `className="w-full max-w-[calc(100vw-32px)]"`，確保轉盤不超出視窗
    - 將旋轉按鈕加上 `w-full` 類別，使按鈕佔滿容器全寬
    - 確認 `MIN_DIAMETER = 280` 已存在，維持最小直徑不變
    - 確認 `gap-4`（16px）已存在，維持轉盤與按鈕間距
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6. FilterPanel 元件觸控目標最佳化
  - [ ] 6.1 調整篩選面板按鈕的觸控目標尺寸
    - 檔案：`src/components/roulette/FilterPanel.tsx`
    - 狀態篩選按鈕：將 `px-3 py-1.5` 修改為 `px-3 py-2.5 min-h-[44px]`，確保最小高度 44px
    - 預算篩選按鈕：同上修改，加入 `min-h-[44px]`
    - 標籤按鈕：將 `px-2.5 py-0.5` 修改為 `px-2.5 py-1.5 min-h-[36px]`，確保最小高度 36px
    - 確認 `space-y-4`（16px）已存在，維持區塊間距
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 7. Checkpoint - 建置驗證
  - Ensure all tests pass, ask the user if questions arise.
  - 執行 `npm run build` 確認專案能成功編譯
  - 確認無 TypeScript 錯誤或 lint 警告

## Notes

- 所有變更僅涉及 Tailwind CSS 類別與少量 HTML 結構（拖曳指示條），不涉及 TypeScript 邏輯、型別或狀態管理
- 每個任務對應一個元件檔案，可獨立完成
- NavigationBar、StarRating、ConfirmDialog 等元件已符合行動設計，無需修改（需求 7）
- 響應式策略：移除所有 `sm:`、`lg:`、`xl:` 前綴，僅保留 `md:` 作為桌面端覆寫（需求 8）

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "5.1", "6.1"] },
    { "id": 1, "tasks": ["3.1", "4.1"] }
  ]
}
```
