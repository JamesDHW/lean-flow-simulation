import type { ReactNode } from "react";

export function MobileViewMessage({ children }: { children: ReactNode }) {
	return (
		<>
			<div className="flex min-h-screen flex-col items-center justify-center bg-factory-bg p-6 text-text md:hidden">
				<p className="text-center text-lg">Please view on a larger screen</p>
			</div>
			<div className="hidden md:block">{children}</div>
		</>
	);
}
