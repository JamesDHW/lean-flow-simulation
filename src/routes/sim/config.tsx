import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/sim/config")({
	component: ConfigStep,
})

function ConfigStep() {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold text-slate-100">Full Configuration</h2>
			<p className="text-slate-300 text-sm">
				Configure all parameters: stations, cycle times, variance, batch size, WIP
				limit, push/pull, defect rates. View P/L, costs, stock levels, defects, and
				visualizations.
			</p>
		</div>
	)
}
