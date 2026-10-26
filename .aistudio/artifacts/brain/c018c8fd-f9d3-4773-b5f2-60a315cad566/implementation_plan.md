# 小小指揮家 Maestro Lite - GitHub Pages 部署相容性與打包構建計畫

解決使用者在 GitHub Pages（`https://terpe123.github.io/musiccsie/`）部署後畫面永久停留於「樂團準備中，即將登場…」載入動畫之問題，同時保持 AI Studio 開發環境與 GitHub Pages 雙平台相容運作。

## 使用者確認事項 (Confirmed Decisions)

> [!IMPORTANT]
> 根據 Phase 1 問答確認：
> - **部署形式**：採用 **Vite 正式編譯產物搭配相對路徑（Relative Subpath Assets, `base: './'`）**，解決 GitHub Pages 次級目錄無法解析根目錄 `/` 資源的問題。
> - **雙平台支援**：同時支援 **AI Studio 即時預覽** 與 **GitHub Pages 線上託管**。

---

## 1. 現狀診斷與根本原因分析 (Root Cause Analysis)

目前 `https://terpe123.github.io/musiccsie/` 陷入無限載入的原因包含兩項關鍵：

1. **未編譯的原生 TypeScript 引用**：
   GitHub Pages 儲存庫目前直接託管了未經編譯的 `index.html`，內部標籤為 `<script type="module" src="/src/main.tsx"></script>`。瀏覽器原生無法解析 `.tsx` 語法，亦無內建 Vite 轉換伺服器。
2. **絕對根目錄路徑引發 404**：
   專案網址位於 GitHub Pages 的儲存庫子目錄 `/musiccsie/`，若以絕對路徑 `/src/main.tsx` 或 `/assets/...` 發送請求，瀏覽器會直接向網域根目錄 `https://terpe123.github.io/src/main.tsx` 發出請求，導致 HTTP 404 Not Found。

---

## 2. 系統架構與建置流程 (Architecture & Build Pipeline)

```
┌────────────────────────────────────────────────────────┐
│                   AI Studio 原始程式庫                  │
│       src/App.tsx, src/game/soundService.ts 等          │
└───────────────────────────┬────────────────────────────┘
                            │
               npm run build (Vite with base: './')
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               編譯產物目錄 (/dist)                      │
│  ├── index.html         (引用相對路徑 ./assets/...)     │
│  └── assets/                                           │
│      ├── index-*.js     (完整封裝之原生 JavaScript)     │
│      └── index-*.css    (Tailwind 樣式與音樂廳特效)     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│         GitHub Pages 目標 (terpe123.github.io/musiccsie/) │
│  將 dist/ 內之檔案推送到 gh-pages 分支或 main 根目錄   │
│  即刻秒開，支援手機與電腦瀏覽器，無須等待伺服器編譯    │
└────────────────────────────────────────────────────────┘
```

---

## 3. 關鍵修改項目 (Implementation Tasks)

### A. 配置 Vite 相對路徑 (`vite.config.ts`)
- 將 `vite.config.ts` 中的 `base` 設為 `'./'`（或環境變數靈活適配）：
  ```ts
  base: './',
  ```
  確保所有生成的 CSS、JS 模組、圖片與字型皆使用相對路徑，不受 GitHub Pages 子路徑名稱（例如 `/musiccsie/`）影響。

### B. 優化部署專用建置指令 (`package.json`)
- 新增/確保 `npm run build` 生成獨立可靜態託管的 `dist` 目錄。
- 支援一鍵產生自包含產物，並生成說明檔案 `DEPLOY_GITHUB_PAGES.md`，提供清晰的 3 種上線方式（直接上傳 `dist`、gh-pages 分支、或 GitHub Actions 自動發布）。

### C. 雙平台相容性與容錯機制驗證
- 保留 `html`/`body` 內建原生深色主題與非同步字體載入，避免任何 CDN 慢速導致白屏。
- 保留 React `ErrorBoundary`，遇到異常即時顯示重置按鈕而非白屏。
- 確保 Web Audio API 在 GitHub Pages 的 https 環境下獲得正常使用者手勢授權（點擊螢幕/按鍵即恢復音訊上下文）。

---

## 4. 驗證步驟 (Verification Plan)

1. **靜態產物編譯驗證**：
   執行 `npm run build`，驗證 `dist/index.html` 中的資產引用皆為 `./assets/...` 相對路徑，無任何遺留之 `/src/` 或絕對根路徑。
2. **模擬 GitHub Pages 子路徑執行**：
   透過本機靜態伺服器在子路徑（如 `http://localhost:3000/musiccsie/`）模擬啟動並進行 Playwright 測試，確認歌曲載入、音樂合成與揮棒互動皆 100% 正常。
3. **單元測試全數通過**：
   維持 `npx --yes tsx --test src/game/musicEngine.test.ts` 綠燈通過。
