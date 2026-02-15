import { createFileRoute } from "@tanstack/react-router";
import { StepCopyLayout } from "../../sim/ui/StepCopyLayout";

export const Route = createFileRoute("/sim/")({
	component: SimIntro,
});

function SimIntro() {
	return (
		<StepCopyLayout
			box1Title="The Game"
			box2Title="The Toyota Production System (TPS)"
			box1Content={
				<>
					<p>
						You're running a small factory. Pieces move through several
						stations; at each one, a worker does a step of work. Your job is to
						make money: you earn revenue when good items reach the customer, and
						you pay for labour, materials, and holding inventory. If your
						cumulative profit hits zero, you go bust.
					</p>
					<p>
						Important rules: each station has a cycle time and works in batches;
						items can be defective (e.g. wrong spec, poor quality). The customer
						only accepts good items — defects that reach them cost you heavily
						(returns, recalls, lost trust). From time to time the "market"
						changes: customer preferences shift, and some in-flight work can
						suddenly count as defective. Watch the P/L, the flow of pieces, and
						what gets accepted or rejected.
					</p>
				</>
			}
			box2Content={
				<p>
					This simulation builds up the Toyota Production System (TPS) — Lean —
					one step at a time. TPS was developed at Toyota from the 1940s onward
					(Ohno, Shingo, and others). It isn't only for cars; it's a way of
					thinking about any flow of work: the customer defines value, and we
					aim to produce more <em>value</em> with the same people and materials.
					The goal is not cost-cutting by firing people; it's eliminating waste
					and making quality and flow visible so we can improve. In the next
					steps we'll see a "before Lean" situation, then add one principle at a
					time so you can feel how each change fixes a problem you've just seen.
				</p>
			}
		/>
	);
}
