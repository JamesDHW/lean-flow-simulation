import { useId } from "react";
import {
	getDefectProbabilityPercentByStation,
	getMeasuredDefectPercentByStation,
} from "../metrics";
import { STEP_PRESETS } from "../presets";
import { useSimSnapshot, useSimStore } from "../SimProvider";
import type { Item, SimConfig, SimState, StationState } from "../types";
import {
	getCustomerPosition,
	getDepartmentBoxes,
	getLayoutBounds,
	getStationPositions,
	STATION_HEIGHT,
	STATION_WIDTH,
} from "./layout";

const ITEM_W = 16;
const ITEM_H = 12;
const ITEM_STYLE = { transition: "x 180ms ease-out, y 180ms ease-out" };
const BATCH_BUFFER_PURPLE = "#a855f7";
const CUSTOMER_SAD_TICKS = 30;
const FINAL_BIN_BOX_W = 16;
const FINAL_BIN_BOX_H = 14;
const FINAL_BIN_STACK_COLS = 8;
const FINAL_BIN_MAX_VISIBLE = 32;
const STATION_RED_PILE_COLS = 4;
const STATION_RED_PILE_MAX = 12;
const STATION_RED_BOX_W = 10;
const STATION_RED_BOX_H = 8;
const STATION_HEADER_H = 44;
const STATION_WORKER_ROW_Y = 90;
const STATION_AGENT_ROW_Y = 112;

function itemColor(
	item: Item,
	inBatchBuffer: boolean,
	showDefectRed: boolean,
): string {
	if (showDefectRed && (item.status === "defective" || item.isDefective))
		return "#ef4444";
	if (inBatchBuffer) return BATCH_BUFFER_PURPLE;
	if (item.status === "done") return "#22c55e";
	if (item.status === "working") return "#3b82f6";
	return "#eab308";
}

function hasRedBinAtStation(
	config: SimConfig,
	stationId: string,
	stationIndex: number,
): boolean {
	const order = config.stations.map((s) => s.id);
	const isLast = stationIndex === order.length - 1;
	const station = config.stations[stationIndex];
	return station?.redBin ?? isLast;
}

function walkPosition(
	from: { x: number; y: number },
	to: { x: number; y: number },
	p: number,
	crossDept: boolean,
	returnPhase: boolean,
): { x: number; y: number } {
	if (crossDept) {
		const mx = (from.x + to.x) / 2;
		const my = (from.y + to.y) / 2;
		if (returnPhase) {
			if (p <= 0.5) {
				const t = p * 2;
				return { x: from.x + (mx - from.x) * t, y: from.y + (my - from.y) * t };
			}
			const t = (p - 0.5) * 2;
			return { x: mx + (to.x - mx) * t, y: my + (to.y - my) * t };
		}
		if (p < 0.5) {
			const t = p * 2;
			return { x: from.x + (mx - from.x) * t, y: from.y + (my - from.y) * t };
		}
		const t = (p - 0.5) * 2;
		return { x: mx + (to.x - mx) * t, y: my + (to.y - my) * t };
	}
	if (returnPhase) {
		return {
			x: to.x + (from.x - to.x) * (1 - p),
			y: to.y + (from.y - to.y) * (1 - p),
		};
	}
	return { x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p };
}

function getItemPositions(
	state: SimState,
	config: SimConfig,
	stationPositions: Map<string, { x: number; y: number }>,
): Map<string, { x: number; y: number }> {
	const positions = new Map<string, { x: number; y: number }>();
	const order = config.stations.map((s) => s.id);
	const itemsInTransit = new Set<string>();
	for (const t of state.transfers.values()) {
		for (const id of t.itemIds) itemsInTransit.add(id);
	}

	order.forEach((stationId, stationIndex) => {
		const st = state.stationStates.get(stationId);
		const base = stationPositions.get(stationId);
		if (!base || !st) return;
		const baseX = base.x;
		const baseY = base.y + STATION_HEADER_H;

		const inputStartX = baseX + 8;
		st.inputQueue.forEach((itemId, i) => {
			if (itemsInTransit.has(itemId)) return;
			positions.set(itemId, {
				x: inputStartX + (i % 4) * (ITEM_W + 4),
				y: baseY + Math.floor(i / 4) * (ITEM_H + 4),
			});
		});

		st.inProcess.forEach((slot, i) => {
			if (itemsInTransit.has(slot.itemId)) return;
			positions.set(slot.itemId, {
				x: baseX + STATION_WIDTH / 2 - ITEM_W / 2,
				y: baseY + 12 + i * (ITEM_H + 6),
			});
		});

		const batchBufferX = baseX + STATION_WIDTH - 52;
		st.batchBuffer.forEach((itemId, i) => {
			if (itemsInTransit.has(itemId)) return;
			positions.set(itemId, {
				x: batchBufferX - (i % 3) * (ITEM_W + 4),
				y: baseY + 20 + Math.floor(i / 3) * (ITEM_H + 4),
			});
		});

		const outputStartX = baseX + STATION_WIDTH - 8 - ITEM_W;
		st.outputQueue.forEach((itemId, i) => {
			if (itemsInTransit.has(itemId)) return;
			positions.set(itemId, {
				x: outputStartX - (i % 4) * (ITEM_W + 4),
				y: baseY + Math.floor(i / 4) * (ITEM_H + 4),
			});
		});

		if (st.andonHoldItemId != null && !itemsInTransit.has(st.andonHoldItemId)) {
			const andonX = baseX + STATION_WIDTH / 2 - ITEM_W / 2;
			const andonY = baseY + 24;
			positions.set(st.andonHoldItemId, { x: andonX, y: andonY });
		}
	});

	for (const agent of state.agents.values()) {
		if (
			agent.status !== "walking" ||
			!agent.fromStationId ||
			!agent.toStationId
		)
			continue;
		const from = stationPositions.get(agent.fromStationId);
		const to = stationPositions.get(agent.toStationId);
		if (!from || !to) continue;
		const transfer = agent.carryingTransferId
			? state.transfers.get(agent.carryingTransferId)
			: null;
		const crossDept = transfer?.crossDepartment ?? false;
		const returnPhase = transfer?.phase === "return";
		const { x: px, y: py } = walkPosition(
			from,
			to,
			agent.progress01,
			crossDept,
			returnPhase,
		);
		const x = px + STATION_WIDTH / 2 - ITEM_W / 2;
		const y = py + STATION_AGENT_ROW_Y;
		if (transfer) {
			transfer.itemIds.forEach((itemId, i) => {
				positions.set(itemId, {
					x: x + (i % 2) * (ITEM_W + 2),
					y: y + Math.floor(i / 2) * (ITEM_H + 2),
				});
			});
		}
	}

	return positions;
}

export function ProductionLineSvg() {
	const titleId = useId();
	const store = useSimStore();
	const state = useSimSnapshot((s) => s.state);
	const config = useSimSnapshot((s) => s.config);
	const enabled = (STEP_PRESETS[config.stepId] ?? STEP_PRESETS.intro)
		.enabledControls;
	const stationPositions = getStationPositions(config);
	const positions = getItemPositions(state, config, stationPositions);
	const stationOrder = config.stations.map((s) => s.id);
	const departmentBoxes = getDepartmentBoxes(config);
	const { width, height } = getLayoutBounds(config);
	const tickIntervalMs = 1000 / config.speed;
	const customerSad =
		(state.totalDefectiveCount ?? state.defectiveIds.length) > 0 ||
		(state.lastDefectShippedTick != null &&
			state.tick - state.lastDefectShippedTick < CUSTOMER_SAD_TICKS);
	const defectRateByStation = getMeasuredDefectPercentByStation(state);
	const defectProbabilityByStation = getDefectProbabilityPercentByStation(
		state,
		config,
	);

	const allItemIds = new Set<string>();
	for (const st of state.stationStates.values()) {
		for (const id of st.inputQueue) allItemIds.add(id);
		for (const slot of st.inProcess) allItemIds.add(slot.itemId);
		for (const id of st.batchBuffer) allItemIds.add(id);
		for (const id of st.outputQueue) allItemIds.add(id);
		if (st.andonHoldItemId != null) allItemIds.add(st.andonHoldItemId);
	}
	for (const t of state.transfers.values()) {
		for (const id of t.itemIds) allItemIds.add(id);
	}

	return (
		<div className="p-3 bg-factory-panel rounded-sm border-2 border-factory-border min-h-[200px]">
			<div className="overflow-x-auto">
				<svg
					viewBox={`0 0 ${width} ${height}`}
					className={`w-full h-auto mx-auto ${config.layoutMode === "flow" ? "max-w-10xl" : "max-w-5xl"}`}
					style={{ minHeight: 200 }}
					aria-labelledby={titleId}
					role="img"
				>
					<title id={titleId}>Production line with stations and items</title>
					{departmentBoxes.map((box) => (
						<g key={box.departmentId}>
							<rect
								x={box.x}
								y={box.y}
								width={box.width}
								height={box.height}
								rx={8}
								fill="rgb(30 41 59 / 0.5)"
								stroke="rgb(71 85 105)"
								strokeWidth={2}
							/>
							<text
								x={box.x + box.width / 2}
								y={box.y + 14}
								textAnchor="middle"
								fill="rgb(148 163 184)"
								fontSize={10}
							>
								{box.label}
							</text>
						</g>
					))}
					{stationOrder.map((stationId, i) => {
						const base = stationPositions.get(stationId);
						if (!base) return null;
						const x = base.x;
						const y = base.y;
						const quality = state.stationQuality.get(stationId);
						const defectMultiplier = quality?.defectMultiplier ?? 1;
						const greenness = Math.max(0, 1 - defectMultiplier);
						const fill = `rgb(${30 + greenness * 20} ${41 + greenness * 30} ${59})`;
						const stationState = state.stationStates.get(stationId);
						const andonHold = stationState?.andonHoldItemId != null;
						const tlAtStationResolving =
							state.managerToStationId === stationId &&
							state.managerResolvesAtTick != null &&
							state.tick < state.managerResolvesAtTick;
						const andonOn = andonHold || tlAtStationResolving;
						const showRedBin = hasRedBinAtStation(config, stationId, i);
						const showBlueBin = config.pushOrPull === "pull";
						const defectCount =
							state.stationStates.get(stationId)?.defectCount ?? 0;
						return (
							<g key={stationId}>
								<rect
									x={x}
									y={y}
									width={STATION_WIDTH}
									height={STATION_HEIGHT}
									rx={6}
									fill={fill}
									stroke="rgb(71 85 105)"
									strokeWidth={1}
								/>
								<text
									x={x + STATION_WIDTH / 2}
									y={y + 20}
									textAnchor="middle"
									fill="rgb(148 163 184)"
									fontSize={12}
								>
									Station {i + 1}
								</text>
								<text
									x={x + STATION_WIDTH / 2}
									y={y + 34}
									textAnchor="middle"
									fill="rgb(148 163 184)"
									fontSize={9}
								>
									P:{(defectProbabilityByStation[stationId] ?? 0).toFixed(0)}%
									R:
									{(defectRateByStation[stationId] ?? 0).toFixed(1)}%
								</text>
								{showBlueBin && (
									<g aria-label="Blue bin (pull)">
										<rect
											x={x + STATION_WIDTH - 36}
											y={y + 4}
											width={28}
											height={24}
											rx={2}
											fill="#3b82f6"
											stroke="#1d4ed8"
											strokeWidth={1}
										/>
										<text
											x={x + STATION_WIDTH - 22}
											y={y + 20}
											textAnchor="middle"
											fill="white"
											fontSize={8}
										>
											bin
										</text>
									</g>
								)}
								{andonOn && (
									<circle
										cx={x + STATION_WIDTH - 16}
										cy={y + 28}
										r={6}
										fill="#eab308"
										opacity={0.9}
										aria-label="Andon"
									/>
								)}
								{showRedBin && (
									<g aria-label={`Red bin: ${defectCount} defects`}>
										{Array.from(
											{ length: Math.min(defectCount, STATION_RED_PILE_MAX) },
											(_, k) => {
												const col = k % STATION_RED_PILE_COLS;
												const row = Math.floor(k / STATION_RED_PILE_COLS);
												const binLeft = x + STATION_WIDTH - 36;
												const pileGap = 8;
												return (
													<rect
														key={`pile-${stationId}-${col}-${row}`}
														x={
															binLeft -
															(STATION_RED_PILE_COLS - col) *
																(STATION_RED_BOX_W + 2)
														}
														y={
															y +
															STATION_HEIGHT -
															28 -
															pileGap -
															(row + 1) * (STATION_RED_BOX_H + 2)
														}
														width={STATION_RED_BOX_W}
														height={STATION_RED_BOX_H}
														rx={1}
														fill="#ef4444"
														stroke="#b91c1c"
														strokeWidth={1}
													/>
												);
											},
										)}
										<rect
											x={x + STATION_WIDTH - 36}
											y={y + STATION_HEIGHT - 24}
											width={28}
											height={24}
											rx={2}
											fill="#ef4444"
											stroke="#b91c1c"
											strokeWidth={1}
										/>
										<text
											x={x + STATION_WIDTH - 22}
											y={y + STATION_HEIGHT - 10}
											textAnchor="middle"
											fill="white"
											fontSize={8}
										>
											{defectCount > 0 ? `bin (${defectCount})` : "bin"}
										</text>
									</g>
								)}
							</g>
						);
					})}
					{(() => {
						const sortedAgents = Array.from(state.agents.values()).sort(
							(a, b) => a.id.localeCompare(b.id),
						);
						const jidokaStationId = state.jidokaStationId;
						const jidokaActive =
							state.jidokaUntilTick != null &&
							state.tick < state.jidokaUntilTick &&
							jidokaStationId != null;
						const JIDOKA_CIRCLE_RADIUS = 50;
						return sortedAgents.map((agent, index) => {
							let ax: number;
							let ay: number;
							if (jidokaActive && jidokaStationId) {
								const jidokaPos = stationPositions.get(jidokaStationId);
								// jidokaStationId is the station that triggered the line stop
								if (!jidokaPos) return null;
								const cx = jidokaPos.x + STATION_WIDTH / 2;
								const cy = jidokaPos.y + STATION_AGENT_ROW_Y;
								const n = sortedAgents.length;
								const theta = n > 0 ? (2 * Math.PI * index) / n : 0;
								ax = cx + JIDOKA_CIRCLE_RADIUS * Math.cos(theta);
								ay = cy + JIDOKA_CIRCLE_RADIUS * Math.sin(theta);
							} else if (
								agent.status === "walking" &&
								agent.fromStationId &&
								agent.toStationId
							) {
								const from = stationPositions.get(agent.fromStationId);
								const to = stationPositions.get(agent.toStationId);
								if (!from || !to) return null;
								const transfer = agent.carryingTransferId
									? state.transfers.get(agent.carryingTransferId)
									: null;
								const { x: px, y: py } = walkPosition(
									from,
									to,
									agent.progress01,
									transfer?.crossDepartment ?? false,
									transfer?.phase === "return",
								);
								ax = px + STATION_WIDTH / 2;
								ay = py + STATION_AGENT_ROW_Y;
							} else {
								const homeStationId = agent.id.replace(/^agent-/, "");
								const pos = stationPositions.get(homeStationId);
								if (!pos) return null;
								ax = pos.x + STATION_WIDTH / 2;
								ay = pos.y + STATION_AGENT_ROW_Y;
							}
							return (
								<g
									key={agent.id}
									aria-label="Worker"
									style={{
										transform: `translate(${ax}px, ${ay}px)`,
										transition: `transform ${tickIntervalMs}ms linear`,
									}}
								>
									<circle
										cx={0}
										cy={0}
										r={10}
										fill={
											jidokaActive
												? "#ef4444"
												: index % 2 === 0
													? "#d35400"
													: "#b87333"
										}
									/>
								</g>
							);
						});
					})()}
					{config.stations.some((s) => s.andonEnabled) &&
						(() => {
							const fromId = state.managerFromStationId;
							const toId = state.managerToStationId;
							const arrivesAt = state.managerArrivesAtTick;
							let mx: number;
							let my: number;
							if (toId && arrivesAt != null) {
								const fromPos = fromId
									? stationPositions.get(fromId)
									: stationPositions.get(stationOrder[0]);
								const toPos = stationPositions.get(toId);
								if (fromPos && toPos) {
									const progress = state.tick >= arrivesAt ? 1 : 0;
									const pos = walkPosition(
										fromPos,
										toPos,
										progress,
										false,
										false,
									);
									mx = pos.x + STATION_WIDTH / 2;
									my = pos.y + STATION_WORKER_ROW_Y;
								} else {
									const fallback = stationPositions.get(stationOrder[0]) ?? {
										x: 0,
										y: 0,
									};
									mx = fallback.x + STATION_WIDTH / 2;
									my = fallback.y + STATION_WORKER_ROW_Y;
								}
							} else {
								const homePos = fromId
									? stationPositions.get(fromId)
									: stationPositions.get(stationOrder[0]);
								if (homePos) {
									mx = homePos.x + STATION_WIDTH / 2;
									my = homePos.y + STATION_WORKER_ROW_Y;
								} else {
									mx = 50;
									my = STATION_WORKER_ROW_Y;
								}
							}
							return (
								<g
									aria-label="Manager"
									style={{
										transform: `translate(${mx}px, ${my}px)`,
										transition: `transform ${tickIntervalMs}ms linear`,
									}}
								>
									<circle cx={0} cy={0} r={12} fill="#eab308" />
									<text
										x={0}
										y={4}
										textAnchor="middle"
										fill="white"
										fontSize={10}
										fontWeight="bold"
									>
										TL
									</text>
								</g>
							);
						})()}
					{stationOrder.length > 0 &&
						(() => {
							const { x: cx, y: cy } = getCustomerPosition(config);
							return (
								<g aria-label={customerSad ? "Customer sad" : "Customer"}>
									<circle
										cx={cx}
										cy={cy}
										r={16}
										fill={customerSad ? "#ef4444" : "#22c55e"}
									/>
									<text
										x={cx}
										y={cy + 5}
										textAnchor="middle"
										fill="white"
										fontSize={14}
									>
										{customerSad ? "☹" : "☺"}
									</text>
								</g>
							);
						})()}
					{stationOrder.length > 0 &&
						(() => {
							const { x: cx, y: cy } = getCustomerPosition(config);
							const binH = 100;
							const binY = cy - binH / 2;
							const greenCount =
								state.totalCompletedCount ?? state.completedIds.length;
							const lastStationId = stationOrder[stationOrder.length - 1];
							const rejectedAtEnd = lastStationId
								? (state.stationStates.get(lastStationId)?.defectCount ?? 0)
								: (state.rejectedAtEndCount ?? 0);
							const defectsReachedCustomer =
								state.totalDefectiveCount ?? state.defectiveIds.length;
							const redCount = rejectedAtEnd + defectsReachedCustomer;
							const binW = 160;
							const greenX = cx - binW - 28;
							const redX = cx + 28;
							return (
								<g aria-label="Final bins">
									<g aria-label={`Accepted: ${greenCount}`}>
										<rect
											x={greenX}
											y={binY}
											width={binW}
											height={binH}
											rx={8}
											fill="rgb(34 197 94 / 0.3)"
											stroke="#22c55e"
											strokeWidth={1}
										/>
										<text
											x={greenX + binW / 2}
											y={binY + 16}
											textAnchor="middle"
											fill="rgb(148 163 184)"
											fontSize={10}
										>
											Accepted
										</text>
										{Array.from(
											{ length: Math.min(greenCount, FINAL_BIN_MAX_VISIBLE) },
											(_, k) => {
												const col = k % FINAL_BIN_STACK_COLS;
												const row = Math.floor(k / FINAL_BIN_STACK_COLS);
												return (
													<rect
														key={`accepted-box-${col}-${row}`}
														x={greenX + 6 + col * (FINAL_BIN_BOX_W + 2)}
														y={binY + 24 + row * (FINAL_BIN_BOX_H + 2)}
														width={FINAL_BIN_BOX_W}
														height={FINAL_BIN_BOX_H}
														rx={1}
														fill="#22c55e"
														stroke="rgb(21 128 61)"
														strokeWidth={1}
													/>
												);
											},
										)}
										{greenCount > FINAL_BIN_MAX_VISIBLE && (
											<text
												x={greenX + binW / 2}
												y={binY + binH - 6}
												textAnchor="middle"
												fill="rgb(148 163 184)"
												fontSize={8}
											>
												+{greenCount - FINAL_BIN_MAX_VISIBLE}
											</text>
										)}
									</g>
									<g aria-label={`Rejected: ${redCount}`}>
										<rect
											x={redX}
											y={binY}
											width={binW}
											height={binH}
											rx={8}
											fill="rgb(239 68 68 / 0.3)"
											stroke="#ef4444"
											strokeWidth={1}
										/>
										<text
											x={redX + binW / 2}
											y={binY + 16}
											textAnchor="middle"
											fill="rgb(148 163 184)"
											fontSize={10}
										>
											Rejected
										</text>
										{Array.from(
											{ length: Math.min(redCount, FINAL_BIN_MAX_VISIBLE) },
											(_, k) => {
												const col = k % FINAL_BIN_STACK_COLS;
												const row = Math.floor(k / FINAL_BIN_STACK_COLS);
												return (
													<rect
														key={`rejected-box-${col}-${row}`}
														x={redX + 6 + col * (FINAL_BIN_BOX_W + 2)}
														y={binY + 24 + row * (FINAL_BIN_BOX_H + 2)}
														width={FINAL_BIN_BOX_W}
														height={FINAL_BIN_BOX_H}
														rx={1}
														fill="#ef4444"
														stroke="#b91c1c"
														strokeWidth={1}
													/>
												);
											},
										)}
										{redCount > FINAL_BIN_MAX_VISIBLE && (
											<text
												x={redX + binW / 2}
												y={binY + binH - 6}
												textAnchor="middle"
												fill="rgb(148 163 184)"
												fontSize={8}
											>
												+{redCount - FINAL_BIN_MAX_VISIBLE}
											</text>
										)}
									</g>
								</g>
							);
						})()}
					{Array.from(allItemIds).map((itemId) => {
						const item = state.items.get(itemId);
						const pos = positions.get(itemId);
						if (!item || !pos) return null;
						const inBatchBuffer = stationOrder.some((sid) =>
							state.stationStates.get(sid)?.batchBuffer.includes(itemId),
						);
						const showDefectRed = config.stepId !== "intro";
						const fill = itemColor(item, inBatchBuffer, showDefectRed);
						return (
							<rect
								key={itemId}
								x={pos.x}
								y={pos.y}
								width={ITEM_W}
								height={ITEM_H}
								rx={2}
								fill={fill}
								stroke="rgb(15 23 42)"
								strokeWidth={1}
								style={ITEM_STYLE}
							/>
						);
					})}
				</svg>
			</div>
			{(enabled.andon ||
				enabled.cycleTime ||
				enabled.cycleVariance ||
				enabled.batchSize ||
				enabled.defectProbability ||
				enabled.trainingEffectiveness) && (
				<div className="w-full max-w-full min-w-0 mt-3 flex flex-wrap justify-between gap-3 overflow-hidden">
					{config.stations.map((station, i) => (
						<div
							key={station.id}
							className="flex flex-col gap-2 px-2 py-2 rounded-sm bg-factory-surface border-2 border-factory-border min-w-[140px] flex-shrink-0"
						>
							<span className="text-xs font-medium text-text-muted">
								Station {i + 1}
							</span>
							<div className="flex flex-col gap-0.5 text-xs">
								<span className="text-text-muted">Defect prob (effective)</span>
								<span className="text-text font-medium tabular-nums">
									{(defectProbabilityByStation[station.id] ?? 0).toFixed(1)}%
								</span>
							</div>
							<div className="flex flex-col gap-0.5 text-xs">
								<span className="text-text-muted">Defect rate (measured)</span>
								<span className="text-text font-medium tabular-nums">
									{(defectRateByStation[station.id] ?? 0).toFixed(1)}%
								</span>
							</div>
							{enabled.defectProbability && (
								<label className="flex flex-col gap-0.5 text-xs">
									<span className="text-text-muted">Defect prob (base %)</span>
									<input
										type="range"
										min={0}
										max={100}
										value={Math.round(station.defectProbability * 100)}
										onChange={(e) => {
											const next = config.stations.map((s, j) =>
												j === i
													? {
															...s,
															defectProbability: Number(e.target.value) / 100,
														}
													: s,
											);
											store.updateConfig({ stations: next });
										}}
										className="w-full accent-rust"
									/>
									<span className="text-factory-muted tabular-nums">
										{Math.round(station.defectProbability * 100)}%
									</span>
								</label>
							)}
							{enabled.trainingEffectiveness && (
								<label className="flex flex-col gap-0.5 text-xs">
									<span className="text-text-muted">Training %</span>
									<input
										type="range"
										min={0}
										max={100}
										value={Math.round(station.trainingEffectiveness * 100)}
										onChange={(e) => {
											const next = config.stations.map((s, j) =>
												j === i
													? {
															...s,
															trainingEffectiveness:
																Number(e.target.value) / 100,
														}
													: s,
											);
											store.updateConfig({ stations: next });
										}}
										className="w-full accent-rust"
									/>
									<span className="text-factory-muted tabular-nums">
										{Math.round(station.trainingEffectiveness * 100)}%
									</span>
								</label>
							)}
							{enabled.andon && (
								<label className="flex flex-col gap-0.5 text-xs">
									<span className="text-text-muted">Andon</span>
									<select
										value={station.andonEnabled ? "on" : "off"}
										onChange={(e) => {
											const next = config.stations.map((s, j) =>
												j === i
													? { ...s, andonEnabled: e.target.value === "on" }
													: s,
											);
											store.updateConfig({ stations: next });
										}}
										className="w-full rounded-sm border-2 border-factory-border bg-factory-panel text-text px-1.5 py-1 text-xs"
									>
										<option value="off">Off</option>
										<option value="on">On</option>
									</select>
								</label>
							)}
							{enabled.batchSize && (
								<label className="flex flex-col gap-0.5 text-xs">
									<span className="text-text-muted">Batch</span>
									<input
										type="range"
										min={1}
										max={10}
										value={station.batchSize}
										onChange={(e) => {
											const next = config.stations.map((s, j) =>
												j === i
													? { ...s, batchSize: Number(e.target.value) }
													: s,
											);
											store.updateConfig({ stations: next });
										}}
										className="w-full accent-rust"
									/>
									<span className="text-factory-muted tabular-nums">
										{station.batchSize}
									</span>
								</label>
							)}
							{enabled.cycleTime && (
								<label className="flex flex-col gap-0.5 text-xs">
									<span className="text-text-muted">Task time (ms)</span>
									<input
										type="range"
										min={200}
										max={1200}
										step={50}
										value={station.cycleTime}
										onChange={(e) => {
											const next = config.stations.map((s, j) =>
												j === i
													? { ...s, cycleTime: Number(e.target.value) }
													: s,
											);
											store.updateConfig({ stations: next });
										}}
										className="w-full accent-rust"
									/>
									<span className="text-factory-muted tabular-nums">
										{station.cycleTime}
									</span>
								</label>
							)}
							{enabled.cycleVariance && (
								<label className="flex flex-col gap-0.5 text-xs">
									<span className="text-text-muted">Variance</span>
									<input
										type="range"
										min={0}
										max={200}
										step={10}
										value={station.cycleVariance}
										onChange={(e) => {
											const next = config.stations.map((s, j) =>
												j === i
													? { ...s, cycleVariance: Number(e.target.value) }
													: s,
											);
											store.updateConfig({ stations: next });
										}}
										className="w-full accent-rust"
									/>
									<span className="text-factory-muted tabular-nums">
										{station.cycleVariance}
									</span>
								</label>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
