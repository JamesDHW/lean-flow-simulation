import { useId } from "react";
import { STEP_PRESETS } from "../presets";
import { useSimSnapshot, useSimStore } from "../SimProvider";
import type { Item, StationState } from "../types";

const STATION_WIDTH = 200;
const STATION_HEIGHT = 200;
const PADDING = 24;
const ITEM_W = 16;
const ITEM_H = 12;
const ITEM_STYLE = { transition: "x 180ms ease-out, y 180ms ease-out" };

const BATCH_BUFFER_PURPLE = "#a855f7";

function itemColor(item: Item, inBatchBuffer: boolean): string {
	if (inBatchBuffer) return BATCH_BUFFER_PURPLE;
	if (item.status === "defective" || item.isDefective) return "#ef4444";
	if (item.status === "done") return "#22c55e";
	if (item.status === "working") return "#3b82f6";
	return "#eab308";
}

function getItemPositions(
	state: { stationStates: Map<string, StationState>; items: Map<string, Item> },
	config: { stations: { id: string }[] },
): Map<string, { x: number; y: number }> {
	const positions = new Map<string, { x: number; y: number }>();
	const stationOrder = config.stations.map((s) => s.id);

	stationOrder.forEach((stationId, stationIndex) => {
		const st = state.stationStates.get(stationId);
		if (!st) return;
		const baseX = PADDING + stationIndex * STATION_WIDTH;
		const baseY = PADDING + 20;

		const inputStartX = baseX + 8;
		st.inputQueue.forEach((itemId, i) => {
			positions.set(itemId, {
				x: inputStartX + (i % 4) * (ITEM_W + 4),
				y: baseY + Math.floor(i / 4) * (ITEM_H + 4),
			});
		});

		const processCenterX = baseX + STATION_WIDTH / 2 - ITEM_W / 2;
		st.inProcess.forEach((slot, i) => {
			positions.set(slot.itemId, {
				x: processCenterX,
				y: baseY + 24 + i * (ITEM_H + 6),
			});
		});

		const batchBufferX = baseX + STATION_WIDTH - 52;
		st.batchBuffer.forEach((itemId, i) => {
			positions.set(itemId, {
				x: batchBufferX - (i % 3) * (ITEM_W + 4),
				y: baseY + 20 + Math.floor(i / 3) * (ITEM_H + 4),
			});
		});

		const outputStartX = baseX + STATION_WIDTH - 8 - ITEM_W;
		st.outputQueue.forEach((itemId, i) => {
			positions.set(itemId, {
				x: outputStartX - (i % 4) * (ITEM_W + 4),
				y: baseY + Math.floor(i / 4) * (ITEM_H + 4),
			});
		});
	});

	return positions;
}

export function ProductionLineSvg() {
	const titleId = useId();
	const store = useSimStore();
	const state = useSimSnapshot((s) => s.state);
	const config = useSimSnapshot((s) => s.config);
	const enabled = STEP_PRESETS[config.stepId].enabledControls;
	const positions = getItemPositions(state, config);
	const stationOrder = config.stations.map((s) => s.id);
	const width = PADDING * 2 + stationOrder.length * STATION_WIDTH;
	const height = PADDING * 2 + STATION_HEIGHT + 60;

	const allItemIds = new Set<string>();
	for (const st of state.stationStates.values()) {
		for (const id of st.inputQueue) allItemIds.add(id);
		for (const slot of st.inProcess) allItemIds.add(slot.itemId);
		for (const id of st.batchBuffer) allItemIds.add(id);
		for (const id of st.outputQueue) allItemIds.add(id);
	}

	return (
		<div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 min-h-[200px] overflow-x-auto">
			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="w-full h-auto"
				style={{ minHeight: 200 }}
				aria-labelledby={titleId}
				role="img"
			>
				<title id={titleId}>Production line with stations and items</title>
				{stationOrder.map((stationId, i) => {
					const x = PADDING + i * STATION_WIDTH;
					const y = PADDING;
					return (
						<g key={stationId}>
							<rect
								x={x}
								y={y}
								width={STATION_WIDTH}
								height={STATION_HEIGHT}
								rx={6}
								fill="rgb(30 41 59)"
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
							{config.redBins &&
								(() => {
									const defectCount =
										state.stationStates.get(stationId)?.defectCount ?? 0;
									return (
										<g aria-label={`Red bin: ${defectCount} defects`}>
											<rect
												x={x + STATION_WIDTH - 36}
												y={y + STATION_HEIGHT - 28}
												width={28}
												height={24}
												rx={2}
												fill="#ef4444"
												stroke="#b91c1c"
												strokeWidth={1}
											/>
											<text
												x={x + STATION_WIDTH - 22}
												y={y + STATION_HEIGHT - 12}
												textAnchor="middle"
												fill="white"
												fontSize={8}
											>
												{defectCount > 0 ? `bin (${defectCount})` : "bin"}
											</text>
										</g>
									);
								})()}
						</g>
					);
				})}
				{Array.from(allItemIds).map((itemId) => {
					const item = state.items.get(itemId);
					const pos = positions.get(itemId);
					if (!item || !pos) return null;
					const inBatchBuffer = stationOrder.some((sid) =>
						state.stationStates.get(sid)?.batchBuffer.includes(itemId),
					);
					const fill = itemColor(item, inBatchBuffer);
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
			{(enabled.cycleTime ||
				enabled.cycleVariance ||
				enabled.batchSize ||
				enabled.wipLimit) && (
				<div
					className="flex justify-between w-full gap-0 mt-3"
					style={{ minWidth: width }}
				>
					{config.stations.map((station, i) => (
						<div
							key={station.id}
							className="flex flex-col gap-2 px-1 flex-shrink-0"
							style={{ width: STATION_WIDTH }}
						>
							{enabled.batchSize && (
								<label className="flex flex-col gap-0.5 text-xs">
									<span className="text-slate-400">Batch</span>
									<input
										type="range"
										min={1}
										max={10}
										value={station.batchSize ?? config.batchSize}
										onChange={(e) => {
											const next = config.stations.map((s, j) =>
												j === i
													? { ...s, batchSize: Number(e.target.value) }
													: s,
											);
											store.updateConfig({ stations: next });
										}}
										className="w-full accent-cyan-500"
									/>
									<span className="text-slate-500 tabular-nums">
										{station.batchSize ?? config.batchSize}
									</span>
								</label>
							)}
							{enabled.wipLimit && (
								<label className="flex flex-col gap-0.5 text-xs">
									<span className="text-slate-400">WIP limit</span>
									<input
										type="range"
										min={1}
										max={30}
										value={station.wipLimit ?? 10}
										onChange={(e) => {
											const next = config.stations.map((s, j) =>
												j === i
													? { ...s, wipLimit: Number(e.target.value) }
													: s,
											);
											store.updateConfig({ stations: next });
										}}
										className="w-full accent-cyan-500"
									/>
									<span className="text-slate-500 tabular-nums">
										{station.wipLimit ?? 10}
									</span>
								</label>
							)}
							{enabled.cycleTime && (
								<label className="flex flex-col gap-0.5 text-xs">
									<span className="text-slate-400">Cycle (ms)</span>
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
										className="w-full accent-cyan-500"
									/>
									<span className="text-slate-500 tabular-nums">
										{station.cycleTime}
									</span>
								</label>
							)}
							{enabled.cycleVariance && (
								<label className="flex flex-col gap-0.5 text-xs">
									<span className="text-slate-400">Variance</span>
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
										className="w-full accent-cyan-500"
									/>
									<span className="text-slate-500 tabular-nums">
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
