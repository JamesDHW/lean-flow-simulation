import { describe, expect, it } from "vitest"
import { getInitialConfig } from "../presets"
import { createInitialState, tick } from "../tick"
import { getWip } from "../metrics"

describe("tick invariants", () => {
	const seed = 12345
	const config = getInitialConfig("step-1", seed)

	function runTicks(n: number) {
		let state = createInitialState(config)
		for (let i = 0; i < n; i++) {
			state = tick(state, config)
		}
		return state
	}

	it("WIP never exceeds wipLimit", () => {
		const state = runTicks(50)
		const wip = getWip(state)
		expect(wip).toBeLessThanOrEqual(config.wipLimit)
	})

	it("buffer capacities are never exceeded", () => {
		let state = createInitialState(config)
		for (let i = 0; i < 30; i++) {
			state = tick(state, config)
			for (const sc of config.stations) {
				const st = state.stationStates.get(sc.id)
				expect(st).toBeDefined()
				if (st) {
					expect(st.inputQueue.length).toBeLessThanOrEqual(sc.bufferBefore)
					expect(st.inProcess.length).toBeLessThanOrEqual(sc.capacity)
					expect(st.outputQueue.length).toBeLessThanOrEqual(sc.bufferAfter)
				}
			}
		}
	})

	it("each item appears in at most one queue", () => {
		const state = runTicks(20)
		const seen = new Set<string>()
		for (const st of state.stationStates.values()) {
			for (const id of st.inputQueue) {
				expect(seen.has(id)).toBe(false)
				seen.add(id)
			}
			for (const slot of st.inProcess) {
				expect(seen.has(slot.itemId)).toBe(false)
				seen.add(slot.itemId)
			}
			for (const id of st.outputQueue) {
				expect(seen.has(id)).toBe(false)
				seen.add(id)
			}
		}
	})

	it("deterministic runs with same seed produce same state", () => {
		const configA = getInitialConfig("step-1", 999)
		const configB = getInitialConfig("step-1", 999)
		let stateA = createInitialState(configA)
		let stateB = createInitialState(configB)
		for (let i = 0; i < 15; i++) {
			stateA = tick(stateA, configA)
			stateB = tick(stateB, configB)
		}
		expect(stateA.tick).toBe(stateB.tick)
		expect(stateA.completedIds.length).toBe(stateB.completedIds.length)
		expect(stateA.defectiveIds.length).toBe(stateB.defectiveIds.length)
		expect(getWip(stateA)).toBe(getWip(stateB))
	})

	it("different seeds produce different outcomes after many ticks", () => {
		const state1 = runTicks(40)
		const config2 = getInitialConfig("step-1", 54321)
		let state2 = createInitialState(config2)
		for (let i = 0; i < 40; i++) {
			state2 = tick(state2, config2)
		}
		const sameCompleted =
			state1.completedIds.length === state2.completedIds.length &&
			state1.completedIds.every((id, j) => id === state2.completedIds[j])
		const sameDefects =
			state1.defectiveIds.length === state2.defectiveIds.length &&
			state1.defectiveIds.every((id, j) => id === state2.defectiveIds[j])
		expect(sameCompleted && sameDefects).toBe(false)
	})
})
