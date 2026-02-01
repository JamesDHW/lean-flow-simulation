import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/sim/step-7")({
	component: Step7,
})

function Step7() {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold text-slate-100">Step 7: One-Piece Flow</h2>
			<p className="text-slate-300 text-sm">
				Smallest batch, continuous flow. Single item moving through stations. Lead time
				minimized, defects caught immediately. P/L maximized.
			</p>
		</div>
	)
}
