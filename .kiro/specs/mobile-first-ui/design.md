# 技術設計文件：Mobile-First UI

## 概述

本設計描述如何將 Food Roulette 應用程式的 UI 元件重構為行動優先設計。所有變更僅涉及 Tailwind CSS 類別修改與少量 HTML 結構調整，不涉及型別定義、狀態管理或資料層變更。

## 架構方針

### 設計原則

- **行動預設**：所有樣式以 375px–428px 視窗寬度為基準撰寫
- **最少斷點**：僅使用 `md:`（768px）作為桌面端覆寫
- **底部滑出面板模式**：彈窗與全螢幕表單統一改為 bottom sheet 形式
- **觸控優先**：所有可互動元素維持 44px 最小觸控目標

### 響應式策略

```
行動端（預設）：375px–428px，單欄全寬佈局
桌面端（md:）：≥768px，限制最大寬度，居中顯示
```

移除的響應式前綴：`sm:`、`lg:`、`xl:`
保留的響應式前綴：`md:` only

---

## 元件變更設計

### 1. Layout 元件

**檔案**：`src/components/layout/Layout.tsx`

**變更內容**：

```tsx
// 修改前
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

// 修改後
<main className="px-4 pb-20 md:max-w-3xl md:mx-auto">
```

**設計決策**：
- 移除 `max-w-7xl mx-auto`，讓行動端內容佔滿全寬
- 保留 `px-4` 作為行動端統一內距（16px 左右）
- 桌面端使用 `md:max-w-3xl md:mx-auto` 限制寬度並居中

### 2. RestaurantListPage 元件

**檔案**：`src/components/restaurant/RestaurantListPage.tsx`

**變更內容**：

```tsx
// 修改前
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 修改後
<div className="flex flex-col gap-4">
```

**設計決策**：
- 移除 grid 佈局，改為 flexbox 單欄垂直排列
- 卡片自動佔滿父容器全寬（flex item 預設 stretch）
- 保留 `gap-4` 維持卡片間距

### 3. ResultModal 元件（底部滑出面板）

**檔案**：`src/components/roulette/ResultModal.tsx`

**變更內容**：

行動端改為 bottom sheet 模式：
- 面板固定於螢幕底部（`fixed bottom-0 left-0 right-0`）
- 頂部圓角（`rounded-t-2xl`）
- 新增拖曳指示條（drag handle）
- 內容區域限制最大高度 90vh 並啟用捲動

桌面端保留置中對話框：
- `md:` 斷點恢復居中定位與固定最大寬度

```tsx
// 行動端 Bottom Sheet 結構
<div className="fixed inset-0 bg-black/50 z-50" onClick={handleOverlayClick}>
  <div
    ref={panelRef}
    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto
               md:static md:max-w-[560px] md:mx-auto md:mt-[10vh] md:rounded-2xl md:max-h-none"
  >
    {/* 拖曳指示條 */}
    <div className="flex justify-center pt-3 pb-2 md:hidden">
      <div className="w-10 h-1 bg-gray-300 rounded-full" />
    </div>
    {/* 內容 */}
  </div>
</div>
```

**設計決策**：
- 拖曳指示條：寬 40px（`w-10`）、高 4px（`h-1`）、圓角（`rounded-full`），桌面端隱藏
- `max-h-[90vh] overflow-y-auto` 確保長內容可捲動
- 桌面端用 `md:static md:mx-auto md:mt-[10vh]` 恢復居中佈局

### 4. ReviewForm 元件（底部滑出面板）

**檔案**：`src/components/form/ReviewForm.tsx`

**變更內容**：

```tsx
// 修改前
<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
  <div className="w-full max-w-lg mx-auto my-4 sm:my-8 bg-white rounded-xl shadow-xl">

// 修改後
<div className="fixed inset-0 z-50 bg-black/50">
  <div className="fixed bottom-0 left-0 right-0 h-[100dvh] bg-white rounded-t-2xl overflow-y-auto
                  md:static md:max-w-[512px] md:mx-auto md:mt-8 md:h-auto md:max-h-[90vh] md:rounded-2xl">
    {/* 拖曳指示條 */}
    <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10 md:hidden">
      <div className="w-10 h-1 bg-gray-300 rounded-full" />
    </div>
```

**設計決策**：
- 行動端：全螢幕高度 `h-[100dvh]`（使用 dvh 適應瀏覽器工具列）
- `overflow-y-auto` 讓表單內容可捲動
- `rounded-t-2xl` 頂部圓角
- 拖曳指示條使用 `sticky top-0` 固定在面板頂部
- 背景捲動鎖定（已實作，保持不變）
- 桌面端：`md:static md:max-w-[512px] md:mx-auto md:rounded-2xl` 回到置中覆蓋層

### 5. RouletteWheel 元件

**檔案**：`src/components/roulette/RouletteWheel.tsx`

**變更內容**：

```tsx
// 修改前（按鈕）
<button className="px-6 py-3 rounded-lg font-bold text-white ...">

// 修改後（按鈕加上 w-full）
<button className="w-full px-6 py-3 rounded-lg font-bold text-white ...">
```

容器的 `max-width` 限制：

```tsx
// 修改前
<div ref={containerRef} className="w-full" style={{ minWidth: `${MIN_DIAMETER}px`, minHeight: `${MIN_DIAMETER}px` }}>

// 修改後
<div ref={containerRef} className="w-full max-w-[calc(100vw-32px)]" style={{ minWidth: `${MIN_DIAMETER}px`, minHeight: `${MIN_DIAMETER}px` }}>
```

**設計決策**：
- `max-w-[calc(100vw-32px)]` 確保轉盤不超出視窗（扣除 16px×2 內距）
- `min-width: 280px` 已存在，維持最小直徑
- 按鈕加上 `w-full` 佔滿容器寬度
- `gap-4`（16px）已存在，維持轉盤與按鈕間距

### 6. FilterPanel 元件

**檔案**：`src/components/roulette/FilterPanel.tsx`

**變更內容**：

```tsx
// 狀態/預算篩選按鈕 - 增加最小高度
// 修改前
className="px-3 py-1.5 text-sm rounded-md border ..."

// 修改後
className="px-3 py-2.5 text-sm rounded-md border min-h-[44px] ..."

// 標籤按鈕 - 增加最小高度
// 修改前
className="px-2.5 py-0.5 rounded-full text-xs font-medium ..."

// 修改後
className="px-2.5 py-1.5 rounded-full text-xs font-medium min-h-[36px] ..."
```

**設計決策**：
- 篩選按鈕（狀態、預算）加上 `min-h-[44px]` 滿足觸控目標要求
- 標籤按鈕加上 `min-h-[36px]` 提供足夠的點擊區域
- `space-y-4`（16px）容器已存在，維持區塊間距

---

## 不變更的元件

| 元件 | 理由 |
|------|------|
| NavigationBar | 已符合行動端底部導覽列設計 |
| StarRating | 已有 44px 觸控目標 |
| ConfirmDialog | 遵循平台原生對話框模式 |
| TagBadge / TagList | 純展示元件，不需調整 |
| AppContext / appReducer | 無 UI 變更需求 |
| dataService | 純資料層 |

---

## 共用模式：Bottom Sheet

兩個元件（ResultModal、ReviewForm）共用相同的 bottom sheet 模式：

```
┌─────────────────────────────────────┐
│          背景遮罩 (bg-black/50)       │
│  ┌───────────────────────────────┐  │
│  │      ─── (拖曳指示條)          │  │
│  │                               │  │
│  │         面板內容               │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│         固定於螢幕底部              │
└─────────────────────────────────────┘
```

**共通特徵**：
- 拖曳指示條：`w-10 h-1 bg-gray-300 rounded-full`，桌面端 `md:hidden`
- 面板：`fixed bottom-0 left-0 right-0 rounded-t-2xl`
- 遮罩點擊關閉
- 背景捲動鎖定

---

## 錯誤處理

本次重構為純樣式變更，不引入新的錯誤狀態。既有的表單驗證、空狀態處理等行為保持不變。

---

## 正確性屬性

*屬性是指在系統所有合法執行中都應成立的特徵或行為——本質上是對系統應做什麼的形式化陳述。屬性連接了人類可讀的規格與機器可驗證的正確性保證。*

### Property 1：篩選按鈕觸控目標

*For any* FilterPanel 中渲染的狀態篩選按鈕或預算篩選按鈕，該按鈕的最小高度 SHALL 為 44px（具有 `min-h-[44px]` 類別）。

**Validates: Requirements 6.1**

### Property 2：標籤按鈕觸控目標

*For any* FilterPanel 中渲染的標籤按鈕，該按鈕的最小高度 SHALL 為 36px（具有 `min-h-[36px]` 類別）。

**Validates: Requirements 6.3**

### Property 3：無禁用響應式斷點

*For any* 本次修改涉及的元件，其渲染輸出中 SHALL NOT 包含 `sm:`、`lg:`、`xl:` 等響應式前綴類別，僅允許 `md:` 前綴。

**Validates: Requirements 8.2, 8.3**

### Property 4：轉盤直徑邊界

*For any* 容器寬度值 W，RouletteWheel 畫布的實際渲染尺寸 SHALL 滿足：`max(280, min(W, viewportWidth - 32))`，即最小 280px 且最大不超過視窗寬度減 32px。

**Validates: Requirements 5.1, 5.2**

### Property 5：背景捲動鎖定

*For any* ReviewForm 或 ResultModal 元件掛載時，`document.body.style.overflow` SHALL 被設定為 `'hidden'`；卸載後 SHALL 恢復原始值。

**Validates: Requirements 4.5**

### Property 6：互動元素最小觸控尺寸

*For any* 本應用中的可互動按鈕元素，其最小觸控目標尺寸 SHALL 為 44px × 44px（透過 `min-w-[44px] min-h-[44px]` 或等效尺寸保證）。

**Validates: Requirements 7.2**
