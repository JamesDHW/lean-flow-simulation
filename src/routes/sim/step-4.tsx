import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/sim/step-4")({
	component: Step4,
})

function Step4() {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold text-slate-100">Step 4: Flow Setup</h2>
			<p className="text-slate-300 text-sm">
				Balance workstations, improve layout. Smoother flow, reduced WIP, more uniform
				queue lengths, lead time drops.
			</p>
		</div>
	)
}
