# Lean Shadock Visualisation  —  System Specification

## 1. Overview

Discrete-tick production-line simulation with configurable stations, push/pull flow, quality (defects, red bins, andon, jidoka), manager rework, and market-change events. Time is simulated in **ticks**; each tick advances work, moves material, and may trigger market change. P&amp;L is computed per tick (revenue, labor, inventory, material, defect cost); cumulative profit starts at `initialInvestment` and the run is **bust** when cumulative profit ≤ 0.

## 1.1. Glossary

- step: the simulation moves from "un-lean" towards more lean in several steps. Each step in the demonstration changes one aspect of the system to show building a lean system form first principles.
- station: there are 9 stations in the simulation. At each one, we simulate a "valuable transformation" against the item, which takes some processing time.
- item: the pieces moving through the 9 stations. Each starts as material input at station 1, and is output as a valuable item to be sold to the customer at the end.
- station intake: the backlog at the start of the station where one or more items from the previous station can sit waiting to be processed.
- station outtake: the "done" pile. Once an item has been processed, it sits at the station in the outtake ready for the process at the next station to be taken over.
- worker: each station has a single worker who is doing the processing at that station, taking some material input, doing the valuable transformation, which prepares it for the next station.
- defect: at any station, a worker may process the item incorrectly which leads to a quality defect; a quality of the product introduced that is undesirable to the customer.

---

## 2. Tick Order (per tick)


Each tick runs in this order:

1. **handleJidokaState**  —  If jidoka pause just ended, move all defects at that station to red bin and clear agent/quality pauses.
2. **applyMarketChangeIfDueOrTriggered**  —  If manual trigger, fixed interval, or random interval: mark 1–3 random stations’ in-flight items as defective (market change), then clear jidoka/agents.
3. **advanceWorkAndComplete**  —  For every station, reduce `inProcess` work by `tickMs`; items that finish either complete (go to batchBuffer), defect (andon/rework/red bin/rework-send-back per station config), or good → batchBuffer.
4. **processManager**  —  If andon enabled and manager just arrived at andon station: with `managerReworkProbability` either revert item (no defect, back to batchBuffer) or reject (trigger jidoka). Then dispatch manager to next pending andon station (arrives in 1 tick).
5. **handleQualityGates**  —  At each station with a red bin: apply defect catch probability to `outputQueue` and `batchBuffer`; caught defects removed and jidoka may trigger; uncaught remain in queue.
6. **createOrAdvanceTransfers**  —  Only if jidoka is not active: decrement transfer timers; complete outbound/return phases (push: drop items at next station; pull: take from source then return with items); delete completed transfers, free agents.
7. **moveOutputToNext**  —  Move items from each output/batchBuffer to next station (or last-station completion/defect handling). Creates transfers when station `travelTicks` > 0 for that leg; otherwise direct queue moves. Pull logic: downstream pull when it needs work and agent free.
8. **startWork**  —  For each station (if not paused, agent not away, and pull constraints ok): take up to `capacity` items from `inputQueue`, sample cycle time, put into `inProcess`.
9. **tryArrivals**  —  If first station is ready (not paused, agent not away, has capacity; in pull, output not full): add up to `batchSize` new items to first station input and emit `materialConsumed` per item.

---

## 3. Full Config

### 3.1 SimConfig (global)

| Field | Type | Meaning |
|-------|------|--------|
| `simTicksPerSecond` | number | Sim time: ticks per real second (e.g. 20 → 50 ms per tick). |
| `speed` | number | Run speed multiplier: interval between ticks = `100 / speed` ms. |
| `stations` | StationConfig[] | Station order defines line flow (first = entry, last = exit). Each station declares `batchSize`, `trainingEffectiveness`, and `andonEnabled`. |
| `pushOrPull` | `"push"` \| `"pull"` | Push: station pushes batches to next. Pull: downstream pulls when it needs work. |
| `defectProbability` | number | Base defect probability (0–1); combined with per-station `trainingEffectiveness` and multiplier. |
| `stepId` | ConfigStepId | Current step/preset (intro, step-1 … step-8, playground). |
| `layoutMode` | `"departments"` \| `"flow"` | UI layout only; no effect on tick logic. |
| `revenuePerItem` | number | Revenue per completed (shipped good) item. |
| `laborCostPerTickPerEmployee` | number | Labor cost per tick = sum of station capacities × this. |
| `inventoryCostPerItemPerTick` | number | Holding cost per tick for WIP (excluding red-bin stock). |
| `materialCostPerItem` | number | Cost per item when `materialConsumed` fires (line entry). |
| `defectCostCustomerShipped` | number | Cost per defect shipped to customer (last station, no red bin). |
| `marketChangeIntervalTicks` | number \| null | If set, market change every N ticks (fixed). |
| `marketChangeAutoIntervalMs` | number \| null | If set and interval not used, next market change in ~0.7–1.3× this (in sim ms). |
| `jidokaLineStop` | boolean | When defect caught at red bin or andon: pause **all** stations, reduce defect multiplier at that station, dispatch manager. |
| `initialInvestment` | number | Starting cumulative profit; bust when cumulative profit ≤ 0. |
| `managerReworkProbability` | number? | When andon enabled: probability manager reverts (item good again); else reject → triggers jidoka. Default 0.6. |

### 3.2 StationConfig (per station)

| Field | Type | Meaning |
|-------|------|--------|
| `id` | string | Unique station id. |
| `departmentId` | DepartmentId? | Used for cross-department travel (2× travel ticks). |
| `cycleTime` | number | Mean cycle time (ms) for work at this station. |
| `cycleVariance` | number | Variance (squared) for normal approx of cycle time; sampled per item start. |
| `capacity` | number | Number of items in progress at once. |
| `defectProbability` | number? | Override global defect probability for this station. |
| `redBinCatchProbability` | number? | Override red-bin catch probability at this station. |
| `redBin` | boolean? | If true, this station has a red bin (quality gate). Default: last station only when undefined. |
| `batchSize` | number | Batch size for moves and output; arrivals at first station use first station’s batch size. Input queue has no limit; output (batchBuffer + outputQueue) is moved when it reaches batch size (push) or worker idles when full (pull). |
| `trainingEffectiveness` | number | Defect probability multiplier for this station (e.g. 0.5 → half the base rate). |
| `reworkSendsBack` | boolean? | If defect and no andon/manager path: send item back to previous station input. Default true. |
| `reworkTicks` | number? | Reserved for future rework duration; configurable per station. |
| `andonEnabled` | boolean | When true: on defect (that would go to red bin), pause station, hold item for manager; manager travels (1 tick) and with `managerReworkProbability` reverts or rejects. When false, andon/jidoka can still trigger at other stations. |
| `andonPauseTicks` | number? | Ticks this station (or line when jidoka) is paused when andon/jidoka triggers. |
| `travelTicks` | number? | Ticks for agent to carry a batch from this station to next (0 = instant move). Cross-department = 2×. |

---

## 4. Controls Config (enabledControls)

Per-step presets define which UI controls are enabled. Only **playground** enables all. Keys and effect:

- `batchSize` → per-station control (station panel): edit `station.batchSize`
- `pushPull` → edit `config.pushOrPull`
- `defectProbability` → per-station control (station panel): edit `station.defectProbability`
- `trainingEffectiveness` → per-station control (station panel): edit `station.trainingEffectiveness`
- `cycleVariance` → per-station control: edit `station.cycleVariance`
- `cycleTime` → per-station control: edit `station.cycleTime`
- `tickSpeed` → edit `config.speed`
- `andon` → per-station control (station panel): edit `station.andonEnabled`
- `layoutMode` → edit `config.layoutMode`
- `marketChange` → button to call `triggerMarketChange()`
- `blueBins` → (if implemented) blue bin / non-defect handling

Steps intro through step-8 have `enabledControls: {}` (no sliders); playground has all set to `true`.

---

## 5. Global Mechanisms

### 5.1 Market change

- **Trigger**: (a) `marketChangeRequested` input (manual button), or (b) `marketChangeIntervalTicks` elapsed since last change, or (c) `marketChangeAutoIntervalMs` with next time = current tick + random(0.7×base, 1.3×base) in ticks.
- **Effect**: 1–3 stations (random, without replacement) chosen. For each chosen station, **all** items currently in that station (inputQueue, inProcess, batchBuffer, outputQueue) are marked `isDefective = true` and `defectFromMarketChange = true`. Station defect multipliers reset to 1. Then `clearJidokaPauseAndSendAgentsHome` (all agents idle at home, all pauseUntilTick cleared).
- **Event**: `marketChangeTriggered` with current tick.

### 5.2 Jidoka (line stop)

- When a defect is **caught** at a red bin (or andon triggers with `jidokaLineStop`), `triggerJidokaAtStation` runs:
  - All stations get `pauseUntilTick = tick + andonPauseTicks`.
  - Defect multiplier at the station is reduced (halved, floor 0.01).
  - Manager is dispatched to that station (arrives in 1 tick).
  - `jidokaUntilTick = tick + andonPauseTicks`, `jidokaStationId` set.
- While `tick < jidokaUntilTick`: **no transfers** (agents sent “home” visually; transfers not advanced). Work and other steps still run.
- When tick reaches `jidokaUntilTick`: at `jidokaStationId`, `moveStationDefectsToRedBin` runs (remove defective items from that queues into red bin counts), then `clearJidokaPauseAndSendAgentsHome`.

### 5.3 Red bin (quality gate)

- **Where**: Stations with `redBin: true`. When `redBin` is undefined, last station only (default).
- **Per tick**: In `handleQualityGates`, for each station with a red bin, items in `outputQueue` and `batchBuffer` are checked. Defective items: with probability `redBinCatchProbability` (or global catch rate) they are removed and count as caught; jidoka may trigger. Uncaught defective items stay in queue.
- **Discovery rate**: Jidoka steps use ~0.95; else 0.65 (RED_BIN_CATCH_PROB).

### 5.4 Andon

- When a defect is **created** at completion and manager rework is enabled and item would go to red bin: item is put on andon hold (`andonHoldItemId`), station paused (pauseUntilTick = ∞ until manager resolves), defect multiplier reduced, `pendingAndonStationIds` pushed.
- When andon is on but manager rework off: `handleAndonPause` sets `pauseUntilTick = tick + andonPauseTicks` (per-station or default) and optionally triggers jidoka.

### 5.5 Manager rework

- When andon enabled, when manager “arrives” at andon station (tick ≥ managerArrivesAtTick): with probability `managerReworkProbability` the item is reverted (no defect, back to batchBuffer, andon cleared); else manager rejects → jidoka triggered. Manager then dispatched to next `pendingAndonStationIds` (arrives in 1 tick).

---

## 6. Impact of Config

- **simTicksPerSecond**: Sim time scale; `tickMs = 1000 / simTicksPerSecond`; work and market auto-interval use this.
- **speed**: Real-time only; interval between ticks = 100/speed ms.
- **stations**: Order = flow; first gets arrivals; last does completion/defect ship; department ids double travel time across departments.
- **batchSize**: Default batch for moves and first-station arrivals; stations can override.
- **pushOrPull**: Push = producer pushes when outbound reaches batch size. Pull = consumer pulls when it needs work (and agent free); worker idles when outbound reaches batch size.
- **defectProbability** × **trainingEffectiveness** (or station override) × station multiplier = defect roll at completion.
- **Station redBin**: Where red bins exist; gates run there; caught defects removed and jidoka can trigger.
- **andonEnabled** / **Station andonPauseTicks**: When andon enabled: on defect (to red bin), andon holds item for manager; manager reverts or rejects. Pause duration per station.
- **jidokaLineStop**: Caught defect or manager reject pauses all stations and reduces defect rate at that station.
- **Station travelTicks**: Per-station travel time to next; > 0 ⇒ agents and transfers; cross-department = 2× ticks. 0 ⇒ instant for that leg.
- **marketChangeIntervalTicks** / **marketChangeAutoIntervalMs**: When to apply market change (random 1–3 stations, all in-flight items defective).
- **Station reworkSendsBack**: If defect and no andon/manager/red-bin path: try to send item to previous station input (if space).
- **revenuePerItem / laborCostPerTickPerEmployee / inventoryCostPerItemPerTick / materialCostPerItem / defectCostCustomerShipped**: P&amp;L per tick; inventory uses WIP excluding red-bin stock.
- **initialInvestment**: Starting capital; bust when cumulative profit ≤ 0.
- **managerReworkProbability**: When andon enabled, probability manager reverts (else reject → jidoka).
- **Station cycleTime / cycleVariance**: Normal-approximation sample per item started; min 10% of mean.
- **Station batchSize**: Input queue has no limit. Output bounded by batch size: push moves batch when outbound reaches batch size; pull: worker idles when outbound reaches batch size.
---

## 7. Business Rules Summary

- **Completion**: Item leaves inProcess when `remainingWorkMs ≤ 0`. Then: defect roll → if defect: andon (if enabled + red bin path) or rework send-back or red bin or batchBuffer; if good → batchBuffer.
- **Last station**: Good → completedIds, revenue. Defect + red bin → red bin count, no revenue. Defect + no red bin → defectiveIds, defectShippedToCustomer cost.
- **Material**: New items created only at first station when ready (not paused, capacity available; in pull, output not full); up to batchSize per tick; one `materialConsumed` per item (material cost).
- **Transfers**: When station `travelTicks` > 0 for that leg. Push: when outbound reaches batch size, source creates transfer; agent delivers to next. Pull: downstream agent goes to upstream, takes up to batch size, returns.
- **Defect multiplier**: Starts 1; andon/jidoka reduce it (e.g. ×0.5, ×0.95); market change resets to 1. Used as multiplier on base defect probability.
- **Bust**: When cumulative profit (initialInvestment + sum of tick profits) ≤ 0; sim stops advancing.
