import { createFileRoute } from "@tanstack/react-router";
import { StepCopyLayout } from "../../sim/ui/StepCopyLayout";

export const Route = createFileRoute("/sim/step-7")({
	component: Step7,
});

function Step7() {
	return (
		<StepCopyLayout
			title="7. Bottleneck & Takt"
			box1Title="What we saw (Pull & Blue Bins)"
			box2Title="Bottleneck & takt (principle + change)"
			box1Content={
				<p>
					With pull, people were working more constantly and idle time went
					down. But one station (e.g. station 5) still took longer than the
					others — it was the <strong>bottleneck</strong>. The pull system
					helped avoid huge build-ups, but that station still set the pace. The
					rest of the line was sometimes waiting on it, and we weren't getting a
					steady rhythm.
				</p>
			}
			box2Content={
				<p>
					<strong>Takt</strong> is the rhythm of customer demand — the rate we
					need to produce to match the market. If one station is much slower
					than the others, it dictates the whole line and creates uneven load.
					We <strong>balance to takt</strong>: we split the long cycle at the
					bottleneck into two stations (so the same work is done by two people
					in parallel, each with a shorter cycle) and we merge later stations
					that have shorter cycle times so one person can do them. Same number
					of people overall — we're not cutting jobs — but the flow is more
					even. The change: <strong>takt stations</strong> — split the
					bottleneck (e.g. station 5 → 5a and 5b) and merge later stations where
					cycle time allows. Same headcount, more even flow, and we get closer
					to a steady takt that matches demand.
				</p>
			}
		/>
	);
}
