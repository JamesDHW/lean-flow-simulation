import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/sim/")({
	component: SimIntro,
})

function SimIntro() {
	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold text-slate-100">Introduction</h2>
			<p className="text-slate-300">
				This simulation demonstrates Lean production principles step by step. Each step
				adds a concept: quality feedback, training, red bins, flow, pull, takt, and
				one-piece flow.
			</p>
			<Link
				to="/sim/step-1"
				className="inline-flex items-center px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
			>
				Start Step 1 — Customer Feedback
			</Link>
		</div>
	)
}
