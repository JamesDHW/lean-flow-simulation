import { createFileRoute } from "@tanstack/react-router";
import { StepCopyLayout } from "../../sim/ui/StepCopyLayout";

export const Route = createFileRoute("/sim/step-6")({
	component: Step6,
});

function Step6() {
	return (
		<StepCopyLayout
			title="6. Pull & Blue Bins"
			box1Title="What we saw (Flow)"
			box2Title="Pull & blue bins (principle + change)"
			box1Content={
				<p>
					With flow layout we had less travel and more production. But we still
					couldn't produce fast enough. We were <strong>pushing</strong> work:
					each station filled a batch and pushed it to the next. So when one
					station hadn't finished its batch, the next station was idle even if
					there was work it could do. Batches and push behaviour created
					waiting.
				</p>
			}
			box2Content={
				<p>
					In a <strong>pull</strong> system, the next station{" "}
					<strong>pulls</strong> work when it's ready — it takes completed items
					from the previous station instead of waiting for a full batch to be
					pushed. So people work on things as they become available; we don't
					hold the next step idle while we finish a batch. We introduce{" "}
					<strong>pull</strong>: the downstream station sends an agent to get
					work from upstream when it needs it. We also use{" "}
					<strong>blue bins</strong> (or equivalent logic) so good items are
					clearly the ones that move forward; the flow of "good" work is
					visible. The change: switch from push to <strong>pull</strong> and
					show the agent fetching work. Less idle time, more continuous work,
					and we use capacity better without adding people.
				</p>
			}
		/>
	);
}
