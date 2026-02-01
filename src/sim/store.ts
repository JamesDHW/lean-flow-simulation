import { useSyncExternalStore } from "react"
import type { StepId } from "./step-config"
import { computeTickPl } from "./pl"
import { getInitialConfig } from "./presets"
import type { SimConfig, SimState, TickPl } from "./types"
import { createInitialState, tick } from "./tick"

export interface SimSnapshot {
	state: SimState
	config: SimConfig
	tickPlHistory: TickPl[]
	cumulativePl: { tick: number; cumulativeProfit: number }[]
}

export interface SimStore {
	getSnapshot(): SimSnapshot
	subscribe(listener: () => void): () => void
	start(): void
	pause(): void
	reset(): void
	setStep(stepId: StepId): void
	updateConfig(partial: Partial<SimConfig>): void
}

const DEFAULT_SEED = 42

function computeSnapshot(
	state: SimState,
	config: SimConfig,
	tickPlHistory: TickPl[],
): SimSnapshot {
	let cp = 0
	const cumulativePl = tickPlHistory.map((row) => {
		cp += row.profit
		return { tick: row.tick, cumulativeProfit: cp }
	})
	return {
		state,
		config,
		tickPlHistory,
		cumulativePl,
	}
}

export function createSimStore(initialStepId: StepId = "intro"): SimStore {
	let state: SimState = createInitialState(
		getInitialConfig(initialStepId, DEFAULT_SEED),
	)
	let config: SimConfig = getInitialConfig(initialStepId, DEFAULT_SEED)
	let tickPlHistory: TickPl[] = []
	let lastCompletedCount = 0
	let lastDefectCount = 0

	let cachedSnapshot: SimSnapshot | null = null

	let listeners: Set<() => void> = new Set()
	let intervalId: ReturnType<typeof setInterval> | null = null

	function invalidateSnapshot() {
		cachedSnapshot = null
	}

	function emit() {
		invalidateSnapshot()
		for (const l of listeners) l()
	}

	function runTick() {
		const completedBefore = state.completedIds.length
		const defectBefore = state.defectiveIds.length
		state = tick(state, config)
		const completedAfter = state.completedIds.length
		const defectAfter = state.defectiveIds.length
		const tickPl = computeTickPl(
			state,
			config,
			completedBefore,
			defectAfter - defectBefore,
		)
		tickPlHistory = [...tickPlHistory, tickPl]
		lastCompletedCount = completedAfter
		lastDefectCount = defectAfter
		emit()
	}

	function start() {
		if (intervalId) return
		intervalId = setInterval(runTick, config.tickMs)
		state = { ...state, isRunning: true }
		emit()
	}

	function pause() {
		if (intervalId) {
			clearInterval(intervalId)
			intervalId = null
		}
		state = { ...state, isRunning: false }
		emit()
	}

	function reset() {
		pause()
		state = createInitialState(config)
		tickPlHistory = []
		lastCompletedCount = 0
		lastDefectCount = 0
		emit()
	}

	function setStep(stepId: StepId) {
		pause()
		config = getInitialConfig(stepId, config.seed)
		config.stepId = stepId
		state = createInitialState(config)
		state.stepMarkers = [...state.stepMarkers, { stepId, tick: state.tick }]
		tickPlHistory = []
		lastCompletedCount = 0
		lastDefectCount = 0
		emit()
	}

	function updateConfig(partial: Partial<SimConfig>) {
		config = { ...config, ...partial }
		if (partial.stations != null) {
			config.stations = partial.stations
		}
		emit()
	}

	function getSnapshot(): SimSnapshot {
		if (cachedSnapshot === null) {
			cachedSnapshot = computeSnapshot(state, config, tickPlHistory)
		}
		return cachedSnapshot
	}

	function subscribe(listener: () => void): () => void {
		listeners.add(listener)
		return () => {
			listeners.delete(listener)
		}
	}

	return {
		getSnapshot,
		subscribe,
		start,
		pause,
		reset,
		setStep,
		updateConfig,
	}
}

export function useSimStoreSnapshot<T>(store: SimStore, selector: (snap: SimSnapshot) => T): T {
	return useSyncExternalStore(
		store.subscribe,
		() => selector(store.getSnapshot()),
		() => selector(store.getSnapshot()),
	)
}
