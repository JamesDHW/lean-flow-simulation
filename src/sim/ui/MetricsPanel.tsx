import {
	getDefectsCount,
	getIdleBlockedPercent,
	getLeadTimeAvg,
	getMeasuredDefectPercent,
	getWip,
} from "../metrics";
import { useSimSnapshot } from "../SimProvider";

export function MetricsPanel() {
	const state = useSimSnapshot((s) => s.state);
	const config = useSimSnapshot((s) => s.config);
	const wip = getWip(state);
	const defects = getDefectsCount(state);
	const measuredDefectPercent = getMeasuredDefectPercent(state);
	const leadTime = getLeadTimeAvg(state, config);
	const { idlePercent, blockedPercent } = getIdleBlockedPercent(state, config);

	return (
		<div className="p-3 bg-factory-panel rounded-sm border-2 border-factory-border">
			<h3 className="text-base font-semibold text-text pixel-font text-sm mb-2">
				Metrics
			</h3>
			<dl className="grid grid-cols-2 gap-2 text-base">
				<dt className="text-text-muted">Work in Progress</dt>
				<dd className="text-text font-medium">{wip} items</dd>
				<dt className="text-text-muted">Defects Shipped</dt>
				<dd className="text-text font-medium">{defects}</dd>
				<dt className="text-text-muted">Defect Rate (overall)</dt>
				<dd className="text-text font-medium tabular-nums">
					{measuredDefectPercent.toFixed(1)}%
				</dd>
				<dt className="text-text-muted">Lead Time (average)</dt>
				<dd className="text-text font-medium">
					{Number.isFinite(leadTime)
						? `${Math.round(leadTime)} minutes`
						: " — "}
				</dd>
				<dt className="text-text-muted">Completed Items</dt>
				<dd className="text-text font-medium">
					{state.totalCompletedCount ?? state.completedIds.length}
				</dd>
				<dt className="text-text-muted">Idle Percentage</dt>
				<dd className="text-text font-medium">{idlePercent.toFixed(1)}%</dd>
				<dt className="text-text-muted">Blocked Percentage</dt>
				<dd className="text-text font-medium">{blockedPercent.toFixed(1)}%</dd>
			</dl>
		</div>
	);
}
