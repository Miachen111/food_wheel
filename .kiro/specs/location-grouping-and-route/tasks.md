# Implementation Plan: 地區分組與路線排序

## Overview

為美食輪盤應用新增地區分組（依行政區）與路線排序（最近鄰演算法 + Google Maps URL）功能。擴充 Places API 資料擷取，新增 route 工具函式與路線規劃頁面。

## Tasks

- [x] 1. 擴充資料模型與 Places API
  - [x] 1.1 擴充 Restaurant 與 PlaceDetails 型別
    - 在 `src/types/index.ts` 中為 `Restaurant` 新增 `latitude: number | null`、`longitude: number | null`、`district: string | null`
    - 在 `src/utils/placesApi.ts` 中為 `PlaceDetails` 新增 `latitude: number | null`、`longitude: number | null`、`district: string | null`
    - 擴充 `GroupMode` 為 `'status' | 'budget' | 'tag' | 'district'`
    - 擴充 `currentPage` 型別加入 `'route'`
    - 在 `AppAction` 加入 `NAVIGATE` payload 支援 `'route'`
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 修改 getPlaceDetails 擷取 location 與 addressComponents
    - 擴充 FieldMask 加入 `location,addressComponents`
    - 新增 `AddressComponent` 介面
    - 實作 `extractDistrict(addressComponents)` 函式：優先取 `sublocality_level_1`，備選 `administrative_area_level_3`
    - 修改 `getPlaceDetails` 回傳值包含 `latitude`、`longitude`、`district`
    - _Requirements: 1.1, 1.2_

  - [x] 1.3 修改 LOAD_DATA reducer 正規化舊資料
    - 在 `appReducer.ts` 的 `LOAD_DATA` case 中，為缺少 `latitude`/`longitude`/`district` 的餐廳補上 `null`
    - _Requirements: 資料遷移_

- [x] 2. 實作地區分組功能
  - [x] 2.1 新增 groupByDistrict 函式
    - 在 `src/utils/groupUtils.ts` 新增 `groupByDistrict(restaurants: Restaurant[]): RestaurantGroup[]`
    - `district` 為 null 的餐廳歸入 `{ key: 'unknown', label: '未知地區' }`
    - 分組按 district 名稱排序，未知地區放最後
    - 在 `groupRestaurants` switch 中加入 `case 'district'`
    - _Requirements: 2.1, 1.3_

  - [ ]* 2.2 Property test：地區分組
    - **Property 1: 地區分組保留所有餐廳**
    - **Property 2: 地區分組內容一致性**
    - **Validates: Requirements 2.1, 2.2, 1.3**

  - [x] 2.3 在 RestaurantListPage 加入「依地區分組」選項
    - 在 `<select>` dropdown 中加入 `<option value="district">依地區分組</option>`
    - _Requirements: 2.1_

- [x] 3. Checkpoint - 地區分組功能驗證
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. 實作路線工具函式
  - [x] 4.1 建立 routeUtils.ts
    - 新增 `src/utils/routeUtils.ts`
    - 實作 `haversine(lat1, lng1, lat2, lng2): number`（回傳公尺）
    - 定義 `Waypoint` 介面
    - 實作 `nearestNeighborSort(waypoints, startLat, startLng): Waypoint[]`
    - 實作 `buildGoogleMapsUrl(sortedWaypoints, startLat?, startLng?): string`
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 4.2 Property test：Haversine 距離
    - **Property 3: Haversine 距離對稱性與非負性**
    - **Validates: Requirements 3.2**

  - [ ]* 4.3 Property test：最近鄰演算法
    - **Property 4: 最近鄰演算法保留所有點**
    - **Property 5: 最近鄰演算法貪心選擇正確性**
    - **Validates: Requirements 3.1, 3.5**

  - [ ]* 4.4 Property test：Google Maps URL
    - **Property 6: Google Maps URL 包含所有 waypoint 且順序正確**
    - **Validates: Requirements 3.3**

- [x] 5. Checkpoint - 路線工具函式驗證
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. 實作路線規劃頁面
  - [x] 6.1 建立 RoutePage 元件
    - 新增 `src/components/route/RoutePage.tsx`
    - 從 context 讀取 `selectedRestaurantIds` 並過濾出有有效座標的餐廳
    - 若有效餐廳少於 2 間顯示提示訊息
    - 使用 `useGeolocation` 取得使用者位置
    - 提供起點選擇（目前位置 / 第一間餐廳）
    - 執行 `nearestNeighborSort` 顯示排序結果（編號列表 + 各站間距離）
    - 「在 Google Maps 開啟」按鈕開啟新分頁
    - _Requirements: 3.1, 3.4, 3.5_

  - [x] 6.2 整合路線頁面到導航與路由
    - 在 `NavigationBar.tsx` 新增「路線規劃」導航項目
    - 在 `App.tsx` 或 `Layout.tsx` 加入 `currentPage === 'route'` 時顯示 `RoutePage`
    - _Requirements: 3.4_

- [ ] 7. 實作行政區萃取 property test
  - [ ]* 7.1 Property test：行政區萃取邏輯
    - **Property 7: 行政區萃取邏輯正確性**
    - **Validates: Requirements 1.2**

- [x] 8. Final checkpoint - 全功能整合驗證
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 既有 localStorage 餐廳資料在載入時自動正規化（缺少欄位補 null）
- 路線計算為純前端 Haversine + 最近鄰演算法，無需額外 Google API
- Property tests 使用 fast-check（專案已安裝）
- 所有新增 UI 元件遵循既有 Tailwind CSS 風格

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "4.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "4.2", "4.3", "4.4", "7.1"] },
    { "id": 4, "tasks": ["6.1"] },
    { "id": 5, "tasks": ["6.2"] }
  ]
}
```
