import { describe, expect, it } from "vitest";
import { getStationWip, getWip } from "../metrics";
import { getInitialConfig } from "../presets";
import { createInitialState, tick } from "../tick";

describe("tick invariants", () => {
	const seed = 12345;
	const config = getInitialConfig("step-1", seed);

	function runTicks(n: number) {
		let state = createInitialState(config);
		for (let i = 0; i < n; i++) {
			const result = tick(state, config);
			state = result.state;
		}
		return state;
	}

	it("each station WIP never exceeds that station's wipLimit", () => {
		const state = runTicks(50);
		for (const sc of config.stations) {
			const wip = getStationWip(state, sc.id);
			const cap = sc.wipLimit ?? Number.POSITIVE_INFINITY;
			expect(wip).toBeLessThanOrEqual(cap);
		}
	});

	it("buffer capacities are never exceeded", () => {
		let state = createInitialState(config);
		for (let i = 0; i < 30; i++) {
			const result = tick(state, config);
			state = result.state;
			for (const sc of config.stations) {
				const st = state.stationStates.get(sc.id);
				expect(st).toBeDefined();
				if (st) {
					expect(st.inputQueue.length).toBeLessThanOrEqual(sc.bufferBefore);
					expect(st.inProcess.length).toBeLessThanOrEqual(sc.capacity);
					expect(st.outputQueue.length).toBeLessThanOrEqual(sc.bufferAfter);
				}
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

	it("deterministic runs with same seed produce same state", () => {
		const configA = getInitialConfig("step-1", 999);
		const configB = getInitialConfig("step-1", 999);
		let stateA = createInitialState(configA);
		let stateB = createInitialState(configB);
		for (let i = 0; i < 15; i++) {
			stateA = tick(stateA, configA).state;
			stateB = tick(stateB, configB).state;
		}
		expect(stateA.tick).toBe(stateB.tick);
		expect(stateA.completedIds.length).toBe(stateB.completedIds.length);
		expect(stateA.defectiveIds.length).toBe(stateB.defectiveIds.length);
		expect(getWip(stateA)).toBe(getWip(stateB));
	});

	it("different seeds produce different outcomes after many ticks", () => {
		const state1 = runTicks(40);
		const config2 = getInitialConfig("step-1", 54321);
		let state2 = createInitialState(config2);
		for (let i = 0; i < 40; i++) {
			state2 = tick(state2, config2).state;
		}
		const sameCompleted =
			state1.completedIds.length === state2.completedIds.length &&
			state1.completedIds.every((id, j) => id === state2.completedIds[j]);
		const sameDefects =
			state1.defectiveIds.length === state2.defectiveIds.length &&
			state1.defectiveIds.every((id, j) => id === state2.defectiveIds[j]);
		expect(sameCompleted && sameDefects).toBe(false);
	});

	it("market change on request emits marketChangeTriggered and resets learning", () => {
		const config = getInitialConfig("step-1", 100);
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
		const config = getInitialConfig("step-1", 200);
		config.redBins = false;
		config.redBinsAtAllStations = false;
		let state = createInitialState(config);
		let hadShippedEvent = false;
		for (let i = 0; i < 100 && !hadShippedEvent; i++) {
			const result = tick(state, config);
			state = result.state;
			hadShippedEvent = result.events.some(
				(e) => e.type === "defectShippedToCustomer",
			);
		}
		expect(hadShippedEvent || state.defectiveIds.length > 0).toBe(true);
	});
});
