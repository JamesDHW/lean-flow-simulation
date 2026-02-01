import * as R from "./random"
import type {
	InProcessSlot,
	Item,
	SimConfig,
	SimState,
	StationConfig,
	StationState,
} from "./types"

function getStationOrder(config: SimConfig): string[] {
	return config.stations.map((s) => s.id)
}

function getStationConfig(config: SimConfig, stationId: string): StationConfig | undefined {
	return config.stations.find((s) => s.id === stationId)
}

function cloneState(state: SimState): SimState {
	const items = new Map<string, Item>()
	for (const [id, item] of state.items) {
		items.set(id, { ...item })
	}
	const stationStates = new Map<string, StationState>()
	for (const [id, st] of state.stationStates) {
		stationStates.set(id, {
			stationId: st.stationId,
			inputQueue: [...st.inputQueue],
			inProcess: st.inProcess.map((s) => ({ ...s })),
			outputQueue: [...st.outputQueue],
			defectCount: st.defectCount,
		})
	}
	return {
		...state,
		items,
		stationStates,
		completedIds: [...state.completedIds],
		defectiveIds: [...state.defectiveIds],
		stepMarkers: [...state.stepMarkers],
	}
}

function getStationState(state: SimState, stationId: string): StationState {
	const st = state.stationStates.get(stationId)
	if (st) return st
	const newSt: StationState = {
		stationId,
		inputQueue: [],
		inProcess: [],
		outputQueue: [],
		defectCount: 0,
	}
	state.stationStates.set(stationId, newSt)
	return newSt
}

function countWip(state: SimState): number {
	let n = 0
	for (const st of state.stationStates.values()) {
		n += st.inputQueue.length + st.inProcess.length + st.outputQueue.length
	}
	return n
}

function createItem(state: SimState, stationId: string): Item {
	const id = `item-${state.nextItemId}`
	const item: Item = {
		id,
		status: "waiting",
		stationId,
		remainingWorkMs: 0,
		createdAtTick: state.tick,
	}
	state.items.set(id, item)
	state.nextItemId += 1
	return item
}

export function createInitialState(config: SimConfig): SimState {
	const state: SimState = {
		tick: 0,
		nextItemId: 0,
		items: new Map(),
		stationStates: new Map(),
		completedIds: [],
		defectiveIds: [],
		lastArrivalTick: 0,
		rngState: config.seed,
		stepMarkers: [{ stepId: config.stepId, tick: 0 }],
		isRunning: false,
	}
	for (const sc of config.stations) {
		state.stationStates.set(sc.id, {
			stationId: sc.id,
			inputQueue: [],
			inProcess: [],
			outputQueue: [],
			defectCount: 0,
		})
	}
	return state
}

function redBinPhase(state: SimState, config: SimConfig): void {
	if (!config.redBins) return
	const order = getStationOrder(config)
	for (const stationId of order) {
		const st = getStationState(state, stationId)
		const remaining: string[] = []
		for (const itemId of st.outputQueue) {
			const item = state.items.get(itemId)
			if (item?.isDefective === true) {
				st.defectCount += 1
				continue
			}
			remaining.push(itemId)
		}
		st.outputQueue = remaining
	}
}

function processCompletions(state: SimState, config: SimConfig): void {
	let rng = state.rngState
	const order = getStationOrder(config)
	const tickMs = config.tickMs

	for (const stationId of order) {
		const st = getStationState(state, stationId)
		const stationConfig = getStationConfig(config, stationId)
		if (!stationConfig) continue

		const stillInProcess: InProcessSlot[] = []
		for (const slot of st.inProcess) {
			const item = state.items.get(slot.itemId)
			if (!item) continue
			const remaining = slot.remainingWorkMs - tickMs
			if (remaining > 0) {
				stillInProcess.push({ ...slot, remainingWorkMs: remaining })
				continue
			}
			const defectProb =
				stationConfig.defectProbability ?? config.defectProbability * config.trainingEffectiveness
			const [isDefective, rng2] = R.chance(rng, defectProb)
			rng = rng2
			if (isDefective) {
				item.isDefective = true
				state.defectiveIds.push(item.id)
				if (config.redBins) {
					item.status = "waiting"
					st.outputQueue.push(item.id)
					continue
				}
				if (config.reworkSendsBack) {
					const idx = order.indexOf(stationId)
					if (idx > 0) {
						const prevId = order[idx - 1]
						const prevSt = getStationState(state, prevId)
						const prevConfig = getStationConfig(config, prevId)
						if (prevConfig && prevSt.inputQueue.length < prevConfig.bufferBefore) {
							item.status = "waiting"
							item.stationId = prevId
							item.remainingWorkMs = 0
							item.isDefective = undefined
							state.defectiveIds.pop()
							prevSt.inputQueue.push(item.id)
						}
					}
				}
				continue
			}
			item.status = "waiting"
			st.outputQueue.push(item.id)
		}
		st.inProcess = stillInProcess
	}
	state.rngState = rng
}

function moveOutputToNext(state: SimState, config: SimConfig): void {
	const order = getStationOrder(config)
	for (let i = 0; i < order.length; i++) {
		const stationId = order[i]
		const st = getStationState(state, stationId)
		const isLast = i === order.length - 1
		const nextId = isLast ? null : order[i + 1]
		const nextSt = nextId ? getStationState(state, nextId) : null
		const nextConfig = nextId ? getStationConfig(config, nextId) : null

		const remaining: string[] = []
		for (const itemId of st.outputQueue) {
			const item = state.items.get(itemId)
			if (!item) continue
			if (item.isDefective && config.redBins) {
				remaining.push(itemId)
				continue
			}
			if (isLast) {
				item.status = "done"
				item.completedAtTick = state.tick
				state.completedIds.push(itemId)
				continue
			}
			if (!nextSt || !nextConfig) {
				remaining.push(itemId)
				continue
			}
			if (config.pushOrPull === "pull" && nextSt.inputQueue.length >= nextConfig.bufferBefore) {
				remaining.push(itemId)
				continue
			}
			item.stationId = nextId
			nextSt.inputQueue.push(itemId)
		}
		st.outputQueue = remaining
	}
}

function canStartDownstream(state: SimState, config: SimConfig, stationIndex: number): boolean {
	const order = getStationOrder(config)
	if (stationIndex >= order.length - 1) return true
	const nextId = order[stationIndex + 1]
	const nextSt = getStationState(state, nextId)
	const nextConfig = getStationConfig(config, nextId)
	if (!nextConfig) return true
	const space = nextConfig.bufferBefore - nextSt.inputQueue.length
	return space > 0
}

function startWork(state: SimState, config: SimConfig): void {
	let rng = state.rngState
	const order = getStationOrder(config)

	for (let i = 0; i < order.length; i++) {
		const stationId = order[i]
		const st = getStationState(state, stationId)
		const stationConfig = getStationConfig(config, stationId)
		if (!stationConfig) continue
		if (config.pushOrPull === "pull" && !canStartDownstream(state, config, i)) continue
		const capacity = stationConfig.capacity - st.inProcess.length
		if (capacity <= 0) continue

		let taken = 0
		const newInputQueue: string[] = []
		for (const itemId of st.inputQueue) {
			if (taken >= capacity) {
				newInputQueue.push(itemId)
				continue
			}
			const item = state.items.get(itemId)
			if (!item) continue
			const [workMs, rng2] = R.sampleCycleTime(
				rng,
				stationConfig.cycleTime,
				stationConfig.cycleVariance,
			)
			rng = rng2
			item.status = "working"
			item.remainingWorkMs = workMs
			st.inProcess.push({ itemId, remainingWorkMs: workMs })
			taken += 1
		}
		st.inputQueue = newInputQueue
	}
	state.rngState = rng
}

function tryArrivals(state: SimState, config: SimConfig): void {
	const order = getStationOrder(config)
	const firstId = order[0]
	const firstSt = getStationState(state, firstId)
	const firstConfig = getStationConfig(config, firstId)
	if (!firstConfig) return

	const wip = countWip(state)
	if (wip >= config.wipLimit) return
	const elapsed = state.tick * config.tickMs
	const lastArrivalMs = state.lastArrivalTick * config.tickMs
	if (elapsed - lastArrivalMs < config.arrivalRateMs) return

	const space = firstConfig.bufferBefore - firstSt.inputQueue.length
	if (space <= 0) return

	const toAdd = Math.min(config.batchSize, config.wipLimit - wip, space)
	if (toAdd <= 0) return

	for (let i = 0; i < toAdd; i++) {
		const item = createItem(state, firstId)
		firstSt.inputQueue.push(item.id)
	}
	state.lastArrivalTick = state.tick
}

export function tick(state: SimState, config: SimConfig): SimState {
	const next = cloneState(state)
	next.tick = state.tick + 1

	redBinPhase(next, config)
	processCompletions(next, config)
	moveOutputToNext(next, config)
	startWork(next, config)
	tryArrivals(next, config)

	return next
}
