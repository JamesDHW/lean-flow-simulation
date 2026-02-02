import type { SimConfig, SimState } from "./types";

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
	return state.completedIds.length - lastTickCompleted;
}

export function getLeadTimeAvg(state: SimState, config: SimConfig): number {
	const completed = state.completedIds
		.map((id) => state.items.get(id))
		.filter(
			(item): item is NonNullable<typeof item> =>
				item != null && item.completedAtTick != null,
		);
	if (completed.length === 0) return 0;
	const sum = completed.reduce(
		(acc, item) =>
			acc + ((item.completedAtTick ?? 0) - item.createdAtTick) * config.tickMs,
		0,
	);
	return sum / completed.length;
}

export function getDefectsCount(state: SimState): number {
	return state.defectiveIds.length;
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
	const completed = state.completedIds.length;
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
		const baseDefectProb =
			sc.defectProbability ??
			config.defectProbability * config.trainingEffectiveness;
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
	return state.defectiveIds.length - previousDefectCount;
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
		if (st.inputQueue.length >= sc.bufferBefore) blocked += 1;
	}
	const idlePercent =
		totalCapacity > 0 ? ((totalCapacity - inProcess) / totalCapacity) * 100 : 0;
	const blockedPercent =
		config.stations.length > 0 ? (blocked / config.stations.length) * 100 : 0;
	return { idlePercent, blockedPercent };
}
