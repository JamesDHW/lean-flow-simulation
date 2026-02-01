function nextU32(seed: number): [number, number] {
	let s = seed
	s = (s + 0x6d2b79f5) >>> 0
	let t = Math.imul(s ^ (s >>> 15), s | 1)
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
	const value = (t ^ (t >>> 14)) >>> 0
	return [value, s]
}

export function nextFloat(seed: number): [number, number] {
	const [value, newSeed] = nextU32(seed)
	return [value / 4294967296, newSeed]
}

export function nextInt(seed: number, min: number, max: number): [number, number] {
	const [u, newSeed] = nextFloat(seed)
	const n = Math.floor(u * (max - min + 1)) + min
	return [n, newSeed]
}

function boxMuller(u1: number, u2: number): number {
	return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function sampleNormalApprox(
	seed: number,
	mean: number,
	stdDev: number,
): [number, number] {
	let s = seed
	const [u1, s1] = nextFloat(s)
	s = s1
	const [u2, s2] = nextFloat(s)
	s = s2
	const z = boxMuller(u1, u2)
	return [mean + stdDev * z, s]
}

export function sampleCycleTime(
	seed: number,
	meanMs: number,
	variance: number,
): [number, number] {
	const stdDev = Math.sqrt(Math.max(0, variance))
	const [sampled, newSeed] = sampleNormalApprox(seed, meanMs, stdDev)
	const value = Math.max(meanMs * 0.1, sampled)
	return [value, newSeed]
}

export function chance(seed: number, probability: number): [boolean, number] {
	const [u, newSeed] = nextFloat(seed)
	return [u < probability, newSeed]
}
