import type { SimConfig, StationConfig } from "./types"
import type { StepId } from "./step-config"

const defaultStations: StationConfig[] = [
	{ id: "s1", cycleTime: 600, cycleVariance: 100, capacity: 1, bufferBefore: 5, bufferAfter: 5 },
	{ id: "s2", cycleTime: 600, cycleVariance: 100, capacity: 1, bufferBefore: 5, bufferAfter: 5 },
	{ id: "s3", cycleTime: 600, cycleVariance: 100, capacity: 1, bufferBefore: 5, bufferAfter: 5 },
]

const baseConfig: Omit<SimConfig, "stepId" | "seed" | "stations"> = {
	tickMs: 200,
	batchSize: 3,
	wipLimit: 15,
	arrivalRateMs: 2000,
	pushOrPull: "push",
	defectProbability: 0.4,
	redBins: false,
	trainingEffectiveness: 0.5,
	reworkSendsBack: true,
	reworkTicks: 3,
	revenuePerItem: 100,
	laborCostPerTickPerEmployee: 1,
	inventoryCostPerItemPerTick: 2,
	defectCostPerItem: 50,
}

export interface StepPreset {
	config: Partial<SimConfig>
	enabledControls: {
		batchSize: boolean
		pushPull: boolean
		wipLimit: boolean
		defectProbability: boolean
		trainingEffectiveness: boolean
		cycleVariance: boolean
		cycleTime: boolean
		tickSpeed: boolean
	}
}

export const STEP_PRESETS: Record<StepId, StepPreset> = {
	intro: {
		config: { ...baseConfig, batchSize: 3, defectProbability: 0 },
		enabledControls: {
			batchSize: true,
			pushPull: false,
			wipLimit: false,
			defectProbability: false,
			trainingEffectiveness: false,
			cycleVariance: false,
			cycleTime: false,
			tickSpeed: true,
		},
	},
	"step-1": {
		config: {
			...baseConfig,
			defectProbability: 0.45,
			reworkSendsBack: true,
			redBins: false,
		},
		enabledControls: {
			batchSize: true,
			pushPull: false,
			wipLimit: false,
			defectProbability: true,
			trainingEffectiveness: false,
			cycleVariance: false,
			cycleTime: false,
			tickSpeed: true,
		},
	},
	"step-2": {
		config: {
			...baseConfig,
			defectProbability: 0.25,
			trainingEffectiveness: 0.6,
			reworkSendsBack: true,
			redBins: false,
		},
		enabledControls: {
			batchSize: true,
			pushPull: false,
			wipLimit: false,
			defectProbability: true,
			trainingEffectiveness: true,
			cycleVariance: true,
			cycleTime: false,
			tickSpeed: true,
		},
	},
	"step-3": {
		config: {
			...baseConfig,
			defectProbability: 0.2,
			redBins: true,
			reworkSendsBack: false,
			reworkTicks: 1,
		},
		enabledControls: {
			batchSize: true,
			pushPull: false,
			wipLimit: false,
			defectProbability: true,
			trainingEffectiveness: true,
			cycleVariance: true,
			cycleTime: false,
			tickSpeed: true,
		},
	},
	"step-4": {
		config: {
			...baseConfig,
			defectProbability: 0.15,
			redBins: true,
			stations: defaultStations.map((s) => ({
				...s,
				cycleTime: 550,
				cycleVariance: 80,
			})),
		},
		enabledControls: {
			batchSize: true,
			pushPull: false,
			wipLimit: true,
			defectProbability: true,
			trainingEffectiveness: true,
			cycleVariance: true,
			cycleTime: true,
			tickSpeed: true,
		},
	},
	"step-5": {
		config: {
			...baseConfig,
			pushOrPull: "pull",
			defectProbability: 0.1,
			redBins: true,
		},
		enabledControls: {
			batchSize: true,
			pushPull: true,
			wipLimit: true,
			defectProbability: true,
			trainingEffectiveness: true,
			cycleVariance: true,
			cycleTime: true,
			tickSpeed: true,
		},
	},
	"step-6": {
		config: {
			...baseConfig,
			pushOrPull: "pull",
			defectProbability: 0.08,
			redBins: true,
			stations: defaultStations.map((s) => ({ ...s, cycleVariance: 50 })),
		},
		enabledControls: {
			batchSize: true,
			pushPull: true,
			wipLimit: true,
			defectProbability: true,
			trainingEffectiveness: true,
			cycleVariance: true,
			cycleTime: true,
			tickSpeed: true,
		},
	},
	"step-7": {
		config: {
			...baseConfig,
			batchSize: 1,
			pushOrPull: "pull",
			wipLimit: 5,
			defectProbability: 0.05,
			redBins: true,
			stations: defaultStations.map((s) => ({
				...s,
				cycleTime: 500,
				cycleVariance: 30,
			})),
		},
		enabledControls: {
			batchSize: true,
			pushPull: true,
			wipLimit: true,
			defectProbability: true,
			trainingEffectiveness: true,
			cycleVariance: true,
			cycleTime: true,
			tickSpeed: true,
		},
	},
	config: {
		config: { ...baseConfig },
		enabledControls: {
			batchSize: true,
			pushPull: true,
			wipLimit: true,
			defectProbability: true,
			trainingEffectiveness: true,
			cycleVariance: true,
			cycleTime: true,
			tickSpeed: true,
		},
	},
}

export function getInitialConfig(stepId: StepId, seed: number): SimConfig {
	const preset = STEP_PRESETS[stepId]
	const stations = preset.config.stations ?? defaultStations
	return {
		...baseConfig,
		...preset.config,
		stations: stations.map((s) => ({ ...s })),
		stepId,
		seed,
	}
}
