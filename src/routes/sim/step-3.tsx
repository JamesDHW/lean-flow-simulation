import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sim/step-3")({
	component: Step3,
});

function Step3() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-text pixel-font text-xl">
					Andon: "Making Problems Visible"
				</h2>
				<p className="text-xl text-white mt-1">Andon cord / Andon board</p>
			</div>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What you are seeing
				</h3>
				<p className="text-white text-xl">
					When a defect appears: the line stops, a signal is raised, everyone
					can see the problem.
				</p>
				<p className="text-white text-xl">Production slows. Queues form.</p>
			</section>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					The problem
				</h3>
				<p className="text-white text-xl">Stopping feels uncomfortable.</p>
				<p className="text-white text-xl">
					Managers fear: lost output, idle workers.
				</p>
				<p className="text-white text-xl font-medium">
					But hiding problems costs far more.
				</p>
			</section>

			<section className="bg-factory-surface rounded-sm p-4 border-l-4 border-accent border-2 border-factory-border">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					TPS principle
				</h3>
				<p className="text-text text-xl italic">"No problem is a problem."</p>
				<p className="text-white text-xl mt-2">
					Andon exists to: expose issues immediately, force attention, prevent
					silent failure.
				</p>
			</section>

			<section className="space-y-2">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What to look for
				</h3>
				<ul className="text-white text-xl list-disc list-inside space-y-1">
					<li>Slower production</li>
					<li>Fewer escaped defects</li>
					<li>Growing awareness of recurring problems</li>
				</ul>
			</section>

			<section className="bg-rust/20 rounded-sm p-4 border-2 border-rust">
				<p className="text-text text-xl">
					<span className="font-medium">Ask yourself:</span> Why is stopping the
					line a sign of strength, not weakness?
				</p>
			</section>
		</div>
	);
}
