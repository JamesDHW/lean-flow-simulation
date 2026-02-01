import { createFileRoute, Link } from "@tanstack/react-router"
import { PlayCircle } from "lucide-react"

export const Route = createFileRoute("/")({
	component: HomePage,
})

function HomePage() {
	return (
		<div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
			<h1 className="text-4xl font-bold text-slate-100 mb-4">
				Lean Flow Simulation
			</h1>
			<p className="text-slate-400 mb-8 max-w-md text-center">
				Interactive simulation demonstrating Lean production principles: small
				batches, pull vs push, WIP limits, bottlenecks, and one-piece flow.
			</p>
			<Link
				to="/sim"
				className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
			>
				<PlayCircle size={20} />
				Start simulation
			</Link>
		</div>
	)
}
