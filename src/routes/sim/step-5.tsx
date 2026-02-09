import { createFileRoute } from "@tanstack/react-router";
import { StepCopyLayout } from "../../sim/ui/StepCopyLayout";

export const Route = createFileRoute("/sim/step-5")({
	component: Step5,
});

function Step5() {
	return (
		<StepCopyLayout
			title="5. Flow"
			box1Title="What we saw (Jidoka)"
			box2Title="Flow (principle + change)"
			box1Content={
				<p>
					With jidoka we had fewer defects and a happier customer. But the line
					was still too slow to meet demand—we had stations in different
					"departments" with travel time between them, and we were losing time
					and clarity. Eventually we couldn't sustain profit and went bust. The
					waste wasn't just defects; it was distance and fragmentation.
				</p>
			}
			box2Content={
				<p>
					In Lean we organise by <strong>flow</strong>—the path the product
					takes—not by department silos. When stations are scattered by
					department, travel and handoffs add time and hide problems. So we{" "}
					<strong>rearrange the layout into flow</strong>: put stations next to
					each other in the order of the value stream and remove the artificial
					splits that were by "department" rather than by the actual work
					sequence. We also set travel between adjacent stations to zero in the
					sim so we can see the effect of flow alone. The change: switch to{" "}
					<strong>flow layout</strong> and eliminate travel between adjacent
					stations. Less travel, clearer flow, and we can see how much faster we
					can serve the customer when the line is physically and logically one
					stream.
				</p>
			}
		/>
	);
}
