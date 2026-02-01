import { useSimSnapshot } from "../SimProvider"

export function ProfitTable() {
	const tickPlHistory = useSimSnapshot((s) => s.tickPlHistory)
	const cumulativePl = useSimSnapshot((s) => s.cumulativePl)
	const lastTick = tickPlHistory[tickPlHistory.length - 1]
	const lastCum = cumulativePl[cumulativePl.length - 1]

	return (
		<div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
			<h3 className="text-sm font-semibold text-slate-200 mb-2">P/L</h3>
			{lastTick && lastCum != null ? (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-slate-600">
								<th className="text-left text-slate-400 font-medium py-1 pr-3" />
								<th className="text-right text-slate-400 font-medium py-1 tabular-nums">
									Last tick
								</th>
								<th className="text-right text-slate-400 font-medium py-1 tabular-nums">
									Cumulative
								</th>
							</tr>
						</thead>
						<tbody className="text-slate-100">
							<tr className="border-b border-slate-700/80">
								<td className="py-1 pr-3 text-slate-400">Revenue</td>
								<td className="text-right tabular-nums py-1">
									{lastTick.revenue.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1">
									{lastCum.cumulativeRevenue.toFixed(0)}
								</td>
							</tr>
							<tr className="border-b border-slate-700/80">
								<td className="py-1 pr-3 text-slate-400">Labor</td>
								<td className="text-right text-red-300 tabular-nums py-1">
									-{lastTick.laborCost.toFixed(0)}
								</td>
								<td className="text-right text-red-300 tabular-nums py-1">
									-{lastCum.cumulativeLaborCost.toFixed(0)}
								</td>
							</tr>
							<tr className="border-b border-slate-700/80">
								<td className="py-1 pr-3 text-slate-400">Inventory</td>
								<td className="text-right text-red-300 tabular-nums py-1">
									-{lastTick.inventoryCost.toFixed(0)}
								</td>
								<td className="text-right text-red-300 tabular-nums py-1">
									-{lastCum.cumulativeInventoryCost.toFixed(0)}
								</td>
							</tr>
							<tr className="border-b border-slate-700/80">
								<td className="py-1 pr-3 text-slate-400">Defect</td>
								<td className="text-right text-red-300 tabular-nums py-1">
									-{lastTick.defectCost.toFixed(0)}
								</td>
								<td className="text-right text-red-300 tabular-nums py-1">
									-{lastCum.cumulativeDefectCost.toFixed(0)}
								</td>
							</tr>
							<tr>
								<td className="py-1 pr-3 text-slate-400 font-medium">Profit</td>
								<td
									className={`text-right tabular-nums font-medium py-1 ${
										lastTick.profit >= 0 ? "text-emerald-400" : "text-red-400"
									}`}
								>
									{lastTick.profit >= 0 ? "" : "-"}
									{Math.abs(lastTick.profit).toFixed(0)}
								</td>
								<td
									className={`text-right tabular-nums font-medium py-1 ${
										lastCum.cumulativeProfit >= 0
											? "text-emerald-400"
											: "text-red-400"
									}`}
								>
									{lastCum.cumulativeProfit >= 0 ? "" : "-"}
									{Math.abs(lastCum.cumulativeProfit).toFixed(0)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-slate-500 text-sm">Run simulation to see P/L</p>
			)}
		</div>
	)
}
