你是一個前端開發助理，請幫我建立一個「GitHub Pages + GitHub API」的靜態攻略網站。  
網站必須自動偵測 /guides 資料夾內的 Markdown 攻略檔，  
並且自動從攻略內文中擷取第一個以 "http" 開頭的連結作為 YouTube 連結按鈕。

---

【專案目標】
我要建立一個「角色攻略網站」，要求如下：
1. 使用 GitHub Pages 作為主頁入口。
2. 主頁顯示各角色名稱，名稱來自 GitHub Repo 內 /guides 資料夾的檔案名稱。
3. 每個角色名稱可點擊進入該角色攻略頁。
4. 每個角色旁邊有一個 YouTube 連結按鈕，該連結需由攻略內容內自動解析。
   - 程式需讀取該 Markdown 內容，尋找第一個以 "http" 開頭的連結字串。
   - 若找到，將該連結顯示為影片按鈕（🎬）。
   - 若未找到，則不顯示該按鈕。
5. 主頁要有搜尋欄位，可即時過濾角色名稱。
6. 不使用任何前端框架或建構工具（例如 React、Vue、Vite），純 HTML + CSS + Vanilla JS。
7. 所有資料皆由 GitHub API 自動讀取（不需手動維護 JSON）。

---

【技術細節】
- 使用 GitHub API：
  - `https://api.github.com/repos/<你的帳號>/<repo名稱>/contents/guides`
    取得資料夾中的檔案清單。
  - 對於每個 .md 檔案，額外 fetch：
    `https://raw.githubusercontent.com/<帳號>/<repo>/main/guides/<檔名>`
    取得 Markdown 原文。
- 用 `marked.js`（CDN）將 Markdown 轉 HTML 顯示。
- 所有 HTML、CSS、JS 檔案都可直接部署於 GitHub Pages。

---

【檔案結構】
project-root/
├─ index.html         # 主頁（角色清單 + 搜尋欄位）
├─ guide.html         # 單一角色攻略頁
├─ script.js          # 主頁邏輯
├─ guide.js           # 攻略頁邏輯
├─ styles.css         # 全站樣式
└─ guides/            # 放 Markdown 攻略檔案

---

【index.html】
- 標題：<h1>角色攻略總覽</h1>
- 搜尋框：<input id="search" placeholder="搜尋角色名稱...">
- 清單容器：<div id="character-list"></div>
- 載入 script.js、styles.css。
- 載入 marked.js CDN：
  ```html
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
