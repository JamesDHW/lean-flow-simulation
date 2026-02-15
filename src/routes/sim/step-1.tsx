import { createFileRoute } from "@tanstack/react-router";
import { StepCopyLayout } from "../../sim/ui/StepCopyLayout";

export const Route = createFileRoute("/sim/step-1")({
	component: Step1,
});

function Step1() {
	return (
		<StepCopyLayout
			title="1. Customer Feedback"
			box1Title="What we saw (Intro)"
			box2Title="Customer feedback (principle + change)"
			box1Content={
				<p>
					In the intro we saw a busy line: lots of movement, lots of output. But
					many items were rejected by the customer, and profit was under
					pressure. We weren't clearly distinguishing "good" from "defective"
					until the end — and a <em>defect</em> here means anything that makes
					the product wrong or unacceptable to the customer (wrong spec, bad
					quality, or obsolete once the market changed). So we kept spending
					labour and material on things the customer wouldn't accept.
				</p>
			}
			box2Content={
				<p>
					In TPS, <em>the customer defines value</em>. If we don't listen to the
					market, we overproduce the wrong thing — the worst kind of waste. So
					first we get clear on what the customer actually wants. In the sim
					we're going to introduce a <strong>red bin</strong> at the end of the
					flow: anything we identify as defective goes there instead of to the
					customer. That way we stop shipping defects and start seeing them.
					We'll also show defects as they move through the line (as they are
					created). Catching them before they reach the customer cuts the high
					cost and risk of shipping something wrong or unsafe.
				</p>
			}
		/>
	);
}
