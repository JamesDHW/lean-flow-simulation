import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sim/step-5")({
	component: Step5,
});

function Step5() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-text pixel-font text-xl">
					Flow: "From Departments to Value Streams"
				</h2>
				<p className="text-xl text-white mt-1">
					Before/after layout: departments vs flow line
				</p>
			</div>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What you are seeing
				</h3>
				<p className="text-white text-xl">
					Stations are now ordered by process. Travel is reduced. Hand-offs are
					simplified.
				</p>
				<p className="text-white text-xl font-medium">
					Without changing people, performance improves.
				</p>
			</section>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					The problem
				</h3>
				<p className="text-white text-xl">
					Departments optimize locally. Flow optimizes globally.
				</p>
				<p className="text-white text-xl">
					Motion, waiting, and transport disappear when work flows.
				</p>
			</section>

			<section className="bg-factory-surface rounded-sm p-4 border-l-4 border-accent border-2 border-factory-border">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					TPS principle
				</h3>
				<p className="text-text text-xl italic">"Make value flow."</p>
				<p className="text-white text-xl mt-2">
					Flow reveals: delays, imbalances, real work vs waste.
				</p>
			</section>

			<section className="space-y-2">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What to look for
				</h3>
				<ul className="text-white text-xl list-disc list-inside space-y-1">
					<li>Faster feedback</li>
					<li>Fewer delays</li>
					<li>More predictable output</li>
				</ul>
			</section>

			<section className="bg-rust/20 rounded-sm p-4 border-2 border-rust">
				<p className="text-text text-xl">
					<span className="font-medium">Ask yourself:</span> Why did performance
					improve without working harder?
				</p>
			</section>
		</div>
	);
}
