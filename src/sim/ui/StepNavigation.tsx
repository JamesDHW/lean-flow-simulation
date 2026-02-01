import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
	getNextStepId,
	getPrevStepId,
	STEP_IDS,
	STEP_LABELS,
	type StepId,
} from "../step-config";

const STEP_TO = {
	intro: "/sim",
	config: "/sim/config",
	"step-1": "/sim/step-1",
	"step-2": "/sim/step-2",
	"step-3": "/sim/step-3",
	"step-4": "/sim/step-4",
	"step-5": "/sim/step-5",
	"step-6": "/sim/step-6",
	"step-7": "/sim/step-7",
} as const satisfies Record<StepId, string>;

function currentStepIdFromPath(pathname: string): StepId {
	const base = "/sim";
	if (!pathname.startsWith(base)) return "intro";
	const rest = pathname.slice(base.length).replace(/^\/+/, "") || "";
	if (rest === "") return "intro";
	if (rest === "config") return "config";
	const stepNum = rest.replace("step-", "");
	if (/^[1-7]$/.test(stepNum)) return `step-${stepNum}` as StepId;
	return "intro";
}

export function StepNavigation() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const currentStepId = currentStepIdFromPath(pathname);
	const prevId = getPrevStepId(currentStepId);
	const nextId = getNextStepId(currentStepId);

	return (
		<nav className="flex items-center justify-between gap-4 p-3 bg-slate-800/80 rounded-lg border border-slate-700">
			<div className="flex items-center gap-2">
				{prevId ? (
					<Link
						to={STEP_TO[prevId]}
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
			<div className="min-w-0 flex-1">
				<div className="grid grid-flow-col auto-cols-fr gap-1">
				{STEP_IDS.map((id) => {
					const to = STEP_TO[id];
					const isActive = id === currentStepId;
					const label = STEP_LABELS[id].replace(/^\d\.\s/, "");
					return (
						<Link
							key={id}
							to={to}
							aria-current={isActive ? "page" : undefined}
							title={label}
							className={`min-w-0 px-2 py-1.5 rounded text-xs font-medium text-center truncate transition-colors ${
								isActive
									? "bg-cyan-600 text-white"
									: "bg-slate-700 text-slate-300 hover:bg-slate-600"
							}`}
						>
							{label}
						</Link>
					);
				})}
				</div>
			</div>
			<div className="flex items-center gap-2">
				{nextId ? (
					<Link
						to={STEP_TO[nextId]}
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
	);
}
