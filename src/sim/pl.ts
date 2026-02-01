import type { SimConfig, SimState, TickPl, CumulativePl } from "./types"
import { getWip } from "./metrics"

export function computeTickPl(
	state: SimState,
	config: SimConfig,
	completedLastTick: number,
	defectsLastTick: number,
): TickPl {
	const completedThisTick = state.completedIds.length - completedLastTick
	const revenue = completedThisTick * config.revenuePerItem
	const laborCost =
		config.stations.reduce((sum, s) => sum + s.capacity, 0) *
		config.laborCostPerTickPerEmployee
	const wip = getWip(state)
	const inventoryCost = wip * config.inventoryCostPerItemPerTick
	const defectCost = defectsLastTick * config.defectCostPerItem
	const profit = revenue - laborCost - inventoryCost - defectCost
	return {
		tick: state.tick,
		revenue,
		laborCost,
		inventoryCost,
		defectCost,
		profit,
	}
}

export function computeCumulativePl(tickPlHistory: TickPl[]): CumulativePl[] {
	const result: CumulativePl[] = []
	let cr = 0
	let cl = 0
	let ci = 0
	let cd = 0
	let cp = 0
	for (const row of tickPlHistory) {
		cr += row.revenue
		cl += row.laborCost
		ci += row.inventoryCost
		cd += row.defectCost
		cp += row.profit
		result.push({
			tick: row.tick,
			cumulativeRevenue: cr,
			cumulativeLaborCost: cl,
			cumulativeInventoryCost: ci,
			cumulativeDefectCost: cd,
			cumulativeProfit: cp,
		})
	}
	return result
}
