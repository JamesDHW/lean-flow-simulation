import { createFileRoute } from "@tanstack/react-router";
import { StepCopyLayout } from "../../sim/ui/StepCopyLayout";

export const Route = createFileRoute("/sim/step-4")({
	component: Step4,
});

function Step4() {
	return (
		<StepCopyLayout
			title="4. Jidoka"
			box1Title="What we saw (Andon)"
			box2Title="Jidoka (principle + change)"
			box1Content={
				<p>
					With andon, the TL became the expert who could fix some items
					(reverting them to good) and correctly reject others. We saw fewer
					defects reaching the customer and a better defect rate at stations
					where the TL intervened. But the defect rate stayed a fixed
					probability — we didn't yet <em>learn</em> from each defect. Every
					time we caught one we fixed or binned it, but the system didn't get
					better at the source.
				</p>
			}
			box2Content={
				<p>
					<strong>Jidoka</strong> (often translated as "automation with a human
					touch" or "quality in the process") means building in a way for the
					process to <em>stop</em> when something is wrong, so we don't make
					more defects. Here we use it as "stop the line on defect": when we
					catch a defect at a red bin (or the TL rejects at andon), we don't
					just remove that piece — we <strong>pause the whole line</strong>{" "}
					briefly. That makes the problem visible to everyone and we reduce the
					defect multiplier at that station so the same kind of fault is less
					likely to repeat. The change: turn on{" "}
					<strong>jidoka line stop</strong> so that when a defect is caught, the
					line pauses, the station gets a chance to "learn" (lower defect rate
					there), and we move defective items to the red bin. Result: fewer
					defects over time and a happier customer, while building in quality
					instead of inspecting later.
				</p>
			}
		/>
	);
}
