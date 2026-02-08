import { Pause, Play, RotateCcw } from "lucide-react";
import { STEP_PRESETS } from "../presets";
import { useSimSnapshot, useSimStore } from "../SimProvider";

const MARKET_CHANGE_FLASH_TICKS = 3;

export function ControlPanel() {
	const store = useSimStore();
	const state = useSimSnapshot((s) => s.state);
	const config = useSimSnapshot((s) => s.config);
	const enabled = (STEP_PRESETS[config.stepId] ?? STEP_PRESETS.intro)
		.enabledControls;
	const marketChangeFlashing =
		state.lastMarketChangeTick != null &&
		state.tick - state.lastMarketChangeTick < MARKET_CHANGE_FLASH_TICKS;

	function handleMarketChange() {
		store.triggerMarketChange();
	}

	return (
		<div className="p-3 bg-factory-panel rounded-sm border-2 border-factory-border space-y-3">
			<h3 className="text-base font-semibold text-text pixel-font text-sm">
				Controls
			</h3>
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex gap-2">
					{state.isRunning ? (
						<button
							type="button"
							onClick={() => store.pause()}
							className="flex items-center gap-2 px-3 py-2 rounded-sm border-2 border-rust-light bg-rust hover:bg-rust-light text-text text-base font-medium"
						>
							<Pause size={16} />
							Pause
						</button>
					) : (
						<button
							type="button"
							onClick={() => store.start()}
							className="flex items-center gap-2 px-3 py-2 rounded-sm border-2 border-accent-dim bg-green hover:bg-green-light text-factory-bg text-base font-medium"
						>
							<Play size={16} />
							Start
						</button>
					)}
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="flex items-center gap-2 px-3 py-2 rounded-sm border-2 border-factory-border bg-factory-surface hover:bg-factory-muted text-text text-base font-medium"
					>
						<RotateCcw size={16} />
						Reset
					</button>
					<button
						type="button"
						onClick={handleMarketChange}
						className={`flex items-center gap-2 px-3 py-2 rounded-sm border-2 text-base font-medium transition-colors duration-150 ${
							marketChangeFlashing
								? "bg-danger border-rust text-text"
								: "border-accent-dim bg-[#00c853] hover:bg-[#008f3a] text-factory-bg text-base font-medium text-black"
						}`}
					>
						Market Change
					</button>
				</div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{enabled.layoutMode && (
					<label className="flex flex-col gap-1 text-base">
						<span className="text-text-muted">Layout</span>
						<select
							value={config.layoutMode}
							onChange={(e) =>
								store.updateConfig({
									layoutMode: e.target.value as "departments" | "flow",
								})
							}
							className="w-full rounded-sm border-2 border-factory-border bg-factory-surface text-text px-2 py-1.5"
						>
							<option value="departments">Departments</option>
							<option value="flow">Flow</option>
						</select>
					</label>
				)}
				{enabled.pushPull && (
					<label className="flex flex-col gap-1 text-base">
						<span className="text-text-muted">Flow (Push/Pull)</span>
						<select
							value={config.pushOrPull}
							onChange={(e) =>
								store.updateConfig({
									pushOrPull: e.target.value as "push" | "pull",
								})
							}
							className="w-full rounded-sm border-2 border-factory-border bg-factory-surface text-text px-2 py-1.5"
						>
							<option value="push">Push</option>
							<option value="pull">Pull</option>
						</select>
					</label>
				)}
				<label className="flex flex-col gap-1 text-base">
					<span className="text-text-muted">Speed (ticks/sec)</span>
					<input
						type="range"
						min={1}
						max={20}
						step={1}
						value={config.speed}
						onChange={(e) =>
							store.updateConfig({ speed: Number(e.target.value) })
						}
						className="w-full accent-rust"
					/>
					<span className="text-factory-muted">{config.speed} /s</span>
				</label>
			</div>
		</div>
	);
}
