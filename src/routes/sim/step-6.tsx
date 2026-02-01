import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/sim/step-6")({
	component: Step6,
})

function Step6() {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold text-slate-100">Step 6: Takt</h2>
			<p className="text-slate-300 text-sm">
				Assign exact time per station; show effect of variance. High variance ⇒ queues
				spike. Balanced takt ⇒ smooth flow. Wasted labor vs idle.
			</p>
		</div>
	)
}
