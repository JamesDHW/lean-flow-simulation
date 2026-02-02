import type { DepartmentId, SimConfig, StationConfig } from "../types";

const STATION_WIDTH = 200;
const STATION_HEIGHT = 200;
const PADDING = 24;
const BOX_GAP = 32;
const DEPT_LABELS: Record<DepartmentId, string> = {
	"dept-1": "Department 1",
	"dept-2": "Department 2",
	"dept-3": "Department 3",
};

export interface StationPosition {
	x: number;
	y: number;
	departmentId: DepartmentId | undefined;
}

export interface DepartmentBox {
	departmentId: DepartmentId;
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
}

function groupByDepartment(
	stations: StationConfig[],
): Map<DepartmentId, StationConfig[]> {
	const map = new Map<DepartmentId, StationConfig[]>();
	for (const s of stations) {
		const dept = s.departmentId ?? ("dept-1" as DepartmentId);
		const list = map.get(dept) ?? [];
		list.push(s);
		map.set(dept, list);
	}
	return map;
}

export function getStationPositions(
	config: SimConfig,
): Map<string, StationPosition> {
	const positions = new Map<string, StationPosition>();
	const { stations, layoutMode } = config;
	const order = stations.map((s) => s.id);

	if (layoutMode === "flow") {
		order.forEach((stationId, i) => {
			positions.set(stationId, {
				x: PADDING + i * (STATION_WIDTH + 16),
				y: PADDING + 20,
				departmentId: stations[i]?.departmentId,
			});
		});
		return positions;
	}

	const byDept = groupByDepartment(stations);
	const deptOrder: DepartmentId[] = ["dept-1", "dept-2", "dept-3"];
	let x = PADDING;
	for (const deptId of deptOrder) {
		const list = byDept.get(deptId);
		if (!list?.length) {
			x += STATION_WIDTH + BOX_GAP;
			continue;
		}
		list.forEach((s, j) => {
			positions.set(s.id, {
				x,
				y: PADDING + 40 + j * (STATION_HEIGHT + 16),
				departmentId: deptId,
			});
		});
		x += STATION_WIDTH + BOX_GAP;
	}
	return positions;
}

export function getDepartmentBoxes(config: SimConfig): DepartmentBox[] {
	if (config.layoutMode !== "departments") return [];
	const byDept = groupByDepartment(config.stations);
	const deptOrder: DepartmentId[] = ["dept-1", "dept-2", "dept-3"];
	const boxes: DepartmentBox[] = [];
	let x = PADDING;
	for (const deptId of deptOrder) {
		const list = byDept.get(deptId);
		if (!list?.length) {
			x += STATION_WIDTH + BOX_GAP;
			continue;
		}
		const height = list.length * (STATION_HEIGHT + 16) - 16 + 48;
		boxes.push({
			departmentId: deptId,
			x: x - 4,
			y: PADDING,
			width: STATION_WIDTH + 8,
			height,
			label: DEPT_LABELS[deptId],
		});
		x += STATION_WIDTH + BOX_GAP;
	}
	return boxes;
}

const CUSTOMER_ROW_GAP = 20;
const CUSTOMER_ROW_BOX_HALF = 50;

export function getCustomerPosition(config: SimConfig): {
	x: number;
	y: number;
} {
	const positions = getStationPositions(config);
	if (positions.size === 0)
		return {
			x: PADDING + STATION_WIDTH / 2,
			y: PADDING + STATION_HEIGHT + CUSTOMER_ROW_GAP,
		};
	let minX = Infinity;
	let maxX = 0;
	let maxY = 0;
	for (const pos of positions.values()) {
		minX = Math.min(minX, pos.x);
		maxX = Math.max(maxX, pos.x + STATION_WIDTH);
		maxY = Math.max(maxY, pos.y + STATION_HEIGHT);
	}
	const centerX =
		minX === Infinity ? PADDING + STATION_WIDTH / 2 : (minX + maxX) / 2;
	const y = maxY + CUSTOMER_ROW_GAP + CUSTOMER_ROW_BOX_HALF;
	return { x: centerX, y };
}

export function getLayoutBounds(config: SimConfig): {
	width: number;
	height: number;
} {
	const positions = getStationPositions(config);
	let maxX = 0;
	let maxY = 0;
	for (const pos of positions.values()) {
		maxX = Math.max(maxX, pos.x + STATION_WIDTH);
		maxY = Math.max(maxY, pos.y + STATION_HEIGHT);
	}
	const customerRowHeight = CUSTOMER_ROW_GAP + CUSTOMER_ROW_BOX_HALF * 2;
	return {
		width: maxX + PADDING + 80,
		height: maxY + PADDING + customerRowHeight,
	};
}

export { STATION_WIDTH, STATION_HEIGHT, PADDING };
