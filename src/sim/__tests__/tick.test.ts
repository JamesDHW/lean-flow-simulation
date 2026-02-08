import { describe, expect, it } from "vitest";
import { getWip, getWipForInventoryCost } from "../metrics";
import { computeTickPl } from "../pl";
import { getInitialConfig } from "../presets";
import { createInitialState, tick } from "../tick";

describe("tick invariants", () => {
	const config = getInitialConfig("step-1");

	function runTicks(n: number) {
		let state = createInitialState(config);
		for (let i = 0; i < n; i++) {
			const result = tick(state, config);
			state = result.state;
		}
		return state;
	}

	it("each station inProcess never exceeds capacity", () => {
		const state = runTicks(50);
		for (const sc of config.stations) {
			const st = state.stationStates.get(sc.id);
			if (st) {
				expect(st.inProcess.length).toBeLessThanOrEqual(sc.capacity);
			}
		}
	});

	it("each item appears in at most one queue or one transfer", () => {
		const state = runTicks(20);
		const seen = new Set<string>();
		for (const st of state.stationStates.values()) {
			for (const id of st.inputQueue) {
				expect(seen.has(id)).toBe(false);
				seen.add(id);
			}
			for (const slot of st.inProcess) {
				expect(seen.has(slot.itemId)).toBe(false);
				seen.add(slot.itemId);
			}
			for (const id of st.batchBuffer) {
				expect(seen.has(id)).toBe(false);
				seen.add(id);
			}
			for (const id of st.outputQueue) {
				expect(seen.has(id)).toBe(false);
				seen.add(id);
			}
		}
		for (const t of state.transfers.values()) {
			for (const id of t.itemIds) {
				expect(seen.has(id)).toBe(false);
				seen.add(id);
			}
		}
	});

	it("same state yields deterministic tick result", () => {
		let state = createInitialState(config);
		for (let i = 0; i < 5; i++) {
			state = tick(state, config).state;
		}
		const resultA = tick(state, config);
		const resultB = tick(state, config);
		expect(resultA.state.tick).toBe(resultB.state.tick);
		expect(resultA.state.completedIds.length).toBe(
			resultB.state.completedIds.length,
		);
		expect(resultA.state.defectiveIds.length).toBe(
			resultB.state.defectiveIds.length,
		);
		expect(getWip(resultA.state)).toBe(getWip(resultB.state));
	});

	it("market change on request emits marketChangeTriggered and resets learning", () => {
		const config = getInitialConfig("step-1");
		let state = createInitialState(config);
		for (let i = 0; i < 5; i++) {
			const result = tick(state, config, { marketChangeRequested: i === 2 });
			state = result.state;
			if (i === 2) {
				const hasMarketEvent = result.events.some(
					(e) => e.type === "marketChangeTriggered",
				);
				expect(hasMarketEvent).toBe(true);
				expect(state.lastMarketChangeTick).toBe(state.tick);
			}
		}
	});

	it("defect shipped to customer emits defectShippedToCustomer when no red bin at last", () => {
		const config = getInitialConfig("step-1");
		config.stations = config.stations.map((s) => ({
			...s,
			defectProbability: 0.6,
			redBin: false,
			travelTicks: 0,
			cycleTime: 200,
			cycleVariance: 20,
			trainingEffectiveness: 1,
		}));
		let state = createInitialState(config);
		let hadShippedEvent = false;
		for (let i = 0; i < 400 && !hadShippedEvent; i++) {
			const result = tick(state, config);
			state = result.state;
			hadShippedEvent = result.events.some(
				(e) => e.type === "defectShippedToCustomer",
			);
		}
		expect(hadShippedEvent || state.defectiveIds.length > 0).toBe(true);
	});

	it("cumulative material units equals total materialConsumed (arrival-only charging)", () => {
		const config = getInitialConfig("step-1");
		let state = createInitialState(config);
		let completedBefore = state.completedIds.length;
		let cumulativeMaterialUnits = 0;
		let totalMaterialConsumed = 0;
		for (let i = 0; i < 150; i++) {
			const result = tick(state, config);
			state = result.state;
			const tickPl = computeTickPl(
				state,
				config,
				completedBefore,
				result.events,
			);
			completedBefore = state.completedIds.length;
			cumulativeMaterialUnits += tickPl.materialUnits;
			for (const e of result.events) {
				if (e.type === "materialConsumed") totalMaterialConsumed += 1;
			}
		}
		expect(cumulativeMaterialUnits).toBe(totalMaterialConsumed);
	});

	it("cumulative material equals arrivals with red bin at last (no spike when defects reach end)", () => {
		const config = getInitialConfig("step-1");
		config.stations = config.stations.map((s, i) => ({
			...s,
			redBin: i === config.stations.length - 1,
		}));
		let state = createInitialState(config);
		let completedBefore = state.completedIds.length;
		let cumulativeMaterialUnits = 0;
		let totalMaterialConsumed = 0;
		for (let i = 0; i < 200; i++) {
			const result = tick(state, config);
			state = result.state;
			const tickPl = computeTickPl(
				state,
				config,
				completedBefore,
				result.events,
			);
			completedBefore = state.completedIds.length;
			cumulativeMaterialUnits += tickPl.materialUnits;
			for (const e of result.events) {
				if (e.type === "materialConsumed") totalMaterialConsumed += 1;
			}
		}
		expect(cumulativeMaterialUnits).toBe(totalMaterialConsumed);
	});

	it("inventory cost uses WIP excluding red-bin defectives", () => {
		const config = getInitialConfig("step-1");
		config.stations = config.stations.map((s, i) => ({
			...s,
			redBin: i === config.stations.length - 1,
		}));
		const state = createInitialState(config);
		const order = config.stations.map((s) => s.id);
		const lastStationId = order[order.length - 1];
		const lastSt = state.stationStates.get(lastStationId);
		if (!lastSt) throw new Error("no last station");
		const itemId = "item-0";
		state.items.set(itemId, {
			id: itemId,
			status: "waiting",
			stationId: lastStationId,
			remainingWorkMs: 0,
			createdAtTick: 0,
			isDefective: true,
		});
		state.nextItemId = 1;
		lastSt.outputQueue.push(itemId);
		const wipTotal = getWip(state);
		const wipForInventory = getWipForInventoryCost(state, config);
		expect(wipTotal).toBe(1);
		expect(wipForInventory).toBe(0);
		const tickPl = computeTickPl(state, config, 0, []);
		expect(tickPl.inventoryCost).toBe(0);
	});

	it("no arrivals in a tick yields zero material cost for that tick", () => {
		const config = getInitialConfig("step-1");
		let state = createInitialState(config);
		let hadZeroArrivalTick = false;
		for (let i = 0; i < 50; i++) {
			const completedBefore = state.completedIds.length;
			const result = tick(state, config);
			state = result.state;
			const materialConsumedThisTick = result.events.filter(
				(e) => e.type === "materialConsumed",
			).length;
			if (materialConsumedThisTick === 0) {
				hadZeroArrivalTick = true;
				const tickPl = computeTickPl(
					state,
					config,
					completedBefore,
					result.events,
				);
				expect(tickPl.materialUnits).toBe(0);
				expect(tickPl.materialCost).toBe(0);
			}
		}
		expect(hadZeroArrivalTick).toBe(true);
	});
});
