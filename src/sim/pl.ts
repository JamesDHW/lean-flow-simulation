import { getWip, getWipForInventoryCost } from "./metrics";
import type {
	CumulativePl,
	SimConfig,
	SimState,
	TickEvent,
	TickPl,
} from "./types";

/**
 * Material cost: charged once per item when it enters the line (materialConsumed events only).
 * Red-bin stock: excluded from inventory holding cost (getWipForInventoryCost); never contributes to revenue or defect-shipped cost.
 */
export function computeTickPl(
	state: SimState,
	config: SimConfig,
	completedLastTick: number,
	events: TickEvent[],
): TickPl {
	const totalCompleted = state.totalCompletedCount ?? state.completedIds.length;
	const completedThisTick = totalCompleted - completedLastTick;
	const revenue = completedThisTick * config.revenuePerItem;
	const laborTicks = config.stations.reduce((sum, s) => sum + s.capacity, 0);
	const laborCost = laborTicks * config.laborCostPerTickPerEmployee;
	const wip = getWip(state);
	const wipForInventory = getWipForInventoryCost(state, config);
	const inventoryCost = wipForInventory * config.inventoryCostPerItemPerTick;
	let materialUnits = 0;
	let defectCount = 0;
	for (const e of events) {
		if (e.type === "materialConsumed") materialUnits += 1;
		if (e.type === "defectShippedToCustomer") defectCount += 1;
	}
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
	base?: CumulativePl | null,
): CumulativePl[] {
	const result: CumulativePl[] = [];
	let cr = base?.cumulativeRevenue ?? 0;
	let cl = base?.cumulativeLaborCost ?? 0;
	let ci = base?.cumulativeInventoryCost ?? 0;
	let cm = base?.cumulativeMaterialCost ?? 0;
	let cmu = base?.cumulativeMaterialUnits ?? 0;
	let cd = base?.cumulativeDefectCost ?? 0;
	let cp = base != null ? base.cumulativeProfit : initialInvestment;
	let cCompleted = base?.cumulativeCompleted ?? 0;
	let cLaborTicks = base?.cumulativeLaborTicks ?? 0;
	let cWipSum = base?.cumulativeWipSum ?? 0;
	let cDefects = base?.cumulativeDefects ?? 0;
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

export function addTickPlToCumulative(
	prev: CumulativePl | null,
	tickPl: TickPl,
	initialInvestment: number,
): CumulativePl {
	const base = prev ?? {
		tick: 0,
		cumulativeRevenue: 0,
		cumulativeLaborCost: 0,
		cumulativeInventoryCost: 0,
		cumulativeMaterialCost: 0,
		cumulativeMaterialUnits: 0,
		cumulativeDefectCost: 0,
		cumulativeProfit: initialInvestment,
		cumulativeCompleted: 0,
		cumulativeLaborTicks: 0,
		cumulativeWipSum: 0,
		cumulativeDefects: 0,
	};
	return {
		tick: tickPl.tick,
		cumulativeRevenue: base.cumulativeRevenue + tickPl.revenue,
		cumulativeLaborCost: base.cumulativeLaborCost + tickPl.laborCost,
		cumulativeInventoryCost: base.cumulativeInventoryCost + tickPl.inventoryCost,
		cumulativeMaterialCost: base.cumulativeMaterialCost + tickPl.materialCost,
		cumulativeMaterialUnits: base.cumulativeMaterialUnits + tickPl.materialUnits,
		cumulativeDefectCost: base.cumulativeDefectCost + tickPl.defectCost,
		cumulativeProfit: base.cumulativeProfit + tickPl.profit,
		cumulativeCompleted: base.cumulativeCompleted + tickPl.completedCount,
		cumulativeLaborTicks: base.cumulativeLaborTicks + tickPl.laborTicks,
		cumulativeWipSum: base.cumulativeWipSum + tickPl.wip,
		cumulativeDefects: base.cumulativeDefects + tickPl.defectCount,
	};
}
