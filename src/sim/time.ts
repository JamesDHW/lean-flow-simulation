export const HOURS_PER_MONTH = 730;
export const DISPLAY_TIME_SCALE = 100000;

export function displayHoursFromTicks(
	tick: number,
	simTicksPerSecond: number,
): number {
	return (tick / (simTicksPerSecond * 3600)) * DISPLAY_TIME_SCALE;
}

export function displayMonthsFromTicks(
	tick: number,
	simTicksPerSecond: number,
): number {
	return displayHoursFromTicks(tick, simTicksPerSecond) / HOURS_PER_MONTH;
}

export function getTickForDisplayMonths(
	months: number,
	simTicksPerSecond: number,
): number {
	return (
		(months * HOURS_PER_MONTH * (simTicksPerSecond * 3600)) /
		DISPLAY_TIME_SCALE
	);
}
