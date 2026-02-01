import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ReferenceLine,
	ResponsiveContainer,
} from "recharts"
import { useSimSnapshot } from "../SimProvider"

export function ProfitChart() {
	const cumulativePl = useSimSnapshot((s) => s.cumulativePl)
	const state = useSimSnapshot((s) => s.state)
	const data = cumulativePl.map((row) => ({
		tick: row.tick,
		profit: row.cumulativeProfit,
	}))
	const stepMarkers = state.stepMarkers.filter((m) => m.tick > 0)

	return (
		<div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 min-h-[180px]">
			<h3 className="text-sm font-semibold text-slate-200 mb-2">
				Cumulative profit
			</h3>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={160}>
					<LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="rgb(71 85 105)" />
						<XAxis
							dataKey="tick"
							type="number"
							stroke="rgb(148 163 184)"
							fontSize={10}
						/>
						<YAxis stroke="rgb(148 163 184)" fontSize={10} tickFormatter={(v) => String(v)} />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgb(30 41 59)",
								border: "1px solid rgb(71 85 105)",
								borderRadius: 6,
							}}
							labelStyle={{ color: "rgb(203 213 225)" }}
							formatter={(value: number) => [value.toFixed(0), "Profit"]}
							labelFormatter={(tick) => `Tick ${tick}`}
						/>
						{stepMarkers.map((m) => (
							<ReferenceLine
								key={`${m.stepId}-${m.tick}`}
								x={m.tick}
								stroke="rgb(34 211 238)"
								strokeDasharray="2 2"
							/>
						))}
						<Line
							type="monotone"
							dataKey="profit"
							stroke="rgb(34 197 94)"
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			) : (
				<div className="h-[160px] flex items-center justify-center text-slate-500 text-sm">
					Run simulation to see chart
				</div>
			)}
		</div>
	)
}
