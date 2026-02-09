import { createFileRoute, Link } from "@tanstack/react-router";
import { StepCopyLayout } from "../../sim/ui/StepCopyLayout";

export const Route = createFileRoute("/sim/step-8")({
	component: Step8,
});

function Step8() {
	return (
		<StepCopyLayout
			title="8. One-Piece Flow"
			box1Title="What we saw (Bottleneck & Takt)"
			box2Title="One-piece flow (principle + change)"
			box1Content={
				<p>
					We were now making money and the customer was happy. But the system
					was still vulnerable to <strong>market change</strong>: when
					preferences shifted and some in-flight work became "defective," we had
					large batches in the line. So we scrapped or reworked a lot of WIP at
					once—expensive and slow to react. The cost of holding and then
					discarding WIP in big batches made us fragile.
				</p>
			}
			box2Content={
				<>
					<p>
						<strong>One-piece flow</strong> means moving and processing one item
						at a time (or the smallest sensible unit) instead of in big
						batches. Benefits: we see problems immediately, we hold less
						inventory, and when the market changes we have less WIP at risk—so
						we lose less and adapt faster. We switch to <strong>batch size one</strong>{" "}
						(and adjusted variance) so items move one by one. Now we're
						consistently making money <em>and</em> reacting to market changes:
						we listen to the customer, catch defects early, balance the line,
						and keep WIP low. That's Lean in action.
					</p>
					<p>
						Try the <Link to="/playground" className="text-sim-purple-border underline hover:no-underline">playground</Link> next to experiment with all the levers after you've seen the full journey.
					</p>
				</>
			}
		/>
	);
}
