import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/sim/step-5")({
	component: Step5,
})

function Step5() {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold text-slate-100">Step 5: Pull</h2>
			<p className="text-slate-300 text-sm">
				Only start work when downstream ready. Queues shrink, less waiting. Lead time
				shorter, inventory cost reduced in P/L.
			</p>
		</div>
	)
}
