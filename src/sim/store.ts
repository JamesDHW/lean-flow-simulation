import { useSyncExternalStore } from "react";
import { addTickPlToCumulative, computeTickPl } from "./pl";
import { getInitialConfig } from "./presets";
import type { ConfigStepId, StepId } from "./step-config";
import { createInitialState, tick } from "./tick";
import { getTickForDisplayMonths } from "./time";
import type { CumulativePl, Item, SimConfig, SimState, TickPl } from "./types";

const MAX_CHART_POINTS = 1000;

export interface SimSnapshot {
	state: SimState;
	config: SimConfig;
	tickPlHistory: TickPl[];
	cumulativePl: CumulativePl[];
}

export interface SimStore {
	getSnapshot(): SimSnapshot;
	subscribe(listener: () => void): () => void;
	start(): void;
	pause(): void;
	reset(): void;
	setStep(stepId: StepId): void;
	updateConfig(partial: Partial<SimConfig>): void;
	triggerMarketChange(): void;
}

const MAX_STATE_IDS = 15_000;
export const SIM_MONTHS_CAP = 36;

function downsampleCumulativePl(arr: CumulativePl[]): CumulativePl[] {
	if (arr.length <= MAX_CHART_POINTS) return arr;
	const step = arr.length / MAX_CHART_POINTS;
	const out: CumulativePl[] = [];
	for (let i = 0; i < MAX_CHART_POINTS; i++) {
		const idx =
			i === MAX_CHART_POINTS - 1 ? arr.length - 1 : Math.floor(i * step);
		out.push(arr[idx]);
	}
	return out;
}

function collectActiveItemIds(state: SimState): Set<string> {
	const ids = new Set<string>();
	for (const st of state.stationStates.values()) {
		for (const id of st.inputQueue) ids.add(id);
		for (const slot of st.inProcess) ids.add(slot.itemId);
		for (const id of st.batchBuffer) ids.add(id);
		for (const id of st.outputQueue) ids.add(id);
		if (st.andonHoldItemId != null) ids.add(st.andonHoldItemId);
	}
	for (const t of state.transfers.values()) {
		for (const id of t.itemIds) ids.add(id);
	}
	return ids;
}

function getDisplayState(state: SimState): SimState {
	const completedIds = state.completedIds.slice(-MAX_STATE_IDS);
	const defectiveIds = state.defectiveIds.slice(-MAX_STATE_IDS);
	const activeIds = collectActiveItemIds(state);
	for (const id of completedIds) activeIds.add(id);
	for (const id of defectiveIds) activeIds.add(id);
	const items = new Map<string, Item>();
	for (const id of activeIds) {
		const item = state.items.get(id);
		if (item) items.set(id, item);
	}
	return {
		...state,
		completedIds,
		defectiveIds,
		totalCompletedCount: state.completedIds.length,
		totalDefectiveCount: state.defectiveIds.length,
		items,
	};
}

function computeSnapshot(
	state: SimState,
	config: SimConfig,
	tickPlHistory: TickPl[],
	cumulativePl: CumulativePl[],
): SimSnapshot {
	return {
		state: getDisplayState(state),
		config,
		tickPlHistory,
		cumulativePl,
	};
}

export function createSimStore(
	initialStepId: ConfigStepId = "intro",
): SimStore {
	let state: SimState = createInitialState(getInitialConfig(initialStepId));
	let config: SimConfig = getInitialConfig(initialStepId);
	let tickPlHistory: TickPl[] = [];
	let cumulativePlChart: CumulativePl[] = [];
	let lastCumulativePl: CumulativePl | null = null;
	let marketChangeRequested = false;

	let cachedSnapshot: SimSnapshot | null = null;

	const listeners: Set<() => void> = new Set();
	let intervalId: ReturnType<typeof setInterval> | null = null;

	function invalidateSnapshot() {
		cachedSnapshot = null;
	}

	function emit() {
		invalidateSnapshot();
		for (const l of listeners) l();
	}

	function runTick() {
		if (state.isBust || state.endedAt24Months) return;
		const maxTick = getTickForDisplayMonths(
			SIM_MONTHS_CAP,
			config.simTicksPerSecond,
		);
		if (state.tick >= maxTick) {
			state = { ...state, endedAt24Months: true };
			pause();
			emit();
			return;
		}
		const completedBefore = state.completedIds.length;
		state = getDisplayState(state);
		const result = tick(state, config, { marketChangeRequested });
		marketChangeRequested = false;
		state = result.state;
		state = getDisplayState(state);
		const tickPl = computeTickPl(state, config, completedBefore, result.events);
		tickPlHistory = [tickPl];
		const nextCumulative = addTickPlToCumulative(
			lastCumulativePl,
			tickPl,
			config.initialInvestment,
		);
		if (state.tick >= maxTick) {
			state = { ...state, endedAt24Months: true };
			pause();
		}
		if (nextCumulative.cumulativeProfit <= 0) {
			state = { ...state, isBust: true };
			pause();
		}
		lastCumulativePl = nextCumulative;
		if (cumulativePlChart.length === 0) {
			cumulativePlChart = [nextCumulative];
		} else {
			const step = Math.ceil((state.tick + 1) / MAX_CHART_POINTS);
			if (cumulativePlChart.length * step <= state.tick + 1) {
				cumulativePlChart.push(nextCumulative);
				if (cumulativePlChart.length > MAX_CHART_POINTS) {
					cumulativePlChart = downsampleCumulativePl(cumulativePlChart);
				}
			} else {
				cumulativePlChart[cumulativePlChart.length - 1] = nextCumulative;
			}
		}
		emit();
	}

	function triggerMarketChange() {
		marketChangeRequested = true;
		emit();
	}

	function getTickIntervalMs(): number {
		return 100 / config.speed;
	}

	function start() {
		if (intervalId) return;
		intervalId = setInterval(runTick, getTickIntervalMs());
		state = { ...state, isRunning: true };
		emit();
	}

	function pause() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		state = { ...state, isRunning: false };
		emit();
	}

	function reset() {
		pause();
		state = createInitialState(config);
		tickPlHistory = [];
		cumulativePlChart = [];
		lastCumulativePl = null;
		emit();
	}

	function setStep(stepId: StepId) {
		pause();
		config = getInitialConfig(stepId);
		config.stepId = stepId;
		state = createInitialState(config);
		state.stepMarkers = [...state.stepMarkers, { stepId, tick: state.tick }];
		tickPlHistory = [];
		cumulativePlChart = [];
		lastCumulativePl = null;
		emit();
	}

	function updateConfig(partial: Partial<SimConfig>) {
		config = { ...config, ...partial };
		if (partial.stations != null) {
			config.stations = partial.stations;
		}
		const timingChanged =
			partial.simTicksPerSecond != null || partial.speed != null;
		if (timingChanged && state.isRunning && intervalId != null) {
			clearInterval(intervalId);
			intervalId = setInterval(runTick, getTickIntervalMs());
		}
		emit();
	}

	function getSnapshot(): SimSnapshot {
		if (cachedSnapshot === null) {
			cachedSnapshot = computeSnapshot(
				state,
				config,
				tickPlHistory,
				cumulativePlChart,
			);
		}
		return cachedSnapshot;
	}

	function subscribe(listener: () => void): () => void {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}

	return {
		getSnapshot,
		subscribe,
		start,
		pause,
		reset,
		setStep,
		updateConfig,
		triggerMarketChange,
	};
}

export function useSimStoreSnapshot<T>(
	store: SimStore,
	selector: (snap: SimSnapshot) => T,
): T {
	return useSyncExternalStore(
		store.subscribe,
		() => selector(store.getSnapshot()),
		() => selector(store.getSnapshot()),
	);
}
