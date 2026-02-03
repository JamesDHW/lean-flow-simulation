import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useSimSnapshot } from "../SimProvider";

const HOURS_PER_MONTH = 730;

function simulationHoursFromTicks(
	tick: number,
	simTicksPerSecond: number,
): number {
	return tick / (simTicksPerSecond * 3600);
}

export function ProfitChart() {
	const cumulativePl = useSimSnapshot((s) => s.cumulativePl);
	const state = useSimSnapshot((s) => s.state);
	const config = useSimSnapshot((s) => s.config);
	const { simTicksPerSecond } = config;
	const data = cumulativePl.map((row) => ({
		hours: simulationHoursFromTicks(row.tick, simTicksPerSecond),
		profit: row.cumulativeProfit,
	}));
	const stepMarkers = state.stepMarkers.filter((m) => m.tick > 0);

	const chartText = "rgb(232 228 224)";
	const chartGrid = "rgb(92 83 76)";
	const chartAccent = "rgb(0 200 83)";
	const chartDanger = "rgb(198 40 40)";
	const chartRust = "rgb(183 65 14)";
	const chartPanel = "rgb(61 54 50)";

	return (
		<div className="h-full flex flex-col bg-factory-panel rounded-sm border-2 border-factory-border min-h-0">
			<div className="flex items-center justify-between mb-2 shrink-0 px-2">
				<h3 className="text-base font-semibold text-text pixel-font text-sm p-3">
					Cumulative profit (starting capital: £
					{config.initialInvestment.toLocaleString()})
				</h3>
				{state.isBust && (
					<span className="px-2 py-1 text-sm font-bold bg-danger text-text rounded-sm border-2 border-danger-light animate-pulse pixel-font">
						COMPANY BUST IN ~
						{(
							simulationHoursFromTicks(cumulativePl.length, simTicksPerSecond) *
							HOURS_PER_MONTH
						).toFixed(1)}{" "}
						MONTHS
					</span>
				)}
			</div>
			{data.length > 0 ? (
				<div className="flex-1 min-h-0">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={data}
							margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
							<XAxis
								dataKey="hours"
								type="number"
								stroke={chartText}
								fontSize={10}
								tickFormatter={(v) => `${v}h`}
							/>
							<YAxis
								stroke={chartText}
								fontSize={10}
								tickFormatter={(v) => `£${v}`}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: chartPanel,
									border: `2px solid ${chartGrid}`,
									borderRadius: 0,
								}}
								labelStyle={{ color: chartText }}
								formatter={(value: number) => [
									`£${value.toFixed(0)}`,
									"Profit",
								]}
								labelFormatter={(hours) => `Hour ${hours}`}
							/>
							{stepMarkers.map((m) => (
								<ReferenceLine
									key={`${m.stepId}-${m.tick}`}
									x={simulationHoursFromTicks(m.tick, simTicksPerSecond)}
									stroke={chartRust}
									strokeDasharray="2 2"
								/>
							))}
							<ReferenceLine
								y={0}
								stroke={chartDanger}
								strokeWidth={2}
								label={{
									value: "BUST",
									fill: chartDanger,
									fontSize: 10,
									position: "right",
								}}
							/>
							<Line
								type="monotone"
								dataKey="profit"
								stroke={chartAccent}
								strokeWidth={2}
								dot={false}
								isAnimationActive={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center text-factory-muted text-base min-h-[120px]">
					Run simulation to see chart
				</div>
			)}
		</div>
	);
}
