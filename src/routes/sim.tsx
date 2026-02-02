import {
	createFileRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { SimProvider } from "../sim/SimProvider";
import { STEP_IDS, type StepId } from "../sim/step-config";
import { ControlPanel } from "../sim/ui/ControlPanel";
import { MetricsPanel } from "../sim/ui/MetricsPanel";
import { ProductionLineSvg } from "../sim/ui/ProductionLineSvg";
import { ProfitChart } from "../sim/ui/ProfitChart";
import { ProfitTable } from "../sim/ui/ProfitTable";
import { StepNavigation } from "../sim/ui/StepNavigation";

function getStepIdFromPath(pathname: string): StepId {
	const base = "/sim";
	if (!pathname.startsWith(base)) return "intro";
	const rest = pathname.slice(base.length).replace(/^\/+/, "") || "";
	if (rest === "") return "intro";
	const stepNum = rest.replace("step-", "");
	if (/^[1-9]$/.test(stepNum)) {
		const id = `step-${stepNum}` as StepId;
		return STEP_IDS.includes(id) ? id : "intro";
	}
	return "intro";
}

export const Route = createFileRoute("/sim")({
	component: SimLayout,
});

function SimLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const routeStepId = getStepIdFromPath(pathname);
	return (
		<SimProvider key={routeStepId} initialStepId={routeStepId}>
			<div className="min-h-screen bg-factory-bg text-text p-4 md:p-6 pb-56">
				<div className="mx-auto max-w-full w-full space-y-4">
					<StepNavigation />
					<div className="p-4 rounded-sm border-2 border-factory-border bg-factory-panel/80">
						<Outlet />
					</div>
					<ProductionLineSvg />
					<section className="space-y-4">
						<MetricsPanel />
						<ProfitTable />
					</section>
				</div>
				<div className="fixed bottom-0 left-0 right-0 z-10 flex min-h-[220px]">
					<div className="flex-1 min-w-0 p-4 pr-2 flex flex-col">
						<ProfitChart />
					</div>
					<div className="shrink-0 w-full max-w-sm p-4 pl-2">
						<ControlPanel />
					</div>
				</div>
			</div>
		</SimProvider>
	);
}
