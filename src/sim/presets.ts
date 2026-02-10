import type { ConfigStepId } from "./step-config";
import type { DepartmentId, SimConfig, StationConfig } from "./types";

const DEPT_1: DepartmentId = "dept-1";
const DEPT_2: DepartmentId = "dept-2";
const DEPT_3: DepartmentId = "dept-3";

const defaultStations: StationConfig[] = [
	{
		id: "s1",
		departmentId: DEPT_1,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: false,
		defectProbability: 0.65,
		redBin: false,
		travelTicks: 3,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s2",
		departmentId: DEPT_2,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: false,
		defectProbability: 0.65,
		redBin: false,
		travelTicks: 3,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s3",
		departmentId: DEPT_3,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: false,
		defectProbability: 0.65,
		redBin: false,
		travelTicks: 3,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s4",
		departmentId: DEPT_1,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: false,
		defectProbability: 0.65,
		redBin: false,
		travelTicks: 3,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s5",
		departmentId: DEPT_2,
		cycleTime: 2100,
		cycleVariance: 210,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: false,
		defectProbability: 0.65,
		redBin: false,
		travelTicks: 3,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s6",
		departmentId: DEPT_3,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: false,
		defectProbability: 0.65,
		redBin: false,
		travelTicks: 3,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s7",
		departmentId: DEPT_1,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: false,
		defectProbability: 0.65,
		redBin: false,
		travelTicks: 3,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s8",
		departmentId: DEPT_2,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: false,
		defectProbability: 0.65,
		redBin: false,
		travelTicks: 3,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s9",
		departmentId: DEPT_3,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: false,
		defectProbability: 0.65,
		redBin: false,
		travelTicks: 3,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
];

const baseConfig: Omit<SimConfig, "stepId" | "stations"> = {
	simTicksPerSecond: 20,
	speed: 10,
	pushOrPull: "push",
	layoutMode: "departments",
	revenuePerItem: 20000,
	laborCostPerTickPerEmployee: 15,
	inventoryCostPerItemPerTick: 2,
	materialCostPerItem: 500,
	defectCostCustomerShipped: 500,
	marketChangeIntervalTicks: 600,
	marketChangeAutoIntervalMs: 20000,
	initialInvestment: 1000000,
	managerReworkProbability: 0.6,
};

export interface StepPreset {
	config: Partial<SimConfig>;
	enabledControls: {
		batchSize?: boolean;
		pushPull?: boolean;
		defectProbability?: boolean;
		trainingEffectiveness?: boolean;
		cycleVariance?: boolean;
		cycleTime?: boolean;
		tickSpeed?: boolean;
		andon?: boolean;
		layoutMode?: boolean;
		marketChange?: boolean;
		blueBins?: boolean;
	};
}

const taktStations: StationConfig[] = [
	{
		id: "s1",
		departmentId: DEPT_1,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: true,
		defectProbability: 0.2,
		redBin: true,
		travelTicks: 6,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s2",
		departmentId: DEPT_2,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: true,
		defectProbability: 0.2,
		redBin: true,
		travelTicks: 6,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s3",
		departmentId: DEPT_3,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: true,
		defectProbability: 0.2,
		redBin: true,
		travelTicks: 6,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s4",
		departmentId: DEPT_1,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: true,
		defectProbability: 0.2,
		redBin: true,
		travelTicks: 6,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s5a",
		departmentId: DEPT_2,
		cycleTime: 1050,
		cycleVariance: 105,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: true,
		defectProbability: 0.2,
		redBin: true,
		travelTicks: 6,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s5b",
		departmentId: DEPT_2,
		cycleTime: 1050,
		cycleVariance: 105,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: true,
		defectProbability: 0.2,
		redBin: true,
		travelTicks: 6,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s6",
		departmentId: DEPT_3,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: true,
		defectProbability: 0.2,
		redBin: true,
		travelTicks: 6,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s7",
		departmentId: DEPT_1,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: true,
		defectProbability: 0.2,
		redBin: true,
		travelTicks: 6,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
	{
		id: "s8",
		departmentId: DEPT_2,
		cycleTime: 900,
		cycleVariance: 90,
		capacity: 1,
		batchSize: 6,
		trainingEffectiveness: 0.5,
		andonEnabled: true,
		defectProbability: 0.2,
		redBin: true,
		travelTicks: 6,
		andonPauseTicks: 1,
		reworkSendsBack: false,
		reworkTicks: 9,
	},
];

function withLastStationRedBin(stations: StationConfig[]): StationConfig[] {
	return stations.map((s, i) => ({
		...s,
		redBin: i === stations.length - 1,
	}));
}

function withAllStationsRedBin(stations: StationConfig[]): StationConfig[] {
	return stations.map((s) => ({ ...s, redBin: true }));
}

function withReworkSendsBack(
	stations: StationConfig[],
	value: boolean,
): StationConfig[] {
	return stations.map((s) => ({ ...s, reworkSendsBack: value }));
}

function withDefectProbability(
	stations: StationConfig[],
	value: number,
): StationConfig[] {
	return stations.map((s) => ({ ...s, defectProbability: value }));
}

function withAndonEnabled(
	stations: StationConfig[],
	value: boolean,
): StationConfig[] {
	return stations.map((s) => ({ ...s, andonEnabled: value }));
}

export const STEP_PRESETS: Record<ConfigStepId, StepPreset> = {
	intro: {
		config: {
			...baseConfig,
			stations: withReworkSendsBack(
				defaultStations.map((s) => ({ ...s })),
				false,
			),
		},
		enabledControls: {},
	},
	"step-1": {
		config: {
			...baseConfig,
			stations: withReworkSendsBack(
				withLastStationRedBin(defaultStations.map((s) => ({ ...s }))),
				false,
			),
		},
		enabledControls: {},
	},
	"step-2": {
		config: {
			...baseConfig,
			stations: withDefectProbability(
				withAllStationsRedBin(defaultStations.map((s) => ({ ...s }))),
				0.2,
			),
		},
		enabledControls: {},
	},
	"step-3": {
		config: {
			...baseConfig,
			stations: withDefectProbability(
				withAndonEnabled(
					withAllStationsRedBin(defaultStations.map((s) => ({ ...s }))),
					true,
				),
				0.2,
			),
		},
		enabledControls: {},
	},
	"step-4": {
		config: {
			...baseConfig,
			jidokaLineStop: true,
			stations: withDefectProbability(
				withAndonEnabled(
					withAllStationsRedBin(defaultStations.map((s) => ({ ...s }))),
					true,
				),
				0.2,
			),
		},
		enabledControls: {},
	},
	"step-5": {
		config: {
			...baseConfig,
			jidokaLineStop: true,
			layoutMode: "flow",
			stations: withDefectProbability(
				withAndonEnabled(
					withAllStationsRedBin(
						defaultStations.map((s) => ({ ...s, travelTicks: 0 })),
					),
					true,
				),
				0.2,
			),
		},
		enabledControls: {},
	},
	"step-6": {
		config: {
			...baseConfig,
			jidokaLineStop: true,
			layoutMode: "flow",
			pushOrPull: "pull",
			stations: withDefectProbability(
				withAndonEnabled(
					withAllStationsRedBin(
						defaultStations.map((s) => ({ ...s, travelTicks: 6 })),
					),
					true,
				),
				0.2,
			),
		},
		enabledControls: {},
	},
	"step-7": {
		config: {
			...baseConfig,
			jidokaLineStop: true,
			layoutMode: "flow",
			pushOrPull: "pull",
			stations: withDefectProbability(
				taktStations.map((s) => ({ ...s })),
				0.2,
			),
		},
		enabledControls: {},
	},
	"step-8": {
		config: {
			...baseConfig,
			jidokaLineStop: true,
			layoutMode: "flow",
			pushOrPull: "pull",
			stations: withDefectProbability(
				taktStations.map((s) => ({
					...s,
					batchSize: 1,
					cycleVariance: Math.round(s.cycleTime * 0.4),
				})),
				0.2,
			),
		},
		enabledControls: {},
	},
	playground: {
		config: { ...baseConfig },
		enabledControls: {
			batchSize: true,
			pushPull: true,
			defectProbability: true,
			trainingEffectiveness: true,
			cycleVariance: true,
			cycleTime: true,
			tickSpeed: true,
			andon: true,
			layoutMode: true,
			marketChange: true,
			blueBins: true,
		},
	},
};

export function getInitialConfig(stepId: ConfigStepId): SimConfig {
	const preset = STEP_PRESETS[stepId];
	const effective = preset ?? STEP_PRESETS.intro;
	const stations = effective.config.stations ?? defaultStations;
	return {
		...baseConfig,
		...effective.config,
		stations: stations.map((s) => ({ ...s })),
		stepId,
	};
}
