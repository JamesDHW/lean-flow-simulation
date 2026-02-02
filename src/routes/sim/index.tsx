import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/sim/")({
	component: SimIntro,
});

function SimIntro() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl pixel-font text-text">
					Before Lean: Busy, Blind, and Unsafe
				</h2>
				<p className="text-xl text-white mt-1">
					Toyota Production System house diagram
				</p>
			</div>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What you are seeing
				</h3>
				<p className="text-white text-xl">
					You see a system that looks productive. Many people are busy. Many
					products are moving. Output is high.
				</p>
				<p className="text-text text-xl font-medium">
					And yet, profit is falling.
				</p>
			</section>

			<section className="space-y-3">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					The problem
				</h3>
				<p className="text-white text-xl">
					This is the most common starting point for companies before Lean.
				</p>
				<p className="text-white text-xl">
					Work is organized in silos — by department: Cutting, Assembly,
					Testing, Shipping. Each department optimizes its own work. No one sees
					the whole. No one owns the customer.
				</p>
				<p className="text-white text-xl">
					In this system, quantity comes before quality.
				</p>
				<p className="text-white text-xl">
					In Japan, we read right to left. This matters. The Toyota Production
					System is built the same way: Quality first, then cost, then delivery.
				</p>
				<p className="text-white text-xl">
					If you reverse this order, you ship faster — but you ship problems.
					Shipping a defective car is not an inconvenience. It can be dangerous.
					A defective brake is not "rework" — it is a risk to human life.
				</p>
			</section>

			<section className="bg-factory-surface rounded-sm p-4 border-l-4 border-accent border-2 border-factory-border">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					TPS principle
				</h3>
				<p className="text-text text-xl italic">
					"Quality is built in, not inspected later."
				</p>
			</section>

			<section className="space-y-2">
				<h3 className="text-md font-medium text-accent pixel-font text-sm">
					What to look for
				</h3>
				<ul className="text-white text-xl list-disc list-inside space-y-1">
					<li>High utilization everywhere</li>
					<li>Lots of movement</li>
					<li>No clear understanding of customer value</li>
					<li>Profit declining despite effort</li>
				</ul>
			</section>

			<section className="bg-rust/20 rounded-sm p-4 border-2 border-rust">
				<p className="text-text text-xl">
					<span className="font-medium">Ask yourself:</span> If this looks
					productive, why are we losing money?
				</p>
			</section>
		</div>
	);
}
