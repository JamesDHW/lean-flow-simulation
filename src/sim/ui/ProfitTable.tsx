import { useSimSnapshot } from "../SimProvider";

export function ProfitTable() {
	const config = useSimSnapshot((s) => s.config);
	const tickPlHistory = useSimSnapshot((s) => s.tickPlHistory);
	const cumulativePl = useSimSnapshot((s) => s.cumulativePl);
	const lastTick = tickPlHistory[tickPlHistory.length - 1];
	const lastCum = cumulativePl[cumulativePl.length - 1];

	return (
		<div className="p-3 bg-factory-panel rounded-sm border-2 border-factory-border mb-72">
			<h3 className="text-base font-semibold text-text pixel-font text-sm mb-2">
				Profit & Loss
			</h3>
			{lastTick && lastCum != null ? (
				<div className="overflow-x-auto">
					<table className="w-full text-base">
						<thead>
							<tr className="border-b-2 border-factory-border">
								<th className="text-left text-text-muted font-medium py-1 pr-3" />
								<th className="text-right text-text-muted font-medium py-1 tabular-nums pr-2">
									Unit
								</th>
								<th className="text-right text-text-muted font-medium py-1 tabular-nums pr-2">
									Last Hour
								</th>
								<th className="text-right text-text-muted font-medium py-1 tabular-nums pr-2">
									Quantity
								</th>
								<th className="text-right text-text-muted font-medium py-1 tabular-nums pr-2">
									Cumulative
								</th>
								<th className="text-right text-text-muted font-medium py-1 tabular-nums">
									Cumulative Quantity
								</th>
							</tr>
						</thead>
						<tbody className="text-text">
							<tr className="border-b border-factory-border">
								<td className="py-1 pr-3 text-text-muted">Labour</td>
								<td className="text-right tabular-nums py-1 pr-2 text-factory-muted">
									-£{config.laborCostPerTickPerEmployee}/employee/hour
								</td>
								<td className="text-right text-danger-light tabular-nums py-1 pr-2">
									-£{lastTick.laborCost.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1 pr-2 text-text-muted">
									{lastTick.laborTicks} employees
								</td>
								<td className="text-right text-danger-light tabular-nums py-1 pr-2">
									-£{lastCum.cumulativeLaborCost.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1 text-text-muted">
									{lastCum.cumulativeLaborTicks}
								</td>
							</tr>
							<tr className="border-b border-factory-border">
								<td className="py-1 pr-3 text-text-muted">Inventory Holding</td>
								<td className="text-right tabular-nums py-1 pr-2 text-factory-muted">
									-£{config.inventoryCostPerItemPerTick}/item/hour
								</td>
								<td className="text-right text-danger-light tabular-nums py-1 pr-2">
									-£{lastTick.inventoryCost.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1 pr-2 text-text-muted">
									{lastTick.wip} items
								</td>
								<td className="text-right text-danger-light tabular-nums py-1 pr-2">
									-£{lastCum.cumulativeInventoryCost.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1 text-text-muted">
									{lastCum.cumulativeWipSum}
								</td>
							</tr>
							<tr className="border-b border-factory-border">
								<td className="py-1 pr-3 text-text-muted">Material</td>
								<td className="text-right tabular-nums py-1 pr-2 text-factory-muted">
									-£{config.materialCostPerItem}/input
								</td>
								<td className="text-right text-danger-light tabular-nums py-1 pr-2">
									-£{lastTick.materialCost.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1 pr-2 text-text-muted">
									{lastTick.materialUnits} inputs
								</td>
								<td className="text-right text-danger-light tabular-nums py-1 pr-2">
									-£{lastCum.cumulativeMaterialCost.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1 text-text-muted">
									{lastCum.cumulativeMaterialUnits}
								</td>
							</tr>
							<tr className="border-b border-factory-border">
								<td className="py-1 pr-3 text-text-muted">Defect (customer)</td>
								<td className="text-right tabular-nums py-1 pr-2 text-factory-muted">
									-£{config.defectCostCustomerShipped}/shipped
								</td>
								<td className="text-right text-danger-light tabular-nums py-1 pr-2">
									-£{lastTick.defectCost.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1 pr-2 text-text-muted">
									{lastTick.defectCount}
								</td>
								<td className="text-right text-danger-light tabular-nums py-1 pr-2">
									-£{lastCum.cumulativeDefectCost.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1 text-text-muted">
									{lastCum.cumulativeDefects}
								</td>
							</tr>
							<tr className="border-b border-factory-border">
								<td className="py-1 pr-3 text-text-muted">Revenue</td>
								<td className="text-right tabular-nums py-1 pr-2 text-factory-muted">
									+£{config.revenuePerItem}/item
								</td>
								<td className="text-right text-accent tabular-nums py-1 pr-2">
									+£{lastTick.revenue.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1 pr-2 text-text-muted">
									{lastTick.completedCount} items
								</td>
								<td className="text-right text-accent tabular-nums py-1 pr-2">
									+£{lastCum.cumulativeRevenue.toFixed(0)}
								</td>
								<td className="text-right tabular-nums py-1 text-text-muted">
									{lastCum.cumulativeCompleted}
								</td>
							</tr>
							<tr>
								<td className="py-1 pr-3 text-text-muted font-medium">
									Profit
								</td>
								<td className="py-1 pr-2" />
								<td
									className={`text-right tabular-nums font-medium py-1 pr-2 ${
										lastTick.profit >= 0 ? "text-accent" : "text-danger-light"
									}`}
								>
									{lastTick.profit >= 0 ? "£" : "-£"}
									{Math.abs(lastTick.profit).toFixed(0)}
								</td>
								<td className="py-1 pr-2" />
								<td
									className={`text-right tabular-nums font-medium py-1 pr-2 ${
										lastCum.cumulativeProfit >= 0
											? "text-accent"
											: "text-danger-light"
									}`}
								>
									{lastCum.cumulativeProfit >= 0 ? "£" : "-£"}
									{Math.abs(lastCum.cumulativeProfit).toFixed(0)}
								</td>
								<td className="py-1" />
							</tr>
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-factory-muted text-base">
					Run simulation to see Profit & Loss
				</p>
			)}
		</div>
	);
}
