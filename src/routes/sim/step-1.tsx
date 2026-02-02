import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sim/step-1")({
	component: Step1,
});

function Step1() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-text pixel-font text-xl">
					Customer Feedback: "We Don't Know What the Customer Wants"
				</h2>
				<p className="text-xl text-white mt-1">
					TPS pillar highlighting "Customer First" / Quality
				</p>
			</div>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What you are seeing
				</h3>
				<p className="text-white text-xl">
					Products are shipped quickly to customers. Many are returned. Some are
					rejected. Some make the customer unhappy.
				</p>
				<p className="text-white text-xl">
					When the market changes, we do not notice — or we notice too late.
				</p>
			</section>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					The problem
				</h3>
				<p className="text-white text-xl">
					We are producing without understanding customer needs.
				</p>
				<p className="text-white text-xl">
					This creates: unwanted features, wrong specifications, defects that
					escape to the customer.
				</p>
				<p className="text-white text-xl">
					In TPS terms, this is overproduction of the wrong thing — the worst
					waste.
				</p>
			</section>

			<section className="bg-factory-surface rounded-sm p-4 border-l-4 border-accent border-2 border-factory-border">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					TPS principle
				</h3>
				<p className="text-text text-xl italic">
					"The customer defines value."
				</p>
				<p className="text-white text-xl mt-2">
					If you do not listen: you build inventory, inventory becomes obsolete,
					learning comes too late.
				</p>
			</section>

			<section className="space-y-2">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What to look for
				</h3>
				<ul className="text-white text-xl list-disc list-inside space-y-1">
					<li>Defects reaching the customer</li>
					<li>High cost of returns and recalls</li>
					<li>Profit collapsing even faster</li>
				</ul>
			</section>

			<section className="bg-rust/20 rounded-sm p-4 border-2 border-rust">
				<p className="text-text text-xl">
					<span className="font-medium">Ask yourself:</span> How can we improve
					quality if the customer only tells us at the end?
				</p>
			</section>
		</div>
	);
}
