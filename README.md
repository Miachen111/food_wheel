# Food Wheel — 美食輪盤

一款幫你解決「今天吃什麼」困難症的美食管理工具。記錄你去過和想去的餐廳，用輪盤隨機選一間，還能用 AI 分析熱量、聊天問路線推薦。

## 功能特色

### 美食清單管理
- 新增、編輯、刪除餐廳紀錄
- 區分「去過」與「想去」狀態
- 評分（0.5 級距，最高 5 星）、預算等級、推薦菜色、備註
- 支援多種分組模式：依狀態 / 預算 / 標籤 / 地區
- 關鍵字搜尋（名稱、備註、菜色、標籤）

### 探索附近餐廳
- 整合 Google Places API (New)，搜尋 Google Maps 上的餐廳
- 自動取得使用者位置做為搜尋偏好
- 顯示評分、評論數、營業狀態、價格等級、照片
- 一鍵加入想去清單

### 輪盤轉轉樂
- 勾選想加入轉盤的餐廳
- 動畫旋轉輪盤，隨機幫你決定今天吃什麼
- 支援再轉一次

### AI 熱量分析
- 拍照或文字描述食物
- 透過 Gemini AI 估算總熱量與營養素（蛋白質、碳水、脂肪）
- 提供飲食建議

### AI 美食聊天助手
- 多輪對話，問路線規劃、餐廳推薦、美食行程
- 支援快捷提問模板

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 建構工具 | Vite |
| 樣式 | Tailwind CSS |
| 狀態管理 | useReducer + Context API |
| 後端 / 資料庫 | Supabase (PostgreSQL) |
| AI 服務 | Google Gemini（透過 Supabase Edge Functions proxy） |
| 地圖服務 | Google Places API (New)（透過 Supabase Edge Functions proxy） |
| 測試 | Vitest + Testing Library |
| 部署 | GitHub Pages（gh-pages） |

## 專案結構

```
src/
├── components/
│   ├── calories/       # 熱量分析頁面
│   ├── chat/           # AI 聊天頁面
│   ├── form/           # 表單元件（新增/編輯餐廳）
│   ├── layout/         # Layout 與 NavigationBar
│   ├── restaurant/     # 餐廳清單、卡片、詳情、探索
│   ├── roulette/       # 輪盤頁面與元件
│   └── shared/         # 共用元件
├── context/            # AppContext + Reducer
├── hooks/              # 自訂 Hooks
├── services/           # Supabase client、Gemini API
├── types/              # TypeScript 型別定義
└── utils/              # 工具函式（篩選、分組、Places API）
supabase/
├── functions/          # Edge Functions（gemini-proxy、places-proxy）
└── migrations/         # 資料庫 migration SQL
```



