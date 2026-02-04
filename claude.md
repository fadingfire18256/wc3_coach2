# Claude Code 開發指引 — wc3_coach2

## 專案概述
Warcraft 3 信長角色攻略網站，以 **GitHub Pages** 托管的純靜態網站。
網站網址：https://fadingfire18256.github.io/wc3_coach2/

---

## 技術棧
- **前端**：纏 HTML / CSS / Vanilla JS（無任何框架或建構工具）
- **Markdown 解析**：marked.js（CDN）
- **內容來源**：GitHub REST API 動態讀取 `guides/` 裡的 `.md` 檔案
- **托管平台**：GitHub Pages
- **暗黑模式**：原生 CSS `prefers-color-scheme` 實現

---

## 資料夾結構
```
project-root/
├── index.html          # 主頁（角色攻略總覽 + 搜尋欄位 + 新增攻略按鈕）
├── guide.html          # 單一角色攻略詳細頁
├── script.js           # 主頁邏輯（動態載入角色、搜尋過濾）
├── guide.js            # 攻略詳細頁邏輯（讀取並渲染 Markdown）
├── styles.css          # 全站樣式
├── sitemap.xml         # SEO Sitemap
├── robots.txt          # SEO robots 指令
├── .nojekyll           # 禰用 Jekyll（GitHub Pages 必要配置）
├── .gitignore          # Git 排除規則
├── googlec8f6d9191202e703.html  # Google Search Console 驗證
├── claude.md           # 本文件（Claude Code 開發指引）
├── README.md           # 專案說明
└── guides/             # 角色攻略 Markdown 檔案
    ├── 松姬.md
    ├── 井伊直政.md
    ├── 山縣昌景.md
    ├── 明智光秀.md
    ├── 本多忠勝.md
    ├── 柳生宗嚴.md
    ├── 柿崎景家.md
    ├── 真田幸村.md
    ├── 秋山信友.md
    ├── 酒井忠次.md
    ├── 齋藤道三.md
    ├── 佐佐木小次郎.md
    └── 石川五右衛門.md
```

---

## 關鍵 API 端點
- **取得攻略檔案清單**：
  `https://api.github.com/repos/fadingfire18256/wc3_coach2/contents/guides`
- **取得單一攻略內容**：
  `https://raw.githubusercontent.com/fadingfire18256/wc3_coach2/main/guides/{檔名}.md`

---

## 新增攻略功能
- 主頁右上角有「+ 新增攻略」按鈕
- 點擊後跳轉到 GitHub 網頁上的 `guides/` 資料夾，從那裡點 New file 新增攻略
- 跳轉 URL：`https://github.com/{owner}/{repo}/tree/{branch}/guides`
- **權限控制完全交給 GitHub**：只有 repo 擁有者才能寫入，其他人會被 GitHub 擋住
- 不需後端、不需 token、不需任何額外服務

---

## 開發規則
1. **不要添加任何框架或建構工具**，保持純靜態。
2. **新增角色攻略**：點「+ 新增攻略」按鈕，或直接在 `guides/` 裡放入新的 `.md` 檔案，網站會自動偵測並顯示。
3. **攻略內文中第一個以 `http` 開頭的連結**會自動被解析為影片按鈕（YouTube 等）。
4. **內容清單由 GitHub API 動態讀取**，不需手動維護任何索引。
5. **修改樣式**請集中在 `styles.css`，使用已定義的 CSS 變數。
6. **錯誤處理**使用 `Promise.allSettled`，避免單個檔案失敗導致整頁崩潰。

---

## 角色攻略 Markdown 格式範例
```markdown
# 角色名稱

## 影片參考
- [影片標題](https://www.youtube.com/watch?v=xxxxx)

## 角色定位
...

## 適合走線
...

## 強勢期
...

## 出裝建議
...

## 技能說明
...
```

---

## 注意事項
- `明智光秀.md` 目前為空檔案，待填充內容。
- `真田幸村.md` 內容很少，可能需要補充。
- GitHub API 有請求頻率限制（未驗證時為每小時 60 次），開發時注意不要反覆 reload。
