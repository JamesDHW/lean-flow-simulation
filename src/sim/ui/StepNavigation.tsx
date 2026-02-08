import { ChevronLeft, ChevronRight } from "lucide-react";
import {
	getNextStepId,
	getPrevStepId,
	type NavStepId,
	STEP_IDS,
	STEP_LABELS,
} from "../step-config";

const STEP_TO: Record<NavStepId, string> = {
	intro: "/sim",
	"step-1": "/sim/step-1",
	"step-2": "/sim/step-2",
	"step-3": "/sim/step-3",
	"step-4": "/sim/step-4",
	"step-5": "/sim/step-5",
	"step-6": "/sim/step-6",
	"step-7": "/sim/step-7",
	"step-8": "/sim/step-8",
};

function currentStepIdFromPath(pathname: string): NavStepId {
	const base = "/sim";
	if (!pathname.startsWith(base)) return "intro";
	const rest = pathname.slice(base.length).replace(/^\/+/, "") || "";
	if (rest === "") return "intro";
	const stepNum = rest.replace("step-", "");
	if (/^[1-9]$/.test(stepNum)) {
		const id = `step-${stepNum}` as NavStepId;
		return STEP_IDS.includes(id) ? id : "intro";
	}
	return "intro";
}

export function StepNavigation() {
	const pathname =
		typeof window !== "undefined" ? window.location.pathname : "/sim";
	const currentStepId = currentStepIdFromPath(pathname);
	const prevId = getPrevStepId(currentStepId);
	const nextId = getNextStepId(currentStepId);

	return (
		<nav className="flex items-center justify-between gap-4 p-3 bg-factory-panel rounded-sm border-2 border-factory-border">
			<div className="flex items-center gap-2">
				{prevId ? (
					<a
						href={STEP_TO[prevId]}
						className="flex items-center gap-1 px-3 py-2 rounded-sm border-2 border-factory-border bg-factory-surface hover:bg-factory-muted text-text text-base font-medium"
					>
						<ChevronLeft size={18} />
						Previous
					</a>
				) : (
					<span className="flex items-center gap-1 px-3 py-2 text-factory-muted text-base border-2 border-transparent">
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
							<a
								key={id}
								href={to}
								aria-current={isActive ? "page" : undefined}
								title={label}
								className={`min-w-0 px-2 py-1.5 rounded-sm border-2 text-lg font-medium text-center truncate transition-colors ${
									isActive
										? "bg-accent text-factory-bg border-accent-dim"
										: "bg-factory-surface text-white hover:bg-factory-muted border-factory-border"
								}`}
							>
								{label}
							</a>
						);
					})}
				</div>
			</div>
			<div className="flex items-center gap-2">
				{nextId ? (
					<a
						href={STEP_TO[nextId]}
						className="flex items-center gap-1 px-3 py-2 rounded-sm border-2 border-factory-border bg-factory-surface hover:bg-factory-muted text-text text-base font-medium"
					>
						Next
						<ChevronRight size={18} />
					</a>
				) : (
					<span className="flex items-center gap-1 px-3 py-2 text-factory-muted text-base border-2 border-transparent">
						Next
						<ChevronRight size={18} />
					</span>
				)}
			</div>
		</nav>
	);
}
