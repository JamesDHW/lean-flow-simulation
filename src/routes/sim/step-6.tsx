import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sim/step-6")({
	component: Step6,
});

function Step6() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-text pixel-font text-xl">
					Pull & Blue Bins: "Stop Producing Without Demand"
				</h2>
				<p className="text-xl text-white mt-1">
					Kanban / supermarket / blue bin
				</p>
			</div>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What you are seeing
				</h3>
				<p className="text-white text-xl">
					Work only starts when the next process is ready. Inventory shrinks.
					Some stations are idle.
				</p>
				<p className="text-white text-xl font-medium">
					A bottleneck becomes obvious.
				</p>
			</section>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					The problem
				</h3>
				<p className="text-white text-xl">
					Push hides problems with inventory. Pull exposes reality.
				</p>
				<p className="text-white text-xl font-medium">
					Inventory is not an asset. It is a buffer for ignorance.
				</p>
			</section>

			<section className="bg-factory-surface rounded-sm p-4 border-l-4 border-accent border-2 border-factory-border">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					TPS principle
				</h3>
				<p className="text-text text-xl italic">
					"Produce only what is needed, when it is needed."
				</p>
			</section>

			<section className="space-y-2">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What to look for
				</h3>
				<ul className="text-white text-xl list-disc list-inside space-y-1">
					<li>Dramatic reduction in WIP</li>
					<li>Clear bottleneck</li>
					<li>Improved stability</li>
				</ul>
			</section>

			<section className="bg-rust/20 rounded-sm p-4 border-2 border-rust">
				<p className="text-text text-xl">
					<span className="font-medium">Ask yourself:</span> Why does less
					work-in-progress lead to better performance?
				</p>
			</section>
		</div>
	);
}
