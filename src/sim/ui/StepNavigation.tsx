import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
	getNextStepId,
	getPrevStepId,
	pathFromStepId,
	STEP_IDS,
	STEP_LABELS,
	type StepId,
} from "../step-config"

function currentStepIdFromPath(pathname: string): StepId {
	const base = "/sim"
	if (!pathname.startsWith(base)) return "intro"
	const rest = pathname.slice(base.length).replace(/^\/+/, "") || ""
	if (rest === "") return "intro"
	if (rest === "config") return "config"
	const stepNum = rest.replace("step-", "")
	if (/^[1-7]$/.test(stepNum)) return `step-${stepNum}` as StepId
	return "intro"
}

export function StepNavigation() {
	const pathname = useRouterState({ select: (s) => s.location.pathname })
	const currentStepId = currentStepIdFromPath(pathname)
	const prevId = getPrevStepId(currentStepId)
	const nextId = getNextStepId(currentStepId)

	return (
		<nav className="flex items-center justify-between gap-4 p-3 bg-slate-800/80 rounded-lg border border-slate-700">
			<div className="flex items-center gap-2">
				{prevId ? (
					<Link
						to={pathFromStepId(prevId) ? `/sim/${pathFromStepId(prevId)}` : "/sim"}
						className="flex items-center gap-1 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium"
					>
						<ChevronLeft size={18} />
						Previous
					</Link>
				) : (
					<span className="flex items-center gap-1 px-3 py-2 text-slate-500 text-sm">
						<ChevronLeft size={18} />
						Previous
					</span>
				)}
			</div>
			<div className="flex flex-wrap items-center justify-center gap-1">
				{STEP_IDS.map((id) => {
					const path = pathFromStepId(id)
					const to = path ? `/sim/${path}` : "/sim"
					const isActive = id === currentStepId
					return (
						<Link
							key={id}
							to={to}
							className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
								isActive
									? "bg-cyan-600 text-white"
									: "bg-slate-700 text-slate-300 hover:bg-slate-600"
							}`}
						>
							{STEP_LABELS[id].replace(/^\d\.\s/, "")}
						</Link>
					)
				})}
			</div>
			<div className="flex items-center gap-2">
				{nextId ? (
					<Link
						to={`/sim/${pathFromStepId(nextId)}`}
						className="flex items-center gap-1 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium"
					>
						Next
						<ChevronRight size={18} />
					</Link>
				) : (
					<span className="flex items-center gap-1 px-3 py-2 text-slate-500 text-sm">
						Next
						<ChevronRight size={18} />
					</span>
				)}
			</div>
		</nav>
	)
}
