import { createFileRoute } from "@tanstack/react-router";
import { SimProvider } from "../sim/SimProvider";
import { ControlPanel } from "../sim/ui/ControlPanel";
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
			<div className="min-h-screen bg-factory-bg text-text p-4 md:p-6">
				<div className="mx-auto max-w-full w-full space-y-4">
					<div className="p-4 rounded-sm border-2 border-factory-border bg-factory-panel/80">
						<div className="space-y-2">
							<h2 className="text-xl font-semibold text-text pixel-font">
								Playground
							</h2>
							<p className="text-text-muted text-base">
								Configure all parameters: stations, cycle times, variance, batch
								size, WIP limit, push/pull, defect rates. View P/L, costs, stock
								levels, defects, and visualizations.
							</p>
						</div>
					</div>
					<ProductionLineSvg />
					<section className="space-y-4">
						<MetricsPanel />
						<ProfitTable />
						<ProfitChart />
					</section>
				</div>
				<div className="fixed bottom-4 right-4 z-10 w-full max-w-sm shadow-[4px_4px_0_0_var(--color-factory-border)] border-2 border-factory-border">
					<ControlPanel />
				</div>
			</div>
		</SimProvider>
	);
}
