import {
	getDefectsCount,
	getIdleBlockedPercent,
	getLeadTimeAvg,
	getWip,
} from "../metrics"
import { useSimSnapshot } from "../SimProvider"

export function MetricsPanel() {
	const state = useSimSnapshot((s) => s.state)
	const config = useSimSnapshot((s) => s.config)
	const wip = getWip(state)
	const defects = getDefectsCount(state)
	const leadTime = getLeadTimeAvg(state, config)
	const { idlePercent, blockedPercent } = getIdleBlockedPercent(state, config)

	return (
		<div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
			<h3 className="text-sm font-semibold text-slate-200 mb-2">Metrics</h3>
			<dl className="grid grid-cols-2 gap-2 text-sm">
				<dt className="text-slate-400">WIP</dt>
				<dd className="text-slate-100 font-medium">{wip}</dd>
				<dt className="text-slate-400">Defects</dt>
				<dd className="text-slate-100 font-medium">{defects}</dd>
				<dt className="text-slate-400">Lead time (avg ms)</dt>
				<dd className="text-slate-100 font-medium">
					{Number.isFinite(leadTime) ? Math.round(leadTime) : "—"}
				</dd>
				<dt className="text-slate-400">Completed</dt>
				<dd className="text-slate-100 font-medium">
					{state.completedIds.length}
				</dd>
				<dt className="text-slate-400">Idle %</dt>
				<dd className="text-slate-100 font-medium">{idlePercent.toFixed(1)}%</dd>
				<dt className="text-slate-400">Blocked %</dt>
				<dd className="text-slate-100 font-medium">
					{blockedPercent.toFixed(1)}%
				</dd>
			</dl>
		</div>
	)
}
