import { Play, Pause, RotateCcw } from "lucide-react"
import { useSimStore, useSimSnapshot } from "../SimProvider"
import { STEP_PRESETS } from "../presets"

export function ControlPanel() {
	const store = useSimStore()
	const state = useSimSnapshot((s) => s.state)
	const config = useSimSnapshot((s) => s.config)
	const enabled = STEP_PRESETS[config.stepId].enabledControls

	return (
		<div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-3">
			<h3 className="text-sm font-semibold text-slate-200">Controls</h3>
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => store.start()}
						disabled={state.isRunning}
						className="flex items-center gap-2 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-medium"
					>
						<Play size={16} />
						Start
					</button>
					<button
						type="button"
						onClick={() => store.pause()}
						disabled={!state.isRunning}
						className="flex items-center gap-2 px-3 py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-medium"
					>
						<Pause size={16} />
						Pause
					</button>
					<button
						type="button"
						onClick={() => store.reset()}
						className="flex items-center gap-2 px-3 py-2 rounded bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium"
					>
						<RotateCcw size={16} />
						Reset
					</button>
				</div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{enabled.batchSize && (
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-slate-300">Batch size (1–10)</span>
						<input
							type="range"
							min={1}
							max={10}
							value={config.batchSize}
							onChange={(e) =>
								store.updateConfig({ batchSize: Number(e.target.value) })
							}
							className="w-full accent-cyan-500"
						/>
						<span className="text-slate-400">{config.batchSize}</span>
					</label>
				)}
				{enabled.pushPull && (
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-slate-300">Flow</span>
						<select
							value={config.pushOrPull}
							onChange={(e) =>
								store.updateConfig({
									pushOrPull: e.target.value as "push" | "pull",
								})
							}
							className="w-full rounded bg-slate-700 border border-slate-600 text-slate-200 px-2 py-1.5"
						>
							<option value="push">Push</option>
							<option value="pull">Pull</option>
						</select>
					</label>
				)}
				{enabled.wipLimit && (
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-slate-300">WIP limit (1–30)</span>
						<input
							type="range"
							min={1}
							max={30}
							value={config.wipLimit}
							onChange={(e) =>
								store.updateConfig({ wipLimit: Number(e.target.value) })
							}
							className="w-full accent-cyan-500"
						/>
						<span className="text-slate-400">{config.wipLimit}</span>
					</label>
				)}
				{enabled.defectProbability && (
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-slate-300">Defect probability (0–50%)</span>
						<input
							type="range"
							min={0}
							max={50}
							value={Math.round(config.defectProbability * 100)}
							onChange={(e) =>
								store.updateConfig({
									defectProbability: Number(e.target.value) / 100,
								})
							}
							className="w-full accent-cyan-500"
						/>
						<span className="text-slate-400">
							{Math.round(config.defectProbability * 100)}%
						</span>
					</label>
				)}
				{enabled.trainingEffectiveness && (
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-slate-300">Training effectiveness (0–100%)</span>
						<input
							type="range"
							min={0}
							max={100}
							value={Math.round(config.trainingEffectiveness * 100)}
							onChange={(e) =>
								store.updateConfig({
									trainingEffectiveness: Number(e.target.value) / 100,
								})
							}
							className="w-full accent-cyan-500"
						/>
						<span className="text-slate-400">
							{Math.round(config.trainingEffectiveness * 100)}%
						</span>
					</label>
				)}
				{enabled.tickSpeed && (
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-slate-300">Tick speed (ms)</span>
						<input
							type="range"
							min={100}
							max={500}
							step={50}
							value={config.tickMs}
							onChange={(e) =>
								store.updateConfig({ tickMs: Number(e.target.value) })
							}
							className="w-full accent-cyan-500"
						/>
						<span className="text-slate-400">{config.tickMs} ms</span>
					</label>
				)}
			</div>
		</div>
	)
}
