import type { ReactNode } from "react";

export interface StepCopyLayoutProps {
	title?: string;
	box1Title: string;
	box1Content: ReactNode;
	box2Title: string;
	box2Content: ReactNode;
}

export function StepCopyLayout({
	title,
	box1Title,
	box1Content,
	box2Title,
	box2Content,
}: StepCopyLayoutProps) {
	return (
		<div className="space-y-4">
			{title && (
				<h2 className="text-xl font-semibold text-text pixel-font">
					{title}
				</h2>
			)}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="box-blocky rounded-none border-4 border-sim-blue-border p-4 bg-sim-blue text-text">
					<h3 className="text-sm font-medium text-sim-blue-border pixel-font mb-3">
						{box1Title}
					</h3>
					<div className="text-white text-xl space-y-2 [&_strong]:font-semibold [&_em]:italic">
						{box1Content}
					</div>
				</div>
				<div className="box-blocky rounded-none border-4 border-sim-purple-border p-4 bg-sim-purple text-text">
					<h3 className="text-sm font-medium text-sim-purple-border pixel-font mb-3">
						{box2Title}
					</h3>
					<div className="text-white text-xl space-y-2 [&_strong]:font-semibold [&_em]:italic">
						{box2Content}
					</div>
				</div>
			</div>
		</div>
	);
}
