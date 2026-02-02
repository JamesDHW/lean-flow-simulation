import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sim/step-2")({
	component: Step2,
});

function Step2() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-text pixel-font text-xl">
					Training: "Standard Work Reduces Chaos, Not Risk"
				</h2>
				<p className="text-xl text-white mt-1">
					Standard work sheet or training dojo
				</p>
			</div>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What you are seeing
				</h3>
				<p className="text-white text-xl">
					People are better trained. They make fewer mistakes. Defects decrease.
				</p>
				<p className="text-white text-xl">
					But problems still exist. And when the market changes, we are still
					slow.
				</p>
			</section>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					The problem
				</h3>
				<p className="text-white text-xl">
					Training improves individual capability, not the system.
				</p>
				<p className="text-white text-xl">
					People now follow standards — this is good. But standards alone do not
					prevent defects from flowing forward.
				</p>
				<p className="text-white text-xl">
					Training does not replace: feedback, detection, learning.
				</p>
			</section>

			<section className="bg-factory-surface rounded-sm p-4 border-l-4 border-accent border-2 border-factory-border">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					TPS principle
				</h3>
				<p className="text-text text-xl italic">
					"Without standards, there can be no improvement."
				</p>
				<p className="text-white text-xl mt-2">
					But: Standards do not improve themselves.
				</p>
			</section>

			<section className="space-y-2">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What to look for
				</h3>
				<ul className="text-white text-xl list-disc list-inside space-y-1">
					<li>Fewer defects, but still too many</li>
					<li>Problems still discovered late</li>
					<li>Flow unchanged</li>
				</ul>
			</section>

			<section className="bg-rust/20 rounded-sm p-4 border-2 border-rust">
				<p className="text-text text-xl">
					<span className="font-medium">Ask yourself:</span> If everyone is
					trained, why do defects still escape?
				</p>
			</section>
		</div>
	);
}
