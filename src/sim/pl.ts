import { getWip } from "./metrics";
import type {
	CumulativePl,
	SimConfig,
	SimState,
	TickEvent,
	TickPl,
} from "./types";

export function computeTickPl(
	state: SimState,
	config: SimConfig,
	completedLastTick: number,
	events: TickEvent[],
): TickPl {
	const completedThisTick = state.completedIds.length - completedLastTick;
	const revenue = completedThisTick * config.revenuePerItem;
	const laborTicks = config.stations.reduce((sum, s) => sum + s.capacity, 0);
	const laborCost = laborTicks * config.laborCostPerTickPerEmployee;
	const wip = getWip(state);
	const inventoryCost = wip * config.inventoryCostPerItemPerTick;
	let defectCaughtCount = 0;
	let defectCount = 0;
	for (const e of events) {
		if (e.type === "defectCaught") defectCaughtCount += 1;
		if (e.type === "defectShippedToCustomer") defectCount += 1;
	}
	const materialUnits = completedThisTick + defectCaughtCount + defectCount;
	const materialCost = materialUnits * config.materialCostPerItem;
	const defectCost = defectCount * config.defectCostCustomerShipped;
	const profit =
		revenue - laborCost - inventoryCost - materialCost - defectCost;
	return {
		tick: state.tick,
		revenue,
		laborCost,
		inventoryCost,
		materialCost,
		materialUnits,
		defectCost,
		profit,
		completedCount: completedThisTick,
		laborTicks,
		wip,
		defectCount,
	};
}

export function computeCumulativePl(
	tickPlHistory: TickPl[],
	initialInvestment: number,
): CumulativePl[] {
	const result: CumulativePl[] = [];
	let cr = 0;
	let cl = 0;
	let ci = 0;
	let cm = 0;
	let cmu = 0;
	let cd = 0;
	let cp = initialInvestment;
	let cCompleted = 0;
	let cLaborTicks = 0;
	let cWipSum = 0;
	let cDefects = 0;
	for (const row of tickPlHistory) {
		cr += row.revenue;
		cl += row.laborCost;
		ci += row.inventoryCost;
		cm += row.materialCost;
		cmu += row.materialUnits;
		cd += row.defectCost;
		cp += row.profit;
		cCompleted += row.completedCount;
		cLaborTicks += row.laborTicks;
		cWipSum += row.wip;
		cDefects += row.defectCount;
		result.push({
			tick: row.tick,
			cumulativeRevenue: cr,
			cumulativeLaborCost: cl,
			cumulativeInventoryCost: ci,
			cumulativeMaterialCost: cm,
			cumulativeMaterialUnits: cmu,
			cumulativeDefectCost: cd,
			cumulativeProfit: cp,
			cumulativeCompleted: cCompleted,
			cumulativeLaborTicks: cLaborTicks,
			cumulativeWipSum: cWipSum,
			cumulativeDefects: cDefects,
		});
	}
	return result;
}
