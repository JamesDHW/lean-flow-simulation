import { useSimSnapshot, useSimStore } from "../SimProvider";

function NumInput({
	label,
	value,
	onChange,
	min,
	max,
	step = 1,
}: {
	label: string;
	value: number;
	onChange: (n: number) => void;
	min?: number;
	max?: number;
	step?: number;
}) {
	return (
		<label className="flex flex-col gap-1 text-sm">
			<span className="text-text-muted">{label}</span>
			<input
				type="number"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="w-full rounded-sm border-2 border-factory-border bg-factory-surface text-text px-2 py-1"
			/>
		</label>
	);
}

function NullableNumInput({
	label,
	value,
	onChange,
	min,
	step = 1,
	placeholder = "Off",
}: {
	label: string;
	value: number | null;
	onChange: (n: number | null) => void;
	min?: number;
	step?: number;
	placeholder?: string;
}) {
	return (
		<label className="flex flex-col gap-1 text-sm">
			<span className="text-text-muted">{label}</span>
			<input
				type="number"
				min={min}
				step={step}
				value={value === null ? "" : value}
				onChange={(e) => {
					const v = e.target.value;
					onChange(v === "" ? null : Number(v));
				}}
				placeholder={placeholder}
				className="w-full rounded-sm border-2 border-factory-border bg-factory-surface text-text px-2 py-1"
			/>
		</label>
	);
}

export function GlobalConfigPanel() {
	const store = useSimStore();
	const config = useSimSnapshot((s) => s.config);

	return (
		<div className="p-4 rounded-sm border-2 border-factory-border bg-factory-panel/80">
			<h3 className="text-base font-semibold text-text pixel-font mb-3">
				Global config
			</h3>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
				<label className="flex flex-col gap-1 text-sm">
					<span className="text-text-muted">Push/Pull</span>
					<select
						value={config.pushOrPull}
						onChange={(e) =>
							store.updateConfig({
								pushOrPull: e.target.value as "push" | "pull",
							})
						}
						className="w-full rounded-sm border-2 border-factory-border bg-factory-surface text-text px-2 py-1"
					>
						<option value="push">Push</option>
						<option value="pull">Pull</option>
					</select>
				</label>
				<label className="flex flex-col gap-1 text-sm">
					<span className="text-text-muted">Layout</span>
					<select
						value={config.layoutMode}
						onChange={(e) =>
							store.updateConfig({
								layoutMode: e.target.value as "departments" | "flow",
							})
						}
						className="w-full rounded-sm border-2 border-factory-border bg-factory-surface text-text px-2 py-1"
					>
						<option value="departments">Departments</option>
						<option value="flow">Flow</option>
					</select>
				</label>
				<NumInput
					label="Revenue/item"
					value={config.revenuePerItem}
					onChange={(v) => store.updateConfig({ revenuePerItem: v })}
					min={0}
				/>
				<NumInput
					label="Labor cost/tick/emp"
					value={config.laborCostPerTickPerEmployee}
					onChange={(v) =>
						store.updateConfig({ laborCostPerTickPerEmployee: v })
					}
					min={0}
				/>
				<NumInput
					label="Inventory cost/item/tick"
					value={config.inventoryCostPerItemPerTick}
					onChange={(v) =>
						store.updateConfig({ inventoryCostPerItemPerTick: v })
					}
					min={0}
				/>
				<NumInput
					label="Material cost/item"
					value={config.materialCostPerItem}
					onChange={(v) => store.updateConfig({ materialCostPerItem: v })}
					min={0}
				/>
				<NumInput
					label="Defect cost (shipped)"
					value={config.defectCostCustomerShipped}
					onChange={(v) => store.updateConfig({ defectCostCustomerShipped: v })}
					min={0}
				/>
				<NullableNumInput
					label="Market change (ticks)"
					value={config.marketChangeIntervalTicks}
					onChange={(v) => store.updateConfig({ marketChangeIntervalTicks: v })}
					min={1}
					placeholder="Off"
				/>
				<NullableNumInput
					label="Market change rate"
					value={config.marketChangeAutoIntervalMs}
					onChange={(v) =>
						store.updateConfig({ marketChangeAutoIntervalMs: v })
					}
					min={1000}
					step={1000}
					placeholder="Off"
				/>
				<NumInput
					label="Initial investment"
					value={config.initialInvestment}
					onChange={(v) => store.updateConfig({ initialInvestment: v })}
					min={0}
				/>
				<NumInput
					label="Manager fixes defect prob"
					value={config.managerReworkProbability ?? 0.6}
					onChange={(v) => store.updateConfig({ managerReworkProbability: v })}
					min={0}
					max={1}
					step={0.01}
				/>
				<label className="flex flex-col gap-1 text-sm">
					<span className="text-text-muted">Jidoka line stop</span>
					<select
						value={config.jidokaLineStop === true ? "yes" : "no"}
						onChange={(e) =>
							store.updateConfig({
								jidokaLineStop: e.target.value === "yes",
							})
						}
						className="w-full rounded-sm border-2 border-factory-border bg-factory-surface text-text px-2 py-1"
					>
						<option value="no">No</option>
						<option value="yes">Yes</option>
					</select>
				</label>
			</div>
		</div>
	);
}
