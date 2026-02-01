import {
	createFileRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { SimProvider } from "../sim/SimProvider";
import type { StepId } from "../sim/step-config";
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
	if (rest === "config") return "config";
	const stepNum = rest.replace("step-", "");
	if (/^[1-7]$/.test(stepNum)) return `step-${stepNum}` as StepId;
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
			<div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
				<div className="mx-auto space-y-4">
					<StepNavigation />
					<div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
						<Outlet />
					</div>
					<ProductionLineSvg />
					<section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div className="lg:col-span-2 space-y-4">
							<ControlPanel />
						</div>
						<div className="space-y-4">
							<MetricsPanel />
							<ProfitTable />
							<ProfitChart />
						</div>
					</section>
				</div>
			</div>
		</SimProvider>
	);
}
