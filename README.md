# SwingDesk — Indian Swing Trader Terminal

A professional trade calculator toolkit built with **Vue 3 + Vite**, featuring:
- 🔄 **Vue Router** — clean URL routing between tools
- 🗄️ **Pinia** (with `pinia-plugin-persistedstate`) — global capital/risk settings auto-saved to localStorage
- 📦 **@vueuse/core** composables throughout
- 📊 **vue-echarts** — reactive, interactive charts that update live as you type
- 🌙 Premium dark fintech UI

## Tools Included

| Route | Tool |
|-------|------|
| `/position` | Position Sizer |
| `/rr` | Risk / Reward Calculator |
| `/leverage` | Leverage Calculator |
| `/brokerage` | Brokerage Calculator (Indian market: STT, GST, stamp duty) |
| `/simulator` | Trade Simulator (per-trade log, equity curve, distribution chart) |
| `/strategy` | Strategy Builder (expectancy matrix, checklist, rules) |
| `/stoploss` | Stop Loss Calculator (%, ATR, support-based + trailing) |

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/swingdesk/`

## Deploy to GitHub Pages

### One-time setup

1. In `vite.config.js`, change the `base` to match your repo name:
   ```js
   base: '/your-repo-name/'
   ```

2. Push to GitHub on `main` branch

3. Go to **Settings → Pages → Source** → select **GitHub Actions**

4. Push any commit — the workflow in `.github/workflows/deploy.yml` will auto-build and deploy.

Your app will be live at: `https://yourusername.github.io/your-repo-name/`

## Build for production

```bash
npm run build
# output is in /dist
```

## ⚠️ Disclaimer

For educational purposes only. Not SEBI investment advice.
