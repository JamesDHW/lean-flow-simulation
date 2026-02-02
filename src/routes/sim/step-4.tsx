import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sim/step-4")({
	component: Step4,
});

function Step4() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-text pixel-font text-xl">
					Jidoka: "Never Pass on a Defect"
				</h2>
				<p className="text-xl text-white mt-1">
					Jidoka pillar highlighted in TPS house
				</p>
			</div>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What you are seeing
				</h3>
				<p className="text-white text-xl">
					Defects are detected almost immediately. The line stops decisively.
					The system refuses to continue with bad work.
				</p>
				<p className="text-white text-xl">
					Production speed drops. Quality rises sharply.
				</p>
			</section>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					The problem
				</h3>
				<p className="text-white text-xl font-medium">
					Speed without certainty is dangerous.
				</p>
				<p className="text-white text-xl">
					Jidoka is not automation. It is automation with human judgment.
				</p>
				<p className="text-white text-xl">
					A system that allows defects to move forward is unsafe.
				</p>
			</section>

			<section className="bg-factory-surface rounded-sm p-4 border-l-4 border-accent border-2 border-factory-border">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					TPS principle
				</h3>
				<p className="text-text text-xl italic">
					"Build quality into the process."
				</p>
				<p className="text-white text-xl mt-2">
					In TPS: a defect stops the entire system, the company responds
					together, safety comes before output.
				</p>
			</section>

			<section className="space-y-2">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What to look for
				</h3>
				<ul className="text-white text-xl list-disc list-inside space-y-1">
					<li>Very few defects escaping</li>
					<li>Frequent stoppages</li>
					<li>High discipline, low tolerance for error</li>
				</ul>
			</section>

			<section className="bg-rust/20 rounded-sm p-4 border-2 border-rust">
				<p className="text-text text-xl">
					<span className="font-medium">Ask yourself:</span> Would you rather
					ship fast — or ship safely?
				</p>
			</section>
		</div>
	);
}
