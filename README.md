# UJ Cafeteria Stock Manager

Inventory, orders and stock history for a university cafeteria, with a barcode scanner and an AI assistant.
React + Vite on the front end, Express on the server. Built in [Google AI Studio](https://ai.studio/apps/9db032ef-94e0-4427-82e5-ebf18215c7b2).
Suggested GitHub name: `uj-cafeteria-stock-manager`.

## Where this project is now (27 Nov 2026)

**Status: working prototype. Not ready for real use yet.**

| | |
|---|---|
| **Works** | Installs, type-checks and builds cleanly. Screens: dashboard (charts), inventory list, add / edit items, adjust stock, barcode scanner, orders, stock history, notifications, settings (currency), and an AI "copilot" |
| **Not ready** | **Sign-in is a demo.** The passcodes are in the browser code and a blank passcode also works, so anyone can sign in as Admin. **Data lives in each browser's local storage**, so it is not shared between devices and is lost if the browser data is cleared |
| **Not verified** | The AI features (they need `GEMINI_API_KEY`, which was not available when this was checked) and the scanner on a real phone |

**Next, in order:** real accounts and a database (MasterAPI could provide both), then share stock between devices, then remove the demo passcodes.

## Run locally

**Prerequisite:** Node.js 18 or newer.

```bash
npm install
echo "GEMINI_API_KEY=your_key" > .env.local   # only needed for the AI features
npm run dev                                   # http://localhost:3000
```

Other scripts: `npm run lint` (type check), `npm run build`, `npm start` (runs the built server).

## Layout

```
src/components/   screens (Dashboard, InventoryList, Scanner, Orders, StockHistory, CopilotView, …)
src/inventoryEngine.ts   stock logic and browser storage
server.ts         Express server; the Gemini key stays here (/api/gemini/*)
```
