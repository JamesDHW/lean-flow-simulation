# Lean Production Simulator

Interactive web-based Lean production line simulator. Demonstrates small batches, pull vs push, WIP limits, bottlenecks, variability, and one-piece flow through seven step-by-step scenarios with P/L, metrics, and visualizations.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Home** and **Lean Production Simulator** in the nav to switch between the landing page and the simulation.

## Scripts

- **`pnpm dev`** – Start dev server (port 3000)
- **`pnpm build`** – Production build
- **`pnpm test`** – Run Vitest tests
- **`pnpm lint`** / **`pnpm format`** / **`pnpm check`** – Biome lint and format

## Stack

- React 19, TanStack Router, TanStack Start
- Tailwind CSS, Recharts
- Vitest, Biome
