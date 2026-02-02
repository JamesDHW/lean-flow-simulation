import { useSyncExternalStore } from "react";
import { computeCumulativePl, computeTickPl } from "./pl";
import { getInitialConfig } from "./presets";
import type { StepId } from "./step-config";
import { createInitialState, tick } from "./tick";
import type { CumulativePl, SimConfig, SimState, TickPl } from "./types";

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

const DEFAULT_SEED = 42;

function computeSnapshot(
	state: SimState,
	config: SimConfig,
	tickPlHistory: TickPl[],
): SimSnapshot {
	const cumulativePl = computeCumulativePl(
		tickPlHistory,
		config.initialInvestment,
	);
	return {
		state,
		config,
		tickPlHistory,
		cumulativePl,
	};
}

export function createSimStore(initialStepId: StepId = "intro"): SimStore {
	let state: SimState = createInitialState(
		getInitialConfig(initialStepId, DEFAULT_SEED),
	);
	let config: SimConfig = getInitialConfig(initialStepId, DEFAULT_SEED);
	let tickPlHistory: TickPl[] = [];
	let lastCompletedCount = 0;
	let marketChangeRequested = false;

	let cachedSnapshot: SimSnapshot | null = null;

	let listeners: Set<() => void> = new Set();
	let intervalId: ReturnType<typeof setInterval> | null = null;

	function invalidateSnapshot() {
		cachedSnapshot = null;
	}

	function emit() {
		invalidateSnapshot();
		for (const l of listeners) l();
	}

	function runTick() {
		if (state.isBust) return;
		const completedBefore = state.completedIds.length;
		const result = tick(state, config, { marketChangeRequested });
		marketChangeRequested = false;
		state = result.state;
		const tickPl = computeTickPl(state, config, completedBefore, result.events);
		tickPlHistory = [...tickPlHistory, tickPl];
		lastCompletedCount = state.completedIds.length;
		const cumPl = computeCumulativePl(tickPlHistory, config.initialInvestment);
		const lastCum = cumPl[cumPl.length - 1];
		if (lastCum && lastCum.cumulativeProfit <= 0) {
			state = { ...state, isBust: true };
			pause();
		}
		emit();
	}

	function triggerMarketChange() {
		marketChangeRequested = true;
		emit();
	}

	function start() {
		if (intervalId) return;
		intervalId = setInterval(runTick, config.tickMs);
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
		lastCompletedCount = 0;
		emit();
	}

	function setStep(stepId: StepId) {
		pause();
		config = getInitialConfig(stepId, config.seed);
		config.stepId = stepId;
		state = createInitialState(config);
		state.stepMarkers = [...state.stepMarkers, { stepId, tick: state.tick }];
		tickPlHistory = [];
		lastCompletedCount = 0;
		emit();
	}

	function updateConfig(partial: Partial<SimConfig>) {
		config = { ...config, ...partial };
		if (partial.stations != null) {
			config.stations = partial.stations;
		}
		emit();
	}

	function getSnapshot(): SimSnapshot {
		if (cachedSnapshot === null) {
			cachedSnapshot = computeSnapshot(state, config, tickPlHistory);
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
