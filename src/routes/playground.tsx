import { createFileRoute } from "@tanstack/react-router";
import { MobileViewMessage } from "../components/MobileViewMessage";
import { SimProvider } from "../sim/SimProvider";
import { ControlPanel } from "../sim/ui/ControlPanel";
import { GlobalConfigPanel } from "../sim/ui/GlobalConfigPanel";
import { MetricsPanel } from "../sim/ui/MetricsPanel";
import { ProductionLineSvg } from "../sim/ui/ProductionLineSvg";
import { ProfitChart } from "../sim/ui/ProfitChart";
import { ProfitTable } from "../sim/ui/ProfitTable";

export const Route = createFileRoute("/playground")({
	component: PlaygroundPage,
});

function PlaygroundPage() {
	return (
		<SimProvider key="playground" initialStepId="playground">
			<MobileViewMessage>
				<div className="min-h-screen bg-factory-bg text-text p-4 md:p-6">
					<div className="mx-auto max-w-full w-full space-y-4">
						<div className="p-4 rounded-sm border-2 border-factory-border bg-factory-panel/80">
							<div className="space-y-2">
								<h2 className="text-xl font-semibold text-text pixel-font">
									Playground
								</h2>
								<p className="text-text-muted text-base">
									Configure all parameters: stations, cycle times, variance,
									batch size, WIP limit, push/pull, defect rates. View P/L,
									costs, stock levels, defects, and visualizations.
								</p>
							</div>
						</div>
						<ProductionLineSvg />
						<GlobalConfigPanel />
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
			</MobileViewMessage>
		</SimProvider>
	);
}
