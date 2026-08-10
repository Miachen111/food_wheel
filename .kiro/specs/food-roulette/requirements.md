# 需求文件

## 簡介

Food Roulette 是一款輕量級個人美食探索 Web 應用，結合美食評論紀錄與隨機轉盤功能，協助使用者解決「今天吃什麼」的選擇困難問題。本階段（Phase 1）聚焦純前端 UI 開發，使用假資料（Dummy Data）呈現完整操作體驗，技術選型為 React (Vite) + Tailwind CSS + Canvas/SVG 動畫轉盤。

## 詞彙表

- **App**: Food Roulette Web 應用程式
- **Restaurant_Card**: 餐廳資訊卡片元件，顯示餐廳摘要資訊
- **Review_Form**: 評論表單元件，供使用者輸入個人餐廳評價資料
- **Roulette_Wheel**: 隨機轉盤元件，以動畫方式旋轉並隨機選出餐廳
- **Filter_Panel**: 篩選面板元件，供使用者設定轉盤的餐廳篩選條件
- **Result_Modal**: 結果彈窗元件，顯示轉盤選中餐廳的詳細資訊
- **Restaurant**: 餐廳資料物件，包含名稱、狀態、標籤、評分等屬性
- **Status**: 餐廳造訪狀態，包括「想去清單 (WISH_LIST)」與「已造訪 (VISITED)」
- **Tag**: 餐廳分類標籤，如 #宵夜、#快餐、#平價 等
- **Dummy_Data**: 預設假資料，模擬真實餐廳與評論資料供 Phase 1 使用

## 需求

### 需求 1：餐廳清單瀏覽

**使用者故事：** 身為使用者，我想瀏覽已收藏的餐廳清單，以便快速查看個人美食紀錄。

#### 驗收標準

1. WHEN App 載入完成, THE App SHALL 從 Dummy_Data 讀取餐廳資料並以 Restaurant_Card 清單形式呈現，預設依新增時間由新到舊排序
2. THE Restaurant_Card SHALL 顯示餐廳名稱、Status（以文字標籤區分「想去」與「已造訪」）、個人評分（1-5 星，以 0.5 為級距）、平均消費金額（以整數呈現並加上貨幣符號）及 Tag 列表（最多顯示 5 個 Tag，超出部分以「+N」方式提示剩餘數量）
3. WHEN 使用者點擊 Restaurant_Card, THE App SHALL 展開顯示該餐廳的完整詳情（含推薦菜色與個人筆記）；WHEN 使用者再次點擊已展開的 Restaurant_Card, THE App SHALL 收合該詳情區塊
4. WHILE 餐廳清單為空, THE App SHALL 顯示空狀態引導訊息，提示使用者新增第一間餐廳
5. IF Restaurant_Card 的 Status 為 WISH_LIST, THEN THE Restaurant_Card SHALL 隱藏個人評分與平均消費金額欄位（因尚未造訪無此資料）

### 需求 2：新增餐廳與評論

**使用者故事：** 身為使用者，我想新增餐廳並撰寫個人評論，以便紀錄美食體驗。

#### 驗收標準

1. WHEN 使用者點擊新增按鈕, THE App SHALL 開啟 Review_Form
2. THE Review_Form SHALL 包含以下輸入欄位：餐廳名稱（必填，最多 100 字元）、造訪狀態（WISH_LIST 或 VISITED，預設為 VISITED）、個人評分（1.0-5.0，以 0.5 為級距）、平均每人消費金額（正整數，最大值 99999）、推薦菜色（可多筆輸入，每筆最多 50 字元，最多 10 筆）、個人筆記（最多 500 字元）
3. WHEN 使用者提交完整表單, THE App SHALL 將新餐廳加入本地清單並回到清單頁面
4. IF 使用者提交表單時必填欄位（餐廳名稱）為空或僅含空白字元, THEN THE Review_Form SHALL 於該欄位下方顯示驗證錯誤訊息且阻止提交
5. WHEN 使用者將 Status 設為 WISH_LIST, THE Review_Form SHALL 隱藏評分、消費金額與推薦菜色欄位（因尚未造訪）
6. WHEN 使用者點擊取消按鈕, THE Review_Form SHALL 捨棄所有未儲存輸入並返回清單頁面

### 需求 3：編輯與刪除餐廳

**使用者故事：** 身為使用者，我想編輯或刪除已存在的餐廳紀錄，以便維護資料的正確性。

#### 驗收標準

1. WHEN 使用者在餐廳詳情頁點擊編輯按鈕, THE App SHALL 開啟 Review_Form，並將該餐廳現有的所有欄位值（名稱、Status、評分、平均消費、推薦菜色、Tag、個人筆記）預填至對應輸入欄位
2. WHEN 使用者提交編輯後的表單, THE App SHALL 依照需求 2 相同的驗證規則檢查必填欄位，驗證通過後更新該餐廳的本地資料並導航回清單頁面，清單頁面即時反映更新後的內容
3. WHEN 使用者在編輯過程中將 Status 由 VISITED 變更為 WISH_LIST, THE Review_Form SHALL 隱藏評分、消費金額與推薦菜色欄位，並清除這些欄位的值
4. WHEN 使用者點擊刪除按鈕, THE App SHALL 顯示確認對話框，內容包含餐廳名稱及「確認刪除」與「取消」兩個操作按鈕
5. WHEN 使用者確認刪除, THE App SHALL 從本地清單中移除該餐廳並返回清單頁面（全域 Tag 列表保留不變）
6. IF 使用者取消刪除確認, THEN THE App SHALL 關閉確認對話框且保留原資料不變
7. IF 使用者在編輯表單中點擊取消或返回, THEN THE App SHALL 捨棄未儲存的變更並返回餐廳詳情頁

### 需求 4：餐廳標籤管理

**使用者故事：** 身為使用者，我想為餐廳新增或移除標籤，以便分類管理及後續篩選。

#### 驗收標準

1. THE Review_Form SHALL 提供 Tag 輸入區域，支援從既有全域 Tag 列表選擇或自訂新 Tag，每間餐廳最多可擁有 10 個 Tag
2. WHEN 使用者輸入新 Tag 名稱並確認, THE App SHALL 將該 Tag 加入全域 Tag 列表及當前餐廳的標籤，Tag 名稱長度限制為 1 至 20 個字元（去除前後空白後計算）
3. IF 使用者輸入的 Tag 名稱為空白或已存在於當前餐廳的標籤中, THEN THE Review_Form SHALL 阻止新增並顯示對應的驗證提示訊息
4. WHEN 使用者在 Tag 上點擊移除, THE App SHALL 從該餐廳移除對應 Tag（全域 Tag 列表保留）
5. WHEN 使用者輸入的 Tag 名稱與全域 Tag 列表中既有項目完全相同, THE App SHALL 重複使用既有 Tag 而非建立重複項目
6. THE Restaurant_Card SHALL 以標籤樣式（pill/badge）呈現該餐廳所有 Tag，若 Tag 數量超過 5 個則收合顯示並提供展開操作

### 需求 5：轉盤篩選功能

**使用者故事：** 身為使用者，我想設定篩選條件縮小轉盤候選範圍，以便獲得更符合需求的隨機推薦。

#### 驗收標準

1. THE Filter_Panel SHALL 提供以下篩選選項：造訪狀態（全部、僅想去清單、僅已造訪，預設為「全部」）、預算範圍（不限、$、$$、$$$，預設為「不限」）、Tag 多選篩選（可同時選取多個 Tag，預設為未選取任何 Tag，即不以 Tag 篩選）
2. THE Filter_Panel SHALL 以 AND 邏輯組合所有篩選條件，餐廳須同時符合造訪狀態、預算範圍及所選 Tag 中至少一個，方可列入候選
3. WHEN 使用者變更任一篩選條件, THE App SHALL 於畫面重新渲染時同步更新並顯示符合條件的候選餐廳數量（無需額外頁面載入）
4. IF 篩選結果為零間候選餐廳, THEN THE App SHALL 顯示提示訊息告知無符合條件的餐廳，並禁用轉盤啟動按鈕使其無法點擊
5. THE Filter_Panel SHALL 提供一鍵重置按鈕，WHEN 使用者點擊重置按鈕, THE Filter_Panel SHALL 將所有篩選選項還原為預設值（造訪狀態：全部、預算範圍：不限、Tag：未選取）
6. WHEN 轉盤頁面首次載入, THE Filter_Panel SHALL 以預設狀態呈現，候選範圍包含所有餐廳

### 需求 6：美食轉盤動畫與隨機選擇

**使用者故事：** 身為使用者，我想旋轉轉盤隨機選出一間餐廳，以便解決選擇困難。

#### 驗收標準

1. THE Roulette_Wheel SHALL 以 Canvas 或 SVG 繪製圓形轉盤，將候選餐廳名稱均勻分佈於各扇區，並於轉盤外緣固定位置顯示指針標記以指示最終選中的扇區
2. WHEN 使用者點擊旋轉按鈕, THE Roulette_Wheel SHALL 執行旋轉動畫（含加速、勻速、減速階段），總動畫時間介於 3 至 6 秒，且每個候選餐廳被選中的機率相等
3. WHILE 旋轉動畫執行中, THE App SHALL 禁用旋轉按鈕，防止使用者重複觸發旋轉
4. WHEN 旋轉動畫結束, THE App SHALL 於 500 毫秒內開啟 Result_Modal 顯示選中的餐廳資訊
5. THE Roulette_Wheel SHALL 支援至少 2 間且至多 20 間候選餐廳的顯示；當餐廳名稱超過 6 個字元時，SHALL 以截斷並加省略號方式呈現於扇區內
6. IF 候選餐廳僅有 1 間, THEN THE App SHALL 直接顯示該餐廳結果而跳過轉盤動畫

### 需求 7：轉盤結果展示

**使用者故事：** 身為使用者，我想查看轉盤選中餐廳的完整資訊，以便做出最終決定。

#### 驗收標準

1. THE Result_Modal SHALL 顯示選中餐廳的名稱、Status、個人評分（1.0-5.0）、平均消費金額、Tag 列表、推薦菜色及個人筆記
2. IF 選中餐廳的 Status 為 WISH_LIST, THEN THE Result_Modal SHALL 僅顯示名稱、Status、Tag 列表及個人筆記，並隱藏個人評分、平均消費與推薦菜色欄位
3. WHEN 使用者點擊 Result_Modal 的關閉按鈕, THE App SHALL 關閉彈窗並返回轉盤頁面，保留原有篩選條件
4. WHEN 使用者點擊 Result_Modal 的「再轉一次」按鈕, THE App SHALL 關閉彈窗並重新啟動 Roulette_Wheel 旋轉動畫
5. WHILE Result_Modal 開啟中, THE App SHALL 禁止背景頁面的滾動操作
6. WHEN 使用者在 Result_Modal 開啟時點擊彈窗外部區域或按下 Escape 鍵, THE App SHALL 關閉彈窗並返回轉盤頁面

### 需求 8：響應式佈局

**使用者故事：** 身為使用者，我想在手機與桌面裝置上都能流暢使用此應用，以便隨時隨地查詢美食紀錄。

#### 驗收標準

1. THE App SHALL 在視窗寬度 375px 至 1440px 的範圍內顯示所有 UI 元件，無水平溢出、無內容截斷，且所有可互動元素的觸控目標尺寸不小於 44×44px
2. WHILE 螢幕寬度小於 768px, THE App SHALL 以單欄佈局呈現餐廳清單，每張 Restaurant_Card 寬度佔滿容器可用寬度
3. WHILE 螢幕寬度大於或等於 768px, THE App SHALL 以 2 至 3 欄網格佈局呈現餐廳清單，欄數依容器寬度自動調整（768px-1023px 為 2 欄，1024px 以上為 3 欄）
4. THE Roulette_Wheel SHALL 根據容器寬度自適應調整尺寸，最小直徑不低於 280px，且旋轉按鈕的觸控目標不小於 44×44px
5. WHILE 螢幕寬度小於 768px, THE Result_Modal SHALL 以全螢幕方式呈現；WHILE 螢幕寬度大於或等於 768px, THE Result_Modal SHALL 以置中彈窗形式呈現，最大寬度不超過 560px

### 需求 9：頁面導航

**使用者故事：** 身為使用者，我想在餐廳清單與轉盤功能之間快速切換，以便流暢使用各項功能。

#### 驗收標準

1. THE App SHALL 提供底部導航列或頂部標籤列，包含「餐廳清單」與「美食轉盤」兩個主要導航項目，且導航列在所有頁面中持續可見（不受頁面捲動影響）
2. WHEN 使用者點擊導航項目, THE App SHALL 於 300 毫秒內切換至對應頁面，並以視覺差異（如高亮、底線或色彩變化）標示當前所在頁面的導航項目
3. WHEN 使用者從美食轉盤頁切換回餐廳清單頁, THE App SHALL 保留 Filter_Panel 的篩選條件設定與清單的捲動位置，直到使用者手動重置或重新整理頁面
4. WHILE Result_Modal 或 Review_Form 開啟中, THE App SHALL 隱藏或禁用導航列，防止使用者在操作未完成時切換頁面

### 需求 10：Dummy Data 初始化

**使用者故事：** 身為開發者，我想有一組預設假資料供 Phase 1 展示使用，以便在未接入後端前驗證完整 UI 流程。

#### 驗收標準

1. THE App SHALL 內建至少 8 筆 Dummy_Data 餐廳紀錄，其中須包含至少 2 筆 Status 為 WISH_LIST 的餐廳、至少 4 筆 Status 為 VISITED 的餐廳、涵蓋全部三種消費等級（$、$$、$$$）各至少 1 筆、且 VISITED 餐廳的評分須分佈於 1.0-5.0 範圍內至少包含低（1.0-2.5）、中（3.0-3.5）、高（4.0-5.0）各一筆
2. THE Dummy_Data SHALL 包含至少 6 種不同的 Tag（如 #宵夜、#快餐、#平價、#約會、#聚餐、#甜點），且每筆餐廳至少標註 1 個 Tag、至少 2 筆餐廳標註 3 個以上 Tag
3. WHEN App 首次載入且本地尚無使用者資料時, THE App SHALL 自動載入 Dummy_Data 作為初始資料
4. IF 本地已存在使用者修改過的資料, THEN THE App SHALL 保留現有資料而不以 Dummy_Data 覆蓋
5. THE Dummy_Data SHALL 以獨立模組存放，不與 UI 元件或商業邏輯混合於同一檔案中，使替換資料來源時無須修改 UI 元件程式碼
