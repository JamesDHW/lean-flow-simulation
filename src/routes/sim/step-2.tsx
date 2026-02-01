import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/sim/step-2")({
	component: Step2,
})

function Step2() {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold text-slate-100">Step 2: Training</h2>
			<p className="text-slate-300 text-sm">
				Employees lack knowledge; defects caused by skill gaps. Slight reduction in
				defects, variance in task times, modest lead time improvement.
			</p>
		</div>
	)
}
