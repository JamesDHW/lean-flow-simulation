import { getSimulationMsPerTick, type SimConfig, type SimState } from "./types";

export function getWip(state: SimState): number {
	let n = 0;
	for (const st of state.stationStates.values()) {
		n +=
			st.inputQueue.length +
			st.inProcess.length +
			st.batchBuffer.length +
			st.outputQueue.length;
	}
	return n;
}

function hasRedBinAtStation(config: SimConfig, stationIndex: number): boolean {
	const station = config.stations[stationIndex];
	const isLast = stationIndex === config.stations.length - 1;
	return station?.redBin ?? isLast;
}

/**
 * WIP count excluding items in red bins (defective at stations with a red bin).
 * Use for inventory holding cost so red-bin stock is not charged.
 */
export function getWipExcludingRedBin(
	state: SimState,
	config: SimConfig,
): number {
	const order = config.stations.map((s) => s.id);
	let n = 0;
	for (let i = 0; i < order.length; i++) {
		const stationId = order[i];
		const st = state.stationStates.get(stationId);
		if (!st) continue;
		const excludeDefectives = hasRedBinAtStation(config, i);
		const itemIds = [
			...st.inputQueue,
			...st.inProcess.map((s) => s.itemId),
			...st.batchBuffer,
			...st.outputQueue,
		];
		for (const itemId of itemIds) {
			const item = state.items.get(itemId);
			if (excludeDefectives && item?.isDefective === true) continue;
			n += 1;
		}
	}
	for (const t of state.transfers.values()) {
		const fromIndex = order.indexOf(t.fromStationId);
		const excludeDefectives =
			fromIndex >= 0 && hasRedBinAtStation(config, fromIndex);
		for (const itemId of t.itemIds) {
			const item = state.items.get(itemId);
			if (excludeDefectives && item?.isDefective === true) continue;
			n += 1;
		}
	}
	return n;
}

export function getWipForInventoryCost(
	state: SimState,
	config: SimConfig,
): number {
	return getWipExcludingRedBin(state, config);
}

export function getStationWip(state: SimState, stationId: string): number {
	const st = state.stationStates.get(stationId);
	if (!st) return 0;
	return (
		st.inputQueue.length +
		st.inProcess.length +
		st.batchBuffer.length +
		st.outputQueue.length
	);
}

export function getThroughput(
	state: SimState,
	lastTickCompleted: number,
): number {
	const total = state.totalCompletedCount ?? state.completedIds.length;
	return total - lastTickCompleted;
}

export function getLeadTimeAvg(state: SimState, config: SimConfig): number {
	const completed = state.completedIds
		.map((id) => state.items.get(id))
		.filter(
			(item): item is NonNullable<typeof item> =>
				item != null && item.completedAtTick != null,
		);
	if (completed.length === 0) return 0;
	const simMsPerTick = getSimulationMsPerTick(config);
	const sum = completed.reduce(
		(acc, item) =>
			acc + ((item.completedAtTick ?? 0) - item.createdAtTick) * simMsPerTick,
		0,
	);
	return sum / completed.length;
}

export function getDefectsCount(state: SimState): number {
	return state.totalDefectiveCount ?? state.defectiveIds.length;
}

export function getMeasuredDefectPercent(state: SimState): number {
	const { totalOutcomes, totalRejected } = getDefectRateDenominators(state);
	if (totalOutcomes === 0) return 0;
	return (totalRejected / totalOutcomes) * 100;
}

function getDefectRateDenominators(state: SimState): {
	totalRejected: number;
	totalOutcomes: number;
} {
	let totalRejected = state.rejectedAtEndCount ?? 0;
	for (const st of state.stationStates.values()) {
		totalRejected += st.defectCount;
	}
	const completed = state.totalCompletedCount ?? state.completedIds.length;
	const totalOutcomes = completed + totalRejected;
	return { totalRejected, totalOutcomes };
}

export function getMeasuredDefectPercentByStation(
	state: SimState,
): Record<string, number> {
	const { totalOutcomes } = getDefectRateDenominators(state);
	const byStation: Record<string, number> = {};
	if (totalOutcomes === 0) {
		for (const stationId of state.stationStates.keys()) {
			byStation[stationId] = 0;
		}
		return byStation;
	}
	for (const [stationId, st] of state.stationStates) {
		const created = st.defectCreatedCount ?? 0;
		byStation[stationId] = (created / totalOutcomes) * 100;
	}
	return byStation;
}

export function getDefectProbabilityPercentByStation(
	state: SimState,
	config: SimConfig,
): Record<string, number> {
	const byStation: Record<string, number> = {};
	for (const sc of config.stations) {
		const baseDefectProb = sc.defectProbability * sc.trainingEffectiveness;
		const defectMultiplier =
			state.stationQuality.get(sc.id)?.defectMultiplier ?? 1;
		const prob = Math.min(1, baseDefectProb * defectMultiplier);
		byStation[sc.id] = prob * 100;
	}
	return byStation;
}

export function getDefectsThisTick(
	state: SimState,
	previousDefectCount: number,
): number {
	return (
		(state.totalDefectiveCount ?? state.defectiveIds.length) -
		previousDefectCount
	);
}

export function getIdleBlockedPercent(
	state: SimState,
	config: SimConfig,
): { idlePercent: number; blockedPercent: number } {
	let totalCapacity = 0;
	let inProcess = 0;
	let blocked = 0;
	for (const sc of config.stations) {
		const st = state.stationStates.get(sc.id);
		if (!st) continue;
		totalCapacity += sc.capacity;
		inProcess += st.inProcess.length;
		const batchSize = sc.batchSize;
		const outbound = st.batchBuffer.length + st.outputQueue.length;
		if (config.pushOrPull === "pull" && outbound >= batchSize) blocked += 1;
	}
	const idlePercent =
		totalCapacity > 0 ? ((totalCapacity - inProcess) / totalCapacity) * 100 : 0;
	const blockedPercent =
		config.stations.length > 0 ? (blocked / config.stations.length) * 100 : 0;
	return { idlePercent, blockedPercent };
}
