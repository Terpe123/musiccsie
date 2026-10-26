# 小小指揮家 Maestro Lite - GitHub Pages 部署指南

您的專案已完成 Vite 相對路徑設定（`base: './'`），可完美於 `https://terpe123.github.io/musiccsie/` 順暢運行！

---

## 為什麼之前會一直載入（Spinning）？
GitHub Pages 是一個純靜態空間，**無法在伺服器端直接編譯 TypeScript（`.tsx`）檔案**。
先前的儲存庫直接上傳了未編譯的 `src/main.tsx`，導致瀏覽器找不到 JavaScript 產物而卡在載入畫面。

只要將編譯完成的 **`dist/`** 內容放到 GitHub Pages，即可秒開！

---

## 推薦部署方式（二選一）

### 方式一：直接上傳 `dist` 內的編譯成果（最快 1 分鐘搞定）

1. 本專案執行 `npm run build` 後，會產生 **`dist/`** 資料夾：
   ```
   dist/
   ├── index.html
   └── assets/
       ├── index-CP_xQyQL.css
       └── index-C1SowKG1.js
   ```
2. 開啟您的 GitHub 儲存庫 `https://github.com/terpe123/musiccsie`。
3. 將 `dist/` 資料夾內的所有檔案（**`index.html`** 與 **`assets` 資料夾**）直接推送到儲存庫的根目錄，或者將 GitHub Pages 設定（Settings -> Pages）的來源目錄指定為該資料夾。
4. 重新整理 `https://terpe123.github.io/musiccsie/`，即可立刻看到精美的交響樂指揮介面！

---

### 方式二：使用 GitHub Actions 自動編譯發布（全自動）

本專案已為您新增 `.github/workflows/deploy.yml` 自動發布腳本：

1. 將本專案的所有檔案（包含源碼與 `.github/`）推送到 GitHub `main` 分支。
2. 進入儲存庫的 **Settings** -> **Pages**。
3. 在 **Build and deployment** -> **Source** 選擇 **GitHub Actions**。
4. 每當您有新的程式碼推送，GitHub 會自動執行 `npm run build` 並將產物部署至 `https://terpe123.github.io/musiccsie/`！
