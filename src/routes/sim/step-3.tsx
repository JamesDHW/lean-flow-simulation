import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/sim/step-3")({
	component: Step3,
})

function Step3() {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold text-slate-100">Step 3: Red Bins</h2>
			<p className="text-slate-300 text-sm">
				Stop defects at point of creation; problem solving. Red bin at each station —
				defective items stop immediately, rework time reduced. P/L improves.
			</p>
		</div>
	)
}
