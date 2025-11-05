Real-Time Order Book & Trade Visualizer

A **Next.js + TypeScript** application that visualizes **live crypto market data** from Binance’s WebSocket API.  
It provides three interactive dashboards:
- **Order Book** — live bid/ask depth view  
- **Recent Trades** — real-time trade pulse and activity gauge  
- **Combined View** — both order book and trades side by side  

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/shrejarachaprolu/Frontend-Project.git
cd orderbook
```

### 2. Install Dependencies
Use npm :
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build and Start for Production
```bash
npm run build
npm start
```

---

##  Project Structure

```
app/
 ├── page.tsx               # Home screen with navigation options
 ├── OrderBook/page.tsx     # Live order book component
 ├── RecentTrades/page.tsx  # Live trades visualizer
 ├── Both/page.tsx          # Combined dashboard
hooks/
 ├── useOrderBook.ts   # WebSocket hook for order book data
 └── useTrades.ts      # WebSocket hook for trades data
```

---

##  Design Choices & Trade-offs

###  UI / Styling
- **Tailwind CSS** for fast, expressive, and consistent styling.
- **Gradient backgrounds** and **glassmorphism effects** for a sleek, modern trading dashboard look.
- **Animated elements** (hover, pulse, and sync indicators) for responsive and intuitive user feedback.

###  State Management
- Used **React hooks** (`useState`, `useEffect`, `useMemo`, `useCallback`,`useRef`) for component-level state.


###  Performance
- **Memoized subcomponents** (`React.memo`) like `OrderRow` to reduce re-renders under high-frequency WebSocket updates.
- **Cumulative depth calculations** and **memoized totals** to ensure smooth visualization even with rapid data flow.

###  Data Correctness
- Periodically verifies WebSocket data against Binance’s REST API to ensure the UI remains **in sync**.
- Displays a clear **“In Sync / Out of Sync”** status indicator on each data panel.

---

##  Features

 Real-time updates via Binance WebSocket  
 Live visualization of market depth (bids/asks)  
 Animated trade pulses and buy/sell ratio gauge  
 Adjustable order book depth selector  
 Combined dashboard for comprehensive view  
 Visual correctness & synchronization indicators  
 Modern responsive UI with Tailwind and gradients  

---

##  Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Binance WebSocket API**



##  Design Rationale Example

> “I chose to use **React hooks and memoization** instead of Zustand because the project only needs **local state per component**. Zustand would add unnecessary complexity for this scope. Hooks allow efficient and isolated updates while keeping the logic transparent.”

---

##  Deployment (Vercel)

Deploy instantly on **Vercel**:
```bash
npm run build
```
