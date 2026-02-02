import type { StepId } from "./step-config";

export type DepartmentId = "dept-1" | "dept-2" | "dept-3";

export type ItemStatus = "waiting" | "working" | "done" | "defective";

export interface Item {
	id: string;
	status: ItemStatus;
	stationId: string;
	remainingWorkMs: number;
	createdAtTick: number;
	completedAtTick?: number;
	isDefective?: boolean;
	defectFromMarketChange?: boolean;
}

export interface StationConfig {
	id: string;
	departmentId?: DepartmentId;
	cycleTime: number;
	cycleVariance: number;
	capacity: number;
	bufferBefore: number;
	bufferAfter: number;
	defectProbability?: number;
	batchSize?: number;
	wipLimit?: number;
	andonEnabled?: boolean;
}

export interface InProcessSlot {
	itemId: string;
	remainingWorkMs: number;
}

export interface StationState {
	stationId: string;
	inputQueue: string[];
	inProcess: InProcessSlot[];
	batchBuffer: string[];
	outputQueue: string[];
	defectCount: number;
	defectCreatedCount: number;
	andonHoldItemId?: string | null;
}

export type LayoutMode = "departments" | "flow";

export interface SimConfig {
	tickMs: number;
	stations: StationConfig[];
	batchSize: number;
	arrivalRateMs: number;
	pushOrPull: "push" | "pull";
	defectProbability: number;
	seed: number;
	stepId: StepId;
	redBins: boolean;
	redBinsAtAllStations: boolean;
	layoutMode: LayoutMode;
	trainingEffectiveness: number;
	reworkSendsBack: boolean;
	reworkTicks: number;
	revenuePerItem: number;
	laborCostPerTickPerEmployee: number;
	inventoryCostPerItemPerTick: number;
	materialCostPerItem: number;
	defectCostCustomerShipped: number;
	andonEnabled: boolean;
	andonPauseTicks: number;
	travelTicksBetweenStations: number;
	marketChangeIntervalTicks: number | null;
	marketChangeAutoIntervalMs: number | null;
	defectOnlyAtEnd?: boolean;
	defectProbabilityAtEnd?: number;
	jidokaLineStop?: boolean;
	initialInvestment: number;
	managerReworkEnabled?: boolean;
	managerReworkProbability?: number;
}

export interface StationQuality {
	defectMultiplier: number;
	lastAndonTick?: number;
	pauseUntilTick?: number;
}

export type TransferPhase = "outbound" | "return";

export interface Transfer {
	id: string;
	itemIds: string[];
	fromStationId: string;
	toStationId: string;
	remainingTicks: number;
	phaseTicksTotal: number;
	phase: TransferPhase;
	agentId: string;
	crossDepartment?: boolean;
	isPull?: boolean;
	pullBatchSize?: number;
}

export type AgentStatus = "idle" | "walking";

export interface AgentState {
	id: string;
	status: AgentStatus;
	fromStationId: string | null;
	toStationId: string | null;
	carryingTransferId: string | null;
	progress01: number;
}

export type TickEvent =
	| { type: "defectCreated"; stationId: string; itemId: string }
	| { type: "defectCaught"; stationId: string; itemId: string }
	| { type: "defectShippedToCustomer"; itemId: string }
	| { type: "marketChangeTriggered"; tick: number }
	| { type: "andonTriggered"; stationId: string; itemId: string }
	| { type: "managerReverted"; stationId: string; itemId: string }
	| { type: "managerRejected"; stationId: string; itemId: string };

export interface SimState {
	tick: number;
	nextItemId: number;
	nextTransferId: number;
	items: Map<string, Item>;
	stationStates: Map<string, StationState>;
	transfers: Map<string, Transfer>;
	agents: Map<string, AgentState>;
	stationQuality: Map<string, StationQuality>;
	completedIds: string[];
	defectiveIds: string[];
	lastMarketChangeTick: number | null;
	nextMarketChangeTick: number | null;
	lastDefectShippedTick: number | null;
	rngState: number;
	stepMarkers: { stepId: StepId; tick: number }[];
	isRunning: boolean;
	rejectedAtEndCount: number;
	jidokaUntilTick?: number;
	jidokaStationId?: string;
	isBust: boolean;
	pendingAndonStationIds: string[];
	managerFromStationId: string | null;
	managerToStationId: string | null;
	managerArrivesAtTick: number | null;
}

export interface TickPl {
	tick: number;
	revenue: number;
	laborCost: number;
	inventoryCost: number;
	materialCost: number;
	materialUnits: number;
	defectCost: number;
	profit: number;
	completedCount: number;
	laborTicks: number;
	wip: number;
	defectCount: number;
}

export interface CumulativePl {
	tick: number;
	cumulativeRevenue: number;
	cumulativeLaborCost: number;
	cumulativeInventoryCost: number;
	cumulativeMaterialCost: number;
	cumulativeMaterialUnits: number;
	cumulativeDefectCost: number;
	cumulativeProfit: number;
	cumulativeCompleted: number;
	cumulativeLaborTicks: number;
	cumulativeWipSum: number;
	cumulativeDefects: number;
}

export interface TickInputs {
	marketChangeRequested?: boolean;
}

export interface TickResult {
	state: SimState;
	events: TickEvent[];
}
