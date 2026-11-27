# UJ Cafeteria Stock Manager

Inventory, orders and stock history for a university cafeteria, with a barcode scanner and an AI assistant.
React + Vite on the front end, Express on the server. Built in [Google AI Studio](https://ai.studio/apps/9db032ef-94e0-4427-82e5-ebf18215c7b2).
Suggested GitHub name: `uj-cafeteria-stock-manager`.

## Where this project is now (27 Nov 2026)

**Status: working prototype with real sign-in and shared stock. Closer to usable, not finished.** Suggested GitHub name: `uj-cafeteria-stock-manager`.

| | |
|---|---|
| **Works and tested** | Installs, type-checks and builds. **Sign-in is checked by the server** with two passcodes you set (`OWNER_PASSCODE`, `ADMIN_PASSCODE`); the passcodes and hints are no longer in the page, five wrong tries lock an address out for 15 minutes, and in production nothing opens until they are set. **Stock is shared** through MasterAPI: a product added on the admin desktop appears on the owner's phone, a stock change on the phone shows on the desktop, a brand-new device takes the shared stock and never overwrites it, and the phone keeps working while MasterAPI is down and catches up afterwards. The **AI** (magic add and the copilot) now runs through MasterAPI, then Gemini if you set a key, then the built-in rules. Tested with three simulated devices and stand-ins for the AI |
| **Limits** | Two shared passcodes, not individual accounts. The saved stock is one shared document and the **latest change wins**, so two people changing stock at the same second can overwrite each other. Without MasterAPI, each browser keeps its own data, as before |
| **Not verified** | The real Hugging Face and Gemini models, the barcode scanner on a real phone, MasterAPI on Render |
| **Found while working** | The product edit and delete code in `App.tsx` was never reachable from the screens (and wrote to storage in a way the next log entry overwrote). It now goes through the engine, ready for when screens use it. The "import items" helper still only changes the screen, not the saved stock |

**Next, in order:** individual accounts (MasterAPI can provide them), screens for editing and deleting products, and per-product saving so simultaneous changes merge instead of overwriting.

## Run locally

**Prerequisite:** Node.js 18 or newer.

```bash
npm install
cp .env.example .env     # then fill in what you need (see below)
npm run dev              # http://localhost:3000
```

With nothing set, development uses the demo passcodes **owner123** (Owner) and **admin123** (Admin).

### Settings

| Variable | What it does |
| --- | --- |
| `OWNER_PASSCODE`, `ADMIN_PASSCODE` | The sign-in passcodes. **Required in production.** |
| `SESSION_SECRET` | Signs sessions; set a long random value |
| `MASTERAPI_URL`, `MASTERAPI_KEY` | Shared stock and AI through MasterAPI (optional) |
| `GEMINI_API_KEY` | Fallback AI if MasterAPI cannot answer (optional) |

Other scripts: `npm run lint` (type check), `npm run build`, `npm start` (runs the built server).

## Layout

```
src/components/   screens (Dashboard, InventoryList, Scanner, Orders, StockHistory, CopilotView, …)
src/inventoryEngine.ts   stock logic and browser storage
server.ts         Express server: sign-in (/api/login), shared stock (/api/state) and AI (/api/gemini/*). The keys stay here
src/lib/cloudSync.ts   keeps the stock the same on every device
```
