import type { StepId } from "./step-config"

export type ItemStatus = "waiting" | "working" | "done" | "defective"

export interface Item {
	id: string
	status: ItemStatus
	stationId: string
	remainingWorkMs: number
	createdAtTick: number
	completedAtTick?: number
	isDefective?: boolean
}

export interface StationConfig {
	id: string
	cycleTime: number
	cycleVariance: number
	capacity: number
	bufferBefore: number
	bufferAfter: number
	defectProbability?: number
	batchSize?: number
	wipLimit?: number
}

export interface InProcessSlot {
	itemId: string
	remainingWorkMs: number
}

export interface StationState {
	stationId: string
	inputQueue: string[]
	inProcess: InProcessSlot[]
	batchBuffer: string[]
	outputQueue: string[]
	defectCount: number
}

export interface SimConfig {
	tickMs: number
	stations: StationConfig[]
	batchSize: number
	arrivalRateMs: number
	pushOrPull: "push" | "pull"
	defectProbability: number
	seed: number
	stepId: StepId
	redBins: boolean
	trainingEffectiveness: number
	reworkSendsBack: boolean
	reworkTicks: number
	revenuePerItem: number
	laborCostPerTickPerEmployee: number
	inventoryCostPerItemPerTick: number
	defectCostPerItem: number
}

export interface SimState {
	tick: number
	nextItemId: number
	items: Map<string, Item>
	stationStates: Map<string, StationState>
	completedIds: string[]
	defectiveIds: string[]
	lastArrivalTick: number
	rngState: number
	stepMarkers: { stepId: StepId; tick: number }[]
	isRunning: boolean
}

export interface TickPl {
	tick: number
	revenue: number
	laborCost: number
	inventoryCost: number
	defectCost: number
	profit: number
}

export interface CumulativePl {
	tick: number
	cumulativeRevenue: number
	cumulativeLaborCost: number
	cumulativeInventoryCost: number
	cumulativeDefectCost: number
	cumulativeProfit: number
}
