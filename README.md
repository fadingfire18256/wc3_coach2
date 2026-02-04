# wc3_coach2
# Warcraft 3 信長攻略站（WC3 Coach 2）

 **網站連結**  
 [https://fadingfire18256.github.io/wc3_coach2/](https://fadingfire18256.github.io/wc3_coach2/)

---

#  信長角色攻略網站 (wc3_coach2)
一個以 **GitHub Pages + 原生 JavaScript** 建構的靜態攻略網站，能自動載入 Markdown 角色攻略與影片連結。

---

##  專案架構

<img width="1717" height="962" alt="image" src="https://github.com/user-attachments/assets/00f84b86-2f4c-4bff-8315-29ffa26eb411" />

- 完整收錄英雄攻略（例：松姬、上杉謙信、武田信玄等）  
- 適合初學者的入門教學  
- 支援手機瀏覽  

---

##  開發說明

- 靜態生成：純 HTML / CSS / JS  
- 網頁托管：GitHub Pages
- 無需伺服器即可動態載入 Markdown  
- 搜尋引擎優化（SEO）：
  - 已配置 sitemap.xml  
  - 已設定 `<meta>` 描述與關鍵字  
  - 提交至 Google Search Console  

---

##  技術重點

| 功能 | 技術說明 |
|------|-----------|
| 內容動態載入 | 使用 GitHub REST API 讀取 `guides/` 中的 `.md` 檔案 |
| Markdown 解析 | 透過 `marked.js` 將 Markdown 轉為 HTML |
| 搜尋功能 | 原生 JS 篩選角色名稱 (支援模糊比對) |
| 新增攻略 | 點按鈕直接跳轉到 GitHub 新增文件頁面，權限由 GitHub 控制 |
| 響應式設計 | CSS Grid + 變數控制 + Dark Mode |
| 安全設計 | `Promise.allSettled` 容錯，避免整頁崩潰 |
| 自動偵測 Repo | `resolveOwner` / `resolveRepo` 自動解析 GitHub Pages 網域 |

---

##  使用方式
輸入
👉 [https://fadingfire18256.github.io/wc3_coach2/](https://fadingfire18256.github.io/wc3_coach2/)

---

##  依賴套件

- [marked.js](https://github.com/markedjs/marked)
- [GitHub REST API](https://docs.github.com/en/rest)
- 原生 HTML / CSS / JS

---

##  聯絡
若有錯誤或建議，歡迎在 GitHub Issues 中留言！  
