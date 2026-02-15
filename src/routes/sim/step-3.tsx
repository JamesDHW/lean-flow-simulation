import { createFileRoute } from "@tanstack/react-router";
import { StepCopyLayout } from "../../sim/ui/StepCopyLayout";

export const Route = createFileRoute("/sim/step-3")({
	component: Step3,
});

function Step3() {
	return (
		<StepCopyLayout
			title="3. Andon"
			box1Title="What we saw (Training)"
			box2Title="Andon (principle + change)"
			box1Content={
				<p>
					With training and red bins at each station, we spent less time
					processing pieces that were already defective — we pulled them out
					earlier. But sometimes defects still slipped through because workers
					weren't always sure if something was a defect, or they hesitated to
					stop the line. So we still had a mix of caught defects and mistakes.
				</p>
			}
			box2Content={
				<p>
					<strong>Andon</strong> is a signal that something is wrong and help is
					needed. When a worker isn't sure, they shouldn't have to guess alone.
					We introduce an andon: when a worker identifies a possible defect
					(that would go to the red bin), they can call for the{" "}
					<strong>Team Leader (TL)</strong>. The station pauses, the TL comes
					over, and with their deeper knowledge of the process they help decide:
					fixable (revert to good) or defective (to red bin). So we don't push
					uncertainty downstream — we stop and resolve it. The change we make:
					enable andon at stations and show the TL responding; the line can
					pause briefly so we get the right decision instead of guessing.
				</p>
			}
		/>
	);
}
