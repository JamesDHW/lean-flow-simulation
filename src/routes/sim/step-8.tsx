import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sim/step-8")({
	component: Step8,
});

function Step8() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-text pixel-font text-xl">
					One-Piece Flow: "Fast Feedback, Safe Learning"
				</h2>
				<p className="text-xl text-white mt-1">One-piece flow diagram</p>
			</div>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What you are seeing
				</h3>
				<p className="text-white text-xl">
					Items move one by one. Defects are caught instantly. Market changes
					cause minimal damage.
				</p>
				<p className="text-white text-xl font-medium">Profit is highest.</p>
			</section>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					The problem (now solved)
				</h3>
				<p className="text-white text-xl">
					Large batches delay learning. Small batches accelerate understanding.
				</p>
			</section>

			<section className="bg-factory-surface rounded-sm p-4 border-l-4 border-accent border-2 border-factory-border">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					TPS principle
				</h3>
				<p className="text-text text-xl italic">
					"Shorten the time between cause and effect."
				</p>
				<p className="text-white text-xl mt-2 font-medium">
					This is the heart of Lean.
				</p>
			</section>

			<section className="space-y-2">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What to look for
				</h3>
				<ul className="text-white text-xl list-disc list-inside space-y-1">
					<li>Minimal inventory</li>
					<li>Rapid learning</li>
					<li>Maximum resilience</li>
				</ul>
			</section>

			<section className="bg-accent/20 rounded-sm p-4 border-2 border-accent">
				<p className="text-text text-xl">
					<span className="font-medium">Final question:</span> What happens when
					quality, flow, and learning work together?
				</p>
			</section>
		</div>
	);
}
