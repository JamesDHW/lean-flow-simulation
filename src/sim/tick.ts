import * as R from "./random";
import { STEP_IDS } from "./step-config";
import {
	type AgentState,
	getSimulationMsPerTick,
	type InProcessSlot,
	type Item,
	type SimConfig,
	type SimState,
	type StationConfig,
	type StationQuality,
	type StationState,
	type TickEvent,
	type TickInputs,
	type TickResult,
	type Transfer,
	type TransferPhase,
} from "./types";

function isJidokaStepOrLater(config: SimConfig): boolean {
	const stepId = config.stepId;
	if (stepId === "playground") return false;
	return STEP_IDS.indexOf(stepId) >= STEP_IDS.indexOf("step-4");
}

function getStationOrder(config: SimConfig): string[] {
	return config.stations.map((s) => s.id);
}

function getStationConfig(
	config: SimConfig,
	stationId: string,
): StationConfig | undefined {
	return config.stations.find((s) => s.id === stationId);
}

function getStationDepartment(
	config: SimConfig,
	stationId: string,
): string | undefined {
	return getStationConfig(config, stationId)?.departmentId;
}

function hasRedBinAtStation(
	config: SimConfig,
	stationId: string,
	stationIndex: number,
): boolean {
	const order = getStationOrder(config);
	const isLast = stationIndex === order.length - 1;
	const station = getStationConfig(config, stationId);
	return station?.redBin ?? isLast;
}

const DEFAULT_ANDON_PAUSE_TICKS = 5;
const MANAGER_ANDON_MAX_PAUSE_TICKS = 200;
const MIN_JIDOKA_DURATION_TICKS = 30;

function getAndonPauseTicks(config: SimConfig, stationId: string): number {
	const station = getStationConfig(config, stationId);
	return station?.andonPauseTicks ?? DEFAULT_ANDON_PAUSE_TICKS;
}

function getTravelTicksBetween(
	config: SimConfig,
	fromStationId: string,
	toStationId: string,
): number {
	const fromConfig = getStationConfig(config, fromStationId);
	const baseTicks = fromConfig?.travelTicks ?? 0;
	const fromDept = getStationDepartment(config, fromStationId);
	const toDept = getStationDepartment(config, toStationId);
	const crossDepartment =
		fromDept != null && toDept != null && fromDept !== toDept;
	return crossDepartment ? 2 * baseTicks : baseTicks;
}

function getMaxTravelTicksToStation(
	config: SimConfig,
	toStationId: string,
): number {
	const order = getStationOrder(config);
	const toIndex = order.indexOf(toStationId);
	if (toIndex < 0) return 0;
	let maxTicks = 0;
	for (let fromIndex = 0; fromIndex < order.length; fromIndex++) {
		let pathTicks = 0;
		if (fromIndex < toIndex) {
			for (let i = fromIndex; i < toIndex; i++) {
				pathTicks += getTravelTicksBetween(config, order[i], order[i + 1]);
			}
		}
		if (fromIndex > toIndex) {
			for (let i = fromIndex - 1; i >= toIndex; i--) {
				pathTicks += getTravelTicksBetween(config, order[i + 1], order[i]);
			}
		}
		if (pathTicks > maxTicks) maxTicks = pathTicks;
	}
	return maxTicks;
}

function isStationPaused(state: SimState, stationId: string): boolean {
	const q = state.stationQuality.get(stationId);
	if (q?.pauseUntilTick == null) return false;
	return state.tick < q.pauseUntilTick;
}

function isAgentAway(state: SimState, stationId: string): boolean {
	const agent = state.agents.get(`agent-${stationId}`);
	if (!agent) return false;
	return agent.status === "walking";
}

function cloneState(state: SimState): SimState {
	const items = new Map<string, Item>();
	for (const [id, item] of state.items) {
		items.set(id, { ...item });
	}
	const stationStates = new Map<string, StationState>();
	for (const [id, st] of state.stationStates) {
		stationStates.set(id, {
			stationId: st.stationId,
			inputQueue: [...st.inputQueue],
			inProcess: st.inProcess.map((s) => ({ ...s })),
			batchBuffer: [...st.batchBuffer],
			outputQueue: [...st.outputQueue],
			defectCount: st.defectCount,
			defectCreatedCount: st.defectCreatedCount ?? 0,
			andonHoldItemId: st.andonHoldItemId,
		});
	}
	const transfers = new Map<string, Transfer>();
	for (const [id, t] of state.transfers) {
		transfers.set(id, { ...t, itemIds: [...t.itemIds] } as Transfer);
	}
	const agents = new Map<string, AgentState>();
	for (const [id, a] of state.agents) {
		agents.set(id, { ...a });
	}
	const stationQuality = new Map<string, StationQuality>();
	for (const [id, q] of state.stationQuality) {
		stationQuality.set(id, { ...q });
	}
	return {
		...state,
		items,
		stationStates,
		transfers,
		agents,
		stationQuality,
		completedIds: [...state.completedIds],
		defectiveIds: [...state.defectiveIds],
		stepMarkers: [...state.stepMarkers],
		rejectedAtEndCount: state.rejectedAtEndCount ?? 0,
		jidokaUntilTick: state.jidokaUntilTick,
		jidokaStationId: state.jidokaStationId,
		isBust: state.isBust,
		endedAt24Months: state.endedAt24Months,
		pendingAndonStationIds: [...state.pendingAndonStationIds],
		managerFromStationId: state.managerFromStationId,
		managerToStationId: state.managerToStationId,
		managerArrivesAtTick: state.managerArrivesAtTick,
		managerResolvesAtTick: state.managerResolvesAtTick,
	};
}

function getStationState(state: SimState, stationId: string): StationState {
	const st = state.stationStates.get(stationId);
	if (st) return st;
	const newSt: StationState = {
		stationId,
		inputQueue: [],
		inProcess: [],
		batchBuffer: [],
		outputQueue: [],
		defectCount: 0,
		defectCreatedCount: 0,
		andonHoldItemId: null,
	};
	state.stationStates.set(stationId, newSt);
	return newSt;
}

function getStationWip(state: SimState, stationId: string): number {
	const st = getStationState(state, stationId);
	return (
		st.inputQueue.length +
		st.inProcess.length +
		st.batchBuffer.length +
		st.outputQueue.length
	);
}

function createItem(state: SimState, stationId: string): Item {
	const id = `item-${state.nextItemId}`;
	const item: Item = {
		id,
		status: "waiting",
		stationId,
		remainingWorkMs: 0,
		createdAtTick: state.tick,
	};
	state.items.set(id, item);
	state.nextItemId += 1;
	return item;
}

export function createInitialState(config: SimConfig): SimState {
	const state: SimState = {
		tick: 0,
		nextItemId: 0,
		nextTransferId: 0,
		items: new Map(),
		stationStates: new Map(),
		transfers: new Map(),
		agents: new Map(),
		stationQuality: new Map(),
		completedIds: [],
		defectiveIds: [],
		lastMarketChangeTick: null,
		nextMarketChangeTick: null,
		lastDefectShippedTick: null,
		rngState: (Math.random() * 0xffffffff) >>> 0,
		stepMarkers: [{ stepId: config.stepId, tick: 0 }],
		isRunning: false,
		rejectedAtEndCount: 0,
		jidokaUntilTick: undefined,
		jidokaStationId: undefined,
		isBust: false,
		endedAt24Months: false,
		pendingAndonStationIds: [],
		managerFromStationId: config.stations[0]?.id ?? null,
		managerToStationId: null,
		managerArrivesAtTick: null,
		managerResolvesAtTick: null,
	};
	for (const sc of config.stations) {
		state.stationStates.set(sc.id, {
			stationId: sc.id,
			inputQueue: [],
			inProcess: [],
			batchBuffer: [],
			outputQueue: [],
			defectCount: 0,
			defectCreatedCount: 0,
			andonHoldItemId: null,
		});
		state.stationQuality.set(sc.id, { defectMultiplier: 1 });
	}
	for (const sc of config.stations) {
		state.agents.set(`agent-${sc.id}`, {
			id: `agent-${sc.id}`,
			status: "idle",
			fromStationId: null,
			toStationId: null,
			carryingTransferId: null,
			progress01: 0,
		});
	}
	return state;
}

function scheduleNextRandomMarketChange(
	state: SimState,
	config: SimConfig,
): void {
	const ms = config.marketChangeAutoIntervalMs;
	if (ms == null) return;
	const baseTicks = Math.max(
		1,
		Math.round(ms / getSimulationMsPerTick(config)),
	);
	const minTicks = Math.round(0.7 * baseTicks);
	const maxTicks = Math.round(1.3 * baseTicks);
	const [delta, rng2] = R.nextInt(state.rngState, minTicks, maxTicks);
	state.rngState = rng2;
	state.nextMarketChangeTick = state.tick + delta;
}

function applyMarketChangeIfDueOrTriggered(
	state: SimState,
	config: SimConfig,
	inputs: TickInputs,
	events: TickEvent[],
): void {
	if (inputs.marketChangeRequested === true) {
		state.lastMarketChangeTick = state.tick;
		events.push({ type: "marketChangeTriggered", tick: state.tick });
		applyMarketChange(state, config);
		scheduleNextRandomMarketChange(state, config);
		return;
	}
	const interval = config.marketChangeIntervalTicks;
	if (interval != null) {
		const last = state.lastMarketChangeTick;
		const due =
			last == null ? state.tick >= interval : state.tick - last >= interval;
		if (due) {
			state.lastMarketChangeTick = state.tick;
			events.push({ type: "marketChangeTriggered", tick: state.tick });
			applyMarketChange(state, config);
		}
		return;
	}
	const autoMs = config.marketChangeAutoIntervalMs;
	if (autoMs == null) return;
	if (state.nextMarketChangeTick == null) {
		scheduleNextRandomMarketChange(state, config);
		return;
	}
	if (state.tick < state.nextMarketChangeTick) return;
	state.lastMarketChangeTick = state.tick;
	events.push({ type: "marketChangeTriggered", tick: state.tick });
	applyMarketChange(state, config);
	scheduleNextRandomMarketChange(state, config);
}

function applyMarketChange(state: SimState, config: SimConfig): void {
	let rng = state.rngState;
	const order = getStationOrder(config);
	const maxStations = Math.min(3, order.length);
	const [count, rng2] = R.nextInt(rng, 1, Math.max(1, maxStations));
	rng = rng2;
	const [indices, rng3] = sampleIndicesWithoutReplacement(
		rng,
		order.length,
		count,
	);
	state.rngState = rng3;
	for (const i of indices) {
		const stationId = order[i];
		const st = getStationState(state, stationId);
		const q = state.stationQuality.get(stationId);
		if (q) q.defectMultiplier = 1;
		for (const itemId of [
			...st.inputQueue,
			...st.inProcess.map((s) => s.itemId),
			...st.batchBuffer,
			...st.outputQueue,
		]) {
			const item = state.items.get(itemId);
			if (item) {
				item.isDefective = true;
				item.defectFromMarketChange = true;
			}
		}
	}
	clearJidokaPauseAndSendAgentsHome(state);
}

function sampleIndicesWithoutReplacement(
	seed: number,
	n: number,
	k: number,
): [number[], number] {
	let rng = seed;
	const chosen = new Set<number>();
	while (chosen.size < k && chosen.size < n) {
		const [j, rng2] = R.nextInt(rng, 0, n - 1);
		rng = rng2;
		chosen.add(j);
	}
	return [[...chosen], rng];
}

const RED_BIN_CATCH_PROB = 0.65;
const JIDOKA_DISCOVERY_RATE = 0.95;

function getDefectDiscoveryRate(config: SimConfig): number {
	return isJidokaStepOrLater(config)
		? JIDOKA_DISCOVERY_RATE
		: RED_BIN_CATCH_PROB;
}

function getDefectDiscoveryRateForStation(
	config: SimConfig,
	stationId: string,
): number {
	const stationConfig = getStationConfig(config, stationId);
	if (stationConfig?.redBinCatchProbability != null)
		return stationConfig.redBinCatchProbability;
	return getDefectDiscoveryRate(config);
}

function triggerJidokaAtStation(
	state: SimState,
	config: SimConfig,
	stationId: string,
): void {
	if (!config.jidokaLineStop || !isJidokaStepOrLater(config)) return;
	if (state.jidokaUntilTick != null && state.tick < state.jidokaUntilTick)
		return;
	const stationConfig = getStationConfig(config, stationId);
	const baseDefectProb = stationConfig
		? stationConfig.defectProbability * stationConfig.trainingEffectiveness
		: 0.01;
	const q = state.stationQuality.get(stationId);
	const currentP = baseDefectProb * (q?.defectMultiplier ?? 1);
	const newP = Math.max(0.01, 0.5 * currentP);
	const andonPauseTicks = getAndonPauseTicks(config, stationId);
	const maxTravelTicks = getMaxTravelTicksToStation(config, stationId);
	const jidokaDuration = Math.max(
		MIN_JIDOKA_DURATION_TICKS,
		maxTravelTicks + andonPauseTicks,
	);
	state.jidokaUntilTick = state.tick + jidokaDuration;
	state.jidokaStationId = stationId;
	for (const sq of state.stationQuality.values()) {
		sq.pauseUntilTick = state.tick + jidokaDuration;
	}
	if (q) {
		q.defectMultiplier = newP / baseDefectProb;
	}
	const order = getStationOrder(config);
	const firstId = order[0] ?? null;
	state.managerFromStationId =
		state.managerToStationId ?? state.managerFromStationId ?? firstId;
	state.managerToStationId = stationId;
	state.managerArrivesAtTick = state.tick + 1;
}

function isItemDefective(item: Item | undefined): boolean {
	return item?.status === "defective" || item?.isDefective === true;
}

function moveStationDefectsToRedBin(
	state: SimState,
	config: SimConfig,
	stationId: string,
): void {
	const order = getStationOrder(config);
	const stationIndex = order.indexOf(stationId);
	if (!hasRedBinAtStation(config, stationId, stationIndex)) return;
	const st = getStationState(state, stationId);

	const andonItemId = st.andonHoldItemId;
	if (andonItemId) {
		const item = state.items.get(andonItemId);
		if (isItemDefective(item)) {
			st.defectCount += 1;
		}
		st.andonHoldItemId = null;
		const q = state.stationQuality.get(stationId);
		if (q) q.pauseUntilTick = undefined;
	}

	const remainingInput: string[] = [];
	for (const itemId of st.inputQueue) {
		const item = state.items.get(itemId);
		if (isItemDefective(item)) {
			st.defectCount += 1;
			continue;
		}
		remainingInput.push(itemId);
	}
	st.inputQueue = remainingInput;

	const stillInProcess: InProcessSlot[] = [];
	for (const slot of st.inProcess) {
		const item = state.items.get(slot.itemId);
		if (isItemDefective(item)) {
			st.defectCount += 1;
			continue;
		}
		stillInProcess.push(slot);
	}
	st.inProcess = stillInProcess;

	const remainingBuffer: string[] = [];
	for (const itemId of st.batchBuffer) {
		const item = state.items.get(itemId);
		if (isItemDefective(item)) {
			st.defectCount += 1;
			continue;
		}
		remainingBuffer.push(itemId);
	}
	st.batchBuffer = remainingBuffer;

	const remainingOutput: string[] = [];
	for (const itemId of st.outputQueue) {
		const item = state.items.get(itemId);
		if (isItemDefective(item)) {
			st.defectCount += 1;
			continue;
		}
		remainingOutput.push(itemId);
	}
	st.outputQueue = remainingOutput;
}

function applyQualityGateToItemIds(
	state: SimState,
	config: SimConfig,
	stationId: string,
	itemIds: string[],
	catchProb: number,
	events: TickEvent[],
): { remaining: string[]; caughtCount: number } {
	const remaining: string[] = [];
	let caughtCount = 0;
	for (const itemId of itemIds) {
		const item = state.items.get(itemId);
		if (item?.isDefective !== true) {
			remaining.push(itemId);
			continue;
		}
		const [caught, rng2] = R.chance(state.rngState, catchProb);
		state.rngState = rng2;
		if (caught) {
			triggerJidokaAtStation(state, config, stationId);
			events.push({ type: "defectCaught", stationId, itemId });
			caughtCount += 1;
			continue;
		}
		remaining.push(itemId);
	}
	return { remaining, caughtCount };
}

function handleQualityGates(
	state: SimState,
	config: SimConfig,
	events: TickEvent[],
): void {
	const order = getStationOrder(config);

	for (const stationId of order) {
		const i = order.indexOf(stationId);
		if (!hasRedBinAtStation(config, stationId, i)) continue;
		const st = getStationState(state, stationId);
		const catchProb = getDefectDiscoveryRateForStation(config, stationId);

		const outResult = applyQualityGateToItemIds(
			state,
			config,
			stationId,
			st.outputQueue,
			catchProb,
			events,
		);
		st.outputQueue = outResult.remaining;
		st.defectCount += outResult.caughtCount;

		const bufResult = applyQualityGateToItemIds(
			state,
			config,
			stationId,
			st.batchBuffer,
			catchProb,
			events,
		);
		st.batchBuffer = bufResult.remaining;
		st.defectCount += bufResult.caughtCount;
	}
}

function setAgentProgressFromTransfer(
	agent: AgentState,
	transfer: Transfer,
): void {
	const { phase, remainingTicks, phaseTicksTotal: total } = transfer;
	const returnPhase = phase === "return";
	const oneTickLeft = remainingTicks === 1;
	if (returnPhase && oneTickLeft) {
		agent.progress01 = 1;
		return;
	}
	if (returnPhase && total > 1) {
		agent.progress01 = (total - 1 - remainingTicks) / (total - 1);
		return;
	}
	if (oneTickLeft) {
		agent.progress01 = 1;
		return;
	}
	agent.progress01 = 1 - remainingTicks / total;
}

function executeOutboundPullTransfer(
	state: SimState,
	config: SimConfig,
	transfer: Transfer,
	travelTicks: number,
): void {
	const batchSize = transfer.pullBatchSize;
	if (batchSize == null) return;
	const sourceSt = getStationState(state, transfer.fromStationId);
	const order = getStationOrder(config);
	const fromIndex = order.indexOf(transfer.fromStationId);
	const taken: string[] = [];
	const fromBuffer = Math.min(batchSize, sourceSt.batchBuffer.length);
	for (let k = 0; k < fromBuffer; k++) {
		const id = sourceSt.batchBuffer.shift();
		if (id) taken.push(id);
	}
	const needFromOutput = batchSize - taken.length;
	if (needFromOutput > 0) {
		const redBin = hasRedBinAtStation(
			config,
			transfer.fromStationId,
			fromIndex,
		);
		const remainingOutput: string[] = [];
		for (const itemId of sourceSt.outputQueue) {
			if (taken.length >= batchSize) {
				remainingOutput.push(itemId);
				continue;
			}
			const item = state.items.get(itemId);
			if (redBin && item?.isDefective) {
				remainingOutput.push(itemId);
				continue;
			}
			taken.push(itemId);
		}
		sourceSt.outputQueue = remainingOutput;
	}
	transfer.itemIds = taken;
	transfer.phase = "return" as TransferPhase;
	transfer.phaseTicksTotal = travelTicks;
	transfer.remainingTicks = transfer.phaseTicksTotal;
}

function executeOutboundPushTransfer(
	state: SimState,
	_config: SimConfig,
	transfer: Transfer,
	travelTicks: number,
): void {
	const nextSt = getStationState(state, transfer.toStationId);
	for (const itemId of transfer.itemIds) {
		nextSt.inputQueue.push(itemId);
	}
	transfer.phase = "return" as TransferPhase;
	transfer.phaseTicksTotal = travelTicks;
	transfer.remainingTicks = transfer.phaseTicksTotal;
	transfer.itemIds = [];
}

function executeReturnPhase(
	state: SimState,
	transfer: Transfer,
	agent: AgentState | undefined,
	toDelete: string[],
): void {
	if (transfer.isPull) {
		const nextSt = getStationState(state, transfer.toStationId);
		for (const itemId of transfer.itemIds) {
			nextSt.inputQueue.push(itemId);
			const item = state.items.get(itemId);
			if (item) {
				item.stationId = transfer.toStationId;
				item.defectFromMarketChange = false;
			}
		}
	}
	if (agent) {
		agent.status = "idle";
		agent.fromStationId = null;
		agent.toStationId = null;
		agent.carryingTransferId = null;
		agent.progress01 = 0;
	}
	toDelete.push(transfer.id);
}

function createOrAdvanceTransfers(state: SimState, config: SimConfig): void {
	const toDelete: string[] = [];

	for (const transfer of state.transfers.values()) {
		transfer.remainingTicks -= 1;
		const agent = state.agents.get(transfer.agentId);
		if (transfer.remainingTicks > 0) {
			if (agent) setAgentProgressFromTransfer(agent, transfer);
			continue;
		}
		const travelTicks = getTravelTicksBetween(
			config,
			transfer.fromStationId,
			transfer.toStationId,
		);
		if (transfer.phase === "outbound") {
			if (transfer.isPull && transfer.pullBatchSize != null) {
				executeOutboundPullTransfer(state, config, transfer, travelTicks);
				if (agent) {
					agent.fromStationId = transfer.fromStationId;
					agent.toStationId = transfer.toStationId;
					agent.progress01 = 0;
				}
				continue;
			}
			executeOutboundPushTransfer(state, config, transfer, travelTicks);
			if (agent) agent.progress01 = 0;
			continue;
		}
		executeReturnPhase(state, transfer, agent, toDelete);
	}
	for (const id of toDelete) state.transfers.delete(id);
}

function handleManagerReworkAndon(
	state: SimState,
	config: SimConfig,
	stationId: string,
	item: Item,
	st: StationState,
	baseDefectProb: number,
	events: TickEvent[],
): void {
	const q = state.stationQuality.get(stationId);
	if (!q) return;
	q.lastAndonTick = state.tick;
	const floor = 0.02 / baseDefectProb;
	q.defectMultiplier = isJidokaStepOrLater(config)
		? Math.max(floor, (q.defectMultiplier ?? 1) * 0.95)
		: Math.max(0.1, (q.defectMultiplier ?? 1) * 0.95);
	q.pauseUntilTick = state.tick + MANAGER_ANDON_MAX_PAUSE_TICKS;
	item.status = "waiting";
	st.andonHoldItemId = item.id;
	state.pendingAndonStationIds.push(stationId);
	events.push({ type: "andonTriggered", stationId, itemId: item.id });
}

function handleAndonPause(
	state: SimState,
	config: SimConfig,
	stationId: string,
	itemId: string,
	baseDefectProb: number,
	events: TickEvent[],
): void {
	const q = state.stationQuality.get(stationId);
	if (!q) return;
	q.lastAndonTick = state.tick;
	if (!config.jidokaLineStop) {
		const floor = 0.02 / baseDefectProb;
		q.defectMultiplier = isJidokaStepOrLater(config)
			? Math.max(floor, (q.defectMultiplier ?? 1) * 0.95)
			: Math.max(0.1, (q.defectMultiplier ?? 1) * 0.95);
	}
	events.push({ type: "andonTriggered", stationId, itemId });
	if (config.jidokaLineStop) {
		triggerJidokaAtStation(state, config, stationId);
	}
	q.pauseUntilTick = state.tick + getAndonPauseTicks(config, stationId);
}

function handleDefectAtCompletion(
	state: SimState,
	config: SimConfig,
	stationId: string,
	_stationIndex: number,
	item: Item,
	st: StationState,
	stationConfig: StationConfig,
	baseDefectProb: number,
	wouldGoToRedBin: boolean,
	order: string[],
	events: TickEvent[],
): void {
	item.isDefective = true;
	st.defectCreatedCount = (st.defectCreatedCount ?? 0) + 1;
	events.push({ type: "defectCreated", stationId, itemId: item.id });

	if (stationConfig.andonEnabled && wouldGoToRedBin) {
		handleManagerReworkAndon(
			state,
			config,
			stationId,
			item,
			st,
			baseDefectProb,
			events,
		);
		return;
	}
	if (stationConfig.andonEnabled) {
		handleAndonPause(state, config, stationId, item.id, baseDefectProb, events);
	}
	if (wouldGoToRedBin) {
		if (isJidokaStepOrLater(config) && !stationConfig.andonEnabled) {
			const q = state.stationQuality.get(stationId);
			if (q) {
				const floor = 0.02 / baseDefectProb;
				q.defectMultiplier = Math.max(floor, (q.defectMultiplier ?? 1) * 0.95);
			}
		}
		item.status = "waiting";
		st.outputQueue.push(item.id);
		return;
	}
	const reworkSendsBack = stationConfig.reworkSendsBack ?? true;
	if (reworkSendsBack) {
		const idx = order.indexOf(stationId);
		if (idx > 0) {
			const prevId = order[idx - 1];
			const prevSt = getStationState(state, prevId);
			if (prevSt) {
				item.status = "waiting";
				item.stationId = prevId;
				item.remainingWorkMs = 0;
				item.isDefective = undefined;
				item.defectFromMarketChange = false;
				prevSt.inputQueue.push(item.id);
				return;
			}
		}
	}
	item.status = "waiting";
	st.batchBuffer.push(item.id);
}

function outboundCount(st: StationState): number {
	return st.batchBuffer.length + st.outputQueue.length;
}

function advanceWorkAndComplete(
	state: SimState,
	config: SimConfig,
	events: TickEvent[],
): void {
	let rng = state.rngState;
	const order = getStationOrder(config);
	const tickMs = getSimulationMsPerTick(config);

	for (let stationIndex = 0; stationIndex < order.length; stationIndex++) {
		const stationId = order[stationIndex];
		const st = getStationState(state, stationId);
		const stationConfig = getStationConfig(config, stationId);
		if (!stationConfig) continue;

		const quality = state.stationQuality.get(stationId);
		const defectMultiplier = quality?.defectMultiplier ?? 1;
		const wouldGoToRedBin = hasRedBinAtStation(config, stationId, stationIndex);

		const stillInProcess: InProcessSlot[] = [];
		for (const slot of st.inProcess) {
			const item = state.items.get(slot.itemId);
			if (!item) continue;
			const remaining = slot.remainingWorkMs - tickMs;
			if (remaining > 0) {
				stillInProcess.push({ ...slot, remainingWorkMs: remaining });
				continue;
			}
			const baseDefectProb =
				stationConfig.defectProbability * stationConfig.trainingEffectiveness;
			const defectProb = Math.min(1, baseDefectProb * defectMultiplier);
			const [isDefective, rng2] = R.chance(rng, defectProb);
			rng = rng2;
			if (isDefective) {
				handleDefectAtCompletion(
					state,
					config,
					stationId,
					stationIndex,
					item,
					st,
					stationConfig,
					baseDefectProb,
					wouldGoToRedBin,
					order,
					events,
				);
				continue;
			}
			item.status = "waiting";
			st.batchBuffer.push(item.id);
		}
		st.inProcess = stillInProcess;
	}
	state.rngState = rng;
}

/**
 * Defective + red bin at last: item stays in queue (red bin), no revenue, no defectShippedToCustomer.
 * Defective + no red bin: shipped to customer, defectShippedToCustomer event.
 * Good: completed, added to completedIds (revenue).
 */
function processItemAtLastStation(
	state: SimState,
	config: SimConfig,
	stationId: string,
	itemId: string,
	hasRedBinAtLast: boolean,
	_remaining: string[],
	events: TickEvent[],
): void {
	const item = state.items.get(itemId);
	if (!item) return;
	if (item.isDefective && hasRedBinAtLast) {
		triggerJidokaAtStation(state, config, stationId);
		const st = getStationState(state, stationId);
		st.defectCount += 1;
		return;
	}
	if (item.isDefective && !hasRedBinAtLast) {
		state.defectiveIds.push(itemId);
		state.lastDefectShippedTick = state.tick;
		events.push({ type: "defectShippedToCustomer", itemId });
		return;
	}
	item.status = "done";
	item.completedAtTick = state.tick;
	state.completedIds.push(itemId);
}

function moveOutputToNext(
	state: SimState,
	config: SimConfig,
	events: TickEvent[],
): void {
	const order = getStationOrder(config);
	const lastStationId = order[order.length - 1];
	const hasRedBinAtLast = hasRedBinAtStation(
		config,
		lastStationId,
		order.length - 1,
	);

	for (let i = 0; i < order.length; i++) {
		const stationId = order[i];
		const st = getStationState(state, stationId);
		const stationConfig = getStationConfig(config, stationId);
		if (!stationConfig) continue;
		const batchSize = Math.max(1, stationConfig.batchSize);
		const isLast = i === order.length - 1;
		const nextId = isLast ? null : order[i + 1];
		const nextSt = nextId ? getStationState(state, nextId) : null;
		const nextConfig = nextId ? getStationConfig(config, nextId) : null;
		const travelTicks =
			nextId != null ? getTravelTicksBetween(config, stationId, nextId) : 0;
		const useTravel = travelTicks > 0 && nextId != null && !isLast;

		const remaining: string[] = [];
		const forwardable: string[] = [];
		for (const itemId of st.outputQueue) {
			const item = state.items.get(itemId);
			if (!item) continue;
			if (item.isDefective && hasRedBinAtStation(config, stationId, i)) {
				forwardable.push(itemId);
				continue;
			}
			if (isLast) {
				processItemAtLastStation(
					state,
					config,
					stationId,
					itemId,
					hasRedBinAtLast,
					remaining,
					events,
				);
				continue;
			}
			if (!nextSt || !nextConfig || !nextId) {
				remaining.push(itemId);
				continue;
			}
			forwardable.push(itemId);
		}

		const sendableCount = st.batchBuffer.length + forwardable.length;

		if (isLast && sendableCount > 0) {
			const takeFromBuffer = Math.min(sendableCount, st.batchBuffer.length);
			const takeFromForwardable = sendableCount - takeFromBuffer;
			const bufferPart = st.batchBuffer.splice(0, takeFromBuffer);
			const forwardablePart = forwardable.splice(0, takeFromForwardable);
			const batch = [...bufferPart, ...forwardablePart];
			for (const itemId of batch) {
				processItemAtLastStation(
					state,
					config,
					stationId,
					itemId,
					hasRedBinAtLast,
					remaining,
					events,
				);
			}
		}

		if (
			config.pushOrPull === "pull" &&
			useTravel &&
			nextSt != null &&
			nextConfig != null &&
			nextId != null &&
			sendableCount > 0
		) {
			const downstreamNeedsWork = nextSt.inputQueue.length === 0;
			const pullBatchSize = Math.min(sendableCount, batchSize);
			const agentFree = !isAgentAway(state, nextId);
			const downstreamStationIdle = nextSt.inProcess.length === 0;
			const wouldCreate =
				downstreamNeedsWork &&
				pullBatchSize > 0 &&
				agentFree &&
				downstreamStationIdle;
			if (wouldCreate) {
				createTransfer(state, config, stationId, nextId, [], pullBatchSize);
			}
		}

		const pullNoTravel =
			config.pushOrPull === "pull" &&
			!useTravel &&
			nextSt != null &&
			nextConfig != null &&
			nextId != null &&
			sendableCount > 0;
		if (
			pullNoTravel &&
			nextSt != null &&
			nextConfig != null &&
			nextId != null
		) {
			const downstreamNeedsWork = nextSt.inputQueue.length === 0;
			const toMove = Math.min(sendableCount, batchSize);
			if (downstreamNeedsWork && toMove > 0) {
				const takeFromBuffer = Math.min(toMove, st.batchBuffer.length);
				const takeFromForwardable = toMove - takeFromBuffer;
				const bufferPart = st.batchBuffer.splice(0, takeFromBuffer);
				const forwardablePart = forwardable.splice(0, takeFromForwardable);
				const batch = [...bufferPart, ...forwardablePart];
				for (const itemId of batch) {
					const item = state.items.get(itemId);
					if (item) {
						item.stationId = nextId;
						item.defectFromMarketChange = false;
					}
					nextSt.inputQueue.push(itemId);
				}
			}
		}

		const pullAlreadyMoved = pullNoTravel;
		const lastAlreadyCompleted = isLast && sendableCount > 0;
		const shouldSendBatch =
			sendableCount >= batchSize &&
			!pullAlreadyMoved &&
			!lastAlreadyCompleted &&
			(isLast || (nextSt && nextConfig && nextId));
		if (!shouldSendBatch) {
			remaining.push(...forwardable);
			st.outputQueue = remaining;
			continue;
		}
		const takeFromBuffer = Math.min(batchSize, st.batchBuffer.length);
		const takeFromForwardable = batchSize - takeFromBuffer;
		const bufferPart = st.batchBuffer.splice(0, takeFromBuffer);
		const forwardablePart = forwardable.splice(0, takeFromForwardable);
		const batch = [...bufferPart, ...forwardablePart];

		if (isLast) {
			for (const itemId of batch) {
				processItemAtLastStation(
					state,
					config,
					stationId,
					itemId,
					hasRedBinAtLast,
					remaining,
					events,
				);
			}
			remaining.push(...forwardable);
			st.outputQueue = remaining;
			continue;
		}
		if (!nextSt || !nextConfig || !nextId) {
			st.batchBuffer.unshift(...bufferPart);
			forwardable.unshift(...forwardablePart);
			remaining.push(...forwardable);
			st.outputQueue = remaining;
			continue;
		}
		const agentFree =
			config.pushOrPull === "pull"
				? !isAgentAway(state, nextId)
				: !isAgentAway(state, stationId);
		const pullBatchSize = batchSize;
		const sendingStationIdle = st.inProcess.length === 0;
		const canSendBatch =
			(!useTravel || agentFree) &&
			(config.pushOrPull !== "push" || !useTravel || sendingStationIdle);
		if (!canSendBatch) {
			st.batchBuffer.unshift(...bufferPart);
			forwardable.unshift(...forwardablePart);
			remaining.push(...forwardable);
			st.outputQueue = remaining;
			continue;
		}
		if (useTravel && config.pushOrPull === "pull") {
			st.batchBuffer.unshift(...bufferPart);
			forwardable.unshift(...forwardablePart);
		}
		if (useTravel && config.pushOrPull === "push") {
			createTransfer(state, config, stationId, nextId, batch);
		}
		if (!useTravel) {
			for (const itemId of batch) {
				const item = state.items.get(itemId);
				if (item) {
					item.stationId = nextId;
					item.defectFromMarketChange = false;
				}
				nextSt.inputQueue.push(itemId);
			}
		}
		remaining.push(...forwardable);
		st.outputQueue = remaining;
	}
}

function createTransfer(
	state: SimState,
	config: SimConfig,
	fromStationId: string,
	toStationId: string,
	itemIds: string[],
	pullBatchSize?: number,
): void {
	const travelTicks = getTravelTicksBetween(config, fromStationId, toStationId);
	if (travelTicks <= 0) return;
	const isPull =
		config.pushOrPull === "pull" &&
		itemIds.length === 0 &&
		pullBatchSize != null &&
		pullBatchSize > 0;
	const agentId = isPull ? `agent-${toStationId}` : `agent-${fromStationId}`;
	let agent = state.agents.get(agentId);
	if (!agent) {
		agent = {
			id: agentId,
			status: "idle",
			fromStationId: null,
			toStationId: null,
			carryingTransferId: null,
			progress01: 0,
		};
		state.agents.set(agentId, agent);
	}
	if (agent.status === "walking") return;
	const fromDept = getStationDepartment(config, fromStationId);
	const toDept = getStationDepartment(config, toStationId);
	const crossDepartment =
		fromDept != null && toDept != null && fromDept !== toDept;
	const phaseTicksTotal = travelTicks;
	const transferId = `transfer-${state.nextTransferId}`;
	state.nextTransferId += 1;
	const transfer: Transfer = {
		id: transferId,
		itemIds: [...itemIds],
		fromStationId,
		toStationId,
		remainingTicks: phaseTicksTotal,
		phaseTicksTotal,
		phase: "outbound",
		agentId,
		crossDepartment,
		...(isPull && { isPull: true, pullBatchSize }),
	};
	state.transfers.set(transferId, transfer);
	agent.status = "walking";
	if (isPull) {
		agent.fromStationId = toStationId;
		agent.toStationId = fromStationId;
	}
	if (!isPull) {
		agent.fromStationId = fromStationId;
		agent.toStationId = toStationId;
	}
	agent.carryingTransferId = transferId;
	agent.progress01 = 0;
	if (!isPull) {
		for (const itemId of itemIds) {
			const item = state.items.get(itemId);
			if (item) {
				item.stationId = toStationId;
				item.defectFromMarketChange = false;
			}
		}
	}
}

function canStartDownstream(): boolean {
	return true;
}

function startWork(state: SimState, config: SimConfig): void {
	let rng = state.rngState;
	const order = getStationOrder(config);

	for (let i = 0; i < order.length; i++) {
		const stationId = order[i];
		const st = getStationState(state, stationId);
		const stationConfig = getStationConfig(config, stationId);
		if (!stationConfig) continue;
		if (isStationPaused(state, stationId)) continue;
		const stationTravelTicks = stationConfig.travelTicks ?? 0;
		if (stationTravelTicks > 0 && isAgentAway(state, stationId)) continue;
		if (config.pushOrPull === "pull" && !canStartDownstream()) {
			continue;
		}
		const batchSize = stationConfig.batchSize;
		const outputFull =
			config.pushOrPull === "pull" && outboundCount(st) >= batchSize;
		if (outputFull) {
			continue;
		}
		const capacity = stationConfig.capacity - st.inProcess.length;
		if (capacity <= 0) continue;

		let taken = 0;
		const newInputQueue: string[] = [];
		for (const itemId of st.inputQueue) {
			if (taken >= capacity) {
				newInputQueue.push(itemId);
				continue;
			}
			const item = state.items.get(itemId);
			if (!item) continue;
			const [workMs, rng2] = R.sampleCycleTime(
				rng,
				stationConfig.cycleTime,
				stationConfig.cycleVariance,
			);
			rng = rng2;
			item.status = "working";
			item.remainingWorkMs = workMs;
			st.inProcess.push({ itemId, remainingWorkMs: workMs });
			taken += 1;
		}
		st.inputQueue = newInputQueue;
	}
	state.rngState = rng;
}

function isFirstStationReadyToWork(
	state: SimState,
	config: SimConfig,
	firstId: string,
): boolean {
	const firstSt = getStationState(state, firstId);
	const firstConfig = getStationConfig(config, firstId);
	if (!firstConfig) return false;
	if (isStationPaused(state, firstId)) return false;
	const firstTravelTicks = firstConfig.travelTicks ?? 0;
	if (firstTravelTicks > 0 && isAgentAway(state, firstId)) return false;
	if (config.pushOrPull === "pull" && !canStartDownstream()) return false;
	const batchSize = firstConfig.batchSize;
	const outputFull =
		config.pushOrPull === "pull" && outboundCount(firstSt) >= batchSize;
	if (outputFull) return false;
	const capacity = firstConfig.capacity - firstSt.inProcess.length;
	if (capacity <= 0) return false;
	return true;
}

function tryArrivals(
	state: SimState,
	config: SimConfig,
	events: TickEvent[],
): void {
	const order = getStationOrder(config);
	const firstId = order[0];
	const firstSt = getStationState(state, firstId);
	const firstConfig = getStationConfig(config, firstId);
	if (!firstConfig) return;
	if (!isFirstStationReadyToWork(state, config, firstId)) return;

	const batchSize = firstConfig.batchSize;
	const toAdd = batchSize;

	for (let i = 0; i < toAdd; i++) {
		const item = createItem(state, firstId);
		firstSt.inputQueue.push(item.id);
		events.push({ type: "materialConsumed", itemId: item.id });
	}
}

function processManager(
	state: SimState,
	config: SimConfig,
	events: TickEvent[],
): void {
	const jidokaActive =
		state.jidokaUntilTick != null && state.tick < state.jidokaUntilTick;
	if (jidokaActive && state.jidokaStationId != null) {
		state.managerToStationId = state.jidokaStationId;
		state.managerArrivesAtTick = state.tick;
		return;
	}

	const managerReadyToResolve =
		state.managerResolvesAtTick != null &&
		state.tick >= state.managerResolvesAtTick &&
		state.managerToStationId != null;
	if (managerReadyToResolve && state.managerToStationId != null) {
		const stationId = state.managerToStationId;
		const st = getStationState(state, stationId);
		const itemId = st.andonHoldItemId;
		const item = itemId ? state.items.get(itemId) : undefined;
		if (itemId && item) {
			const revertProb = config.managerReworkProbability ?? 0.6;
			const [reverted, rng2] = R.chance(state.rngState, revertProb);
			state.rngState = rng2;
			if (reverted) {
				item.isDefective = false;
				st.batchBuffer.push(itemId);
				events.push({ type: "managerReverted", stationId, itemId });
				const q = state.stationQuality.get(stationId);
				if (q) q.pauseUntilTick = undefined;
			}
			if (!reverted) {
				st.defectCount += 1;
				const q = state.stationQuality.get(stationId);
				if (q) {
					q.pauseUntilTick = state.tick + getAndonPauseTicks(config, stationId);
				}
				if (config.jidokaLineStop && isJidokaStepOrLater(config)) {
					triggerJidokaAtStation(state, config, stationId);
				}
				events.push({ type: "managerRejected", stationId, itemId });
			}
		}
		st.andonHoldItemId = null;
		state.managerFromStationId = stationId;
		state.managerToStationId = null;
		state.managerArrivesAtTick = null;
		state.managerResolvesAtTick = null;
	}

	const managerJustArrived =
		state.managerResolvesAtTick == null &&
		state.managerArrivesAtTick != null &&
		state.tick >= state.managerArrivesAtTick &&
		state.managerToStationId != null;
	if (managerJustArrived && state.managerToStationId != null) {
		state.managerResolvesAtTick =
			state.tick + getAndonPauseTicks(config, state.managerToStationId);
	}

	const shouldDispatchManager =
		state.managerArrivesAtTick == null &&
		state.managerResolvesAtTick == null &&
		state.pendingAndonStationIds.length > 0;
	if (shouldDispatchManager) {
		const nextStationId = state.pendingAndonStationIds.shift();
		if (nextStationId == null) return;
		state.managerToStationId = nextStationId;
		state.managerArrivesAtTick = state.tick + 1;
	}
}

function clearJidokaPauseAndSendAgentsHome(state: SimState): void {
	for (const sq of state.stationQuality.values()) {
		sq.pauseUntilTick = undefined;
	}
	for (const agent of state.agents.values()) {
		const homeStationId = agent.id.replace(/^agent-/, "");
		agent.fromStationId = homeStationId;
		agent.toStationId = homeStationId;
		agent.progress01 = 1;
		agent.status = "idle";
		agent.carryingTransferId = null;
	}
}

function handleJidokaState(state: SimState, config: SimConfig): void {
	if (state.jidokaUntilTick == null) return;
	if (state.tick < state.jidokaUntilTick) {
		if (state.jidokaStationId == null) return;
		for (const agent of state.agents.values()) {
			agent.fromStationId = state.jidokaStationId;
			agent.toStationId = state.jidokaStationId;
			agent.progress01 = 1;
		}
		return;
	}
	const stationId = state.jidokaStationId;
	state.jidokaUntilTick = undefined;
	state.jidokaStationId = undefined;
	if (stationId != null) {
		moveStationDefectsToRedBin(state, config, stationId);
		state.managerFromStationId = stationId;
		state.managerToStationId = null;
		state.managerArrivesAtTick = null;
		state.managerResolvesAtTick = null;
	}
	clearJidokaPauseAndSendAgentsHome(state);
}

export function tick(
	state: SimState,
	config: SimConfig,
	inputs: TickInputs = {},
): TickResult {
	const next = cloneState(state);
	next.tick = state.tick + 1;
	const events: TickEvent[] = [];

	handleJidokaState(next, config);
	const jidokaActive =
		next.jidokaUntilTick != null && next.tick < next.jidokaUntilTick;
	applyMarketChangeIfDueOrTriggered(next, config, inputs, events);
	advanceWorkAndComplete(next, config, events);
	processManager(next, config, events);
	handleQualityGates(next, config, events);
	if (!jidokaActive) {
		createOrAdvanceTransfers(next, config);
	}
	moveOutputToNext(next, config, events);
	startWork(next, config);
	tryArrivals(next, config, events);

	return { state: next, events };
}
