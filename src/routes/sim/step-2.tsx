import { createFileRoute } from "@tanstack/react-router";
import { StepCopyLayout } from "../../sim/ui/StepCopyLayout";

export const Route = createFileRoute("/sim/step-2")({
	component: Step2,
});

function Step2() {
	return (
		<StepCopyLayout
			title="2. Training"
			box1Title="What we saw (Customer Feedback)"
			box2Title="Training (principle + change)"
			box1Content={
				<p>
					After adding the red bin at the end, we saw defects being caught
					there—so fewer bad items reached the customer. But we also saw that{" "}
					<em>lots of defects were still being created</em> at every station. We
					were reacting at the end rather than preventing problems at the
					source. Workers didn't have a shared idea of "good" or how their step
					could cause a defect.
				</p>
			}
			box2Content={
				<p>
					Quality is built in at the process, not only inspected later. So we
					invest in <strong>training</strong>: workers learn what "good" looks
					like and what causes defects at their station. We train them at their
					stations (off the live line where needed) and show how their work
					affects the final product. That lowers the defect rate. We also add{" "}
					<strong>red bins at every station</strong>: workers can now identify
					defective pieces and put them in the red bin so those items leave the
					value stream. Same number of people, but now they can see and stop
					defects where they're created.
				</p>
			}
		/>
	);
}
