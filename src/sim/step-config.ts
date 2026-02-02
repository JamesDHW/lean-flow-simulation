export const STEP_IDS = [
	"intro",
	"step-1",
	"step-2",
	"step-3",
	"step-4",
	"step-5",
	"step-6",
	"step-7",
	"step-8",
] as const;

export type StepId = (typeof STEP_IDS)[number] | "config";

export const STEP_LABELS: Record<StepId, string> = {
	intro: "Intro",
	"step-1": "1. Customer Feedback",
	"step-2": "2. Training",
	"step-3": "3. Andon",
	"step-4": "4. Jidoka",
	"step-5": "5. Flow",
	"step-6": "6. Pull & Blue Bins",
	"step-7": "7. Bottleneck & Takt",
	"step-8": "8. One-Piece Flow",
	config: "Playground",
};

export const STEP_PATH_INDEX: Record<StepId, string> = {
	intro: "",
	"step-1": "step-1",
	"step-2": "step-2",
	"step-3": "step-3",
	"step-4": "step-4",
	"step-5": "step-5",
	"step-6": "step-6",
	"step-7": "step-7",
	"step-8": "step-8",
	config: "config",
};

export function stepIdFromPath(pathSegment: string): StepId {
	const entry = Object.entries(STEP_PATH_INDEX).find(
		([_, path]) =>
			path === pathSegment || (path === "" && pathSegment === undefined),
	);
	if (entry) return entry[0] as StepId;
	return "intro";
}

export function pathFromStepId(stepId: StepId): string {
	return STEP_PATH_INDEX[stepId];
}

export type NavStepId = (typeof STEP_IDS)[number];

export function getPrevStepId(stepId: StepId): NavStepId | null {
	const i = STEP_IDS.indexOf(stepId as NavStepId);
	if (i <= 0) return null;
	return STEP_IDS[i - 1];
}

export function getNextStepId(stepId: StepId): NavStepId | null {
	const i = STEP_IDS.indexOf(stepId as NavStepId);
	if (i < 0 || i >= STEP_IDS.length - 1) return null;
	return STEP_IDS[i + 1];
}
