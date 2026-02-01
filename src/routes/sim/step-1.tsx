import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/sim/step-1")({
	component: Step1,
})

function Step1() {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold text-slate-100">Step 1: Customer Feedback → Quality Checkpoints</h2>
			<p className="text-slate-300 text-sm">
				High defects due to unknown quality; feedback loops create delay. Watch defective
				items in queues, rework, and lead time explosion. P/L shows heavy cost impact.
			</p>
		</div>
	)
}
