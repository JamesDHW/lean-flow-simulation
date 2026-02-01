import { useSimSnapshot } from "../SimProvider"

export function ProfitTable() {
	const tickPlHistory = useSimSnapshot((s) => s.tickPlHistory)
	const cumulativePl = useSimSnapshot((s) => s.cumulativePl)
	const lastTick = tickPlHistory[tickPlHistory.length - 1]
	const lastCum = cumulativePl[cumulativePl.length - 1]

	return (
		<div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
			<h3 className="text-sm font-semibold text-slate-200 mb-2">P/L</h3>
			<div className="space-y-2 text-sm">
				{lastTick ? (
					<>
						<p className="text-slate-400 font-medium">Last tick</p>
						<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
							<dt className="text-slate-400">Revenue</dt>
							<dd className="text-slate-100 tabular-nums">
								{lastTick.revenue.toFixed(0)}
							</dd>
							<dt className="text-slate-400">Labor</dt>
							<dd className="text-red-300 tabular-nums">
								-{lastTick.laborCost.toFixed(0)}
							</dd>
							<dt className="text-slate-400">Inventory</dt>
							<dd className="text-red-300 tabular-nums">
								-{lastTick.inventoryCost.toFixed(0)}
							</dd>
							<dt className="text-slate-400">Defect</dt>
							<dd className="text-red-300 tabular-nums">
								-{lastTick.defectCost.toFixed(0)}
							</dd>
							<dt className="text-slate-400 font-medium">Profit</dt>
							<dd
								className={`tabular-nums font-medium ${
									lastTick.profit >= 0 ? "text-emerald-400" : "text-red-400"
								}`}
							>
								{lastTick.profit >= 0 ? "" : "-"}
								{Math.abs(lastTick.profit).toFixed(0)}
							</dd>
						</dl>
					</>
				) : (
					<p className="text-slate-500">Run simulation to see P/L</p>
				)}
				{lastCum != null && (
					<>
						<p className="text-slate-400 font-medium mt-2">Cumulative profit</p>
						<p
							className={`text-lg font-semibold tabular-nums ${
								lastCum.cumulativeProfit >= 0
									? "text-emerald-400"
									: "text-red-400"
							}`}
						>
							{lastCum.cumulativeProfit >= 0 ? "" : "-"}
							{Math.abs(lastCum.cumulativeProfit).toFixed(0)}
						</p>
					</>
				)}
			</div>
		</div>
	)
}
