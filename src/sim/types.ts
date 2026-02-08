import type { ConfigStepId } from "./step-config";

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
	batchSize: number;
	trainingEffectiveness: number;
	andonEnabled: boolean;
	defectProbability: number;
	redBinCatchProbability?: number;
	redBin?: boolean;
	reworkSendsBack?: boolean;
	reworkTicks?: number;
	andonPauseTicks?: number;
	travelTicks?: number;
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
	simTicksPerSecond: number;
	speed: number;
	stations: StationConfig[];
	pushOrPull: "push" | "pull";
	stepId: ConfigStepId;
	layoutMode: LayoutMode;
	revenuePerItem: number;
	laborCostPerTickPerEmployee: number;
	inventoryCostPerItemPerTick: number;
	materialCostPerItem: number;
	defectCostCustomerShipped: number;
	marketChangeIntervalTicks: number | null;
	marketChangeAutoIntervalMs: number | null;
	jidokaLineStop?: boolean;
	initialInvestment: number;
	managerReworkProbability?: number;
}

export function getSimulationMsPerTick(config: SimConfig): number {
	return 1000 / config.simTicksPerSecond;
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
	| { type: "materialConsumed"; itemId: string }
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
	totalCompletedCount?: number;
	totalDefectiveCount?: number;
	lastMarketChangeTick: number | null;
	nextMarketChangeTick: number | null;
	lastDefectShippedTick: number | null;
	rngState: number;
	stepMarkers: { stepId: ConfigStepId; tick: number }[];
	isRunning: boolean;
	rejectedAtEndCount: number;
	jidokaUntilTick?: number;
	jidokaStationId?: string;
	isBust: boolean;
	endedAt24Months: boolean;
	pendingAndonStationIds: string[];
	managerFromStationId: string | null;
	managerToStationId: string | null;
	managerArrivesAtTick: number | null;
	managerResolvesAtTick: number | null;
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
